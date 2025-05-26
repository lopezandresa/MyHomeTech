import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { RatingService } from './rating.service';
import { Rating } from './rating.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('ratings')
@Controller('ratings')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @Post()
  create(@Body() dto: Partial<Rating>) {
    return this.ratingService.create(dto);
  }

  @Get()
  findAll(): Promise<Rating[]> {
    return this.ratingService.findAll();
  }

  @Get('user/:id')
  findByUser(@Param('id') id: number): Promise<Rating[]> {
    return this.ratingService.findByUser(id);
  }
}