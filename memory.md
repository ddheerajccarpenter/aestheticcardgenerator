# ACG — System Memory & Engineering Decisions (`memory.md`)

## 1. Hosting, Deployment & Git Mandate
- **Production Target**: Cloudflare Pages (`https://aestheticcardgenerator.pages.dev/`).
- **Deployment Command**: `npm run deploy` (which triggers `npm run pages:deploy` / `wrangler pages deploy dist --project-name aestheticcardgenerator`).
- **Rule**: Never deploy to Vercel. `vercel.json` and `.vercel/` are permanently removed.
- **Git Push Rule**: **NEVER run `git push`**. Never push code to GitHub or any remote repository. The user manages and pushes all commits to remote repositories manually.

## 2. Cloudflare Pages Trailing Slash Architecture
- Cloudflare Pages standardizes URLs with canonical trailing slashes (`/canvas/`, `/create/`, `/templates/`).
- **Invariant**: Any component, route comparator, or navigation check must normalize `window.location.pathname` before evaluation:
  ```tsx
  const currentPath = window.location.pathname || '/';
  const normalizedPath = currentPath === '/' ? '/' : currentPath.replace(/\/+$/, '') || '/';
  const isEditor = normalizedPath.startsWith('/create') || normalizedPath.startsWith('/canvas');
  ```
- Failure to normalize causes marketing headers and bottom navigation to be mistakenly mounted over fullscreen editor workspaces.

## 3. Navigation Hierarchy & Shell Architecture
- **Global Header**:
  - `Header.tsx` is full-width and sticky: `sticky top-0 z-50 w-full border-b border-[var(--app-border-subtle)] bg-[var(--app-bg)]/85 backdrop-blur-md`.
  - No floating island gaps (`fixed inset-x-3 top-3` is banned) so that content cannot poke out above the bar when scrolling.
  - On mobile viewports (`< 640px`), the redundant `Create +` button in the header is hidden (`hidden sm:inline-flex`), keeping the header uncluttered.
- **Mobile Bottom Navigation**:
  - `MobileBottomNav.tsx` is docked edge-to-edge: `fixed bottom-0 inset-x-0 z-40 border-t border-[var(--app-border-subtle)] bg-[var(--app-surface)]/95 backdrop-blur-md pb-[env(safe-area-inset-bottom,0px)] md:hidden`.
  - 4 destinations with consistent 20px icons and 48px touch targets: Gallery, Templates, Canvas, Create.
  - No jutting or oversized center blocks.
- **Footer Clearance**:
  - `Footer.tsx` has `pb-28 md:pb-8` to guarantee that all footer links, copyright text, and theme toggles are completely visible above the docked mobile navigation bar when scrolled to the end of the page.

## 4. CSS Token & Form Control Rules
- **Input Padding**: In `src/index.css`, form control padding must use logical properties:
  ```css
  .studio-input {
    padding-block: 0.5625rem;
    padding-inline: 0.875rem;
  }
  ```
  This ensures utility classes like `!pl-10` can override horizontal padding without being clobbered by 4-way shorthands.

## 5. Automated Integrity Testing
- `test/ui-ux-integrity.test.mjs` and `test/ambient-and-fonts.test.ts` verify:
  1. All 12 critical HTML entrypoints exist in `dist/` with responsive viewport meta tags.
  2. Dark and light theme initialization tokens (Projection Room `#191715`, Archival Paper `#f1ebdd`).
  3. Sitemap integrity with 36 indexed routes.
  4. Compiled CSS responsive breakpoints (`40rem`/640px, `48rem`/768px, `64rem`/1024px) and design system tokens.
  5. Source architectural rules: `!isEditor` gating, `sticky top-0` header, docked `bottom-0` bottom nav with safe-area support, and side-by-side card action buttons.
  6. Ambient color normalization, default presets, and 70-template metadata integrity.
  7. Custom font validation limits (15MB ceiling, supported extensions, magic byte headers).

## 6. Dual-Theme Color System (Emulsion & Paper)
- **Dark Mode (Projection Room)**:
  - `--app-bg`: `#191715` (warm near-black cinema foundation)
  - `--app-surface`: `#24211e`
  - `--app-surface-secondary`: `#312c27`
  - `--app-border-subtle`: `#48413a`
  - `--app-text-primary`: `#efe6d8`
  - `--app-text-secondary`: `#bfb1a1`
  - `--app-accent`: `#c69d78`
- **Light Mode (Archival Paper)**:
  - `--app-bg`: `#f1ebdd` (warm muted archival paper)
  - `--app-surface`: `#faf5eb`
  - `--app-surface-secondary`: `#e4d8c9`
  - `--app-border-subtle`: `#c9beaf`
  - `--app-text-primary`: `#292620`
  - `--app-text-secondary`: `#61584d`
  - `--app-accent`: `#6f4637`

