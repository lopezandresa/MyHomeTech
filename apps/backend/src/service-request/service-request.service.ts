import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, Between, In, Not } from 'typeorm';
import { ServiceRequest, ServiceRequestStatus, ServiceType } from './service-request.entity';
import { AlternativeDateProposal, AlternativeDateProposalStatus } from './alternative-date-proposal.entity';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import { Address } from '../address/address.entity';
import { Technician } from '../technician/technician.entity';
import { Appliance } from '../appliance/appliance.entity';
import { ServiceRequestGateway } from './service-request.gateway';

/**
 * Servicio principal para la gestión de solicitudes de servicio técnico
 * 
 * @description Maneja todo el ciclo de vida de las solicitudes de servicio:
 * - Creación y validación de solicitudes
 * - Notificación a técnicos elegibles
 * - Gestión de fechas alternativas
 * - Control de disponibilidad
 * - Estados de solicitudes (pendiente, aceptada, completada, etc.)
 * - Notificaciones en tiempo real vía WebSocket
 * 
 * @class ServiceRequestService
 */
@Injectable()
export class ServiceRequestService {
  private readonly logger = new Logger(ServiceRequestService.name);

  /**
   * Constructor del servicio de solicitudes de servicio
   * 
   * @param {Repository<ServiceRequest>} srRepo - Repositorio de solicitudes de servicio
   * @param {Repository<AlternativeDateProposal>} proposalRepo - Repositorio de propuestas de fechas alternativas
   * @param {Repository<Address>} addressRepo - Repositorio de direcciones
   * @param {Repository<Technician>} technicianRepo - Repositorio de técnicos
   * @param {Repository<Appliance>} applianceRepo - Repositorio de electrodomésticos
   * @param {ServiceRequestGateway} gateway - Gateway para notificaciones WebSocket
   */
  constructor(
    @InjectRepository(ServiceRequest)
    private readonly srRepo: Repository<ServiceRequest>,    
    @InjectRepository(AlternativeDateProposal)
    private readonly proposalRepo: Repository<AlternativeDateProposal>,
    @InjectRepository(Address)
    private readonly addressRepo: Repository<Address>,
    @InjectRepository(Technician)
    private readonly technicianRepo: Repository<Technician>,
    @InjectRepository(Appliance)
    private readonly applianceRepo: Repository<Appliance>,
    private readonly gateway: ServiceRequestGateway,
  ) {}

  /**
   * Crea una nueva solicitud de servicio técnico
   * 
   * @param {number} clientId - ID del cliente que solicita el servicio
   * @param {CreateServiceRequestDto} dto - Datos de la solicitud
   * @returns {Promise<ServiceRequest>} Solicitud creada
   * @throws {BadRequestException} Si la dirección no pertenece al cliente, horario inválido o fecha pasada
   * 
   * @example
   * ```typescript
   * const request = await serviceRequestService.create(1, {
   *   applianceId: 5,
   *   addressId: 2,
   *   description: "Refrigerador no enfría",
   *   serviceType: "repair",
   *   proposedDateTime: "2024-12-20T10:00:00Z",
   *   validHours: 24
   * });
   * ```
   */
  async create(clientId: number, dto: CreateServiceRequestDto): Promise<ServiceRequest> {
    // Validar que la dirección pertenece al cliente
    const address = await this.addressRepo.findOne({
      where: { id: dto.addressId, userId: clientId }
    });
    
    if (!address) {
      throw new BadRequestException('La dirección seleccionada no es válida o no te pertenece');
    }

    // Validar horario de trabajo (6 AM - 6 PM)
    const proposedDate = new Date(dto.proposedDateTime);
    const hours = proposedDate.getHours();
    
    if (hours < 6 || hours >= 18) {
      throw new BadRequestException('El horario de servicio debe estar entre las 6:00 AM y 6:00 PM');
    }

    // Validar que la fecha sea futura
    if (proposedDate <= new Date()) {
      throw new BadRequestException('La fecha propuesta debe ser futura');
    }

    // Usar valor por defecto de 24 horas si no se especifica
    const validHours = dto.validHours || 24;
    
    // Calcular expiresAt
    const now = new Date();
    const expiresAt = new Date(now.getTime() + validHours * 60 * 60 * 1000);

    const req = this.srRepo.create({
      clientId,
      applianceId: dto.applianceId,
      addressId: dto.addressId,
      description: dto.description,
      serviceType: dto.serviceType || ServiceType.REPAIR,
      proposedDateTime: proposedDate,
      expiresAt,
      status: ServiceRequestStatus.PENDING,
    });

    const savedRequest = await this.srRepo.save(req);
    
    // Cargar la solicitud completa con relaciones para notificaciones INMEDIATAS
    const fullRequest = await this.srRepo.findOne({
      where: { id: savedRequest.id },
      relations: ['client', 'appliance', 'address']
    });

    // ⚡ NOTIFICACIÓN INSTANTÁNEA - Sin await para máxima velocidad
    if (fullRequest) {
      // Ejecutar notificación de forma asíncrona sin bloquear la respuesta
      setImmediate(() => {
        this.notifyEligibleTechnicians(fullRequest);
      });
    }

    return savedRequest;
  }

