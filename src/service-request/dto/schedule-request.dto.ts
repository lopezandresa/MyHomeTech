import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class ScheduleRequestDto {
  @ApiProperty({ description: 'Fecha y hora agendada (ISO)' })
  @IsDateString()
  scheduledAt: string;
}