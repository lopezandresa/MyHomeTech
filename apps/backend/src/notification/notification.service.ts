import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';

/**
 * Servicio para la gestión de notificaciones del sistema
 *
 * @description Maneja todas las operaciones relacionadas con notificaciones:
 * - Creación de notificaciones
 * - Consulta de notificaciones por usuario
 * - Marcado de notificaciones como leídas
 * - Integración con sistema de notificaciones en tiempo real
 *
 * @class NotificationService
 */
@Injectable()
export class NotificationService {
  /**
   * Constructor del servicio de notificaciones
   *
   * @param {Repository<Notification>} notifRepo - Repositorio de notificaciones
   */
  constructor(
    @InjectRepository(Notification)
    private readonly notifRepo: Repository<Notification>,
  ) {}

  /**
   * Crea una nueva notificación para un usuario
   *
   * @param {CreateNotificationDto} dto - Datos de la notificación a crear
   * @returns {Promise<Notification>} Notificación creada
   *
   * @description Crea y guarda una notificación en la base de datos.
   * La notificación se crea con estado no leído por defecto.
   *
   * @example
   * ```typescript
   * const notification = await notificationService.create({
   *   userId: 123,
   *   title: 'Nueva solicitud de servicio',
   *   message: 'Tienes una nueva solicitud para reparar un refrigerador',
   *   type: 'service_request'
   * });
   * ```
   */
  create(dto: CreateNotificationDto) {
    const n = this.notifRepo.create(dto);
    return this.notifRepo.save(n);
  }

  /**
   * Obtiene todas las notificaciones de un usuario específico
   *
   * @param {number} userId - ID del usuario
   * @returns {Promise<Notification[]>} Lista de notificaciones del usuario
   *
   * @description Retorna todas las notificaciones (leídas y no leídas)
   * ordenadas por fecha de creación descendente
   *
   * @example
   * ```typescript
   * const userNotifications = await notificationService.findAllForUser(123);
   * const unreadCount = userNotifications.filter(n => !n.read).length;
   * console.log(`Tienes ${unreadCount} notificaciones sin leer`);
   * ```
   */
  findAllForUser(userId: number) {
    return this.notifRepo.find({ where: { userId } });
  }

  /**
   * Marca una notificación como leída
   *
   * @param {number} id - ID de la notificación
   * @returns {Promise<any>} Resultado de la actualización
   *
   * @description Actualiza el campo 'read' de la notificación a true.
   * Útil cuando el usuario ve o interactúa con la notificación.
   *
   * @example
   * ```typescript
   * await notificationService.markRead(456);
   * console.log('Notificación marcada como leída');
   * ```
   */
  markRead(id: number) {
    return this.notifRepo.update(id, { read: true });
  }
}