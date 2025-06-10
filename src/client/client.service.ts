import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './client.entity';
import { CreateClientProfileDto } from './dto/create-client-profile.dto';

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepo: Repository<Client>,
  ) {}

  async createProfile(dto: CreateClientProfileDto): Promise<Client> {
    const client = this.clientRepo.create({
      identityId: dto.identityId,
      fullName: dto.fullName,
      cedula: dto.cedula,
      birthDate: new Date(dto.birthDate),
      phone: dto.phone,
    });
    return this.clientRepo.save(client);
  }

  findAll(): Promise<Client[]> {
    return this.clientRepo.find();
  }

  findById(id: number): Promise<Client | null> {
    return this.clientRepo.findOne({ where: { id } });
  }
}