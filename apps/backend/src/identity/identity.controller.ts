import { Controller, Post, Body, UseGuards, Get, Request, Param, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { IdentityService } from './identity.service';
import { CreateIdentityDto } from './dto/create-identity.dto';
import { Identity } from './identity.entity';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from '../common/roles.decorator';
import { UpdateIdentityDto } from './dto/update-identity.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

export type IdentityResponse = Omit<Identity, 'password'>;

@ApiTags('identity')
@Controller('identity')
export class IdentityController {
  constructor(private readonly svc: IdentityService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registra un nuevo usuario' })
  async register(
    @Body() dto: CreateIdentityDto
  ): Promise<IdentityResponse> {
    return this.svc.register(dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @Get('me')
  @ApiOperation({ summary: 'Obtiene datos del usuario autenticado' })
  me(@Request() req): IdentityResponse {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @Post('me/update')
  @ApiOperation({ summary: 'Actualiza los datos del usuario autenticado' })
  async updateMe(@Request() req, @Body() dto: UpdateIdentityDto): Promise<IdentityResponse> {
    return this.svc.updateUser(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT')
  @Roles('admin')
  @Get()
  @ApiOperation({ summary: 'Lista todos los usuarios' })
  findAll(): Promise<IdentityResponse[]> {
    return this.svc.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT')
  @Roles('admin')
  @Get(':id')
  @ApiOperation({ summary: 'Obtiene un usuario por ID' })
  findById(@Param('id') id: number): Promise<IdentityResponse | null> {
    return this.svc.findById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT')
  @Roles('admin')
  @Post(':id/toggle-status')
  @ApiOperation({ summary: 'Activa o inactiva un usuario por ID' })
  async toggleStatus(@Param('id') id: number): Promise<IdentityResponse> {
    return this.svc.toggleStatus(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @Post('change-password')
  @ApiOperation({ summary: 'Cambiar contraseña del usuario autenticado' })
  async changePassword(
    @Request() req, 
    @Body() dto: ChangePasswordDto
  ): Promise<{ message: string }> {
    return this.svc.changePassword(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @Post('me/upload-profile-photo')
  @UseInterceptors(FileInterceptor('profilePhoto', {
    storage: diskStorage({
      destination: './uploads/profile-photos',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        callback(null, `profile-${uniqueSuffix}${extname(file.originalname)}`);
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
  @ApiOperation({ summary: 'Sube foto de perfil del usuario autenticado' })
  async uploadProfilePhoto(
    @Request() req,
    @UploadedFile() profilePhoto: Express.Multer.File
  ): Promise<IdentityResponse> {
    return this.svc.updateProfilePhoto(req.user.id, profilePhoto.path);
  }
}
