import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Identity } from './identity.entity';
import * as bcrypt from 'bcrypt';
import { CreateIdentityDto } from './dto/create-identity.dto';

@Injectable()
export class IdentityService {
  constructor(
    @InjectRepository(Identity)
    private readonly repo: Repository<Identity>,
  ) {}

  async create(dto: CreateIdentityDto): Promise<Identity> {
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(dto.password, salt);
    const identity = this.repo.create({ ...dto, password: hash });
    return this.repo.save(identity);
  }

  async findByEmail(email: string): Promise<Identity | null> {
    return this.repo.findOne({ where: { email } });
  }

  async findAll(): Promise<Identity[]> {
    return this.repo.find();
  }

  async findById(id: number): Promise<Identity | null> {
    return this.repo.findOne({ where: { id } });
  }
}