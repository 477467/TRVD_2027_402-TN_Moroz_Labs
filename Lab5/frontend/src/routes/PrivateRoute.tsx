import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { PageSpinner } from '../components/Spinner';
import { RoleName } from '../types/api';
import { useAuth } from '../store/AuthContext';
import { ForbiddenPage } from '../pages/ForbiddenPage';

/** Захищений маршрут: без входу перенаправляє на /login і запам’ятовує, куди користувач хотів потрапити. */
export function PrivateRoute() {
  const { status, sessionEnd } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <PageSpinner label="Перевірка сесії…" />;
  if (status === 'anonymous') {
    // після свідомого виходу пояснення не потрібне: користувач сам завершив сесію
    if (sessionEnd === 'logout') return <Navigate to="/login" replace state={{ reason: 'logout' }} />;
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search, reason: 'protected' }} />;
  }
  return <Outlet />;
}

/** Маршрут для певних ролей (наприклад, адмін-панель). Для інших ролей показує сторінку «Доступ заборонено». */
export function RoleRoute({ roles }: { roles: RoleName[] }) {
  const { user } = useAuth();
  if (!user || !roles.includes(user.role)) return <ForbiddenPage />;
  return <Outlet />;
}
