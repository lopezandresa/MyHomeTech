import { IsString, IsEmail, MinLength, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../identity.entity';

export class CreateIdentityDto {
  @ApiProperty({ description: 'Nombre completo del usuario' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Email único del usuario' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Contraseña, mínimo 6 caracteres' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: 'Rol del usuario', enum: ['client','technician','admin'], default: 'client' })
  @IsIn(['client','technician','admin'])
  role: Role;
}