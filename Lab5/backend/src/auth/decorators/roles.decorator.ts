import { SetMetadata } from '@nestjs/common';
import { RoleName } from '../auth.types';

export const ROLES_KEY = 'roles';

/** Обмежує маршрут переліком ролей, наприклад @Roles('admin'). */
export const Roles = (...roles: RoleName[]) => SetMetadata(ROLES_KEY, roles);
