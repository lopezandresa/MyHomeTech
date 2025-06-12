import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplianceModel } from './appliance-model.entity';

@Injectable()
export class ApplianceModelService {
  constructor(
    @InjectRepository(ApplianceModel)
    private readonly applianceModelRepo: Repository<ApplianceModel>,
  ) {}

  findAll(): Promise<ApplianceModel[]> {
    return this.applianceModelRepo.find({ 
      where: { isActive: true },
      relations: ['brand', 'brand.type']
    });
  }

  findByBrandId(brandId: number): Promise<ApplianceModel[]> {
    return this.applianceModelRepo.find({ 
      where: { brandId, isActive: true },
      relations: ['brand']
    });
  }
}
