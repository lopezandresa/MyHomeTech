import { IsInt, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTechnicianDto {
  @ApiProperty({ description: 'ID del usuario asociado', example: 1 })
  @IsInt()
  userId: number;

  @ApiProperty({ description: 'Especialidad del técnico' })
  @IsString()
  specialization: string;

  @ApiProperty({ description: 'Años de experiencia', minimum: 0 })
  @IsInt()
  @Min(0)
  experienceYears: number;
}