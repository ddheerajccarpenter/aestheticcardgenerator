import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { PRESET_TEMPLATES } from '../src/data/templates';
import { PREMIUM_ART_ASSETS, PREMIUM_SIGNATURE_TEMPLATES } from '../src/data/premiumTemplates';
import { ASSET_POSTER_ART } from '../src/data/canvasAssets';
import { BLOG_POSTS } from '../src/data/blog';
import {
  createImageObject,
  createShapeObject,
  createTextObject,
  templateToCanvasDoc,
} from '../src/utils/canvasBuilder';
import { sanitizeAndValidateCanvasDocument } from '../src/services/schemaValidator';

const SRC_DIR = path.resolve(process.cwd(), 'src');

test('Catalogue IDs are unique (90 templates) and guide/blog references resolve', () => {
  const ids = PRESET_TEMPLATES.map((t) => t.id);
  const uniqueIds = new Set(ids);
  assert.equal(uniqueIds.size, PRESET_TEMPLATES.length);
  assert.equal(PRESET_TEMPLATES.length, 90);

  // Duplicate display name check preserves distinct IDs/categories
  const licensePair = PRESET_TEMPLATES.filter((t) => t.title === 'Permanent License of Travel');
  assert.equal(licensePair.length, 2);
  assert.notEqual(licensePair[0].id, licensePair[1].id);
  assert.notEqual(licensePair[0].category, licensePair[1].category);

  // Every templateId referenced in blog posts exists
  for (const post of BLOG_POSTS) {
    if (post.featuredTemplateId) {
      assert.ok(
        uniqueIds.has(post.featuredTemplateId),
        `Missing featuredTemplateId "${post.featuredTemplateId}" in blog ${post.slug}`
      );
    }
    for (const sec of post.sections) {
      if (sec.templateId) {
        assert.ok(
          uniqueIds.has(sec.templateId),
          `Missing section templateId "${sec.templateId}" in blog ${post.slug}`
        );
      }
    }
  }

  // GuideIndexView only links valid template IDs
  const guideIndex = fs.readFileSync(path.join(SRC_DIR, 'views', 'GuideIndexView.tsx'), 'utf8');
  const guideTemplateMatches = [...guideIndex.matchAll(/\?template=([a-z0-9-]+)/g)].map((m) => m[1]);
  assert.ok(guideTemplateMatches.length >= 3);
  for (const tmplId of guideTemplateMatches) {
    assert.ok(uniqueIds.has(tmplId), `Missing template link "${tmplId}" in GuideIndexView`);
  }
});

test('Tokyo Matcha Studio uses consistent 24h time and preserves Japanese + yen glyphs', () => {
  const matcha = PRESET_TEMPLATES.find((t) => t.id === 'poster-pinterest-matcha');
  assert.ok(matcha?.canvasDoc, 'poster-pinterest-matcha must have canvasDoc');
  const doc = templateToCanvasDoc(matcha);
  const texts = doc.objects
    .filter((o): o is Extract<typeof o, { type: 'text' }> => o.type === 'text')
    .map((o) => o.text);

  assert.ok(texts.some((t) => t.includes('14:28') && !t.includes('14:28 PM')));
  assert.ok(texts.some((t) => t.includes('抹茶工房')));
  assert.ok(texts.some((t) => t.includes('¥850')));
  assert.ok(texts.some((t) => t.includes('¥1,330')));
});

test('Baked SVG poster lettering was extracted into editable layers', () => {
  const posterArtKeys = [
    'kyoto1984',
    'bauhaus1923',
    'frenchCinema',
    'nordicBotanical',
    'vinylRecordSleeve',
    'frenchRivieraVilla',
    'tokyoBoardingPassLogo',
  ] as const;

  for (const key of posterArtKeys) {
    assert.ok(
      !ASSET_POSTER_ART[key].includes('<text'),
      `ASSET_POSTER_ART.${key} still embeds baked <text> markup`
    );
  }

  const posterIds = [
    'poster-kyoto-1984',
    'poster-bauhaus-1923',
    'poster-french-cinema',
    'poster-nordic-botanical',
    'poster-pinterest-vinyl',
    'poster-pinterest-french-riviera',
    'poster-pinterest-tokyo-boarding',
  ];

  for (const id of posterIds) {
    const tmpl = PRESET_TEMPLATES.find((t) => t.id === id);
    assert.ok(tmpl?.canvasDoc, `Expected canvasDoc on ${id}`);
    const editableTextCount = tmpl.canvasDoc.objects.filter((o) => o.type === 'text').length;
    assert.ok(editableTextCount >= 4, `${id} should expose editable text layers`);
  }
});

