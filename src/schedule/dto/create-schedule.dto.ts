import { IsInt, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateScheduleDto {
  @ApiProperty({ description: 'ID del técnico', example: 2 })
  @IsInt()
  technicianId: number;

  @ApiProperty({ description: 'Hora de inicio (ISO)', example: '2025-06-10T09:00:00Z' })
  @IsDateString()
  startTime: string;

  @ApiProperty({ description: 'Hora de fin (ISO)', example: '2025-06-10T11:00:00Z' })
  @IsDateString()
  endTime: string;
}