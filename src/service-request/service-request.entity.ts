import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class ServiceRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  clientId: number;

  @Column()
  technicianId: number;

  @Column()
  description: string;

  @Column({ default: 'pending' })
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';

  @Column({ type: 'timestamp', nullable: true })
  scheduledAt: Date;
}