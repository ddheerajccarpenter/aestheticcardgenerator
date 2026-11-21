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

test('Studio Companion: Boundary limits, clean avatar, no click cheering, and canvas stamping', () => {
  const companionSrc = fs.readFileSync(path.resolve(process.cwd(), 'src/components/StudioCompanion.tsx'), 'utf8');

  // 1. Boundary limits: never cross top navbar or bottom navigation
  assert.ok(companionSrc.includes('minY = 72'), 'minY constraint must be at least 72 to never cross top navbar');
  assert.ok(companionSrc.includes('bottomSafety = window.innerWidth < 768 ? 84 : 20'), 'Must enforce bottom navigation clearance on mobile');

  // 2. Clean character avatar: no floating buttons sitting on character
  assert.ok(!companionSrc.includes('absolute -top-2 -right-2 flex items-center gap-1'), 'Must not have floating buttons on character avatar');

  // 3. Cheering does NOT happen on normal character click
  const clickHandlerMatch = companionSrc.match(/const handleCharacterClick = \(\) => \{([\s\S]*?)\};/);
  assert.ok(clickHandlerMatch, 'Must define handleCharacterClick');
  assert.ok(!clickHandlerMatch[1].includes('confetti('), 'Normal character click must NEVER trigger confetti or celebratory cheer');

  // 4. Stamping on canvas
  assert.ok(companionSrc.includes('acg:add-mascot-sticker'), 'Must dispatch acg:add-mascot-sticker event to add companion to canvas');
  assert.ok(companionSrc.includes('handleAddToCanvas'), 'Must define handleAddToCanvas');

  // Check CanvasEditorView listener for companion sticker
  const canvasEditorSrc = fs.readFileSync(path.resolve(process.cwd(), 'src/views/CanvasEditorView.tsx'), 'utf8');
  assert.ok(canvasEditorSrc.includes('acg:add-mascot-sticker'), 'CanvasEditorView must listen for acg:add-mascot-sticker');
  assert.ok(canvasEditorSrc.includes('acg_staged_sticker'), 'CanvasEditorView must restore staged sticker if opened after');
});

test('Typography: Comfortaa medium bold and Starborn display headings', () => {
  // Check Starborn font file exists in public/fonts
  const starbornPath = path.resolve(process.cwd(), 'public/fonts/Starborn.ttf');
  assert.ok(fs.existsSync(starbornPath), 'Starborn.ttf must exist in public/fonts');

  // Check SiteLayout.astro font links
  const layoutSrc = fs.readFileSync(path.resolve(process.cwd(), 'src/layouts/SiteLayout.astro'), 'utf8');
  assert.ok(layoutSrc.includes('Comfortaa'), 'SiteLayout must include Google Font Comfortaa');
  assert.ok(layoutSrc.includes('/fonts/Starborn.ttf'), 'SiteLayout must preload Starborn.ttf');

  // Check index.css font definitions
  const cssSrc = fs.readFileSync(path.resolve(process.cwd(), 'src/index.css'), 'utf8');
  assert.ok(cssSrc.includes("@font-face {\n  font-family: 'Starborn';"), 'index.css must define @font-face for Starborn');
  assert.ok(cssSrc.includes("--font-heading: 'Starborn'"), 'index.css must set --font-heading to Starborn');
  assert.ok(cssSrc.includes("--font-body: 'Comfortaa'"), 'index.css must set --font-body to Comfortaa');
  assert.ok(cssSrc.includes('font-weight: 500;'), 'index.css must set medium weight 500 for body typography');
});

test('3D Stage Engine: Tilt rotation, lighting and UI controls', () => {
  const threeStageSrc = fs.readFileSync(path.resolve(process.cwd(), 'src/engines/threeCardStage.ts'), 'utf8');
  assert.ok(threeStageSrc.includes('card.rotation.set(-0.14, 0.22, -0.02)'), 'Must have initial realistic 3D tilt rotation');
  assert.ok(threeStageSrc.includes('rimLight'), 'Must feature rim lighting for dimensional bevels');

  const controlsSrc = fs.readFileSync(path.resolve(process.cwd(), 'src/components/ThreeDPreviewControls.tsx'), 'utf8');
  assert.ok(controlsSrc.includes('Exit 3D'), 'Must provide an explicit Exit 3D button in controls');
  assert.ok(controlsSrc.includes('onExit'), 'Controls must accept onExit callback');

  const canvasEditorSrc = fs.readFileSync(path.resolve(process.cwd(), 'src/views/CanvasEditorView.tsx'), 'utf8');
  assert.ok(canvasEditorSrc.includes('onExit={() => setIs3DMode(false)}'), 'CanvasEditorView must pass onExit handler to ThreeDPreviewControls');
  assert.ok(canvasEditorSrc.includes('aspect-[4/3] sm:aspect-square'), '3D container must have responsive aspect ratio');
});

test('Export Engine: WebP export uses direct WebP Blob and does not pass blob URLs to dataUrlToBlob', () => {
  const canvasEditorSrc = fs.readFileSync(path.resolve(process.cwd(), 'src/views/CanvasEditorView.tsx'), 'utf8');
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
