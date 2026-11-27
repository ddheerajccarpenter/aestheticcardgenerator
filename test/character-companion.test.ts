import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { ASSET_STICKERS, ASSET_AVATARS } from '../src/data/canvasAssets';
import { StudioCompanion, COMPANION_ROSTER } from '../src/components/StudioCompanion';

test('Legacy Archie Rive companion directory is removed', () => {
  const riveDir = path.resolve(process.cwd(), 'rive-character');
  assert.equal(fs.existsSync(riveDir), false, 'rive-character directory must be removed');
});

test('Interactive Cloud Companion Sticker & Avatar Assets (Mochi Only)', () => {
  assert.ok(ASSET_STICKERS.mochiCloud, 'mochiCloud must be exported in ASSET_STICKERS');
  assert.ok(ASSET_STICKERS.mochiCloud.startsWith('data:image/svg+xml;utf8,<svg'), 'mochiCloud must be SVG data URL');
  assert.ok(ASSET_AVATARS.mochiCloud, 'mochiCloud must be exported in ASSET_AVATARS');
  assert.ok(ASSET_AVATARS.mochiCloud.startsWith('data:image/svg+xml;utf8,<svg'), 'mochiCloud avatar must be SVG data URL');

  for (const removedSticker of ['archieMascot', 'pipMascot', 'emulsionCat', 'komorebiBunny', 'cosmoStar']) {
    assert.equal(removedSticker in ASSET_STICKERS, false, `${removedSticker} must be removed from ASSET_STICKERS`);
  }
  for (const removedAvatar of ['archieBear', 'pipPixel', 'emulsionCat', 'komorebiBunny', 'cosmoStar']) {
    assert.equal(removedAvatar in ASSET_AVATARS, false, `${removedAvatar} must be removed from ASSET_AVATARS`);
  }
});

test('StudioCompanion React Component Export & Cloud-Only Roster Definition', () => {
  assert.equal(typeof StudioCompanion, 'function', 'StudioCompanion must be a React functional component');
  assert.equal(COMPANION_ROSTER.length, 1, 'COMPANION_ROSTER must keep only Mochi Cloud');
  assert.deepEqual(
    COMPANION_ROSTER.map((c) => c.id),
    ['mochi']
  );
});
