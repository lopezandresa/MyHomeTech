import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { ServiceRequest, ServiceRequestStatus } from './service-request.entity';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import { OfferPriceDto } from './dto/offer-price.dto';
import { AcceptRequestDto } from './dto/accept-request.dto';
import { ScheduleRequestDto } from './dto/schedule-request.dto';

@Injectable()
export class ServiceRequestService {
  constructor(
    @InjectRepository(ServiceRequest)
    private readonly srRepo: Repository<ServiceRequest>,
  ) {}
  async create(clientId: number, dto: CreateServiceRequestDto): Promise<ServiceRequest> {
    // Usar valor por defecto de 5 minutos si no se especifica
    const validMinutes = dto.validMinutes || 5;
    
    // calcula expiresAt
    const now = new Date();
    const expiresAt = new Date(now.getTime() + validMinutes * 60000);

    const req = this.srRepo.create({
      clientId,
      applianceId: dto.applianceId,
      description: dto.description,
      clientPrice: dto.clientPrice,
      expiresAt,
      status: ServiceRequestStatus.PENDING,
    });
    return this.srRepo.save(req);
  }

  /** Técnicos: solicitudes pendientes y no expiradas */
  async findPending(): Promise<ServiceRequest[]> {
    return this.srRepo.find({
      where: {
        status: ServiceRequestStatus.PENDING,
        expiresAt: MoreThan(new Date()),
      },
    });
  }

  /** Técnico contraoferta */
  async offerPrice(
    id: number,
    technicianId: number,
    dto: OfferPriceDto,
  ): Promise<ServiceRequest> {
    const req = await this.srRepo.findOne({ where: { id, status: ServiceRequestStatus.PENDING }});
    if (!req) throw new NotFoundException('Solicitud no disponible para oferta');
    req.technicianId = technicianId;
    req.technicianPrice = dto.technicianPrice;
    req.status = ServiceRequestStatus.OFFERED;
    return this.srRepo.save(req);
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
    });
    if (!req) {
      throw new NotFoundException('Solicitud no disponible para aceptar');
    }

    req.technicianId = technicianId;
    req.acceptedAt = new Date();
    // la agendamos al momento de aceptar
    req.scheduledAt = new Date();
    req.status = ServiceRequestStatus.SCHEDULED;

    return this.srRepo.save(req);
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
    });
    if (!req) {
      throw new NotFoundException('Solicitud no disponible para rechazar');
    }

    req.technicianId = technicianId;
    req.status = ServiceRequestStatus.CANCELLED;
    req.cancelledAt = new Date();

    return this.srRepo.save(req);
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
}