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

export enum AlternativeDateProposalStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

@Entity()
export class AlternativeDateProposal {
  @PrimaryGeneratedColumn()
  id: number;

  /** Solicitud de servicio asociada */
  @ManyToOne(() => ServiceRequest, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'serviceRequestId' })
  serviceRequest: ServiceRequest;
  @Column()
  serviceRequestId: number;

  /** Técnico que propone la fecha alternativa */
  @ManyToOne(() => Identity, { eager: true })
  @JoinColumn({ name: 'technicianId' })
  technician: Identity;
  @Column()
  technicianId: number;

  /** Fecha y hora alternativa propuesta */
  @Column({ type: 'timestamp' })
  proposedDateTime: Date;

  /** Estado de la propuesta */
  @Column({
    type: 'enum',
    enum: AlternativeDateProposalStatus,
    default: AlternativeDateProposalStatus.PENDING,
  })
  status: AlternativeDateProposalStatus;

  /** Comentario opcional del técnico */
  @Column('text', { nullable: true })
  comment?: string;

  /** Fecha de creación de la propuesta */
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  /** Fecha cuando fue aceptada/rechazada */
  @Column({ type: 'timestamp', nullable: true })
  resolvedAt?: Date;

  /** Contador de propuestas del técnico para esta solicitud */
  @Column({ type: 'int', default: 1 })
  proposalCount: number;
}
