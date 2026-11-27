import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { getStageInnerWidth } from '../src/utils/templateAspectRatio';
import {
  getMotionPaused,
  handleTiltPointerLeave,
  handleTiltPointerMove,
  isReducedMotion,
  onStageReady,
  setMotionPaused,
} from '../src/utils/motion';

const SRC_DIR = path.resolve(process.cwd(), 'src');

test('Motion utility safely defaults in SSR and respects pause toggle in DOM mock', () => {
  assert.equal(isReducedMotion(), true, 'SSR without window should treat motion as reduced');
  assert.equal(getMotionPaused(), false, 'SSR without window should default paused to false');

  const store = new Map<string, string>();
  const dataset: Record<string, string> = {};
  const dispatched: Array<{ type: string; detail: unknown }> = [];

  (globalThis as any).window = {
    matchMedia: () => ({ matches: false }),
    localStorage: {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => {
        store.set(k, v);
      },
    },
    dispatchEvent: (ev: { type: string; detail: unknown }) => {
      dispatched.push({ type: ev.type, detail: ev.detail });
      return true;
    },
  };
  (globalThis as any).document = {
    documentElement: { dataset },
  };
  (globalThis as any).CustomEvent = class {
    type: string;
    detail: unknown;
    constructor(type: string, init?: { detail?: unknown }) {
      this.type = type;
      this.detail = init?.detail;
    }
  };

  assert.equal(isReducedMotion(), false);
  setMotionPaused(true);
  assert.equal(getMotionPaused(), true);
  assert.equal(isReducedMotion(), true);
  assert.equal(dataset.motionPaused, 'true');
  assert.equal(dispatched.at(-1)?.type, 'acg:motion-toggled');

  // Test pointer tilt bounds clamping
  const props = new Map<string, string>();
  const mockTarget = {
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 200, height: 200 }),
    style: {
      setProperty: (k: string, v: string) => props.set(k, v),
    },
  } as unknown as HTMLElement;

  // Should be a no-op while motion is paused
  handleTiltPointerMove({
    pointerType: 'mouse',
    clientX: 200,
    clientY: 0,
    currentTarget: mockTarget,
  } as unknown as React.PointerEvent<HTMLElement>);
  assert.equal(props.size, 0, 'Tilt must not run when motion is paused');

  setMotionPaused(false);
  assert.equal(isReducedMotion(), false);

  handleTiltPointerMove({
    pointerType: 'mouse',
    clientX: 200,
    clientY: 0,
    currentTarget: mockTarget,
  } as unknown as React.PointerEvent<HTMLElement>);
  assert.equal(props.get('--tilt-x'), '4.00deg');
  assert.equal(props.get('--tilt-y'), '4.00deg');
  assert.equal(props.get('--glint-x'), '100.0%');
  assert.equal(props.get('--glint-y'), '0.0%');

  handleTiltPointerLeave({
    currentTarget: mockTarget,
  } as unknown as React.PointerEvent<HTMLElement>);
  assert.equal(props.get('--tilt-x'), '0deg');
  assert.equal(props.get('--tilt-y'), '0deg');

  delete (globalThis as any).window;
  delete (globalThis as any).document;
  delete (globalThis as any).CustomEvent;
});

test('onStageReady waits for acg:loader-cleared when skeleton is active', () => {
  const listeners = new Map<string, Array<() => void>>();
  let calls = 0;
  const mockEl = { style: { opacity: '1', transform: '' } } as unknown as HTMLElement;

  (globalThis as any).window = {
    matchMedia: () => ({ matches: false }),
    localStorage: { getItem: () => null },
    addEventListener: (ev: string, fn: () => void) => {
      listeners.set(ev, [...(listeners.get(ev) || []), fn]);
    },
    removeEventListener: (ev: string, fn: () => void) => {
      listeners.set(ev, (listeners.get(ev) || []).filter((f) => f !== fn));
    },
  };
  (globalThis as any).document = {
    documentElement: { dataset: {} },
    querySelector: (sel: string) => (sel === '[data-acg-skeleton]' ? {} : null),
  };

  onStageReady(() => { calls++; }, () => [mockEl]);
  assert.equal(calls, 0, 'Must wait until skeleton clears');
  assert.equal(mockEl.style.opacity, '0', 'Must pre-hide targets cleanly behind curtain');

  for (const fn of listeners.get('acg:loader-cleared') || []) fn();
  assert.equal(calls, 1, 'Must run choreography once acg:loader-cleared dispatches');

  delete (globalThis as any).window;
  delete (globalThis as any).document;
});

