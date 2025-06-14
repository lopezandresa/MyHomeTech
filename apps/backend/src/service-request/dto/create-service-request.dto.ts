import {
  IsInt,
  IsString,
  IsDateString,
  IsOptional,
  IsNumber,
  IsPositive,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ServiceType } from '../service-request.entity';

export class CreateServiceRequestDto {
  @ApiProperty({ description: 'ID del electrodoméstico' })
  @IsInt()
  applianceId: number;

  @ApiProperty({ description: 'ID de la dirección donde se realizará el servicio' })
  @IsInt()
  addressId: number;

  @ApiProperty({ description: 'Descripción del problema' })
  @IsString()
  description: string;

  @ApiProperty({ 
    description: 'Tipo de servicio requerido',
    enum: ServiceType,
    example: ServiceType.REPAIR,
    default: ServiceType.REPAIR
  })
  @IsEnum(ServiceType)
  @IsOptional()
  serviceType?: ServiceType = ServiceType.REPAIR;

  @ApiProperty({ 
    description: 'Fecha y hora propuesta para el servicio (debe estar entre 6 AM y 6 PM)',
    example: '2024-12-20T10:00:00.000Z'
  })
  @IsDateString()
  proposedDateTime: string;

  @ApiProperty({ 
    description: 'Precio que el cliente está dispuesto a pagar',
    example: 50000
  })
  @IsNumber()
  @IsPositive()
  clientPrice: number;

  @ApiProperty({
    description: 'Horas de validez antes de expirar (por defecto 24 horas)',
    example: 24,
    default: 24,
    required: false
  })
  @IsOptional()
  @IsInt()
  validHours?: number = 24;
}
