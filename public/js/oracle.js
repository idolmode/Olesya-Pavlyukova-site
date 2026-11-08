/*
 * Оракул 64 ключей — интерфейс встроенного блока #oracle.
 * Состояния: intro → question → throw (6 бросков) → result. URL не меняется.
 * Вопрос пользователя нигде не сохраняется и никуда не отправляется.
 */
(function () {
  "use strict";
  document.documentElement.classList.remove("no-js");
  const box = document.querySelector("#oracle .or-box");
  if (!box || !window.OracleCore) return; // без модуля страница остаётся как есть
  const Core = window.OracleCore;
  const DATA = window.ORACLE_KEYS || {};
  const $ = (id) => document.getElementById(id);
  const reduced = () => window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- монеты: две стороны с разным рисунком (сторона А = 2, сторона Б = 3) ----------
  const bronze = (inner) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><defs>` +
    `<radialGradient id="g" cx="38%" cy="32%" r="78%"><stop offset="0" stop-color="#e7cfa4"/><stop offset=".55" stop-color="#b58d5e"/><stop offset="1" stop-color="#7e5d3c"/></radialGradient>` +
    `<radialGradient id="h" cx="36%" cy="28%" r="40%"><stop offset="0" stop-color="#fff3d6" stop-opacity=".55"/><stop offset="1" stop-color="#fff3d6" stop-opacity="0"/></radialGradient></defs>` +
    `<circle cx="60" cy="60" r="58" fill="url(#g)"/><circle cx="60" cy="60" r="58" fill="none" stroke="#6b4f33" stroke-width="2"/>` +
    `<circle cx="60" cy="60" r="49" fill="none" stroke="#f1dcb5" stroke-opacity=".55" stroke-width="1.2"/>` +
    inner + `<circle cx="60" cy="60" r="58" fill="url(#h)"/></svg>`;
  const SIDE_A = bronze( // А: концентрические круги и прерывистая черта
    `<g fill="none" stroke="#5d4329" stroke-opacity=".7" stroke-width="1.3"><circle cx="60" cy="60" r="36"/><circle cx="60" cy="60" r="27" stroke-dasharray="3 4"/></g>` +
    `<g fill="#5d4329" fill-opacity=".75"><rect x="38" y="57" width="18" height="6" rx="1.5"/><rect x="64" y="57" width="18" height="6" rx="1.5"/></g>` +
    `<text x="60" y="94" text-anchor="middle" font-family="Georgia,serif" font-size="13" fill="#5d4329" fill-opacity=".8">2</text>`);
  const SIDE_B = bronze( // Б: лучи и цельная черта
    `<g stroke="#5d4329" stroke-opacity=".6" stroke-width="1.3">${Array.from({ length: 16 }, (_, i) => {
      const a = (i * Math.PI) / 8, r1 = 24, r2 = 38;
      return `<line x1="${(60 + r1 * Math.cos(a)).toFixed(1)}" y1="${(60 + r1 * Math.sin(a)).toFixed(1)}" x2="${(60 + r2 * Math.cos(a)).toFixed(1)}" y2="${(60 + r2 * Math.sin(a)).toFixed(1)}"/>`;
    }).join("")}</g>` +
    `<rect x="38" y="57" width="44" height="6" rx="1.5" fill="#5d4329" fill-opacity=".75"/>` +
    `<text x="60" y="94" text-anchor="middle" font-family="Georgia,serif" font-size="13" fill="#5d4329" fill-opacity=".8">3</text>`);
  const url = (svg) => `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}")`;
  box.querySelectorAll(".face.a").forEach((f) => (f.style.backgroundImage = url(SIDE_A)));
  box.querySelectorAll(".face.b").forEach((f) => (f.style.backgroundImage = url(SIDE_B)));
  const coins = [...box.querySelectorAll(".coin")];

  // ---------- состояние ----------
  let lines = []; // снизу вверх, true = ян
  let busy = false;
  let opened = false;
  let current = null; // номер ключа

  function show(panel, focus = true) {
    box.dataset.state = panel;
    box.querySelectorAll(".or-panel").forEach((p) => (p.hidden = p.dataset.panel !== panel));
    const h = box.querySelector(`.or-panel[data-panel="${panel}"] h2, .or-panel[data-panel="${panel}"] h3`);
    if (focus && h) h.focus({ preventScroll: true });
    const top = box.getBoundingClientRect().top;
    if (focus && (top < 0 || top > innerHeight * 0.5)) box.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "start" });
  }

  function renderHex(animateLast) {
    const ol = $("or-hex");
    ol.textContent = "";
    for (let i = 0; i < 6; i++) {
      const li = document.createElement("li");
      if (i < lines.length) {
        li.className = lines[i] ? "yang" : "yin";
        li.setAttribute("aria-label", `Линия ${i + 1}: ${lines[i] ? "цельная (ян)" : "прерывистая (инь)"}`);
        if (animateLast && i === lines.length - 1) li.classList.add("new");
      } else {
        li.className = "empty";
        li.setAttribute("aria-label", `Линия ${i + 1}: ещё не брошена`);
      }
      ol.append(li);
    }
    ol.classList.toggle("done", lines.length === 6);
  }

  function resetThrows() {
    lines = [];
    busy = false;
    opened = false;
    current = null;
    coins.forEach((c) => c.classList.remove("toss", "show-b"));
    $("or-step").textContent = "Бросок 1 из 6";
    $("or-status").textContent = "Сосредоточьтесь на вопросе и бросьте монеты.";
    $("or-throw-btn").hidden = false;
    $("or-throw-btn").disabled = false;
    $("or-open-btn").hidden = true;
    renderHex(false);
  }

  function startThrows() {
    resetThrows();
    const q = $("or-question").value.trim();
    $("or-asked").textContent = q ? `Ваш вопрос: «${q}»` : "Вопрос — мысленно, про себя.";
    show("throw");
  }

  const sideName = (v) => (v === 2 ? "сторона А" : "сторона Б");

  function doThrow() {
    if (busy || lines.length >= 6) return;
    busy = true;
    const btn = $("or-throw-btn");
    btn.disabled = true;
    const n = lines.length + 1;
    $("or-status").textContent = `Бросок ${n} из 6: монеты в движении…`;
    const t = Core.throwCoins();
    const dur = reduced() ? 0 : 1000;

    coins.forEach((c, i) => {
      const b = t.coins[i] === 3;
      const from = c.classList.contains("show-b") ? 180 : 0;
      const turns = 2 + i; // каждая монета делает своё число оборотов
      const to = 360 * turns + (b ? 180 : 0);
      c.style.setProperty("--from", from + "deg");
      c.style.setProperty("--to", to + "deg");
      c.style.setProperty("--dur", 0.85 + i * 0.12 + "s");
      c.classList.remove("toss", "show-b");
      void c.offsetWidth; // перезапуск анимации
      if (dur) c.classList.add("toss");
      else c.classList.toggle("show-b", b);
    });

    setTimeout(() => {
      coins.forEach((c, i) => {
        c.classList.remove("toss");
        c.classList.toggle("show-b", t.coins[i] === 3);
      });
      lines.push(t.yang);
      renderHex(true);
      const lineText = t.yang ? "цельная линия (ян)" : "прерывистая линия (инь)";
      $("or-status").textContent = `Бросок ${n}: ${t.coins.map(sideName).join(", ")} — сумма ${t.sum}, ${lineText}.`;
      busy = false;
      if (lines.length < 6) {
        $("or-step").textContent = `Бросок ${lines.length + 1} из 6`;
        btn.disabled = false;
      } else {
        current = Core.hexagramNumber(lines);
        $("or-step").textContent = "Гексаграмма сложилась";
        $("or-status").textContent += " Все шесть линий на месте — можно открыть ключ.";
        btn.hidden = true;
        $("or-open-btn").hidden = false;
        $("or-open-btn").focus();
      }
    }, dur ? 1250 : 0);
  }

  // ---------- карта: авторская или демонстрационная ----------
  const filled = (k) => k && k.card && k.shadow && k.shadow.text && k.gift && k.gift.text && k.siddhi && k.siddhi.text;

  function demoCard(n, hexLines) {
    const W = 1024, H = 1536, y0 = 980, gap = 74, bw = 520, bh = 40, x0 = (W - bw) / 2;
    let bars = "";
    hexLines.forEach((yang, i) => {
      const y = y0 - i * gap;
      bars += yang
        ? `<rect x="${x0}" y="${y}" width="${bw}" height="${bh}" rx="6" fill="#5e6449"/>`
        : `<rect x="${x0}" y="${y}" width="${bw * 0.43}" height="${bh}" rx="6" fill="#5e6449"/><rect x="${x0 + bw * 0.57}" y="${y}" width="${bw * 0.43}" height="${bh}" rx="6" fill="#5e6449"/>`;
    });
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">` +
      `<rect width="${W}" height="${H}" fill="#f7f3ec"/><rect x="40" y="40" width="${W - 80}" height="${H - 80}" fill="none" stroke="#c9b087" stroke-width="3"/>` +
      `<rect x="62" y="62" width="${W - 124}" height="${H - 124}" fill="none" stroke="#e3d8c6" stroke-width="2"/>` +
      `<g fill="none" stroke="#e3d8c6" stroke-width="2"><circle cx="512" cy="780" r="400"/><circle cx="512" cy="780" r="320" stroke-dasharray="6 12"/></g>` +
      `<text x="512" y="260" text-anchor="middle" font-family="Georgia,serif" font-size="150" fill="#34312e">${n}</text>` +
      `<text x="512" y="340" text-anchor="middle" font-family="Georgia,serif" font-size="40" fill="#9e8063" letter-spacing="6">КЛЮЧ</text>` +
      bars +
      `<text x="512" y="1300" text-anchor="middle" font-family="Arial,sans-serif" font-size="34" fill="#8d5f45">Демонстрационная карта</text>` +
      `<text x="512" y="1352" text-anchor="middle" font-family="Arial,sans-serif" font-size="28" fill="#9b9289">авторская колода готовится</text></svg>`;
  }

  function openKey() {
    if (opened || current == null) return;
    opened = true;
    const n = current;
    const k = DATA[n] || {};
    const real = filled(k);
    const img = $("or-card-img");
    img.onerror = () => { img.onerror = null; img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(demoCard(n, lines)); $("or-demo").hidden = false; };
    img.src = k.card ? k.card : "data:image/svg+xml;charset=utf-8," + encodeURIComponent(demoCard(n, lines));
    img.alt = `Карта ключа ${n}${k.name ? " — " + k.name : ""}`;
    $("or-demo").hidden = !!real;

    $("or-keyname").textContent = `Ключ ${n}${k.name ? " — " + k.name : ""}`;
    const q = $("or-question").value.trim();
    $("or-yourq").hidden = !q;
    $("or-yourq").textContent = q ? `Ваш вопрос: «${q}»` : "";
    $("or-theme").textContent = k.theme ||
      "Здесь будет краткое авторское описание символической темы ключа. Пока карта и тексты этого ключа в работе, показан демонстрационный вариант.";

    const freq = $("or-freq");
    freq.textContent = "";
    [["Тень", k.shadow, "Возможный ограничивающий паттерн и способ его переживания."],
     ["Дар", k.gift, "Потенциальный ресурс или иной взгляд на происходящее."],
     ["Сиддхи", k.siddhi, "Высший символический аспект качества в философии ключа."]].forEach(([label, v, demo]) => {
      const dt = document.createElement("dt"); dt.textContent = label;
      const dd = document.createElement("dd");
      if (v && (v.name || v.text)) {
        if (v.name) { const b = document.createElement("b"); b.textContent = v.name; dd.append(b, v.text ? " — " : ""); }
        if (v.text) dd.append(v.text);
      } else dd.textContent = demo;
      freq.append(dt, dd);
    });

    const ul = $("or-questions");
    ul.textContent = "";
    const qs = k.questions && k.questions.length ? k.questions
      : ["Где эта тема проявляется в моей жизни сейчас?", "Что я замечаю в своих реакциях?", "Какое качество мне интересно исследовать?"];
    qs.forEach((t) => { const li = document.createElement("li"); li.textContent = t; ul.append(li); });

    // куда ведёт «Исследовать ключ глубже»: к услугам этой страницы, а пока их нет — к контактам
    $("or-deeper").setAttribute("href", document.getElementById("offers") ? "#offers" : "#contact");

    const card = $("or-card");
    card.classList.add("closed");
    show("result");
    if (reduced()) card.classList.remove("closed");
    else setTimeout(() => card.classList.remove("closed"), 350);
  }

  // ---------- сохранение карты ----------
  function saveCard() {
    if (current == null) return;
    const n = String(current).padStart(2, "0");
    const k = DATA[current] || {};
    const a = document.createElement("a");
    if (k.card) { // утверждённое изображение без изменений
      a.href = k.card; a.download = `oracle-key-${n}.jpg`; a.click(); return;
    }
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas"); c.width = 1024; c.height = 1536;
      c.getContext("2d").drawImage(img, 0, 0, 1024, 1536);
      c.toBlob((b) => { const u = URL.createObjectURL(b); a.href = u; a.download = `oracle-key-${n}-demo.png`; a.click(); setTimeout(() => URL.revokeObjectURL(u), 60000); }, "image/png");
    };
    img.src = $("or-card-img").src;
  }

  // ---------- кнопки ----------
  box.addEventListener("click", (e) => {
    const go = e.target.closest("[data-go]");
    if (go) {
      const to = go.dataset.go;
      if (to === "throw") return startThrows();
      if (go.dataset.reset === "throws") resetThrows();
      return show(to);
    }
    if (e.target.closest("[data-exit]")) {
      $("or-question").value = "";
      resetThrows();
      return show("intro");
    }
  });
  $("or-throw-btn").addEventListener("click", doThrow);
  $("or-open-btn").addEventListener("click", openKey);
  $("or-save").addEventListener("click", saveCard);
  renderHex(false);
})();
