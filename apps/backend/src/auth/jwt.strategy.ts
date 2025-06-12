import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IdentityService } from '../identity/identity.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly idSvc: IdentityService,
    private readonly config: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') || 'SECRET_KEY',
    });
  }

  async validate(payload: any) {
    const user = await this.idSvc.findByEmailNoPass(payload.email);
    if (!user) {
      throw new UnauthorizedException('Token inválido');
    }
    return user; // req.user = Identity sin password
  }
}