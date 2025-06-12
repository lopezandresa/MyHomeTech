import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Appliance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  model: string;

  @Column({ nullable: true })
  brand: string;
}