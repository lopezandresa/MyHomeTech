import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class ServiceRequestType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  displayName: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  icon?: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  sortOrder: number;
}