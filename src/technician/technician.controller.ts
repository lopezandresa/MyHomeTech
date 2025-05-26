import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { TechnicianService } from './technician.service';
import { Technician } from './technician.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('technicians')
@Controller('technicians')
export class TechnicianController {
  constructor(private readonly technicianService: TechnicianService) {}

  @Post()
  async create(@Body() technician: Partial<Technician>) {
    return this.technicianService.create(technician);
  }

  @Get()
  async findAll(): Promise<Technician[]> {
    return this.technicianService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: number): Promise<Technician | null> {
    return this.technicianService.findById(id);
  }
}