import { Technician } from './technician.entity';
import { Repository } from 'typeorm';
import { CreateTechnicianProfileDto } from './dto/create-technician-profile.dto';
import { Appliance } from '../appliance/appliance.entity';
export declare class TechnicianService {
    private readonly techRepo;
    private readonly appRepo;
    constructor(techRepo: Repository<Technician>, appRepo: Repository<Appliance>);
    createProfile(dto: CreateTechnicianProfileDto): Promise<Technician>;
    findAll(): Promise<Technician[]>;
    findById(id: number): Promise<Technician | null>;
    updateProfileByIdentityId(identityId: number, profile: Partial<Technician>): Promise<Technician>;
}
