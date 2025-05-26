import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './client.entity';

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepo: Repository<Client>,
  ) {}

  create(data: Partial<Client>) {
    return this.clientRepo.save(data);
  }

  findAll() {
    return this.clientRepo.find();
  }

  findById(id: number) {
    return this.clientRepo.findOne({ where: { id } });
  }
}