const colors: Record<string, string> = {
  'Підозрюваний': 'bg-amber-500/20 text-amber-300 ring-amber-500/40',
  'Обвинувачений': 'bg-orange-500/20 text-orange-300 ring-orange-500/40',
  'Засуджений': 'bg-red-500/20 text-red-300 ring-red-500/40',
  'Розшукується': 'bg-fuchsia-500/20 text-fuchsia-300 ring-fuchsia-500/40',
  'Свідок': 'bg-sky-500/20 text-sky-300 ring-sky-500/40',
};

export function StatusBadge({ status }: { status: string }) {
  const cls = colors[status] ?? 'bg-slate-500/20 text-slate-300 ring-slate-500/40';
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${cls}`}>{status}</span>;
}
