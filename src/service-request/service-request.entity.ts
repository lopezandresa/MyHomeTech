import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Identity } from '../identity/identity.entity';
import { Appliance } from '../appliance/appliance.entity';

export enum ServiceRequestStatus {
  PENDING      = 'pending',
  OFFERED      = 'offered',
  ACCEPTED     = 'accepted',
  SCHEDULED    = 'scheduled',
  IN_PROGRESS  = 'in_progress',
  COMPLETED    = 'completed',
  CANCELLED    = 'cancelled',
}

@Entity()
export class ServiceRequest {
  @PrimaryGeneratedColumn()
  id: number;

  /** Quién solicita (cliente) */
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

  /** Precio ofrecido originalmente por el cliente */
  @Column('decimal', { precision: 10, scale: 2 })
  clientPrice: number;

  /** Contraoferta del técnico */
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  technicianPrice?: number;

  /** Estado de la petición */
  @Column({
    type: 'enum',
    enum: ServiceRequestStatus,
    default: ServiceRequestStatus.PENDING,
  })
  status: ServiceRequestStatus;

  /** Fecha de creación automática */
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  /** Caduca si no es aceptada en X minutos */
  @Column({ type: 'timestamp', nullable: true })
  expiresAt?: Date;

  /** Técnico que acepta la petición */
  @ManyToOne(() => Identity, { nullable: true, eager: true })
  @JoinColumn({ name: 'technicianId' })
  technician?: Identity;
  @Column({ nullable: true })
  technicianId?: number;

  /** Timestamps de los distintos hitos */
  @Column({ type: 'timestamp', nullable: true })
  acceptedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  scheduledAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  cancelledAt?: Date;
}
