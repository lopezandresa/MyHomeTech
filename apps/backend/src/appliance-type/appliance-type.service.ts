import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplianceType } from './appliance-type.entity';

/**
 * Servicio para la gestión de tipos de electrodomésticos
 *
 * @description Maneja las operaciones relacionadas con tipos de electrodomésticos:
 * - Listado de tipos activos
 * - Búsqueda por ID
 * - Creación de nuevos tipos
 * - Relaciones con marcas disponibles
 *
 * @class ApplianceTypeService
 */
@Injectable()
export class ApplianceTypeService {
  /**
   * Constructor del servicio de tipos de electrodomésticos
   *
   * @param {Repository<ApplianceType>} applianceTypeRepo - Repositorio de tipos de electrodomésticos
   */
  constructor(
    @InjectRepository(ApplianceType)
    private readonly applianceTypeRepo: Repository<ApplianceType>,
  ) {}

  /**
   * Obtiene todos los tipos de electrodomésticos activos
   *
   * @returns {Promise<ApplianceType[]>} Lista de tipos activos con sus marcas
   *
   * @description Incluye la relación con las marcas disponibles para cada tipo
   *
   * @example
   * ```typescript
   * const types = await applianceTypeService.findAll();
   * console.log('Tipos disponibles:', types.map(t => t.name));
   * ```
   */
  findAll(): Promise<ApplianceType[]> {
    return this.applianceTypeRepo.find({
      where: { isActive: true },
      relations: ['brands'],
    });
  }

  /**
   * Busca un tipo de electrodoméstico por ID
   *
   * @param {number} id - ID del tipo de electrodoméstico
   * @returns {Promise<ApplianceType | null>} Tipo encontrado o null
   *
   * @description Solo busca entre tipos activos e incluye las marcas disponibles
   *
   * @example
   * ```typescript
   * const refrigeratorType = await applianceTypeService.findById(1);
   * if (refrigeratorType) {
   *   console.log('Marcas disponibles:', refrigeratorType.brands.length);
   * }
   * ```
   */
  findById(id: number): Promise<ApplianceType | null> {
    return this.applianceTypeRepo.findOne({
      where: { id, isActive: true },
      relations: ['brands'],
    });
  }

  /**
   * Crea un nuevo tipo de electrodoméstico
   *
   * @param {string} name - Nombre del tipo
   * @param {string} [description] - Descripción opcional del tipo
   * @returns {Promise<ApplianceType>} Tipo creado
   *
   * @description Crea un nuevo tipo de electrodoméstico con estado activo por defecto
   *
   * @example
   * ```typescript
   * const newType = await applianceTypeService.create(
   *   'Lavadora',
   *   'Electrodoméstico para lavar ropa'
   * );
   * console.log('Tipo creado:', newType.name);
   * ```
   */
  async create(name: string, description?: string): Promise<ApplianceType> {
    const type = this.applianceTypeRepo.create({
      name,
      description,
    });
    return this.applianceTypeRepo.save(type);
  }
}
