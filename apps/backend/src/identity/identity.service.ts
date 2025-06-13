import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Identity } from './identity.entity';
import { CreateIdentityDto } from './dto/create-identity.dto';
import { UpdateIdentityDto } from './dto/update-identity.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CloudinaryService } from '../common/cloudinary.service';

@Injectable()
export class IdentityService {
  constructor(
    @InjectRepository(Identity)
    private readonly repo: Repository<Identity>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

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

  async findByEmail(email: string): Promise<Identity> {
    if (!email) throw new NotFoundException(`User email was not specified`);
    const user = await this.repo.findOne({ 
      where: { email },
      relations: ['addresses', 'primaryAddress']
    });
    if (!user) throw new NotFoundException(`User with email ${email} not found`);
    return user;
  }

  async findByEmailNoPass(email: string): Promise<Omit<Identity,'password'>>{
    const user = await this.findByEmail(email);
    return this.excludePassword(user);
  }

  async findAll(): Promise<Omit<Identity,'password'>[]> {
    const users = await this.repo.find({
      relations: ['addresses', 'primaryAddress']
    });
    return users.map(user => this.excludePassword(user));
  }

  async findById(id: number): Promise<Omit<Identity,'password'>> {
    if (!id) throw new NotFoundException(`User id was not specified`);
    const user = await this.repo.findOne({ 
      where: { id },
      relations: ['addresses', 'primaryAddress']
    });
    if (!user) throw new NotFoundException(`User with id ${id} not found`);
    return this.excludePassword(user);
  }

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

  async getOptimizedProfilePhotoUrl(userId: number, options?: {
    width?: number;
    height?: number;
  }): Promise<string | null> {
    const user = await this.repo.findOne({ where: { id: userId } });
    if (!user || !user.profilePhotoPublicId) return null;

    return this.cloudinaryService.generateOptimizedUrl(user.profilePhotoPublicId, options);
  }

  async checkEmail(email: string): Promise<void> {
    const existing = await this.repo.findOne({ where: { email } });
    if (existing) {
      throw new ConflictException('Este correo electrónico ya está registrado');
    }
    return;
  }

  private excludePassword(user: Identity): Omit<Identity, 'password'> {
    const { password, ...rest } = user;
    return {
      ...rest,
      fullName: user.fullName,
      displayName: user.displayName
    };
  }
}