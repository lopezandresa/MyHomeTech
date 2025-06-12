import { Role } from '../identity.entity';
export declare class UpdateIdentityDto {
    name?: string;
    email?: string;
    role?: Role;
    password?: string;
}
