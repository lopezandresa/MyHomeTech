import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Identity } from '../identity/identity.entity';
import { ServiceRequest } from '../service-request/service-request.entity';

export enum HelpTicketType {
  CANCEL_SERVICE = 'cancel_service',
  RESCHEDULE_SERVICE = 'reschedule_service',
  TECHNICAL_ISSUE = 'technical_issue',
  PAYMENT_ISSUE = 'payment_issue',
  GENERAL_INQUIRY = 'general_inquiry',
  COMPLAINT = 'complaint'
}

export enum HelpTicketStatus {
  PENDING = 'pending',
  IN_REVIEW = 'in_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  RESOLVED = 'resolved'
}

/**
 * Entidad para manejar tickets de ayuda del sistema
 * Los usuarios pueden crear tickets para solicitar cancelaciones, reportar problemas, etc.
 */
@Entity('help_tickets')
export class HelpTicket {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: HelpTicketType,
    comment: 'Tipo de ticket de ayuda'
  })
  type: HelpTicketType;

  @Column({
    type: 'varchar',
    length: 255,
    comment: 'Título o asunto del ticket'
  })
  subject: string;

  @Column({
    type: 'text',
    comment: 'Descripción detallada del problema o solicitud'
  })
  description: string;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Motivo específico para cancelaciones o cambios'
  })
  reason?: string;

  @Column({
    type: 'enum',
    enum: HelpTicketStatus,
    default: HelpTicketStatus.PENDING,
    comment: 'Estado actual del ticket'
  })
  status: HelpTicketStatus;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Respuesta del administrador'
  })
  adminResponse?: string;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Notas internas del administrador'
  })
  adminNotes?: string;

  // Relación con el usuario que creó el ticket
  @ManyToOne(() => Identity, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: Identity;

  @Column({ name: 'user_id' })
  userId: number;

  // Relación opcional con una solicitud de servicio (para cancelaciones, reagendamientos, etc.)
  @ManyToOne(() => ServiceRequest, { nullable: true })
  @JoinColumn({ name: 'service_request_id' })
  serviceRequest?: ServiceRequest;

  @Column({ name: 'service_request_id', nullable: true })
  serviceRequestId?: number;

  // Administrador que maneja el ticket
  @ManyToOne(() => Identity, { nullable: true })
  @JoinColumn({ name: 'assigned_admin_id' })
  assignedAdmin?: Identity;

  @Column({ name: 'assigned_admin_id', nullable: true })
  assignedAdminId?: number;

  // Administrador que resolvió el ticket
  @ManyToOne(() => Identity, { nullable: true })
  @JoinColumn({ name: 'resolved_by_admin_id' })
  resolvedByAdmin?: Identity;

  @Column({ name: 'resolved_by_admin_id', nullable: true })
  resolvedByAdminId?: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
    name: 'resolved_at',
    comment: 'Fecha cuando se resolvió el ticket'
  })
  resolvedAt?: Date;

  // Getter para obtener el nombre completo del usuario
  get userName(): string {
    return this.user ? `${this.user.firstName} ${this.user.firstLastName}` : '';
  }

  // Getter para obtener el tipo de usuario
  get userRole(): string {
    return this.user?.role || '';
  }

  // Getter para determinar si es una solicitud de cancelación
  get isCancellationRequest(): boolean {
    return this.type === HelpTicketType.CANCEL_SERVICE;
  }

  // Getter para determinar si el ticket está pendiente
  get isPending(): boolean {
    return this.status === HelpTicketStatus.PENDING;
  }

  // Getter para determinar si el ticket está resuelto
  get isResolved(): boolean {
    return [HelpTicketStatus.APPROVED, HelpTicketStatus.REJECTED, HelpTicketStatus.RESOLVED].includes(this.status);
  }
}