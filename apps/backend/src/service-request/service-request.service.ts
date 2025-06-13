import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan, In } from 'typeorm';
import { ServiceRequest, ServiceRequestStatus } from './service-request.entity';
import { ServiceRequestOffer, OfferStatus } from './service-request-offer.entity';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import { OfferPriceDto } from './dto/offer-price.dto';
import { AcceptRequestDto } from './dto/accept-request.dto';
import { ScheduleRequestDto } from './dto/schedule-request.dto';
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

    // Usar valor por defecto de 5 minutos si no se especifica
    const validMinutes = dto.validMinutes || 5;
    
    // calcula expiresAt
    const now = new Date();
    const expiresAt = new Date(now.getTime() + validMinutes * 60000);

    const req = this.srRepo.create({
      clientId,
      applianceId: dto.applianceId,
      addressId: dto.addressId,
      description: dto.description,
      clientPrice: dto.clientPrice,
      expiresAt,
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
      console.log(`🔍 Finding eligible technicians for service request ${serviceRequest.id}`);
      
      // Obtener el electrodoméstico de la solicitud
      const appliance = await this.applianceRepo.findOne({
        where: { id: serviceRequest.applianceId }
      });

      if (!appliance) {
        console.log(`❌ Appliance not found for service request ${serviceRequest.id}`);
        return;
      }

      console.log(`🔧 Appliance type: ${appliance.type}`);

      // Encontrar técnicos que tienen esta especialidad por tipo de string
      // Buscar ApplianceType que coincida con el tipo del electrodoméstico
      const eligibleTechnicians = await this.technicianRepo
        .createQueryBuilder('technician')
        .innerJoin('technician.specialties', 'specialty')
        .where('specialty.name = :typeName', { typeName: appliance.type })
        .getMany();

      // Extraer IDs de técnicos elegibles
      const technicianIds = eligibleTechnicians.map(tech => tech.identityId);

      console.log(`👥 Found ${eligibleTechnicians.length} eligible technicians:`, technicianIds);

      if (technicianIds.length > 0) {
        // Notificar a través del gateway
        console.log(`📡 Notifying technicians about new service request ${serviceRequest.id}`);
        this.gateway.notifyNewServiceRequest(serviceRequest, technicianIds);
      } else {
        console.log(`⚠️ No eligible technicians found for appliance type: ${appliance.type}`);
      }
    } catch (error) {
      console.error('❌ Error notifying technicians:', error);
    }
  }

  /** Técnicos: solicitudes pendientes filtradas por especialidad */
  async findPendingForTechnician(technicianId: number): Promise<ServiceRequest[]> {
    // Primero, marcar como expiradas las solicitudes que han vencido
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

    // Buscar solicitudes pendientes que coincidan con las especialidades y NO estén expiradas
    return this.srRepo
      .createQueryBuilder('serviceRequest')
      .innerJoin('serviceRequest.appliance', 'appliance')
      .leftJoinAndSelect('serviceRequest.client', 'client')
      .leftJoinAndSelect('serviceRequest.appliance', 'applianceData')
      .leftJoinAndSelect('serviceRequest.address', 'address')
      .where('serviceRequest.status = :status', { status: ServiceRequestStatus.PENDING })
      .andWhere('serviceRequest.expiresAt > :now', { now: new Date() })
      .andWhere('appliance.type IN (:...typeNames)', { typeNames: specialtyNames })
      .getMany();
  }

  /** Método para marcar solicitudes expiradas */
  private async markExpiredRequests(): Promise<void> {
    const now = new Date();
    
    // Buscar solicitudes pendientes que han expirado
    const expiredRequests = await this.srRepo.find({
      where: {
        status: ServiceRequestStatus.PENDING,
        expiresAt: LessThan(now)
      },
      relations: ['client', 'appliance', 'address'] // Cargar relaciones para notificaciones
    });

    // Marcar como expiradas
    for (const request of expiredRequests) {
      request.status = ServiceRequestStatus.EXPIRED;
      request.expiredAt = now;
      await this.srRepo.save(request);
      
      // Notificar a técnicos que la solicitud ya no está disponible
      await this.notifyRequestExpired(request.id);
      
      // Notificar al cliente que su solicitud ha expirado
      this.gateway.notifyClientRequestExpired(request);
    }
  }

  /** Notificar que una solicitud ha expirado */
  private async notifyRequestExpired(serviceRequestId: number): Promise<void> {
    try {
      const allTechnicians = await this.technicianRepo.find();
      const technicianIds = allTechnicians.map(tech => tech.identityId);
      
      this.gateway.notifyServiceRequestRemoved(serviceRequestId, technicianIds);
    } catch (error) {
      console.error('Error notifying request expiration:', error);
    }
  }

  /** Técnicos: solicitudes pendientes y no expiradas */
  async findPending(): Promise<ServiceRequest[]> {
    return this.srRepo.find({
      where: {
        status: ServiceRequestStatus.PENDING,
        expiresAt: MoreThan(new Date()),
      },
    });
  }  /** Técnico contraoferta */
  async offerPrice(
    id: number,
    technicianId: number,
    dto: OfferPriceDto,
  ): Promise<ServiceRequest> {
    const req = await this.srRepo.findOne({ 
      where: { 
        id, 
        status: In([ServiceRequestStatus.PENDING, ServiceRequestStatus.OFFERED])
      },
      relations: ['client', 'appliance', 'address', 'offers']
    });
    if (!req) throw new NotFoundException('Solicitud no disponible para oferta');
      // Verificar que el técnico no haya hecho ya una oferta
    const existingOffer = await this.offerRepo.findOne({
      where: { 
        serviceRequestId: id, 
        technicianId,
        status: OfferStatus.PENDING
      }
    });
    
    if (existingOffer) {
      throw new ConflictException('Ya has hecho una oferta para esta solicitud');
    }

    // Verificar throttling: no más de una oferta cada 10 segundos por técnico
    const tenSecondsAgo = new Date(Date.now() - 10 * 1000);
    const recentOffer = await this.offerRepo.findOne({
      where: {
        technicianId,
        createdAt: MoreThan(tenSecondsAgo)
      },
      order: { createdAt: 'DESC' }
    });

    if (recentOffer) {
      const timeSinceLastOffer = Date.now() - recentOffer.createdAt.getTime();
      const remainingTime = Math.ceil((10000 - timeSinceLastOffer) / 1000);
      throw new ConflictException(
        `Debes esperar ${remainingTime} segundos antes de hacer otra contraoferta`
      );
    }// Crear nueva oferta
    const offer = this.offerRepo.create({
      serviceRequestId: id,
      technicianId,
      price: dto.technicianPrice,
      comment: dto.comment,
      status: OfferStatus.PENDING
    });
    
    await this.offerRepo.save(offer);
    
    // NO cambiar el estado de la solicitud - debe mantenerse PENDING
    // para que otros técnicos puedan seguir haciendo ofertas
    
    // Obtener la solicitud actualizada con todas las ofertas
    const updatedRequest = await this.srRepo.findOne({
      where: { id },
      relations: ['client', 'appliance', 'address', 'offers', 'offers.technician']
    });
    
    // Notificar al cliente sobre la nueva oferta
    this.gateway.notifyClientNewOffer(updatedRequest!);
    
    return updatedRequest!;
  }

  /** Cliente acepta precio */
  async accept(
    id: number,
    clientId: number,
    dto: AcceptRequestDto,
  ): Promise<ServiceRequest> {
    const req = await this.srRepo.findOne({
      where: [
        { id, clientId, status: ServiceRequestStatus.PENDING },
        { id, clientId, status: ServiceRequestStatus.OFFERED },
      ],
    });
    if (!req) throw new NotFoundException('Solicitud no disponible para aceptar');
    req.status = ServiceRequestStatus.ACCEPTED;
    req.acceptedAt = new Date();
    // deja technicianPrice o clientPrice según dto.acceptClientPrice
    return this.srRepo.save(req);
  }

  /** Agenda la solicitud */
  async schedule(
    id: number,
    technicianId: number,
    dto: ScheduleRequestDto,
  ): Promise<ServiceRequest> {
    const req = await this.srRepo.findOne({
      where: {
        id,
        technicianId,
        status: ServiceRequestStatus.ACCEPTED,
      },
    });
    if (!req) throw new NotFoundException('Solicitud no disponible para agendar');
    req.scheduledAt = new Date(dto.scheduledAt);
    req.status = ServiceRequestStatus.SCHEDULED;
    return this.srRepo.save(req);
  }
  
  /**
   * El técnico acepta directamente la solicitud pendiente y la agenda
   */
  async acceptByTechnician(
    id: number,
    technicianId: number,
  ): Promise<ServiceRequest> {
    const req = await this.srRepo.findOne({
      where: { id, status: ServiceRequestStatus.PENDING },
      relations: ['client', 'appliance', 'address']
    });
    if (!req) {
      throw new NotFoundException('Solicitud no disponible para aceptar');
    }

    req.technicianId = technicianId;
    req.acceptedAt = new Date();
    req.scheduledAt = new Date();
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
      where: [
        { id, clientId, status: ServiceRequestStatus.SCHEDULED },
        { id, clientId, status: ServiceRequestStatus.IN_PROGRESS },
      ],
    });
    if (!req) throw new NotFoundException('No se puede finalizar esta solicitud');
    req.status = ServiceRequestStatus.COMPLETED;
    req.completedAt = new Date();
    return this.srRepo.save(req);
  }

  /** Técnico rechaza la solicitud */
  async rejectByTechnician(id: number, technicianId: number): Promise<ServiceRequest> {
    const req = await this.srRepo.findOne({
      where: { id, status: ServiceRequestStatus.PENDING },
      relations: ['client', 'appliance', 'address']
    });
    if (!req) {
      throw new NotFoundException('Solicitud no disponible para rechazar');
    }

    req.technicianId = technicianId;
    req.status = ServiceRequestStatus.CANCELLED;
    req.cancelledAt = new Date();

    const updatedRequest = await this.srRepo.save(req);
    
    // Notificar a otros técnicos que la solicitud ya no está disponible
    await this.notifyRequestNoLongerAvailable(id);
    
    return updatedRequest;
  }

  /** Cliente rechaza oferta de técnico */
  async rejectOfferByClient(id: number, clientId: number): Promise<ServiceRequest> {
    const req = await this.srRepo.findOne({
      where: { id, clientId, status: ServiceRequestStatus.OFFERED },
      relations: ['client', 'appliance', 'address', 'technician']
    });
    
    if (!req) {
      throw new NotFoundException('Solicitud con oferta no encontrada o no te pertenece');
    }

    // Cuando el cliente rechaza la oferta, la solicitud se cancela
    req.status = ServiceRequestStatus.CANCELLED;
    req.cancelledAt = new Date();

    const updatedRequest = await this.srRepo.save(req);
    
    // Notificar al técnico que su oferta fue rechazada
    if (req.technicianId) {
      this.gateway.notifyOfferRejected(updatedRequest, req.technicianId);
    }
    
    return updatedRequest;
  }

  // Método para notificar que una solicitud ya no está disponible
  private async notifyRequestNoLongerAvailable(serviceRequestId: number): Promise<void> {
    try {
      // Obtener todos los técnicos que podrían estar viendo esta solicitud
      const allTechnicians = await this.technicianRepo.find();
      const technicianIds = allTechnicians.map(tech => tech.identityId);
      
      this.gateway.notifyServiceRequestRemoved(serviceRequestId, technicianIds);
    } catch (error) {
      console.error('Error notifying request removal:', error);
    }
  }

  // métodos auxiliares:
  async findById(id: number): Promise<ServiceRequest | null> {
    return this.srRepo.findOne({ where: { id } });
  }

  async findByClient(clientId: number): Promise<ServiceRequest[]> {
    return this.srRepo.find({ where: { clientId } });
  }

  async findByTechnician(technicianId: number): Promise<ServiceRequest[]> {
    return this.srRepo.find({ where: { technicianId } });
  }

  // Método para obtener solicitudes del cliente con todas las ofertas
  async findByClientWithOffers(clientId: number): Promise<ServiceRequest[]> {
    return this.srRepo.find({ 
      where: { clientId },
      relations: ['client', 'appliance', 'address', 'offers', 'offers.technician', 'technician'],
      order: { createdAt: 'DESC' }
    });
  }

  // Método para aceptar una oferta específica
  async acceptSpecificOffer(
    serviceRequestId: number,
    offerId: number,
    clientId: number
  ): Promise<ServiceRequest> {
    // Verificar que la solicitud pertenece al cliente
    const req = await this.srRepo.findOne({
      where: { id: serviceRequestId, clientId },
      relations: ['offers', 'offers.technician']
    });
    
    if (!req) {
      throw new NotFoundException('Solicitud no encontrada');
    }
      // Verificar que la oferta existe y está pendiente
    const offer = await this.offerRepo.findOne({
      where: { id: offerId, serviceRequestId, status: OfferStatus.PENDING },
      relations: ['technician']
    });
    
    if (!offer) {
      throw new NotFoundException('Oferta no encontrada o ya fue procesada');
    }

    // Verificar que la oferta está dentro del tiempo límite de 10 segundos
    const offerAge = Date.now() - offer.createdAt.getTime();
    const timeLimit = 10 * 1000; // 10 segundos en millisegundos
    
    if (offerAge > timeLimit) {
      throw new BadRequestException('Esta oferta ha expirado. Solo puedes aceptar ofertas dentro de los 10 segundos posteriores a su creación.');
    }
    
    // Aceptar la oferta seleccionada
    offer.status = OfferStatus.ACCEPTED;
    offer.resolvedAt = new Date();
    await this.offerRepo.save(offer);
    
    // Rechazar todas las demás ofertas pendientes
    await this.offerRepo.update(
      { 
        serviceRequestId, 
        status: OfferStatus.PENDING,
        id: In([...req.offers?.filter(o => o.id !== offerId).map(o => o.id) || []])
      },
      { 
        status: OfferStatus.REJECTED,
        resolvedAt: new Date()
      }
    );
    
    // Actualizar la solicitud
    req.technicianId = offer.technicianId;
    req.status = ServiceRequestStatus.ACCEPTED;
    req.acceptedAt = new Date();
    const updatedRequest = await this.srRepo.save(req);
    
    // Notificar al técnico que su oferta fue aceptada
    this.gateway.notifyClientRequestAccepted(updatedRequest);
      // Notificar a los otros técnicos que sus ofertas fueron rechazadas
    const rejectedOffers = req.offers?.filter(o => o.id !== offerId) || [];
    for (const rejectedOffer of rejectedOffers) {
      if (rejectedOffer.technicianId) {
        this.gateway.notifyOfferRejected(updatedRequest, rejectedOffer.technicianId);
      }
    }
    
    return updatedRequest;
  }

  // Método para cancelar solicitud (cliente cancela toda la solicitud)
  async cancelByClient(serviceRequestId: number, clientId: number): Promise<ServiceRequest> {
    const req = await this.srRepo.findOne({
      where: { id: serviceRequestId, clientId },
      relations: ['offers', 'offers.technician']
    });
    
    if (!req) {
      throw new NotFoundException('Solicitud no encontrada');
    }
    
    if (req.status === ServiceRequestStatus.CANCELLED) {
      throw new ConflictException('La solicitud ya está cancelada');
    }
    
    // Cancelar la solicitud
    req.status = ServiceRequestStatus.CANCELLED;
    req.cancelledAt = new Date();
    const updatedRequest = await this.srRepo.save(req);
    
    // Rechazar todas las ofertas pendientes
    await this.offerRepo.update(
      { serviceRequestId, status: OfferStatus.PENDING },
      { status: OfferStatus.REJECTED, resolvedAt: new Date() }
    );
      // Notificar a todos los técnicos que la solicitud fue cancelada
    const technicianIds = req.offers?.map(offer => offer.technicianId).filter(id => id !== undefined) || [];
    this.gateway.notifyServiceRequestRemoved(serviceRequestId, technicianIds as number[]);
    
    return updatedRequest;
  }
  /** Cliente actualiza el precio inicial de su solicitud */
  async updateClientPrice(
    id: number,
    clientId: number,
    newPrice: number,
  ): Promise<ServiceRequest> {
    // Verificar que la solicitud existe y pertenece al cliente
    const req = await this.srRepo.findOne({
      where: { 
        id, 
        clientId,
        status: In([ServiceRequestStatus.PENDING, ServiceRequestStatus.OFFERED])
      },
      relations: ['client', 'appliance', 'address', 'offers']
    });

    if (!req) throw new NotFoundException('Solicitud no encontrada o no pertenece al cliente');

    // Verificar que el nuevo precio sea válido
    if (newPrice <= 0) {
      throw new BadRequestException('El precio debe ser mayor a 0');
    }    // Actualizar el precio inicial del cliente
    req.clientPrice = newPrice;
    
    await this.srRepo.save(req);
    
    // Obtener la solicitud actualizada
    const updatedRequest = await this.srRepo.findOne({
      where: { id },
      relations: ['client', 'appliance', 'address', 'offers', 'offers.technician']
    });

    // Notificar a los técnicos que el cliente actualizó su precio
    // Esto les permite hacer nuevas ofertas basadas en el nuevo precio
    if (updatedRequest) {
      // TODO: Implementar notificación a técnicos sobre cambio de precio
    }
    
    return updatedRequest!;
  }
}