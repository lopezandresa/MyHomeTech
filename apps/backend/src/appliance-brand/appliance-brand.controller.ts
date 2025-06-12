import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ApplianceBrandService } from './appliance-brand.service';
import { ApplianceBrand } from './appliance-brand.entity';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';

@ApiTags('appliance-brands')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('appliance-brands')
export class ApplianceBrandController {
  constructor(private readonly applianceBrandService: ApplianceBrandService) {}

  @Get()
  @ApiOperation({ summary: 'Lista todas las marcas de electrodomésticos' })
  findAll(): Promise<ApplianceBrand[]> {
    return this.applianceBrandService.findAll();
  }

  @Get('by-type/:typeId')
  @ApiOperation({ summary: 'Obtiene marcas por tipo de electrodoméstico' })
  findByTypeId(@Param('typeId') typeId: number): Promise<ApplianceBrand[]> {
    return this.applianceBrandService.findByTypeId(typeId);
  }
}
