import { RoleName, UserDto } from '../../types/api';
import { httpClient } from './httpClient';

/** Керування користувачами (лише для ролі admin). */
export const UsersService = {
  async list(): Promise<UserDto[]> {
    const { data } = await httpClient.get<UserDto[]>('/users');
    return data;
  },

  async changeRole(id: string, role: RoleName): Promise<UserDto> {
    const { data } = await httpClient.patch<UserDto>(`/users/${id}/role`, { role });
    return data;
  },
};
