import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Schedule } from './schedule.entity';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(Schedule)
    private readonly repo: Repository<Schedule>,
  ) {}

  create(data: Partial<Schedule>) {
    return this.repo.save(data);
  }

  findAll() {
    return this.repo.find();
  }

  findByTechnician(id: number) {
    return this.repo.find({ where: { technicianId: id } });
  }
}