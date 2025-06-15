import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HelpTicket, HelpTicketStatus, HelpTicketType } from './help-ticket.entity';
import { ServiceRequest, ServiceRequestStatus } from '../service-request/service-request.entity';
import { Identity } from '../identity/identity.entity';
import { CreateHelpTicketDto } from './dto/create-help-ticket.dto';
import { RespondHelpTicketDto } from './dto/respond-help-ticket.dto';

@Injectable()
export class HelpTicketService {
  constructor(
    @InjectRepository(HelpTicket)
    private readonly helpTicketRepo: Repository<HelpTicket>,
    @InjectRepository(ServiceRequest)
    private readonly serviceRequestRepo: Repository<ServiceRequest>,
    @InjectRepository(Identity)
    private readonly identityRepo: Repository<Identity>
  ) {}

  /**
   * Crear un nuevo ticket de ayuda
   */
  async createTicket(userId: number, dto: CreateHelpTicketDto): Promise<HelpTicket> {
    const user = await this.identityRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Si es un ticket relacionado con servicio, validar que el servicio existe y pertenece al usuario
    let serviceRequest: ServiceRequest | null = null;
    if (dto.serviceRequestId) {
      serviceRequest = await this.serviceRequestRepo.findOne({
        where: { id: dto.serviceRequestId },
        relations: ['client', 'technician', 'appliance']
      });

      if (!serviceRequest) {
        throw new NotFoundException('Solicitud de servicio no encontrada');
      }

      // Verificar que el usuario es el cliente o el técnico asignado
      const isClient = serviceRequest.client.id === userId;
      const isTechnician = serviceRequest.technician?.id === userId;
      
      if (!isClient && !isTechnician) {
        throw new ForbiddenException('No tienes permisos para crear un ticket sobre esta solicitud de servicio');
      }

      // Para cancelaciones, verificar que el servicio esté en estado que permita cancelación
      if (dto.type === HelpTicketType.CANCEL_SERVICE) {
        const allowedStatuses = [ServiceRequestStatus.SCHEDULED];
        if (!allowedStatuses.includes(serviceRequest.status as ServiceRequestStatus)) {
          throw new BadRequestException('No se puede cancelar un servicio en estado: ' + serviceRequest.status);
        }
      }
    }

    // Create ticket object with proper typing
    const ticketData: Partial<HelpTicket> = {
      type: dto.type,
      subject: dto.subject,
      description: dto.description,
      reason: dto.reason,
      userId,
      user,
      serviceRequestId: dto.serviceRequestId,
    };

    // Only add serviceRequest if it exists
    if (serviceRequest) {
      ticketData.serviceRequest = serviceRequest;
    }

    const ticket = this.helpTicketRepo.create(ticketData);

    return await this.helpTicketRepo.save(ticket);
  }

