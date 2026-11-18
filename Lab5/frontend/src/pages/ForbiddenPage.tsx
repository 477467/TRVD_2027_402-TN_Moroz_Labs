import { Link } from 'react-router-dom';

export function ForbiddenPage() {
  return (
    <div className="py-16 text-center">
      <p className="text-6xl font-bold text-red-400">403</p>
      <h1 className="mt-4 text-2xl font-semibold">Доступ заборонено</h1>
      <p className="mt-2 text-slate-400">Для цієї сторінки потрібна роль адміністратора.</p>
      <Link to="/persons" className="mt-6 inline-block rounded-md bg-accent-strong px-4 py-2 text-sm font-medium text-white hover:bg-accent">
        До списку осіб
      </Link>
    </div>
  );
}
