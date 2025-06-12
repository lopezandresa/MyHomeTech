import { TechnicianService } from './technician.service';
import { CreateTechnicianProfileDto } from './dto/create-technician-profile.dto';
import { Technician } from './technician.entity';
export declare class TechnicianController {
    private readonly svc;
    constructor(svc: TechnicianService);
    createProfile(dto: CreateTechnicianProfileDto, req: any): Promise<Technician>;
    findAll(): Promise<Technician[]>;
    findById(id: number): Promise<Technician | null>;
}
