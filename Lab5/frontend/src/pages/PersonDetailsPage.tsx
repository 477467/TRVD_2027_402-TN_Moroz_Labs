import { ReactNode, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/Button';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ErrorBox } from '../components/ErrorBox';
import { PageSpinner } from '../components/Spinner';
import { StatusBadge } from '../components/StatusBadge';
import { getErrorMessage, getStatus, PersonsService } from '../services/api';
import { useAuth } from '../store/AuthContext';
import { Person } from '../types/api';
import { formatDate, formatDateTime } from '../utils/format';

const Row = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="grid gap-1 py-3 sm:grid-cols-[200px_1fr]">
    <dt className="text-sm text-slate-400">{label}</dt>
    <dd>{children}</dd>
  </div>
);

/** Сторінка деталей: повна картка особи. */
export function PersonDetailsPage() {
  const { id = '' } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [person, setPerson] = useState<Person | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; notFound: boolean } | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    PersonsService.get(id)
      .then((p) => !cancelled && setPerson(p))
      .catch((err) => !cancelled && setError({ message: getErrorMessage(err), notFound: getStatus(err) === 404 }))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id]);

  const remove = async () => {
    setDeleting(true);
    try {
      await PersonsService.remove(id);
      toast.success(`Запис ${id} видалено`);
      navigate('/persons', { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
      setConfirming(false);
      setDeleting(false);
    }
  };

  if (loading) return <PageSpinner label="Завантаження картки…" />;
  if (error) {
    return (
      <div className="space-y-4">
        <ErrorBox message={error.notFound ? `Особу з номером ${id} не знайдено` : error.message} />
        <Link to="/persons" className="text-sm text-accent hover:underline">← До списку осіб</Link>
      </div>
    );
  }
  if (!person) return null;

  return (
    <section className="max-w-3xl">
      <Link to="/persons" className="text-sm text-accent hover:underline">← До списку осіб</Link>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{person.fullName}</h1>
          <p className="mt-1 font-mono text-sm text-slate-400">{person.id}</p>
        </div>
        <div className="flex gap-2">
          <Link to={`/persons/${person.id}/edit`} className="rounded-md bg-accent-strong px-4 py-2 text-sm font-medium text-white hover:bg-accent">
            Редагувати
          </Link>
          {user?.role === 'admin' && <Button variant="danger" onClick={() => setConfirming(true)}>Видалити</Button>}
        </div>
      </div>

      <dl className="mt-6 divide-y divide-slate-700 rounded-lg border border-slate-700 bg-surface-card px-6">
        <Row label="Дата народження">{formatDate(person.dob)}</Row>
        <Row label="Місто прив’язки епізоду">{person.city}</Row>
        <Row label="Адреса реєстрації">{person.address ?? <span className="text-slate-500">не вказано</span>}</Row>
        <Row label="Процесуальний статус"><StatusBadge status={person.status} /></Row>
        <Row label="Кваліфікації">
          {person.crimes.length === 0 ? <span className="text-slate-500">немає</span> : (
            <ul className="list-inside list-disc space-y-1">{person.crimes.map((c) => <li key={c.id}>{c.title}</li>)}</ul>
          )}
        </Row>
        <Row label="Опис ролі особи">{person.description ?? <span className="text-slate-500">не вказано</span>}</Row>
        <Row label="Запис створено">{formatDateTime(person.createdAt)}</Row>
      </dl>

      <ConfirmDialog open={confirming} title="Видалити запис?" loading={deleting} confirmLabel="Видалити"
        message={`Ви впевнені, що хочете видалити запис ${person.id} (${person.fullName})? Цю дію не можна скасувати.`}
        onConfirm={remove} onCancel={() => setConfirming(false)} />
    </section>
  );
}
