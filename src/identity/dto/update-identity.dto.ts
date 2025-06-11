import { IsOptional, IsString, IsEmail, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../identity.entity';

export class UpdateIdentityDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ required: false, enum: ['client','technician','admin'] })
  @IsOptional()
  @IsIn(['client','technician','admin'])
  role?: Role;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  password?: string;
}
