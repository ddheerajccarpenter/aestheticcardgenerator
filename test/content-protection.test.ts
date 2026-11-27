import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {
  installContentProtection,
  isEditableTarget,
  shouldBlockInspectOrCopyKey,
} from '../src/utils/contentProtection';

const SRC_DIR = path.resolve(process.cwd(), 'src');

test('isEditableTarget permits enabled inputs/textareas/contenteditable and blocks plain DOM nodes', () => {
  assert.equal(isEditableTarget(null), false);
  assert.equal(isEditableTarget({ tagName: 'DIV', isContentEditable: false } as unknown as EventTarget), false);
  assert.equal(isEditableTarget({ tagName: 'P', isContentEditable: false } as unknown as EventTarget), false);
  assert.equal(
    isEditableTarget({ tagName: 'INPUT', readOnly: false, disabled: false } as unknown as EventTarget),
    true
  );
  assert.equal(
    isEditableTarget({ tagName: 'TEXTAREA', readOnly: false, disabled: false } as unknown as EventTarget),
    true
  );
  assert.equal(
    isEditableTarget({ tagName: 'INPUT', readOnly: true, disabled: false } as unknown as EventTarget),
    false
  );
  assert.equal(
    isEditableTarget({ tagName: 'SPAN', isContentEditable: true } as unknown as EventTarget),
    true
  );
});

test('shouldBlockInspectOrCopyKey blocks DevTools, View-Source, Save, Print, and non-editable Copy/Select', () => {
  const nonEditable = { tagName: 'DIV', isContentEditable: false } as unknown as EventTarget;
  const editable = { tagName: 'TEXTAREA', readOnly: false, disabled: false } as unknown as EventTarget;

  // DevTools shortcuts
  assert.equal(shouldBlockInspectOrCopyKey({ key: 'F12' }), true);
  assert.equal(shouldBlockInspectOrCopyKey({ keyCode: 123 }), true);
  assert.equal(shouldBlockInspectOrCopyKey({ key: 'I', ctrlKey: true, shiftKey: true }), true);
  assert.equal(shouldBlockInspectOrCopyKey({ key: 'J', ctrlKey: true, shiftKey: true }), true);
  assert.equal(shouldBlockInspectOrCopyKey({ key: 'C', ctrlKey: true, shiftKey: true }), true);
  assert.equal(shouldBlockInspectOrCopyKey({ key: 'i', metaKey: true, altKey: true }), true);
  assert.equal(shouldBlockInspectOrCopyKey({ key: 'c', metaKey: true, altKey: true }), true);

  // View source / Save / Print
  assert.equal(shouldBlockInspectOrCopyKey({ key: 'u', ctrlKey: true }), true);
  assert.equal(shouldBlockInspectOrCopyKey({ key: 'u', metaKey: true }), true);
  assert.equal(shouldBlockInspectOrCopyKey({ key: 's', metaKey: true }), true);
  assert.equal(shouldBlockInspectOrCopyKey({ key: 'p', ctrlKey: true }), true);

  // Copy / Cut / Select-All blocked outside editable fields
  assert.equal(shouldBlockInspectOrCopyKey({ key: 'c', metaKey: true, target: nonEditable }), true);
  assert.equal(shouldBlockInspectOrCopyKey({ key: 'x', ctrlKey: true, target: nonEditable }), true);
  assert.equal(shouldBlockInspectOrCopyKey({ key: 'a', metaKey: true, target: nonEditable }), true);

  // Copy / Cut / Select-All allowed inside editable fields
  assert.equal(shouldBlockInspectOrCopyKey({ key: 'c', metaKey: true, target: editable }), false);
  assert.equal(shouldBlockInspectOrCopyKey({ key: 'x', ctrlKey: true, target: editable }), false);
  assert.equal(shouldBlockInspectOrCopyKey({ key: 'a', metaKey: true, target: editable }), false);

  // App shortcuts & accessibility keys preserved
  assert.equal(shouldBlockInspectOrCopyKey({ key: 'k', metaKey: true, target: nonEditable }), false);
  assert.equal(shouldBlockInspectOrCopyKey({ key: 'z', metaKey: true, target: nonEditable }), false);
  assert.equal(shouldBlockInspectOrCopyKey({ key: 'Tab', target: nonEditable }), false);
  assert.equal(shouldBlockInspectOrCopyKey({ key: 'Escape', target: nonEditable }), false);
});

