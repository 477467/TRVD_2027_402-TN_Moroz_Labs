import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AuthContext, AuthContextValue } from '../store/AuthContext';
import { PrivateRoute, RoleRoute } from './PrivateRoute';

const base: AuthContextValue = {
  user: null, status: 'anonymous', sessionEnd: null, login: vi.fn(), register: vi.fn(), logout: vi.fn(),
};

function renderAt(path: string, value: AuthContextValue) {
  return render(
    <AuthContext.Provider value={value}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/login" element={<div>СТОРІНКА ВХОДУ</div>} />
          <Route element={<PrivateRoute />}>
            <Route path="/persons" element={<div>СПИСОК ОСІБ</div>} />
            <Route element={<RoleRoute roles={['admin']} />}>
              <Route path="/users" element={<div>АДМІН-ПАНЕЛЬ</div>} />
            </Route>
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

function LoginProbe() {
  const state = (useLocation().state ?? {}) as { reason?: string };
  return <div>ВХІД, причина: {state.reason ?? 'немає'}</div>;
}

const user = (role: 'admin' | 'operator') => ({ id: '1', username: 'u', role, createdAt: '2027-01-01T00:00:00Z' });

describe('Protected Routes', () => {
  it('гість перенаправляється на сторінку входу', () => {
    renderAt('/persons', base);
    expect(screen.getByText('СТОРІНКА ВХОДУ')).toBeInTheDocument();
    expect(screen.queryByText('СПИСОК ОСІБ')).not.toBeInTheDocument();
  });

  it('під час перевірки сесії показується спінер, а не вміст', () => {
    renderAt('/persons', { ...base, status: 'loading' });
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByText('СПИСОК ОСІБ')).not.toBeInTheDocument();
  });

  it('авторизований користувач бачить сторінку', () => {
    renderAt('/persons', { ...base, status: 'authenticated', user: user('operator') });
    expect(screen.getByText('СПИСОК ОСІБ')).toBeInTheDocument();
  });

  it('оператор не потрапляє в адмін-панель', () => {
    renderAt('/users', { ...base, status: 'authenticated', user: user('operator') });
    expect(screen.getByText('Доступ заборонено')).toBeInTheDocument();
    expect(screen.queryByText('АДМІН-ПАНЕЛЬ')).not.toBeInTheDocument();
  });

  it('адміністратор бачить адмін-панель', () => {
    renderAt('/users', { ...base, status: 'authenticated', user: user('admin') });
    expect(screen.getByText('АДМІН-ПАНЕЛЬ')).toBeInTheDocument();
  });

  it('гість, якого перекинуло із захищеної сторінки, отримує пояснення', () => {
    render(
      <AuthContext.Provider value={base}>
        <MemoryRouter initialEntries={['/persons']}>
          <Routes>
            <Route path="/login" element={<LoginProbe />} />
            <Route element={<PrivateRoute />}><Route path="/persons" element={<div>СПИСОК</div>} /></Route>
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>,
    );
    expect(screen.getByText('ВХІД, причина: protected')).toBeInTheDocument();
  });

  it('після свідомого виходу пояснення «потрібно увійти» не показується', () => {
    render(
      <AuthContext.Provider value={{ ...base, sessionEnd: 'logout' }}>
        <MemoryRouter initialEntries={['/persons']}>
          <Routes>
            <Route path="/login" element={<LoginProbe />} />
            <Route element={<PrivateRoute />}><Route path="/persons" element={<div>СПИСОК</div>} /></Route>
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>,
    );
    expect(screen.getByText('ВХІД, причина: logout')).toBeInTheDocument();
  });
});
