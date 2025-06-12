import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ApplianceBrand } from '../appliance-brand/appliance-brand.entity';

@Entity()
export class ApplianceType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string; // "Refrigerador", "Lavadora", "Microondas", etc.

  @Column({ nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => ApplianceBrand, brand => brand.type)
  brands: ApplianceBrand[];
}
