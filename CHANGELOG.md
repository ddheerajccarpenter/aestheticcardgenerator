# Changelog

All notable changes to the Aesthetic Card Generator (ACG) project are documented in this file.

## [2.4.0] - 2026-11-20

### Security & Architecture Hardening
- **Strict Content Security Policy (CSP) & HTTP Security Headers (`public/_headers`)**:
  - Enforced comprehensive CSP restricting script, font, image, and network connection origins.
  - Eliminated clickjacking vectors via `frame-ancestors 'none'` and `X-Frame-Options: DENY`.
  - Enforced `X-Content-Type-Options: nosniff` and restricted browser permissions via `Permissions-Policy`.
- **Prototype Pollution Prevention Subsystem (`schemaValidator.ts`)**:
  - `isPrototypePolluted`: Deep recursive detection blocking `__proto__`, `constructor`, and `prototype` payload injections.
  - `safeJsonParse`: Reviver parser that safely strips polluted keys during JSON deserialization.
  - `sanitizeAndValidateCanvasDocument`: Hardened schema validator enforcing strict integer canvas bounds (100px to 16,384px), capping layer counts at 500 objects, and stripping non-whitelist types or malicious protocols.
  - `sanitizeAndValidateCardState`: Validates quote and draft state from localStorage and URL parameters, capping text lengths and sanitizing color expressions.
- **Image & SVG Sanitization Engine (`imageSecurity.ts`)**:
  - Enforced 10MB file size limit on all user image uploads.
  - Binary magic byte validation verifying authentic headers for PNG, JPEG, GIF, WebP, and AVIF, rejecting disguised executable payloads.
  - `sanitizeSvgMarkup`: Strips all `<script>`, `<foreignObject>`, `<iframe>`, `<embed>`, and `<object>` elements, inline event handlers (`onload`, `onclick`, `onmouseover`), and `javascript:` URIs.
  - Decompression bomb guard verifying natural dimensions within 16,384px and 67.1 Megapixels.
  - `dataUrlToBlob`: Memory-safe, synchronous Base64-to-Blob decoding bypassing WebKit/Safari `fetch(dataUrl)` URL length constraints.
- **Storage Resilience & Quota Recovery (`storageManager.ts`)**:
  - `safeLocalStorageSet`: Gracefully traps `QuotaExceededError` / `NS_ERROR_DOM_QUOTA_REACHED`, prunes legacy and temporary cache keys, and retries writes without crashing React components.
  - Hardened IndexedDB project storage in `localProjectStore.ts` with input schema sanitization and quota handling.
- **Supply-Chain Dependency Audits**:
  - Upgraded `astro` from 7.4.3 to 7.4.13, resolving GHSA-mh32-jxcr-mh9f.
- **Automated Security Verification Test Suite (`test/security-hardening.test.ts`)**:
  - Added 5 automated security test suites to `npm test` verifying prototype pollution resilience, schema boundary clamping, image/SVG sanitization, and header enforcement.
- **Documentation**:
  - Created `SECURITY.md` establishing the threat model, zero-backend trust boundaries, and vulnerability disclosure policy.

## [2.3.0] - 2026-11-20

### Added
- **"My Fonts" Font Library Manager (`MyFontsModal.tsx`)**:
  - Full-featured compact font manager dialog in both Card Creator and Canvas Studio.
  - Search/filter custom fonts by name or filename.
  - Live preview with editable sample text rendered in the exact custom font.
  - Font deletion with FontFace unregistration and IndexedDB cleanup (`removeCustomFont`).
  - Direct font application to active text layers.
- **Client-Side Color Extraction & Eyedropper Subsystem (`colorExtractor.ts`)**:
  - Fast, client-side offscreen canvas palette extractor deriving 5 visually distinct swatches from uploaded images and avatars.
  - Native browser `EyeDropper` API integration allowing one-click sampling from any visible pixel on screen.
  - One-click palette extraction from photo layers in Canvas Studio to instantly recolor the canvas background.
- **Advanced Typography Controls**:
  - Live line height (`lineHeight`, 0.9x to 2.5x) and letter spacing (`letterSpacing`, -2px to +12px) range sliders for text layers.
  - Instant text case transformations (`normal`, `uppercase`, `lowercase`).
  - Double-click in-place text editing on canvas with retained typography properties.
- **70-Template Audit Manifest (`template_audit_manifest.md`)**:
  - Complete, itemized table of all 70 templates documenting typography, palette, ambient signatures, safe padding verification, and export capabilities.

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
