import { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { httpClient, rawClient, setUnauthorizedHandler } from './httpClient';
import { tokenStorage } from './tokenStorage';

type Responder = (config: InternalAxiosRequestConfig) => { status: number; data?: unknown };

/** Підміняє мережевий адаптер axios: тест не потребує справжнього сервера. */
function mockAdapter(client: typeof httpClient, responder: Responder) {
  const calls: InternalAxiosRequestConfig[] = [];
  client.defaults.adapter = async (config) => {
    calls.push(config);
    const { status, data } = responder(config);
    const response = { data, status, statusText: '', headers: {}, config } as AxiosResponse;
    if (status >= 200 && status < 300) return response;
    throw new AxiosError(`HTTP ${status}`, undefined, config, null, response);
  };
  return calls;
}

describe('HTTP-клієнт: interceptor запитів', () => {
  beforeEach(() => localStorage.clear());

  it('додає Authorization: Bearer, коли користувач залогінений', async () => {
    tokenStorage.save('ACCESS', 'REFRESH');
    const calls = mockAdapter(httpClient, () => ({ status: 200, data: {} }));
    await httpClient.get('/persons');
    expect(calls[0].headers.get('Authorization')).toBe('Bearer ACCESS');
  });

  it('не додає заголовок без токена', async () => {
    const calls = mockAdapter(httpClient, () => ({ status: 200, data: {} }));
    await httpClient.get('/persons');
    expect(calls[0].headers.get('Authorization')).toBeFalsy();
  });
});

describe('HTTP-клієнт: interceptor відповідей (401)', () => {
  const onUnauthorized = vi.fn();

  beforeEach(() => {
    localStorage.clear();
    onUnauthorized.mockReset();
    setUnauthorizedHandler(onUnauthorized);
  });

  it('оновлює токен через refresh і повторює запит', async () => {
    tokenStorage.save('OLD', 'REFRESH1');
    const calls = mockAdapter(httpClient, (c) =>
      c.headers.get('Authorization') === 'Bearer NEW' ? { status: 200, data: { ok: true } } : { status: 401 });
    const refreshCalls = mockAdapter(rawClient, () => ({ status: 200, data: { accessToken: 'NEW', refreshToken: 'REFRESH2' } }));

    const response = await httpClient.get('/persons');

    expect(response.data).toEqual({ ok: true });
    expect(calls).toHaveLength(2); // перша спроба та повтор
    expect(refreshCalls).toHaveLength(1);
    expect(tokenStorage.getAccess()).toBe('NEW');
    expect(tokenStorage.getRefresh()).toBe('REFRESH2');
    expect(onUnauthorized).not.toHaveBeenCalled();
  });

  it('розлогінює користувача, якщо refresh не вдався', async () => {
    tokenStorage.save('OLD', 'BAD');
    mockAdapter(httpClient, () => ({ status: 401 }));
    mockAdapter(rawClient, () => ({ status: 401 }));

    await expect(httpClient.get('/persons')).rejects.toMatchObject({ response: { status: 401 } });

    expect(onUnauthorized).toHaveBeenCalledTimes(1);
    expect(tokenStorage.getAccess()).toBeNull();
    expect(tokenStorage.getRefresh()).toBeNull();
  });

  it('401 на вході (невірний пароль) не запускає refresh і не розлогінює', async () => {
    tokenStorage.save('OLD', 'REFRESH1');
    mockAdapter(httpClient, () => ({ status: 401, data: { message: 'Невірний логін або пароль' } }));
    const refreshCalls = mockAdapter(rawClient, () => ({ status: 200 }));

    await expect(httpClient.post('/auth/login', {})).rejects.toBeDefined();

    expect(refreshCalls).toHaveLength(0);
    expect(onUnauthorized).not.toHaveBeenCalled();
  });

  it('кілька одночасних 401 призводять до одного оновлення токена', async () => {
    tokenStorage.save('OLD', 'REFRESH1');
    mockAdapter(httpClient, (c) => (c.headers.get('Authorization') === 'Bearer NEW' ? { status: 200, data: {} } : { status: 401 }));
    const refreshCalls = mockAdapter(rawClient, () => ({ status: 200, data: { accessToken: 'NEW', refreshToken: 'REFRESH2' } }));

    await Promise.all([httpClient.get('/persons'), httpClient.get('/cities'), httpClient.get('/crimes')]);

    expect(refreshCalls).toHaveLength(1);
  });

  it('без refresh-токена одразу розлогінює', async () => {
    mockAdapter(httpClient, () => ({ status: 401 }));
    await expect(httpClient.get('/persons')).rejects.toBeDefined();
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });
});
