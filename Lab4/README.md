# Лабораторна робота №4: автентифікація, авторизація та захист API

Продовження API з лабораторної роботи №3: додано реєстрацію та вхід користувачів, хешування паролів (bcrypt),
JWT-токени (access + refresh), перевірку токена (guard) і розмежування прав за ролями (RBAC).
Стек: **NestJS 10 + TypeScript**, **TypeORM**, **PostgreSQL 15**, **JWT (@nestjs/jwt)**, **bcryptjs**, **Swagger**.

## Швидкий запуск

Потрібні: Node.js 20+ та Docker.

> Якщо ще працює контейнер з лабораторної №3, спочатку зупиніть його: `docker compose down` у тій папці
> (порт 5433 і ім’я контейнера збігаються).

```bash
cp .env.example .env          # налаштування та секрети JWT (.env у git не потрапляє)
docker compose up -d          # PostgreSQL: схема, тестові дані, таблиці користувачів і ролей
npm install
npm run start:dev             # API на http://localhost:3000
```

- Swagger UI: http://localhost:3000/api/docs (кнопка **Authorize** для введення токена)
- Базова адреса API: http://localhost:3000/api/v1
- Тести: `npm test` (20 тестів, БД не потрібна)
- Скинути БД: `docker compose down -v && docker compose up -d`

Перший адміністратор створюється при запуску за `ADMIN_USERNAME` / `ADMIN_PASSWORD` з `.env`
(за замовчуванням `admin` / `Admin2027Pass`). У реальному середовищі змініть пароль і секрети JWT.

## Матриця доступу

| Маршрут | Доступ | Помилки |
|---|---|---|
| `POST /auth/register`, `POST /auth/login` | публічний (ліміт 10 запитів/хв) | 400, 401, 409, 429 |
| `POST /auth/refresh`, `POST /auth/logout` | публічний (облікові дані – refresh-токен) | 401 |
| `GET /auth/me` | будь-який авторизований | 401 |
| `GET/POST/PUT/PATCH /persons…` | operator, admin | 401 |
| `DELETE /persons/{id}` | лише admin | 401, 403, 404, 409 |
| `GET /users`, `PATCH /users/{id}/role` | лише admin | 401, 403 |

## Як перевірити у Swagger

1. `POST /auth/register`: створіть користувача (роль завжди operator).
2. `POST /auth/login`: скопіюйте `accessToken` із відповіді.
3. Натисніть **Authorize**, вставте токен (без слова Bearer) і натисніть Authorize.
4. `GET /persons` дає 200; `DELETE /persons/CP-006` дає **403** (потрібен admin).
5. Увійдіть як `admin` і повторіть DELETE: буде 204 (або 409, якщо до особи прив’язані документи).
6. Без токена (кнопка Authorize → Logout) будь-який захищений маршрут дає **401**.

Токен живе 15 хвилин. Коли він спливе, отримайте новий через `POST /auth/login` або `POST /auth/refresh`.
Перегляд хешів у БД: `docker exec -it cyberpolice-db psql -U cyber -d cyberpolice -c "select username, password_hash from users;"`

## Що реалізовано

- **Паролі**: bcrypt із сіллю (вартість 10), у БД лише хеш (`users.password_hash`).
- **Реєстрація**: роль нового користувача завжди `operator`, обрати її в запиті неможливо.
- **Вхід**: однакова помилка для хибного логіна й пароля, захист від перебору (429 після 10 спроб/хв).
- **JWT**: access-токен 15 хв (HS256, claims `sub`, `username`, `role`), секрети з `.env`, не коротші за 32 символи.
- **Guards**: `JwtAuthGuard` (401) і `RolesGuard` (403) діють глобально, відкриті маршрути позначено `@Public()`.
- **RBAC**: декоратор `@Roles('admin')`.
- **Бонус, refresh-токен**: ротація (токен одноразовий), у БД лише SHA-256 хеш, повторне використання
  відкликає всі сесії користувача.

## Структура

```
src/
  auth/        контролер, AuthService, TokensService, guards, декоратори, DTO
  users/       UsersService (admin), PasswordService (bcrypt), AdminSeeder, репозиторій
  persons/     API з лабораторної №3 (DELETE тепер лише для admin)
  entities/    сутності TypeORM, зокрема Role, User, RefreshToken
db/init/       01_schema.sql, 02_seed.sql, 03_auth.sql (ролі, користувачі, refresh-токени)
```
