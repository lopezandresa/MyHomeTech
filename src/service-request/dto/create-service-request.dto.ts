import {
  IsInt,
  IsString,
  IsNumber,
  IsPositive,
  IsDateString,
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
    description: 'Minutos de vigencia antes de expirar',
    example: 30,
  })
  @IsInt()
  @IsPositive()
  validMinutes: number;
}
