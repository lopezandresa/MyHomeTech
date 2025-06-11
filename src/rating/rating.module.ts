import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rating } from './rating.entity';
import { RatingService } from './rating.service';
import { RatingController } from './rating.controller';
import { ServiceRequest } from '../service-request/service-request.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Rating, ServiceRequest])],
  providers: [RatingService],
  controllers: [RatingController],
})
export class RatingModule {}