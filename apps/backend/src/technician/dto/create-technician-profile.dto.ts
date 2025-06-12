import {
    IsInt, IsString, IsDateString,
    Min, IsUrl, ArrayNotEmpty, ArrayUnique
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
  
    @ApiProperty({ description: 'URL de la foto de la cédula' })
    @IsUrl()
    idPhotoUrl: string;
  
    @ApiProperty({ 
      description: 'Lista de IDs de electrodomésticos especializados',
      type: [Number]
    })
    @ArrayNotEmpty()
    @ArrayUnique()
    appliances: number[];
  }