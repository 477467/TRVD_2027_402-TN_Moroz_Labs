import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { createHash, randomUUID, timingSafeEqual } from 'crypto';
import { RefreshToken } from '../entities/refresh-token.entity';
import { User } from '../entities/user.entity';
import { PasswordService } from '../users/password.service';
import { UserMapper } from '../users/user.mapper';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { UsersRepository } from '../users/users.repository';
import { AuthTokensDto } from './dto/auth-tokens.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokensRepository } from './refresh-tokens.repository';
import { TokensService } from './tokens.service';

const sha256 = (value: string) => createHash('sha256').update(value).digest('hex');
const safeEqual = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));
const normalizeUsername = (u: string) => u.trim().toLowerCase();

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersRepository,
    private readonly passwords: PasswordService,
    private readonly tokens: TokensService,
    private readonly refreshTokens: RefreshTokensRepository,
  ) {}

  /** Реєстрація: пароль хешується, роль завжди operator (обирати роль клієнт не може). */
  async register(dto: RegisterDto): Promise<UserResponseDto> {
    const username = normalizeUsername(dto.username);
    if (Buffer.byteLength(dto.password, 'utf8') > 72) {
      throw new BadRequestException('Пароль задовгий: bcrypt обробляє не більше 72 байт');
    }
    if (await this.users.findByUsername(username)) {
      throw new ConflictException('Користувач із таким логіном уже існує');
    }
    const role = await this.users.findRoleByName('operator');
    if (!role) throw new Error('Роль operator відсутня в БД');

    const user = new User();
    user.username = username;
    user.passwordHash = await this.passwords.hash(dto.password);
    user.role = role;
    return UserMapper.toDto(await this.users.save(user));
  }

  /** Вхід: порівняння пароля з хешем. Однакова помилка для хибного логіна й хибного пароля. */
  async login(dto: LoginDto): Promise<AuthTokensDto> {
    const user = await this.users.findByUsername(normalizeUsername(dto.username));
    const valid = await this.passwords.verify(dto.password, user?.passwordHash ?? this.passwords.dummyHash);
    if (!user || !valid) throw new UnauthorizedException('Невірний логін або пароль');
    return this.issueTokens(user);
  }

  /** Оновлення сесії. Refresh-токен одноразовий: після використання видається нова пара. */
  async refresh(dto: RefreshDto): Promise<AuthTokensDto> {
    let payload;
    try {
      payload = await this.tokens.verifyRefresh(dto.refreshToken);
    } catch {
      throw new UnauthorizedException('Refresh-токен недійсний або прострочений');
    }
    const record = await this.refreshTokens.findById(payload.jti);
    if (!record || record.userId !== payload.sub || !safeEqual(record.tokenHash, sha256(dto.refreshToken))) {
      throw new UnauthorizedException('Refresh-токен недійсний');
    }
    if (record.revoked || record.expiresAt.getTime() < Date.now()) {
      // повторне використання відкликаного токена: можлива крадіжка, закриваємо всі сесії користувача
      if (record.revoked) await this.refreshTokens.revokeAllForUser(record.userId);
      throw new UnauthorizedException('Refresh-токен більше не дійсний, увійдіть повторно');
    }
    const user = await this.users.findById(payload.sub);
    if (!user) throw new UnauthorizedException('Користувача не знайдено');

    await this.refreshTokens.revoke(record.id);
    return this.issueTokens(user);
  }

  /** Вихід: refresh-токен відкликається. Операція ідемпотентна. */
  async logout(dto: RefreshDto): Promise<void> {
    try {
      const payload = await this.tokens.verifyRefresh(dto.refreshToken);
      await this.refreshTokens.revoke(payload.jti);
    } catch {
      /* недійсний токен вже нічого не дає, тому виходимо без помилки */
    }
  }

  async me(userId: string): Promise<UserResponseDto> {
    const user = await this.users.findById(userId);
    if (!user) throw new UnauthorizedException('Користувача не знайдено');
    return UserMapper.toDto(user);
  }

  private async issueTokens(user: User): Promise<AuthTokensDto> {
    const accessToken = await this.tokens.signAccess({ id: user.id, username: user.username, role: user.role.name });
    const jti = randomUUID();
    const refresh = await this.tokens.signRefresh(user.id, jti);

    const record = new RefreshToken();
    record.id = jti;
    record.userId = user.id;
    record.tokenHash = sha256(refresh.token);
    record.expiresAt = refresh.expiresAt;
    record.revoked = false;
    await this.refreshTokens.save(record);

    return { accessToken, refreshToken: refresh.token, tokenType: 'Bearer', expiresIn: this.tokens.accessTtlSeconds };
  }
}
