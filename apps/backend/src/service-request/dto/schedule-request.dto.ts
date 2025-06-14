import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class ScheduleRequestDto {
  @ApiProperty({ description: 'Fecha y hora agendada (ISO)' })
  @IsDateString()
  scheduledAt: string;

  @ApiProperty({
    description: 'Comentario opcional del técnico al aceptar la solicitud',
    required: false,
  })
  @IsOptional()
  @IsString()
  comment?: string;
}