interface Props {
  page: number;
  total: number;
  limit: number;
  onChange: (page: number) => void;
}

/** Номери сторінок зі скороченням: 1 … 4 5 6 … 20. */
export function pageNumbers(current: number, last: number): (number | '…')[] {
  const set = new Set([1, last, current - 1, current, current + 1].filter((n) => n >= 1 && n <= last));
  const sorted = [...set].sort((a, b) => a - b);
  const result: (number | '…')[] = [];
  sorted.forEach((n, i) => {
    if (i > 0 && n - sorted[i - 1] > 1) result.push('…');
    result.push(n);
  });
  return result;
}

export function Pagination({ page, total, limit, onChange }: Props) {
  const last = Math.max(1, Math.ceil(total / limit));
  if (last <= 1) return null;
  const btn = 'min-w-9 rounded-md px-3 py-1.5 text-sm transition-colors disabled:opacity-40';
  return (
    <nav aria-label="Пагінація" className="mt-4 flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-slate-400">Сторінка {page} з {last}</p>
      <div className="flex items-center gap-1">
        <button type="button" className={`${btn} bg-surface-raised hover:bg-slate-600`} disabled={page <= 1} onClick={() => onChange(page - 1)}>
          ← Назад
        </button>
        {pageNumbers(page, last).map((n, i) =>
          n === '…' ? (
            <span key={`gap-${i}`} className="px-2 text-slate-500">…</span>
          ) : (
            <button key={n} type="button" aria-current={n === page ? 'page' : undefined} onClick={() => onChange(n)}
              className={`${btn} ${n === page ? 'bg-accent-strong text-white' : 'bg-surface-raised hover:bg-slate-600'}`}>
              {n}
            </button>
          ),
        )}
        <button type="button" className={`${btn} bg-surface-raised hover:bg-slate-600`} disabled={page >= last} onClick={() => onChange(page + 1)}>
          Далі →
        </button>
      </div>
    </nav>
  );
}
