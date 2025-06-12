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
    // Generar nombre completo si no se proporciona
    const name = dto.name || `${dto.type} ${dto.brand} ${dto.model}`;
    const appliance = this.repo.create({
      ...dto,
      name,
    });
    return this.repo.save(appliance);
  }

  findAll() {
    return this.repo.find({ where: { isActive: true } });
  }

  // Obtener tipos únicos de electrodomésticos
  async getTypes(): Promise<string[]> {
    const result = await this.repo
      .createQueryBuilder('appliance')
      .select('DISTINCT appliance.type', 'type')
      .where('appliance.isActive = :isActive', { isActive: true })
      .getRawMany();
    
    return result.map(item => item.type);
  }

  // Obtener marcas por tipo
  async getBrandsByType(type: string): Promise<string[]> {
    const result = await this.repo
      .createQueryBuilder('appliance')
      .select('DISTINCT appliance.brand', 'brand')
      .where('appliance.type = :type AND appliance.isActive = :isActive', { type, isActive: true })
      .getRawMany();
    
    return result.map(item => item.brand);
  }

  // Obtener modelos por tipo y marca
  async getModelsByTypeAndBrand(type: string, brand: string): Promise<string[]> {
    const result = await this.repo
      .createQueryBuilder('appliance')
      .select('DISTINCT appliance.model', 'model')
      .where('appliance.type = :type AND appliance.brand = :brand AND appliance.isActive = :isActive', 
        { type, brand, isActive: true })
      .getRawMany();
    
    return result.map(item => item.model);
  }

  // Buscar electrodoméstico específico
  async findByTypeAndBrandAndModel(type: string, brand: string, model: string): Promise<Appliance | null> {
    return this.repo.findOne({
      where: { type, brand, model, isActive: true }
    });
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
      where: { name: ILike(`%${name}%`), isActive: true },
    });
  }
}