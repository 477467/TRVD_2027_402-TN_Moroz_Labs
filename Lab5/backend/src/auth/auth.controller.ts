import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse, ApiBearerAuth, ApiConflictResponse, ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse,
  ApiOperation, ApiTags, ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { JwtPayload } from './auth.types';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { AuthTokensDto } from './dto/auth-tokens.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';

/** Контролер без логіки: усе виконує AuthService. */
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('register')
  @ApiOperation({ summary: 'Реєстрація (Sign Up): створює користувача з роллю operator' })
  @ApiCreatedResponse({ type: UserResponseDto })
  @ApiBadRequestResponse({ description: 'Помилка валідації' })
  @ApiConflictResponse({ description: 'Логін уже зайнятий' })
  register(@Body() dto: RegisterDto): Promise<UserResponseDto> {
    return this.service.register(dto);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } }) // захист від перебору паролів: 10 спроб на хвилину
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Вхід (Sign In): повертає пару access + refresh токенів' })
  @ApiOkResponse({ type: AuthTokensDto })
  @ApiUnauthorizedResponse({ description: 'Невірний логін або пароль' })
  login(@Body() dto: LoginDto): Promise<AuthTokensDto> {
    return this.service.login(dto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Оновити сесію за refresh-токеном (токен одноразовий)' })
  @ApiOkResponse({ type: AuthTokensDto })
  @ApiUnauthorizedResponse({ description: 'Refresh-токен недійсний' })
  refresh(@Body() dto: RefreshDto): Promise<AuthTokensDto> {
    return this.service.refresh(dto);
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Вихід: відкликає refresh-токен' })
  @ApiNoContentResponse({ description: 'Сесію завершено' })
  logout(@Body() dto: RefreshDto): Promise<void> {
    return this.service.logout(dto);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Поточний користувач (за токеном)' })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiUnauthorizedResponse({ description: 'Токен відсутній або недійсний' })
  me(@CurrentUser() user: JwtPayload): Promise<UserResponseDto> {
    return this.service.me(user.sub);
  }
}
