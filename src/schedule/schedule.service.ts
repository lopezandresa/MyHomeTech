import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Schedule } from './schedule.entity';
import { CreateScheduleDto } from './dto/create-schedule.dto';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepo: Repository<Schedule>,
  ) {}

  create(dto: CreateScheduleDto) {
    const s = this.scheduleRepo.create(dto);
    return this.scheduleRepo.save(s);
  }

  findAll() {
    return this.scheduleRepo.find();
  }

  findByTechnician(id: number) {
    return this.scheduleRepo.find({ where: { technicianId: id } });
  }
}