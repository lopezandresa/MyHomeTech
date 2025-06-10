import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceRequest } from './service-request.entity';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';

// src/service-request/service-request.service.ts
@Injectable()
export class ServiceRequestService {
  constructor(
    @InjectRepository(ServiceRequest)
    private readonly srRepo: Repository<ServiceRequest>,
  ) {}

  async create(dto: CreateServiceRequestDto): Promise<ServiceRequest> {
    // Mapear el DTO al tipo exacto de la entidad
    const data: Partial<ServiceRequest> = {
      clientId: dto.clientId,
      technicianId: dto.technicianId,
      description: dto.description,
      // forzamos el tipo literal para que coincida
      status: dto.status as ServiceRequest['status'],
      // convertimos el ISO-string a Date
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
    };

    const req = this.srRepo.create(data);
    return this.srRepo.save(req);
  }

  async findAll(): Promise<ServiceRequest[]> {
    return this.srRepo.find();
  }

  async findById(id: number): Promise<ServiceRequest | null> {
    return this.srRepo.findOne({ where: { id } });
  }
}
