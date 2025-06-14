import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, Between, In, Not } from 'typeorm';
import { ServiceRequest, ServiceRequestStatus } from './service-request.entity';
import { ServiceRequestOffer, OfferStatus } from './service-request-offer.entity';
import { AlternativeDateProposal, AlternativeDateProposalStatus } from './alternative-date-proposal.entity';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import { ScheduleRequestDto } from './dto/schedule-request.dto';
import { OfferPriceDto } from './dto/offer-price.dto';
import { Address } from '../address/address.entity';
import { Technician } from '../technician/technician.entity';
import { Appliance } from '../appliance/appliance.entity';
import { ServiceRequestGateway } from './service-request.gateway';

@Injectable()
export class ServiceRequestService {
  private readonly logger = new Logger(ServiceRequestService.name);

  constructor(
    @InjectRepository(ServiceRequest)
    private readonly srRepo: Repository<ServiceRequest>,    @InjectRepository(ServiceRequestOffer)
    private readonly offerRepo: Repository<ServiceRequestOffer>,
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
      proposedDateTime: proposedDate,
      expiresAt,
      clientPrice: dto.clientPrice, // Precio ofrecido por el cliente
      status: ServiceRequestStatus.PENDING,
    });

    const savedRequest = await this.srRepo.save(req);
    
    // Cargar la solicitud completa con relaciones para notificaciones
    const fullRequest = await this.srRepo.findOne({
      where: { id: savedRequest.id },
      relations: ['client', 'appliance', 'address']
    });

    // Notificar a técnicos que tienen la especialidad correspondiente
    if (fullRequest) {
      await this.notifyEligibleTechnicians(fullRequest);
    }

    return savedRequest;
  }

  // Método para encontrar técnicos elegibles y notificarlos
  private async notifyEligibleTechnicians(serviceRequest: ServiceRequest): Promise<void> {
    try {
      // Obtener el electrodoméstico de la solicitud
      const appliance = await this.applianceRepo.findOne({
        where: { id: serviceRequest.applianceId }
      });

      if (!appliance) {
        return;
      }

      // Encontrar técnicos que tienen esta especialidad
      const eligibleTechnicians = await this.technicianRepo
        .createQueryBuilder('technician')
        .innerJoin('technician.specialties', 'specialty')
        .where('specialty.name = :typeName', { typeName: appliance.type })
        .getMany();

      // Filtrar técnicos que NO tienen conflicto de horario
      const availableTechnicians: Technician[] = [];
      
      for (const tech of eligibleTechnicians) {
        const hasConflict = await this.checkTechnicianAvailability(
          tech.identityId, 
          serviceRequest.proposedDateTime
        );
        
        if (!hasConflict) {
          availableTechnicians.push(tech);
        }
      }

      const technicianIds = availableTechnicians.map(tech => tech.identityId);

      if (technicianIds.length > 0) {
        // Notificar a través del gateway
        this.gateway.notifyNewServiceRequest(serviceRequest, technicianIds);
      }
    } catch (error) {
      console.error('Error notifying technicians:', error);
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
      .leftJoinAndSelect('sr.offers', 'offers')
      .leftJoinAndSelect('offers.technician', 'offerTechnician')
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

  /** Técnico acepta una solicitud */
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
    req.scheduledAt = req.proposedDateTime; // Usar la fecha propuesta por el cliente
    req.status = ServiceRequestStatus.SCHEDULED;

    const updatedRequest = await this.srRepo.save(req);
    
    // Notificar al cliente que su solicitud fue aceptada
    this.gateway.notifyClientRequestAccepted(updatedRequest);
    
    // Notificar a otros técnicos que la solicitud ya no está disponible
    await this.notifyRequestNoLongerAvailable(id);
    
    return updatedRequest;
  }

  /** Cliente marca como completada la solicitud */
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
    
    // Notificar al técnico que el servicio fue marcado como completado
    if (req.technicianId) {
      this.gateway.notifyServiceCompleted(updatedRequest, req.technicianId);
    }
    
    return updatedRequest;
  }

  /** Cliente cancela solicitud */
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
    
    // Notificar a técnicos que la solicitud fue cancelada
    this.gateway.notifyServiceRequestRemoved(serviceRequestId, []);
    
    return updatedRequest;
  }

  // Método para notificar que una solicitud ya no está disponible
  private async notifyRequestNoLongerAvailable(serviceRequestId: number): Promise<void> {
    try {
      // En el nuevo sistema, simplemente notificamos que la solicitud fue removida
      this.gateway.notifyServiceRequestRemoved(serviceRequestId, []);
    } catch (error) {
      this.logger.error('Error notifying request no longer available:', error);
    }
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

  /** Técnico hace una oferta en una solicitud */
  async offerPrice(serviceRequestId: number, technicianId: number, dto: OfferPriceDto): Promise<ServiceRequestOffer> {
    // Verificar que la solicitud existe y está en estado correcto
    const serviceRequest = await this.srRepo.findOne({
      where: { 
        id: serviceRequestId,
        status: In([ServiceRequestStatus.PENDING, ServiceRequestStatus.OFFERED])
      },
      relations: ['client', 'appliance', 'address']
    });

    if (!serviceRequest) {
      throw new NotFoundException('Solicitud no encontrada o no disponible para ofertas');
    }

    // Verificar que no haya expirado
    if (serviceRequest.expiresAt && serviceRequest.expiresAt < new Date()) {
      throw new BadRequestException('Esta solicitud ha expirado');
    }

    // Verificar disponibilidad del técnico
    const hasConflict = await this.checkTechnicianAvailability(
      technicianId, 
      serviceRequest.proposedDateTime
    );

    if (hasConflict) {
      throw new ConflictException('Ya tienes un servicio agendado para ese día');
    }

    // Verificar que el técnico no haya hecho una oferta previa pendiente
    const existingOffer = await this.offerRepo.findOne({
      where: {
        serviceRequestId,
        technicianId,
        status: OfferStatus.PENDING
      }
    });

    if (existingOffer) {
      throw new ConflictException('Ya tienes una oferta pendiente en esta solicitud');
    }

    // Crear la nueva oferta
    const offer = this.offerRepo.create({
      serviceRequestId,
      technicianId,
      price: dto.technicianPrice,
      comment: dto.comment,
      status: OfferStatus.PENDING
    });

    const savedOffer = await this.offerRepo.save(offer);

    // Actualizar el estado de la solicitud a 'offered' si es la primera oferta
    if (serviceRequest.status === ServiceRequestStatus.PENDING) {
      serviceRequest.status = ServiceRequestStatus.OFFERED;
      await this.srRepo.save(serviceRequest);
    }

    // Cargar la oferta completa con relaciones
    const fullOffer = await this.offerRepo.findOne({
      where: { id: savedOffer.id },
      relations: ['technician', 'serviceRequest']
    });

    // Notificar al cliente sobre la nueva oferta
    if (fullOffer) {
      this.gateway.notifyClientNewOffer(serviceRequest);
    }

    return fullOffer!;
  }

  /** Cliente acepta una oferta específica */
  async acceptOffer(serviceRequestId: number, offerId: number, clientId: number): Promise<ServiceRequest> {
    // Verificar que la solicitud pertenece al cliente
    const serviceRequest = await this.srRepo.findOne({
      where: { 
        id: serviceRequestId,
        clientId,
        status: ServiceRequestStatus.OFFERED
      },
      relations: ['client', 'appliance', 'address']
    });

    if (!serviceRequest) {
      throw new NotFoundException('Solicitud no encontrada o no está disponible');
    }

    // Verificar que la oferta existe y está pendiente
    const offer = await this.offerRepo.findOne({
      where: {
        id: offerId,
        serviceRequestId,
        status: OfferStatus.PENDING
      },
      relations: ['technician']
    });

    if (!offer) {
      throw new NotFoundException('Oferta no encontrada o no está disponible');
    }

    // Verificar disponibilidad del técnico una vez más
    const hasConflict = await this.checkTechnicianAvailability(
      offer.technicianId!,
      serviceRequest.proposedDateTime
    );

    if (hasConflict) {
      throw new ConflictException('El técnico ya no está disponible para esa fecha');
    }

    // Actualizar la solicitud
    serviceRequest.technicianId = offer.technicianId;
    serviceRequest.technicianPrice = offer.price;
    serviceRequest.acceptedAt = new Date();
    serviceRequest.scheduledAt = serviceRequest.proposedDateTime;
    serviceRequest.status = ServiceRequestStatus.SCHEDULED;

    // Marcar la oferta como aceptada
    offer.status = OfferStatus.ACCEPTED;
    offer.resolvedAt = new Date();

    // Rechazar todas las demás ofertas pendientes
    await this.offerRepo.update(
      {
        serviceRequestId,
        status: OfferStatus.PENDING,
        id: Not(offerId)
      },
      {
        status: OfferStatus.REJECTED,
        resolvedAt: new Date()
      }
    );

    // Guardar cambios
    await this.offerRepo.save(offer);
    const updatedRequest = await this.srRepo.save(serviceRequest);

    // Notificar al técnico que su oferta fue aceptada
    this.gateway.notifyTechnicianOfferAccepted(updatedRequest, offer.technicianId!);

    // Notificar a otros técnicos que sus ofertas fueron rechazadas
    await this.notifyRejectedOffers(serviceRequestId, offerId);

    return updatedRequest;
  }

  /** Obtener solicitudes del cliente con ofertas */
  async getClientRequestsWithOffers(clientId: number): Promise<ServiceRequest[]> {
    const req = this.srRepo
    .createQueryBuilder('sr')
    .leftJoinAndSelect('sr.client', 'client')
    .leftJoinAndSelect('sr.appliance', 'appliance')
    .leftJoinAndSelect('sr.address', 'address')
    .leftJoinAndSelect('sr.technician', 'technician')
    .leftJoinAndSelect('sr.offers', 'offers')
    .leftJoinAndSelect('offers.technician', 'offerTechnician')
    .leftJoinAndSelect('sr.alternativeDateProposals', 'proposals')
    .leftJoinAndSelect('proposals.technician', 'proposalTechnician')
    .where('sr.clientId = :clientId', { clientId })
    .orderBy('sr.createdAt', 'DESC')
    .getMany();
    return req;
  }

  /** Cliente actualiza el precio de su solicitud */
  async updateClientPrice(serviceRequestId: number, clientId: number, newPrice: number): Promise<ServiceRequest> {
    const serviceRequest = await this.srRepo.findOne({
      where: { 
        id: serviceRequestId,
        clientId,
        status: In([ServiceRequestStatus.PENDING, ServiceRequestStatus.OFFERED])
      }
    });

    if (!serviceRequest) {
      throw new NotFoundException('Solicitud no encontrada o no se puede actualizar');
    }

    serviceRequest.clientPrice = newPrice;
    const updatedRequest = await this.srRepo.save(serviceRequest);

    // Notificar a técnicos sobre el cambio de precio
    this.gateway.notifyPriceUpdate(updatedRequest);

    return updatedRequest;
  }

  // Método privado para notificar ofertas rechazadas
  private async notifyRejectedOffers(serviceRequestId: number, acceptedOfferId: number): Promise<void> {
    try {
      const rejectedOffers = await this.offerRepo.find({
        where: {
          serviceRequestId,
          status: OfferStatus.REJECTED,
          id: Not(acceptedOfferId)
        },
        relations: ['technician', 'serviceRequest']
      });

      for (const rejectedOffer of rejectedOffers) {
        this.gateway.notifyTechnicianOfferRejected(rejectedOffer.serviceRequest, rejectedOffer.technicianId!);
      }    } catch (error) {
      this.logger.error('Error notifying rejected offers:', error);
    }
  }  /** Técnico propone fecha alternativa */
  async proposeAlternativeDate(serviceRequestId: number, technicianId: number, alternativeDateTime: string, comment?: string): Promise<AlternativeDateProposal> {
    // Verificar que la solicitud existe y está en estado correcto
    const serviceRequest = await this.srRepo.findOne({
      where: { 
        id: serviceRequestId,
        status: In([ServiceRequestStatus.PENDING, ServiceRequestStatus.OFFERED])
      },
      relations: ['client', 'appliance', 'address', 'alternativeDateProposals']
    });

    if (!serviceRequest) {
      throw new NotFoundException('Solicitud no encontrada o no disponible');
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
      proposalCount: existingProposalsCount + 1
    });

    const savedProposal = await this.proposalRepo.save(proposal);

    // Cargar la propuesta con la información del técnico
    const proposalWithTechnician = await this.proposalRepo.findOne({
      where: { id: savedProposal.id },
      relations: ['technician']
    });

    this.logger.log(`Técnico ${technicianId} propuso fecha alternativa ${alternativeDateTime} para solicitud ${serviceRequestId} (propuesta #${existingProposalsCount + 1})`);
    
    // Notificar al cliente sobre la propuesta de fecha alternativa
    if (this.gateway) {
      this.gateway.notifyClientAlternativeDateProposal(serviceRequest, proposalWithTechnician!);
    }
    
    return proposalWithTechnician!;
  }

  /** Cliente acepta una propuesta de fecha alternativa */
  async acceptAlternativeDate(serviceRequestId: number, proposalId: number, clientId: number): Promise<ServiceRequest> {
    // Verificar que la solicitud pertenece al cliente
    const serviceRequest = await this.srRepo.findOne({
      where: { 
        id: serviceRequestId,
        clientId,
        status: In([ServiceRequestStatus.PENDING, ServiceRequestStatus.OFFERED])
      },
      relations: ['client', 'appliance', 'address', 'alternativeDateProposals']
    });

    if (!serviceRequest) {
      throw new NotFoundException('Solicitud no encontrada o no tienes permisos para modificarla');
    }

    // Verificar que la propuesta existe y está pendiente
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

    // Rechazar todas las demás propuestas pendientes para esta solicitud
    await this.proposalRepo.update(
      { 
        serviceRequestId,
        status: AlternativeDateProposalStatus.PENDING,
        id: Not(proposalId)
      },
      { 
        status: AlternativeDateProposalStatus.REJECTED,
        resolvedAt: new Date()
      }
    );

    // Rechazar todas las ofertas pendientes para esta solicitud
    await this.offerRepo.update(
      { 
        serviceRequestId,
        status: OfferStatus.PENDING
      },
      { 
        status: OfferStatus.REJECTED,
        resolvedAt: new Date()
      }
    );

    // Guardar cambios
    await this.proposalRepo.save(proposal);
    const updatedRequest = await this.srRepo.save(serviceRequest);

    this.logger.log(`Cliente ${clientId} aceptó propuesta de fecha alternativa ${proposal.id} para solicitud ${serviceRequestId}`);

    // Notificar al técnico que su propuesta fue aceptada
    if (this.gateway) {
      this.gateway.notifyTechnicianProposalAccepted(updatedRequest, proposal);
    }

    // Notificar a otros técnicos que la solicitud ya no está disponible
    await this.notifyRejectedProposalsAndOffers(serviceRequestId, proposalId);

    return updatedRequest;
  }

  /** Cliente rechaza una propuesta de fecha alternativa */
  async rejectAlternativeDate(serviceRequestId: number, proposalId: number, clientId: number): Promise<AlternativeDateProposal> {
    // Verificar que la solicitud pertenece al cliente
    const serviceRequest = await this.srRepo.findOne({
      where: { 
        id: serviceRequestId,
        clientId,
        status: In([ServiceRequestStatus.PENDING, ServiceRequestStatus.OFFERED])
      }
    });

    if (!serviceRequest) {
      throw new NotFoundException('Solicitud no encontrada o no tienes permisos para modificarla');
    }

    // Verificar que la propuesta existe y está pendiente
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

    // Notificar al técnico que su propuesta fue rechazada
    if (this.gateway) {
      this.gateway.notifyTechnicianProposalRejected(serviceRequest, updatedProposal);
    }

    return updatedProposal;
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

  // Método privado para notificar rechazos de propuestas y ofertas
  private async notifyRejectedProposalsAndOffers(serviceRequestId: number, acceptedProposalId: number): Promise<void> {
    // Obtener todas las propuestas rechazadas
    const rejectedProposals = await this.proposalRepo.find({
      where: { 
        serviceRequestId,
        status: AlternativeDateProposalStatus.REJECTED,
        id: Not(acceptedProposalId)
      },
      relations: ['technician']
    });

    // Obtener todas las ofertas rechazadas
    const rejectedOffers = await this.offerRepo.find({
      where: { 
        serviceRequestId,
        status: OfferStatus.REJECTED
      },
      relations: ['technician']
    });

    // Notificar a técnicos con propuestas rechazadas
    for (const proposal of rejectedProposals) {
      if (this.gateway && proposal.technician) {
        this.gateway.notifyTechnicianRequestUnavailable(proposal.technician.id, serviceRequestId);
      }
    }

    // Notificar a técnicos con ofertas rechazadas
    for (const offer of rejectedOffers) {
      if (this.gateway && offer.technician) {
        this.gateway.notifyTechnicianRequestUnavailable(offer.technician.id, serviceRequestId);
      }
    }
  }

  /** Métodos auxiliares para manejar propuestas por ID */
  async acceptAlternativeDateByProposalId(proposalId: number, clientId: number): Promise<ServiceRequest> {
    // Primero obtener la propuesta para conocer el serviceRequestId
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

    return this.acceptAlternativeDate(proposal.serviceRequestId, proposalId, clientId);
  }

  async rejectAlternativeDateByProposalId(proposalId: number, clientId: number): Promise<AlternativeDateProposal> {
    // Primero obtener la propuesta para conocer el serviceRequestId
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

    return this.rejectAlternativeDate(proposal.serviceRequestId, proposalId, clientId);
  }
}