# Changelog

All notable changes to the Aesthetic Card Generator (ACG) project are documented in this file.

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
