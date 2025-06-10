import { IsInt, IsString, IsIn, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateServiceRequestDto {
  @ApiProperty({ description: 'ID del cliente solicitante', example: 1 })
  @IsInt()
  clientId: number;

  @ApiProperty({ description: 'ID del técnico asignado', example: 2 })
  @IsInt()
  technicianId: number;

  @ApiProperty({ description: 'Descripción del problema' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Estado de la solicitud', enum: ['pending','accepted','in_progress','completed','cancelled'], default: 'pending' })
  @IsIn(['pending','accepted','in_progress','completed','cancelled'])
  status: string;

  @ApiProperty({ description: 'Fecha y hora agendada', required: false })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
}