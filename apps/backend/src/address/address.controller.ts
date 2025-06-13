import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { Address } from './address.entity';

@ApiTags('addresses')
@Controller('addresses')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post()
  @ApiOperation({ summary: 'Crear nueva dirección para el usuario autenticado' })
  create(@Request() req, @Body() createAddressDto: CreateAddressDto): Promise<Address> {
    return this.addressService.create(req.user.id, createAddressDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las direcciones del usuario autenticado' })
  findAll(@Request() req): Promise<Address[]> {
    return this.addressService.findByUser(req.user.id);
  }

  @Get('primary')
  @ApiOperation({ summary: 'Obtener la dirección principal del usuario autenticado' })
  getPrimary(@Request() req): Promise<Address | null> {
    return this.addressService.getPrimaryAddress(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una dirección específica del usuario autenticado' })
  findOne(@Param('id') id: string, @Request() req): Promise<Address> {
    return this.addressService.findOne(+id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una dirección del usuario autenticado' })
  update(@Param('id') id: string, @Request() req, @Body() updateAddressDto: UpdateAddressDto): Promise<Address> {
    return this.addressService.update(+id, req.user.id, updateAddressDto);
  }

  @Post(':id/set-primary')
  @ApiOperation({ summary: 'Establecer una dirección como principal' })
  async setPrimary(@Param('id') id: string, @Request() req): Promise<{ message: string }> {
    await this.addressService.setPrimaryAddress(req.user.id, +id);
    return { message: 'Dirección principal actualizada correctamente' };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una dirección del usuario autenticado' })
  async remove(@Param('id') id: string, @Request() req): Promise<{ message: string }> {
    await this.addressService.remove(+id, req.user.id);
    return { message: 'Dirección eliminada correctamente' };
  }
}