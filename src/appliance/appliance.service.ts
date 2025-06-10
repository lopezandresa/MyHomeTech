import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Appliance } from './appliance.entity';
import { CreateApplianceDto } from './dto/create-appliance.dto';
import { UpdateApplianceDto } from './dto/update-appliance.dto';

@Injectable()
export class ApplianceService {
  constructor(
    @InjectRepository(Appliance)
    private readonly repo: Repository<Appliance>,
  ) {}

  create(dto: CreateApplianceDto) {
    const a = this.repo.create(dto);
    return this.repo.save(a);
  }

  findAll() {
    return this.repo.find();
  }

  async update(id: number, dto: UpdateApplianceDto): Promise<Appliance> {
    // preload carga la entidad con id + nuevos valores
    const appliance = await this.repo.preload({ id, ...dto });
    if (!appliance) {
      throw new NotFoundException(`Appliance with id ${id} not found`);
    }
    return this.repo.save(appliance);
  }

  async remove(id: number): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Appliance with id ${id} not found`);
    }
  }

  async findById(id: number): Promise<Appliance | null> {
    const appliance = await this.repo.findOne({ where: { id } });
    if (!appliance) throw new NotFoundException(`Appliance with id ${id} not found`);
    return appliance;
  }

  async findByName(name: string): Promise<Appliance[]> {
    // Busca coincidencias parciales (case-insensitive)
    return this.repo.find({
      where: { name: ILike(`%${name}%`) },
    });
  }
}