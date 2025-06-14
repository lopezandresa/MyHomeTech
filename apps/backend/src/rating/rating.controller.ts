import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RatingService } from './rating.service';
import { CreateRatingDto, RatingResponseDto } from './dto/create-rating.dto';
import { Rating } from './rating.entity';

@ApiTags('ratings')
@Controller('ratings')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @Post()
  @ApiOperation({ summary: 'Crea una nueva calificación' })
  @ApiResponse({ status: 201, description: 'Calificación creada exitosamente', type: RatingResponseDto })
  create(@Body() dto: CreateRatingDto): Promise<Rating> {
    return this.ratingService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtiene todas las calificaciones' })
  @ApiResponse({ status: 200, description: 'Lista de calificaciones', type: [RatingResponseDto] })
  findAll(): Promise<Rating[]> {
    return this.ratingService.findAll();
  }

  @Get('user/:id')
  @ApiOperation({ summary: 'Obtiene calificaciones de un usuario' })
  @ApiResponse({ status: 200, description: 'Calificaciones del usuario', type: [RatingResponseDto] })
  findByUser(@Param('id') id: number): Promise<Rating[]> {
    return this.ratingService.findByUser(id);
  }
}