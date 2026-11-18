import axios from 'axios';

/** Перетворює будь-яку помилку HTTP-запиту на список зрозумілих повідомлень для користувача. */
export function getErrorMessages(error: unknown): string[] {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return error.code === 'ECONNABORTED'
        ? ['Сервер не відповів вчасно. Спробуйте ще раз']
        : ['Немає зв’язку із сервером. Перевірте, чи запущено API'];
    }
    const { status, data } = error.response;
    if (status === 429) return ['Забагато спроб. Зачекайте хвилину і повторіть']; // повідомлення сервера англійською
    const message = (data as { message?: string | string[] } | undefined)?.message;
    if (Array.isArray(message) && message.length > 0) return message;
    if (typeof message === 'string' && message) return [message];
    if (status >= 500) return ['Помилка сервера. Спробуйте пізніше'];
    return [`Помилка запиту (${status})`];
  }
  return ['Сталася невідома помилка'];
}

export const getErrorMessage = (error: unknown): string => getErrorMessages(error).join('. ');

export const getStatus = (error: unknown): number | undefined =>
  axios.isAxiosError(error) ? error.response?.status : undefined;
