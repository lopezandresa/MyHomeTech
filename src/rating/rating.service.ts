import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from './rating.entity';
import { CreateRatingDto } from './dto/create-rating.dto';
import { ServiceRequest, ServiceRequestStatus } from '../service-request/service-request.entity';

@Injectable()
export class RatingService {
  constructor(
    @InjectRepository(Rating)
    private readonly ratingRepo: Repository<Rating>,
    @InjectRepository(ServiceRequest)
    private readonly srRepo: Repository<ServiceRequest>,
  ) {}

  async create(dto: CreateRatingDto) {
    // Validar que no exista ya un rating para esta solicitud
    const exists = await this.ratingRepo.findOne({ where: { serviceRequestId: dto.serviceRequestId } });
    if (exists) {
      throw new Error('Ya existe una calificación para esta solicitud');
    }
    // Validar que la solicitud esté COMPLETED
    const sr = await this.srRepo.findOne({ where: { id: dto.serviceRequestId, status: ServiceRequestStatus.COMPLETED } });
    if (!sr) {
      throw new Error('Solo se puede calificar un servicio finalizado');
    }
    const r = this.ratingRepo.create(dto);
    return this.ratingRepo.save(r);
  }

  findAll() {
    return this.ratingRepo.find();
  }

  findByUser(id: number) {
    return this.ratingRepo.find({ where: { ratedId: id } });
  }
}