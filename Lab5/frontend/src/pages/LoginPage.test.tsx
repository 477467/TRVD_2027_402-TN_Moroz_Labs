import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AuthContext, AuthContextValue } from '../store/AuthContext';
import { LoginPage } from './LoginPage';

function setup(login = vi.fn().mockResolvedValue(undefined)) {
  const value: AuthContextValue = { user: null, status: 'anonymous', sessionEnd: null, login, register: vi.fn(), logout: vi.fn() };
  render(
    <AuthContext.Provider value={value}>
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/persons" element={<div>СПИСОК ОСІБ</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
  return login;
}

describe('LoginPage', () => {
  it('показує повідомлення валідації для порожньої форми й не надсилає запит', async () => {
    const login = setup();
    await userEvent.click(screen.getByRole('button', { name: 'Увійти' }));
    expect(screen.getByText('Введіть логін')).toBeInTheDocument();
    expect(screen.getByText('Введіть пароль')).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });

  it('надсилає логін і пароль та переходить до списку', async () => {
    const login = setup();
    await userEvent.type(screen.getByLabelText('Логін'), 'operator1');
    await userEvent.type(screen.getByLabelText('Пароль'), 'Strong2027Pass');
    await userEvent.click(screen.getByRole('button', { name: 'Увійти' }));
    await waitFor(() => expect(login).toHaveBeenCalledWith('operator1', 'Strong2027Pass'));
    expect(await screen.findByText('СПИСОК ОСІБ')).toBeInTheDocument();
  });

  it('показує помилку сервера при невірних даних', async () => {
    const error = Object.assign(new Error('x'), {
      isAxiosError: true,
      response: { status: 401, data: { message: 'Невірний логін або пароль' } },
    });
    setup(vi.fn().mockRejectedValue(error));
    await userEvent.type(screen.getByLabelText('Логін'), 'operator1');
    await userEvent.type(screen.getByLabelText('Пароль'), 'WrongPass1');
    await userEvent.click(screen.getByRole('button', { name: 'Увійти' }));
    expect(await screen.findByText('Невірний логін або пароль')).toBeInTheDocument();
  });
});
