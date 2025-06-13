import { IsString, IsEmail, MinLength, IsIn, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '../identity.entity';

export class CreateIdentityDto {
  @ApiProperty({ description: 'Primer nombre del usuario' })
  @IsString()
  firstName: string;

  @ApiPropertyOptional({ description: 'Segundo nombre del usuario' })
  @IsString()
  @IsOptional()
  middleName?: string;

  @ApiProperty({ description: 'Primer apellido del usuario' })
  @IsString()
  firstLastName: string;

  @ApiPropertyOptional({ description: 'Segundo apellido del usuario' })
  @IsString()
  @IsOptional()
  secondLastName?: string;

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