  /**
   * Obtener tickets del usuario autenticado
   */
  async getUserTickets(userId: number): Promise<HelpTicket[]> {
    return await this.helpTicketRepo.find({
      where: { userId },
      relations: ['serviceRequest', 'serviceRequest.appliance', 'assignedAdmin', 'resolvedByAdmin'],
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * Obtener todos los tickets para administradores
   */
  async getAllTickets(status?: HelpTicketStatus, type?: HelpTicketType): Promise<HelpTicket[]> {
    const queryBuilder = this.helpTicketRepo.createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.user', 'user')
      .leftJoinAndSelect('ticket.serviceRequest', 'serviceRequest')
      .leftJoinAndSelect('serviceRequest.appliance', 'appliance')
      .leftJoinAndSelect('ticket.assignedAdmin', 'assignedAdmin')
      .leftJoinAndSelect('ticket.resolvedByAdmin', 'resolvedByAdmin');

    if (status) {
      queryBuilder.andWhere('ticket.status = :status', { status });
    }

    if (type) {
      queryBuilder.andWhere('ticket.type = :type', { type });
    }

    queryBuilder.orderBy('ticket.createdAt', 'DESC');

    return await queryBuilder.getMany();
  }

  /**
   * Obtener un ticket por ID
   */
  async getTicketById(ticketId: number, userId?: number): Promise<HelpTicket> {
    const ticket = await this.helpTicketRepo.findOne({
      where: { id: ticketId },
      relations: ['user', 'serviceRequest', 'serviceRequest.appliance', 'assignedAdmin', 'resolvedByAdmin']
    });

    if (!ticket) {
      throw new NotFoundException('Ticket no encontrado');
    }

    // Si se proporciona userId, verificar que el usuario tiene acceso
    if (userId) {
      const user = await this.identityRepo.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      // Solo el propietario del ticket o un admin pueden ver el ticket
      if (user.role !== 'admin' && ticket.userId !== userId) {
        throw new ForbiddenException('No tienes permisos para ver este ticket');
      }
    }

    return ticket;
  }

  /**
   * Responder a un ticket (solo administradores)
   */
  async respondToTicket(ticketId: number, adminId: number, dto: RespondHelpTicketDto): Promise<HelpTicket> {
    const admin = await this.identityRepo.findOne({ where: { id: adminId } });
    if (!admin || admin.role !== 'admin') {
      throw new ForbiddenException('Solo los administradores pueden responder tickets');
    }

    const ticket = await this.getTicketById(ticketId);

    // Si es una aprobación de cancelación, cancelar el servicio
    if (ticket.type === HelpTicketType.CANCEL_SERVICE && 
        dto.status === HelpTicketStatus.APPROVED && 
        ticket.serviceRequest) {
      
      ticket.serviceRequest.status = ServiceRequestStatus.CANCELLED;
      ticket.serviceRequest.cancelledAt = new Date();
      // Note: ServiceRequest entity doesn't have cancelReason field
      // The reason is stored in the ticket itself
      
      await this.serviceRequestRepo.save(ticket.serviceRequest);
    }

    // Actualizar el ticket
    ticket.status = dto.status;
    ticket.adminResponse = dto.adminResponse;
    ticket.adminNotes = dto.adminNotes;
    ticket.resolvedByAdmin = admin;
    ticket.resolvedByAdminId = adminId;
    
    if ([HelpTicketStatus.APPROVED, HelpTicketStatus.REJECTED, HelpTicketStatus.RESOLVED].includes(dto.status)) {
      ticket.resolvedAt = new Date();
    }

    return await this.helpTicketRepo.save(ticket);
  }

  /**
   * Asignar ticket a un administrador
   */
  async assignTicket(ticketId: number, adminId: number, assignedAdminId: number): Promise<HelpTicket> {
    const admin = await this.identityRepo.findOne({ where: { id: adminId } });
    if (!admin || admin.role !== 'admin') {
      throw new ForbiddenException('Solo los administradores pueden asignar tickets');
    }

    const assignedAdmin = await this.identityRepo.findOne({ where: { id: assignedAdminId } });
    if (!assignedAdmin || assignedAdmin.role !== 'admin') {
      throw new BadRequestException('El usuario asignado debe ser un administrador');
    }

    const ticket = await this.getTicketById(ticketId);
    ticket.assignedAdmin = assignedAdmin;
    ticket.assignedAdminId = assignedAdminId;
    ticket.status = HelpTicketStatus.IN_REVIEW;

    return await this.helpTicketRepo.save(ticket);
  }

  /**
   * Obtener estadísticas de tickets para dashboard de admin
   */
  async getTicketStats(): Promise<{
    total: number;
    pending: number;
    inReview: number;
    resolved: number;
    byType: Record<string, number>;
  }> {
    const [total, pending, inReview, resolved] = await Promise.all([
      this.helpTicketRepo.count(),
      this.helpTicketRepo.count({ where: { status: HelpTicketStatus.PENDING } }),
      this.helpTicketRepo.count({ where: { status: HelpTicketStatus.IN_REVIEW } }),
      this.helpTicketRepo.count({ 
        where: [
          { status: HelpTicketStatus.APPROVED },
          { status: HelpTicketStatus.REJECTED },
          { status: HelpTicketStatus.RESOLVED }
        ]
      })
    ]);

    // Estadísticas por tipo
    const typeStats = await this.helpTicketRepo
      .createQueryBuilder('ticket')
      .select('ticket.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('ticket.type')
      .getRawMany();

    const byType: Record<string, number> = {};
    typeStats.forEach(stat => {
      byType[stat.type] = parseInt(stat.count);
    });

    return {
      total,
      pending,
      inReview,
      resolved,
      byType
    };
  }

  /**
   * Actualizar estado de un ticket (solo administradores)
   */
  async updateTicketStatus(ticketId: number, adminId: number, newStatus: HelpTicketStatus): Promise<HelpTicket> {
    const admin = await this.identityRepo.findOne({ where: { id: adminId } });
    if (!admin || admin.role !== 'admin') {
      throw new ForbiddenException('Solo los administradores pueden actualizar el estado de tickets');
    }

    const ticket = await this.getTicketById(ticketId);
    
    // Si es un ticket de cancelación de servicio y se marca como resuelto, cancelar el servicio
    if (ticket.type === HelpTicketType.CANCEL_SERVICE && 
        newStatus === HelpTicketStatus.RESOLVED && 
        ticket.serviceRequest) {
      
      // Verificar que el servicio esté en un estado cancelable
      if (ticket.serviceRequest.status === ServiceRequestStatus.SCHEDULED) {
        ticket.serviceRequest.status = ServiceRequestStatus.CANCELLED;
        ticket.serviceRequest.cancelledAt = new Date();
        
        // Guardar información del ticket de cancelación en el servicio
        ticket.serviceRequest.cancellationReason = ticket.reason || ticket.description;
        ticket.serviceRequest.cancelledByUser = ticket.user;
        ticket.serviceRequest.cancelledByUserId = ticket.userId;
        ticket.serviceRequest.cancellationTicketCreatedAt = ticket.createdAt;
        
        await this.serviceRequestRepo.save(ticket.serviceRequest);
        
        console.log(`Servicio #${ticket.serviceRequest.id} cancelado automáticamente por resolución del ticket #${ticket.id}`);
      } else {
        console.warn(`No se pudo cancelar el servicio #${ticket.serviceRequest.id} porque está en estado: ${ticket.serviceRequest.status}`);
      }
    }
    
    ticket.status = newStatus;
    
    // Si se marca como resuelto, agregar fecha de resolución y admin que lo resolvió
    if (newStatus === HelpTicketStatus.RESOLVED) {
      ticket.resolvedAt = new Date();
      ticket.resolvedByAdmin = admin;
      ticket.resolvedByAdminId = adminId;
    }
    
    // Si se toma el ticket (cambia a in_review), asignar al admin
    if (newStatus === HelpTicketStatus.IN_REVIEW && !ticket.assignedAdminId) {
      ticket.assignedAdmin = admin;
      ticket.assignedAdminId = adminId;
    }

    return await this.helpTicketRepo.save(ticket);
  }

  /**
   * Agregar respuesta de administrador a un ticket
   */
  async addAdminResponse(ticketId: number, adminId: number, message: string): Promise<HelpTicket> {
    const admin = await this.identityRepo.findOne({ where: { id: adminId } });
    if (!admin || admin.role !== 'admin') {
      throw new ForbiddenException('Solo los administradores pueden agregar respuestas');
    }

    const ticket = await this.getTicketById(ticketId);
    
    // Agregar la respuesta (aquí asumo que hay un campo adminResponse o similar)
    // Si no existe, podríamos crear una entidad separada para las respuestas
    ticket.adminResponse = message;
    ticket.resolvedByAdmin = admin;
    ticket.resolvedByAdminId = adminId;
    
    // Si el ticket estaba pendiente, cambiarlo a en revisión
    if (ticket.status === HelpTicketStatus.PENDING) {
      ticket.status = HelpTicketStatus.IN_REVIEW;
      ticket.assignedAdmin = admin;
      ticket.assignedAdminId = adminId;
    }

    return await this.helpTicketRepo.save(ticket);
  }
}