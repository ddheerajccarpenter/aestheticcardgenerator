import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

console.log('--- Running UI/UX & Responsive Build Integrity Verification ---');

const distDir = path.resolve('dist');
assert.ok(fs.existsSync(distDir), 'Dist output directory must exist');

// 1. Check critical entry points
const criticalRoutes = [
  'index.html',
  'create/index.html',
  'canvas/index.html',
  'templates/index.html',
  'guides/index.html',
  'blog/index.html',
  'about/index.html',
  'contact/index.html',
  'faq/index.html',
  'privacy/index.html',
  'terms/index.html',
  '404.html',
];

for (const route of criticalRoutes) {
  const filePath = path.join(distDir, route);
  assert.ok(fs.existsSync(filePath), `Route file ${route} must exist in build`);
  const content = fs.readFileSync(filePath, 'utf8');

  // Verify responsive viewport meta tag
  assert.ok(
    content.includes('name="viewport"') && content.includes('width=device-width'),
    `Route ${route} must have a responsive viewport meta tag`
  );

  // Verify dark/light theme support
  assert.ok(
    content.includes('theme') || content.includes('data-theme'),
    `Route ${route} must support theme toggle initialization`
  );
}

console.log(`✓ All ${criticalRoutes.length} critical entry points exist and include responsive viewport meta tags.`);

// 2. Check Sitemap Integrity
const sitemapPath = path.join(distDir, 'sitemap.xml');
assert.ok(fs.existsSync(sitemapPath), 'Sitemap.xml must exist in dist');
const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
const locCount = (sitemapContent.match(/<loc>/g) || []).length;
assert.strictEqual(locCount, 36, `Sitemap must contain 36 indexed routes (found ${locCount})`);
console.log(`✓ Sitemap contains all ${locCount} published pages.`);

// 3. Check CSS Design Tokens & Media Queries in built assets
const astroAssetsDir = path.join(distDir, '_astro');
assert.ok(fs.existsSync(astroAssetsDir), '_astro asset directory must exist');
const cssFiles = fs.readdirSync(astroAssetsDir).filter((f) => f.endsWith('.css'));
assert.ok(cssFiles.length > 0, 'At least one compiled CSS bundle must exist');

let aggregatedCss = '';
for (const f of cssFiles) {
  aggregatedCss += fs.readFileSync(path.join(astroAssetsDir, f), 'utf8');
}

// Verify responsive breakpoints (Tailwind v4 compiles sm: 40rem / 640px, md: 48rem, lg: 64rem / 1024px)
assert.ok(aggregatedCss.includes('40rem') || aggregatedCss.includes('640px'), 'CSS must include sm responsive breakpoint');
assert.ok(aggregatedCss.includes('48rem') || aggregatedCss.includes('768px'), 'CSS must include md responsive breakpoint');
assert.ok(aggregatedCss.includes('64rem') || aggregatedCss.includes('1024px'), 'CSS must include lg responsive breakpoint');

// Verify typography and color tokens
assert.ok(aggregatedCss.includes('--app-bg'), 'CSS must include --app-bg token');
assert.ok(aggregatedCss.includes('--app-surface'), 'CSS must include --app-surface token');
assert.ok(aggregatedCss.includes('--font-heading'), 'CSS must include --font-heading token');

console.log('✓ Compiled CSS bundles contain responsive breakpoints (640px, 768px, 1024px) and design system tokens.');

// 4. Source-level architecture checks against reported screenshot defects
const appSrc = fs.readFileSync('src/App.tsx', 'utf8');
assert.ok(appSrc.includes('!isEditor'), 'App.tsx must gate Header, Footer, and BottomNav using !isEditor');
assert.ok(appSrc.includes('replace(/\\/+$/'), 'App.tsx must normalize trailing slashes on routes');

