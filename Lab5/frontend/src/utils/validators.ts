import { PERSON_STATUSES } from '../types/constants';

export type FieldErrors<K extends string> = Partial<Record<K, string>>;

export const MIN_AGE_YEARS = 14;

export function validateUsername(value: string): string | undefined {
  const v = value.trim();
  if (!v) return 'Введіть логін';
  if (v.length < 3) return 'Логін має містити щонайменше 3 символи';
  if (v.length > 50) return 'Логін не може бути довшим за 50 символів';
  if (!/^[A-Za-z0-9._-]+$/.test(v)) return 'Логін може містити лише латиницю, цифри та символи . _ -';
  return undefined;
}

export function validatePassword(value: string): string | undefined {
  if (!value) return 'Введіть пароль';
  if (value.length < 8) return 'Пароль має містити щонайменше 8 символів';
  if (value.length > 72) return 'Пароль не може бути довшим за 72 символи';
  if (!/\p{L}/u.test(value) || !/\d/.test(value)) return 'Пароль має містити щонайменше одну літеру та одну цифру';
  return undefined;
}

export type LoginField = 'username' | 'password';
export function validateLogin(v: { username: string; password: string }): FieldErrors<LoginField> {
  const errors: FieldErrors<LoginField> = {};
  if (!v.username.trim()) errors.username = 'Введіть логін';
  if (!v.password) errors.password = 'Введіть пароль';
  return errors;
}

export type RegisterField = 'username' | 'password' | 'confirm';
export function validateRegister(v: { username: string; password: string; confirm: string }): FieldErrors<RegisterField> {
  const errors: FieldErrors<RegisterField> = {};
  const username = validateUsername(v.username);
  const password = validatePassword(v.password);
  if (username) errors.username = username;
  if (password) errors.password = password;
  if (!v.confirm) errors.confirm = 'Повторіть пароль';
  else if (v.confirm !== v.password) errors.confirm = 'Паролі не збігаються';
  return errors;
}

export interface PersonFormValues {
  name: string;
  surname: string;
  dob: string;
  address: string;
  city: string;
  status: string;
  description: string;
  crimeIds: number[];
}
export type PersonField = keyof PersonFormValues;

export const emptyPersonForm: PersonFormValues = {
  name: '', surname: '', dob: '', address: '', city: '', status: '', description: '', crimeIds: [],
};

/** Перевірка дати народження: формат, існування в календарі, не в майбутньому, мінімальний вік. */
export function validateBirthDate(value: string, now: Date = new Date()): string | undefined {
  if (!value) return 'Вкажіть дату народження';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'Дата має бути у форматі РРРР-ММ-ДД';
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) return 'Такої дати не існує';
  if (date > now) return 'Дата народження не може бути в майбутньому';
  const minBirth = new Date(Date.UTC(now.getUTCFullYear() - MIN_AGE_YEARS, now.getUTCMonth(), now.getUTCDate()));
  if (date > minBirth) return `Мінімальний вік особи – ${MIN_AGE_YEARS} років`;
  return undefined;
}

export function validatePerson(v: PersonFormValues): FieldErrors<PersonField> {
  const e: FieldErrors<PersonField> = {};
  if (!v.name.trim()) e.name = 'Введіть ім’я';
  else if (v.name.trim().length > 100) e.name = 'Ім’я не може бути довшим за 100 символів';
  if (!v.surname.trim()) e.surname = 'Введіть прізвище';
  else if (v.surname.trim().length > 100) e.surname = 'Прізвище не може бути довшим за 100 символів';
  const dob = validateBirthDate(v.dob);
  if (dob) e.dob = dob;
  if (!v.city) e.city = 'Оберіть місто';
  if (!v.status) e.status = 'Оберіть статус';
  else if (!(PERSON_STATUSES as readonly string[]).includes(v.status)) e.status = 'Недопустимий статус';
  if (v.address.trim().length > 255) e.address = 'Адреса не може бути довшою за 255 символів';
  if (v.description.trim().length > 1000) e.description = 'Опис не може бути довшим за 1000 символів';
  return e;
}

export const hasErrors = (errors: object): boolean => Object.keys(errors).length > 0;
