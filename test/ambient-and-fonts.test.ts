import assert from 'node:assert';
import { normalizeAmbientColor, DEFAULT_DARK_AMBIENT, DEFAULT_LIGHT_AMBIENT } from '../src/engines/ambientAtmosphere';
import { PRESET_TEMPLATES } from '../src/data/templates';
import { getTemplateAmbientTones } from '../src/utils/templateAmbient';
import { validateFontFile } from '../src/services/customFontManager';

console.log('--- Running Ambient Atmosphere, Font Engine & 90 Templates Audit ---');

// 1. Ambient Color Normalization
const testColors = ['#ff0000', '#00ff00', '#0000ff', '#18191c', '#f1ebdd', '#c69d78'];

for (const col of testColors) {
  const darkNorm = normalizeAmbientColor(col, 'dark');
  const lightNorm = normalizeAmbientColor(col, 'light');

  assert.match(darkNorm, /^#[0-9a-f]{6}$/i, `Dark norm for ${col} must be 6-char hex`);
  assert.match(lightNorm, /^#[0-9a-f]{6}$/i, `Light norm for ${col} must be 6-char hex`);
}
console.log('✓ normalizeAmbientColor produces valid hex colors across test swatches.');

// 2. Default Ambient Presets
assert.strictEqual(DEFAULT_DARK_AMBIENT.primary, '#c69d78');
assert.strictEqual(DEFAULT_LIGHT_AMBIENT.primary, '#6f4637');
console.log('✓ Default dark and light ambient palettes verified.');

// 3. 90 Templates Full Audit
assert.strictEqual(PRESET_TEMPLATES.length, 90, `Expected 90 templates, found ${PRESET_TEMPLATES.length}`);

const seenIds = new Set<string>();
for (const tmpl of PRESET_TEMPLATES) {
  assert.ok(tmpl.id, 'Template must have an id');
  assert.ok(!seenIds.has(tmpl.id), `Duplicate template id detected: ${tmpl.id}`);
  seenIds.add(tmpl.id);

  assert.ok(tmpl.title && tmpl.title.trim().length > 0, `Template ${tmpl.id} must have a non-empty title`);
  assert.ok(tmpl.category, `Template ${tmpl.id} must have a category`);
  assert.ok(tmpl.theme, `Template ${tmpl.id} must have a theme`);
  assert.ok(tmpl.theme.bg, `Template ${tmpl.id} must have theme.bg`);
  assert.ok(tmpl.theme.ink, `Template ${tmpl.id} must have theme.ink`);

  // Verify ambient tones derivation works without throwing
  const darkTones = getTemplateAmbientTones(tmpl, 'dark');
  const lightTones = getTemplateAmbientTones(tmpl, 'light');

  assert.match(darkTones.primary, /^#[0-9a-f]{6}$/i);
  assert.match(darkTones.secondary, /^#[0-9a-f]{6}$/i);
  assert.match(lightTones.primary, /^#[0-9a-f]{6}$/i);
  assert.match(lightTones.secondary, /^#[0-9a-f]{6}$/i);
}
console.log(`✓ Audited all ${PRESET_TEMPLATES.length} templates: IDs are unique, metadata complete, ambient tones derived cleanly.`);

// 4. Custom Font Validation Rules
// Size limit test
const oversizedBlob = new Blob([new Uint8Array(16 * 1024 * 1024)], { type: 'font/woff2' });
const oversizedFile = new File([oversizedBlob], 'large.woff2');
assert.throws(
  () => validateFontFile(oversizedFile, new ArrayBuffer(0)),
  /15MB/i
);

// Invalid extension test
const invalidExtBlob = new Blob([new Uint8Array(100)], { type: 'application/octet-stream' });
const invalidExtFile = new File([invalidExtBlob], 'font.exe');
assert.throws(
  () => validateFontFile(invalidExtFile, new ArrayBuffer(0)),
  /Unsupported font format/i
);

// Corrupted header test
const validNameFile = new File([new Blob([new Uint8Array(100)])], 'test.woff2');
assert.throws(
  () => validateFontFile(validNameFile, new Uint8Array([0, 0, 0, 0]).buffer),
  /Unrecognized font signature/i
);

// Valid magic byte signatures test
const woff2Header = new Uint8Array([0x77, 0x4f, 0x46, 0x32, 0, 0, 0, 0]).buffer;
const woff2File = new File([new Blob([new Uint8Array(100)])], 'inter.woff2');
assert.doesNotThrow(() => validateFontFile(woff2File, woff2Header), 'Valid woff2 header must pass');

const ttfHeader = new Uint8Array([0x00, 0x01, 0x00, 0x00, 0, 0, 0, 0]).buffer;
const ttfFile = new File([new Blob([new Uint8Array(100)])], 'roboto.ttf');
assert.doesNotThrow(() => validateFontFile(ttfFile, ttfHeader), 'Valid ttf header must pass');

const otfHeader = new Uint8Array([0x4f, 0x54, 0x54, 0x4f, 0, 0, 0, 0]).buffer;
const otfFile = new File([new Blob([new Uint8Array(100)])], 'playfair.otf');
assert.doesNotThrow(() => validateFontFile(otfFile, otfHeader), 'Valid otf header must pass');

console.log('✓ Custom font validation rules (format, size limits, and magic byte signatures) verified.');
console.log('All Ambient Atmosphere, Font Engine & 76 Templates tests passed!');
