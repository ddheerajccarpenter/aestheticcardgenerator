import assert from 'node:assert';
import { BINGO_KINDS, BINGO_PALETTES, generateBingoCells } from '../src/data/bingoPresets';

assert.strictEqual(BINGO_KINDS.length, 4, 'Expected exactly 4 bingo card kinds');
assert.strictEqual(BINGO_PALETTES.length, 4, 'Expected 4 bingo palettes');

for (const kind of BINGO_KINDS) {
  const cells = generateBingoCells(kind.id);
  assert.strictEqual(cells.length, 25, `${kind.id} must generate 25 cells`);
  assert.strictEqual(cells[12], 'FREE', `${kind.id} center cell must be FREE`);

  const nonFree = cells.filter((_, idx) => idx !== 12);
  assert.strictEqual(new Set(nonFree).size, 24, `${kind.id} must have 24 unique non-free cells`);

  if (kind.id === 'classic') {
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        if (row === 2 && col === 2) continue;
        const val = Number(cells[row * 5 + col]);
        const min = col * 15 + 1;
        const max = col * 15 + 15;
        assert.ok(val >= min && val <= max, `Classic col ${col} value ${val} out of [${min}, ${max}]`);
      }
    }
  }
}

console.log('✓ All 4 bingo card kinds generated valid 5x5 boards.');
