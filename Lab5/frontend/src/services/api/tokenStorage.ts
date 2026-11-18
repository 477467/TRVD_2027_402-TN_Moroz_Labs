/**
 * Сховище токенів. Використано localStorage: токени переживають перезавантаження сторінки.
 * Компроміс: localStorage доступний будь-якому скрипту на сторінці, тому критично уникати XSS
 * (React екранує вивід, небезпечного innerHTML у проєкті немає).
 */
const ACCESS_KEY = 'cp_access_token';
const REFRESH_KEY = 'cp_refresh_token';

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export const tokenStorage = {
  getAccess: () => safeGet(ACCESS_KEY),
  getRefresh: () => safeGet(REFRESH_KEY),

  save(access: string, refresh: string): void {
    try {
      localStorage.setItem(ACCESS_KEY, access);
      localStorage.setItem(REFRESH_KEY, refresh);
    } catch {
      /* сховище недоступне (приватний режим): працюємо без збереження */
    }
  },

  clear(): void {
    try {
      localStorage.removeItem(ACCESS_KEY);
      localStorage.removeItem(REFRESH_KEY);
    } catch {
      /* ігноруємо */
    }
  },
};
