import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { RefreshToken } from '../entities/refresh-token.entity';
import { User } from '../entities/user.entity';
import { PasswordService } from '../users/password.service';
import { AuthService } from './auth.service';
import { TokensService } from './tokens.service';

const settings: Record<string, unknown> = {
  JWT_ACCESS_SECRET: 'a'.repeat(40),
  JWT_REFRESH_SECRET: 'b'.repeat(40),
  BCRYPT_COST: 4, // низька вартість лише для швидких тестів
};
const config = { get: (key: string, fallback?: unknown) => settings[key] ?? fallback } as unknown as ConfigService;

describe('AuthService', () => {
  let service: AuthService;
  let tokens: TokensService;
  let passwords: PasswordService;
  let savedUser: User | undefined;
  const store = new Map<string, RefreshToken>();
  const revokeAll = jest.fn();

  const users = {
    findByUsername: jest.fn(),
    findById: jest.fn(),
    findRoleByName: jest.fn(),
    save: jest.fn(),
  };
  const refreshRepo = {
    save: async (t: RefreshToken) => { store.set(t.id, { ...t }); return t; },
    findById: async (id: string) => store.get(id) ?? null,
    revoke: async (id: string) => { const t = store.get(id); if (t) t.revoked = true; },
    revokeAllForUser: revokeAll,
  };

  const makeUser = async (password: string, role = 'operator'): Promise<User> =>
    Object.assign(new User(), {
      id: '11111111-1111-1111-1111-111111111111', username: 'operator1',
      passwordHash: await passwords.hash(password), role: { id: 2, name: role }, createdAt: new Date(),
    });

  beforeEach(() => {
    jest.clearAllMocks();
    store.clear();
    savedUser = undefined;
    passwords = new PasswordService(config);
    tokens = new TokensService(new JwtService({}), config);
    service = new AuthService(users as never, passwords, tokens, refreshRepo as never);
    users.save.mockImplementation(async (u: User) => { savedUser = u; return Object.assign(u, { id: 'new-id', createdAt: new Date() }); });
  });

  it('реєстрація зберігає хеш bcrypt, а не пароль, і призначає роль operator', async () => {
    users.findByUsername.mockResolvedValue(null);
    users.findRoleByName.mockResolvedValue({ id: 2, name: 'operator' });

    const dto = await service.register({ username: 'Operator1', password: 'Strong2027Pass' });

    expect(savedUser!.passwordHash).not.toBe('Strong2027Pass');
    expect(savedUser!.passwordHash.startsWith('$2')).toBe(true);
    expect(await bcrypt.compare('Strong2027Pass', savedUser!.passwordHash)).toBe(true);
    expect(dto.role).toBe('operator');
    expect(dto.username).toBe('operator1');
    expect(JSON.stringify(dto)).not.toContain('passwordHash');
  });

  it('однакові паролі дають різні хеші (сіль)', async () => {
    expect(await passwords.hash('SamePass123')).not.toBe(await passwords.hash('SamePass123'));
  });

  it('не дозволяє зареєструвати зайнятий логін (409)', async () => {
    users.findByUsername.mockResolvedValue(await makeUser('Strong2027Pass'));
    await expect(service.register({ username: 'operator1', password: 'Strong2027Pass' })).rejects.toBeInstanceOf(ConflictException);
  });

  it('вхід видає access-токен з ID користувача та роллю', async () => {
    users.findByUsername.mockResolvedValue(await makeUser('Strong2027Pass', 'admin'));
    const result = await service.login({ username: 'operator1', password: 'Strong2027Pass' });
    const payload = await tokens.verifyAccess(result.accessToken);
    expect(payload.sub).toBe('11111111-1111-1111-1111-111111111111');
    expect(payload.role).toBe('admin');
    expect(result.expiresIn).toBe(900);
  });

  it('хибний пароль і неіснуючий логін дають однакову помилку 401', async () => {
    users.findByUsername.mockResolvedValueOnce(await makeUser('Strong2027Pass'));
    const wrongPassword = service.login({ username: 'operator1', password: 'WrongPass123' });
    await expect(wrongPassword).rejects.toBeInstanceOf(UnauthorizedException);

    users.findByUsername.mockResolvedValueOnce(null);
    const unknownUser = service.login({ username: 'nobody', password: 'Strong2027Pass' });
    await expect(unknownUser).rejects.toThrow('Невірний логін або пароль');
  });

  it('refresh видає нову пару й відкликає старий токен', async () => {
    const user = await makeUser('Strong2027Pass');
    users.findByUsername.mockResolvedValue(user);
    users.findById.mockResolvedValue(user);
    const first = await service.login({ username: 'operator1', password: 'Strong2027Pass' });

    const second = await service.refresh({ refreshToken: first.refreshToken });

    expect(second.refreshToken).not.toBe(first.refreshToken);
    await expect(service.refresh({ refreshToken: first.refreshToken })).rejects.toBeInstanceOf(UnauthorizedException);
    expect(revokeAll).toHaveBeenCalledWith(user.id); // повторне використання старого токена закриває всі сесії
  });

  it('refresh відхиляє підроблений токен', async () => {
    await expect(service.refresh({ refreshToken: 'not.a.jwt' })).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
