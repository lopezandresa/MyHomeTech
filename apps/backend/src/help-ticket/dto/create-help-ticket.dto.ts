import { IsEnum, IsString, IsOptional, IsNumber, Length, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HelpTicketType } from '../help-ticket.entity';

export class CreateHelpTicketDto {
  @ApiProperty({ 
    description: 'Tipo de ticket de ayuda',
    enum: HelpTicketType,
    example: HelpTicketType.CANCEL_SERVICE
  })
  @IsEnum(HelpTicketType)
  type: HelpTicketType;

  @ApiProperty({ 
    description: 'Asunto o título del ticket',
    example: 'Solicitud de cancelación de servicio'
  })
  @IsString()
  @IsNotEmpty()
  @Length(5, 255)
  subject: string;

  @ApiProperty({ 
    description: 'Descripción detallada del problema o solicitud',
    example: 'Necesito cancelar mi servicio programado debido a un viaje imprevisto'
  })
  @IsString()
  @IsNotEmpty()
  @Length(10, 1000)
  description: string;

  @ApiPropertyOptional({ 
    description: 'Motivo específico para cancelaciones o cambios',
    example: 'Viaje de emergencia familiar'
  })
  @IsOptional()
  @IsString()
  @Length(5, 500)
  reason?: string;

  @ApiPropertyOptional({ 
    description: 'ID de la solicitud de servicio relacionada (para cancelaciones/reagendamientos)',
    example: 123
  })
  @IsOptional()
  @IsNumber()
  serviceRequestId?: number;
}