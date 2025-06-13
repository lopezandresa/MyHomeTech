import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Technician } from './technician.entity';
import { In, Repository } from 'typeorm';
import { CreateTechnicianProfileDto } from './dto/create-technician-profile.dto';
import { ApplianceType } from '../appliance-type/appliance-type.entity';

@Injectable()
export class TechnicianService {
  constructor(
    @InjectRepository(Technician)
    private readonly techRepo: Repository<Technician>,
    @InjectRepository(ApplianceType)
    private readonly appTypeRepo: Repository<ApplianceType>,
  ) {}

  async createProfile(dto: CreateTechnicianProfileDto): Promise<Technician> {
    // pre-carga las entidades de tipos de electrodomésticos
    const specialties = await this.appTypeRepo.find({
      where: { id: In(dto.specialties) }
    });
    const tech = this.techRepo.create({
      identityId: dto.identityId,
      cedula: dto.cedula,
      birthDate: new Date(dto.birthDate),
      experienceYears: dto.experienceYears,
      idPhotoPath: dto.idPhotoPath,
      specialties: specialties,
    });
    return this.techRepo.save(tech);
  }

  findAll(): Promise<Technician[]> {
    return this.techRepo.find({ relations: ['specialties'] });
  }
  
  findById(id: number): Promise<Technician | null> {
    return this.techRepo.findOne({ 
      where: { id },
      relations: ['specialties'] 
    });
  }

  findByIdentityId(identityId: number): Promise<Technician | null> {
    return this.techRepo.findOne({ 
      where: { identityId },
      relations: ['specialties']
    });
  }

  async updateProfileByIdentityId(identityId: number, profile: Partial<Technician>): Promise<Technician> {
    const tech = await this.techRepo.findOne({ where: { identityId } });
    if (!tech) throw new Error('Perfil de técnico no encontrado');
    Object.assign(tech, profile);
    return this.techRepo.save(tech);
  }

  async updateFullProfile(identityId: number, dto: Partial<CreateTechnicianProfileDto>): Promise<Technician> {
    const tech = await this.techRepo.findOne({ 
      where: { identityId },
      relations: ['specialties']
    });
    if (!tech) throw new NotFoundException('Perfil de técnico no encontrado');

    // Actualizar campos básicos
    if (dto.cedula) tech.cedula = dto.cedula;
    if (dto.birthDate) tech.birthDate = new Date(dto.birthDate);
    if (dto.experienceYears !== undefined) tech.experienceYears = dto.experienceYears;
    if (dto.idPhotoPath) tech.idPhotoPath = dto.idPhotoPath;

    // Actualizar especialidades si se proporcionan
    if (dto.specialties && dto.specialties.length > 0) {
      const specialties = await this.appTypeRepo.find({
        where: { id: In(dto.specialties) }
      });
      tech.specialties = specialties;
    }

    return this.techRepo.save(tech);
  }

  // Nuevo método para gestionar especialidades
  async addSpecialty(technicianId: number, specialtyId: number): Promise<Technician> {
    const tech = await this.techRepo.findOne({ 
      where: { id: technicianId },
      relations: ['specialties']
    });
    if (!tech) throw new NotFoundException('Técnico no encontrado');

    const specialty = await this.appTypeRepo.findOne({ where: { id: specialtyId } });
    if (!specialty) throw new NotFoundException('Tipo de electrodoméstico no encontrado');

    // Verificar si ya tiene esta especialidad
    const hasSpecialty = tech.specialties.some(s => s.id === specialtyId);
    if (!hasSpecialty) {
      tech.specialties.push(specialty);
      return this.techRepo.save(tech);
    }

    return tech;
  }

  async removeSpecialty(technicianId: number, specialtyId: number): Promise<Technician> {
    const tech = await this.techRepo.findOne({ 
      where: { id: technicianId },
      relations: ['specialties']
    });
    if (!tech) throw new NotFoundException('Técnico no encontrado');

    tech.specialties = tech.specialties.filter(s => s.id !== specialtyId);
    return this.techRepo.save(tech);
  }
}