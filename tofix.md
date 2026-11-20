# ACG — Defect Audit, Root Cause Analysis & Resolution Log (`tofix.md`)

## 1. Executive Summary

This document records the visual, responsive, architectural, and cross-browser findings from the comprehensive audit of Aesthetic Card Generator (ACG). It covers both mobile screenshots (Brave on Android) and desktop screenshots (Firefox on macOS), as well as unit sizing principles demonstrated in the responsive engineering reference video (`Px and other things.mp4`).

---

## 2. Critical Defects Audit & Resolutions

### Defect 1: P0 — Global Header Overlaps Editor Controls on `/canvas/` and `/create/`
- **Symptom**: In mobile screenshots 2 and 3, the top navigation header (`ACG`, search, theme toggle, Create) was rendered directly on top of the fullscreen editor workspaces (`/create` and `/canvas`), obscuring toolbars, card viewports, and inspector sheets.
- **Root Cause**: `App.tsx` previously used exact string comparisons:
  ```tsx
  {currentPath !== '/canvas' && currentPath !== '/create' && (<Header ... />)}
  ```
  On Cloudflare Pages, incoming routes have canonical trailing slashes (`/canvas/`, `/create/`) or query parameters (`/canvas?blank=true`). Because `'/canvas/' !== '/canvas'` evaluated to `true`, `<Header>`, `<Footer>`, and `<MobileBottomNav>` were all rendered over the editor interfaces!
- **Resolution**:
  1. Normalized route handling in `App.tsx`:
     ```tsx
     const currentPath = window.location.pathname || '/';
     const normalizedPath = currentPath === '/' ? '/' : currentPath.replace(/\/+$/, '') || '/';
     const isEditor = normalizedPath.startsWith('/create') || normalizedPath.startsWith('/canvas');
     ```
  2. Gated `<Header>`, `<Footer>`, and `<MobileBottomNav>` with `!isEditor`.
  3. Replaced floating island header (`fixed inset-x-3 top-3 rounded-2xl`) with a sticky edge-to-edge header:
     ```tsx
     <header className="sticky top-0 z-50 w-full border-b border-[var(--app-border-subtle)] bg-[var(--app-bg)]/85 backdrop-blur-md">
     ```
     This eliminates the 12px gap where scrolled text and card artwork poked out above the header bar.

---

### Defect 2: P0 — Mobile Bottom Navigation Floats and Obstructs Content
- **Symptom**: In mobile screenshots 1, 4, 5, 6, and 7, the mobile navigation was rendered as a floating rounded island (`bottom-2 left-3 right-3 rounded-2xl`) with an oversized protruding red "Create" button (`-mt-2`, `h-9 w-9 bg-[var(--app-accent)]`). When users scrolled to the end of the template library or homepage, the bottom bar cut off card buttons and covered the legal links and copyright information in the footer.
- **Root Cause**: Fixed floating pill without bottom dock layout integration or safe-area anchoring, combined with insufficient bottom padding on the footer and views.
- **Resolution**:
  1. Redesigned `MobileBottomNav.tsx` as a docked edge-to-edge navigation bar:
     ```tsx
     <nav className="global-mobile-bottom-nav fixed bottom-0 inset-x-0 z-40 border-t border-[var(--app-border-subtle)] bg-[var(--app-surface)]/95 backdrop-blur-md pb-[env(safe-area-inset-bottom,0px)] md:hidden">
     ```
  2. Four uniform destinations: **Gallery**, **Templates**, **Canvas**, **Create**.
  3. Consistent 20px (`h-5 w-5`) icons, minimum 48px touch targets, subtle active accent indicator. Removed the jutting oversized block.
  4. Updated `Footer.tsx` with `pb-28 md:pb-8` to ensure all links and copyright text are 100% readable above the bottom dock.

---

### Defect 3: Search Icon Overlaps Placeholder Text in `TemplatesView.tsx`
- **Symptom**: In mobile screenshots 4 and 5, the magnifying glass icon sat directly on top of the search input's placeholder text `"Search by name, quote, or style"`.
- **Root Cause**: In `src/index.css`, the `.studio-input` class defined a 4-way shorthand:
  ```css
  padding: 0.5625rem 0.875rem;
  ```
  `0.875rem` is 14px. Because of CSS rule precedence in Tailwind v4, this shorthand clobbered the Tailwind utility class `pl-10` (`padding-left: 2.5rem;` / 40px). The text was indented only 14px, starting right under the 16px search icon at `left: 14px`.
- **Resolution**:
  1. Refactored `src/index.css`:
     ```css
     .studio-input {
       padding-block: 0.5625rem;
       padding-inline: 0.875rem;
     }
     ```
  2. Applied `className="studio-input w-full !pl-10 !pr-9"` in `TemplatesView.tsx`.
  Now the text starts at 40px, giving the 16px search icon 10px of clear negative space.

---

