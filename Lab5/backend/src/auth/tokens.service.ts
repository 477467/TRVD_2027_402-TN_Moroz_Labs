import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload, RefreshPayload } from './auth.types';

const MIN_SECRET_LENGTH = 32;

/** Випуск і перевірка JWT. Access і refresh підписуються РІЗНИМИ секретами алгоритмом HS256. */
@Injectable()
export class TokensService implements OnModuleInit {
  constructor(private readonly jwt: JwtService, private readonly config: ConfigService) {}

  /** Застосунок не запускається без достатньо довгих секретів. */
  onModuleInit(): void {
    const access = this.secret('JWT_ACCESS_SECRET');
    const refresh = this.secret('JWT_REFRESH_SECRET');
    if (access === refresh) throw new Error('JWT_ACCESS_SECRET і JWT_REFRESH_SECRET мають відрізнятися');
  }

  get accessTtlSeconds(): number {
    return Number(this.config.get('JWT_ACCESS_TTL_SECONDS', 900)); // 15 хвилин
  }

  get refreshTtlSeconds(): number {
    return Number(this.config.get('JWT_REFRESH_TTL_SECONDS', 604800)); // 7 діб
  }

  signAccess(user: { id: string; username: string; role: string }): Promise<string> {
    return this.jwt.signAsync(
      { username: user.username, role: user.role },
      { secret: this.secret('JWT_ACCESS_SECRET'), subject: user.id, expiresIn: this.accessTtlSeconds, algorithm: 'HS256' },
    );
  }

  async signRefresh(userId: string, jti: string): Promise<{ token: string; expiresAt: Date }> {
    const token = await this.jwt.signAsync(
      {},
      { secret: this.secret('JWT_REFRESH_SECRET'), subject: userId, jwtid: jti, expiresIn: this.refreshTtlSeconds, algorithm: 'HS256' },
    );
    return { token, expiresAt: new Date(Date.now() + this.refreshTtlSeconds * 1000) };
  }

  verifyAccess(token: string): Promise<JwtPayload> {
    return this.jwt.verifyAsync<JwtPayload>(token, { secret: this.secret('JWT_ACCESS_SECRET'), algorithms: ['HS256'] });
  }

  verifyRefresh(token: string): Promise<RefreshPayload> {
    return this.jwt.verifyAsync<RefreshPayload>(token, { secret: this.secret('JWT_REFRESH_SECRET'), algorithms: ['HS256'] });
  }

  private secret(key: string): string {
    const value = this.config.get<string>(key);
    if (!value || value.length < MIN_SECRET_LENGTH) {
      throw new Error(`${key} має бути заданий у .env і містити щонайменше ${MIN_SECRET_LENGTH} символів`);
    }
    return value;
  }
}
