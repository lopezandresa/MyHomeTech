import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Identity } from './identity.entity';
import { CreateIdentityDto } from './dto/create-identity.dto';

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

  findByEmail(email: string): Promise<Identity | null> {
    return this.repo.findOne({ where: { email } });
  }

  async findAll(): Promise<Omit<Identity,'password'>[]> {
    const users = await this.repo.find();
    return users.map(({ password, ...rest }) => rest);
  }

  async findById(id: number): Promise<Omit<Identity,'password'>> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User with id ${id} not found`);
    const { password, ...rest } = user;
    return rest;
  }
}