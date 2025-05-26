import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { Schedule } from './schedule.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('schedules')
@Controller('schedules')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post()
  create(@Body() dto: Partial<Schedule>) {
    return this.scheduleService.create(dto);
  }

  @Get()
  findAll(): Promise<Schedule[]> {
    return this.scheduleService.findAll();
  }

  @Get('technician/:id')
  findByTech(@Param('id') id: number): Promise<Schedule[]> {
    return this.scheduleService.findByTechnician(id);
  }
}