  // ⚡ Método optimizado para encontrar y notificar técnicos INSTANTÁNEAMENTE
  private async notifyEligibleTechnicians(serviceRequest: ServiceRequest): Promise<void> {
    try {
      const startTime = Date.now();
      
      // CORREGIDO: Buscar técnicos elegibles usando JOIN con Identity para verificar status
      const eligibleTechnicians = await this.technicianRepo
        .createQueryBuilder('tech')
        .innerJoin('tech.specialties', 'specialty')
        .innerJoin('identity', 'identity', 'identity.id = tech.identityId')
        .where('specialty.name = :applianceType', { 
          applianceType: serviceRequest.appliance.type 
        })
        .andWhere('identity.status = :status', { status: true })
        .getMany();

      const availableTechnicians: Technician[] = [];

      // Verificar disponibilidad en paralelo para máxima velocidad
      const availabilityChecks = eligibleTechnicians.map(async (tech) => {
        const hasConflict = await this.checkTechnicianAvailability(
          tech.identityId,
          serviceRequest.proposedDateTime
        );
        return { tech, hasConflict };
      });

      const results = await Promise.all(availabilityChecks);
      
      results.forEach(({ tech, hasConflict }) => {
        if (!hasConflict) {
          availableTechnicians.push(tech);
        }
      });

      const technicianIds = availableTechnicians.map(tech => tech.identityId);

      if (technicianIds.length > 0) {
        // ⚡ NOTIFICACIÓN ULTRA-RÁPIDA
        this.gateway.notifyNewServiceRequest(serviceRequest, technicianIds);
        
        const elapsedTime = Date.now() - startTime;
      } else {        
        // Debug: mostrar técnicos elegibles pero no disponibles
        if (eligibleTechnicians.length > 0) {
        }
      }
    } catch (error) {
      this.logger.error('Error in ultra-fast technician notification:', error);
    }
  }

  /**
   * Verifica si un técnico tiene disponibilidad en una fecha específica
   * 
   * @param {number} technicianId - ID del técnico
   * @param {Date} proposedDateTime - Fecha y hora propuesta
   * @returns {Promise<boolean>} true si hay conflicto, false si está disponible
   * 
   * @description Usa una ventana de 6 horas (3 antes y 3 después) para evitar solapamientos
   * 
   * @example
   * ```typescript
   * const hasConflict = await serviceRequestService.checkTechnicianAvailability(
   *   123, 
   *   new Date('2024-12-20T10:00:00Z')
   * );
   * if (!hasConflict) {
   *   // Técnico disponible
   * }
   * ```
   */
  async checkTechnicianAvailability(technicianId: number, proposedDateTime: Date): Promise<boolean> {
    const proposedDate = new Date(proposedDateTime);
    
    // Crear ventana de 6 horas alrededor del horario propuesto para evitar solapamientos
    const startWindow = new Date(proposedDate.getTime() - 3 * 60 * 60 * 1000); // 3 horas antes
    const endWindow = new Date(proposedDate.getTime() + 3 * 60 * 60 * 1000);   // 3 horas después

    // Buscar si el técnico ya tiene algo agendado en esa ventana de tiempo
    const conflictingRequest = await this.srRepo.findOne({
      where: {
        technicianId,
        status: ServiceRequestStatus.SCHEDULED,
        scheduledAt: Between(startWindow, endWindow)
      }
    });

    return !!conflictingRequest; // true si hay conflicto
  }

  /**
   * Verifica disponibilidad del técnico con información detallada para el usuario
   * 
   * @param {number} technicianId - ID del técnico
   * @param {Date} proposedDateTime - Fecha y hora propuesta
   * @returns {Promise<object>} Objeto con disponibilidad y detalles del conflicto
   * 
   * @example
   * ```typescript
   * const availability = await serviceRequestService.checkTechnicianAvailabilityDetailed(
   *   123, 
   *   new Date('2024-12-20T10:00:00Z')
   * );
   * // Retorna: { available: false, reason: "Ya tienes un servicio programado 2 hora(s) antes", conflictingService: {...} }
   * ```
   */
  async checkTechnicianAvailabilityDetailed(technicianId: number, proposedDateTime: Date): Promise<{
    available: boolean;
    reason?: string;
    conflictingService?: {
      id: number;
      scheduledAt: Date;
      appliance: string;
      clientName: string;
    }
  }> {
    const proposedDate = new Date(proposedDateTime);
    
    // Crear ventana de 6 horas alrededor del horario propuesto
    const startWindow = new Date(proposedDate.getTime() - 3 * 60 * 60 * 1000); // 3 horas antes
    const endWindow = new Date(proposedDate.getTime() + 3 * 60 * 60 * 1000);   // 3 horas después

    // Buscar servicios conflictivos con información detallada
    const conflictingRequest = await this.srRepo.findOne({
      where: {
        technicianId,
        status: ServiceRequestStatus.SCHEDULED,
        scheduledAt: Between(startWindow, endWindow)
      },
      relations: ['client', 'appliance']
    });

    if (conflictingRequest) {
      const scheduledTime = new Date(conflictingRequest.scheduledAt!);
      const proposedTime = new Date(proposedDateTime);
      
      const timeDiff = Math.abs(scheduledTime.getTime() - proposedTime.getTime());
      const hoursDiff = Math.round(timeDiff / (1000 * 60 * 60));
      
      return {
        available: false,
        reason: `Ya tienes un servicio programado ${hoursDiff === 0 ? 'a la misma hora' : `${hoursDiff} hora(s) ${scheduledTime < proposedTime ? 'antes' : 'después'}`}`,
        conflictingService: {
          id: conflictingRequest.id,
          scheduledAt: conflictingRequest.scheduledAt!,
          appliance: conflictingRequest.appliance.name,
          clientName: `${conflictingRequest.client.firstName} ${conflictingRequest.client.firstLastName}`
        }
      };
    }

    return { available: true };
  }

