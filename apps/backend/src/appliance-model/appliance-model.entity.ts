import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApplianceBrand } from '../appliance-brand/appliance-brand.entity';

@Entity()
export class ApplianceModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string; // "NX60T8711SS", "WFE515S0ES", etc.

  @Column({ nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => ApplianceBrand, brand => brand.models)
  @JoinColumn({ name: 'brandId' })
  brand: ApplianceBrand;

  @Column()
  brandId: number;
}
