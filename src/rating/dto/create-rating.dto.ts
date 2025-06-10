import { IsInt, Min, Max, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRatingDto {
  @ApiProperty({ description: 'ID del usuario que califica', example: 1 })
  @IsInt()
  raterId: number;

  @ApiProperty({ description: 'ID del usuario calificado', example: 2 })
  @IsInt()
  ratedId: number;

  @ApiProperty({ description: 'Puntuación del 1 al 5', minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  score: number;

  @ApiProperty({ description: 'Comentario opcional', required: false })
  @IsOptional()
  @IsString()
  comment?: string;
}