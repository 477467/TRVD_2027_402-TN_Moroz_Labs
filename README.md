# Лабораторна робота №3: Back-end та REST API

REST API інформаційно-аналітичної системи підрозділу кіберполіції.
Стек: **NestJS 10 + TypeScript**, **TypeORM**, **PostgreSQL 15**, **Swagger (OpenAPI)**.
Схема БД відповідає ER-діаграмі з лабораторної роботи №2. Усі дані в `db/init/02_seed.sql` вигадані.

## Швидкий запуск

Потрібні: Node.js 20+ та Docker.

```bash
cp .env.example .env          # налаштування підключення (файл .env у git не потрапляє)
docker compose up -d          # PostgreSQL на порту 5433 + схема й тестові дані
npm install
npm run start:dev             # API на http://localhost:3000
```

- Swagger UI: http://localhost:3000/api/docs
- Базова адреса API: http://localhost:3000/api/v1

Тести (БД не потрібна, репозиторій підміняється моком): `npm test`

Скинути БД до початкового стану: `docker compose down -v && docker compose up -d`

## Ендпоінти (сутність Person)

| Метод | URL | Опис | Коди відповіді |
|---|---|---|---|
| GET | `/api/v1/persons?search=&city=&status=&page=&limit=` | Список із пошуком і пагінацією | 200, 400 |
| GET | `/api/v1/persons/{id}` | Картка особи | 200, 404 |
| POST | `/api/v1/persons` | Створити запис | 201, 400 |
| PUT | `/api/v1/persons/{id}` | Повна заміна | 200, 400, 404 |
| PATCH | `/api/v1/persons/{id}` | Часткове оновлення | 200, 400, 404 |
| DELETE | `/api/v1/persons/{id}` | Видалити | 204, 404, 409 |

Приклад тіла POST:

```json
{
  "name": "Роман",
  "surname": "Гончар",
  "dob": "1993-07-21",
  "address": "м. Київ, вул. Тестова, 10",
  "city": "Київ",
  "status": "Підозрюваний",
  "crimeIds": [1, 4]
}
```

Довідники в тестових даних: міста Київ, Харків, Одеса, Львів, Дніпро; кваліфікації `crimeIds` 1–5;
статуси: Підозрюваний, Обвинувачений, Засуджений, Розшукується, Свідок.
Записи CP-001 і CP-002 мають службові документи, тому `DELETE` для них повертає 409; CP-006 можна видаляти.

## Бізнес-правила (PersonsService)

1. Обліковий номер `CP-NNN` видає система.
2. Дата народження існує в календарі, не в майбутньому, вік не менший за 14 років.
3. Місто має бути в довіднику `cities`, кваліфікації – у `crimes`.
4. Текстові поля нормалізуються (зайві пробіли).
5. Не можна видалити особу з прив’язаними службовими документами (409).

## Архітектура

```
Controller  →  Service  →  Repository  →  TypeORM  →  PostgreSQL
 (DTO, HTTP)   (бізнес-правила)  (доступ до даних)
```

```
src/
  entities/            сутності TypeORM (8 таблиць із ЛР2)
  persons/
    dto/               Create / Update / Query / Response DTO (+ валідація)
    person.mapper.ts   Entity → DTO
    persons.repository.ts   патерн Repository
    persons.service.ts      бізнес-логіка
    persons.controller.ts   REST-контролер (без логіки)
    persons.module.ts       DI-модуль
  app.module.ts        підключення до БД
  main.ts              Swagger, глобальна валідація, версіонування (/api/v1)
db/init/               SQL-схема та тестові дані
```
