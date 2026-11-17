import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/** Позначає маршрут як публічний: токен не потрібен (реєстрація, вхід тощо). */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
