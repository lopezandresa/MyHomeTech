import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Schedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  technicianId: number;

  @Column('timestamp')
  startTime: Date;

  @Column('timestamp')
  endTime: Date;
}