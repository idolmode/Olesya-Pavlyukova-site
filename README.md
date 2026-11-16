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

## Архетипы и символы
`public/archetypes.html` — утверждённая страница раздела (исходники «Olesya_Archetypes_Developer_Source_2»):
`css/archetypes.css`, `js/archetypes-nav.js` (меню, окно записи), `js/archetypes-atlas.js` (Атлас: профиль и демо-оракул),
`js/archetypes-tools.js` (раскрытие методов). Перенесена без изменений, кроме технических правок:
относительные ссылки на главную вместо адреса railway.app и уменьшенный заголовок карточек на экранах уже 380px.
Практика «Хологенетический профиль» ведёт на калькулятор `https://human-design-server-production.up.railway.app/keys`.

## Рабочий модуль оракула (пока не подключён)
В Атласе сейчас демонстрация (монеты и линии без результата). Готовая проверенная логика лежит в `oracle-integration/`
и не публикуется: `js/oracle-core.js` (броски, таблица Вэнь-вана), `js/oracle-keys.js` (данные 64 ключей для автора),
`js/oracle.js`, `css/oracle.css`, `oracle-block.html`. Тесты: `node tests/oracle-core.test.js`.
