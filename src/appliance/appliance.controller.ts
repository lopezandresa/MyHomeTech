import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApplianceService } from './appliance.service';
import { CreateApplianceDto } from './dto/create-appliance.dto';
import { Appliance } from './appliance.entity';

@ApiTags('appliances')
@Controller('appliances')
export class ApplianceController {
  constructor(private readonly svc: ApplianceService) {}

  @Post()
  @ApiOperation({ summary: 'Crea un electrodoméstico' })
  create(@Body() dto: CreateApplianceDto): Promise<Appliance> {
    return this.svc.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos los electrodomésticos' })
  findAll(): Promise<Appliance[]> {
    return this.svc.findAll();
  }
}