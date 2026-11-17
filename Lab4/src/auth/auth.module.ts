import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from '../entities/refresh-token.entity';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RefreshTokensRepository } from './refresh-tokens.repository';
import { TokensService } from './tokens.service';

@Module({
  imports: [UsersModule, TypeOrmModule.forFeature([RefreshToken]), JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, TokensService, RefreshTokensRepository],
  exports: [TokensService],
})
export class AuthModule {}