test('Minimal text & purposeful Anime.js motion architecture across views', () => {
  const homeSrc = fs.readFileSync(path.join(SRC_DIR, 'views', 'HomeView.tsx'), 'utf8');
  assert.ok(!homeSrc.includes('How the studio works'), 'HomeView must omit generic 3-step explainer text');
  assert.ok(!homeSrc.includes('home-faq-heading'), 'HomeView must omit visible FAQ text wall while keeping JSON-LD');
  assert.ok(homeSrc.includes('HOME_AEO_FAQ'), 'HomeView must retain HOME_AEO_FAQ in JSON-LD');
  assert.ok(homeSrc.includes('revealPressWords') && homeSrc.includes('observeScrollReveal'), 'HomeView must use shared Anime.js motion helpers');
  assert.ok(homeSrc.includes('drawSvgPaths'), 'HomeView must draw registration crop marks');

  const headerSrc = fs.readFileSync(path.join(SRC_DIR, 'components', 'Header.tsx'), 'utf8');
  assert.ok(headerSrc.includes('header-scroll-bar'), 'Header must render scroll progress hairline');
  assert.ok(headerSrc.includes('setMotionPaused'), 'Header must provide motion pause toggle for R-39 accessibility');

  const cssSrc = fs.readFileSync(path.join(SRC_DIR, 'index.css'), 'utf8');
  assert.ok(cssSrc.includes('data-motion-paused="true"'), 'index.css must stop motion when user pauses animations');
  assert.ok(cssSrc.includes('.card-tilt-surface'), 'index.css must define 3D paper tilt styles');
  assert.ok(cssSrc.includes('.btn-sheen:hover::after'), 'btn-sheen must activate on intent instead of continuous idle flash');

  const bingoSrc = fs.readFileSync(path.join(SRC_DIR, 'views', 'BingoView.tsx'), 'utf8');
  assert.ok(bingoSrc.includes('animateGridWave'), 'BingoView must deal 5x5 squares via center-outward grid wave');

  const cmpModalSrc = fs.readFileSync(path.join(SRC_DIR, 'components', 'TemplateComparisonModal.tsx'), 'utf8');
  assert.ok(cmpModalSrc.includes("e.key === 'Escape'"), 'TemplateComparisonModal must dismiss on Escape');
});

test('Uniform card stage framing normalizes mixed aspect ratios across Home, Signature & Related grids', () => {
  assert.equal(getStageInnerWidth(1.6, 1), '100%');
  assert.equal(getStageInnerWidth(1, 1), '100%');
  assert.equal(getStageInnerWidth(0.8, 1), '80.0000%');
  assert.equal(getStageInnerWidth(2 / 3, 1), '66.6667%');
  assert.equal(getStageInnerWidth(0, 1), '100%');
  assert.equal(getStageInnerWidth(-1, 1), '100%');

  const homeSrc = fs.readFileSync(path.join(SRC_DIR, 'views', 'HomeView.tsx'), 'utf8');
  assert.ok(homeSrc.includes('items-stretch') && homeSrc.includes('stageRatio={1}'), 'HomeView gallery must use uniform specimen stage');
  assert.ok(homeSrc.includes('getStageInnerWidth('), 'HomeView hero deck must balance card sizing across aspect ratios');

  const premiumSrc = fs.readFileSync(path.join(SRC_DIR, 'views', 'PremiumView.tsx'), 'utf8');
  assert.ok(premiumSrc.includes('stageRatio={1}'), 'PremiumView grid must use uniform specimen stage');

  const detailSrc = fs.readFileSync(path.join(SRC_DIR, 'views', 'CardDetailView.tsx'), 'utf8');
  assert.ok(detailSrc.includes('stageRatio={1}'), 'CardDetailView related cards grid must use uniform specimen stage');
});

test('GPU optimization: no heavy SVG blur/turbulence filters, idle infinite background paints, or minimized pointer tracking', () => {
  const premiumAssets = fs.readFileSync(path.join(SRC_DIR, 'data', 'premiumTemplates.ts'), 'utf8');
  assert.ok(!premiumAssets.includes('feGaussianBlur'), 'premiumTemplates must not run runtime SVG Gaussian blur passes');
  assert.ok(!premiumAssets.includes('feTurbulence'), 'premiumTemplates must not run runtime SVG fractal noise shaders');

  const cssSrc = fs.readFileSync(path.join(SRC_DIR, 'index.css'), 'utf8');
  assert.ok(!cssSrc.includes('animation: holoSheen'), 'holographic-foil must not run idle infinite background-position repaints');
  assert.ok(cssSrc.includes('.gpu-gallery-item') && cssSrc.includes('content-visibility: auto'), 'index.css must skip offscreen gallery card rasterization');
  assert.ok(!/\.card-tilt-surface\s*\{[^}]*will-change:\s*transform/.test(cssSrc), 'card-tilt-surface must not pre-allocate GPU layers when idle');

  const companionSrc = fs.readFileSync(path.join(SRC_DIR, 'components', 'StudioCompanion.tsx'), 'utf8');
  assert.ok(companionSrc.includes('if (isMinimized || motionPaused'), 'StudioCompanion must skip pointer listeners when minimized or paused');

  const threeStage = fs.readFileSync(path.join(SRC_DIR, 'engines', 'threeCardStage.ts'), 'utf8');
  assert.ok(threeStage.includes('Math.min(window.devicePixelRatio || 1, 1.5)'), 'WebGL 3D stage must cap DPR at 1.5');
});

