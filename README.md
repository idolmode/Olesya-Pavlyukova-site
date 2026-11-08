# Сайт Олеси Павлюковой

Главная, «Психология и коучинг», «Метод резонансной релаксации» и страницы-заглушки
«Архетипы и символы», «Авторские ретриты» (их макеты ещё не готовы).

## Структура
- `public/index.html` — главная (`css/home.css`, `js/home.js`)
- `public/psychology.html` — психология и коучинг (`css/base.css`, `css/psychology*.css`, `css/print.css`, `js/psychology.js`)
- `public/resonance.html` — метод резонансной релаксации (`css/resonance.css`, `js/resonance.js`)
- `public/archetypes.html`, `public/retreats.html` — заглушки в оформлении главной
- `public/assets/` — все фотографии и дипломы
- `server.js` — сервер для Railway (Express, отдаёт папку `public`)

## Запуск
```
npm install
npm start          # http://localhost:3000
```

## Railway
Новый проект → Deploy from GitHub repo (или загрузка папки через Railway CLI: `railway up`).
Railway сам выполнит `npm install` и `npm start`; порт берётся из переменной `PORT`.
Settings → Networking → Generate Domain — получить адрес; там же можно подключить свой домен.
Healthcheck Path: `/health`.

## Что ещё не подключено (так в исходных макетах)
- Кнопки записи и форма на странице резонансной релаксации не отправляют заявки — нужен канал связи / CRM.
- В подвале главной и психологии Telegram / Instagram / Threads — текст без ссылок.
