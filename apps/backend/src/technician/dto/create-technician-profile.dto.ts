import {
    IsInt, IsString, IsDateString,
    Min, ArrayNotEmpty, ArrayUnique, IsOptional
  } from 'class-validator';
  import { ApiProperty } from '@nestjs/swagger';
  
  export class CreateTechnicianProfileDto {
    @ApiProperty({ description: 'ID de la identidad (Identity)' })
    @IsInt()
    identityId: number;
  
    @ApiProperty()
    @IsString()
    cedula: string;
  
    @ApiProperty({ description: 'Fecha de nacimiento (ISO)' })
    @IsDateString()
    birthDate: string;
  
    @ApiProperty({ minimum: 0 })
    @IsInt()
    @Min(0)
    experienceYears: number;
  
    @ApiProperty({ 
      description: 'Lista de IDs de tipos de electrodomésticos especializados',
      type: [Number]
    })
    @ArrayNotEmpty()
    @ArrayUnique()
    specialties: number[];

    @ApiProperty({ description: 'URL de Cloudinary para la foto de cédula', required: false })
    @IsOptional()
    @IsString()
    idPhotoUrl?: string;

    @ApiProperty({ description: 'Public ID de Cloudinary para la foto de cédula', required: false })
    @IsOptional()
    @IsString()
    idPhotoPublicId?: string;
  }