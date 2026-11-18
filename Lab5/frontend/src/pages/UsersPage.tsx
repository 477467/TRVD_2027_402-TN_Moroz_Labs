import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ErrorBox } from '../components/ErrorBox';
import { PageSpinner } from '../components/Spinner';
import { getErrorMessage, UsersService } from '../services/api';
import { useAuth } from '../store/AuthContext';
import { RoleName, UserDto } from '../types/api';
import { formatDateTime } from '../utils/format';

/** Адмін-панель: список користувачів і зміна ролей (доступна лише ролі admin). */
export function UsersPage() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    UsersService.list()
      .then((u) => !cancelled && setUsers(u))
      .catch((err) => !cancelled && setError(getErrorMessage(err)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const changeRole = async (target: UserDto, role: RoleName) => {
    setSavingId(target.id);
    try {
      const updated = await UsersService.changeRole(target.id, role);
      setUsers((list) => list.map((u) => (u.id === updated.id ? updated : u)));
      toast.success(`Роль користувача ${updated.username} змінено на ${role}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingId(null);
    }
  };

  if (loading) return <PageSpinner label="Завантаження користувачів…" />;
  if (error) return <ErrorBox message={error} onRetry={() => setReloadKey((k) => k + 1)} />;

  return (
    <section>
      <h1 className="text-2xl font-semibold">Користувачі</h1>
      <p className="mb-6 text-sm text-slate-400">Нова роль застосовується після наступного входу користувача.</p>
      <div className="overflow-x-auto rounded-lg border border-slate-700 bg-surface-card">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b border-slate-700 bg-surface-raised/50 text-xs uppercase tracking-wide text-slate-400">
            <tr><th className="px-4 py-3">Логін</th><th className="px-4 py-3">Роль</th><th className="px-4 py-3">Створено</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3 font-medium">{u.username}{u.id === me?.id && <span className="ml-2 text-xs text-slate-400">(ви)</span>}</td>
                <td className="px-4 py-3">
                  <select aria-label={`Роль користувача ${u.username}`} value={u.role} disabled={u.id === me?.id || savingId === u.id}
                    onChange={(e) => changeRole(u, e.target.value as RoleName)}
                    className="rounded-md border border-slate-600 bg-surface px-2 py-1 text-sm disabled:opacity-60">
                    <option value="operator">operator</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-slate-300">{formatDateTime(u.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
