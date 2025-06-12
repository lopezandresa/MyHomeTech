import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateApplianceDto {
  @ApiProperty({ description: 'Tipo de electrodoméstico' })
  @IsString()
  type: string;

  @ApiProperty({ description: 'Marca del electrodoméstico' })
  @IsString()
  brand: string;

  @ApiProperty({ description: 'Modelo específico' })
  @IsString()
  model: string;

  @ApiProperty({ description: 'Nombre completo (opcional, se genera automáticamente)' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Estado activo', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}