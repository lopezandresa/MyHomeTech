import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Technician } from './technician.entity';

@Injectable()
export class TechnicianService {
  constructor(
    @InjectRepository(Technician)
    private readonly technicianRepository: Repository<Technician>,
  ) {}

  create(data: Partial<Technician>) {
    return this.technicianRepository.save(data);
  }

  findAll() {
    return this.technicianRepository.find();
  }

  findById(id: number) {
    return this.technicianRepository.findOne({ where: { id } });
  }
}