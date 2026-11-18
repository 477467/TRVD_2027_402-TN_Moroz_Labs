// @vitest-environment node
/**
 * «Живий» інтеграційний тест: перевіряє справжні сервіси й interceptor проти запущеного API.
 * Запуск: npm run test:live (бекенд і БД мають працювати; створює тестові записи).
 */
import { beforeAll, describe, expect, it, vi } from 'vitest';

class MemoryStorage {
  private data = new Map<string, string>();
  getItem = (k: string) => this.data.get(k) ?? null;
  setItem = (k: string, v: string) => void this.data.set(k, v);
  removeItem = (k: string) => void this.data.delete(k);
  clear = () => this.data.clear();
}
(globalThis as unknown as { localStorage: MemoryStorage }).localStorage = new MemoryStorage();

const live = Boolean(process.env.LIVE_API);
const adminLogin = process.env.LIVE_ADMIN_USER ?? 'admin';
const adminPassword = process.env.LIVE_ADMIN_PASSWORD ?? 'Admin2027Pass';

describe.skipIf(!live)('інтеграція фронтенд-сервісів з API', () => {
  const username = `live_${Date.now()}`;
  const password = 'LiveTest2027';
  let createdId = '';
  let AuthService: typeof import('./authService').AuthService;
  let PersonsService: typeof import('./personsService').PersonsService;
  let ReferenceService: typeof import('./referenceService').ReferenceService;
  let UsersService: typeof import('./usersService').UsersService;
  let tokenStorage: typeof import('./tokenStorage').tokenStorage;
  let setUnauthorizedHandler: typeof import('./httpClient').setUnauthorizedHandler;
  let getStatus: typeof import('./errors').getStatus;
  const onUnauthorized = vi.fn();

  beforeAll(async () => {
    ({ AuthService } = await import('./authService'));
    ({ PersonsService } = await import('./personsService'));
    ({ ReferenceService } = await import('./referenceService'));
    ({ UsersService } = await import('./usersService'));
    ({ tokenStorage } = await import('./tokenStorage'));
    ({ setUnauthorizedHandler } = await import('./httpClient'));
    ({ getStatus } = await import('./errors'));
    setUnauthorizedHandler(onUnauthorized);
  });

  it('реєстрація та вхід: токени зберігаються, профіль повертається', async () => {
    const registered = await AuthService.register(username, password);
    expect(registered.role).toBe('operator');
    const me = await AuthService.login(username, password);
    expect(me.username).toBe(username);
    expect(tokenStorage.getAccess()).toBeTruthy();
  });

  it('довідники та список доступні із токеном (interceptor додає Authorization)', async () => {
    expect((await ReferenceService.cities()).length).toBeGreaterThan(0);
    expect((await ReferenceService.crimes()).length).toBeGreaterThan(0);
    const list = await PersonsService.list({ page: 1, limit: 2 });
    expect(list.items.length).toBeLessThanOrEqual(2);
    expect(list.total).toBeGreaterThanOrEqual(1);
  });

  it('CRUD: створення, перегляд, заміна', async () => {
    const created = await PersonsService.create({
      name: 'Тест', surname: 'Фронтенд', dob: '1995-05-05', city: 'Київ', status: 'Свідок', crimeIds: [1],
    });
    createdId = created.id;
    expect(created.crimes).toHaveLength(1);
    const replaced = await PersonsService.replace(createdId, {
      name: 'Тест', surname: 'Оновлений', dob: '1995-05-05', city: 'Львів', status: 'Свідок',
    });
    expect(replaced.surname).toBe('Оновлений');
    expect(replaced.crimes).toHaveLength(0);
    expect((await PersonsService.get(createdId)).city).toBe('Львів');
  });

  it('помилки сервера мають код: 400 валідація, 404 немає запису', async () => {
    const bad = PersonsService.create({ name: '', surname: 'X', dob: '2999-01-01', city: 'Київ', status: 'Свідок' });
    await expect(bad).rejects.toBeDefined();
    await bad.catch((e) => expect(getStatus(e)).toBe(400));
    await PersonsService.get('CP-99999').catch((e) => expect(getStatus(e)).toBe(404));
  });

  it('прострочений access-токен прозоро оновлюється через refresh', async () => {
    const refresh = tokenStorage.getRefresh()!;
    tokenStorage.save('прострочений.недійсний.токен', refresh);
    const list = await PersonsService.list({ limit: 1 });
    expect(list.items).toBeDefined();
    expect(tokenStorage.getAccess()).not.toBe('прострочений.недійсний.токен');
    expect(onUnauthorized).not.toHaveBeenCalled();
  });

  it('оператор не може видаляти (403) та керувати користувачами (403)', async () => {
    await PersonsService.remove(createdId).then(
      () => { throw new Error('очікувалась помилка 403'); },
      (e) => expect(getStatus(e)).toBe(403),
    );
    await UsersService.list().then(
      () => { throw new Error('очікувалась помилка 403'); },
      (e) => expect(getStatus(e)).toBe(403),
    );
  });

  it('адміністратор видаляє запис і бачить користувачів', async () => {
    await AuthService.logout();
    await AuthService.login(adminLogin, adminPassword);
    expect((await UsersService.list()).length).toBeGreaterThanOrEqual(2);
    await PersonsService.remove(createdId);
    await PersonsService.get(createdId).catch((e) => expect(getStatus(e)).toBe(404));
  });

  it('після виходу токени очищено, а недійсна сесія викликає розлогінення', async () => {
    await AuthService.logout();
    expect(tokenStorage.getAccess()).toBeNull();
    tokenStorage.save('недійсний', 'недійсний');
    await PersonsService.list().then(
      () => { throw new Error('очікувалась помилка 401'); },
      (e) => expect(getStatus(e)).toBe(401),
    );
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
    expect(tokenStorage.getAccess()).toBeNull();
  });
});
