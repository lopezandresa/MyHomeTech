import { IdentityService } from '../identity/identity.service';
import { ConfigService } from '@nestjs/config';
declare const JwtStrategy_base: new (...args: any) => any;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly idSvc;
    private readonly config;
    constructor(idSvc: IdentityService, config: ConfigService);
    validate(payload: any): Promise<Omit<import("../identity/identity.entity").Identity, "password">>;
}
export {};
