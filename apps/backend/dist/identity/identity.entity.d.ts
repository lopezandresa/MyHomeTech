export type Role = 'client' | 'technician' | 'admin';
export declare class Identity {
    id: number;
    name: string;
    email: string;
    password: string;
    status: boolean;
    role: Role;
}
