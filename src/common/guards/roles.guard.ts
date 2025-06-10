// src/common/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(ROLES_KEY, ctx.getHandler());
    if (!requiredRoles) {
      return true;       // no hay roles definidos, dejo pasar
    }

    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      // si no hay user aún, deniego de plano
      return false;
    }

    return requiredRoles.includes(user.role);
  }
}
