import { Controller, Get, Post, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ApplianceService } from './appliance.service';
import { CreateApplianceDto } from './dto/create-appliance.dto';
import { Appliance } from './appliance.entity';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { Roles } from 'src/common/roles.decorator';
import { UpdateApplianceDto } from './dto/update-appliance.dto';

@ApiTags('appliances')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('appliances')
export class ApplianceController {
  constructor(private readonly svc: ApplianceService) {}

  @Roles('admin')
  @Post('create')
  @ApiOperation({ summary: 'Crea un electrodoméstico' })
  create(@Body() dto: CreateApplianceDto): Promise<Appliance> {
    return this.svc.create(dto);
  }

  @Roles('admin')
  @ApiOperation({ summary: 'Actualiza un electrodoméstico existente' })
  @Post('update/:id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateApplianceDto
  ): Promise<Appliance> {
    return this.svc.update(id, dto);
  }

  @Roles('admin')
  @ApiOperation({ summary: 'Elimina un electrodoméstico por ID' })
  @Post('delete/:id')
  async remove(
    @Param('id', ParseIntPipe) id: number
  ): Promise<void> {
    return this.svc.remove(id);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos los electrodomésticos' })
  findAll(): Promise<Appliance[]> {
    return this.svc.findAll();
  }

  @ApiOperation({ summary: 'Obtiene un electrodoméstico por ID' })
  @Get(':id')
  async findById(@Param('id') id: number): Promise<Appliance | null> {
    return this.svc.findById(id);
  }

  @ApiOperation({ summary: 'Obtiene un electrodoméstico por nombre (contains)' })
  @Get('search/:name')
  async findByName(@Param('name') name: string): Promise<Appliance[]> {
    return this.svc.findByName(name);
  }

  
}