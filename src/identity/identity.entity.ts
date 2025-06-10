import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export type Role = 'client' | 'technician' | 'admin';

@Entity()
export class Identity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: ['client', 'technician', 'admin'], default: 'client' })
  role: Role;
}