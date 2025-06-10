import {
    IsInt, IsString, IsDateString,
    MinLength, MaxLength
  } from 'class-validator';
  import { ApiProperty } from '@nestjs/swagger';
  
  export class CreateClientProfileDto {
    @ApiProperty({ description: 'ID de la identidad (Identity)' })
    @IsInt()
    identityId: number;
  
    @ApiProperty({ description: 'Nombre completo del cliente' })
    @IsString()
    @MinLength(3)
    @MaxLength(100)
    fullName: string;
  
    @ApiProperty({ description: 'Cédula única', example: '12345678' })
    @IsString()
    @MinLength(5)
    @MaxLength(20)
    cedula: string;
  
    @ApiProperty({ description: 'Fecha de nacimiento (YYYY-MM-DD)' })
    @IsDateString()
    birthDate: string;
  
    @ApiProperty({ description: 'Número de teléfono', example: '+57 3001234567' })
    @IsString()
    @MinLength(7)
    @MaxLength(30)
    phone: string;
  }