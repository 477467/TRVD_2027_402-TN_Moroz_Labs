import { User } from '../entities/user.entity';
import { UserResponseDto } from './dto/user-response.dto';

export class UserMapper {
  static toDto(user: User): UserResponseDto {
    return { id: user.id, username: user.username, role: user.role.name, createdAt: user.createdAt.toISOString() };
  }
}
