import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonsModule } from './persons/persons.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
    PersonsModule,
  ],
})
export class AppModule {}
