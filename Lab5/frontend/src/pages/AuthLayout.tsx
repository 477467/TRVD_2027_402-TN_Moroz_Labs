import { ReactNode } from 'react';

/** Спільна «картка» для сторінок входу та реєстрації. */
export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="text-3xl text-accent" aria-hidden="true">◆</div>
          <p className="mt-1 text-sm uppercase tracking-widest text-slate-400">Кіберполіція</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-surface-card p-8 shadow-xl">
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="mb-6 mt-1 text-sm text-slate-400">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
