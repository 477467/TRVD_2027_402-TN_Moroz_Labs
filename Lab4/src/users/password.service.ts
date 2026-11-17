import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';

/**
 * Хешування паролів алгоритмом bcrypt. Сіль генерується автоматично для кожного пароля
 * і входить до складу хеша, тому однакові паролі дають різні хеші.
 */
@Injectable()
export class PasswordService {
  private readonly cost: number;
  /** Хеш-«пустушка»: дозволяє витрачати однаковий час, коли логіна не існує (захист від перебору логінів). */
  readonly dummyHash: string;

  constructor(config: ConfigService) {
    this.cost = Number(config.get('BCRYPT_COST', 10));
    this.dummyHash = bcrypt.hashSync('dummy-password-for-timing', this.cost);
  }

  hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, this.cost);
  }

  verify(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
