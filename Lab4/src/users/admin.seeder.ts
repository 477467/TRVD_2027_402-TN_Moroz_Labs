import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '../entities/user.entity';
import { PasswordService } from './password.service';
import { UsersRepository } from './users.repository';

/**
 * Створює першого адміністратора за даними з .env (ADMIN_USERNAME, ADMIN_PASSWORD).
 * Через публічну реєстрацію отримати роль admin неможливо.
 */
@Injectable()
export class AdminSeeder implements OnApplicationBootstrap {
  private readonly logger = new Logger(AdminSeeder.name);

  constructor(
    private readonly config: ConfigService,
    private readonly users: UsersRepository,
    private readonly passwords: PasswordService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const username = this.config.get<string>('ADMIN_USERNAME')?.trim().toLowerCase();
    const password = this.config.get<string>('ADMIN_PASSWORD');
    if (!username || !password) {
      this.logger.warn('ADMIN_USERNAME / ADMIN_PASSWORD не задано: адміністратора не створено');
      return;
    }
    if (await this.users.findByUsername(username)) return;

    const role = await this.users.findRoleByName('admin');
    if (!role) {
      this.logger.error('Роль admin відсутня в БД: виконайте скрипти з db/init');
      return;
    }
    const admin = new User();
    admin.username = username;
    admin.passwordHash = await this.passwords.hash(password);
    admin.role = role;
    await this.users.save(admin);
    this.logger.log(`Створено адміністратора «${username}»`);
  }
}
