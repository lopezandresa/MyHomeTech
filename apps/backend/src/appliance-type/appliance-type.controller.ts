import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ApplianceTypeService } from './appliance-type.service';
import { ApplianceType } from './appliance-type.entity';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';

@ApiTags('appliance-types')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('appliance-types')
export class ApplianceTypeController {
  constructor(private readonly applianceTypeService: ApplianceTypeService) {}

  @Get()
  @ApiOperation({ summary: 'Lista todos los tipos de electrodomésticos' })
  findAll(): Promise<ApplianceType[]> {
    return this.applianceTypeService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtiene un tipo de electrodoméstico por ID' })
  findById(@Param('id') id: number): Promise<ApplianceType | null> {
    return this.applianceTypeService.findById(id);
  }
}
