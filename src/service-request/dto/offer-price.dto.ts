import { IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class OfferPriceDto {
  @ApiProperty({ description: 'Contraoferta del técnico' })
  @IsNumber()
  @IsPositive()
  technicianPrice: number;
}