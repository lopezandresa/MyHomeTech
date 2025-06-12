import { IdentityService } from './identity.service';
import { CreateIdentityDto } from './dto/create-identity.dto';
import { Identity } from './identity.entity';
import { UpdateIdentityDto } from './dto/update-identity.dto';
export type IdentityResponse = Omit<Identity, 'password'>;
export declare class IdentityController {
    private readonly svc;
    constructor(svc: IdentityService);
    register(dto: CreateIdentityDto): Promise<IdentityResponse>;
    me(req: any): IdentityResponse;
    updateMe(req: any, dto: UpdateIdentityDto): Promise<IdentityResponse>;
    findAll(): Promise<IdentityResponse[]>;
    findById(id: number): Promise<IdentityResponse | null>;
    toggleStatus(id: number): Promise<IdentityResponse>;
}
