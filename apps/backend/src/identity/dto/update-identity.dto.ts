import { IsOptional, IsString, IsEmail, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '../identity.entity';

export class UpdateIdentityDto {
  @ApiPropertyOptional({ description: 'Primer nombre del usuario' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ description: 'Segundo nombre del usuario' })
  @IsOptional()
  @IsString()
  middleName?: string;

  @ApiPropertyOptional({ description: 'Primer apellido del usuario' })
  @IsOptional()
  @IsString()
  firstLastName?: string;

  @ApiPropertyOptional({ description: 'Segundo apellido del usuario' })
  @IsOptional()
  @IsString()
  secondLastName?: string;

  @ApiPropertyOptional({ description: 'Email del usuario' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Rol del usuario', enum: ['client','technician','admin'] })
  @IsOptional()
  @IsIn(['client','technician','admin'])
  role?: Role;

  @ApiPropertyOptional({ description: 'Nueva contraseña' })
  @IsOptional()
  @IsString()
  password?: string;
}
