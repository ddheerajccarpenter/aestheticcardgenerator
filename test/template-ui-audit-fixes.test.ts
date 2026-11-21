import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';

const SRC_DIR = path.resolve(process.cwd(), 'src');

test('Bug 1 & 5: Card Creator Mobile Export Visibility & Author Text Wrapping', () => {
  const creatorContent = fs.readFileSync(path.join(SRC_DIR, 'views', 'CreatorView.tsx'), 'utf8');

  // Bug 1: Export button must have shrink-0 and be prominent
  assert.ok(
    creatorContent.includes('title="Download Retina PNG"') &&
    creatorContent.includes('shrink-0'),
    'Export button must have shrink-0 so it is never pushed offscreen'
  );

  // Secondary items must be hidden on extra small viewports so Export stays visible at 360px/402px
  assert.ok(
    creatorContent.includes('hidden sm:flex') && creatorContent.includes('Copy Text to Clipboard'),
    'Header copy button should be hidden on narrow mobile header to give room for export'
  );

  // Bug 5: Author text must not be cut off with truncate inside card footer
  assert.ok(
    !creatorContent.includes('opacity-90 truncate">{author}</span>'),
    'Author attribution should not restrict to single-line truncate'
  );
  assert.ok(
    creatorContent.includes('break-words">{author}</span>'),
    'Author attribution must allow word-wrapping on narrow mobile screens'
  );
});

test('Bug 2, 3 & 4: Mobile Canvas Inspector Controls, Layer Switching & Accessible Buttons', () => {
  const canvasContent = fs.readFileSync(path.join(SRC_DIR, 'views', 'CanvasEditorView.tsx'), 'utf8');

  // Bug 2: Mobile inspector must include editable text, shape, image and transform controls
  assert.ok(
    canvasContent.includes('aria-label="Switch selected layer"'),
    'Inspector must provide a direct layer switcher dropdown for mobile users'
  );
  assert.ok(
    canvasContent.includes('aria-label="Layer width"') && canvasContent.includes('aria-label="Layer height"'),
    'Mobile inspector must have editable width and height inputs (not read-only spans)'
  );
  assert.ok(
    canvasContent.includes('aria-label="Rotation angle"'),
    'Mobile inspector must have rotation controls'
  );
  assert.ok(
    canvasContent.includes('Font Family') && canvasContent.includes('resolveCanvasFontFamily'),
    'Mobile inspector must allow changing font family'
  );

  // Bug 3: Tap fallback when no layer is selected must show list of layers
  assert.ok(
    canvasContent.includes('Select a layer to inspect &amp; edit:') ||
    canvasContent.includes('Select a layer to inspect & edit:'),
    'Mobile inspector must provide 1-tap layer selection buttons when no object is selected'
  );

  // Bug 4: Touch targets must be >= 36px and have descriptive aria-labels
  assert.ok(
    canvasContent.includes('aria-label={`Unlock layer ${obj.name}`}') ||
    canvasContent.includes('aria-label={obj.locked ? `Unlock layer ${obj.name}` : `Lock layer ${obj.name}`}'),
    'Layer lock button must have accessible label'
  );
  assert.ok(
    canvasContent.includes('aria-label={obj.visible ? `Hide layer ${obj.name}` : `Show layer ${obj.name}`}'),
    'Layer visibility button must have accessible label'
  );
  assert.ok(
    canvasContent.includes('min-w-[38px] min-h-[38px]'),
    'Layer action buttons must have comfortable touch targets >= 38px'
  );
});

test('Bug 6: Home Use Template Routes Canvas Templates to Canvas Studio', () => {
  const appContent = fs.readFileSync(path.join(SRC_DIR, 'App.tsx'), 'utf8');
  const homeContent = fs.readFileSync(path.join(SRC_DIR, 'views', 'HomeView.tsx'), 'utf8');

  assert.ok(
    appContent.includes("template.canvasDoc?.objects?.length ? '/canvas' : '/create'"),
    'App.tsx handleOpenEditorWithTemplate must route canvas templates to /canvas'
  );

  assert.ok(
    homeContent.includes("template.canvasDoc?.objects?.length ? '/canvas' : '/create'"),
    'HomeView.tsx handleUseTemplate must route canvas templates to /canvas'
  );
});

test('Bug 7 & 8: Canvas Template Picker Renders Real Design Thumbnails with Keyboard Accessibility', () => {
  const canvasContent = fs.readFileSync(path.join(SRC_DIR, 'views', 'CanvasEditorView.tsx'), 'utf8');

  // Bug 7: Real design previews with UnifiedCardThumbnail
  assert.ok(
    canvasContent.includes('<UnifiedCardThumbnail') && canvasContent.includes('template={tmpl}'),
    'Template picker modal must render real design preview thumbnail instead of generic text card'
  );

  // Bug 8: Keyboard navigation support
  assert.ok(
    canvasContent.includes('role="button"') &&
    canvasContent.includes('tabIndex={0}') &&
    canvasContent.includes('onKeyDown='),
    'Template picker cards must be keyboard accessible with role="button" and onKeyDown'
  );
});

test('Bug 9 & 10: Gallery Previews Right Edge Overflow & Proportion Masonry Layout', () => {
  const templatesContent = fs.readFileSync(path.join(SRC_DIR, 'views', 'TemplatesView.tsx'), 'utf8');

  // Bug 9: Card preview must not have w-full with m-3 causing overflow
  assert.ok(
    !templatesContent.includes('className="m-3 overflow-hidden rounded-sm border'),
    'LazyTemplateCard must not combine full width with m-3 margin to prevent horizontal overflow'
  );
  assert.ok(
    templatesContent.includes('<div className="p-3 pb-0">'),
    'LazyTemplateCard must be contained in a padded container to preserve exact bounds'
  );

  // Bug 10: Masonry columns to prevent empty vertical voids between landscape and portrait cards
  assert.ok(
    templatesContent.includes('columns-1 md:columns-2 xl:columns-3') &&
    templatesContent.includes('break-inside-avoid'),
    'Templates view must use column masonry layout to avoid huge empty voids on landscape templates'
  );
});
