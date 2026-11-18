import { FormEvent, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { TextField } from '../components/Fields';
import { getErrorMessages } from '../services/api';
import { useAuth } from '../store/AuthContext';
import { hasErrors, RegisterField, validateRegister } from '../utils/validators';
import { AuthLayout } from './AuthLayout';

export function RegisterPage() {
  const { register, status } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState({ username: '', password: '', confirm: '' });
  const [touched, setTouched] = useState<Partial<Record<RegisterField, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverErrors, setServerErrors] = useState<string[]>([]);

  if (status === 'authenticated') return <Navigate to="/persons" replace />;

  const errors = validateRegister(values);
  const show = (f: RegisterField) => (submitted || touched[f] ? errors[f] : undefined);
  const set = (f: RegisterField) => (e: { target: { value: string } }) => {
    setValues((v) => ({ ...v, [f]: e.target.value }));
    setServerErrors([]);
  };
  const blur = (f: RegisterField) => () => setTouched((t) => ({ ...t, [f]: true }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (hasErrors(errors)) return;
    setLoading(true);
    try {
      const username = values.username.trim();
      await register(username, values.password);
      toast.success('Реєстрацію завершено');
      navigate('/login', { replace: true, state: { registeredUsername: username.toLowerCase() } });
    } catch (err) {
      setServerErrors(getErrorMessages(err));
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Реєстрація" subtitle="Створіть обліковий запис оператора">
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <TextField label="Логін" name="username" autoComplete="username" autoFocus value={values.username}
          onChange={set('username')} onBlur={blur('username')} error={show('username')}
          hint="3–50 символів: латиниця, цифри, . _ -" />
        <TextField label="Пароль" name="password" type="password" autoComplete="new-password" value={values.password}
          onChange={set('password')} onBlur={blur('password')} error={show('password')}
          hint="Щонайменше 8 символів, літера та цифра" />
        <TextField label="Повторіть пароль" name="confirm" type="password" autoComplete="new-password" value={values.confirm}
          onChange={set('confirm')} onBlur={blur('confirm')} error={show('confirm')} />
        {serverErrors.length > 0 && (
          <div role="alert" className="rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
            {serverErrors.map((m) => <p key={m}>{m}</p>)}
          </div>
        )}
        <Button type="submit" loading={loading} className="w-full">Зареєструватися</Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-400">
        Уже є обліковий запис? <Link to="/login" className="text-accent hover:underline">Увійти</Link>
      </p>
    </AuthLayout>
  );
}
