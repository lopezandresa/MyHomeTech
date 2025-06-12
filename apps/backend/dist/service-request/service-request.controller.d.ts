import { ServiceRequestService } from './service-request.service';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import { OfferPriceDto } from './dto/offer-price.dto';
import { AcceptRequestDto } from './dto/accept-request.dto';
import { ScheduleRequestDto } from './dto/schedule-request.dto';
import { ServiceRequest } from './service-request.entity';
export declare class ServiceRequestController {
    private readonly svc;
    constructor(svc: ServiceRequestService);
    create(req: any, dto: CreateServiceRequestDto): Promise<ServiceRequest>;
    findPending(): Promise<ServiceRequest[]>;
    offer(req: any, id: number, dto: OfferPriceDto): Promise<ServiceRequest>;
    accept(req: any, id: number, dto: AcceptRequestDto): Promise<ServiceRequest>;
    schedule(req: any, id: number, dto: ScheduleRequestDto): Promise<ServiceRequest>;
    acceptAndSchedule(req: any, id: number): Promise<ServiceRequest>;
    findById(id: number): Promise<ServiceRequest | null>;
    findByClient(clientId: number): Promise<ServiceRequest[]>;
    findByTechnician(techId: number): Promise<ServiceRequest[]>;
    complete(req: any, id: number): Promise<ServiceRequest>;
    reject(req: any, id: number): Promise<ServiceRequest>;
}
