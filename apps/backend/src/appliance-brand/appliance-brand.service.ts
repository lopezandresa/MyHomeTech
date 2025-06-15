import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplianceBrand } from './appliance-brand.entity';

/**
 * Servicio para la gestión de marcas de electrodomésticos
 *
 * @description Maneja las operaciones de consulta relacionadas con marcas:
 * - Listado de marcas activas
 * - Filtrado por tipo de electrodoméstico
 * - Relaciones con modelos disponibles
 *
 * @class ApplianceBrandService
 */
@Injectable()
export class ApplianceBrandService {
  /**
   * Constructor del servicio de marcas
   *
   * @param {Repository<ApplianceBrand>} applianceBrandRepo - Repositorio de marcas de electrodomésticos
   */
  constructor(
    @InjectRepository(ApplianceBrand)
    private readonly applianceBrandRepo: Repository<ApplianceBrand>,
  ) {}

  /**
   * Obtiene todas las marcas activas con sus relaciones
   *
   * @returns {Promise<ApplianceBrand[]>} Lista de marcas activas con tipo y modelos
   *
   * @description Incluye las relaciones con tipo de electrodoméstico y modelos disponibles
   *
   * @example
   * ```typescript
   * const brands = await applianceBrandService.findAll();
   * console.log('Marcas disponibles:', brands.length);
   * ```
   */
  findAll(): Promise<ApplianceBrand[]> {
    return this.applianceBrandRepo.find({
      where: { isActive: true },
      relations: ['type', 'models'],
    });
  }

  /**
   * Obtiene marcas filtradas por tipo de electrodoméstico
   *
   * @param {number} typeId - ID del tipo de electrodoméstico
   * @returns {Promise<ApplianceBrand[]>} Lista de marcas para el tipo especificado
   *
   * @description Solo incluye marcas activas e incluye los modelos disponibles
   *
   * @example
   * ```typescript
   * const refrigeratorBrands = await applianceBrandService.findByTypeId(1);
   * console.log('Marcas de refrigeradores:', refrigeratorBrands.map(b => b.name));
   * ```
   */
  findByTypeId(typeId: number): Promise<ApplianceBrand[]> {
    return this.applianceBrandRepo.find({
      where: { typeId, isActive: true },
      relations: ['models'],
    });
  }
}
