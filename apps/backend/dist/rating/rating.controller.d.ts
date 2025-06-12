import { RatingService } from './rating.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { Rating } from './rating.entity';
export declare class RatingController {
    private readonly ratingService;
    constructor(ratingService: RatingService);
    create(dto: CreateRatingDto): Promise<Rating>;
    findAll(): Promise<Rating[]>;
    findByUser(id: number): Promise<Rating[]>;
}
