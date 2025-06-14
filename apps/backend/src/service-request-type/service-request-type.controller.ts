import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ServiceRequestTypeService } from './service-request-type.service';
import { ServiceRequestType } from './service-request-type.entity';

@ApiTags('service-request-types')
@Controller('service-request-types')
export class ServiceRequestTypeController {
  constructor(
    private readonly serviceRequestTypeService: ServiceRequestTypeService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all active service request types' })
  @ApiResponse({
    status: 200,
    description: 'List of active service request types',
    type: [ServiceRequestType],
  })
  async findAll(): Promise<ServiceRequestType[]> {
    return this.serviceRequestTypeService.findAll();
  }
}