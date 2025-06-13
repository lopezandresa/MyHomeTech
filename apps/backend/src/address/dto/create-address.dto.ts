import { IsString, IsOptional, IsBoolean, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAddressDto {
  @ApiProperty({ description: 'Nombre de la calle' })
  @IsString()
  @IsNotEmpty()
  street: string;

  @ApiProperty({ description: 'Número de la dirección' })
  @IsString()
  @IsNotEmpty()
  number: string;

  @ApiPropertyOptional({ description: 'Número de apartamento o unidad' })
  @IsString()
  @IsOptional()
  apartment?: string;

  @ApiProperty({ description: 'Barrio o colonia' })
  @IsString()
  @IsNotEmpty()
  neighborhood: string;

  @ApiProperty({ description: 'Ciudad' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ description: 'Estado o departamento' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ description: 'Código postal' })
  @IsString()
  @IsNotEmpty()
  postalCode: string;

  @ApiProperty({ description: 'País', default: 'Colombia' })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiPropertyOptional({ description: 'Información adicional sobre la dirección' })
  @IsString()
  @IsOptional()
  additionalInfo?: string;

  @ApiPropertyOptional({ description: 'Si es la dirección por defecto', default: false })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}