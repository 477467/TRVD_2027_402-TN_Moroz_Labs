import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from '../entities/refresh-token.entity';

@Injectable()
export class RefreshTokensRepository {
  constructor(@InjectRepository(RefreshToken) private readonly repo: Repository<RefreshToken>) {}

  save(token: RefreshToken): Promise<RefreshToken> {
    return this.repo.save(token);
  }

  findById(id: string): Promise<RefreshToken | null> {
    return this.repo.findOne({ where: { id } });
  }

  async revoke(id: string): Promise<void> {
    await this.repo.update({ id }, { revoked: true });
  }

  /** Відкликає всі токени користувача (при підозрі на крадіжку refresh-токена). */
  async revokeAllForUser(userId: string): Promise<void> {
    await this.repo.update({ userId }, { revoked: true });
  }
}
