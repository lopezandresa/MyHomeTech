import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from './rating.entity';
import { CreateRatingDto } from './dto/create-rating.dto';

@Injectable()
export class RatingService {
  constructor(
    @InjectRepository(Rating)
    private readonly ratingRepo: Repository<Rating>,
  ) {}

  create(dto: CreateRatingDto) {
    const r = this.ratingRepo.create(dto);
    return this.ratingRepo.save(r);
  }

  findAll() {
    return this.ratingRepo.find();
  }

  findByUser(id: number) {
    return this.ratingRepo.find({ where: { ratedId: id } });
  }
}