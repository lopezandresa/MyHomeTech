import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Exclude } from 'class-transformer';
export type Role = 'client' | 'technician' | 'admin';

@Entity()
export class Identity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

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
  profilePhotoPath: string;
}