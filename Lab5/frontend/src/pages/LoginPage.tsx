import { FormEvent, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { TextField } from '../components/Fields';
import { getErrorMessages } from '../services/api';
import { useAuth } from '../store/AuthContext';
import { hasErrors, LoginField, validateLogin } from '../utils/validators';
import { AuthLayout } from './AuthLayout';

interface LocationState {
  from?: string;
  reason?: 'protected' | 'logout';
  registeredUsername?: string;
}

export function LoginPage() {
  const { login, status } = useAuth();
  const navigate = useNavigate();
  const state = (useLocation().state ?? {}) as LocationState;

  const [values, setValues] = useState({ username: state.registeredUsername ?? '', password: '' });
  const [touched, setTouched] = useState<Partial<Record<LoginField, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverErrors, setServerErrors] = useState<string[]>([]);

  if (status === 'authenticated') return <Navigate to={state.from ?? '/persons'} replace />;

  const errors = validateLogin(values);
  const show = (f: LoginField) => (submitted || touched[f] ? errors[f] : undefined);
  const set = (f: LoginField) => (e: { target: { value: string } }) => {
    setValues((v) => ({ ...v, [f]: e.target.value }));
    setServerErrors([]);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (hasErrors(errors)) return;
    setLoading(true);
    try {
      await login(values.username.trim(), values.password);
      toast.success('Вхід виконано');
      navigate(state.from ?? '/persons', { replace: true });
    } catch (err) {
      setServerErrors(getErrorMessages(err));
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Вхід у систему" subtitle="Введіть логін і пароль">
      {state.reason === 'protected' && (
        <div role="alert" className="mb-4 rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-200">
          Для доступу до цієї сторінки потрібно увійти в систему.
        </div>
      )}
      {state.registeredUsername && (
        <div role="status" className="mb-4 rounded-md border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-200">
          Реєстрацію завершено. Тепер увійдіть із вашим паролем.
        </div>
      )}
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <TextField label="Логін" name="username" autoComplete="username" autoFocus value={values.username}
          onChange={set('username')} onBlur={() => setTouched((t) => ({ ...t, username: true }))} error={show('username')} />
        <TextField label="Пароль" name="password" type="password" autoComplete="current-password" value={values.password}
          onChange={set('password')} onBlur={() => setTouched((t) => ({ ...t, password: true }))} error={show('password')} />
        {serverErrors.length > 0 && (
          <div role="alert" className="rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
            {serverErrors.map((m) => <p key={m}>{m}</p>)}
          </div>
        )}
        <Button type="submit" loading={loading} className="w-full">Увійти</Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-400">
        Немає облікового запису? <Link to="/register" className="text-accent hover:underline">Зареєструватися</Link>
      </p>
    </AuthLayout>
  );
}
