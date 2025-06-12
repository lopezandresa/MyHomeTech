import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ApplianceType } from '../appliance-type/appliance-type.entity';
import { ApplianceModel } from '../appliance-model/appliance-model.entity';

@Entity()
export class ApplianceBrand {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string; // "Samsung", "LG", "Whirlpool", etc.

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => ApplianceType, type => type.brands)
  @JoinColumn({ name: 'typeId' })
  type: ApplianceType;

  @Column()
  typeId: number;

  @OneToMany(() => ApplianceModel, model => model.brand)
  models: ApplianceModel[];
}