test('Repaired layout overlaps and Header Tag collisions are resolved', () => {
  // Generated ID cards header tag must not collide with Badge Box (x: width - 190)
  const idOrig = PRESET_TEMPLATES.find((t) => t.id === 'identity-2026');
  assert.ok(idOrig);
  const generatedDoc = templateToCanvasDoc(idOrig);
  const headerTag = generatedDoc.objects.find((o) => o.name === 'Header Tag');
  const badgeBox = generatedDoc.objects.find((o) => o.name === 'Badge Box');
  assert.ok(headerTag && badgeBox);
  assert.ok(
    headerTag.x + headerTag.width <= badgeBox.x,
    'Header Tag must clear Badge Box horizontally'
  );

  // Check repaired text pairs have zero vertical overlap
  const checkNonOverlap = (id: string, topName: string, bottomName: string) => {
    const tmpl = PRESET_TEMPLATES.find((t) => t.id === id);
    assert.ok(tmpl);
    const doc = templateToCanvasDoc(tmpl);
    const topObj = doc.objects.find((o) => o.name === topName);
    const bottomObj = doc.objects.find((o) => o.name === bottomName);
    assert.ok(topObj && bottomObj, `Missing ${topName}/${bottomName} on ${id}`);
    assert.ok(
      topObj.y + topObj.height <= bottomObj.y,
      `${id}: ${topName} (${topObj.y}+${topObj.height}) overlaps ${bottomName} (${bottomObj.y})`
    );
  };

  checkNonOverlap('studio-visitor', 'Pass number', 'Access code');
  checkNonOverlap('id-pixel-studio-pass', 'Big Title', 'Big Subtitle');
  checkNonOverlap('minimal-swiss-id', 'V1', 'V2');

  // Tokyo boarding pass header horizontal clearance
  const boarding = PRESET_TEMPLATES.find((t) => t.id === 'poster-pinterest-tokyo-boarding');
  assert.ok(boarding);
  const boardingDoc = templateToCanvasDoc(boarding);
  const airline = boardingDoc.objects.find((o) => o.name === 'Airline Name');
  const tktClass = boardingDoc.objects.find((o) => o.name === 'Ticket Class');
  assert.ok(airline && tktClass);
  assert.ok(airline.x + airline.width <= tktClass.x);
});

