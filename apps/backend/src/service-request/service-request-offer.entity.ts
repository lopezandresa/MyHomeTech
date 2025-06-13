import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { ServiceRequest } from './service-request.entity';
import { Identity } from '../identity/identity.entity';

export enum OfferStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

@Entity()
export class ServiceRequestOffer {
  @PrimaryGeneratedColumn()
  id: number;  /** Solicitud de servicio asociada */
  @ManyToOne(() => ServiceRequest, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'serviceRequestId' })
  serviceRequest: ServiceRequest;
  
  @Column()
  serviceRequestId: number;

  /** Técnico que hace la oferta */
  @ManyToOne(() => Identity, { eager: true })
  @JoinColumn({ name: 'technicianId' })
  technician: Identity;
  @Column({ nullable: true })
  technicianId?: number;

  /** Cliente que hace la contraoferta */
  @ManyToOne(() => Identity, { eager: true })
  @JoinColumn({ name: 'clientId' })
  client?: Identity;
  @Column({ nullable: true })
  clientId?: number;

  /** Precio ofrecido por el técnico */
  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  /** Estado de la oferta */
  @Column({
    type: 'enum',
    enum: OfferStatus,
    default: OfferStatus.PENDING,
  })
  status: OfferStatus;

  /** Comentario adicional del técnico */
  @Column('text', { nullable: true })
  comment?: string;

  /** Fecha de creación de la oferta */
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  /** Fecha cuando fue aceptada/rechazada */
  @Column({ type: 'timestamp', nullable: true })
  resolvedAt?: Date;
}
