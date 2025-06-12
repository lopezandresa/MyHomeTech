import { Identity } from '../identity/identity.entity';
export declare class Client {
    id: number;
    identity: Identity;
    identityId: number;
    fullName: string;
    cedula: string;
    birthDate: Date;
    phone: string;
}
