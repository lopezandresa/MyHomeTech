
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Technician {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  specialization: string;

  @Column()
  experienceYears: number;

  @Column({ type: 'float', default: 0 })
  rating: number;
}