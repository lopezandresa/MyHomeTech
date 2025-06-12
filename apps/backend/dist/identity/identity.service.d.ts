import { Repository } from 'typeorm';
import { Identity } from './identity.entity';
import { CreateIdentityDto } from './dto/create-identity.dto';
import { UpdateIdentityDto } from './dto/update-identity.dto';
export declare class IdentityService {
    private readonly repo;
    constructor(repo: Repository<Identity>);
    register(dto: CreateIdentityDto): Promise<Omit<Identity, 'password'>>;
    findByEmail(email: string): Promise<Identity>;
    findByEmailNoPass(email: string): Promise<Omit<Identity, 'password'>>;
    findAll(): Promise<Omit<Identity, 'password'>[]>;
    findById(id: number): Promise<Omit<Identity, 'password'>>;
    updateUser(id: number, dto: UpdateIdentityDto): Promise<Omit<Identity, 'password'>>;
    toggleStatus(id: number): Promise<Omit<Identity, 'password'>>;
}
