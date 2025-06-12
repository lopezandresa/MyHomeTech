import { ApplianceService } from './appliance.service';
import { CreateApplianceDto } from './dto/create-appliance.dto';
import { Appliance } from './appliance.entity';
import { UpdateApplianceDto } from './dto/update-appliance.dto';
export declare class ApplianceController {
    private readonly svc;
    constructor(svc: ApplianceService);
    create(dto: CreateApplianceDto): Promise<Appliance>;
    update(id: number, dto: UpdateApplianceDto): Promise<Appliance>;
    remove(id: number): Promise<void>;
    findAll(): Promise<Appliance[]>;
    findById(id: number): Promise<Appliance | null>;
    findByName(name: string): Promise<Appliance[]>;
}