  /**
   * Marca solicitudes expiradas automáticamente
   * 
   * @returns {Promise<void>} Void cuando se complete la actualización
   * 
   * @description Ejecuta una consulta de actualización masiva para cambiar
   * el estado de solicitudes pendientes que han pasado su fecha de expiración
   */
  async markExpiredRequests(): Promise<void> {
    const now = new Date();
    await this.srRepo.update(
      {
        status: ServiceRequestStatus.PENDING,
        expiresAt: LessThan(now),
      },
      {
        status: ServiceRequestStatus.EXPIRED,
        expiredAt: now,
      }
    );
  }

  /**
   * Obtiene solicitudes pendientes filtradas por especialidad del técnico
   * 
   * @param {number} technicianId - ID del técnico
   * @returns {Promise<ServiceRequest[]>} Lista de solicitudes disponibles para el técnico
   * 
   * @description Filtra solicitudes por:
   * - Estado pendiente
   * - Especialidades del técnico
   * - Incluye propuestas de fechas alternativas del técnico
   * 
   * @example
   * ```typescript
   * const availableRequests = await serviceRequestService.findPendingForTechnician(123);
   * ```
   */
  async findPendingForTechnician(technicianId: number): Promise<ServiceRequest[]> {
    // Obtener el técnico con sus especialidades
    const technician = await this.technicianRepo.findOne({
      where: { identityId: technicianId },
      relations: ['specialties']
    });

    if (!technician || !technician.specialties) {
      return [];
    }

    // Extraer los nombres de especialidades del técnico
    const specialtyNames = technician.specialties.map(specialty => specialty.name);
    
    if (specialtyNames.length === 0) {
      return [];
    }    // Buscar solicitudes pendientes que coincidan con las especialidades del técnico
    const requests = await this.srRepo
      .createQueryBuilder('sr')
      .leftJoinAndSelect('sr.client', 'client')
      .leftJoinAndSelect('sr.appliance', 'appliance')
      .leftJoinAndSelect('sr.address', 'address')
      .leftJoinAndSelect('sr.alternativeDateProposals', 'proposals')
      .leftJoinAndSelect('proposals.technician', 'proposalTechnician')
      .where('sr.status = :status', { status: ServiceRequestStatus.PENDING })
      .andWhere('appliance.type IN (:...specialtyNames)', { specialtyNames })
      .orderBy('sr.createdAt', 'DESC')
      .getMany();    // Filtrar las propuestas para mostrar solo las del técnico actual
    const result = requests.map(request => ({
      ...request,
      alternativeDateProposals: request.alternativeDateProposals?.filter(
        proposal => proposal.technicianId === technicianId  // Usar technicianId (identityId) directamente
      ) || []
    }));

    return result;
  }
  /**
   * Obtiene todas las solicitudes pendientes (para administradores)
   * 
   * @returns {Promise<ServiceRequest[]>} Lista de todas las solicitudes pendientes
   * 
   * @description Actualiza solicitudes expiradas antes de retornar la lista
   */
  async findPending(): Promise<ServiceRequest[]> {
    await this.markExpiredRequests();
    return this.srRepo.find({
      where: { status: ServiceRequestStatus.PENDING },
      relations: ['client', 'appliance', 'address'],
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * Obtiene TODAS las solicitudes de servicio (para administradores)
   * 
   * @returns {Promise<ServiceRequest[]>} Lista completa de solicitudes en todos los estados
   * 
   * @description Incluye solicitudes pendientes, programadas, completadas y canceladas.
   * Usado para generar estadísticas administrativas.
   */
  async findAll(): Promise<ServiceRequest[]> {
    await this.markExpiredRequests();
    return this.srRepo.find({
      relations: ['client', 'appliance', 'address', 'technician', 'cancelledByUser'],
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * Técnico acepta una solicitud de servicio
   * 
   * @param {number} id - ID de la solicitud
   * @param {number} technicianId - ID del técnico que acepta
   * @returns {Promise<ServiceRequest>} Solicitud actualizada con técnico asignado
   * @throws {NotFoundException} Si la solicitud no existe o no está disponible
   * @throws {ConflictException} Si el técnico no está disponible en esa fecha
   * 
   * @description Proceso de aceptación:
   * - Verifica disponibilidad del técnico
   * - Programa la solicitud automáticamente
   * - Notifica al cliente instantáneamente
   * - Notifica a otros técnicos que ya no está disponible
   * 
   * @example
   * ```typescript
   * const acceptedRequest = await serviceRequestService.acceptByTechnician(456, 123);
   * ```
   */
  async acceptByTechnician(id: number, technicianId: number): Promise<ServiceRequest> {
    const req = await this.srRepo.findOne({
      where: { id, status: ServiceRequestStatus.PENDING },
      relations: ['client', 'appliance', 'address']
    });
    
    if (!req) {
      throw new NotFoundException('Solicitud no disponible para aceptar');
    }

    // Verificar disponibilidad del técnico con información detallada
    const availabilityCheck = await this.checkTechnicianAvailabilityDetailed(
      technicianId, 
      req.proposedDateTime
    );

    if (!availabilityCheck.available) {
      let errorMessage = availabilityCheck.reason || 'Ya tienes un servicio agendado para ese horario';
      
      if (availabilityCheck.conflictingService) {
        const conflictTime = new Date(availabilityCheck.conflictingService.scheduledAt).toLocaleString('es-ES', {
          dateStyle: 'short',
          timeStyle: 'short'
        });
        errorMessage += `. Servicio conflictivo: ${availabilityCheck.conflictingService.appliance} para ${availabilityCheck.conflictingService.clientName} programado el ${conflictTime}`;
      }
      
      throw new ConflictException(errorMessage);
    }

    req.technicianId = technicianId;
    req.acceptedAt = new Date();
    req.scheduledAt = req.proposedDateTime;
    req.status = ServiceRequestStatus.SCHEDULED;

    const updatedRequest = await this.srRepo.save(req);
    
    // ⚡ NOTIFICACIONES INSTANTÁNEAS Y PARALELAS
    setImmediate(() => {
      // Notificar al cliente inmediatamente
      this.gateway.notifyClientRequestAccepted(updatedRequest);
      
      // Notificar a otros técnicos que la solicitud ya no está disponible
      this.notifyRequestNoLongerAvailable(id);
    });
    
    return updatedRequest;
  }

  /**
   * Cliente marca una solicitud como completada
   * 
   * @param {number} id - ID de la solicitud
   * @param {number} clientId - ID del cliente
   * @returns {Promise<ServiceRequest>} Solicitud marcada como completada
   * @throws {NotFoundException} Si la solicitud no existe o no está programada
   * 
   * @description Notifica instantáneamente al técnico sobre la finalización
   * 
   * @example
   * ```typescript
   * const completedRequest = await serviceRequestService.completeByClient(456, 789);
   * ```
   */
  async completeByClient(id: number, clientId: number): Promise<ServiceRequest> {
    const req = await this.srRepo.findOne({
      where: { 
        id, 
        clientId, 
        status: ServiceRequestStatus.SCHEDULED 
      },
      relations: ['client', 'appliance', 'address', 'technician']
    });
    
    if (!req) {
      throw new NotFoundException('Solicitud no encontrada o no está programada');
    }

    req.status = ServiceRequestStatus.COMPLETED;
    req.completedAt = new Date();

    const updatedRequest = await this.srRepo.save(req);
    
    // ⚡ NOTIFICACIÓN INSTANTÁNEA AL TÉCNICO
    if (req.technicianId) {
      setImmediate(() => {
        this.gateway.notifyServiceCompleted(updatedRequest, req.technicianId!);
      });
    }
    
    return updatedRequest;
  }

  /**
   * Cliente cancela una solicitud pendiente
   * 
   * @param {number} serviceRequestId - ID de la solicitud
   * @param {number} clientId - ID del cliente
   * @returns {Promise<ServiceRequest>} Solicitud cancelada
   * @throws {NotFoundException} Si la solicitud no existe o no se puede cancelar
   * 
   * @description Solo actualiza el estado sin notificar a técnicos (las cancelaciones de clientes no son relevantes para técnicos)
   * 
   * @example
   * ```typescript
   * const cancelledRequest = await serviceRequestService.cancelByClient(456, 789);
   * ```
   */
  async cancelByClient(serviceRequestId: number, clientId: number): Promise<ServiceRequest> {
    const req = await this.srRepo.findOne({
      where: { 
        id: serviceRequestId, 
        clientId,
        status: ServiceRequestStatus.PENDING 
      },
      relations: ['client', 'appliance', 'address']
    });

    if (!req) {
      throw new NotFoundException('Solicitud no encontrada o no se puede cancelar');
    }

    req.status = ServiceRequestStatus.CANCELLED;
    req.cancelledAt = new Date();
    
    const updatedRequest = await this.srRepo.save(req);
    
    // ⚡ NOTIFICAR A TÉCNICOS - Las cancelaciones SÍ son relevantes para refrescar listas
    setImmediate(() => {
      this.notifyRequestNoLongerAvailable(serviceRequestId);
    });
    
    return updatedRequest;
  }

  // ⚡ Método optimizado para notificar que una solicitud ya no está disponible
  private async notifyRequestNoLongerAvailable(serviceRequestId: number): Promise<void> {
    try {
      this.logger.log(`🚨 STARTING notifyRequestNoLongerAvailable for request ${serviceRequestId}`);
      
      // CORREGIDO: Buscar técnicos que tenían acceso a esta solicitud
      const serviceRequest = await this.srRepo.findOne({
        where: { id: serviceRequestId },
        relations: ['appliance']
      });

      if (!serviceRequest) {
        this.logger.warn(`❌ Service request ${serviceRequestId} not found for notification`);
        return;
      }

      this.logger.log(`📋 Found service request ${serviceRequestId} for appliance type: ${serviceRequest.appliance.type}`);

      // Buscar técnicos elegibles para esta solicitud (misma lógica que en creación)
      const eligibleTechnicians = await this.technicianRepo
        .createQueryBuilder('tech')
        .innerJoin('tech.specialties', 'specialty')
        .innerJoin('identity', 'identity', 'identity.id = tech.identityId')
        .where('specialty.name = :applianceType', { 
          applianceType: serviceRequest.appliance.type 
        })
        .andWhere('identity.status = :status', { status: true })
        .getMany();

      this.logger.log(`👨‍🔧 Found ${eligibleTechnicians.length} eligible technicians`);

      const technicianIds = eligibleTechnicians.map(tech => tech.identityId);

      this.logger.log(`📤 Technician IDs to notify: [${technicianIds.join(', ')}]`);

      if (technicianIds.length > 0) {
        // Notificar a TODOS los técnicos elegibles que la solicitud ya no está disponible
        this.gateway.notifyServiceRequestRemoved(serviceRequestId, technicianIds);
        
        this.logger.log(`✅ Successfully called gateway.notifyServiceRequestRemoved for ${technicianIds.length} technicians`);
      } else {
        this.logger.warn(`⚠️ No eligible technicians found for request ${serviceRequestId}`);
      }
    } catch (error) {
      this.logger.error(`❌ Error in notifyRequestNoLongerAvailable for request ${serviceRequestId}:`, error);
    }
  }

  /**
   * Técnico propone una fecha alternativa para una solicitud
   * 
   * @param {number} serviceRequestId - ID de la solicitud
   * @param {number} technicianId - ID del técnico que propone
   * @param {string} alternativeDateTime - Nueva fecha propuesta (ISO string)
   * @param {string} [comment] - Comentario opcional
   * @returns {Promise<AlternativeDateProposal>} Propuesta creada
   * @throws {NotFoundException} Si la solicitud no existe
   * @throws {BadRequestException} Si la fecha es inválida o el técnico alcanzó el límite
   * @throws {ConflictException} Si el técnico no está disponible
   * 
   * @description Validaciones:
   * - Horario de trabajo (6 AM - 6 PM)
   * - Fecha futura
   * - Disponibilidad del técnico
   * - Límite de 3 propuestas por técnico
   * - Fechas únicas (al menos 1 hora de diferencia)
   * 
   * @example
   * ```typescript
   * const proposal = await serviceRequestService.proposeAlternativeDate(
   *   456, 123, "2024-12-21T14:00:00Z", "Mejor horario para mí"
   * );
   * ```
   */
  async proposeAlternativeDate(serviceRequestId: number, technicianId: number, alternativeDateTime: string, comment?: string): Promise<AlternativeDateProposal> {
    // Verificar que la solicitud existe y está en estado correcto
    const serviceRequest = await this.srRepo.findOne({
      where: { id: serviceRequestId, status: ServiceRequestStatus.PENDING },
      relations: ['client', 'appliance', 'address']
    });

    if (!serviceRequest) {
      throw new NotFoundException('Solicitud no encontrada o no está pendiente');
    }

    // Verificar que no haya expirado
    if (serviceRequest.expiresAt && serviceRequest.expiresAt < new Date()) {
      throw new BadRequestException('Esta solicitud ha expirado');
    }

    const alternativeDate = new Date(alternativeDateTime);

    // Validar horario de trabajo (6 AM - 6 PM)
    const hours = alternativeDate.getHours();
    if (hours < 6 || hours >= 18) {
      throw new BadRequestException('La fecha alternativa debe estar dentro del horario de trabajo (6:00 AM - 6:00 PM)');
    }

    // Validar que la fecha alternativa no sea en el pasado
    if (alternativeDate <= new Date()) {
      throw new BadRequestException('La fecha alternativa debe ser en el futuro');
    }    // Verificar disponibilidad del técnico para la fecha alternativa
    const hasConflict = await this.checkTechnicianAvailability(technicianId, alternativeDate);

    if (hasConflict) {
      throw new ConflictException('No estás disponible en la fecha alternativa propuesta');
    }

    // Contar propuestas existentes del técnico para esta solicitud
    const existingProposalsCount = await this.proposalRepo.count({
      where: {
        serviceRequestId,
        technicianId,
        status: In([AlternativeDateProposalStatus.PENDING, AlternativeDateProposalStatus.REJECTED])
      }
    });

    // Verificar límite de 3 propuestas por técnico
    if (existingProposalsCount >= 3) {
      throw new BadRequestException('Has alcanzado el límite máximo de 3 propuestas de fecha alternativa para esta solicitud');
    }

    // Obtener propuestas existentes del técnico para verificar horarios únicos
    const existingProposals = await this.proposalRepo.find({
      where: {
        serviceRequestId,
        technicianId,
        status: In([AlternativeDateProposalStatus.PENDING, AlternativeDateProposalStatus.REJECTED])
      }
    });

    // Verificar que la nueva fecha no sea igual a ninguna propuesta existente
    const proposedTime = alternativeDate.getTime();
    for (const existingProposal of existingProposals) {
      const existingTime = existingProposal.proposedDateTime.getTime();
      
      // Verificar si es exactamente la misma fecha y hora
      if (proposedTime === existingTime) {
        throw new BadRequestException('Ya has propuesto esta fecha y hora para esta solicitud');
      }
      
      // Verificar si es en el mismo día y muy cerca en horario (menos de 60 minutos de diferencia)
      const timeDifference = Math.abs(proposedTime - existingTime);
      const minutesDifference = timeDifference / (1000 * 60);
      
      if (minutesDifference < 60) {
        const existingDateStr = existingProposal.proposedDateTime.toLocaleString('es-CO', {
          timeZone: 'America/Bogota',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        throw new BadRequestException(
          `Ya tienes una propuesta muy cercana en horario (${existingDateStr}). Las propuestas deben tener al menos 1 hora de diferencia.`
        );
      }
    }

    // Crear la nueva propuesta de fecha alternativa
    const proposal = this.proposalRepo.create({
      serviceRequestId,
      technicianId,
      proposedDateTime: alternativeDate,
      comment,
      status: AlternativeDateProposalStatus.PENDING,
    });

    const savedProposal = await this.proposalRepo.save(proposal);

    // Cargar la propuesta con información del técnico para notificación
    const proposalWithTechnician = await this.proposalRepo.findOne({
      where: { id: savedProposal.id },
      relations: ['technician']
    });

    this.logger.log(`Técnico ${technicianId} propuso fecha alternativa ${alternativeDateTime} para solicitud ${serviceRequestId}`);
    
    // ⚡ NOTIFICACIÓN INSTANTÁNEA AL CLIENTE
    if (proposalWithTechnician) {
      setImmediate(() => {
        this.gateway.notifyClientAlternativeDateProposal(serviceRequest, proposalWithTechnician);
      });
    }
    
    return proposalWithTechnician!;
  }

  /**
   * Cliente acepta una propuesta de fecha alternativa
   * 
   * @param {number} serviceRequestId - ID de la solicitud
   * @param {number} proposalId - ID de la propuesta
   * @param {number} clientId - ID del cliente
   * @returns {Promise<ServiceRequest>} Solicitud programada con nueva fecha
   * @throws {NotFoundException} Si la solicitud o propuesta no existe
   * @throws {ConflictException} Si el técnico ya no está disponible
   * 
   * @description Proceso:
   * - Programa la solicitud con la nueva fecha
   * - Marca la propuesta como aceptada
   * - Notifica al técnico sobre la aceptación
   * - Rechaza automáticamente otras propuestas
   * 
   * @example
   * ```typescript
   * const scheduledRequest = await serviceRequestService.acceptAlternativeDate(456, 789, 123);
   * ```
   */
  async acceptAlternativeDate(serviceRequestId: number, proposalId: number, clientId: number): Promise<ServiceRequest> {
    // Verificar que la solicitud pertenece al cliente
    const serviceRequest = await this.srRepo.findOne({
      where: { id: serviceRequestId, clientId, status: ServiceRequestStatus.PENDING },
      relations: ['client', 'appliance', 'address']
    });

    if (!serviceRequest) {
      throw new NotFoundException('Solicitud no encontrada o no pertenece al cliente');
    }

    const proposal = await this.proposalRepo.findOne({
      where: { 
        id: proposalId, 
        serviceRequestId,
        status: AlternativeDateProposalStatus.PENDING 
      },
      relations: ['technician']
    });

    if (!proposal) {
      throw new NotFoundException('Propuesta de fecha alternativa no encontrada o ya fue procesada');
    }

    // Verificar disponibilidad del técnico una vez más
    const hasConflict = await this.checkTechnicianAvailability(
      proposal.technicianId,
      proposal.proposedDateTime
    );

    if (hasConflict) {
      throw new ConflictException('El técnico ya no está disponible para esa fecha');
    }

    // Actualizar la solicitud con la nueva fecha y técnico
    serviceRequest.proposedDateTime = proposal.proposedDateTime;
    serviceRequest.technicianId = proposal.technicianId;
    serviceRequest.acceptedAt = new Date();
    serviceRequest.scheduledAt = proposal.proposedDateTime;
    serviceRequest.status = ServiceRequestStatus.SCHEDULED;

    // Marcar la propuesta como aceptada
    proposal.status = AlternativeDateProposalStatus.ACCEPTED;
    proposal.resolvedAt = new Date();

    // Guardar cambios en paralelo
    const [updatedRequest] = await Promise.all([
      this.srRepo.save(serviceRequest),
      this.proposalRepo.save(proposal)
    ]);

    // ⚡ NOTIFICACIONES INSTANTÁNEAS Y PARALELAS
    setImmediate(() => {
      // Notificar al técnico que su propuesta fue aceptada
      this.gateway.notifyTechnicianProposalAccepted(updatedRequest, proposal);
      
      // Notificar a otros técnicos que la solicitud ya no está disponible
      this.notifyRejectedProposalsAndOffers(serviceRequestId, proposalId);
    });

    return updatedRequest;
  }

  /**
   * Cliente rechaza una propuesta de fecha alternativa
   * 
   * @param {number} serviceRequestId - ID de la solicitud
   * @param {number} proposalId - ID de la propuesta
   * @param {number} clientId - ID del cliente
   * @returns {Promise<AlternativeDateProposal>} Propuesta marcada como rechazada
   * @throws {NotFoundException} Si la solicitud o propuesta no existe
   * 
   * @description Notifica instantáneamente al técnico sobre el rechazo
   */
  async rejectAlternativeDate(serviceRequestId: number, proposalId: number, clientId: number): Promise<AlternativeDateProposal> {
    // Verificar que la solicitud pertenece al cliente
    const serviceRequest = await this.srRepo.findOne({
      where: { id: serviceRequestId, clientId, status: ServiceRequestStatus.PENDING },
      relations: ['client', 'appliance', 'address']
    });

    if (!serviceRequest) {
      throw new NotFoundException('Solicitud no encontrada o no pertenece al cliente');
    }

    const proposal = await this.proposalRepo.findOne({
      where: { 
        id: proposalId, 
        serviceRequestId,
        status: AlternativeDateProposalStatus.PENDING 
      },
      relations: ['technician']
    });

    if (!proposal) {
      throw new NotFoundException('Propuesta de fecha alternativa no encontrada o ya fue procesada');
    }

    // Marcar la propuesta como rechazada
    proposal.status = AlternativeDateProposalStatus.REJECTED;
    proposal.resolvedAt = new Date();

    const updatedProposal = await this.proposalRepo.save(proposal);

    this.logger.log(`Cliente ${clientId} rechazó propuesta de fecha alternativa ${proposal.id} para solicitud ${serviceRequestId}`);

    // ⚡ NOTIFICACIÓN INSTANTÁNEA AL TÉCNICO
    setImmediate(() => {
      this.gateway.notifyTechnicianProposalRejected(serviceRequest, updatedProposal);
    });

    return updatedProposal;
  }

  /**
   * Cliente acepta propuesta de fecha alternativa por ID de propuesta
   * 
   * @param {number} proposalId - ID de la propuesta
   * @param {number} clientId - ID del cliente
   * @returns {Promise<ServiceRequest>} Solicitud programada
   * @throws {NotFoundException} Si la propuesta no existe o no pertenece al cliente
   * 
   * @description Método de conveniencia que busca la propuesta y delega
   * al método acceptAlternativeDate principal
   */
  async acceptAlternativeDateByProposalId(proposalId: number, clientId: number): Promise<ServiceRequest> {
    // Buscar la propuesta con la solicitud asociada
    const proposal = await this.proposalRepo.findOne({
      where: { 
        id: proposalId,
        status: AlternativeDateProposalStatus.PENDING 
      },
      relations: ['serviceRequest', 'technician']
    });

    if (!proposal) {
      throw new NotFoundException('Propuesta de fecha alternativa no encontrada o ya fue procesada');
    }

    // Verificar que la solicitud pertenece al cliente
    if (proposal.serviceRequest.clientId !== clientId) {
      throw new NotFoundException('Esta propuesta no pertenece a tu solicitud');
    }

    return this.acceptAlternativeDate(proposal.serviceRequestId, proposalId, clientId);
  }

  /**
   * Cliente rechaza propuesta de fecha alternativa por ID de propuesta
   * 
   * @param {number} proposalId - ID de la propuesta
   * @param {number} clientId - ID del cliente
   * @returns {Promise<AlternativeDateProposal>} Propuesta rechazada
   * @throws {NotFoundException} Si la propuesta no existe o no pertenece al cliente
   */
  async rejectAlternativeDateByProposalId(proposalId: number, clientId: number): Promise<AlternativeDateProposal> {
    // Buscar la propuesta con la solicitud asociada
    const proposal = await this.proposalRepo.findOne({
      where: { 
        id: proposalId,
        status: AlternativeDateProposalStatus.PENDING 
      },
      relations: ['serviceRequest']
    });

    if (!proposal) {
      throw new NotFoundException('Propuesta de fecha alternativa no encontrada o ya fue procesada');
    }

    // Verificar que la solicitud pertenece al cliente
    if (proposal.serviceRequest.clientId !== clientId) {
      throw new NotFoundException('Esta propuesta no pertenece a tu solicitud');
    }

    return this.rejectAlternativeDate(proposal.serviceRequestId, proposalId, clientId);
  }

  /**
   * Busca una solicitud por ID con todas sus relaciones
   * 
   * @param {number} id - ID de la solicitud
   * @returns {Promise<ServiceRequest | null>} Solicitud encontrada o null
   * 
   * @example
   * ```typescript
   * const request = await serviceRequestService.findById(456);
   * ```
   */
  async findById(id: number): Promise<ServiceRequest | null> {
    return this.srRepo.findOne({
      where: { id },
      relations: ['client', 'appliance', 'address', 'technician']
    });
  }

  /**
   * Obtiene todas las solicitudes de un cliente
   * 
   * @param {number} clientId - ID del cliente
   * @returns {Promise<ServiceRequest[]>} Lista de solicitudes del cliente
   * 
   * @description Ordenadas por fecha de creación (más recientes primero)
   */
  async findByClient(clientId: number): Promise<ServiceRequest[]> {
    return this.srRepo.find({ 
      where: { clientId },
      relations: ['client', 'appliance', 'address', 'technician', 'cancelledByUser'],
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * Obtiene todas las solicitudes asignadas a un técnico
   * 
   * @param {number} technicianId - ID del técnico
   * @returns {Promise<ServiceRequest[]>} Lista de solicitudes del técnico
   * 
   * @description Ordenadas por estado (programados primero) y fecha programada (próximas primero)
   */
  async findByTechnician(technicianId: number): Promise<ServiceRequest[]> {
    return this.srRepo
      .createQueryBuilder('sr')
      .leftJoinAndSelect('sr.client', 'client')
      .leftJoinAndSelect('sr.appliance', 'appliance')
      .leftJoinAndSelect('sr.address', 'address')
      .leftJoinAndSelect('sr.technician', 'technician')
      .leftJoinAndSelect('sr.cancelledByUser', 'cancelledByUser')
      .where('sr.technicianId = :technicianId', { technicianId })
      .addOrderBy(
        `CASE 
          WHEN sr.status = 'scheduled' THEN 1 
          WHEN sr.status = 'completed' THEN 2 
          WHEN sr.status = 'cancelled' THEN 3 
          ELSE 4 
        END`, 
        'ASC'
      )
      .addOrderBy('sr.scheduledAt', 'ASC')
      .getMany();
  }

  /**
   * Obtiene el calendario de servicios programados de un técnico
   * 
   * @param {number} technicianId - ID del técnico
   * @param {Date} [startDate] - Fecha de inicio del período
   * @param {Date} [endDate] - Fecha de fin del período
   * @returns {Promise<ServiceRequest[]>} Servicios programados en el período
   * 
   * @description Solo incluye servicios con estado SCHEDULED
   * 
   * @example
   * ```typescript
   * const calendar = await serviceRequestService.getTechnicianCalendar(
   *   123, 
   *   new Date('2024-12-01'), 
   *   new Date('2024-12-31')
   * );
   * ```
   */
  async getTechnicianCalendar(technicianId: number, startDate?: Date, endDate?: Date): Promise<ServiceRequest[]> {
    const query = this.srRepo.createQueryBuilder('serviceRequest')
      .leftJoinAndSelect('serviceRequest.client', 'client')
      .leftJoinAndSelect('serviceRequest.appliance', 'appliance')
      .leftJoinAndSelect('serviceRequest.address', 'address')
      .where('serviceRequest.technicianId = :technicianId', { technicianId })
      .andWhere('serviceRequest.status = :status', { status: ServiceRequestStatus.SCHEDULED });

    if (startDate && endDate) {
      query.andWhere('serviceRequest.scheduledAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate
      });
    }

    return query.orderBy('serviceRequest.scheduledAt', 'ASC').getMany();
  }

  /**
   * Obtiene el calendario de servicios de un cliente
   * 
   * @param {number} clientId - ID del cliente
   * @param {Date} [startDate] - Fecha de inicio del período
   * @param {Date} [endDate] - Fecha de fin del período
   * @returns {Promise<ServiceRequest[]>} Servicios del cliente en el período
   * 
   * @description Incluye servicios SCHEDULED y COMPLETED
   */
  async getClientCalendar(clientId: number, startDate?: Date, endDate?: Date): Promise<ServiceRequest[]> {
    const query = this.srRepo.createQueryBuilder('serviceRequest')
      .leftJoinAndSelect('serviceRequest.technician', 'technician')
      .leftJoinAndSelect('serviceRequest.appliance', 'appliance')
      .leftJoinAndSelect('serviceRequest.address', 'address')
      .where('serviceRequest.clientId = :clientId', { clientId })
      .andWhere('serviceRequest.status IN (:...statuses)', { 
        statuses: [ServiceRequestStatus.SCHEDULED, ServiceRequestStatus.COMPLETED] 
      });

    if (startDate && endDate) {
      query.andWhere('serviceRequest.scheduledAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate
      });
    }

    return query.orderBy('serviceRequest.scheduledAt', 'ASC').getMany();
  }

  /**
   * Obtiene solicitudes del cliente con todas sus propuestas de fechas alternativas
   * 
   * @param {number} clientId - ID del cliente
   * @returns {Promise<ServiceRequest[]>} Solicitudes con propuestas incluidas
   * 
   * @description Útil para mostrar al cliente todas sus solicitudes
   * con las propuestas recibidas de los técnicos
   */
  async getClientRequests(clientId: number): Promise<ServiceRequest[]> {
    const req = this.srRepo
    .createQueryBuilder('sr')
    .leftJoinAndSelect('sr.client', 'client')
    .leftJoinAndSelect('sr.appliance', 'appliance')
    .leftJoinAndSelect('sr.address', 'address')
    .leftJoinAndSelect('sr.technician', 'technician')
    .leftJoinAndSelect('sr.alternativeDateProposals', 'proposals')
    .leftJoinAndSelect('proposals.technician', 'proposalTechnician')
    .where('sr.clientId = :clientId', { clientId })
    .orderBy('sr.createdAt', 'DESC')
    .getMany();
    return req;
  }

  /**
   * Obtiene todas las propuestas de fechas alternativas para una solicitud
   * 
   * @param {number} serviceRequestId - ID de la solicitud
   * @returns {Promise<AlternativeDateProposal[]>} Lista de propuestas
   * 
   * @description Ordenadas por fecha de creación (más antiguas primero)
   */
  async getAlternativeDateProposals(serviceRequestId: number): Promise<AlternativeDateProposal[]> {
    return this.proposalRepo.find({
      where: { serviceRequestId },
      relations: ['technician'],
      order: { createdAt: 'ASC' }
    });
  }

  /**
   * Obtiene todas las propuestas de fechas alternativas de un técnico
   * 
   * @param {number} technicianId - ID del técnico
   * @returns {Promise<AlternativeDateProposal[]>} Lista de propuestas del técnico
   * 
   * @description Incluye información de la solicitud y cliente asociados
   */
  async getTechnicianAlternativeDateProposals(technicianId: number): Promise<AlternativeDateProposal[]> {
    return this.proposalRepo.find({
      where: { technicianId },
      relations: ['serviceRequest', 'serviceRequest.client', 'serviceRequest.appliance'],
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * Notifica en paralelo sobre propuestas y ofertas rechazadas
   * 
   * @private
   * @param {number} serviceRequestId - ID de la solicitud
   * @param {number} acceptedProposalId - ID de la propuesta aceptada
   * @returns {Promise<void>} Void cuando se completen las notificaciones
   * 
   * @description Optimizado para enviar notificaciones paralelas a múltiples técnicos
   */
  private async notifyRejectedProposalsAndOffers(serviceRequestId: number, acceptedProposalId: number): Promise<void> {
    try {
      // Obtener todas las propuestas rechazadas de forma asíncrona
      const rejectedProposals = await this.proposalRepo.find({
        where: { 
          serviceRequestId,
          status: AlternativeDateProposalStatus.REJECTED,
          id: Not(acceptedProposalId)
        },
        relations: ['technician']
      });

      // Notificar a técnicos en paralelo para máxima velocidad
      const notifications = rejectedProposals.map(proposal => {
        if (proposal.technician) {
          // CORREGIDO: usar id del Identity (que corresponde al technicianId en el contexto de notificaciones)
          return this.gateway.notifyTechnicianRequestUnavailable(proposal.technician.id, serviceRequestId);
        }
      });

      await Promise.all(notifications.filter(Boolean));
    } catch (error) {
      this.logger.error('Error in parallel rejection notifications:', error);
    }
  }
}