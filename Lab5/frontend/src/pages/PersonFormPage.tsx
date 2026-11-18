import { FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/Button';
import { ErrorBox } from '../components/ErrorBox';
import { SelectField, TextAreaField, TextField } from '../components/Fields';
import { PageSpinner } from '../components/Spinner';
import { getErrorMessages, PersonsService, ReferenceService } from '../services/api';
import { City, Crime, Person, PersonInput } from '../types/api';
import { PERSON_STATUSES } from '../types/constants';
import { emptyPersonForm, hasErrors, PersonField, PersonFormValues, validatePerson } from '../utils/validators';

const toFormValues = (p: Person): PersonFormValues => ({
  name: p.name, surname: p.surname, dob: p.dob, address: p.address ?? '', city: p.city,
  status: p.status, description: p.description ?? '', crimeIds: p.crimes.map((c) => c.id),
});

/** Форма створення та редагування (режим залежить від наявності :id в адресі). Під час редагування поля заповнено поточними даними. */
export function PersonFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [values, setValues] = useState<PersonFormValues>(emptyPersonForm);
  const [cities, setCities] = useState<City[]>([]);
  const [crimes, setCrimes] = useState<Crime[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [touched, setTouched] = useState<Partial<Record<PersonField, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [serverErrors, setServerErrors] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    Promise.all([ReferenceService.cities(), ReferenceService.crimes(), id ? PersonsService.get(id) : Promise.resolve(null)])
      .then(([c, cr, person]) => {
        if (cancelled) return;
        setCities(c);
        setCrimes(cr);
        if (person) setValues(toFormValues(person));
      })
      .catch((err) => !cancelled && setLoadError(getErrorMessages(err).join('. ')))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id, reloadKey]);

  const errors = validatePerson(values);
  const show = (f: PersonField) => (submitted || touched[f] ? errors[f] : undefined);
  const blur = (f: PersonField) => () => setTouched((t) => ({ ...t, [f]: true }));
  const set = (f: Exclude<PersonField, 'crimeIds'>) => (e: { target: { value: string } }) => {
    setValues((v) => ({ ...v, [f]: e.target.value }));
    setServerErrors([]);
  };
  const toggleCrime = (crimeId: number) =>
    setValues((v) => ({
      ...v,
      crimeIds: v.crimeIds.includes(crimeId) ? v.crimeIds.filter((c) => c !== crimeId) : [...v.crimeIds, crimeId],
    }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (hasErrors(errors)) {
      toast.error('Виправте помилки у формі');
      return;
    }
    const input: PersonInput = {
      name: values.name.trim(),
      surname: values.surname.trim(),
      dob: values.dob,
      city: values.city,
      status: values.status,
      crimeIds: values.crimeIds,
      address: values.address.trim() || undefined,
      description: values.description.trim() || undefined,
    };
    setSaving(true);
    try {
      const saved = id ? await PersonsService.replace(id, input) : await PersonsService.create(input);
      toast.success(id ? 'Зміни збережено' : `Запис ${saved.id} створено`);
      navigate(`/persons/${saved.id}`, { replace: true });
    } catch (err) {
      const messages = getErrorMessages(err);
      setServerErrors(messages);
      toast.error(messages[0]);
      setSaving(false);
    }
  };

  if (loading) return <PageSpinner label={isEdit ? 'Завантаження запису…' : 'Підготовка форми…'} />;
  if (loadError) return <ErrorBox message={loadError} onRetry={() => setReloadKey((k) => k + 1)} />;

  return (
    <section className="max-w-3xl">
      <Link to={id ? `/persons/${id}` : '/persons'} className="text-sm text-accent hover:underline">← Назад</Link>
      <h1 className="mb-6 mt-3 text-2xl font-semibold">{isEdit ? `Редагування запису ${id}` : 'Нова особа'}</h1>

      <form onSubmit={onSubmit} noValidate className="space-y-5 rounded-lg border border-slate-700 bg-surface-card p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Прізвище" required value={values.surname} onChange={set('surname')} onBlur={blur('surname')} error={show('surname')} />
          <TextField label="Ім’я" required value={values.name} onChange={set('name')} onBlur={blur('name')} error={show('name')} />
          <TextField label="Дата народження" required type="date" value={values.dob} onChange={set('dob')} onBlur={blur('dob')} error={show('dob')} />
          <SelectField label="Місто прив’язки епізоду" required value={values.city} onChange={set('city')} onBlur={blur('city')} error={show('city')}>
            <option value="">Оберіть місто</option>
            {cities.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
          </SelectField>
          <SelectField label="Процесуальний статус" required value={values.status} onChange={set('status')} onBlur={blur('status')} error={show('status')}>
            <option value="">Оберіть статус</option>
            {PERSON_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </SelectField>
          <TextField label="Адреса реєстрації" value={values.address} onChange={set('address')} onBlur={blur('address')} error={show('address')} />
        </div>

        <fieldset>
          <legend className="mb-2 text-sm font-medium text-slate-200">Кваліфікації правопорушень</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {crimes.map((c) => (
              <label key={c.id} className="flex cursor-pointer items-start gap-2 rounded-md border border-slate-700 p-2 text-sm hover:bg-surface-raised/40">
                <input type="checkbox" checked={values.crimeIds.includes(c.id)} onChange={() => toggleCrime(c.id)} className="mt-1 accent-sky-500" />
                <span>{c.title}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <TextAreaField label="Опис ролі особи" rows={4} value={values.description} onChange={set('description')} onBlur={blur('description')}
          error={show('description')} hint={`${values.description.length}/1000 символів`} />

        {serverErrors.length > 0 && (
          <div role="alert" className="rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
            {serverErrors.map((m) => <p key={m}>{m}</p>)}
          </div>
        )}

        <div className="flex justify-end gap-3 border-t border-slate-700 pt-5">
          <Link to={id ? `/persons/${id}` : '/persons'} className="rounded-md bg-surface-raised px-4 py-2 text-sm hover:bg-slate-600">Скасувати</Link>
          <Button type="submit" loading={saving}>{isEdit ? 'Зберегти зміни' : 'Створити запис'}</Button>
        </div>
      </form>
    </section>
  );
}
