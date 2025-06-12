import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn
} from 'typeorm';
import { Identity } from '../identity/identity.entity';

@Entity()
export class Client {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Identity, { eager: true })
  @JoinColumn({ name: 'identityId' })
  identity: Identity;
  @Column()
  identityId: number;

  @Column({ length: 100 })
  fullName: string;

  @Column({ unique: true, length: 20 })
  cedula: string;

  @Column('date')
  birthDate: Date;

  @Column({ length: 30 })
  phone: string;
}