### Defect 4: Template Card Action Buttons Stacking Vertically on Mobile
- **Symptom**: In mobile screenshots 6 and 7, each template card displayed "Canvas Studio" and "Card Creator" as two tall full-width stacked buttons consuming ~100px of vertical space per card.
- **Root Cause**: `TemplatesView.tsx` used `grid grid-cols-1 gap-2 pt-1 min-[420px]:grid-cols-2`. On mobile viewports below 420px (or high-density Android viewports), the breakpoint did not trigger, forcing a vertical stack.
- **Resolution**: Changed to `grid grid-cols-2 gap-2 pt-1` across all viewports. Both buttons remain compact, ergonomic, and side-by-side.

---

### Defect 5: Category Filter Pill Horizontal Clipping on Mobile
- **Symptom**: In mobile screenshot 4, the category pill bar ("All Styles", "Aesthetic ID Passes", "Custom...") clipped the end item when scrolled horizontally on narrow viewports.
- **Root Cause**: Container lacked end scroll padding.
- **Resolution**: Added `pr-4` to the overflow-x container: `flex items-center gap-2 overflow-x-auto pb-1 pr-4 scrollbar-none`.

---

### Defect 6: Desktop Firefox Colored Patches Investigation
- **Symptom / User Report**: Concern that large colored rectangular patches in red, green, and pink across unrelated page regions in desktop Firefox screenshots were rendering defects.
- **Root Cause Investigation**:
  - Examined the 8 desktop Firefox screenshots (`desktop_2` through `desktop_9`).
  - Inspected CSS compositing, `backdrop-filter`, `mix-blend-mode`, stacking contexts, and hardware acceleration in Firefox.
  - *Finding*: The dark background (`#171512` / `#101114`) renders cleanly with zero GPU artifacts. The colored areas are the actual design artwork of card templates:
    - Acid Neon ID Pass (vibrant neon yellow/pink badge)
    - Bauhaus Exhibition Pass (red and blue geometric block)
    - Kawaii Member ID (pastel pink container)
    - Kyoto Archival Book Pass (forest green and cream)
  - No synthetic rendering defects, GPU leaks, or filter artifacts exist.

---

## 3. Responsive Units Framework (From Video Reference)

Based on `Px and other things.mp4`:
1. **`px` (Absolute Pixels)**:
   - Use for hairline borders (`1px`), fine drop shadows, and SVG canvas coordinate systems.
   - Do NOT use for layout container widths (e.g. `width: 500px` overflows mobile screens).
2. **`rem` (Root Font Sizing)**:
   - Use for typography, component padding, margins, and layout breakpoints (`40rem`, `48rem`, `64rem`).
   - Scales predictably with user browser zoom and OS font-size accessibility preferences.
3. **`em` (Parent-Relative Sizing)**:
   - Use with care. Avoid deeply nested `em` values that compound exponentially.
4. **`%` and Flex / Grid**:
   - Use for responsive card columns, fluid media widths, and adaptive grid columns (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`).
5. **`vw` / Viewport Units**:
   - Use for fluid display headlines (`text-[clamp(2.5rem,6vw,5.5rem)]`) with min/max clamps.

---

## 4. Cinematic Dual-Theme Color System & Ambient Atmosphere Engine

### 4.1 Emulsion & Paper Identity
- **Dark Mode (Projection Room)**:
  - Replaced cold/generic dark grey with warm cinema projection room tones: `#191715` foundation, `#24211e` surface, `#312c27` raised card containers, `#48413a` subtle borders, and `#c69d78` warm copper accent.
- **Light Mode (Archival Paper)**:
  - Replaced sterile `#ffffff` with tactile archival paper palette: `#f1ebdd` foundation, `#faf5eb` surface, `#e4d8c9` secondary containers, `#c9beaf` border, and `#6f4637` umber accent.
- **Contrast Ratios**: Verified 7:1+ contrast on body copy and 4.5:1+ on secondary metadata across all surfaces.

### 4.2 Scroll-Reactive Ambient Atmosphere Engine
- Diffuse multi-stop radial gradient background wash implemented in `src/components/AmbientAtmosphereLayer.tsx`.
- Gated out of editor views (`/create`, `/canvas`) in `App.tsx` so workspaces remain neutral.
- Dynamically responds to template visibility in `TemplatesView.tsx` via `IntersectionObserver` observing viewport center proximity.
- Color normalization (`normalizeAmbientColor`) clamps saturation and brightness to preserve subtle filmic ambience.
- Ambient toggle button provided in template library header and persisted in `localStorage`.

### 4.3 Custom Font Upload Subsystem
- Full client-side font upload (`.woff2`, `.woff`, `.ttf`, `.otf`) in Card Creator (`/create`) and Canvas Studio (`/canvas`).
- Verified header magic bytes, 15MB file size limit, and IndexedDB persistence.
- Added curated typography presets (Editorial, Minimal, Technical, Poetic).
- Synchronized image exports with `document.fonts.ready` to ensure clean typography rendering.
