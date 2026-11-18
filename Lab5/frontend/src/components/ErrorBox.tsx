import { Button } from './Button';

/** Блок помилки завантаження з кнопкою «Спробувати ще раз». */
export function ErrorBox({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 p-6 text-center">
      <p className="text-red-300">{message}</p>
      {onRetry && (
        <Button variant="secondary" className="mt-4" onClick={onRetry}>
          Спробувати ще раз
        </Button>
      )}
    </div>
  );
}
