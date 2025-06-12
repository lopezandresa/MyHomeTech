import { IsInt, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClientDto {
  @ApiProperty({ description: 'ID del usuario asociado', example: 1 })
  @IsInt()
  userId: number;

  @ApiProperty({ description: 'Dirección del cliente' })
  @IsString()
  address: string;

  @ApiProperty({ description: 'Teléfono de contacto' })
  @IsString()
  phone: string;
}