import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ApplianceModelService } from './appliance-model.service';
import { ApplianceModel } from './appliance-model.entity';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';

@ApiTags('appliance-models')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('appliance-models')
export class ApplianceModelController {
  constructor(private readonly applianceModelService: ApplianceModelService) {}

  @Get()
  @ApiOperation({ summary: 'Lista todos los modelos de electrodomésticos' })
  findAll(): Promise<ApplianceModel[]> {
    return this.applianceModelService.findAll();
  }

  @Get('by-brand/:brandId')
  @ApiOperation({ summary: 'Obtiene modelos por marca' })
  findByBrandId(@Param('brandId') brandId: number): Promise<ApplianceModel[]> {
    return this.applianceModelService.findByBrandId(brandId);
  }
}
