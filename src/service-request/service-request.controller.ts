import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ServiceRequestService } from './service-request.service';
import { ServiceRequest } from './service-request.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('service-requests')
@Controller('service-requests')
export class ServiceRequestController {
  constructor(private readonly srService: ServiceRequestService) {}

  @Post()
  create(@Body() dto: Partial<ServiceRequest>) {
    return this.srService.create(dto);
  }

  @Get()
  findAll(): Promise<ServiceRequest[]> {
    return this.srService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: number): Promise<ServiceRequest | null> {
    return this.srService.findById(id);
  }
}