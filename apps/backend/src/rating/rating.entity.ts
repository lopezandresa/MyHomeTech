import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

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
}