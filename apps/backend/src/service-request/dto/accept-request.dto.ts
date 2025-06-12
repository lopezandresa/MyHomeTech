import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class AcceptRequestDto {
  @ApiProperty({ description: 'true para aceptar clientPrice, false para aceptar technicianPrice' })
  @IsBoolean()
  acceptClientPrice: boolean;
}