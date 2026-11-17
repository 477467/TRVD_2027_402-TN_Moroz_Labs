import { Body, Controller, Get, Param, ParseUUIDPipe, Patch } from '@nestjs/common';
import {
  ApiBadRequestResponse, ApiBearerAuth, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation,
  ApiTags, ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtPayload } from '../auth/auth.types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { ChangeRoleDto } from './dto/change-role.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UsersService } from './users.service';

/** Керування користувачами: тільки для ролі admin. */
@ApiTags('users')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Токен відсутній або недійсний' })
@ApiForbiddenResponse({ description: 'Потрібна роль admin' })
@Roles('admin')
@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Список користувачів (admin)' })
  @ApiOkResponse({ type: [UserResponseDto] })
  list(): Promise<UserResponseDto[]> {
    return this.service.list();
  }

  @Patch(':id/role')
  @ApiOperation({ summary: 'Змінити роль користувача (admin)' })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiBadRequestResponse({ description: 'Некоректні дані або спроба змінити власну роль' })
  @ApiNotFoundResponse({ description: 'Користувача не знайдено' })
  changeRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ChangeRoleDto,
    @CurrentUser() actor: JwtPayload,
  ): Promise<UserResponseDto> {
    return this.service.changeRole(id, dto.role, actor.sub);
  }
}
