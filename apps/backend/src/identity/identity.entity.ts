import { Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinColumn, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Address } from '../address/address.entity';
export type Role = 'client' | 'technician' | 'admin';

@Entity()
export class Identity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column({ nullable: true })
  middleName: string;

  @Column()
  firstLastName: string;

  @Column({ nullable: true })
  secondLastName: string;

  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column()
  password: string;

  @Column({default: true})
  status: boolean;

  @Column({ type: 'enum', enum: ['client', 'technician', 'admin'], default: 'client' })
  role: Role;

  @Column({ nullable: true })
  profilePhotoUrl: string;

  @Column({ nullable: true })
  profilePhotoPublicId: string;

  // Relación con direcciones
  @OneToMany(() => Address, address => address.user)
  addresses: Address[];

  // Relación con dirección principal
  @Column({ nullable: true })
  primaryAddressId?: number;

  @ManyToOne(() => Address, { nullable: true })
  @JoinColumn({ name: 'primaryAddressId' })
  primaryAddress?: Address;

  // Timestamps automáticos
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Getter para nombre completo (compatibilidad)
  get fullName(): string {
    const parts = [this.firstName, this.middleName, this.firstLastName, this.secondLastName]
      .filter(Boolean);
    return parts.join(' ');
  }

  // Getter para nombre de visualización
  get displayName(): string {
    return `${this.firstName} ${this.firstLastName}`;
  }
}