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

@Injectable()
export class ServiceRequestService {
  private readonly logger = new Logger(ServiceRequestService.name);

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

  /** Verificar disponibilidad de técnico para una fecha específica */
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

  /** Verificar disponibilidad detallada del técnico para mostrar al usuario */
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

  /** Marcar solicitudes expiradas */
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

  /** Técnicos: solicitudes pendientes filtradas por especialidad y disponibilidad */
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
  /** Todas las solicitudes pendientes (para admin) */
  async findPending(): Promise<ServiceRequest[]> {
    await this.markExpiredRequests();
    return this.srRepo.find({
      where: { status: ServiceRequestStatus.PENDING },
      relations: ['client', 'appliance', 'address'],
      order: { createdAt: 'DESC' }
    });
  }

  /** ⚡ Técnico acepta una solicitud - NOTIFICACIÓN INSTANTÁNEA */
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

  /** ⚡ Cliente marca como completada - NOTIFICACIÓN INSTANTÁNEA */
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

  /** ⚡ Cliente cancela solicitud - NOTIFICACIÓN INSTANTÁNEA */
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
    
    // ⚡ NOTIFICACIÓN INSTANTÁNEA DE CANCELACIÓN A TODOS LOS TÉCNICOS ELEGIBLES
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

  /** ⚡ Técnico propone fecha alternativa - NOTIFICACIÓN INSTANTÁNEA */
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

  /** ⚡ Cliente acepta propuesta de fecha alternativa - NOTIFICACIONES INSTANTÁNEAS */
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

  /** ⚡ Cliente rechaza propuesta de fecha alternativa - NOTIFICACIÓN INSTANTÁNEA */
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

  /** ⚡ Cliente acepta propuesta de fecha alternativa por ID de propuesta - NOTIFICACIONES INSTANTÁNEAS */
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

  /** ⚡ Cliente rechaza propuesta de fecha alternativa por ID de propuesta - NOTIFICACIÓN INSTANTÁNEA */
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

  // Métodos auxiliares de consulta
  async findById(id: number): Promise<ServiceRequest | null> {
    return this.srRepo.findOne({
      where: { id },
      relations: ['client', 'appliance', 'address', 'technician']
    });
  }

  async findByClient(clientId: number): Promise<ServiceRequest[]> {
    return this.srRepo.find({ 
      where: { clientId },
      relations: ['client', 'appliance', 'address', 'technician'],
      order: { createdAt: 'DESC' }
    });
  }

  async findByTechnician(technicianId: number): Promise<ServiceRequest[]> {
    return this.srRepo.find({ 
      where: { technicianId },
      relations: ['client', 'appliance', 'address', 'technician'],
      order: { scheduledAt: 'ASC' }
    });
  }

  /** Obtener calendario de un técnico (sus servicios programados) */
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

  /** Obtener calendario de un cliente (sus servicios programados) */
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


  /** Obtener solicitudes del cliente con propuestas */
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

  /** Obtener propuestas de fechas alternativas para una solicitud */
  async getAlternativeDateProposals(serviceRequestId: number): Promise<AlternativeDateProposal[]> {
    return this.proposalRepo.find({
      where: { serviceRequestId },
      relations: ['technician'],
      order: { createdAt: 'ASC' }
    });
  }

  /** Obtener propuestas de fechas alternativas de un técnico */
  async getTechnicianAlternativeDateProposals(technicianId: number): Promise<AlternativeDateProposal[]> {
    return this.proposalRepo.find({
      where: { technicianId },
      relations: ['serviceRequest', 'serviceRequest.client', 'serviceRequest.appliance'],
      order: { createdAt: 'DESC' }
    });
  }

  // ⚡ Método optimizado para notificar rechazos en paralelo
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