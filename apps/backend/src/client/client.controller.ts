import {
  Controller, Post, Body, Get, Put,
  Param, UseGuards, Request
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiBearerAuth
} from '@nestjs/swagger';
import { ClientService } from './client.service';
import { CreateClientProfileDto } from './dto/create-client-profile.dto';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { Client } from './client.entity';

@ApiTags('clients')
@Controller('clients')
export class ClientController {
  constructor(private readonly svc: ClientService) {}
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer-jwt')
  @Post('profile')
  @ApiOperation({ summary: 'Completa o actualiza perfil de cliente' })
  createProfile(
    @Body() dto: CreateClientProfileDto,
    @Request() req,
  ): Promise<Client> {
    dto.identityId = req.user.id;
    return this.svc.createProfile(dto);
  }

  @Post('create-profile')
  @ApiOperation({ summary: 'Crea perfil de cliente durante registro (sin autenticación)' })
  createProfileDuringRegistration(
    @Body() dto: CreateClientProfileDto,
  ): Promise<Client> {
    return this.svc.createProfile(dto);
  }
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer-jwt')
  @Get('me')
  @ApiOperation({ summary: 'Obtener perfil del cliente actual' })
  getMyProfile(@Request() req): Promise<Client | null> {
    return this.svc.findByIdentityId(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer-jwt')
  @Put('me')
  @ApiOperation({ summary: 'Actualizar perfil del cliente actual' })
  async updateMyProfile(
    @Body() updateData: Partial<CreateClientProfileDto>,
    @Request() req,
  ): Promise<Client> {
    const profileData: Partial<Client> = {};
    
    if (updateData.fullName) profileData.fullName = updateData.fullName;
    if (updateData.cedula) profileData.cedula = updateData.cedula;
    if (updateData.birthDate) profileData.birthDate = new Date(updateData.birthDate);
    if (updateData.phone) profileData.phone = updateData.phone;

    return this.svc.updateProfileByIdentityId(req.user.id, profileData);
  }

  @Get()
  @ApiOperation({ summary: 'Listado de clientes' })
  findAll(): Promise<Client[]> {
    return this.svc.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de un cliente' })
  findById(
    @Param('id') id: number
  ): Promise<Client | null> {
    return this.svc.findById(id);
  }
}