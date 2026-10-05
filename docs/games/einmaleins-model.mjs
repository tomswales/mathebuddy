export const ROUND_SIZE = 10;
export const LEVELS = [
  { title: 'Erste Schritte', description: '1er-, 2er-, 5er- und 10er-Reihe · zweite Zahl von 1 bis 5', rows: [1, 2, 5, 10], max: 5 },
  { title: 'Die Reihen wachsen', description: '1er-, 2er-, 5er- und 10er-Reihe · zweite Zahl von 1 bis 10', rows: [1, 2, 5, 10], max: 10 },
  { title: 'Neue Reihen', description: 'Jetzt auch die 3er-, 4er- und 6er-Reihe · zweite Zahl von 1 bis 10', rows: [1, 2, 3, 4, 5, 6, 10], max: 10 },
  { title: 'Das ganze Einmaleins', description: 'Alle Reihen von 1 bis 10 · bunt gemischte Aufgaben', rows: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], max: 10 },
  { title: 'Zahlen-Detektiv', description: 'Alle Reihen · Ergebnisse und fehlende Faktoren finden', rows: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], max: 10, missing: true },
];
export const automaticLevel = stars => Math.min(LEVELS.length, 1 + Math.floor(stars / 20));

function shuffle(values, random) {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function makeRound(level, random = Math.random) {
  const config = LEVELS[level - 1];
  if (!config) throw new RangeError('Unknown level');
  // Cycle shuffled rows so every newly introduced table appears in a round.
  const rows = [];
  while (rows.length < ROUND_SIZE) rows.push(...shuffle(config.rows, random));
  const used = new Set();
  const holes = shuffle(['product', 'a', 'b', 'product', 'a', 'b', 'product', 'a', 'b', 'product'], random);
  return rows.slice(0, ROUND_SIZE).map((a, index) => {
    const candidates = Array.from({ length: config.max }, (_, i) => i + 1)
      .filter(b => !used.has(`${a}:${b}`));
    const b = candidates[Math.floor(random() * candidates.length)];
    used.add(`${a}:${b}`);
    const product = a * b;
    const hole = config.missing ? holes[index] : 'product';
    return { a, b, product, hole, answer: hole === 'a' ? a : hole === 'b' ? b : product };
  });
}

export function parseAnswer(value) {
  const text = value.trim();
  return /^\d{1,3}$/.test(text) ? Number(text) : null;
}

export function hintFor(q) {
  if (q.hole !== 'product') return `Welche Zahl mal ${q.hole === 'a' ? q.b : q.a} ergibt ${q.product}?`;
  return `${q.a} × ${q.b} bedeutet ${q.a} Gruppen mit je ${q.b}. Zähle in ${q.b}er-Schritten: ${Array.from({ length: q.a }, (_, i) => (i + 1) * q.b).join(', ')}.`;
}
