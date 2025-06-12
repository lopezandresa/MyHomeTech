import {
  Controller, Post, Body, Get,
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