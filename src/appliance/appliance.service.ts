import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appliance } from './appliance.entity';
import { CreateApplianceDto } from './dto/create-appliance.dto';

@Injectable()
export class ApplianceService {
  constructor(
    @InjectRepository(Appliance)
    private readonly repo: Repository<Appliance>,
  ) {}

  create(dto: CreateApplianceDto) {
    const a = this.repo.create(dto);
    return this.repo.save(a);
  }

  findAll() {
    return this.repo.find();
  }
}