import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { COMPANION_ROSTER } from '../src/components/StudioCompanion';

test('Studio Companion: 6 joyful characters with metadata and persistent position structure', () => {
  assert.equal(COMPANION_ROSTER.length, 6, 'Should have exactly 6 companions');
  const expectedCharacters = ['archie', 'pip', 'emulsion', 'komorebi', 'cosmo', 'mochi'];
  for (const exp of expectedCharacters) {
    const found = COMPANION_ROSTER.find((c) => c.id === exp);
    assert.ok(found, `Expected companion ${exp} must be present in COMPANION_ROSTER`);
    assert.ok(found.name.length > 0, `${exp} must have a name`);
    assert.ok(found.greeting.length > 0, `${exp} must have a greeting`);
    assert.ok(found.badge.length > 0, `${exp} must have a badge emoji/icon`);
  }

  // Inspect StudioCompanion.tsx source for drag events, size responsive classes, and localStorage keys
  const companionSrc = fs.readFileSync(path.resolve(process.cwd(), 'src/components/StudioCompanion.tsx'), 'utf8');
  assert.ok(companionSrc.includes('acg_companion_pos'), 'Must persist position in acg_companion_pos localStorage key');
  assert.ok(companionSrc.includes('acg_companion_char'), 'Must persist selected character in acg_companion_char localStorage key');
  assert.ok(companionSrc.includes('onPointerDown='), 'Must handle pointer down for fluid drag-and-drop');
  assert.ok(companionSrc.includes('onPointerMove='), 'Must handle pointer move for fluid drag-and-drop');
  assert.ok(companionSrc.includes('onPointerUp='), 'Must handle pointer up for fluid drag-and-drop');
  assert.ok(companionSrc.includes('setPointerCapture'), 'Must capture pointer for smooth boundary dragging');
  assert.ok(companionSrc.includes('md:w-24 md:h-24') || companionSrc.includes('md:w-28 md:h-28'), 'Must be larger on laptop screen');
  assert.ok(companionSrc.includes('w-16 h-16'), 'Must be optimized size w-16 h-16 on mobile screen');
});

test('Export Engine: WebP export uses direct WebP Blob and does not pass blob URLs to dataUrlToBlob', () => {
  const canvasEditorSrc = fs.readFileSync(path.resolve(process.cwd(), 'src/views/CanvasEditorView.tsx'), 'utf8');
  // Confirm WebP handling does NOT use dataUrlToBlob(dataUrl) when dataUrl is a blob: URL
  assert.ok(canvasEditorSrc.includes("actualFormat === 'webp'"), 'Must handle webp format branch');
  assert.ok(
    canvasEditorSrc.includes("type: 'image/webp'"),
    'Must request webp blob'
  );
  assert.ok(
    canvasEditorSrc.includes('exportBlob = blob;'),
    'Must assign webp blob directly to exportBlob'
  );
  assert.ok(!canvasEditorSrc.includes('const exportBlob = dataUrlToBlob(dataUrl);\n      triggerBrandedBlobDownload(exportBlob, filename);\n      if (actualFormat === \'webp\''), 'Must not pass blob URL to dataUrlToBlob');
});

test('Media Search & Import: AbortController cancels in-flight queries on tab switch and close', () => {
  const mediaModalSrc = fs.readFileSync(path.resolve(process.cwd(), 'src/components/MediaImportModal.tsx'), 'utf8');
  assert.ok(mediaModalSrc.includes('abortControllerRef'), 'Must declare abortControllerRef');
  assert.ok(mediaModalSrc.includes('controller.signal'), 'Must pass controller.signal to fetch');
  assert.ok(mediaModalSrc.includes('cancelActiveRequest'), 'Must cancel active requests on tab switch or close');
  assert.ok(mediaModalSrc.includes("err.name === 'AbortError'"), 'Must gracefully catch AbortError without alerting user');
});

test('Loading & Startup: Theme initialization in <head> prevents theme flash', () => {
  const layoutSrc = fs.readFileSync(path.resolve(process.cwd(), 'src/layouts/SiteLayout.astro'), 'utf8');
  assert.ok(layoutSrc.includes('<script is:inline>'), 'Must include inline script in <head> to prevent theme flash');
  assert.ok(layoutSrc.includes('aesthetic_card_studio_theme'), 'Inline script must check aesthetic_card_studio_theme');
  assert.ok(layoutSrc.includes("root.classList.add('light')") || layoutSrc.includes("classList.add('light')"), 'Inline script must apply light theme class before paint');
});

test('Antislop Verification: No generic AI marketing clichés in content data', () => {
  const blogSrc = fs.readFileSync(path.resolve(process.cwd(), 'src/data/blog.ts'), 'utf8');
  const extendedTemplatesSrc = fs.readFileSync(path.resolve(process.cwd(), 'src/data/extendedTemplates.ts'), 'utf8');
  const guidesSrc = fs.readFileSync(path.resolve(process.cwd(), 'src/data/guides.ts'), 'utf8');

  assert.ok(!blogSrc.includes('typographic dignity'), 'blog.ts must not contain "typographic dignity"');
  assert.ok(!extendedTemplatesSrc.includes('typographic dignity'), 'extendedTemplates.ts must not contain "typographic dignity"');
  assert.ok(!guidesSrc.includes('intellectual resonance'), 'guides.ts must not contain "intellectual resonance"');
  assert.ok(!extendedTemplatesSrc.includes('tactile digital aesthetic cards'), 'extendedTemplates.ts must not contain "tactile digital aesthetic cards"');
});
