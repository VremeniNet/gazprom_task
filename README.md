# Users & Posts Dashboard

Тестовое задание: React-приложение для работы с пользователями, постами и комментариями через GoREST API.


## Функциональность

- Ввод access token для работы с GoREST API
- Загрузка списка пользователей
- Пагинация пользователей
- Выбор количества пользователей на странице
- Просмотр карточки пользователя
- Загрузка списка постов
- Пагинация постов
- Выбор количества постов на странице
- Просмотр карточки поста
- Загрузка комментариев к посту
- Обработка состояний загрузки и ошибок
- Адаптивная верстка

## Стек

- React
- TypeScript
- Vite
- Consta UI
- GoREST API

## API

Используется публичное API GoREST:

- `GET /public/v2/users`
- `GET /public/v2/users/{id}`
- `GET /public/v2/posts`
- `GET /public/v2/posts/{id}`
- `GET /public/v2/posts/{id}/comments`

Для пагинации используются query-параметры:

```txt
page
per_page
````

Данные пагинации берутся из response headers:

```txt
X-Pagination-Total
X-Pagination-Pages
X-Pagination-Page
X-Pagination-Limit
```

## Access token

Для работы приложения нужен GoREST access token.

Токен не хранится в коде и не коммитится в репозиторий. Пользователь вводит его на стартовом экране приложения.

Получить токен можно в личном кабинете GoREST.

## Установка и запуск

Склонировать репозиторий:

```bash
git clone https://github.com/VremeniNet/gazprom_task.git
cd gazprom_task
```

Установить зависимости:

```bash
npm install
```

Запустить проект в режиме разработки:

```bash
npm run dev
```

Собрать проект:

```bash
npm run build
```

## Структура проекта

```txt
src/
  api/
    gorest.ts
  types/
    gorest.ts
  App.tsx
  App.css
  main.tsx
  index.css
```
