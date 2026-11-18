import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { AuthService, setUnauthorizedHandler } from '../services/api';
import { tokenStorage } from '../services/api/tokenStorage';
import { UserDto } from '../types/api';

export type AuthStatus = 'loading' | 'authenticated' | 'anonymous';

/** Чому сесію завершено: користувач вийшов сам чи її втрачено (прострочені токени). */
export type SessionEnd = 'logout' | 'expired' | null;

export interface AuthContextValue {
  user: UserDto | null;
  status: AuthStatus;
  sessionEnd: SessionEnd;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

/** Глобальний стан автентифікації: хто увійшов і чи триває перевірка збереженої сесії. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(null);
  const [status, setStatus] = useState<AuthStatus>(AuthService.hasStoredSession() ? 'loading' : 'anonymous');
  const [sessionEnd, setSessionEnd] = useState<SessionEnd>(null);

  // HTTP-клієнт повідомляє, що сесію остаточно втрачено (refresh не допоміг)
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
      setSessionEnd('expired');
      setStatus('anonymous');
      toast.error('Сесію завершено. Увійдіть знову');
    });
  }, []);

  // при запуску застосунку відновлюємо сесію за збереженим токеном
  useEffect(() => {
    if (!AuthService.hasStoredSession()) return;
    let cancelled = false;
    AuthService.me()
      .then((me) => {
        if (cancelled) return;
        setUser(me);
        setStatus('authenticated');
      })
      .catch(() => {
        if (cancelled) return;
        tokenStorage.clear();
        setUser(null);
        setStatus('anonymous');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const me = await AuthService.login(username, password);
    setUser(me);
    setSessionEnd(null);
    setStatus('authenticated');
  }, []);

  const register = useCallback(async (username: string, password: string) => {
    await AuthService.register(username, password);
  }, []);

  const logout = useCallback(async () => {
    await AuthService.logout();
    setUser(null);
    setSessionEnd('logout');
    setStatus('anonymous');
  }, []);

  const value = useMemo(
    () => ({ user, status, sessionEnd, login, register, logout }),
    [user, status, sessionEnd, login, register, logout],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth можна використовувати лише всередині AuthProvider');
  return ctx;
}
