import { IsInt, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNotificationDto {
  @ApiProperty({ description: 'ID del usuario receptor', example: 1 })
  @IsInt()
  userId: number;

  @ApiProperty({ description: 'Mensaje de la notificación' })
  @IsString()
  message: string;

  @ApiProperty({ description: 'Estado de leído', required: false, default: false })
  @IsOptional()
  @IsInt()
  read?: boolean;
}