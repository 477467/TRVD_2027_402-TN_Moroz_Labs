import { describe, expect, it } from 'vitest';
import { pageNumbers } from './Pagination';

describe('pageNumbers', () => {
  it('показує всі сторінки, якщо їх мало', () => {
    expect(pageNumbers(2, 4)).toEqual([1, 2, 3, 4]);
  });

  it('скорочує довгі переліки трикрапкою', () => {
    expect(pageNumbers(1, 20)).toEqual([1, 2, '…', 20]);
    expect(pageNumbers(10, 20)).toEqual([1, '…', 9, 10, 11, '…', 20]);
    expect(pageNumbers(20, 20)).toEqual([1, '…', 19, 20]);
  });
});
