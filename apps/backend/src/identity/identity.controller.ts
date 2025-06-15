import { Controller, Post, Body, UseGuards, Get, Request, Param, UseInterceptors, UploadedFile, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { IdentityService } from './identity.service';
import { CreateIdentityDto } from './dto/create-identity.dto';
import { Identity } from './identity.entity';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from '../common/roles.decorator';
import { UpdateIdentityDto } from './dto/update-identity.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

export type IdentityResponse = Omit<Identity, 'password'>;

/**
 * Controlador para la gestión de identidades de usuario
 * 
 * @description Maneja todos los endpoints relacionados con usuarios:
 * registro, perfil, cambio de contraseña, gestión de fotos, etc.
 * 
 * @class IdentityController
 */
@ApiTags('identity')
@Controller('identity')
export class IdentityController {
  /**
   * Constructor del controlador de identidad
   * 
   * @param {IdentityService} svc - Servicio de identidad
   */
  constructor(private readonly svc: IdentityService) {}

  /**
   * Registra un nuevo usuario en el sistema
   * 
   * @param {CreateIdentityDto} dto - Datos del usuario a registrar
   * @returns {Promise<IdentityResponse>} Usuario registrado sin contraseña
   * 
   * @example
   * POST /api/identity/register
   * Body: { email: "user@example.com", password: "pass123", role: "client" }
   */
  @Post('register')
  @ApiOperation({ summary: 'Registra un nuevo usuario' })
  async register(
    @Body() dto: CreateIdentityDto
  ): Promise<IdentityResponse> {
    return this.svc.register(dto);
  }

  /**
   * Obtiene los datos del usuario autenticado
   * 
   * @param {Request} req - Request con usuario autenticado
   * @returns {IdentityResponse} Datos del usuario sin contraseña
   * 
   * @example
   * GET /api/identity/me
   * Headers: { Authorization: "Bearer <token>" }
   */
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @Get('me')
  @ApiOperation({ summary: 'Obtiene datos del usuario autenticado' })
  me(@Request() req): IdentityResponse {
    return req.user;
  }

  /**
   * Actualiza los datos del usuario autenticado
   * 
   * @param {Request} req - Request con usuario autenticado
   * @param {UpdateIdentityDto} dto - Datos a actualizar
   * @returns {Promise<IdentityResponse>} Usuario actualizado
   * 
   * @example
   * POST /api/identity/me/update
   * Body: { fullName: "Nuevo Nombre" }
   */
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @Post('me/update')
  @ApiOperation({ summary: 'Actualiza los datos del usuario autenticado' })
  async updateMe(@Request() req, @Body() dto: UpdateIdentityDto): Promise<IdentityResponse> {
    return this.svc.updateUser(req.user.id, dto);
  }

  /**
   * Lista todos los usuarios del sistema (solo admin)
   * 
   * @returns {Promise<IdentityResponse[]>} Lista de usuarios
   * 
   * @example
   * GET /api/identity
   * Headers: { Authorization: "Bearer <admin_token>" }
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT')
  @Roles('admin')
  @Get()
  @ApiOperation({ summary: 'Lista todos los usuarios' })
  findAll(): Promise<IdentityResponse[]> {
    return this.svc.findAll();
  }

  /**
   * Obtiene un usuario específico por ID (solo admin)
   * 
   * @param {number} id - ID del usuario
   * @returns {Promise<IdentityResponse | null>} Usuario encontrado
   * 
   * @example
   * GET /api/identity/123
   * Headers: { Authorization: "Bearer <admin_token>" }
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT')
  @Roles('admin')
  @Get(':id')
  @ApiOperation({ summary: 'Obtiene un usuario por ID' })
  findById(@Param('id') id: number): Promise<IdentityResponse | null> {
    return this.svc.findById(id);
  }

  /**
   * Actualiza un usuario específico por ID (solo admin)
   * 
   * @param {number} id - ID del usuario a actualizar
   * @param {UpdateIdentityDto} dto - Datos a actualizar
   * @returns {Promise<IdentityResponse>} Usuario actualizado
   * 
   * @example
   * PATCH /api/identity/123
   * Headers: { Authorization: "Bearer <admin_token>" }
   * Body: { firstName: "Nuevo Nombre" }
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT')
  @Roles('admin')
  @Patch(':id')
  @ApiOperation({ summary: 'Actualiza un usuario por ID (solo admin)' })
  async updateUser(@Param('id') id: number, @Body() dto: UpdateIdentityDto): Promise<IdentityResponse> {
    return this.svc.updateUser(id, dto);
  }

  /**
   * Alterna el estado activo/inactivo de un usuario (solo admin)
   * 
   * @param {number} id - ID del usuario
   * @returns {Promise<IdentityResponse>} Usuario con estado actualizado
   * 
   * @example
   * POST /api/identity/123/toggle-status
   * Headers: { Authorization: "Bearer <admin_token>" }
   */  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT')
  @Roles('admin')
  @Post(':id/toggle-status')
  @ApiOperation({ summary: 'Activa o inactiva un usuario por ID' })
  async toggleStatus(
    @Param('id') id: number,
    @Request() req: any
  ): Promise<IdentityResponse> {
    return this.svc.toggleStatus(id, req.user.id);
  }

  /**
   * Cambia la contraseña del usuario autenticado
   * 
   * @param {Request} req - Request con usuario autenticado
   * @param {ChangePasswordDto} dto - Contraseña actual y nueva
   * @returns {Promise<{message: string}>} Mensaje de confirmación
   * 
   * @example
   * POST /api/identity/change-password
   * Body: { currentPassword: "old", newPassword: "new" }
   */
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

  /**
   * Sube una foto de perfil para el usuario autenticado
   * 
   * @param {Request} req - Request con usuario autenticado
   * @param {Express.Multer.File} profilePhoto - Archivo de imagen
   * @returns {Promise<IdentityResponse>} Usuario con foto actualizada
   * 
   * @example
   * POST /api/identity/me/upload-profile-photo
   * Content-Type: multipart/form-data
   * Body: profilePhoto (file)
   */
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @Post('me/upload-profile-photo')
  @UseInterceptors(FileInterceptor('profilePhoto', {
    storage: memoryStorage(),
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
    return this.svc.updateProfilePhoto(req.user.id, profilePhoto);
  }

  /**
   * Verifica si un email ya está registrado en el sistema
   * 
   * @param {object} dto - Objeto con el email a verificar
   * @returns {Promise<void>} Void si está disponible, error si ya existe
   * 
   * @example
   * POST /api/identity/check-email
   * Body: { email: "test@example.com" }
   */  @Post('check-email')
  @ApiOperation({ summary: 'Verifica si un correo electrónico ya está registrado' })
  async checkEmail(@Body() dto: { email: string }): Promise<void> {
    await this.svc.checkEmail(dto.email);
    return;
  }

  /**
   * Crea un nuevo administrador (solo para administradores existentes)
   * 
   * @param {CreateIdentityDto} dto - Datos del administrador a crear
   * @returns {Promise<IdentityResponse>} Administrador creado sin contraseña
   * 
   * @example
   * POST /api/identity/admin
   * Body: { email: "admin@example.com", password: "pass123", firstName: "Admin", firstLastName: "User" }
   */
  @Post('admin')
  @ApiOperation({ summary: 'Crea un nuevo administrador' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async createAdmin(
    @Body() dto: CreateIdentityDto
  ): Promise<IdentityResponse> {
    // Forzar el rol a admin para seguridad
    const adminDto = { ...dto, role: 'admin' as const };
    return this.svc.register(adminDto);
  }
}
