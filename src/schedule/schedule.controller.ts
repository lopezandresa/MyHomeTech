import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ScheduleService } from './schedule.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { Schedule } from './schedule.entity';

@ApiTags('schedules')
@Controller('schedules')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post()
  @ApiOperation({ summary: 'Crea un nuevo horario para técnico' })
  create(@Body() dto: CreateScheduleDto): Promise<Schedule> {
    return this.scheduleService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtiene todos los horarios' })
  findAll(): Promise<Schedule[]> {
    return this.scheduleService.findAll();
  }

  @Get('technician/:id')
  @ApiOperation({ summary: 'Obtiene horarios por técnico' })
  findByTech(@Param('id') id: number): Promise<Schedule[]> {
    return this.scheduleService.findByTechnician(id);
  }
}