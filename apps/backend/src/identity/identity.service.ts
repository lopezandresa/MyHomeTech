import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Identity } from './identity.entity';
import { CreateIdentityDto } from './dto/create-identity.dto';
import { UpdateIdentityDto } from './dto/update-identity.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CloudinaryService } from '../common/cloudinary.service';

/**
 * Servicio para la gestión de identidades de usuario
 * 
 * @description Maneja todas las operaciones CRUD relacionadas con usuarios,
 * incluyendo registro, autenticación, gestión de perfiles y fotos.
 * 
 * @class IdentityService
 */
@Injectable()
export class IdentityService {
  /**
   * Constructor del servicio de identidad
   * 
   * @param {Repository<Identity>} repo - Repositorio de la entidad Identity
   * @param {CloudinaryService} cloudinaryService - Servicio para gestión de imágenes
   */
  constructor(
    @InjectRepository(Identity)
    private readonly repo: Repository<Identity>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  /**
   * Registra un nuevo usuario en el sistema
   * 
   * @param {CreateIdentityDto} dto - Datos del usuario a registrar
   * @returns {Promise<Omit<Identity,'password'>>} Usuario registrado sin contraseña
   * @throws {ConflictException} Si el email ya existe
   * 
   * @example
   * ```typescript
   * const newUser = await identityService.register({
   *   email: 'user@example.com',
   *   password: 'password123',
   *   role: 'client'
   * });
   * ```
   */
  async register(dto: CreateIdentityDto): Promise<Omit<Identity,'password'>> {

    const existing = await this.repo.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('This email already exists');
    }

    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(dto.password, salt);
    const identity = this.repo.create({ ...dto, password: hash });
    const saved = await this.repo.save(identity);
    
    return this.excludePassword(saved);
  }

  /**
   * Busca un usuario por email (incluye contraseña)
   * 
   * @param {string} email - Email del usuario
   * @returns {Promise<Identity>} Usuario encontrado con contraseña
   * @throws {NotFoundException} Si el usuario no existe
   * 
   * @example
   * ```typescript
   * const user = await identityService.findByEmail('user@example.com');
   * ```
   */
  async findByEmail(email: string): Promise<Identity> {
    if (!email) throw new NotFoundException(`User email was not specified`);
    const user = await this.repo.findOne({ 
      where: { email },
      relations: ['addresses', 'primaryAddress']
    });
    if (!user) throw new NotFoundException(`User with email ${email} not found`);
    return user;
  }

  /**
   * Busca un usuario por email sin incluir la contraseña
   * 
   * @param {string} email - Email del usuario
   * @returns {Promise<Omit<Identity,'password'>>} Usuario sin contraseña
   * @throws {NotFoundException} Si el usuario no existe
   */
  async findByEmailNoPass(email: string): Promise<Omit<Identity,'password'>>{
    const user = await this.findByEmail(email);
    return this.excludePassword(user);
  }

  /**
   * Obtiene todos los usuarios del sistema
   * 
   * @returns {Promise<Omit<Identity,'password'>[]>} Lista de usuarios sin contraseñas
   * 
   * @example
   * ```typescript
   * const users = await identityService.findAll();
   * ```
   */
  async findAll(): Promise<Omit<Identity,'password'>[]> {
    const users = await this.repo.find({
      relations: ['addresses', 'primaryAddress']
    });
    return users.map(user => this.excludePassword(user));
  }

  /**
   * Busca un usuario por ID
   * 
   * @param {number} id - ID del usuario
   * @returns {Promise<Omit<Identity,'password'>>} Usuario sin contraseña
   * @throws {NotFoundException} Si el usuario no existe
   * 
   * @example
   * ```typescript
   * const user = await identityService.findById(1);
   * ```
   */
  async findById(id: number): Promise<Omit<Identity,'password'>> {
    if (!id) throw new NotFoundException(`User id was not specified`);
    const user = await this.repo.findOne({ 
      where: { id },
      relations: ['addresses', 'primaryAddress']
    });
    if (!user) throw new NotFoundException(`User with id ${id} not found`);
    return this.excludePassword(user);
  }

  /**
   * Actualiza los datos de un usuario
   * 
   * @param {number} id - ID del usuario
   * @param {UpdateIdentityDto} dto - Datos a actualizar
   * @returns {Promise<Omit<Identity, 'password'>>} Usuario actualizado
   * @throws {NotFoundException} Si el usuario no existe
   * 
   * @example
   * ```typescript
   * const updatedUser = await identityService.updateUser(1, {
   *   fullName: 'Nuevo Nombre'
   * });
   * ```
   */
  async updateUser(id: number, dto: UpdateIdentityDto): Promise<Omit<Identity, 'password'>> {
    const user = await this.repo.findOne({ 
      where: { id },
      relations: ['addresses', 'primaryAddress']
    });
    if (!user) throw new NotFoundException('User not found');
    if (dto.password) {
      const salt = await bcrypt.genSalt();
      dto.password = await bcrypt.hash(dto.password, salt);
    }
    Object.assign(user, dto);
    const saved = await this.repo.save(user);
    return this.excludePassword(saved);
  }