test('Builder and schema validator preserve crop, filter, shape metadata, and negative tracking', () => {
  const txt = createTextObject({ text: '', locked: true, letterSpacing: -6 });
  assert.equal(txt.text, '');
  assert.equal(txt.locked, true);
  assert.equal(txt.letterSpacing, -6);

  const img = createImageObject('data:image/png;base64,iVBORw0KGgo=', {
    clipMask: 'circle',
    filterPreset: 'dither',
    zoomScale: 1.75,
    panX: -25,
    panY: 30,
  });
  assert.equal(img.clipMask, 'circle');
  assert.equal(img.filterPreset, 'dither');
  assert.equal(img.zoomScale, 1.75);

  const shape = createShapeObject('rating-stars', {
    starRating: 4,
    stampText: 'VIP',
    payload: 'ACME-123',
    showTextLabel: false,
    locked: true,
  });
  assert.equal(shape.starRating, 4);
  assert.equal(shape.stampText, 'VIP');
  assert.equal(shape.payload, 'ACME-123');
  assert.equal(shape.showTextLabel, false);
  assert.equal(shape.locked, true);

  const sanitized = sanitizeAndValidateCanvasDocument({
    id: 'test_doc',
    title: 'Test',
    canvasWidth: 960,
    canvasHeight: 600,
    background: '#ffffff',
    objects: [txt, img, shape],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  assert.ok(sanitized);
  const sText = sanitized.objects.find((o) => o.type === 'text');
  const sImg = sanitized.objects.find((o) => o.type === 'image');
  assert.ok(sText && sText.type === 'text' && sText.letterSpacing === -6);
  assert.ok(sImg && sImg.type === 'image' && sImg.zoomScale === 1.75 && sImg.panX === -25 && sImg.panY === 30);
});

test('Editor & export code isolate UI theme colors and embed web fonts safely', () => {
  const canvasCode = fs.readFileSync(path.join(SRC_DIR, 'views', 'CanvasEditorView.tsx'), 'utf8');
  const creatorCode = fs.readFileSync(path.join(SRC_DIR, 'views', 'CreatorView.tsx'), 'utf8');

  assert.ok(!canvasCode.includes("'var(--app-accent-hover)'"));
  assert.ok(canvasCode.includes('editingTextId === obj.id && !exporting'));
  assert.ok(canvasCode.includes('buildSafeFontEmbedCSS'));
  assert.ok(!canvasCode.includes('skipFonts: true'));
  assert.ok(canvasCode.includes('toCanvas(node, options)') && canvasCode.includes("'image/webp'"));
  assert.ok(canvasCode.includes('[showGrid, getCanvasCoords, updateObject, commitDocumentChange]'));

  assert.ok(creatorCode.includes('getContrastInkForBg'));
  assert.ok(creatorCode.includes('buildSafeFontEmbedCSS'));
  assert.ok(!creatorCode.includes('skipFonts: true'));
});

test('/premium signature editions (14 cards) are 100% free, editable, and free of baked SVG text', () => {
  assert.equal(PREMIUM_SIGNATURE_TEMPLATES.length, 14);

  for (const [key, svg] of Object.entries(PREMIUM_ART_ASSETS)) {
    assert.ok(!svg.includes('%3Ctext'), `PREMIUM_ART_ASSETS.${key} must not contain baked <text> elements`);
  }

  for (const tmpl of PREMIUM_SIGNATURE_TEMPLATES) {
    assert.equal(tmpl.isSignature, true);
    assert.equal(tmpl.badge, 'FREE');
    assert.ok(PRESET_TEMPLATES.some((t) => t.id === tmpl.id), `${tmpl.id} must be in PRESET_TEMPLATES`);
    const doc = templateToCanvasDoc(tmpl);
    const editableTexts = doc.objects.filter((o) => o.type === 'text');
    assert.ok(editableTexts.length >= 1, `${tmpl.id} must provide editable text layers`);
  }

  const premiumView = fs.readFileSync(path.join(SRC_DIR, 'views', 'PremiumView.tsx'), 'utf8');
  assert.ok(!/\$\d+/.test(premiumView) && !premiumView.includes('Subscribe') && !premiumView.includes('Paywall') && !premiumView.includes('Upgrade to Pro'));
});

test('canvas text spans inherit layer fontFamily without global Comfortaa span override', () => {
  const indexCss = fs.readFileSync(path.join(SRC_DIR, 'index.css'), 'utf8');
  assert.ok(!/body,\s*p,\s*span\b/.test(indexCss), 'index.css must not target bare span with var(--font-body)');

  const editor = fs.readFileSync(path.join(SRC_DIR, 'views', 'CanvasEditorView.tsx'), 'utf8');
  assert.ok(editor.includes("fontFamily: 'inherit'"));

  const thumb = fs.readFileSync(path.join(SRC_DIR, 'components', 'UnifiedCardThumbnail.tsx'), 'utf8');
  assert.ok(thumb.includes("fontFamily: 'inherit'"));
});

test('responsive sitewide UI prevents tablet/mobile header overflow and closes hidden details popovers', () => {
  const header = fs.readFileSync(path.join(SRC_DIR, 'components', 'Header.tsx'), 'utf8');
  assert.ok(header.includes('overflow-x-clip'));
  assert.ok(header.includes('hidden h-4 w-4 lg:block'));

  const editor = fs.readFileSync(path.join(SRC_DIR, 'views', 'CanvasEditorView.tsx'), 'utf8');
  assert.ok(editor.includes('hidden lg:flex items-center gap-1'));
  assert.ok(editor.includes('absolute right-0 top-full mt-2 w-52 max-w-[calc(100vw-16px)]'));

  const indexCss = fs.readFileSync(path.join(SRC_DIR, 'index.css'), 'utf8');
  assert.ok(indexCss.includes('details:not([open]) > :not(summary)'));

  const templatesView = fs.readFileSync(path.join(SRC_DIR, 'views', 'TemplatesView.tsx'), 'utf8');
  assert.ok(templatesView.includes('flex-wrap items-center gap-2'));

  const blogView = fs.readFileSync(path.join(SRC_DIR, 'views', 'BlogView.tsx'), 'utf8');
  assert.ok(blogView.includes('flex-wrap items-center gap-2'));
});

test('phone UX menu drawer, 44px touch targets, and companion minimized pill geometry', () => {
  const header = fs.readFileSync(path.join(SRC_DIR, 'components', 'Header.tsx'), 'utf8');
  assert.ok(header.includes('mobile-nav-drawer'), 'Header must provide mobile navigation drawer');
  assert.ok(header.includes('min-h-[44px]'), 'Mobile nav links must meet 44px touch height');

  const creator = fs.readFileSync(path.join(SRC_DIR, 'views', 'CreatorView.tsx'), 'utf8');
  assert.ok(creator.includes('min-h-[44px] py-2'), 'CreatorView phone segment tabs must meet 44px touch height');

  const companion = fs.readFileSync(path.join(SRC_DIR, 'components', 'StudioCompanion.tsx'), 'utf8');
  assert.ok(companion.includes('h-11 w-11 items-center justify-center rounded-full'), 'StudioCompanion minimized button must stay compact 44x44 circle');
  assert.ok(!companion.includes('>{currentMeta.name}</span>'), 'Minimized toggle must not widen past circle hitbox with text label');
});

test('SEO, GEO, AEO, and AdSense readiness configuration & built SSR output', () => {
  const rootDir = process.cwd();
  const seoSrc = fs.readFileSync(path.join(SRC_DIR, 'utils', 'seo.ts'), 'utf8');
  assert.ok(seoSrc.includes('https://aestheticcardgenerator.pages.dev'));
  assert.ok(!seoSrc.includes('aestheticcardstudio.com'));

  const llmsTxt = fs.readFileSync(path.join(rootDir, 'public', 'llms.txt'), 'utf8');
  assert.ok(llmsTxt.includes('https://aestheticcardgenerator.pages.dev'));

  const adsTxt = fs.readFileSync(path.join(rootDir, 'public', 'ads.txt'), 'utf8');
  assert.ok(adsTxt.includes('f08c47fec0942fa0'));

  const headers = fs.readFileSync(path.join(rootDir, 'public', '_headers'), 'utf8');
  assert.ok(headers.includes('pagead2.googlesyndication.com'));
  assert.ok(headers.includes('/ads.txt'));

  const distIndex = path.join(rootDir, 'dist', 'index.html');
  const distFaq = path.join(rootDir, 'dist', 'faq', 'index.html');
  if (fs.existsSync(distIndex) && fs.existsSync(distFaq)) {
    const indexHtml = fs.readFileSync(distIndex, 'utf8');
    const faqHtml = fs.readFileSync(distFaq, 'utf8');
    assert.ok(indexHtml.includes('id="seo-jsonld"'), 'Home static HTML must embed JSON-LD schema');
    assert.ok(indexHtml.includes('"@type":"FAQPage"'), 'Home static HTML must include FAQPage schema for AEO');
    assert.ok(!indexHtml.includes('Opening the studio'), 'Home static fallback must provide semantic content instead of stub text');
    assert.ok(faqHtml.includes('"@type":"FAQPage"'), 'FAQ static HTML must embed FAQPage schema');
    const cardPage = path.join(rootDir, 'dist', 'card', 'poster-pinterest-matcha', 'index.html');
    assert.ok(fs.existsSync(cardPage), 'Every card must build its own /card/<id> page');
  }

  const homeView = fs.readFileSync(path.join(SRC_DIR, 'views', 'HomeView.tsx'), 'utf8');
  assert.ok(homeView.includes('href={`/card/${card.id}`}'), 'Home cards must link directly to dedicated /card/<id> pages');
  assert.ok(!homeView.includes('previewDialogRef'), 'Home cards must navigate to own pages instead of popup modal');

  const mobileNav = fs.readFileSync(path.join(SRC_DIR, 'components', 'MobileBottomNav.tsx'), 'utf8');
  assert.ok(!mobileNav.includes('preventDefault'), 'MobileBottomNav links must perform full browser loads for AdSense');
});
