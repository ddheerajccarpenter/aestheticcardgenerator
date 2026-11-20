# ACG — System Memory & Engineering Decisions (`memory.md`)

## 1. Hosting & Deployment Mandate
- **Production Target**: Cloudflare Pages (`https://aestheticcardgenerator.pages.dev/`).
- **Deployment Command**: `npm run deploy` (which triggers `npm run pages:deploy` / `wrangler pages deploy dist --project-name aestheticcardgenerator`).
- **Rule**: Never deploy to Vercel. `vercel.json` and `.vercel/` are permanently removed.

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
- `test/ui-ux-integrity.test.mjs` verifies:
  1. All 12 critical HTML entrypoints exist in `dist/` with responsive viewport meta tags.
  2. Dark and light theme initialization tokens.
  3. Sitemap integrity with 36 indexed routes.
  4. Compiled CSS responsive breakpoints (`40rem`/640px, `48rem`/768px, `64rem`/1024px) and design system tokens.
  5. Source architectural rules: `!isEditor` gating, `sticky top-0` header, docked `bottom-0` bottom nav with safe-area support, and side-by-side card action buttons.
