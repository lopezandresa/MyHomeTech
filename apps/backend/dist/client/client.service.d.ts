import { Repository } from 'typeorm';
import { Client } from './client.entity';
import { CreateClientProfileDto } from './dto/create-client-profile.dto';
export declare class ClientService {
    private readonly clientRepo;
    constructor(clientRepo: Repository<Client>);
    createProfile(dto: CreateClientProfileDto): Promise<Client>;
    findAll(): Promise<Client[]>;
    findById(id: number): Promise<Client | null>;
    updateProfileByIdentityId(identityId: number, profile: Partial<Client>): Promise<Client>;
}
