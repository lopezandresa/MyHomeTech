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
    private readonly srRepo: Repository<ServiceRequest>,
    @InjectRepository(ServiceRequestOffer)
    private readonly offerRepo: Repository<ServiceRequestOffer>,
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
    const date = new Date(proposedDateTime);
    
    // Crear rango de 6 horas para el día completo de trabajo
    const startOfWorkDay = new Date(date);
    startOfWorkDay.setHours(6, 0, 0, 0);
    
    const endOfWorkDay = new Date(date);
    endOfWorkDay.setHours(18, 0, 0, 0);

    // Buscar si el técnico ya tiene algo agendado ese día
    const conflictingRequest = await this.srRepo.findOne({
      where: {
        technicianId,
        status: ServiceRequestStatus.SCHEDULED,
        scheduledAt: Between(startOfWorkDay, endOfWorkDay)
      }
    });

    return !!conflictingRequest; // true si hay conflicto
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
    // Marcar como expiradas las solicitudes que han vencido
    await this.markExpiredRequests();

    // Obtener el perfil del técnico con sus especialidades
    const technician = await this.technicianRepo.findOne({
      where: { identityId: technicianId },
      relations: ['specialties']
    });

    if (!technician || !technician.specialties.length) {
      return [];
    }

    // Obtener nombres de tipos de electrodomésticos que maneja el técnico
    const specialtyNames = technician.specialties.map(specialty => specialty.name);

    // Buscar solicitudes pendientes que coincidan con las especialidades
    const pendingRequests = await this.srRepo
      .createQueryBuilder('serviceRequest')
      .innerJoin('serviceRequest.appliance', 'appliance')
      .leftJoinAndSelect('serviceRequest.client', 'client')
      .leftJoinAndSelect('serviceRequest.appliance', 'applianceData')
      .leftJoinAndSelect('serviceRequest.address', 'address')
      .where('serviceRequest.status = :status', { status: ServiceRequestStatus.PENDING })
      .andWhere('serviceRequest.expiresAt > :now', { now: new Date() })
      .andWhere('appliance.type IN (:...typeNames)', { typeNames: specialtyNames })
      .getMany();

    // Filtrar por disponibilidad del técnico
    const availableRequests: ServiceRequest[] = [];
    for (const request of pendingRequests) {
      const hasConflict = await this.checkTechnicianAvailability(
        technicianId, 
        request.proposedDateTime
      );
      
      if (!hasConflict) {
        availableRequests.push(request);
      }
    }

    return availableRequests;
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

    // Verificar disponibilidad del técnico
    const hasConflict = await this.checkTechnicianAvailability(
      technicianId, 
      req.proposedDateTime
    );

    if (hasConflict) {
      throw new ConflictException('Ya tienes un servicio agendado para ese día');
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
    return this.srRepo.find({
      where: { clientId },
      relations: ['client', 'appliance', 'address', 'technician', 'offers', 'offers.technician'],
      order: { createdAt: 'DESC' }
    });
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
      }
    } catch (error) {
      this.logger.error('Error notifying rejected offers:', error);
    }
  }
}