import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { JwtPayload } from '../auth.types';

/** Повертає дані користувача з перевіреного токена (їх поклав JwtAuthGuard). */
export const CurrentUser = createParamDecorator((_: unknown, ctx: ExecutionContext): JwtPayload => {
  return (ctx.switchToHttp().getRequest<Request & { user: JwtPayload }>()).user;
});
