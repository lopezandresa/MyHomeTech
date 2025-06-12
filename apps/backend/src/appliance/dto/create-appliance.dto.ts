import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateApplianceDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  model: string;

  @ApiProperty({ required: false })
  @IsString()
  brand?: string;
}