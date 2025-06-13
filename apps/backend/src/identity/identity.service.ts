import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Identity } from './identity.entity';
import { CreateIdentityDto } from './dto/create-identity.dto';
import { UpdateIdentityDto } from './dto/update-identity.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class IdentityService {
  constructor(
    @InjectRepository(Identity)
    private readonly repo: Repository<Identity>,
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
    const { password, ...rest } = saved;
    
    return rest;
  }

  async findByEmail(email: string): Promise<Identity> {
    if (!email) throw new NotFoundException(`User email was not specified`);
    const user = await this.repo.findOne({ where: { email } });
    if (!user) throw new NotFoundException(`User with email ${email} not found`);
    return user;
  }

  async findByEmailNoPass(email: string): Promise<Omit<Identity,'password'>>{
    const user = await this.findByEmail(email);
    const { password, ...rest } = user;
    return rest;
  }

  async findAll(): Promise<Omit<Identity,'password'>[]> {
    const users = await this.repo.find();
    return users.map(({ password, ...rest }) => rest);
  }

  async findById(id: number): Promise<Omit<Identity,'password'>> {
    if (!id) throw new NotFoundException(`User id was not specified`);
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User with id ${id} not found`);
    const { password, ...rest } = user;
    return rest;
  }

  async updateUser(id: number, dto: UpdateIdentityDto): Promise<Omit<Identity, 'password'>> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    if (dto.password) {
      const salt = await bcrypt.genSalt();
      dto.password = await bcrypt.hash(dto.password, salt);
    }    Object.assign(user, dto);
    const saved = await this.repo.save(user);
    const { password, ...rest } = saved;
    return rest;
  }

  async toggleStatus(id: number): Promise<Omit<Identity, 'password'>> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    user.status = !user.status;
    const saved = await this.repo.save(user);
    const { password, ...rest } = saved;
    return rest;
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

  async updateProfilePhoto(userId: number, photoPath: string): Promise<Omit<Identity, 'password'>> {
    const user = await this.repo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    user.profilePhotoPath = photoPath;
    const saved = await this.repo.save(user);
    const { password, ...rest } = saved;
    return rest;
  }
}