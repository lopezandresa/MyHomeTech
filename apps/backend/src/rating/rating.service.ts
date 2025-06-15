import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from './rating.entity';
import { CreateRatingDto } from './dto/create-rating.dto';
import { ServiceRequest, ServiceRequestStatus } from '../service-request/service-request.entity';

/**
 * Servicio para la gestión del sistema de calificaciones
 *
 * @description Maneja todas las operaciones relacionadas con calificaciones:
 * - Creación de calificaciones para servicios completados
 * - Validación de que solo se califique una vez por servicio
 * - Consulta de calificaciones por usuario
 * - Sistema de reputación de técnicos
 *
 * @class RatingService
 */
@Injectable()
export class RatingService {
  /**
   * Constructor del servicio de calificaciones
   *
   * @param {Repository<Rating>} ratingRepo - Repositorio de calificaciones
   * @param {Repository<ServiceRequest>} srRepo - Repositorio de solicitudes de servicio
   */
  constructor(
    @InjectRepository(Rating)
    private readonly ratingRepo: Repository<Rating>,
    @InjectRepository(ServiceRequest)
    private readonly srRepo: Repository<ServiceRequest>,
  ) {}

  /**
   * Crea una nueva calificación para un servicio completado
   *
   * @param {CreateRatingDto} dto - Datos de la calificación a crear
   * @returns {Promise<Rating>} Calificación creada
   * @throws {Error} Si ya existe una calificación para la solicitud o el servicio no está completado
   *
   * @description Valida que:
   * - No exista ya una calificación para la solicitud
   * - La solicitud esté en estado COMPLETED
   * - Solo se permite una calificación por servicio
   *
   * @example
   * ```typescript
   * const rating = await ratingService.create({
   *   serviceRequestId: 456,
   *   raterId: 123,  // ID del cliente que califica
   *   ratedId: 789,  // ID del técnico calificado
   *   score: 5,      // Puntuación de 1 a 5
   *   comment: 'Excelente servicio, muy profesional'
   * });
   * ```
   */
  async create(dto: CreateRatingDto) {
    // Validar que no exista ya un rating para esta solicitud
    const exists = await this.ratingRepo.findOne({ where: { serviceRequestId: dto.serviceRequestId } });
    if (exists) {
      throw new Error('Ya existe una calificación para esta solicitud');
    }
    // Validar que la solicitud esté COMPLETED
    const sr = await this.srRepo.findOne({ where: { id: dto.serviceRequestId, status: ServiceRequestStatus.COMPLETED } });
    if (!sr) {
      throw new Error('Solo se puede calificar un servicio finalizado');
    }
    const r = this.ratingRepo.create(dto);
    return this.ratingRepo.save(r);
  }

  /**
   * Obtiene todas las calificaciones del sistema
   *
   * @returns {Promise<Rating[]>} Lista de todas las calificaciones
   *
   * @description Retorna todas las calificaciones para propósitos administrativos
   * o estadísticas generales del sistema
   *
   * @example
   * ```typescript
   * const allRatings = await ratingService.findAll();
   * const avgRating = allRatings.reduce((sum, r) => sum + r.score, 0) / allRatings.length;
   * console.log('Calificación promedio del sistema:', avgRating);
   * ```
   */
  findAll() {
    return this.ratingRepo.find();
  }

  /**
   * Obtiene todas las calificaciones recibidas por un usuario específico
   *
   * @param {number} id - ID del usuario calificado (generalmente un técnico)
   * @returns {Promise<Rating[]>} Lista de calificaciones recibidas por el usuario
   *
   * @description Obtiene todas las calificaciones donde el usuario es el calificado,
   * incluyendo información del calificador y ordenadas por fecha descendente.
   * Útil para mostrar la reputación de un técnico.
   *
   * @example
   * ```typescript
   * const technicianRatings = await ratingService.findByUser(789);
   * const avgScore = technicianRatings.reduce((sum, r) => sum + r.score, 0) / technicianRatings.length;
   * console.log(`Técnico tiene ${technicianRatings.length} calificaciones con promedio ${avgScore}`);
   * ```
   */
  findByUser(id: number) {
    return this.ratingRepo
      .createQueryBuilder('rating')
      .leftJoinAndSelect('rating.rater', 'rater')
      .where('rating.ratedId = :id', { id })
      .orderBy('rating.createdAt', 'DESC')
      .getMany();
  }
}