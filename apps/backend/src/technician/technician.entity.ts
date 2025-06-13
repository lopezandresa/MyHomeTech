import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToMany, JoinTable
} from 'typeorm';
import { ApplianceType } from '../appliance-type/appliance-type.entity';

@Entity()
export class Technician {
  @PrimaryGeneratedColumn()
  id: number;

  // FK hacia Identity
  @Column()
  identityId: number;

  @Column({ length: 100 })
  cedula: string;

  @Column('date')
  birthDate: Date;

  @Column('int')
  experienceYears: number;

  @Column({ nullable: true })
  idPhotoPath: string;

  @ManyToMany(() => ApplianceType, { eager: true })
  @JoinTable({ name: 'technician_specialties' })
  specialties: ApplianceType[];
}