import { Repository } from 'typeorm';
import { Appliance } from './appliance.entity';
import { CreateApplianceDto } from './dto/create-appliance.dto';
import { UpdateApplianceDto } from './dto/update-appliance.dto';
export declare class ApplianceService {
    private readonly repo;
    constructor(repo: Repository<Appliance>);
    create(dto: CreateApplianceDto): Promise<Appliance>;
    findAll(): Promise<Appliance[]>;
    update(id: number, dto: UpdateApplianceDto): Promise<Appliance>;
    remove(id: number): Promise<void>;
    findById(id: number): Promise<Appliance | null>;
    findByName(name: string): Promise<Appliance[]>;
}
