import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplianceType } from './appliance-type.entity';

@Injectable()
export class ApplianceTypeService {
  constructor(
    @InjectRepository(ApplianceType)
    private readonly applianceTypeRepo: Repository<ApplianceType>,
  ) {}

  findAll(): Promise<ApplianceType[]> {
    return this.applianceTypeRepo.find({ 
      where: { isActive: true },
      relations: ['brands']
    });
  }

  findById(id: number): Promise<ApplianceType | null> {
    return this.applianceTypeRepo.findOne({ 
      where: { id, isActive: true },
      relations: ['brands']
    });
  }

  async create(name: string, description?: string): Promise<ApplianceType> {
    const type = this.applianceTypeRepo.create({
      name,
      description
    });
    return this.applianceTypeRepo.save(type);
  }
}
