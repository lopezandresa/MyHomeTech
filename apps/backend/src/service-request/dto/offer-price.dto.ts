import { IsNumber, IsPositive, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class OfferPriceDto {
  @ApiProperty({ description: 'Contraoferta del técnico' })
  @IsNumber()
  @IsPositive()
  technicianPrice: number;

  @ApiProperty({ description: 'Comentario adicional del técnico', required: false })
  @IsOptional()
  @IsString()
  comment?: string;
}