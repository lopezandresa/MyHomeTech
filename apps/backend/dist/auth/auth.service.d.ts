import { JwtService } from '@nestjs/jwt';
import { IdentityService } from 'src/identity/identity.service';
export declare class AuthService {
    private readonly userService;
    private readonly jwtService;
    constructor(userService: IdentityService, jwtService: JwtService);
    validateUser(email: string, password: string): Promise<{
        id: number;
        name: string;
        email: string;
        status: boolean;
        role: import("../identity/identity.entity").Role;
    }>;
    login(user: any): Promise<{
        access_token: string;
    }>;
}
