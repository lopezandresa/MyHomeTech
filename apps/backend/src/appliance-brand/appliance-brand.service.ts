import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplianceBrand } from './appliance-brand.entity';

@Injectable()
export class ApplianceBrandService {
  constructor(
    @InjectRepository(ApplianceBrand)
    private readonly applianceBrandRepo: Repository<ApplianceBrand>,
  ) {}

  findAll(): Promise<ApplianceBrand[]> {
    return this.applianceBrandRepo.find({ 
      where: { isActive: true },
      relations: ['type', 'models']
    });
  }

  findByTypeId(typeId: number): Promise<ApplianceBrand[]> {
    return this.applianceBrandRepo.find({ 
      where: { typeId, isActive: true },
      relations: ['models']
    });
  }
}
