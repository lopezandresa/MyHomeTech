import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Identity } from '../identity/identity.entity';

@Entity()
export class Address {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  street: string;

  @Column()
  number: string;

  @Column({ nullable: true })
  apartment: string;

  @Column()
  neighborhood: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column()
  postalCode: string;

  @Column()
  country: string;

  @Column({ nullable: true })
  additionalInfo: string;

  @Column({ default: false })
  isDefault: boolean;

  @Column()
  userId: number;

  @ManyToOne(() => Identity, identity => identity.addresses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: Identity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Getter para dirección completa
  get fullAddress(): string {
    const parts = [
      `${this.street} ${this.number}${this.apartment ? ` Apt. ${this.apartment}` : ''}`,
      this.neighborhood,
      this.city,
      this.state,
      this.postalCode
    ];
    return parts.join(', ');
  }
}