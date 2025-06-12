import { Controller, Post, Body, Get, Put, Param, UseGuards, Request, Delete } from '@nestjs/common';
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer-jwt')
  @Get('me')
  @ApiOperation({ summary: 'Obtener perfil del técnico actual' })
  getMyProfile(@Request() req): Promise<Technician | null> {
    return this.svc.findByIdentityId(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer-jwt')
  @Put('me')
  @ApiOperation({ summary: 'Actualizar perfil del técnico actual' })
  async updateMyProfile(
    @Body() updateData: Partial<CreateTechnicianProfileDto>,
    @Request() req,
  ): Promise<Technician> {
    return this.svc.updateFullProfile(req.user.id, updateData);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer-jwt')
  @Post('me/specialties/:specialtyId')
  @ApiOperation({ summary: 'Agregar especialidad al técnico actual' })
  async addSpecialty(
    @Param('specialtyId') specialtyId: number,
    @Request() req,
  ): Promise<Technician> {
    const tech = await this.svc.findByIdentityId(req.user.id);
    if (!tech) throw new Error('Perfil de técnico no encontrado');
    return this.svc.addSpecialty(tech.id, specialtyId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer-jwt')
  @Delete('me/specialties/:specialtyId')
  @ApiOperation({ summary: 'Remover especialidad del técnico actual' })
  async removeSpecialty(
    @Param('specialtyId') specialtyId: number,
    @Request() req,
  ): Promise<Technician> {
    const tech = await this.svc.findByIdentityId(req.user.id);
    if (!tech) throw new Error('Perfil de técnico no encontrado');
    return this.svc.removeSpecialty(tech.id, specialtyId);
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