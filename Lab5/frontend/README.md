# Frontend: SPA кіберполіції

React 18 + TypeScript + Vite + Tailwind CSS + Axios + React Router + react-hot-toast.

```bash
npm install
npm run dev        # http://localhost:5173 (потрібен запущений API)
npm run build      # перевірка типів і продакшн-збірка
npm test           # unit-тести (vitest)
```

Адреса API задається у `.env` (`VITE_API_URL`, за замовчуванням `http://localhost:3000/api/v1`), приклад: `.env.example`.
Бекенд дозволяє запити лише з адреси фронтенду (змінна `CORS_ORIGIN`, за замовчуванням `http://localhost:5173`).

```
src/
  components/   Button, Fields, ConfirmDialog, Pagination, Header, Layout, Spinner, StatusBadge, ErrorBox
  pages/        LoginPage, RegisterPage, PersonsListPage, PersonDetailsPage, PersonFormPage, UsersPage
  routes/       PrivateRoute, RoleRoute
  services/api/ httpClient (interceptors), AuthService, PersonsService, ReferenceService, UsersService
  store/        AuthContext (стан автентифікації)
  hooks/        useDebounce
  utils/        validators, format
  types/        типи API та константи
```
