import { AuthTokens, UserDto } from '../../types/api';
import { httpClient } from './httpClient';
import { tokenStorage } from './tokenStorage';

/** Усі запити автентифікації. Компоненти не викликають HTTP напряму. */
export const AuthService = {
  async register(username: string, password: string): Promise<UserDto> {
    const { data } = await httpClient.post<UserDto>('/auth/register', { username, password });
    return data;
  },

  /** Вхід: отримує токени, зберігає їх і повертає профіль користувача. */
  async login(username: string, password: string): Promise<UserDto> {
    const { data } = await httpClient.post<AuthTokens>('/auth/login', { username, password });
    tokenStorage.save(data.accessToken, data.refreshToken);
    return AuthService.me();
  },

  async me(): Promise<UserDto> {
    const { data } = await httpClient.get<UserDto>('/auth/me');
    return data;
  },

  /** Вихід: відкликає refresh-токен на сервері (помилку ігноруємо) і очищає сховище. */
  async logout(): Promise<void> {
    const refreshToken = tokenStorage.getRefresh();
    tokenStorage.clear();
    if (!refreshToken) return;
    try {
      await httpClient.post('/auth/logout', { refreshToken });
    } catch {
      /* сесію на клієнті вже завершено */
    }
  },

  hasStoredSession: (): boolean => Boolean(tokenStorage.getAccess() || tokenStorage.getRefresh()),
};
