import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '../components/Button';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ErrorBox } from '../components/ErrorBox';
import { Pagination } from '../components/Pagination';
import { PageSpinner } from '../components/Spinner';
import { StatusBadge } from '../components/StatusBadge';
import { useDebounce } from '../hooks/useDebounce';
import { getErrorMessage, PersonsService, ReferenceService } from '../services/api';
import { useAuth } from '../store/AuthContext';
import { City, Person, PersonList } from '../types/api';
import { PAGE_SIZE, PERSON_STATUSES } from '../types/constants';
import { shortCrime } from '../utils/format';

const inputCls = 'rounded-md border border-slate-600 bg-surface px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-accent';

/** Головна сторінка: таблиця осіб з пошуком, фільтрами, пагінацією, видаленням. */
export function PersonsListPage() {
  const { user } = useAuth();
  const canDelete = user?.role === 'admin';
  const [params, setParams] = useSearchParams();

  const search = params.get('search') ?? '';
  const city = params.get('city') ?? '';
  const status = params.get('status') ?? '';
  const page = Math.max(1, Number(params.get('page')) || 1);

  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebounce(searchInput, 400);

  const [data, setData] = useState<PersonList | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [toDelete, setToDelete] = useState<Person | null>(null);
  const [deleting, setDeleting] = useState(false);

  /** Оновлює параметри адреси (пошук, фільтри, сторінка); при зміні фільтра повертає на 1-шу сторінку. */
  const update = useCallback((changes: Record<string, string>, resetPage = true) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
      if (resetPage) next.delete('page');
      return next;
    }, { replace: true });
  }, [setParams]);

  useEffect(() => {
    if (debouncedSearch !== search) update({ search: debouncedSearch });
  }, [debouncedSearch, search, update]);

  useEffect(() => {
    ReferenceService.cities().then(setCities).catch(() => setCities([]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    PersonsService.list({ search, city, status, page, limit: PAGE_SIZE })
      .then((result) => !cancelled && setData(result))
      .catch((err) => !cancelled && setError(getErrorMessage(err)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [search, city, status, page, reloadKey]);

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await PersonsService.remove(toDelete.id);
      toast.success(`Запис ${toDelete.id} видалено`);
      setToDelete(null);
      if (data && data.items.length === 1 && page > 1) update({ page: String(page - 1) }, false);
      else setReloadKey((k) => k + 1);
    } catch (err) {
      toast.error(getErrorMessage(err));
      setToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  const hasFilters = Boolean(search || city || status);

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Облік осіб</h1>
          <p className="text-sm text-slate-400">{data ? `Знайдено записів: ${data.total}` : 'Завантаження списку…'}</p>
        </div>
        <Link to="/persons/new" className="rounded-md bg-accent-strong px-4 py-2 text-sm font-medium text-white hover:bg-accent">
          + Додати особу
        </Link>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_auto]">
        <input type="search" aria-label="Пошук" placeholder="Пошук за прізвищем, ID, датою, містом, кваліфікацією…"
          value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className={inputCls} />
        <select aria-label="Фільтр за містом" value={city} onChange={(e) => update({ city: e.target.value })} className={inputCls}>
          <option value="">Усі міста</option>
          {cities.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
        </select>
        <select aria-label="Фільтр за статусом" value={status} onChange={(e) => update({ status: e.target.value })} className={inputCls}>
          <option value="">Усі статуси</option>
          {PERSON_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <Button variant="ghost" disabled={!hasFilters} onClick={() => { setSearchInput(''); setParams({}, { replace: true }); }}>
          Скинути
        </Button>
      </div>

      {error ? (
        <ErrorBox message={error} onRetry={() => setReloadKey((k) => k + 1)} />
      ) : loading && !data ? (
        <PageSpinner label="Завантаження списку…" />
      ) : data && data.items.length === 0 ? (
        <div className="rounded-lg border border-slate-700 bg-surface-card p-10 text-center text-slate-400">
          {hasFilters ? 'За вашим запитом нічого не знайдено' : 'Записів поки немає'}
        </div>
      ) : (
        <div className={`overflow-x-auto rounded-lg border border-slate-700 bg-surface-card transition-opacity ${loading ? 'opacity-60' : ''}`}>
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-slate-700 bg-surface-raised/50 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">ПІБ</th>
                <th className="px-4 py-3">Дата народж.</th>
                <th className="px-4 py-3">Місто</th>
                <th className="px-4 py-3">Статус</th>
                <th className="px-4 py-3">Кваліфікації</th>
                <th className="px-4 py-3 text-right">Дії</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {data?.items.map((p) => (
                <tr key={p.id} className="hover:bg-surface-raised/30">
                  <td className="px-4 py-3 font-mono text-xs text-slate-300">{p.id}</td>
                  <td className="px-4 py-3 font-medium">
                    <Link to={`/persons/${p.id}`} className="hover:text-accent hover:underline">{p.fullName}</Link>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{p.dob}</td>
                  <td className="px-4 py-3 text-slate-300">{p.city}</td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-3 text-xs text-slate-300">{p.crimes.map((c) => shortCrime(c.title)).join(', ') || '–'}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link to={`/persons/${p.id}`} className="rounded px-2 py-1 text-xs text-slate-200 hover:bg-surface-raised">Деталі</Link>
                      <Link to={`/persons/${p.id}/edit`} className="rounded px-2 py-1 text-xs text-accent hover:bg-surface-raised">Редагувати</Link>
                      {canDelete && (
                        <button type="button" onClick={() => setToDelete(p)} className="rounded px-2 py-1 text-xs text-red-400 hover:bg-red-500/10">
                          Видалити
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && <Pagination page={page} total={data.total} limit={PAGE_SIZE} onChange={(p) => update({ page: String(p) }, false)} />}

      <ConfirmDialog open={toDelete !== null} title="Видалити запис?" loading={deleting} confirmLabel="Видалити"
        message={toDelete ? `Ви впевнені, що хочете видалити запис ${toDelete.id} (${toDelete.fullName})? Цю дію не можна скасувати.` : ''}
        onConfirm={confirmDelete} onCancel={() => setToDelete(null)} />
    </section>
  );
}
