import { IsEnum, IsString, IsOptional, Length, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HelpTicketStatus } from '../help-ticket.entity';

export class RespondHelpTicketDto {
  @ApiProperty({ 
    description: 'Nuevo estado del ticket',
    enum: HelpTicketStatus,
    example: HelpTicketStatus.APPROVED
  })
  @IsEnum(HelpTicketStatus)
  status: HelpTicketStatus;

  @ApiProperty({ 
    description: 'Respuesta del administrador al usuario',
    example: 'Tu solicitud de cancelación ha sido aprobada. El servicio ha sido cancelado sin penalización.'
  })
  @IsString()
  @IsNotEmpty()
  @Length(5, 1000)
  adminResponse: string;

  @ApiPropertyOptional({ 
    description: 'Notas internas del administrador (no visibles para el usuario)',
    example: 'Cliente con historial excelente, motivo válido'
  })
  @IsOptional()
  @IsString()
  @Length(5, 500)
  adminNotes?: string;
}