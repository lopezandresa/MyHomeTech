import { Role } from '../identity.entity';
export declare class CreateIdentityDto {
    name: string;
    email: string;
    password: string;
    role: Role;
}