test('installContentProtection intercepts contextmenu, selectstart, copy, cut, dragstart, and keydown cleanly', () => {
  const docHandlers = new Map<string, EventListener>();
  const winHandlers = new Map<string, EventListener>();

  (globalThis as any).document = {
    addEventListener: (type: string, fn: EventListener) => docHandlers.set(type, fn),
    removeEventListener: (type: string) => docHandlers.delete(type),
  };
  (globalThis as any).window = {
    addEventListener: (type: string, fn: EventListener) => winHandlers.set(type, fn),
    removeEventListener: (type: string) => winHandlers.delete(type),
  };

  const cleanup = installContentProtection();
  assert.ok(docHandlers.has('contextmenu'));
  assert.ok(docHandlers.has('selectstart'));
  assert.ok(docHandlers.has('copy'));
  assert.ok(docHandlers.has('cut'));
  assert.ok(docHandlers.has('dragstart'));
  assert.ok(winHandlers.has('keydown'));

  // contextmenu always prevented
  let prevented = false;
  docHandlers.get('contextmenu')!({
    preventDefault: () => { prevented = true; },
  } as unknown as Event);
  assert.equal(prevented, true);

  // copy prevented on plain text and clears clipboardData, allowed on editable input
  let copyPrevented = false;
  let clearedText: string | null = null;
  docHandlers.get('copy')!({
    target: { tagName: 'DIV', isContentEditable: false },
    preventDefault: () => { copyPrevented = true; },
    clipboardData: { setData: (_t: string, v: string) => { clearedText = v; } },
  } as unknown as Event);
  assert.equal(copyPrevented, true);
  assert.equal(clearedText, '');

  let editableCopyPrevented = false;
  docHandlers.get('copy')!({
    target: { tagName: 'INPUT', readOnly: false, disabled: false },
    preventDefault: () => { editableCopyPrevented = true; },
  } as unknown as Event);
  assert.equal(editableCopyPrevented, false);

  cleanup();
  assert.equal(docHandlers.size, 0);
  assert.equal(winHandlers.size, 0);

  delete (globalThis as any).document;
  delete (globalThis as any).window;
});

test('CSS, Astro config, App shell, and public views enforce anti-inspect and anti-copy rules', () => {
  const css = fs.readFileSync(path.join(SRC_DIR, 'index.css'), 'utf8');
  assert.ok(css.includes('user-select: none'), 'index.css must disable text selection by default');
  assert.ok(css.includes('user-select: text'), 'index.css must re-enable selection inside editable inputs');
  assert.ok(css.includes('-webkit-user-drag: none'), 'index.css must prevent dragging images/links');
  assert.ok(css.includes('@media print'), 'index.css must guard against print extraction');

  const appSrc = fs.readFileSync(path.join(SRC_DIR, 'App.tsx'), 'utf8');
  assert.ok(appSrc.includes('installContentProtection'), 'App.tsx must install content protection');

  const layoutSrc = fs.readFileSync(path.join(SRC_DIR, 'layouts', 'SiteLayout.astro'), 'utf8');
  assert.ok(layoutSrc.includes('contextmenu'), 'SiteLayout.astro must block contextmenu before hydration');

  const astroCfg = fs.readFileSync(path.resolve(process.cwd(), 'astro.config.mjs'), 'utf8');
  assert.ok(astroCfg.includes('sourcemap: false'), 'astro.config.mjs must disable sourcemaps');

  const homeSrc = fs.readFileSync(path.join(SRC_DIR, 'views', 'HomeView.tsx'), 'utf8');
  assert.ok(!homeSrc.includes('clipboard.writeText'), 'HomeView must not expose public quote copying');

  const detailSrc = fs.readFileSync(path.join(SRC_DIR, 'views', 'CardDetailView.tsx'), 'utf8');
  assert.ok(!detailSrc.includes('clipboard.writeText'), 'CardDetailView must not expose public quote copying');
});