test('Unslop craft discipline: single ease curve, restrained weights, no emoji UI chrome or hero bloat', () => {
  const motionSrc = fs.readFileSync(path.join(SRC_DIR, 'utils', 'motion.ts'), 'utf8');
  assert.ok(motionSrc.includes('cubicBezier(0.22, 1, 0.36, 1)'), 'motion.ts must use unslop ease-out curve');
  assert.ok(!motionSrc.includes('spring('), 'motion.ts must avoid bouncy overshoot springs');

  const homeSrc = fs.readFileSync(path.join(SRC_DIR, 'views', 'HomeView.tsx'), 'utf8');
  assert.equal((homeSrc.match(/data-hero-cta\b[^>]*className=/g) || []).length, 2, 'HomeView hero must have only primary and secondary CTA');
  assert.ok(!homeSrc.includes('--scroll-p') && !homeSrc.includes('--hero-px'), 'HomeView hero must not attach parallax on scroll or pointer');
  assert.ok(!homeSrc.includes('placeholder="Search..."'), 'HomeView search must use concise "Search" placeholder');

  const companionSrc = fs.readFileSync(path.join(SRC_DIR, 'components', 'StudioCompanion.tsx'), 'utf8');
  assert.ok(!/[\u{1F300}-\u{1FAFF}]/u.test(companionSrc), 'StudioCompanion must use line icons/text instead of emojis');

  for (const rel of ['HomeView.tsx', 'PremiumView.tsx', 'CategoryView.tsx', 'BlogView.tsx', 'GuideIndexView.tsx', 'GuideDetailView.tsx', 'BingoView.tsx', 'TrustViews.tsx']) {
    const viewSrc = fs.readFileSync(path.join(SRC_DIR, 'views', rel), 'utf8');
    assert.ok(!viewSrc.includes('font-extrabold') && !viewSrc.includes('font-black'), `${rel} must avoid weight 800-900 headings`);
  }
});

test('taste-skill discipline: accessibility landmarks, no blocking CDN fonts, settled scroll cards, clean copy', () => {
  const headerSrc = fs.readFileSync(path.join(SRC_DIR, 'components', 'Header.tsx'), 'utf8');
  assert.ok(headerSrc.includes('href="#main-content"') && headerSrc.includes('className="skip-link"'), 'Header must expose a skip-to-content link');

  const appSrc = fs.readFileSync(path.join(SRC_DIR, 'App.tsx'), 'utf8');
  assert.ok(appSrc.includes('id="main-content"'), 'App main region must expose #main-content target');

  const layoutSrc = fs.readFileSync(path.join(SRC_DIR, 'layouts', 'SiteLayout.astro'), 'utf8');
  assert.ok(!layoutSrc.includes('samsungone'), 'SiteLayout must not load unused blocking SamsungOne CSS');

  const motionSrc = fs.readFileSync(path.join(SRC_DIR, 'utils', 'motion.ts'), 'utf8');
  const scrollRevealSlice = motionSrc.slice(
    motionSrc.indexOf('export function observeScrollReveal'),
    motionSrc.indexOf('export function animateSpringPop')
  );
  assert.ok(scrollRevealSlice.length > 0 && !scrollRevealSlice.includes("opacity = '0'") && !scrollRevealSlice.includes('IntersectionObserver'), 'observeScrollReveal must keep cards readable without scroll hiding');

  for (const rel of ['index.astro', '[...path].astro', path.join('card', '[slug].astro'), '404.astro']) {
    const pageSrc = fs.readFileSync(path.join(SRC_DIR, 'pages', rel), 'utf8');
    assert.ok(!pageSrc.includes('font-extrabold') && !pageSrc.includes('uppercase tracking-'), `${rel} must avoid heavy/tracked fallback eyebrows`);
  }

  const bannedCopy = /\b(curated|timeless|elevate|leverage|harnessing)\b/i;
  for (const rel of [
    path.join('data', 'categories.ts'),
    path.join('data', 'guides.ts'),
    path.join('data', 'blog.ts'),
    path.join('utils', 'ssrSeo.ts'),
    path.join('views', 'TrustViews.tsx'),
  ]) {
    const copySrc = fs.readFileSync(path.join(SRC_DIR, rel), 'utf8');
    assert.ok(!copySrc.includes('—'), `${rel} must avoid em dashes`);
    assert.ok(!bannedCopy.test(copySrc), `${rel} must avoid banned AI-slop vocabulary`);
  }

  const homeSrc = fs.readFileSync(path.join(SRC_DIR, 'views', 'HomeView.tsx'), 'utf8');
  assert.ok(homeSrc.includes("['Card', 'and', 'poster']") && homeSrc.includes('studio'), 'HomeView hero H1 must open with category-first naming');
  assert.ok(homeSrc.includes('Browse templates'), 'HomeView hero must use verb+object Browse templates CTA');
});
