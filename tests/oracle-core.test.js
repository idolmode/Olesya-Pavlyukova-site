// Тесты логики оракула: node tests/oracle-core.test.js
const assert = require("assert");
const O = require("../public/js/oracle-core.js");

// 1) все 64 сочетания дают 64 разных номера 1..64
const seen = new Map();
for (let m = 0; m < 64; m++) {
  const lines = [0, 1, 2, 3, 4, 5].map((i) => !!((m >> i) & 1)); // бит i = линия i+1 снизу
  const n = O.hexagramNumber(lines);
  assert(n >= 1 && n <= 64, "номер вне диапазона");
  assert(!seen.has(n), `номер ${n} повторяется`);
  seen.set(n, lines);
}
assert.strictEqual(seen.size, 64);

// 2) проверочные случаи из ТЗ и известные гексаграммы (порядок линий снизу вверх)
const Y = true, N = false;
const cases = [
  [[Y, Y, Y, Y, Y, Y], 1, "шесть цельных — №1"],
  [[N, N, N, N, N, N], 2, "шесть прерывистых — №2"],
  [[Y, N, N, N, N, N], 24, "ян только внизу — №24 (Возврат)"],
  [[N, N, N, N, N, Y], 23, "ян только наверху — №23 (Разорение)"],
  [[Y, Y, Y, N, N, N], 11, "Земля над Небом — №11"],
  [[N, N, N, Y, Y, Y], 12, "Небо над Землёй — №12"],
  [[Y, N, Y, N, Y, N], 63, "Вода над Огнём — №63"],
  [[N, Y, N, Y, N, Y], 64, "Огонь над Водой — №64"],
  [[Y, N, N, N, Y, N], 3, "Вода над Громом — №3"],
  [[N, Y, N, N, N, Y], 4, "Гора над Водой — №4"],
  [[Y, Y, N, Y, Y, N], 58, "Озеро над Озером — №58"],
  [[N, Y, Y, N, Y, Y], 57, "Ветер над Ветром — №57"]
];
for (const [lines, n, name] of cases) assert.strictEqual(O.hexagramNumber(lines), n, name);

// 3) направление снизу вверх: перевёрнутая №24 — это №23, не №24
assert.notStrictEqual(O.hexagramNumber([N, N, N, N, N, Y]), 24);

// 4) бросок: монеты 2/3, сумма 6..9, тип линии по таблице ТЗ
const seq = [0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 0];
let i = 0;
const fake = () => seq[i++ % seq.length];
assert.deepStrictEqual(O.throwCoins(fake), { coins: [2, 2, 2], sum: 6, yang: false });
assert.deepStrictEqual(O.throwCoins(fake), { coins: [3, 3, 3], sum: 9, yang: true });
assert.deepStrictEqual(O.throwCoins(fake), { coins: [3, 2, 2], sum: 7, yang: true });
assert.deepStrictEqual(O.throwCoins(fake), { coins: [3, 3, 2], sum: 8, yang: false });

// 5) распределение: 200 000 бросков с настоящим генератором — сумма 6/7/8/9 ≈ 1/8, 3/8, 3/8, 1/8; инь/ян ≈ 50/50
const cnt = { 6: 0, 7: 0, 8: 0, 9: 0 };
let yang = 0;
const T = 200000;
for (let k = 0; k < T; k++) { const t = O.throwCoins(); cnt[t.sum]++; if (t.yang) yang++; }
const near = (v, p) => Math.abs(v / T - p) < 0.01;
assert(near(cnt[6], 1 / 8) && near(cnt[7], 3 / 8) && near(cnt[8], 3 / 8) && near(cnt[9], 1 / 8), JSON.stringify(cnt));
assert(near(yang, 0.5), "ян " + yang / T);

// 6) все 64 ключа выпадают примерно поровну (≈1/64)
const hits = new Array(65).fill(0);
const H = 128000;
for (let k = 0; k < H; k++) hits[O.hexagramNumber([0, 1, 2, 3, 4, 5].map(() => O.throwCoins().yang))]++;
const min = Math.min(...hits.slice(1)), max = Math.max(...hits.slice(1));
assert(min > H / 64 * 0.85 && max < H / 64 * 1.15, `разброс ${min}..${max}`);

console.log("OK: 64 уникальных номера, проверочные случаи, снизу вверх, броски и равномерность —", { sums: cnt, keyMin: min, keyMax: max });
