import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { AuthTokens } from '../../types/api';
import { tokenStorage } from './tokenStorage';

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1';

/** Маршрути автентифікації: їхні 401 означають «невірні дані», а не «прострочений токен». */
const AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout'];
const isAuthPath = (url?: string) => AUTH_PATHS.some((p) => url?.includes(p));

/** Клієнт без interceptor-ів: потрібен для виклику /auth/refresh, щоб не зациклитися. */
export const rawClient: AxiosInstance = axios.create({ baseURL: API_URL, timeout: 15_000 });

/** Основний клієнт: усі сервіси працюють через нього. */
export const httpClient: AxiosInstance = axios.create({ baseURL: API_URL, timeout: 15_000 });

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

/** Колбек, який застосунок реєструє, щоб відреагувати на остаточну втрату сесії (розлогінення). */
let onUnauthorized: () => void = () => undefined;
export const setUnauthorizedHandler = (handler: () => void): void => {
  onUnauthorized = handler;
};

// ---------- Interceptor запитів: додає Authorization: Bearer <token> ----------
httpClient.interceptors.request.use((config) => {
  const token = tokenStorage.getAccess();
  if (token) config.headers.set('Authorization', `Bearer ${token}`);
  return config;
});

// ---------- Interceptor відповідей: обробка 401 ----------
/** Одночасні запити, що отримали 401, чекають на одне й те саме оновлення токена. */
let refreshing: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = tokenStorage.getRefresh();
  if (!refreshToken) return null;
  try {
    const { data } = await rawClient.post<AuthTokens>('/auth/refresh', { refreshToken });
    tokenStorage.save(data.accessToken, data.refreshToken);
    return data.accessToken;
  } catch {
    return null;
  }
}

httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined;
    const isUnauthorized = error.response?.status === 401;

    if (!isUnauthorized || !config || config._retried || isAuthPath(config.url)) {
      return Promise.reject(error);
    }

    config._retried = true;
    refreshing ??= refreshAccessToken().finally(() => {
      refreshing = null;
    });
    const newToken = await refreshing;

    if (newToken) {
      config.headers.set('Authorization', `Bearer ${newToken}`);
      return httpClient(config); // повторюємо запит із новим токеном
    }

    // оновити не вдалося: сесію втрачено, розлогінюємо користувача
    tokenStorage.clear();
    onUnauthorized();
    return Promise.reject(error);
  },
);
