import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RatingService } from './rating.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { Rating } from './rating.entity';

@ApiTags('ratings')
@Controller('ratings')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @Post()
  @ApiOperation({ summary: 'Crea una nueva calificación' })
  create(@Body() dto: CreateRatingDto): Promise<Rating> {
    return this.ratingService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtiene todas las calificaciones' })
  findAll(): Promise<Rating[]> {
    return this.ratingService.findAll();
  }

  @Get('user/:id')
  @ApiOperation({ summary: 'Obtiene calificaciones de un usuario' })
  findByUser(@Param('id') id: number): Promise<Rating[]> {
    return this.ratingService.findByUser(id);
  }
}