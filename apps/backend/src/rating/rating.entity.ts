import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Identity } from '../identity/identity.entity';

@Entity()
export class Rating {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  raterId: number;

  @Column()
  ratedId: number;

  @Column({ type: 'int' })
  score: number;

  @Column({ nullable: true })
  comment: string;

  @Column()
  serviceRequestId: number;

  @CreateDateColumn()
  createdAt: Date;

  // Relación con el usuario que califica
  @ManyToOne(() => Identity)
  @JoinColumn({ name: 'raterId' })
  rater: Identity;

  // Relación con el usuario calificado
  @ManyToOne(() => Identity)
  @JoinColumn({ name: 'ratedId' })
  rated: Identity;
}