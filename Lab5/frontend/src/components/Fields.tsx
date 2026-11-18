import { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes, useId } from 'react';

interface FieldShellProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

const base =
  'w-full rounded-md border bg-surface px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-accent';
const border = (error?: string) => (error ? 'border-red-500' : 'border-slate-600');

function Shell({ id, label, error, hint, required, children }: FieldShellProps & { id: string; children: ReactNode }) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-slate-200">
        {label}
        {required && <span className="ml-1 text-red-400">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextField({ label, error, hint, required, className = '', ...rest }: FieldShellProps & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <Shell id={id} label={label} error={error} hint={hint} required={required}>
      <input id={id} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined}
        {...rest} className={`${base} ${border(error)} ${className}`} />
    </Shell>
  );
}

export function SelectField({ label, error, hint, required, children, className = '', ...rest }: FieldShellProps & SelectHTMLAttributes<HTMLSelectElement>) {
  const id = useId();
  return (
    <Shell id={id} label={label} error={error} hint={hint} required={required}>
      <select id={id} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined}
        {...rest} className={`${base} ${border(error)} ${className}`}>
        {children}
      </select>
    </Shell>
  );
}

export function TextAreaField({ label, error, hint, required, className = '', ...rest }: FieldShellProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();
  return (
    <Shell id={id} label={label} error={error} hint={hint} required={required}>
      <textarea id={id} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined}
        {...rest} className={`${base} ${border(error)} ${className}`} />
    </Shell>
  );
}
