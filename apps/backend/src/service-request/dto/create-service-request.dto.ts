import {
  IsInt,
  IsString,
  IsNumber,
  IsPositive,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateServiceRequestDto {
  @ApiProperty({ description: 'ID del electrodoméstico' })
  @IsInt()
  applianceId: number;

  @ApiProperty({ description: 'Descripción del fallo' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Precio ofrecido por el cliente' })
  @IsNumber()
  @IsPositive()
  clientPrice: number;

  @ApiProperty({
    description: 'Minutos de vigencia antes de expirar (por defecto 5 minutos)',
    example: 5,
    default: 5,
    required: false
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  validMinutes?: number = 5;
}
