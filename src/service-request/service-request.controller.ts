import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ServiceRequestService } from './service-request.service';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import { ServiceRequest } from './service-request.entity';

@ApiTags('service-requests')
@Controller('service-requests')
export class ServiceRequestController {
  constructor(private readonly srService: ServiceRequestService) {}

  @Post()
  @ApiOperation({ summary: 'Crea una nueva solicitud de servicio' })
  create(@Body() dto: CreateServiceRequestDto): Promise<ServiceRequest> {
    return this.srService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtiene todas las solicitudes de servicio' })
  findAll(): Promise<ServiceRequest[]> {
    return this.srService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtiene una solicitud por ID' })
  findById(@Param('id') id: number): Promise<ServiceRequest | null> {
    return this.srService.findById(id);
  }
}