import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplianceModel } from './appliance-model.entity';

/**
 * Servicio para la gestión de modelos de electrodomésticos
 *
 * @description Maneja las operaciones relacionadas con modelos específicos:
 * - Listado de modelos activos
 * - Filtrado por marca
 * - Relaciones con marca y tipo
 *
 * @class ApplianceModelService
 */
@Injectable()
export class ApplianceModelService {
  /**
   * Constructor del servicio de modelos
   *
   * @param {Repository<ApplianceModel>} applianceModelRepo - Repositorio de modelos de electrodomésticos
   */
  constructor(
    @InjectRepository(ApplianceModel)
    private readonly applianceModelRepo: Repository<ApplianceModel>,
  ) {}

  /**
   * Obtiene todos los modelos activos con sus relaciones
   *
   * @returns {Promise<ApplianceModel[]>} Lista de modelos activos con marca y tipo
   *
   * @description Incluye las relaciones con marca y el tipo de la marca
   *
   * @example
   * ```typescript
   * const models = await applianceModelService.findAll();
   * console.log('Modelos disponibles:', models.length);
   * ```
   */
  findAll(): Promise<ApplianceModel[]> {
    return this.applianceModelRepo.find({
      where: { isActive: true },
      relations: ['brand', 'brand.type'],
    });
  }

  /**
   * Obtiene modelos filtrados por marca específica
   *
   * @param {number} brandId - ID de la marca
   * @returns {Promise<ApplianceModel[]>} Lista de modelos para la marca especificada
   *
   * @description Solo incluye modelos activos e incluye la información de la marca
   *
   * @example
   * ```typescript
   * const samsungModels = await applianceModelService.findByBrandId(5);
   * console.log('Modelos Samsung:', samsungModels.map(m => m.name));
   * ```
   */
  findByBrandId(brandId: number): Promise<ApplianceModel[]> {
    return this.applianceModelRepo.find({
      where: { brandId, isActive: true },
      relations: ['brand'],
    });
  }
}
