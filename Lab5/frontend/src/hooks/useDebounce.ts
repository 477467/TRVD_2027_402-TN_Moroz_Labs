import { useEffect, useState } from 'react';

/** Повертає значення із затримкою: пошук не надсилає запит на кожну натиснуту клавішу. */
export function useDebounce<T>(value: T, delayMs = 400): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}