## 7. Ambient Atmosphere System
- Implemented in `src/engines/ambientAtmosphere.ts` and `src/components/AmbientAtmosphereLayer.tsx`.
- Diffuse multi-stop radial wash rendered via fixed `pointer-events-none` layer behind content (`z-0`).
- Responsive to scrolling cards in `TemplatesView.tsx` via `IntersectionObserver` targeting viewport center proximity.
- Color normalization (`normalizeAmbientColor`) clamps lightness and saturation to prevent garish or oversaturated washes.
- **Editor Neutrality Rule**: Gated strictly by `!isEditor` in `App.tsx` so `/canvas`, `/create`, and `/editor` remain 100% color-accurate and distraction-free.
- Ambient toggle state persisted in `localStorage` (`acg_ambient_enabled`).

## 8. Client-Side Custom Font Subsystem
- Located in `src/services/customFontManager.ts`.
- Supports `.woff2`, `.woff`, `.ttf`, and `.otf` font uploads up to 15MB.
- Security-hardened: validates magic bytes (`wOF2`, `wOFF`, `\x00\x01\x00\x00`, `OTTO`).
- Persisted in browser IndexedDB database `AestheticCardStudioFontsDB` (store: `fonts`).
- Dynamically registers `@font-face` rules on document on boot and upload.
- Prior to canvas/HTML rasterization (`toPng`, `toJpeg`), export functions must await `document.fonts.ready` to ensure uploaded typography is cleanly embedded in downloaded assets.

## 9. Color Extraction & Eyedropper API Architecture
- `src/utils/colorExtractor.ts` provides offline canvas-based palette extraction (`extractPaletteFromImage`) using 64x64 offscreen canvas downsampling and Euclidean color distance grouping.
- Browser-native `EyeDropper` API (`window.EyeDropper`) is used when supported with non-blocking error handling fallback.
- Extracted swatches and eyedropper values integrate seamlessly into Card Creator palettes and Canvas Studio document background/layer fills.

## 10. Complete 70-Template Audit & Verification
- Total template inventory: 70 templates across `src/data/templates.ts` (22) and `src/data/extendedTemplates.ts` (48).
- Full audit manifest stored in `template_audit_manifest.md`.
- All templates verified for safe padding, unique IDs, non-empty titles, custom font support, and Retina export fidelity.

## 11. Application Security & Zero-Backend Trust Boundaries
- **Content Security Policy (`public/_headers`)**: Enforces strict CSP with `frame-ancestors 'none'`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and `object-src 'none'`.
- **Zero-Backend Architecture**: 100% of data remains within the client's browser. No remote database or credentials.
- **Prototype Pollution Defense (`src/services/schemaValidator.ts`)**: `isPrototypePolluted` detector and `safeJsonParse` reviver strip `__proto__` and `constructor` attacks.
- **Schema Boundaries**: `sanitizeAndValidateCanvasDocument` caps dimensions at 16,384px, objects at 500 layers, and restricts image URLs to safe protocols.
- **Image & SVG Sanitization (`src/services/imageSecurity.ts`)**: Enforces 10MB ceiling, validates binary magic bytes (PNG, JPEG, GIF, WebP, AVIF), and strips SVG script/event handler vectors via `sanitizeSvgMarkup`.
- **Storage Quota Resilience (`src/services/storageManager.ts`)**: `safeLocalStorageSet` intercepts `QuotaExceededError` and prunes stale cache keys automatically.
- **Memory-Safe Exports**: `dataUrlToBlob` performs direct Base64-to-Blob decoding bypassing WebKit/Safari `fetch(dataUrl)` length limits.

## 2026-11-20 — Studio collection and design colors
- Inventory is now 74: the existing 70 plus four native canvas designs in `src/data/studioTemplates.ts` (Form Study, After Hours, Side A, Studio Visitor).
- Gallery includes Posters and routes layered templates to Customize; the quick text editor cannot preserve multi-layer compositions.
- Canvas properties expose Design colors when no layer is selected. Choose a color and move focus outside to replace matching hex colors across text, shapes, strokes and canvas background. Existing history supports undo; photos are unchanged.
- Build, metadata/security tests, and new template/color tests passed. Lint reports existing warnings outside modified files. Browser/export checks were not run: this session cannot bind a localhost port (EPERM).

## 2026-11-20 — Template-only follow-up
- User constraint: no deployment, no push, and no website UI changes. Keep future visual work within template artwork unless explicitly authorized otherwise.
- Refined Form Study, After Hours, Side A, and Studio Visitor; added Night Shift (editable ticket) and Reading Room (journal cover). Inventory is 76.
- Reference direction: Poster House, The Swiss Grid (https://swissgrid.posterhouse.org/), and historic Swiss music exhibition posters. Compositions are original native text/shape layers; no reference artwork copied into assets.
- Verified Firefox gallery at localhost:4321 and opened Night Shift in Canvas (32 layers). Build and template tests pass. All views/components/CSS match their contents at the start of this follow-up. Mobile devices and exported files were not checked.
