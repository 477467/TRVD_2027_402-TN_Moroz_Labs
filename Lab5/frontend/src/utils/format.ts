/** Скорочує назву кваліфікації до номера статті: «ст. 190 ККУ – Шахрайство» → «ст. 190 ККУ». */
export const shortCrime = (title: string): string => title.split(' – ')[0];

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString('uk-UA', { dateStyle: 'medium', timeStyle: 'short' });
}

export function formatDate(value: string): string {
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString('uk-UA', { dateStyle: 'long' });
}