  /**
   * Alterna el estado activo/inactivo de un usuario
   * 
   * @param {number} id - ID del usuario
   * @returns {Promise<Omit<Identity, 'password'>>} Usuario con estado actualizado
   * @throws {NotFoundException} Si el usuario no existe
   * 
   * @example
   * ```typescript
   * const user = await identityService.toggleStatus(1);
   * ```
   */
  async toggleStatus(id: number): Promise<Omit<Identity, 'password'>> {
    const user = await this.repo.findOne({ 
      where: { id },
      relations: ['addresses', 'primaryAddress']
    });
    if (!user) throw new NotFoundException('User not found');
    user.status = !user.status;
    const saved = await this.repo.save(user);
    return this.excludePassword(saved);
  }

  /**
   * Cambia la contraseña de un usuario
   * 
   * @param {number} userId - ID del usuario
   * @param {ChangePasswordDto} dto - Contraseña actual y nueva
   * @returns {Promise<{message: string}>} Mensaje de confirmación
   * @throws {NotFoundException} Si el usuario no existe
   * @throws {BadRequestException} Si la contraseña actual es incorrecta
   * 
   * @example
   * ```typescript
   * const result = await identityService.changePassword(1, {
   *   currentPassword: 'oldPass',
   *   newPassword: 'newPass'
   * });
   * ```
   */
  async changePassword(userId: number, dto: ChangePasswordDto): Promise<{ message: string }> {
    const user = await this.repo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    // Verificar contraseña actual
    const isCurrentPasswordValid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('La contraseña actual no es correcta');
    }

    // Hash de la nueva contraseña
    const salt = await bcrypt.genSalt();
    const newPasswordHash = await bcrypt.hash(dto.newPassword, salt);

    // Actualizar contraseña
    user.password = newPasswordHash;
    await this.repo.save(user);

    return { message: 'Contraseña actualizada exitosamente' };
  }

  /**
   * Actualiza la foto de perfil de un usuario
   * 
   * @param {number} userId - ID del usuario
   * @param {Express.Multer.File} file - Archivo de imagen
   * @returns {Promise<Omit<Identity, 'password'>>} Usuario con foto actualizada
   * @throws {NotFoundException} Si el usuario no existe
   * 
   * @example
   * ```typescript
   * const user = await identityService.updateProfilePhoto(1, profileFile);
   * ```
   */
  async updateProfilePhoto(userId: number, file: Express.Multer.File): Promise<Omit<Identity, 'password'>> {
    const user = await this.repo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    // Si ya tiene una foto, eliminar la anterior de Cloudinary
    if (user.profilePhotoPublicId) {
      await this.cloudinaryService.deleteImage(user.profilePhotoPublicId);
    }

    // Subir nueva foto a Cloudinary
    const uploadResult = await this.cloudinaryService.uploadImage(
      file, 
      'profile-photos', 
      `user_${userId}_profile`
    );

    user.profilePhotoUrl = uploadResult.url;
    user.profilePhotoPublicId = uploadResult.publicId;
    
    const saved = await this.repo.save(user);
    return this.excludePassword(saved);
  }

  /**
   * Obtiene URL optimizada de la foto de perfil
   * 
   * @param {number} userId - ID del usuario
   * @param {object} options - Opciones de optimización (ancho, alto)
   * @returns {Promise<string | null>} URL optimizada o null si no tiene foto
   * 
   * @example
   * ```typescript
   * const photoUrl = await identityService.getOptimizedProfilePhotoUrl(1, {
   *   width: 150,
   *   height: 150
   * });
   * ```
   */
  async getOptimizedProfilePhotoUrl(userId: number, options?: {
    width?: number;
    height?: number;
  }): Promise<string | null> {
    const user = await this.repo.findOne({ where: { id: userId } });
    if (!user || !user.profilePhotoPublicId) return null;

    return this.cloudinaryService.generateOptimizedUrl(user.profilePhotoPublicId, options);
  }

  /**
   * Verifica si un email ya está registrado
   * 
   * @param {string} email - Email a verificar
   * @returns {Promise<void>} Void si el email está disponible
   * @throws {ConflictException} Si el email ya está registrado
   * 
   * @example
   * ```typescript
   * await identityService.checkEmail('new@example.com');
   * ```
   */
  async checkEmail(email: string): Promise<void> {
    const existing = await this.repo.findOne({ where: { email } });
    if (existing) {
      throw new ConflictException('Este correo electrónico ya está registrado');
    }
    return;
  }

  /**
   * Excluye la contraseña de un objeto Identity
   * 
   * @private
   * @param {Identity} user - Usuario con contraseña
   * @returns {Omit<Identity, 'password'>} Usuario sin contraseña
   */
  private excludePassword(user: Identity): Omit<Identity, 'password'> {
    const { password, ...rest } = user;
    return {
      ...rest,
      fullName: user.fullName,
      displayName: user.displayName
    };
  }
}