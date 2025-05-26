import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from './rating.entity';

@Injectable()
export class RatingService {
  constructor(
    @InjectRepository(Rating)
    private readonly repo: Repository<Rating>,
  ) {}

  create(data: Partial<Rating>) {
    return this.repo.save(data);
  }

  findAll() {
    return this.repo.find();
  }

  findByUser(id: number) {
    return this.repo.find({ where: { ratedId: id } });
  }
}