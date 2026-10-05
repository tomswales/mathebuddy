import test from 'node:test';
import assert from 'node:assert/strict';
import { LEVELS, ROUND_SIZE, automaticLevel, makeRound, parseAnswer, hintFor } from '../games/einmaleins-model.mjs';

// Repeatable randomness exercises a wide range of rounds without flaky tests.
function seededRandom(seed) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}
for (let level = 1; level <= LEVELS.length; level++) {
  test(`level ${level}: bounded, varied questions and coverage of every table`, () => {
    const config = LEVELS[level - 1];
    const observed = new Set();
    for (let seed = 1; seed <= 100; seed++) {
      const round = makeRound(level, seededRandom(seed));
      assert.equal(round.length, ROUND_SIZE);
      assert.equal(new Set(round.map(q => `${q.a}:${q.b}`)).size, ROUND_SIZE);
      assert.deepEqual([...new Set(round.map(q => q.a))].sort((a, b) => a - b), config.rows);
      for (const q of round) {
        assert.ok(config.rows.includes(q.a));
        assert.ok(q.b >= 1 && q.b <= config.max);
        assert.equal(q.product, q.a * q.b);
        assert.equal(q.answer, q[q.hole]);
        observed.add(`${q.a}:${q.b}`);
        if (level < 5) assert.equal(q.hole, 'product');
      }
      if (level === 5) assert.deepEqual(new Set(round.map(q => q.hole)), new Set(['product', 'a', 'b']));
    }
    assert.equal(observed.size, config.rows.length * config.max);
  });
}
test('level progression advances every 20 stars and caps at level 5', () => {
  for (const [stars, level] of [[0, 1], [19, 1], [20, 2], [39, 2], [40, 3], [60, 4], [80, 5], [1000, 5]]) {
    assert.equal(automaticLevel(stars), level);
  }
});
test('rounds change with the random seed', () => {
  assert.notDeepEqual(makeRound(4, seededRandom(1)), makeRound(4, seededRandom(2)));
  assert.throws(() => makeRound(0), RangeError);
  assert.throws(() => makeRound(6), RangeError);
});
test('answers accept only whole numbers', () => {
  for (const value of ['', ' ', '-2', '2.5', '1e2', '12foo', '1000']) assert.equal(parseAnswer(value), null);
  assert.equal(parseAnswer(' 42 '), 42);
  assert.equal(parseAnswer('100'), 100);
});
test('hints describe multiplication or the missing factor', () => {
  assert.match(hintFor({ a: 3, b: 4, product: 12, hole: 'product' }), /4, 8, 12/);
  assert.equal(hintFor({ a: 3, b: 4, product: 12, hole: 'a' }), 'Welche Zahl mal 4 ergibt 12?');
  assert.equal(hintFor({ a: 3, b: 4, product: 12, hole: 'b' }), 'Welche Zahl mal 3 ergibt 12?');
});
