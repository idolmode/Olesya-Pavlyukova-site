// Сайт Олеси Павлюковой — статические страницы для Railway.
// Страницы лежат в public/. Адреса работают и коротко (/psychology), и с .html (/psychology.html).
const express = require("express");
const path = require("path");

const app = express();
const PUBLIC = path.join(__dirname, "public");

app.disable("x-powered-by");

// Проверка, что сервис жив (Railway → Settings → Healthcheck Path: /health)
app.get("/health", (req, res) => res.type("text").send("ok"));

app.use(
  express.static(PUBLIC, {
    extensions: ["html"], // /psychology → psychology.html
    setHeaders(res, file) {
      // Браузер хранит файлы, но перед показом сверяется с сервером (ETag): если картинку или стиль
      // заменили с тем же именем, после деплоя сразу видна новая версия.
      res.set("Cache-Control", "no-cache");
    }
  })
);

// Несуществующий адрес — на главную, а не пустая ошибка
app.use((req, res) => res.redirect(302, "/"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Сайт запущен на порту ${PORT}`));
