import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { PersonDetailsPage } from './pages/PersonDetailsPage';
import { PersonFormPage } from './pages/PersonFormPage';
import { PersonsListPage } from './pages/PersonsListPage';
import { RegisterPage } from './pages/RegisterPage';
import { UsersPage } from './pages/UsersPage';
import { PrivateRoute, RoleRoute } from './routes/PrivateRoute';

export default function App() {
  return (
    <Routes>
      {/* публічні сторінки */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* захищені сторінки: без входу перенаправляють на /login */}
      <Route element={<PrivateRoute />}>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/persons" replace />} />
          <Route path="/persons" element={<PersonsListPage />} />
          <Route path="/persons/new" element={<PersonFormPage />} />
          <Route path="/persons/:id" element={<PersonDetailsPage />} />
          <Route path="/persons/:id/edit" element={<PersonFormPage />} />
          {/* адмін-панель лише для ролі admin */}
          <Route element={<RoleRoute roles={['admin']} />}>
            <Route path="/users" element={<UsersPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
