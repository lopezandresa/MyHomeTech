import { Repository } from 'typeorm';
import { ServiceRequest } from './service-request.entity';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import { OfferPriceDto } from './dto/offer-price.dto';
import { AcceptRequestDto } from './dto/accept-request.dto';
import { ScheduleRequestDto } from './dto/schedule-request.dto';
export declare class ServiceRequestService {
    private readonly srRepo;
    constructor(srRepo: Repository<ServiceRequest>);
    create(clientId: number, dto: CreateServiceRequestDto): Promise<ServiceRequest>;
    findPending(): Promise<ServiceRequest[]>;
    offerPrice(id: number, technicianId: number, dto: OfferPriceDto): Promise<ServiceRequest>;
    accept(id: number, clientId: number, dto: AcceptRequestDto): Promise<ServiceRequest>;
    schedule(id: number, technicianId: number, dto: ScheduleRequestDto): Promise<ServiceRequest>;
    acceptByTechnician(id: number, technicianId: number): Promise<ServiceRequest>;
    completeByClient(id: number, clientId: number): Promise<ServiceRequest>;
    rejectByTechnician(id: number, technicianId: number): Promise<ServiceRequest>;
    findById(id: number): Promise<ServiceRequest | null>;
    findByClient(clientId: number): Promise<ServiceRequest[]>;
    findByTechnician(technicianId: number): Promise<ServiceRequest[]>;
}
