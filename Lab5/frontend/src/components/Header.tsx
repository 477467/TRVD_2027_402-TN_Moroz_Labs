import { useState } from 'react';
import toast from 'react-hot-toast';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { Button } from './Button';

const link = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'bg-surface-raised text-white' : 'text-slate-300 hover:text-white'}`;

/** Шапка сайту: навігація, ім’я користувача, роль і кнопка «Вихід». */
export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    toast.success('Ви вийшли із системи');
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-700 bg-surface-card/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-6">
          <Link to="/persons" className="flex items-center gap-2 text-lg font-semibold">
            <span aria-hidden="true" className="text-accent">◆</span> Кіберполіція
          </Link>
          <nav className="flex items-center gap-1" aria-label="Основна навігація">
            <NavLink to="/persons" className={link}>Особи</NavLink>
            {user?.role === 'admin' && <NavLink to="/users" className={link}>Користувачі</NavLink>}
          </nav>
        </div>
        {user && (
          <div className="flex items-center gap-3">
            <div className="text-right text-sm leading-tight">
              <div className="font-medium" data-testid="header-username">{user.username}</div>
              <div className="text-xs text-slate-400">{user.role === 'admin' ? 'Адміністратор' : 'Оператор'}</div>
            </div>
            <Button variant="secondary" onClick={handleLogout} loading={loggingOut}>Вихід</Button>
          </div>
        )}
      </div>
    </header>
  );
}
