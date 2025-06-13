import { Controller, Post, Body, Get, Put, Param, UseGuards, Request, Delete, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
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
  @UseInterceptors(FileInterceptor('idPhoto', {
    storage: diskStorage({
      destination: './uploads/id-photos',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        callback(null, `id-photo-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
    fileFilter: (req, file, callback) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return callback(new Error('Solo se permiten archivos de imagen'), false);
      }
      callback(null, true);
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
  }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Completa o actualiza perfil de técnico con foto' })
  async createProfile(
    @Body() dto: CreateTechnicianProfileDto,
    @UploadedFile() idPhoto: Express.Multer.File,
    @Request() req,
  ): Promise<Technician> {
    // Convertir specialties de string a array de números
    if (typeof dto.specialties === 'string') {
      dto.specialties = JSON.parse(dto.specialties);
    }

    if (idPhoto) {
      dto.idPhotoPath = idPhoto.path;
    }

    dto.identityId = req.user.id;
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
  @UseInterceptors(FileInterceptor('idPhoto', {
    storage: diskStorage({
      destination: './uploads/id-photos',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        callback(null, `id-photo-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
    fileFilter: (req, file, callback) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return callback(new Error('Solo se permiten archivos de imagen'), false);
      }
      callback(null, true);
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
  }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Actualizar perfil del técnico actual' })
  async updateMyProfile(
    @Body() updateData: Partial<CreateTechnicianProfileDto>,
    @UploadedFile() idPhoto: Express.Multer.File,
    @Request() req,
  ): Promise<Technician> {
    // Convertir specialties de string a array de números si viene como string
    if (typeof updateData.specialties === 'string') {
      updateData.specialties = JSON.parse(updateData.specialties);
    }

    if (idPhoto) {
      updateData.idPhotoPath = idPhoto.path;
    }

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