import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Appliance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string; // Tipo de electrodoméstico (ej: "Refrigerador", "Lavadora", "Microondas")

  @Column()
  brand: string; // Marca (ej: "Samsung", "LG", "Whirlpool")

  @Column()
  model: string; // Modelo específico

  @Column()
  name: string; // Nombre completo generado (tipo + marca + modelo)

  @Column({ default: true })
  isActive: boolean;
}