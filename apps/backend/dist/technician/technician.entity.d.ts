import { Appliance } from '../appliance/appliance.entity';
export declare class Technician {
    id: number;
    identityId: number;
    cedula: string;
    birthDate: Date;
    experienceYears: number;
    idPhotoUrl: string;
    appliances: Appliance[];
}
