# Changelog

All notable changes to the Aesthetic Card Generator (ACG) project are documented in this file.

## [2.2.0] - 2026-11-20

### Added
- **Cinematic Dual-Theme Color System (Emulsion & Paper)**:
  - Dark Mode: **Projection Room** (`#191715` background, `#24211e` surface, `#312c27` raised surface, `#48413a` border, `#efe6d8` primary ink, `#bfb1a1` secondary ink, `#c69d78` warm copper accent).
  - Light Mode: **Archival Paper** (`#f1ebdd` background, `#faf5eb` surface, `#e4d8c9` raised surface, `#c9beaf` border, `#292620` primary ink, `#61584d` secondary ink, `#6f4637` rich umber accent).
  - High-contrast, WCAG AAA compliant surface-to-text ratios.
- **Scroll-Reactive Ambient Atmosphere Engine**:
  - Diffuse multi-stop radial gradient background wash (`AmbientAtmosphereLayer.tsx`) reflecting dominant tones of visible templates.
  - Perceptually clamped normalization (`normalizeAmbientColor`) with hue preservation and saturation limits (max 38% dark, max 22% light).
  - Viewport-proximity `IntersectionObserver` in `TemplatesView.tsx` with 120ms hysteresis debounce.
  - User ambient atmosphere on/off toggle persisted in `localStorage`.
  - Neutral isolation: editor workspaces (`/create`, `/canvas`, `/editor`) strictly bypass ambient lighting to ensure color-accurate designing.
- **Client-Side Custom Font Subsystem**:
  - Full client-side font upload (`.woff2`, `.woff`, `.ttf`, `.otf`) in both Card Creator (`/create`) and Canvas Studio (`/canvas`).
  - Strict security validation: format checks, 15MB file size limit, and header magic bytes verification (`wOF2`, `wOFF`, `\x00\x01\x00\x00`, `OTTO`).
  - Persistent font storage in IndexedDB (`AestheticCardStudioFontsDB`).
  - Dynamic `@font-face` registration and live typography preview.
  - Export font synchronization awaiting `document.fonts.ready` prior to HTML/SVG/Canvas rasterization.
- **Curated Text Presets**:
  - One-click presets in Card Creator: Editorial (Serif, left, 26px), Minimal (Sans, left, 20px), Technical (Mono, left, 18px), Poetic (Serif, center, 24px).
- **Template Collection Audit & Ambient Metadata**:
  - Audited all 70 templates across `templates.ts` and `extendedTemplates.ts` with 100% unique IDs, valid themes, and non-empty titles.
  - Added explicit ambient signatures for iconic templates (Midnights Vinyl, Tokyo Matcha, St. Germain, Oxford Navy, Warm Linen, Marcus Aurelius).
- **Test Suite Expansion**:
  - Added `test/ambient-and-fonts.test.ts` asserting ambient color normalization, default palettes, all 70 templates integrity, and custom font validation rules.

## [2.1.0] - 2026-11-20

### Fixed
- **P0 Editor Header Collision**: Fixed issue where the global marketing header and bottom navigation overlapped `/canvas` and `/create` editor controls due to Cloudflare Pages canonical trailing slash routing (`/canvas/`, `/create/`). Gated shell navigation components with `!isEditor` after normalizing trailing slashes.
- **P0 Floating Island Top Header Gap**: Eliminated the 12px floating gap (`fixed inset-x-3 top-3 rounded-2xl`) where card text and artwork poked out above the header during scrolling. Replaced with full-width sticky navigation (`sticky top-0 z-50 w-full border-b border-[var(--app-border-subtle)] bg-[var(--app-bg)]/85 backdrop-blur-md`).
- **P0 Mobile Bottom Navigation Obstruction**: Redesigned floating pill bottom bar into a docked edge-to-edge navigation dock (`fixed bottom-0 inset-x-0 z-40 pb-[env(safe-area-inset-bottom,0px)]`). Removed oversized protruding button block. Standardized to 4 destinations with 20px icons and 48px touch targets.
- **Search Icon Overlap**: Fixed search icon collision with placeholder text in `TemplatesView.tsx` by using logical padding (`padding-block` and `padding-inline`) in `src/index.css` for `.studio-input` and applying `!pl-10 !pr-9` on the input element.
- **Mobile Card Button Stacking**: Changed template card action buttons in `TemplatesView.tsx` from `min-[420px]:grid-cols-2` to `grid-cols-2` across all viewports, preventing 100px vertical button stacks on narrow mobile screens.
- **Footer Mobile Clearance**: Increased mobile bottom padding on `Footer.tsx` (`pb-28 md:pb-8`) to prevent docked bottom nav from obscuring copyright and legal links.
- **Category Filter Clipping**: Added end scroll padding (`pr-4`) on mobile category filter bar in `TemplatesView.tsx` to prevent horizontal clipping.

### Added
- Automated integrity test suite `test/ui-ux-integrity.test.mjs` running under `npm test` verifying responsive meta tags, sitemap entries, CSS responsive breakpoints, and architectural anti-regression rules.
- `tofix.md`: Complete audit findings, root cause analysis, and resolution log.
- `memory.md`: Persistent system memory and engineering invariants.

### Changed
- Configured production deployment pipeline exclusively targeting Cloudflare Pages via `npm run deploy` (Wrangler).
- Removed legacy Vercel configuration files (`vercel.json`, `.vercel/`).
