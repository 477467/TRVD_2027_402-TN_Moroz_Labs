import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TokensService } from '../tokens.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';

const contextFor = (request: Record<string, unknown>): ExecutionContext =>
  ({
    getHandler: () => () => undefined,
    getClass: () => class {},
    switchToHttp: () => ({ getRequest: () => request }),
  }) as unknown as ExecutionContext;

describe('JwtAuthGuard', () => {
  const reflector = { getAllAndOverride: jest.fn() };
  const tokens = { verifyAccess: jest.fn() };
  const guard = new JwtAuthGuard(reflector as unknown as Reflector, tokens as unknown as TokensService);

  beforeEach(() => jest.resetAllMocks());

  it('пропускає публічні маршрути без токена', async () => {
    reflector.getAllAndOverride.mockReturnValue(true);
    await expect(guard.canActivate(contextFor({ headers: {} }))).resolves.toBe(true);
  });

  it('повертає 401, якщо токена немає', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    await expect(guard.canActivate(contextFor({ headers: {} }))).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('повертає 401 для недійсного токена', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    tokens.verifyAccess.mockRejectedValue(new Error('invalid'));
    const request = { headers: { authorization: 'Bearer bad.token' } };
    await expect(guard.canActivate(contextFor(request))).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('кладе дані користувача в запит при валідному токені', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    tokens.verifyAccess.mockResolvedValue({ sub: 'u1', username: 'op', role: 'operator' });
    const request: Record<string, unknown> = { headers: { authorization: 'Bearer good.token' } };
    await expect(guard.canActivate(contextFor(request))).resolves.toBe(true);
    expect(request.user).toMatchObject({ sub: 'u1', role: 'operator' });
  });
});

describe('RolesGuard', () => {
  const reflector = { getAllAndOverride: jest.fn() };
  const guard = new RolesGuard(reflector as unknown as Reflector);

  beforeEach(() => jest.resetAllMocks());

  it('пропускає маршрут без вимог до ролі', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    expect(guard.canActivate(contextFor({ user: { role: 'operator' } }))).toBe(true);
  });

  it('пропускає admin на адмінський маршрут', () => {
    reflector.getAllAndOverride.mockReturnValue(['admin']);
    expect(guard.canActivate(contextFor({ user: { role: 'admin' } }))).toBe(true);
  });

  it('повертає 403 для operator на адмінському маршруті', () => {
    reflector.getAllAndOverride.mockReturnValue(['admin']);
    expect(() => guard.canActivate(contextFor({ user: { role: 'operator' } }))).toThrow(ForbiddenException);
  });
});
