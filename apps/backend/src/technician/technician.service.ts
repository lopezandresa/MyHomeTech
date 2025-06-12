import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Technician } from './technician.entity';
import { In, Repository } from 'typeorm';
import { CreateTechnicianProfileDto } from './dto/create-technician-profile.dto';
import { Appliance } from '../appliance/appliance.entity';

@Injectable()
export class TechnicianService {
  constructor(
    @InjectRepository(Technician)
    private readonly techRepo: Repository<Technician>,
    @InjectRepository(Appliance)
    private readonly appRepo: Repository<Appliance>,
  ) {}

  async createProfile(dto: CreateTechnicianProfileDto): Promise<Technician> {
    // pre-carga las entidades de electrodomésticos
    const apps = await this.appRepo.find({
      where: { id: In(dto.appliances) }
    });
    const tech = this.techRepo.create({
      identityId: dto.identityId,
      cedula: dto.cedula,
      birthDate: new Date(dto.birthDate),
      experienceYears: dto.experienceYears,
      idPhotoUrl: dto.idPhotoUrl,
      appliances: apps,
    });
    return this.techRepo.save(tech);
  }

  findAll(): Promise<Technician[]> {
    return this.techRepo.find();
  }

  findById(id: number): Promise<Technician | null> {
    return this.techRepo.findOne({ where: { id } });
  }

  async updateProfileByIdentityId(identityId: number, profile: Partial<Technician>): Promise<Technician> {
    const tech = await this.techRepo.findOne({ where: { identityId } });
    if (!tech) throw new Error('Perfil de técnico no encontrado');
    Object.assign(tech, profile);
    return this.techRepo.save(tech);
  }
}