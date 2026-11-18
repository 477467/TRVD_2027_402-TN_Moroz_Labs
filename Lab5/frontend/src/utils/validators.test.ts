import { describe, expect, it } from 'vitest';
import { emptyPersonForm, validateBirthDate, validatePassword, validatePerson, validateRegister, validateUsername } from './validators';

describe('валідація логіна й пароля', () => {
  it('логін: довжина та дозволені символи', () => {
    expect(validateUsername('')).toBe('Введіть логін');
    expect(validateUsername('ab')).toMatch(/щонайменше 3/);
    expect(validateUsername('bad login!')).toMatch(/латиницю/);
    expect(validateUsername('operator1')).toBeUndefined();
  });

  it('пароль: мінімум 8 символів, літера й цифра', () => {
    expect(validatePassword('')).toBe('Введіть пароль');
    expect(validatePassword('short1')).toMatch(/щонайменше 8/);
    expect(validatePassword('onlyletters')).toMatch(/літеру та одну цифру/);
    expect(validatePassword('12345678')).toMatch(/літеру та одну цифру/);
    expect(validatePassword('Strong2027Pass')).toBeUndefined();
  });

  it('реєстрація: паролі мають збігатися', () => {
    const errors = validateRegister({ username: 'operator1', password: 'Strong2027Pass', confirm: 'Other2027Pass' });
    expect(errors.confirm).toBe('Паролі не збігаються');
    expect(validateRegister({ username: 'operator1', password: 'Strong2027Pass', confirm: 'Strong2027Pass' })).toEqual({});
  });
});

describe('валідація дати народження', () => {
  const now = new Date('2027-03-01T12:00:00Z');

  it('відхиляє порожнє, некоректне, неіснуюче та майбутнє', () => {
    expect(validateBirthDate('', now)).toBeDefined();
    expect(validateBirthDate('21.07.1993', now)).toMatch(/РРРР-ММ-ДД/);
    expect(validateBirthDate('1993-02-31', now)).toBe('Такої дати не існує');
    expect(validateBirthDate('2999-01-01', now)).toMatch(/майбутньому/);
  });

  it('відхиляє вік менший за 14 років і приймає дорослого', () => {
    expect(validateBirthDate('2020-01-01', now)).toMatch(/Мінімальний вік/);
    expect(validateBirthDate('1993-07-21', now)).toBeUndefined();
  });
});

describe('валідація форми особи', () => {
  it('порожня форма має помилки обов’язкових полів', () => {
    const errors = validatePerson(emptyPersonForm);
    expect(Object.keys(errors).sort()).toEqual(['city', 'dob', 'name', 'status', 'surname']);
  });

  it('коректна форма не має помилок', () => {
    const ok = { ...emptyPersonForm, name: 'Роман', surname: 'Гончар', dob: '1993-07-21', city: 'Київ', status: 'Підозрюваний' };
    expect(validatePerson(ok)).toEqual({});
  });
});
