import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Identity } from '../identity/identity.entity';
import { Appliance } from '../appliance/appliance.entity';
import { Address } from '../address/address.entity';
import { ServiceRequestOffer } from './service-request-offer.entity';
import { AlternativeDateProposal } from './alternative-date-proposal.entity';

export enum ServiceRequestStatus {
  PENDING      = 'pending',    // Cliente creó solicitud con fecha propuesta
  OFFERED      = 'offered',    // Técnicos han hecho ofertas
  ACCEPTED     = 'accepted',   // Técnico aceptó la fecha
  SCHEDULED    = 'scheduled',  // Confirmado y agendado
  IN_PROGRESS  = 'in_progress', // Técnico comenzó el trabajo
  COMPLETED    = 'completed',  // Servicio completado
  CANCELLED    = 'cancelled',  // Cancelado por cliente
  EXPIRED      = 'expired',    // Expiró sin ser aceptado
}

export enum ServiceType {
  MAINTENANCE  = 'maintenance',   // Mantenimiento preventivo
  INSTALLATION = 'installation', // Instalación de equipos
  REPAIR       = 'repair',       // Reparación/arreglo
}

@Entity()
export class ServiceRequest {
  @PrimaryGeneratedColumn()
  id: number;

  /** Cliente que solicita el servicio */
  @ManyToOne(() => Identity, { eager: true })
  @JoinColumn({ name: 'clientId' })
  client: Identity;
  @Column()
  clientId: number;

  /** Electrodoméstico a reparar */
  @ManyToOne(() => Appliance, { eager: true })
  @JoinColumn({ name: 'applianceId' })
  appliance: Appliance;
  @Column()
  applianceId: number;

  /** Descripción del problema */
  @Column('text')
  description: string;

  /** Tipo de servicio solicitado */
  @Column({
    type: 'enum',
    enum: ServiceType,
    default: ServiceType.REPAIR,
  })
  serviceType: ServiceType;

  /** Fecha y hora propuesta por el cliente para el servicio */
  @Column({ type: 'timestamp' })
  proposedDateTime: Date;

  /** Estado de la petición */
  @Column({
    type: 'enum',
    enum: ServiceRequestStatus,
    default: ServiceRequestStatus.PENDING,
  })
  status: ServiceRequestStatus;

  /** Propuestas de fechas alternativas */
  @OneToMany(() => AlternativeDateProposal, proposal => proposal.serviceRequest)
  alternativeDateProposals: AlternativeDateProposal[];

  /** Fecha de creación automática */
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  /** Caduca si no es aceptada en 24 horas */
  @Column({ type: 'timestamp', nullable: true })
  expiresAt?: Date;

  /** Técnico que acepta la petición */
  @ManyToOne(() => Identity, { nullable: true, eager: true })
  @JoinColumn({ name: 'technicianId' })
  technician?: Identity;
  @Column({ nullable: true })
  technicianId?: number;

  /** Dirección donde se realizará el servicio */
  @ManyToOne(() => Address, { eager: true })
  @JoinColumn({ name: 'addressId' })
  address: Address;
  @Column()
  addressId: number;

  /** Timestamps de los distintos hitos */
  @Column({ type: 'timestamp', nullable: true })
  acceptedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  scheduledAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  cancelledAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiredAt?: Date;

  /** Información del ticket de cancelación */
  @Column({ type: 'text', nullable: true })
  cancellationReason?: string;

  @ManyToOne(() => Identity, { nullable: true })
  @JoinColumn({ name: 'cancelledByUserId' })
  cancelledByUser?: Identity;

  @Column({ nullable: true })
  cancelledByUserId?: number;

  @Column({ type: 'timestamp', nullable: true })
  cancellationTicketCreatedAt?: Date;
}
