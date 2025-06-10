import {
  Controller, Post, Body, Get, Param, UseGuards, Request
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TechnicianService } from './technician.service';
import { CreateTechnicianProfileDto } from './dto/create-technician-profile.dto';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { Technician } from './technician.entity';

@ApiTags('technicians')
@Controller('technicians')
export class TechnicianController {
  constructor(private readonly svc: TechnicianService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer-jwt')
  @Post('profile')
  @ApiOperation({ summary: 'Completa o actualiza perfil de técnico' })
  createProfile(
    @Body() dto: CreateTechnicianProfileDto,
    @Request() req,
  ): Promise<Technician> {
    // si quieres forzar identityId desde el token:
    // dto.identityId = req.user.id;
    return this.svc.createProfile(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listado de técnicos y sus especialidades' })
  findAll(): Promise<Technician[]> {
    return this.svc.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de un técnico' })
  findById(@Param('id') id: number): Promise<Technician | null> {
    return this.svc.findById(id);
  }
}