import { ClientService } from './client.service';
import { CreateClientProfileDto } from './dto/create-client-profile.dto';
import { Client } from './client.entity';
export declare class ClientController {
    private readonly svc;
    constructor(svc: ClientService);
    createProfile(dto: CreateClientProfileDto, req: any): Promise<Client>;
    findAll(): Promise<Client[]>;
    findById(id: number): Promise<Client | null>;
}
