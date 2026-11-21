import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { ASSET_STICKERS, ASSET_AVATARS } from '../src/data/canvasAssets';
import { StudioCompanion, COMPANION_ROSTER } from '../src/components/StudioCompanion';

test('Rive Character Project Structure & Verification', () => {
  const riveDir = path.resolve(process.cwd(), 'rive-character');
  const yamlPath = path.join(riveDir, 'rive.yaml');
  const rmlPath = path.join(riveDir, 'scene.rml');

  assert.ok(fs.existsSync(yamlPath), 'rive.yaml must exist');
  assert.ok(fs.existsSync(rmlPath), 'scene.rml must exist');

  const yamlContent = fs.readFileSync(yamlPath, 'utf8');
  assert.ok(yamlContent.includes('name: rive-character'), 'rive.yaml must contain project name');

  const rmlContent = fs.readFileSync(rmlPath, 'utf8');
  assert.ok(rmlContent.includes('<Artboard'), 'scene.rml must define Artboard');
  assert.ok(rmlContent.includes('Archie'), 'scene.rml must reference Archie');
  assert.ok(rmlContent.includes('name="Cap"'), 'scene.rml must define Cap shape');
  assert.ok(rmlContent.includes('StateMachine'), 'scene.rml must define StateMachine');
  assert.ok(rmlContent.includes('FloatIdle'), 'scene.rml must define FloatIdle animation');

  // Verify CLI verification if rive binary is present
  const homeRive = path.join(process.env.HOME || '', '.rive', 'bin', 'rive');
  if (fs.existsSync(homeRive)) {
    const output = execSync(`"${homeRive}" "${riveDir}" --verify 2>&1`, { encoding: 'utf8' });
    assert.ok(output.includes('0 errors'), `rive verify must report 0 errors, got: ${output}`);
  }
});

test('Interactive Character Companion Sticker & Avatar Assets (6 Happy Companions)', () => {
  // Check Sticker exports
  assert.ok(ASSET_STICKERS.archieMascot, 'archieMascot must be exported in ASSET_STICKERS');
  assert.ok(ASSET_STICKERS.archieMascot.startsWith('data:image/svg+xml;utf8,<svg'), 'archieMascot must be SVG data URL');
  assert.ok(ASSET_STICKERS.pipMascot, 'pipMascot must be exported in ASSET_STICKERS');
  assert.ok(ASSET_STICKERS.pipMascot.startsWith('data:image/svg+xml;utf8,<svg'), 'pipMascot must be SVG data URL');
  assert.ok(ASSET_STICKERS.emulsionCat, 'emulsionCat must be exported in ASSET_STICKERS');
  assert.ok(ASSET_STICKERS.emulsionCat.startsWith('data:image/svg+xml;utf8,<svg'), 'emulsionCat must be SVG data URL');
  assert.ok((ASSET_STICKERS as any).komorebiBunny, 'komorebiBunny must be exported in ASSET_STICKERS');
  assert.ok((ASSET_STICKERS as any).cosmoStar, 'cosmoStar must be exported in ASSET_STICKERS');
  assert.ok((ASSET_STICKERS as any).mochiCloud, 'mochiCloud must be exported in ASSET_STICKERS');

  // Check Avatar exports
  assert.ok(ASSET_AVATARS.archieBear, 'archieBear must be exported in ASSET_AVATARS');
  assert.ok(ASSET_AVATARS.pipPixel, 'pipPixel must be exported in ASSET_AVATARS');
  assert.ok(ASSET_AVATARS.emulsionCat, 'emulsionCat must be exported in ASSET_AVATARS');
  assert.ok((ASSET_AVATARS as any).komorebiBunny, 'komorebiBunny must be exported in ASSET_AVATARS');
  assert.ok((ASSET_AVATARS as any).cosmoStar, 'cosmoStar must be exported in ASSET_AVATARS');
  assert.ok((ASSET_AVATARS as any).mochiCloud, 'mochiCloud must be exported in ASSET_AVATARS');
});

test('StudioCompanion React Component Export & Roster Definition', () => {
  assert.equal(typeof StudioCompanion, 'function', 'StudioCompanion must be a React functional component');
  assert.equal(COMPANION_ROSTER.length, 6, 'Must provide 6 distinct joyful companions in COMPANION_ROSTER');
  const rosterIds = COMPANION_ROSTER.map((c) => c.id);
  assert.deepEqual(rosterIds, ['archie', 'pip', 'emulsion', 'komorebi', 'cosmo', 'mochi']);
});
