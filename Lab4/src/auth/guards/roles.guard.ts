import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { JwtPayload, RoleName } from '../auth.types';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * Глобальний guard авторизації (RBAC): якщо маршрут вимагає ролі (@Roles),
 * роль із перевіреного токена має збігатися. Помилка: 403 Forbidden.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<RoleName[]>(ROLES_KEY, [context.getHandler(), context.getClass()]);
    if (!required || required.length === 0) return true;

    const user = context.switchToHttp().getRequest<Request & { user?: JwtPayload }>().user;
    if (!user || !required.includes(user.role)) {
      throw new ForbiddenException(`Недостатньо прав: потрібна роль ${required.join(' або ')}`);
    }
    return true;
  }
}