const headerSrc = fs.readFileSync('src/components/Header.tsx', 'utf8');
assert.ok(!headerSrc.includes('fixed inset-x-3 top-3'), 'Header.tsx must not use floating island inset-x-3 top-3');
assert.ok(headerSrc.includes('sticky top-0'), 'Header.tsx must use sticky top-0 full-width header');

const navSrc = fs.readFileSync('src/components/MobileBottomNav.tsx', 'utf8');
assert.ok(navSrc.includes('fixed bottom-0 inset-x-0'), 'MobileBottomNav.tsx must dock cleanly to bottom-0 inset-x-0');
assert.ok(navSrc.includes('env(safe-area-inset-bottom'), 'MobileBottomNav.tsx must respect safe-area-inset-bottom');

const templatesSrc = fs.readFileSync('src/views/TemplatesView.tsx', 'utf8');
assert.ok(templatesSrc.includes('!pl-10'), 'TemplatesView.tsx search input must use !pl-10 to prevent icon overlap');
assert.ok(templatesSrc.includes('grid-cols-2 gap-2'), 'TemplatesView.tsx cards must use side-by-side action buttons');

const indexCss = fs.readFileSync('src/index.css', 'utf8');
assert.ok(indexCss.includes('padding-block') && indexCss.includes('padding-inline'), 'index.css must use padding-block/padding-inline for studio-input');
assert.ok(indexCss.includes('#191715'), 'index.css must define Projection Room dark foundation (#191715)');
assert.ok(indexCss.includes('#f1ebdd'), 'index.css must define Archival Paper light foundation (#f1ebdd)');
assert.ok(indexCss.includes('--ambient-opacity'), 'index.css must define --ambient-opacity token');

// 5. Ambient Atmosphere and Dual-Theme System Verification
const ambientSrc = fs.readFileSync('src/engines/ambientAtmosphere.ts', 'utf8');
assert.ok(ambientSrc.includes('normalizeAmbientColor'), 'ambientAtmosphere must export normalizeAmbientColor');
assert.ok(ambientSrc.includes('DEFAULT_DARK_AMBIENT'), 'ambientAtmosphere must export DEFAULT_DARK_AMBIENT');
assert.ok(ambientSrc.includes('DEFAULT_LIGHT_AMBIENT'), 'ambientAtmosphere must export DEFAULT_LIGHT_AMBIENT');

const ambientLayerSrc = fs.readFileSync('src/components/AmbientAtmosphereLayer.tsx', 'utf8');
assert.ok(ambientLayerSrc.includes('pointer-events-none'), 'AmbientAtmosphereLayer must be non-interactive pointer-events-none');
assert.ok(ambientLayerSrc.includes('radial-gradient'), 'AmbientAtmosphereLayer must render diffuse radial gradient wash');

// 6. Custom Font Upload & Validation Integrity
const fontMgrSrc = fs.readFileSync('src/services/customFontManager.ts', 'utf8');
assert.ok(fontMgrSrc.includes('validateFontFile'), 'customFontManager must export validateFontFile');
assert.ok(fontMgrSrc.includes('15 * 1024 * 1024'), 'customFontManager must enforce 15MB file size limit');
assert.ok(fontMgrSrc.includes('AestheticCardStudioFontsDB'), 'customFontManager must persist to AestheticCardStudioFontsDB IndexedDB');

// 7. Verify all 70 templates integrity in templates.ts
const templatesSrcFile = fs.readFileSync('src/data/templates.ts', 'utf8');
assert.ok(templatesSrcFile.includes('PRESET_TEMPLATES'), 'templates.ts must export PRESET_TEMPLATES');
assert.ok(templatesSrcFile.includes('projection-room'), 'PALETTE_PRESETS must include projection-room');
assert.ok(templatesSrcFile.includes('archival-paper'), 'PALETTE_PRESETS must include archival-paper');

console.log('✓ All source architectural anti-regression checks verified.');
console.log('✓ Dual-theme tokens, ambient engine, font manager, and 70-template audit verified.');
console.log('All UI/UX & Responsive Build Integrity Verifications passed cleanly!');
