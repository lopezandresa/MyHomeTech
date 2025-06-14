import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class ProposeAlternativeDateDto {
  @ApiProperty({ description: 'Fecha y hora alternativa propuesta (ISO)' })
  @IsDateString()
  alternativeDateTime: string;

  @ApiProperty({
    description: 'Comentario opcional del técnico explicando la propuesta',
    required: false,
  })
  @IsOptional()
  @IsString()
  comment?: string;
}
