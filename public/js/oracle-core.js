/*
 * Оракул 64 ключей — логика без интерфейса (броски, линии, номер гексаграммы).
 * Работает в браузере (window.OracleCore) и в Node (require) — для тестов.
 *
 * Монета: сторона А = 2, сторона Б = 3. Сумма трёх монет: 6 и 8 — инь, 7 и 9 — ян.
 * Изменяющихся линий нет (ТЗ, раздел 08). Гексаграмма строится строго снизу вверх:
 * первый бросок — нижняя линия, шестой — верхняя.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.OracleCore = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  // Триграммы: линии снизу вверх, 1 = ян (цельная), 0 = инь (прерывистая).
  const TRIGRAMS = {
    "111": "qian", // Небо
    "000": "kun", // Земля
    "100": "zhen", // Гром
    "010": "kan", // Вода
    "001": "gen", // Гора
    "011": "xun", // Ветер
    "101": "li", // Огонь
    "110": "dui" // Озеро
  };
  // Порядок Вэнь-вана: строка — нижняя триграмма, столбец — верхняя.
  // Сверено с таблицей «Hexagram (I Ching)» (Википедия): все 64 клетки.
  const ORDER = ["qian", "kun", "zhen", "kan", "gen", "xun", "li", "dui"];
  const KING_WEN = {
    qian: [1, 11, 34, 5, 26, 9, 14, 43],
    kun: [12, 2, 16, 8, 23, 20, 35, 45],
    zhen: [25, 24, 51, 3, 27, 42, 21, 17],
    kan: [6, 7, 40, 29, 4, 59, 64, 47],
    gen: [33, 15, 62, 39, 52, 53, 56, 31],
    xun: [44, 46, 32, 48, 18, 57, 50, 28],
    li: [13, 36, 55, 63, 22, 37, 30, 49],
    dui: [10, 19, 54, 60, 41, 61, 38, 58]
  };

  // Равновероятный выбор стороны монеты: crypto.getRandomValues, если доступен.
  function randomBit() {
    const c = typeof globalThis !== "undefined" && globalThis.crypto;
    if (c && typeof c.getRandomValues === "function") {
      const a = new Uint8Array(1);
      c.getRandomValues(a);
      return a[0] & 1;
    }
    return Math.random() < 0.5 ? 0 : 1; // запасной вариант для очень старых браузеров
  }

  // Один бросок трёх монет: [2|3, 2|3, 2|3], сумма и тип линии.
  function throwCoins(rand = randomBit) {
    const coins = [0, 1, 2].map(() => (rand() ? 3 : 2));
    const sum = coins[0] + coins[1] + coins[2];
    return { coins, sum, yang: sum === 7 || sum === 9 };
  }

  // Номер гексаграммы по шести линиям (массив снизу вверх, true = ян).
  function hexagramNumber(lines) {
    if (!Array.isArray(lines) || lines.length !== 6) throw new Error("Нужно ровно шесть линий");
    const bits = lines.map((y) => (y ? "1" : "0"));
    const lower = TRIGRAMS[bits.slice(0, 3).join("")];
    const upper = TRIGRAMS[bits.slice(3, 6).join("")];
    return KING_WEN[lower][ORDER.indexOf(upper)];
  }

  return { throwCoins, hexagramNumber, randomBit, TRIGRAMS, KING_WEN, ORDER };
});
