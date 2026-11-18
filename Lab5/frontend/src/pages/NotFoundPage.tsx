import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="text-6xl font-bold text-accent">404</p>
      <h1 className="mt-4 text-2xl font-semibold">Сторінку не знайдено</h1>
      <Link to="/persons" className="mt-6 rounded-md bg-accent-strong px-4 py-2 text-sm font-medium text-white hover:bg-accent">
        На головну
      </Link>
    </div>
  );
}
