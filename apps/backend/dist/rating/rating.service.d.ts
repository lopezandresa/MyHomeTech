import { Repository } from 'typeorm';
import { Rating } from './rating.entity';
import { CreateRatingDto } from './dto/create-rating.dto';
import { ServiceRequest } from '../service-request/service-request.entity';
export declare class RatingService {
    private readonly ratingRepo;
    private readonly srRepo;
    constructor(ratingRepo: Repository<Rating>, srRepo: Repository<ServiceRequest>);
    create(dto: CreateRatingDto): Promise<Rating>;
    findAll(): Promise<Rating[]>;
    findByUser(id: number): Promise<Rating[]>;
}
