import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { RoleName } from '../auth/auth.types';
import { UserResponseDto } from './dto/user-response.dto';
import { UserMapper } from './user.mapper';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly users: UsersRepository) {}

  async list(): Promise<UserResponseDto[]> {
    return (await this.users.findAll()).map(UserMapper.toDto);
  }

  /** Зміна ролі. Нова роль потрапить у токен після наступного входу або оновлення токена. */
  async changeRole(id: string, role: RoleName, actorId: string): Promise<UserResponseDto> {
    if (id === actorId) {
      throw new BadRequestException('Не можна змінювати роль власного облікового запису');
    }
    const user = await this.users.findById(id);
    if (!user) throw new NotFoundException(`Користувача ${id} не знайдено`);
    const newRole = await this.users.findRoleByName(role);
    if (!newRole) throw new BadRequestException(`Роль «${role}» не існує`);
    user.role = newRole;
    return UserMapper.toDto(await this.users.save(user));
  }
}
