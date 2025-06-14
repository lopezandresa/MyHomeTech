import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceRequestType } from './service-request-type.entity';

@Injectable()
export class ServiceRequestTypeService {
  constructor(
    @InjectRepository(ServiceRequestType)
    private readonly serviceRequestTypeRepo: Repository<ServiceRequestType>,
  ) {}

  async findAll(): Promise<ServiceRequestType[]> {
    return this.serviceRequestTypeRepo.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', displayName: 'ASC' }
    });
  }

  async findByName(name: string): Promise<ServiceRequestType | null> {
    return this.serviceRequestTypeRepo.findOne({
      where: { name, isActive: true }
    });
  }

  async create(data: Partial<ServiceRequestType>): Promise<ServiceRequestType> {
    const serviceRequestType = this.serviceRequestTypeRepo.create(data);
    return this.serviceRequestTypeRepo.save(serviceRequestType);
  }
}