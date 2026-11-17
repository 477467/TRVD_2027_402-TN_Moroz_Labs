import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { PersonsModule } from './persons/persons.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]), // загальний ліміт: 120 запитів на хвилину з однієї адреси
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        host: config.get<string>('DB_HOST', 'localhost'),
        port: Number(config.get('DB_PORT', 5433)),
        username: config.get<string>('DB_USER', 'cyber'),
        password: config.get<string>('DB_PASSWORD', 'cyber_password'),
        database: config.get<string>('DB_NAME', 'cyberpolice'),
        entities: [__dirname + '/entities/*.entity.{ts,js}'],
        synchronize: false, // схему створюють SQL-скрипти з db/init
        logging: config.get('DB_LOGGING') === 'true',
      }),
    }),
    UsersModule,
    AuthModule,
    PersonsModule,
  ],
  providers: [
    // порядок важливий: ліміт запитів → автентифікація (401) → ролі (403)
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
