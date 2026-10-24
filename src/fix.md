# Comprehensive Master Engineering, UI/UX & Core Engine Prompt: Aesthetic Card Studio

> **How to Use This Master Specification**:
> Copy and paste this entire document—or feed it **Part by Part**—into your AI coding assistant (Cursor, Claude Code, Windsurf, Bolt, or Lovable) with your **[Aesthetic Card Studio](https://www.google.com/search?q=https%3A%2F%2Faestheticcardgenerator.pages.dev%2F)** repository open.
>
> This specification is intentionally **unabridged and exhaustive**. It is strictly divided into **UI/Visual Architecture Sections (Parts I–V & IX)** and **Core Engine / Non-UI / Data / Rendering Sections (Parts VI–VIII & X)** so the coding agent has every CSS variable, mathematical formula, state interface, algorithm, and asset list required to build a world-class, zero-AI-slop creative studio.

## System Role & Executive Directive

You are a **Principal Frontend Architect, WebGL/Canvas Graphics Engineer, and Design Systems Director**. You are performing a complete architectural and visual overhaul of **[Aesthetic Card Studio](https://www.google.com/search?q=https%3A%2F%2Faestheticcardgenerator.pages.dev%2F)**.

Your objective is to:
1. **Eradicate every trace of "AI Slop"** (unfilled bracketed placeholders, fake blog personas, verbose LLM marketing copy, 3-column SaaS grids, thin default line icons, and cheap neon glow blobs).
2. **Enforce a strict separation of concerns** between the **Global UI & Layout System** and the **Core Graphics, Three.js, Canvas & 4K–16K Export Engines**.
3. **Implement every specification in Parts I through X** with zero placeholders, zero shortcuts, and 100% production-ready code.

# PART I — STRICT ANTI-AI-SLOP MANIFESTO & COPYWRITING OVERHAUL (UI & CONTENT RULES)

## 1.1 Hard Bans (Never Output These Patterns Anywhere in the Codebase)
1. **Zero Unfilled Prompt Placeholders**:
   - Immediately find and delete `[Project Maintainer / Organization Placeholder]` on `/about`.
   - Immediately find and delete `[Configurable placeholder email for domain owner]` and `contact@aestheticcardstudio.com` on `/contact`.
2. **Zero Fake AI Personas**:
   - Delete fictitious author names on `/blog` (such as *"Elena Rostova — Editorial Typographer"* and any other invented names/bios).
3. **Zero Pretentious AI Buzzwords**:
   - Strip all occurrences of: *"specialized browser-native typesetting press"*, *"balanced artifacts"*, *"optical kerning"*, *"zero cloud delays"*, *"tactile digital artifacts"*, *"seamless workflow"*, *"unleash your creativity"*, *"elevate your brand"*, *"next-generation"*, *"holistic"*, and *"synergistic"*.
4. **Zero Verbose Text Walls (Cut Copy Volume by 65%+)**:
   - The current site is cluttered with long paragraphs that make the UI feel messy.
   - **Rule**: No marketing paragraph anywhere on `/`, `/templates`, `/create`, or `/canvas` may exceed **22 words** or **2 lines**. If a UI control is self-explanatory, remove the helper paragraph completely.
5. **Zero Cheap Neon Glows or Blurry SaaS Blobs**:
   - Never use `filter: blur(100px)` background blobs, glowing neon borders (`box-shadow: 0 0 25px rgba(...)`), or purple-to-cyan AI gradients.
6. **Zero 3-Column Grids ("No Rule of 3")**:
   - Never use `grid-template-columns: repeat(3, 1fr)` or `grid-cols-3` anywhere on the website. All multi-card layouts must strictly follow the **2-Column** or **4-Column** rule (detailed in Part IV).

## 1.2 Exact Page-by-Page Copy Replacement Table

| Route / Component | Current "AI Slop" Text to Delete | Exact Replacement Copy to Use |
| :--- | :--- | :--- |
| **Homepage (`/`) Hero Badge** | `Typesetting Studio for Writers, Readers & Curators` | `Local-First Card & ID Studio • Up to 16K Export` |
| **Homepage (`/`) Hero Title** | `Turn words into tactile editorial cards.` | `Design quote cards, posters, and aesthetic IDs.` |
| **Homepage (`/`) Hero Subtitle** | `A specialized browser-native typesetting press. Transform quotes, notes, and fragments into balanced artifacts with archival paper palettes, optical kerning, and zero cloud delays.` | `Set crisp typography on 50+ tactile paper and holographic surfaces, or build multi-layer cards in the studio. Runs 100% in your browser.` |
| **Homepage (`/`) Template Section Header** | `All Curated Styles (56)` (with all 56 loaded at once) | `Featured Templates` + Counter: `Showing 4 of 56 Templates` |
| **`/about` Ownership Notice** | `[Project Maintainer / Organization Placeholder]` | `Crafted independently. Questions or feedback: ddheerajcarpenter@gmail.com` |
| **`/contact` Email Block** | `contact@aestheticcardstudio.com` + `[Configurable placeholder email for domain owner]` | `ddheerajcarpenter@gmail.com` (with direct `mailto:` and `Copy Email` button) |
| **`/blog` Bylaws & Articles** | `By Elena Rostova — Editorial Typographer` | Remove author credit; tag as `Studio Design Note • 3 min read` |

# PART II — GLOBAL TYPOGRAPHY SYSTEM & SQUARE DUOTONE ICON ARCHITECTURE (UI SYSTEM)

## 2.1 Mandatory Three-Font Hierarchy
Replace all existing global font declarations (`Inter`, `Newsreader`, `Playfair Display` on the outer website UI) with this exact three-font system across every page and component of the website UI (note: the card editor itself retains its internal card fonts plus custom font uploads):

1. **Main Display & All Headings (`h1`, `h2`, Hero Display, Modal Titles, Section Headers)**:
   - **Font Family**: **[Murecho](https://www.google.com/search?q=https%3A%2F%2Ffonts.google.com%2Fspecimen%2FMurecho)** (Reference: `bestfreefonts.com/murecho` / Google Fonts).
   - **Weights**: `700` (Bold), `800` (ExtraBold), `900` (Black).
   - **Letter Spacing**: `-0.025em` for large display headings; `-0.015em` for section titles.
2. **Subheadings, Navigation Bar, Category Tabs, Badges & Section Eyebrows (`h3`, `h4`, `nav a`, `.badge`, `.tab-label`)**:
   - **Font Family**: **[Funnel Sans](https://www.google.com/search?q=https%3A%2F%2Ffonts.google.com%2Fspecimen%2FFunnel%2BSans)** (Google Fonts).
   - **Weights**: `500` (Medium), `600` (SemiBold), `700` (Bold).
   - **Letter Spacing**: `0.01em` (normal subheadings) or `0.06em` (uppercase micro-labels).
3. **Normal Text, Body Copy, Buttons, Inputs, Inspector Labels & Sliders (`body`, `p`, `button`, `input`, `select`, `label`)**:
   - **Font Family**: **[SamsungOne](https://www.google.com/search?q=https%3A%2F%2Fwww.cdnfonts.com%2Fsamsungone.font)** (`SamsungOne`, with fallback to `'One UI Sans', sans-serif`) styled in **Bold / SemiBold (`600`–`700` weight)** so all normal text has a sturdy, high-contrast presence.

### Exact HTML & CSS Font Implementation
```html
<!-- Inject into index.html <head> -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Funnel+Sans:ital,wght@0,400..800;1,400..800&family=Murecho:wght@400..900&display=swap" rel="stylesheet">
<link href="https://fonts.cdnfonts.com/css/samsungone" rel="stylesheet">
```

```css
:root {
  --font-heading: 'Murecho', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-subheading: 'Funnel Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-body: 'SamsungOne', 'One UI Sans', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Base Body Rule: SamsungOne in Bold Style */
body, p, span, li, input, textarea, select, button, label {
  font-family: var(--font-body);
  font-weight: 700; /* Bold styled normal text as required */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Main & Section Headings: Murecho */
h1, h2, .heading-main, .hero-title, .page-title {
  font-family: var(--font-heading);
  font-weight: 800;
  letter-spacing: -0.025em;
  line-height: 1.12;
}

/* Subheadings, Nav & UI Tabs: Funnel Sans */
h3, h4, h5, h6, nav a, .subheading, .section-eyebrow, .tab-trigger, .pill-badge {
  font-family: var(--font-subheading);
  font-weight: 600;
  letter-spacing: -0.005em;
  line-height: 1.3;
}

/* Numeric Readouts (Sliders, Coordinates, Dimensions) */
.numeric-readout, input[type="number"] {
  font-family: var(--font-subheading);
  font-variant-numeric: tabular-nums;
  font-weight: 700;
}
```

## 2.2 Bold Square Duotone Icon System ([Boxicons](https://www.google.com/search?q=https%3A%2F%2Fboxicons.com%2F) Reference)
The current thin wireframe icons look like default AI boilerplate. Replace **every icon across the entire application** with a unified **Square-Framed Bold Duotone Icon System** modeled after **[Boxicons](https://www.google.com/search?q=https%3A%2F%2Fboxicons.com%2F)** (`Duotone` / `Duotone Solid` / `Duotone Mix`).

### Architectural Rules for Every Icon
1. **Strict Square Container**:
   - Every icon button or badge must sit inside a geometric **square frame** (`width: 36px; height: 36px;` or `28px × 28px` for compact inspector controls, `aspect-ratio: 1 / 1`, `border-radius: 4px`—never `9999px` circles).
   - Give each square icon container a crisp `1px solid var(--icon-frame-border)` border and subtle surface tint `var(--icon-frame-bg)`.
2. **Bold Stroke & Duotone Two-Layer SVG Construction**:
   - Every SVG icon must contain two visual layers:
     - **Layer 1 (Secondary Tone / Duotone Fill)**: `<path class="bx-duotone-secondary" ... />` filled with `var(--icon-duotone-secondary)` at `100%` opacity (where the color variable itself carries the calibrated duotone tint).
     - **Layer 2 (Primary Tone / Bold Foreground)**: `<path class="bx-duotone-primary" ... />` rendered with bold geometry (`stroke-width: 2.25px` to `2.5px` or solid bold vector paths) using `var(--icon-duotone-primary)`.
3. **Dynamic Coupling to the Active 60:30:10 Gradient & Theme Mode**:
   - Icons must dynamically inherit their two tones from the active page's 3-color gradient palette while guaranteeing **high-contrast visibility in both Dark Mode and Light Mode**:

```css
/* Dark Mode Icon Tokens — High-Visibility Luminous Duotone */
[data-theme="dark"] {
  --icon-frame-bg: rgba(255, 255, 255, 0.04);
  --icon-frame-border: rgba(255, 255, 255, 0.14);
  --icon-duotone-primary: var(--color-10-accent-bright, #E2D9C8); /* Restrained warm bone primary layer */
  --icon-duotone-secondary: rgba(226, 217, 200, 0.28); /* Distinct duotone backdrop layer */
}

/* Light Mode Icon Tokens — High-Contrast Deep Ink Duotone */
[data-theme="light"] {
  --icon-frame-bg: rgba(18, 19, 24, 0.045);
  --icon-frame-border: rgba(18, 19, 24, 0.16);
  --icon-duotone-primary: var(--color-60-ink-deep, #18191e); /* Crisp dark primary stroke/fill */
  --icon-duotone-secondary: rgba(184, 93, 59, 0.32); /* Warm 10%-accent secondary duotone fill */
}

.sq-duotone-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  aspect-ratio: 1 / 1;
  border-radius: 4px;
  background: var(--icon-frame-bg);
  border: 1px solid var(--icon-frame-border);
  transition: transform 140ms cubic-bezier(0.22, 1, 0.36, 1), border-color 140ms ease;
}

.sq-duotone-icon svg {
  width: 20px;
  height: 20px;
}

.sq-duotone-icon .bx-duotone-primary {
  fill: var(--icon-duotone-primary);
  stroke: var(--icon-duotone-primary);
  stroke-width: 0.4px; /* Enforces bold visual weight */
}

.sq-duotone-icon .bx-duotone-secondary {
  fill: var(--icon-duotone-secondary);
}
```

### Complete Application Icon Replacement Map (Boxicons Duotone Reference)
| UI Location / Action | Boxicons Square Duotone Icon Reference |
| :--- | :--- |
| **Brand Logo Icon** | `bxs-grid-alt` (4-square architectural block in duotone) |
| **Search (`⌘K`)** | `bxs-search-alt-2` inside square frame |
| **Guides (Right Nav)** | `bxs-book-open` (duotone open book pages) |
| **Theme Toggle (Dark / Light)** | `bxs-moon` (Dark) / `bxs-sun` (Light) in high-visibility duotone |
| **Compare Templates Button** | `bxs-columns` / `bx-git-compare` square duotone |
| **Ambient Mode Toggle** | `bxs-Adjust-alt` / `bxs-Analyse` duotone |
| **3D View Toggle (`Three.js`)** | `bxs-cube-alt` duotone |
| **Upload Custom Font** | `bxs-font-family` + square plus badge |
| **Replace Photo** | `bxs-image-add` duotone |
| **Offline Remove Background** | `bxs-eraser` / `bxs-magic-wand` square duotone |
| **Auto-Align in Grid** | `bxs-grid` / `bxs-align-middle` duotone |
| **Export (4K–16K)** | `bxs-download` square duotone |

# PART III — UNIVERSAL 60:30:10 SCROLL-REACTIVE 60FPS GRADIENT ENGINE (UI / VISUAL ENGINE)

## 3.1 The 60 : 30 : 10 Color Proportion & Scroll Flow Rule
Every page on the website (`/`, `/templates`, `/create`, `/canvas`, `/guides`, `/blog`, `/about`, `/contact`) must share a universal, adaptive 3-color gradient background system that shifts smoothly at **60fps** as the user scrolls up or down—**with zero neon glow effects, zero radial blur blobs, and zero banding**.

### How the 60 : 30 : 10 Spatial Distribution Works
- **60% Dominant Zone (`--c60`)**: Occupies the top `0%` to `60%` of the gradient field—establishing a calm, architectural foundation.
- **30% Secondary Transition Zone (`--c30`)**: Occupies `60%` to `90%` of the gradient field—providing a rich mid-tone transition as the user scrolls through content.
- **10% Accent Horizon (`--c10`)**: Occupies the final `90%` to `100%` of the gradient field—delivering a refined tonal anchor at the bottom edge and driving interactive highlights/duotone icon accents.

### 60fps Scroll Interpolation Algorithm (Zero Layout Thrashing)
Implement a single global `ScrollGradientController` mounted at the root layout level:
1. Track `window.scrollY` inside a `{ passive: true }` scroll listener and schedule updates exclusively via `requestAnimationFrame` (throttled to native display refresh rate, 60fps+).
2. Compute normalized scroll progress $p \in [0, 1]$:
   $$p = \text{clamp}\left(\frac{\text{scrollY}}{\max(1, \text{document.documentElement.scrollHeight} - \text{window.innerHeight})}, 0, 1\right)$$
3. Dynamically shift the gradient angle and stop positions using GPU-composited CSS custom properties on a fixed full-viewport background layer (`position: fixed; inset: 0; z-index: -1; pointer-events: none; will-change: background;`):
   - Stop 1 (`60%` Dominant color): shifts smoothly from `0%` to `15% * p` while holding `55%–60%` of the visual canvas weight.
   - Stop 2 (`30%` Middle color): shifts smoothly between `60% - (12% * p)` and `88% - (8% * p)`.
   - Stop 3 (`10%` Accent color): anchors `90%` to `100%`, subtly rotating the linear-gradient angle from `180deg` (top-to-bottom) to `162deg` as the user scrolls down, and reversing smoothly back to `180deg` when scrolling up.

```typescript
// src/utils/scrollGradientEngine.ts
export function initScrollGradientEngine(): () => void {
  let rafId: number | null = null;
  const root = document.documentElement;

  const updateGradient = () => {
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = Math.min(1, Math.max(0, window.scrollY / maxScroll));

    // Smoothly shift 60:30:10 stops and angle at 60fps
    const angle = (180 - progress * 18).toFixed(2);
    const stop60 = (60 - progress * 10).toFixed(2);
    const stop30 = (90 - progress * 8).toFixed(2);

    root.style.setProperty('--scroll-p', progress.toFixed(4));
    root.style.setProperty('--grad-angle', `${angle}deg`);
    root.style.setProperty('--stop-60', `${stop60}%`);
    root.style.setProperty('--stop-30', `${stop30}%`);
    rafId = null;
  };

  const onScroll = () => {
    if (rafId === null) {
      rafId = window.requestAnimationFrame(updateGradient);
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  updateGradient();

  return () => {
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
    if (rafId !== null) cancelAnimationFrame(rafId);
  };
}
```

```css
/* Universal 60:30:10 Matte Editorial Gradient Layer (No Glow Slop) */
:root[data-theme="dark"] {
  --c60-dominant: #111216;   /* 60% Top Dominant: Deep Matte Obsidian */
  --c30-secondary: #1b1e26;  /* 30% Middle Shade: Warm Slate Charcoal */
  --c10-accent: #2c241d;     /* 10% Bottom Shade: Umber Espresso Tint */
  --ui-accent-solid: #e5b84b;
  --text-primary: #f4f1ea;
  --text-secondary: #b5b0a6;
}

:root[data-theme="light"] {
  --c60-dominant: #f5f0e6;   /* 60% Top Dominant: Warm Archival Cream */
  --c30-secondary: #e8dfd1;  /* 30% Middle Shade: Pressed Oat Linen */
  --c10-accent: #d8c6b0;     /* 10% Bottom Shade: Warm Sand Kraft */
  --ui-accent-solid: #9e472a;
  --text-primary: #181715;
  --text-secondary: #524e48;
}

.universal-page-bg {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background: linear-gradient(
    var(--grad-angle, 180deg),
    var(--c60-dominant) 0%,
    var(--c60-dominant) var(--stop-60, 60%),
    var(--c30-secondary) var(--stop-30, 90%),
    var(--c10-accent) 100%
  );
}
```

# PART IV — NAVIGATION BAR, STRICT 2/4 GRID ARCHITECTURE & HOMEPAGE FLOW (UI & LAYOUT)

## 4.1 Navigation Bar Exact Layout & Link Placement
Refactor the global top `<header>` component across all pages so it follows this exact structure:
1. **Left Group (Brand + Core Links)**:
   - **Logo**: Square duotone 4-block icon + `Aesthetic Card Studio` (in `Murecho` Bold).
   - **Primary Navigation Links** (in `Funnel Sans` SemiBold):
     - `Home` (`/`)
     - `Templates` (`/templates`)
     - `Blog` (`/blog`)
     - `Card Creator` (`/create`)
     - `Canvas Studio` (`/canvas`)
2. **Right Group (Utility & Guides)**:
   - **`Guides` Link (`/guides`)**: Moved from the center nav bar to the **right side** of the Nav Bar, featuring a square duotone book icon (`bxs-book-open`) + `Guides` label.
   - **Command Palette Trigger**: Square duotone search icon + `⌘K` badge.
   - **Dark / Light Mode Toggle**: Square duotone button (`bxs-moon` / `bxs-sun`) with high-visibility contrast in both themes.
3. **Removed from Top Nav Bar (Retained on Website)**:
   - **Remove `About` and `Contact` from the top Navigation Bar** immediately.
   - **Keep `/about` and `/contact` routes active** in the router and prominently linked inside the global `<footer>` and the `⌘K` Command Palette.

## 4.2 Strict "No Rule of 3" Grid Architecture (2-Column or 4-Column Only)
Audit every CSS Grid and Flexbox container across `/`, `/templates`, `/blog`, `/guides`, and modals:
- **Strictly Forbidden**: `grid-template-columns: repeat(3, ...)` or 3 cards in a row.
- **Template Showcase Grid (2-per-Row Focused Layout)**:
  - Display **2 templates per row** (`grid-template-columns: repeat(2, minmax(0, 1fr))`) on desktop/tablet (`>= 768px`) with generous spacing (`gap: 40px`) and maximum container width `1240px`.
  - Why: Showing 2 templates at once makes each card preview significantly larger, lets users inspect typography and textures clearly, and gives the gallery an editorial lookbook feel.
- **Secondary Metric / Category Grids**: Must strictly use either **2 columns** (`repeat(2, 1fr)`) or **4 columns** (`repeat(4, 1fr)`).

## 4.3 Homepage (`/`) Top-4 Template Curation & Pagination Fix
Fix the UX flaw on the homepage where all 56 templates load at once and force endless scrolling:
1. **Top 4 Curated Templates Only on Homepage**:
   - Slice the homepage template array to display **only the top 4 templates** (`templates.slice(0, 4)`) rendered in a **2 columns × 2 rows** grid (2 templates per row).
2. **Footer Status Bar & View More Action**:
   - Directly below the 2×2 grid, render a clean, centered control bar:
     - Status badge (in `Funnel Sans`): **`Showing 4 of 56 Templates`** (dynamically computed from `templates.length`).
     - Action buttons:
       - **`Load 4 More`** (increments visible count by `+4` in 2-per-row pairs without leaving the page)
       - **`Browse All 56 Templates →`** (navigates to `/templates`).

## 4.4 Side-by-Side Template Comparison Feature (`Compare Mode`)
Add an interactive **Template Comparison** workflow on both `/` and `/templates`:
1. **Selection Trigger**:
   - Each template card header includes a square duotone **`Compare`** toggle button (`[+ Compare]` / `[✓ Selected]`).
   - Users can select **2 templates** (or up to **4 templates**—never 3) to compare.
2. **Floating Comparison Dock**:
   - As soon as `>= 1` template is selected for comparison, slide up a compact bottom dock showing thumbnail slots (`1/2 Selected`), a `Clear` button, and a primary **`Compare Side-by-Side`** button.
3. **Comparison Modal / Split View**:
   - Clicking `Compare Side-by-Side` opens a full-bleed **2-Column Split Comparison View** (or 2×2 Quad View if 4 are selected) showing:
     - Large, high-resolution live previews of the selected templates side-by-side.
     - Synchronized zoom/hover loupe and a live **"Test Your Own Quote / Photo"** bar at the top that injects the user's test text and sample photo into both compared templates simultaneously so they can see which template fits their content better!
     - Spec comparison table beneath each card: `Dimensions & Aspect Ratio`, `Heading & Body Fonts`, `Palette Swatches`, `Default Surface Texture`, and a direct **`Open This Style in Studio →`** button.

# PART V — DEDICATED MOBILE / PHONE UI & UX ARCHITECTURE (MOBILE UI SYSTEM)

## 5.1 Mobile-First Ergonomic Redesign (`< 768px`)
The mobile experience must **not** look like a squished desktop page. Implement a dedicated mobile layout system across all routes:

### 1. Mobile Header & Navigation (`< 768px`)
- Compact `56px` sticky header containing:
  - Left: Square duotone Logo mark + concise `Aesthetic Card` title.
  - Right: Square duotone `Guides` shortcut icon, `Theme Toggle` icon, and `Menu` square toggle.
- Tapping `Menu` opens a clean **2×2 Square Bento Grid Navigation Sheet** (`Home`, `Templates`, `Card Creator`, `Canvas Studio`, `Guides`, `Blog`, `About`, `Contact`) with zero cramped vertical lists.

### 2. Mobile Homepage & Template Gallery
- Single-column (`1fr`) focused card feed for full-width template inspection, with a toggle switch in the filter bar to switch between **`1-Up Large View`** and **`2-Up Compact Grid`**.
- Filter category pills scroll horizontally with smooth momentum (`overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none;`).

### 3. Mobile Card Creator (`/create`) & Canvas Studio (`/canvas`) Workspace
Completely replace the desktop 3-panel layout on mobile screens with a **Sticky Top Stage + Thumb-Zone Bottom Sheet Architecture**:
- **Top 44% Viewport (`Sticky Preview Stage`)**:
  - Pins the live card canvas centered in the upper `44vh` of the screen (with YouTube-style Ambient Mode softly tinting the stage behind it).
  - Floating compact top bar over the stage: `← Back`, `Undo`, `Redo`, `3D Tilt Toggle`, and `Export (4K–16K)`.
- **Bottom 56% Viewport (`Ergonomic Thumb-Zone Drawer`)**:
  - Bottom tab bar with 4 square duotone tabs in `/create` (`Words`, `Type`, `Palette`, `Surface & Elements`) or 4 tabs in `/canvas` (`Add`, `Edit Layer`, `Photo & BG`, `Layers & Grid`).
  - All sliders (`Type Scale`, `Line Height`, `Padding`, `Corner Radius`, `Texture Intensity`) use touch-friendly `44px` hit targets and display live numeric readouts so the user's thumb never blocks the label.
  - On `/canvas`, support native touch gestures on the card stage: single-finger drag with magnetic grid snap, two-finger pinch-to-scale, and two-finger twist-to-rotate.

# PART VI — CARD CREATOR (`/create`) ENGINE: AMBIENT MODE, 55+ TEXTURES, 55+ ELEMENTS & CUSTOM FONTS (CORE ENGINE)

## 6.1 YouTube-Style Workspace Ambient Mode (Editor UI Only — Strictly Excluded from Export)
In both `/create` and `/canvas`, surround the card preview stage with a dynamic **Ambient Mode** backdrop:
1. **How It Works**:
   - Whenever the active card's palette (`backgroundColor`, `inkColor`, `accentColor`) or uploaded photo changes, extract the 3 dominant chromatic tones of the card.
   - Render an ambient stage canvas or multi-stop CSS mesh behind the card wrapper container (`class="editor-ambient-stage"`) that softly illuminates the dark/light workspace behind the card—just like **YouTube's Ambient Mode** around a video player.
   - Include a square duotone **`Ambient Mode: ON / OFF`** button in the editor's top toolbar.
2. **CRITICAL ISOLATION INVARIANT**:
   - The Ambient Mode exists **exclusively on the outer `.editor-ambient-stage` HTML wrapper**.
   - The card's actual `<canvas id="card-export-surface">` or SVG render node must **NEVER** contain the ambient glow or outer background gradient. When the user clicks `Export`, only the exact rectangular/rounded bounds of the card itself are serialized.

## 6.2 Custom User Font Upload Engine (`.ttf`, `.otf`, `.woff`, `.woff2`)
Allow users to upload and use their own downloaded fonts in both **Card Creator (`/create`)** and **Freeform Canvas Studio (`/canvas`)**:
1. **UI Control**:
   - Inside the Typography tab (`Type` in `/create` and `Font Family` inspector in `/canvas`), add a prominent **`+ Upload Custom Font (.ttf, .otf, .woff2)`** button with a square duotone icon.
2. **Browser `FontFace` API + `IndexedDB` Persistence Engine**:
   - Read the uploaded file as an `ArrayBuffer`.
   - Derive a clean font family name from the filename (or parse the OpenType `name` table) and register it immediately via the browser `FontFace` API:

```typescript
// src/services/customFontManager.ts
export interface StoredCustomFont {
  id: string;
  familyName: string;
  fileName: string;
  buffer: ArrayBuffer;
  uploadedAt: number;
}

const DB_NAME = 'AestheticCardStudioFontsDB';
const STORE_NAME = 'custom_fonts';

export async function registerAndSaveCustomFont(file: File): Promise<StoredCustomFont> {
  const buffer = await file.arrayBuffer();
  const cleanName = file.name.replace(/\.(ttf|otf|woff2?|TTF|OTF|WOFF2?)$/, '').replace(/[-_]+/g, ' ').trim();
  const familyName = `Custom_${cleanName}`;

  const fontFace = new FontFace(familyName, buffer, { style: 'normal', weight: '100 900' });
  const loadedFace = await fontFace.load();
  document.fonts.add(loadedFace);
  await document.fonts.ready;

  const record: StoredCustomFont = {
    id: crypto.randomUUID(),
    familyName,
    fileName: file.name,
    buffer,
    uploadedAt: Date.now(),
  };

  await saveFontToIndexedDB(record);
  return record;
}
```
3. **Export Synchronization**:
   - Before running the 4K–16K export renderer, await `document.fonts.ready` so any custom uploaded font is 100% rasterized at full target resolution without falling back to system sans-serif.

## 6.3 Exhaustive Library of 55+ Distinct Surface Finishes & Textures (`Details` Tab)
Replace the single `Archival Paper Grain Texture` checkbox with a categorized **55-Texture Procedural Surface Engine** in `/create` (and available as a Canvas overlay in `/canvas`).
- **Crucial Requirement**: Every single texture must use a **distinct procedural generator algorithm** (combining SVG `<feTurbulence>`, `<feDiffuseLighting>`, `<feConvolveMatrix>`, custom 2D Canvas pixel shaders, directional hatch generators, and geometric patterns) so all 55+ textures look visibly unique from one another.
- Provide an **Intensity Slider (`0%` to `100%`)**, **Scale Slider (`50%` to `200%`)**, and **Blend Mode Selector (`Multiply`, `Overlay`, `Soft Light`, `Screen`)**.

### Complete 55-Texture Catalog & Procedural Parameters

#### Category A: Archival & Fine Papers (11 Textures)
1. **`cotton-rag-300gsm`**: Warm 300gsm Cotton Rag (`fractalNoise`, `baseFrequency="0.04"`, `numOctaves="4"`, diffuse lighting elevation `45°`).
2. **`cold-press-watercolor`**: Deep Cold-Press Watercolor Tooth (`turbulence`, `baseFrequency="0.018"`, high relief specular bump).
3. **`japanese-kozo-washi`**: Long-Fiber Mulberry Washi (anisotropic directional fibers `baseFrequency="0.008 0.09"` + subtle organic flecks).
4. **`unbleached-kraft-board`**: Raw Kraft Packaging Board (warm fibrous grain + random dark lignin specks).
5. **`laid-linen-stationery`**: Classic Laid Ribbed Paper (horizontal `2px` micro-wire chain lines intersected by vertical watermark ribs every `28px`).
6. **`woven-canvas-linen`**: Cross-Hatched Woven Linen (`baseFrequency="0.12 0.12"` orthogonal sine-wave weave matrix).
7. **`recycled-oat-pulp`**: Speckled Recycled Pulp (fine matte noise + multi-tonal earth/charcoal organic inclusions).
8. **`crushed-translucent-vellum`**: Frosted Tracing Vellum (soft cloudy transmittance veins + micro-matte frost).
9. **`aged-parchment-vellum`**: Archival Manuscript Parchment (warm edge vignette + subtle organic mottling).
10. **`french-ingres-charcoal`**: Fine Tooth Ingres Drawing Paper (diagonal micro-ribbing at `45°`).
11. **`newsprint-pulp-grey`**: Vintage Daily Newsprint (high-frequency directional pulp grain + warm grey tint).

#### Category B: Printmaking, Zine & Halftone Press (11 Textures)
12. **`risograph-soy-ink`**: Risograph Drum Grain (stippled stochastic micro-dots + slight ink density variation).
13. **`halftone-comic-45deg`**: 85-LPI Classic Angled Halftone (`45°` rotated circular dot grid modulated by luminance).
14. **`halftone-zine-coarse`**: Coarse Punk Zine Dot Screen (`18px` macro halftone dots at `15°` angle).
15. **`xerox-photocopy-toner`**: High-Contrast Xerox Toner Streak (vertical drum roller streaks + high-contrast edge grit).
16. **`letterpress-deep-deboss`**: Heavy Iron Letterpress Bite (inner edge bevel shadow on text/borders + cotton fiber compression).
17. **`silkscreen-mesh-110`**: 110-Mesh Screenprint Weave (fine diagonal diamond ink deposit pattern).
18. **`offset-litho-rosette`**: CMYK Offset Print Rosette (micro-moiré four-angle halftone rosette structure).
19. **`distressed-rubber-stamp`**: Dry Ink Pad Distress (thresholded fractal erosion cutting irregular ink dropouts across text/badges).
20. **`carbon-copy-manifold`**: Blue/Black Typewriter Carbon Smudge (soft haloing around glyph edges + pressure smudges).
21. **`thermal-receipt-roll`**: POS Thermal Paper (subtle vertical heat-head scan striations + slight satin sheen).
22. **`woodblock-relief-grain`**: Carved Ukiyo-e Woodblock (organic wood-ring linear grain bleeding through solid fills).

#### Category C: Plastic, ID Cards & Holographic Foils (11 Textures)
23. **`glossy-pvc-id-card`**: Laminated PVC Badge Sheen (crisp diagonal `135°` specular light reflection band + micro-bevel border).
24. **`matte-frosted-polycarbonate`**: Sandblasted Polycarbonate Pass (ultra-fine high-frequency isotropic micro-bead texture).
25. **`rainbow-hologram-foil`**: Iridescent Diffraction Grating (multi-stop spectral linear-gradient sweep at `125deg` masked by diagonal micro-grooves).
26. **`starburst-holo-laminate`**: Y2K Starburst Holographic Overlay (repeating sparkling 4-point star refraction pattern).
27. **`prismatic-security-guilloche`**: Banknote/Passport Spirograph Guilloche (interlocking sinusoidal vector security curves across card background).
28. **`brushed-titanium-metal`**: Anodized Brushed Titanium (`baseFrequency="0.002 0.45"` horizontal metallic hairlines + cool specular gradient).
29. **`embossed-credit-plate`**: Raised Metallic Card Plate (specular rim highlight along card perimeter and corner badge).
30. **`lanyard-vinyl-pouch`**: Clear Vinyl Badge Holder (top oval lanyard slot punch-out + soft plastic ripple reflection).
31. **`crinkled-cello-wrap`**: Glossy Cellophane Wrapper (sharp geometric polygonal specular crease highlights).
32. **`liquid-chrome-sheen`**: Y2K Cyber Liquid Metal (warped domain-distorted chrome reflection lines).
33. **`gold-leaf-kintsugi`**: Metallic Gold Foil Leaf (irregular metallic foil flakes along accents and borders).

#### Category D: Analog Film, CRT & Vintage Wear (11 Textures)
34. **`kodak-portra-35mm`**: Fine 35mm Color Film Grain (organic silver-halide clumping in midtones).
35. **`ilford-hp5-pushed-1600`**: Gritty Pushed 1600 ISO B&W Grain (chunky, tactile monochrome silver grain).
36. **`polaroid-sx70-emulsion`**: Instant Film Chemical Spread (subtle vertical roller developer bars + soft corner falloff).
37. **`vhs-tracking-scanlines`**: 240p VHS Tape Scanlines (`2px` horizontal alternating scanlines + subtle horizontal sync jitter).
38. **`crt-trinitron-grille`**: Sony Trinitron Phosphor Grille (vertical RGB sub-pixel aperture mask + subtle barrel vignette).
39. **`folded-magazine-quad`**: 4-Way Folded Poster Crease (crisp horizontal + vertical center fold wear lines with paper highlight/shadow).
40. **`diagonal-pocket-crease`**: Corner Dog-Ear Fold (top-right `32deg` diagonal crease line).
41. **`dust-and-hair-darkroom`**: Archival Negative Dust & Micro-Scratches (procedural fine white/black Bezier filaments and dust specks).
42. **`sun-bleached-book-spine`**: UV-Faded Edge Patina (warm oxidized paper yellowing along top and left borders).
43. **`espresso-ring-stain`**: Subtle Notebook Ring Mark (faint, organic circular water/coffee ring in lower quadrant).
44. **`microfiche-archive-scan`**: Library Microfilm Reader (subtle green/amber edge aberration + radial scan lines).

#### Category E: Nano-Textures, Grids & Architectural Surfaces (11 Textures)
45. **`warm-nano-texture-matte`**: Ultra-Fine Warm Nano-Texture (sub-pixel `0.85` frequency matte silica diffuser—zero glare).
46. **`bookcloth-buckram-weave`**: Hardcover Library Buckram (stiff starch-coated thread grid with subtle sheen).
47. **`swiss-millimeter-grid`**: 1mm & 5mm Archival Engineering Grid (hairline `0.5px` rule lines at `8%` ink opacity).
48. **`isometric-axonometric-grid`**: `30° / 60°` Isometric Technical Grid (clean architectural triangle lattice).
49. **`dot-matrix-bullet-journal`**: `5mm` Spaced Dot Grid (`1.2px` ink dots at `20px` intervals).
50. **`cyanotype-blueprint`**: Prussian Blue Architectural Print (white technical registration ticks + cyan fiber grain).
51. **`perforated-ticket-stub`**: Cinema / Transit Ticket Perforation (punched semicircular notches along left/right edges + dashed tear line).
52. **`embossed-morocco-leather`**: Fine Pebble Grain Leatherette (organic Voronoi cellular micro-pebbling).
53. **`architectural-concrete-pore`**: Smooth Cast Fair-Faced Concrete (subtle matte mineral pores + tie-rod corner marks).
54. **`music-manuscript-staves`**: 5-Line Musical Staff Paper (subtle horizontal staff rulings across background).
55. **`japanese-genkoyoshi-grid`**: Squared Manuscript Grid (vertical/horizontal character cells with center alley).

## 6.4 55+ Distinct Ornament Glyphs, Stamps & Editorial Elements
Expand the `Details` / `Elements` picker in `/create` and `/canvas` to 55+ crisp vector assets organized into 5 tabs:
1. **Editorial & Literary Marks (11)**: Double Serif Quotes (`“ ”`), French Guillemets (`« »`), Fleuron Hedera Leaf (`❧`), Asterism (`⁂`), Pilcrow (`¶`), Section Silcrow (`§`), Dagger (`†`), Interrobang (`‽`), Manicule Pointing Hand (`☞`), Ex-Libris Bookplate Frame, Colophon Press Mark.
2. **Y2K, Cyber & Aesthetic Icons (11)**: 4-Point Sparkle Cluster (`✦`), Elongated Cyber Crosshair, Tribal/Y2K Chrome Star, Pixelated Heart (`8-bit`), Planet Saturn Ring, Crescent Moon & Star, Barbed Wire Divider, Flame Badge, Butterfly Motif, CD/MiniDisc Icon, Portable Cassette Icon.
3. **ID Credential & Security Badges (11)**: Smartchip Gold Contact Pad (`SIM/EMV Chip`), Holographic Globe Seal, VIP Crown Pass Emblem, Press Camera Credential Icon, Medical/Academy Crest, Barcode `Code-128` Strip, Micro-QR Matrix, Magnetic Stripe Bar, Lanyard Slot Punch Mark, Security Guilloche Rosette, Verified Check Shield.
4. **Technical & Registration Marks (11)**: Printer Crop & Bleed Marks, CMYK Color Calibration Bars, Center Crosshair Target (`⊕`), Scale Ruler (`mm/px`), Timecode Frame Stamp (`00:04:23:19`), REC Battery Indicator Frame, Film Sprocket Holes (35mm strip), Audio Waveform Bar, Fold Here Dashed Scissors Line, Serial Number Counter (`NO. 000421`), Barcode ISBN Block.
5. **Rubber Stamps & Seals (11)**: `APPROVED` Box Stamp, `CONFIDENTIAL` Angled Stamp, `FIRST EDITION` Circular Seal, `ARCHIVE COPY` Stamp, `VIP ACCESS` Badge, `5-STAR RATING (★★★★★)` Row, `PAR AVION / AIRMAIL` Postmark, Wavy Postal Cancellation Lines, Wax Seal Silhouette, `FRAGILE / HANDLE WITH CARE` Mark, Custom Circular Text Stamp Generator.

# PART VII — FREEFORM CANVAS STUDIO (`/canvas`) ENGINE: BUG FIXES, OFFLINE BG REMOVAL, AUTO-ALIGN GRIDS & THREE.JS 3D ELEMENTS (CORE ENGINE)

## 7.1 De-Complicate & Humanize the `/canvas` Workspace UI
The current `/canvas` studio feels complicated and overwhelming. Refactor the interface so every action feels direct and intuitive:
1. **Contextual Floating Selection Toolbar**:
   - Whenever a user clicks any layer on the canvas, display a sleek floating toolbar **12px directly above the layer's bounding box** containing only the actions relevant to that layer type:
     - **If Image Layer Selected**: `[Replace Photo]`, `[Remove BG (Offline)]`, `[Filters & Mask]`, `[Auto-Center]`, `[Duplicate]`, `[Delete]`.
     - **If Text Layer Selected**: `[Font Family + Upload]`, `[Size -/+]`, `[Color]`, `[Bold/Italic]`, `[Align]`, `[Delete]`.
     - **If Shape/Stamp Selected**: `[Fill/Stroke Color]`, `[Opacity]`, `[Send Backward/Forward]`, `[Delete]`.
2. **Clean Collapsible Right Inspector**:
   - Replace the wall of raw numeric inputs with clean, visual controls:
     - **Quick Position Grid (3×3 Tic-Tac-Toe Pad)**: Clicking any of the 9 squares snaps the selected layer to Top-Left, Top-Center, Center, Bottom-Right, etc. in one click!
     - Collapse raw `X / Y / Width / Height / Rotation` numeric inputs inside a clean `"Exact Coordinates"` accordion.

## 7.2 Bug Fix 1 — Fix Broken "Replace Photo" Action on Canvas Templates
Currently, the `Replace Photo` button on `/canvas` templates fails to swap the existing image properly.
- **Exact Fix**:
  1. Attach a hidden `<input type="file" accept="image/png,image/jpeg,image/webp,image/avif" />` ref directly to the `replacePhotoForLayer(layerId)` handler.
  2. When the user selects a file, decode it via `createImageBitmap(file)` or `new Image()` with `URL.createObjectURL(file)`.
  3. Update the existing layer object **in-place** inside the canvas state array (`layers.map(l => l.id === activeLayerId ? { ...l, imageElement: newImg, src: newObjectUrl, naturalWidth: newImg.width, naturalHeight: newImg.height } : l)`).
  4. **Preserve Aspect-Fill / Crop Box**: Keep the template layer's exact `x`, `y`, `width`, `height`, `rotation`, `borderRadius`, `clipMask`, and `zIndex` intact, applying `object-fit: cover` (center-cropped to the existing frame bounds) and immediately triggering `requestRender()`.

## 7.3 Offline Client-Side Background Removal (Web API / WASM)
Add a one-click **`"Remove Background (Offline)"`** feature for any photo layer on `/canvas` (and ID Card photos):
1. **100% Client-Side Execution (Zero Cloud API Keys Required)**:
   - Integrate `@imgly/background-removal` (WebAssembly / WebGPU ONNX runtime running in a dedicated Web Worker) or the browser-native MediaPipe Vision `ImageSegmenter` / Canvas segmentation pipeline.
   - Cache the lightweight segmentation model in browser `CacheStorage` / `IndexedDB` so after initial load it works **100% offline**.
2. **UX Flow**:
   - When the user clicks **`Remove Background`**, show a sleek non-blocking progress pill on the image layer (`Removing background locally... 65%`).
   - Composite the resulting foreground alpha mask onto an offscreen canvas, replace the layer's `src` with the transparent PNG blob URL, and push the previous image state onto the `Undo` stack so the user can undo with `⌘Z` if desired.

## 7.4 Auto-Align in Grids & Smart Snapping Engine
Implement a comprehensive grid and alignment system on `/canvas` like modern design tools:
1. **Live Magnetic Snap Guides**:
   - During pointer drag (`onPointerMove`), evaluate the active layer's 5 X-anchors (`left`, `centerX`, `right`, plus canvas `25%` and `75%` quarter-grid lines) and 5 Y-anchors (`top`, `centerY`, `bottom`, plus `25%` and `75%` lines) against the canvas frame and all other visible layers.
   - If distance $|\Delta| \le 6\text{px}$, snap the coordinate to the exact guide and draw a crisp `1px` high-contrast guide line with a distance pill badge (e.g., `24px`).
2. **One-Click `"Auto-Align in Grid"` Button**:
   - Add an **`Auto-Align Grid`** button (with square duotone Boxicon) in the top canvas toolbar.
   - Clicking it automatically straightens near-horizontal rotations ($|\theta| < 4^\circ \to 0^\circ$), quantizes layer positions to the nearest `8px` baseline grid, centers primary focal elements, and resolves accidental overlapping text boxes.

## 7.5 Bug Fix 2 — Fix Poster vs. Card Dimension Alignment Mismatch
Currently, switching between Poster presets and Card presets leaves layers misaligned or improperly scaled relative to the card boundaries.
- **Exact Fix (Proportional Coordinate Normalization)**:
  1. Every template definition must explicitly store its `designWidth` and `designHeight` (e.g., `960 × 600` for landscape ID cards, `1080 × 1350` for `4:5` posters/portraits, `1080 × 1920` for `9:16` stories).
  2. When loading a template or changing the canvas aspect ratio from $(W_{\text{old}}, H_{\text{old}})$ to $(W_{\text{new}}, H_{\text{new}})$, apply an **Aspect-Aware Layout Reflow Matrix**:
     - Compute uniform scale $s = \min(W_{\text{new}} / W_{\text{old}}, H_{\text{new}} / H_{\text{old}})$ and center offset $(\Delta x, \Delta y) = ((W_{\text{new}} - W_{\text{old}} \cdot s)/2, (H_{\text{new}} - H_{\text{old}} \cdot s)/2)$.
     - Pin background layers (`isBackground: true`) to `0, 0, W_new, H_new`.
     - Pin corner badges and border frames to their respective corner insets (`padding * s`), and scale interior layers cleanly around the canvas center so posters and cards are **always 100% aligned with the card boundaries**.

## 7.6 Three.js (`three`) Interactive 3D Card & Elements Engine
Integrate **`Three.js`** (`three` / `@react-three/fiber` or vanilla `THREE.WebGLRenderer`) for real-time 3D card presentation and 3D depth elements:
1. **Interactive 3D Card Mode (Homepage Hero + `/create` + `/canvas`)**:
   - Add a **`3D View`** toggle button in the top toolbar of `/create` and `/canvas` (and active by default on the Homepage interactive preview).
   - Bind the live 2D card `<canvas>` as a `THREE.CanvasTexture` (`texture.needsUpdate = true`, `texture.anisotropy = renderer.capabilities.getMaxAnisotropy()`).
   - Mount the texture onto a physical 3D rounded card mesh (`RoundedBoxGeometry(width, height, depth: 0.025, segments: 8, radius: cornerRadius)`) with layered paper/plastic core edges.
2. **PBR Surface Material Linked to the 55+ Textures**:
   - Use `THREE.MeshPhysicalMaterial` where `roughness`, `metalness`, `clearcoat`, and `iridescence` update dynamically based on the selected surface texture:
     - *Paper / Archival textures*: `roughness: 0.88`, `metalness: 0.0`, `clearcoat: 0.0` + bump map from the active paper grain canvas.
     - *Glossy PVC ID / Lanyard textures*: `roughness: 0.12`, `clearcoat: 1.0`, `clearcoatRoughness: 0.08`.
     - *Holographic Foil textures*: `iridescence: 1.0`, `iridescenceIOR: 1.3`, `metalness: 0.35`.
3. **3D Parallax Elements on `/canvas`**:
   - Allow users to toggle **`3D Depth Pop (Z-Elevation)`** on any sticker, stamp, avatar photo, or badge layer in `/canvas` so when the card tilts in 3D mode, stamps and badges float `2mm–6mm` above the card surface with realistic cast shadows.

# PART VIII — ULTRA-HD 4K TO 16K EXPORT PIPELINE & THUMBNAIL ISOLATION FIXES (RENDERING ENGINE)

## 8.1 4K Minimum to 16K Ultra-HD Export Architecture
The current export resolution (`1080px` / `2160px`) is too low and looks blurry when zoomed. Upgrade the export engine in `/create` and `/canvas` so **4K is the minimum quality**, with options up to **16K**:

### Export Resolution Tiers
| Tier Label | Target Long-Edge Resolution | Example `4:5 Portrait` Pixel Dimensions | Example `16:9` / ID Card Dimensions |
| :--- | :--- | :--- | :--- |
| **`4K Ultra HD (Minimum Default)`** | `3840 px` | `3072 × 3840 px` | `3840 × 2400 px` |
| **`8K Print Master`** | `7680 px` | `6144 × 7680 px` | `7680 × 4800 px` |
| **`12K Gallery Archival`** | `11520 px` | `9216 × 11520 px` | `11520 × 7200 px` |
| **`16K Studio Extreme`** | `15360 px` | `12288 × 15360 px` | `15360 × 9600 px` |

### High-DPI Vector Re-Rasterization & Tiled 16K Fallback
- **Never upscale a low-res bitmap**: Create an offscreen `<canvas>` at the exact target pixel dimensions $(W_{\text{target}}, H_{\text{target}})$, compute the scale factor $S = W_{\text{target}} / W_{\text{logical}}$, and call `ctx.scale(S, S)` before drawing background fills, procedural surface textures, SVG vectors, and `FontFace` typography so every glyph edge is rendered natively at 4K/8K/16K sharpness.
- **Tiled Rendering for 16K Hardware Safety**: Some browsers/GPUs cap a single canvas at `8192×8192` or `16384×16384`. Detect the browser's maximum canvas dimension (`checkCanvasSupport(width, height)`), and for `16K` exports on constrained GPUs, render in a $2 \times 2$ quadrant tile pass and stream into the output PNG/WebP blob—or automatically clamp to the device's maximum supported hardware texture size while notifying the user.

## 8.2 Three Mandatory Thumbnail & Export Bug Fixes
Fix these three critical bugs immediately:

1. **Bug Fix A — Eliminate Overlapped Text on Exported Images**:
   - **Root Cause**: The export function was either measuring text before custom/web fonts finished loading or miscalculating `lineHeight` multiplied by the export scale factor $S$.
   - **Fix**:
     - Always `await document.fonts.ready` before starting any export or thumbnail generation pass.
     - Perform line wrapping (`wrapTextLines(ctx, text, maxWidth)`) in **logical card coordinates** (`1x` space) while `ctx.scale(S, S)` handles the resolution multiplication uniformly.
     - Enforce minimum vertical collision clearance between the `Header Tag`, `Main Quote Body`, and `Author / Corner Badge` blocks: if a quote is long, automatically step down the font size or expand card height so text blocks **never overlap**.

2. **Bug Fix B — Remove the `"Ratio of the Image"` Badge from Thumbnails & Exported Cards**:
   - **Root Cause**: The aspect-ratio indicator pill (e.g., `"4:5 Portrait"`, `"1:1 Square"`, `"960×600"`) was either rendered inside the card capture container or drawn onto the preview canvas, causing exported images and template thumbnails to include the ratio text on the card itself.
   - **Fix**:
     - Move all aspect-ratio labels, dimension readouts, and zoom badges **strictly outside** the card render node (`#card-capture-root` / `<canvas>`).
     - Neither template thumbnails nor exported PNG/WebP/SVG files may ever contain the aspect ratio text or UI HUD overlays.

3. **Bug Fix C — Pure Card Isolation (Thumbnails = Exact Export, Zero Ambient/Page Gradient Bleed)**:
   - **Rule 1 (Real Thumbnails)**: Every template thumbnail on `/` and `/templates` must be rendered by the exact same pure card renderer used by the export engine so the thumbnail is a **100% faithful preview of the exported card**.
   - **Rule 2 (Zero External Gradient on Export)**: When exporting an image, export **ONLY the card itself** (clipped strictly to the card's exact dimensions and corner radius). Never capture the webpage's 60:30:10 scroll gradient or the editor's YouTube-style Ambient Mode glow in the exported file.

# PART IX — SECONDARY PAGES ARCHITECTURE (`/guides`, `/about`, `/contact`) (UI & CONTENT)

## 9.1 `/guides` — Interactive Page-Turning Aesthetic Book Experience
Completely replace the vertical text-document layout on `/guides`:
1. **Open Book / Editorial Zine Spread Layout**:
   - Render `/guides` as a physical **two-page open book spread** centered on the screen (with a realistic center spine crease shadow, warm archival paper texture from the Surface Library, and stacked page edges along the left and right margins).
   - On mobile (`< 768px`), render a single tactile book page with swipe-left / swipe-right page turning.
2. **Realistic Page-Turning Transitions**:
   - Clicking the right page margin, clicking the square duotone `Next Page →` / `← Prev Page` buttons, or pressing keyboard `ArrowRight` / `ArrowLeft` triggers a smooth **3D CSS perspective page-turn animation** (`transform-origin: left center; transform: rotateY(-180deg); perspective: 1800px;`) revealing the next spread.
3. **Aesthetic Book Design (Zero Wall-of-Text Document Feel)**:
   - Decorate each spread with delicate star ornaments (`✦`, `✧`), chapter numerals in `Murecho` (`CHAPTER I — PROPORTION`), subheadings in `Funnel Sans`, concise 2-sentence rules in `SamsungOne Bold`, visual side-by-side "Do / Don't" mini-cards, and an interactive **`"Try This Rule in Studio →"`** button on every spread.

## 9.2 `/about` — Warm Nano-Textured Format
Redesign `/about` as a tactile, warm-toned nano-textured colophon card:
- **Surface Treatment**: Apply the **`warm-nano-texture-matte`** SVG micro-grain surface filter over a warm archival sand/amber-parchment palette (`#f2eadc` with deep espresso ink `#1a1612` in Light Mode; `#181512` warm obsidian-umber with warm cream `#efe6d5` in Dark Mode).
- **Content**: Keep the text concise, visual, and structured in a **2-Column Grid** (never 3 columns) showcasing:
  1. **Local-First Architecture** (Zero cloud uploads; 100% client-side HTML5 Canvas, SVG, and WebGL/Three.js).
  2. **Archival 4K–16K Output** (55+ procedural surface textures, custom local font uploads, and offline background removal).
- Remove `[Project Maintainer / Organization Placeholder]` completely.

## 9.3 `/contact` — Direct Owner Contact (`ddheerajcarpenter@gmail.com`)
Redesign `/contact` into a clean, focused 2-column contact card:
- Delete `contact@aestheticcardstudio.com` and `[Configurable placeholder email for domain owner]`.
- Wire the official email everywhere on `/contact` and in the footer to:
  - **`ddheerajcarpenter@gmail.com`**
- Include:
  1. **`Send Direct Email`** button (`href="mailto:ddheerajcarpenter@gmail.com?subject=Aesthetic%20Card%20Studio%20Feedback"`) with a square duotone mail icon.
  2. **`Copy Email Address`** button that copies `ddheerajcarpenter@gmail.com` to the clipboard and shows a crisp `"Copied ddheerajcarpenter@gmail.com"` confirmation badge.

# PART X — EXTRA HIGH-CRAFT FEATURES TO ELEVATE THE STUDIO (NON-AI-SLOP POWER TOOLS)

To ensure nothing is missed and the website feels like an award-winning creative tool, include these four high-craft studio utilities:

1. **Automatic Palette Extraction from Uploaded Photos**:
   - When a user uploads a photo onto a card in `/canvas` or `/create`, automatically sample the photo's 5 dominant harmonious colors (using median-cut / k-means quantization on a `64×64` downsampled canvas) and display a **`"Match Card Palette to Photo"`** one-click swatch row in the Palette tab!
2. **Social Safe-Zone & Print Bleed Guides Toggle**:
   - In the top toolbar of `/create` and `/canvas`, add a square duotone **`Safe Zones`** overlay toggle that displays non-printable guide lines for Instagram Reels/Stories UI overlays (`9:16`), Instagram Feed crop (`4:5`), and `3mm` physical print bleed + trim marks (automatically hidden during export).
3. **Interactive Split-Screen "Before / After Texture & Filter Loupe"**:
   - Allow users to hold `Spacebar` (or drag a split comparison slider) over their card to compare raw flat vector vs. their active 55+ surface texture and Three.js lighting in real time.
4. **Local `IndexedDB` Auto-Save & Recent Projects Drawer**:
   - Automatically save the user's active card state and uploaded custom fonts/photos in `IndexedDB` so refreshing the browser never loses work, and add a **`My Saved Cards (Local)`** 2-column drawer so users can keep multiple drafts and recycle elements between cards.

# PART XI — UNABRIDGED PRODUCTION CODE BLUEPRINTS FOR EVERY ENGINE (NO-LIMIT TECHNICAL REFERENCE)

Give your coding agent the exact reference implementations below when executing Parts II through IX so it never guesses or writes buggy boilerplate.

## 11.1 Reference Implementation: YouTube-Style Ambient Mode Engine (Strictly Isolated from Export)
```typescript
// src/engines/ambientStageEngine.ts
export interface RGBTriplet {
  r: number;
  g: number;
  b: number;
}

/**
 * Samples the active card canvas to extract 3 harmonious ambient tones
 * (Top-Left/Primary, Center/Midtone, Bottom-Right/Accent) and applies them
 * ONLY to the outer workspace wrapper (.editor-ambient-stage), NEVER to the card canvas.
 */
export function updateWorkspaceAmbientBackdrop(
  cardCanvas: HTMLCanvasElement,
  ambientWrapperEl: HTMLElement | null,
  enabled: boolean
): void {
  if (!ambientWrapperEl) return;
  if (!enabled) {
    ambientWrapperEl.style.setProperty('--ambient-opacity', '0');
    return;
  }

  const sampleCanvas = document.createElement('canvas');
  sampleCanvas.width = 16;
  sampleCanvas.height = 16;
  const sCtx = sampleCanvas.getContext('2d', { willReadFrequently: true });
  if (!sCtx) return;

  sCtx.drawImage(cardCanvas, 0, 0, 16, 16);
  const data = sCtx.getImageData(0, 0, 16, 16).data;

  const pickPixel = (x: number, y: number): string => {
    const idx = (y * 16 + x) * 4;
    return `${data[idx]}, ${data[idx + 1]}, ${data[idx + 2]}`;
  };

  const c1 = pickPixel(3, 3);
  const c2 = pickPixel(8, 8);
  const c3 = pickPixel(12, 12);

  ambientWrapperEl.style.setProperty('--ambient-c1', c1);
  ambientWrapperEl.style.setProperty('--ambient-c2', c2);
  ambientWrapperEl.style.setProperty('--ambient-c3', c3);
  ambientWrapperEl.style.setProperty('--ambient-opacity', '0.42');
}
```

```css
/* Outer Editor Stage Only — Never Inside #card-export-surface */
.editor-ambient-stage {
  position: relative;
  isolation: isolate;
  overflow: hidden;
}

.editor-ambient-stage::before {
  content: '';
  position: absolute;
  inset: -12%;
  z-index: -1;
  pointer-events: none;
  opacity: var(--ambient-opacity, 0.42);
  transition: opacity 320ms ease, background 400ms ease;
  background:
    radial-gradient(circle at 25% 25%, rgba(var(--ambient-c1, 229, 184, 75), 0.38) 0%, transparent 55%),
    radial-gradient(circle at 50% 50%, rgba(var(--ambient-c2, 244, 237, 228), 0.26) 0%, transparent 60%),
    radial-gradient(circle at 75% 75%, rgba(var(--ambient-c3, 184, 93, 59), 0.34) 0%, transparent 55%);
  filter: blur(48px); /* Confined strictly to the YouTube-style workspace stage behind the card */
}
```

## 11.2 Reference Implementation: Fix `Replace Photo` + Offline Background Removal (`@imgly/background-removal`)
```typescript
// src/engines/canvasPhotoOperations.ts
export interface CanvasImageLayer {
  id: string;
  type: 'image';
  name: string;
  src: string;
  imageElement?: HTMLImageElement;
  x: number;
  y: number;
  width: number;
  height: number;
  naturalWidth: number;
  naturalHeight: number;
  rotation: number;
  opacity: number;
  clipMask: 'none' | 'rounded' | 'circle' | 'star' | 'heart' | 'id-frame';
  filterPreset: 'original' | 'dither-1bit' | 'photocopy' | 'duotone' | 'film-90s';
  zIndex: number;
}

/**
 * BUG FIX: Replaces the photo of an existing image layer IN-PLACE while preserving
 * all template coordinates, dimensions, rotation, mask, and z-index.
 */
export async function replaceLayerPhotoInPlace(
  layers: CanvasImageLayer[],
  targetLayerId: string,
  newFile: File
): Promise<CanvasImageLayer[]> {
  const objectUrl = URL.createObjectURL(newFile);
  const img = await loadImageElement(objectUrl);

  return layers.map((layer) => {
    if (layer.id !== targetLayerId) return layer;
    return {
      ...layer,
      src: objectUrl,
      imageElement: img,
      naturalWidth: img.naturalWidth || img.width,
      naturalHeight: img.naturalHeight || img.height,
      // Explicitly preserve x, y, width, height, rotation, clipMask, filterPreset, zIndex
    };
  });
}

/**
 * OFFLINE WEB API BACKGROUND REMOVAL:
 * Runs 100% locally in the browser using WebAssembly / WebGPU segmentation.
 */
export async function removeLayerBackgroundOffline(
  layer: CanvasImageLayer,
  onProgress?: (percent: number) => void
): Promise<{ updatedSrc: string; updatedImg: HTMLImageElement }> {
  const { removeBackground } = await import('@imgly/background-removal');

  const resultBlob = await removeBackground(layer.src, {
    model: 'medium',
    output: { format: 'image/png', quality: 1.0 },
    progress: (_key: string, current: number, total: number) => {
      if (total > 0 && onProgress) {
        onProgress(Math.round((current / total) * 100));
      }
    },
  });

  const updatedSrc = URL.createObjectURL(resultBlob);
  const updatedImg = await loadImageElement(updatedSrc);
  return { updatedSrc, updatedImg };
}

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}
```

## 11.3 Reference Implementation: Magnetic Grid Snapping & Poster/Card Dimension Alignment Fix
```typescript
// src/engines/canvasGridAndDimensionEngine.ts
export interface SnapGuide {
  axis: 'x' | 'y';
  position: number;
  label?: string;
}

export function computeMagneticGridSnap(
  activeBox: { x: number; y: number; width: number; height: number },
  otherBoxes: Array<{ id: string; x: number; y: number; width: number; height: number }>,
  canvasWidth: number,
  canvasHeight: number,
  thresholdPx = 6
): { snappedX: number; snappedY: number; guides: SnapGuide[] } {
  let snappedX = activeBox.x;
  let snappedY = activeBox.y;
  const guides: SnapGuide[] = [];

  // Candidate X snap lines: Canvas edges, Center (50%), Quarter Grid (25%, 75%), and 8px modular grid
  const xTargets: number[] = [0, canvasWidth * 0.25, canvasWidth * 0.5, canvasWidth * 0.75, canvasWidth];
  const yTargets: number[] = [0, canvasHeight * 0.25, canvasHeight * 0.5, canvasHeight * 0.75, canvasHeight];

  for (const box of otherBoxes) {
    xTargets.push(box.x, box.x + box.width / 2, box.x + box.width);
    yTargets.push(box.y, box.y + box.height / 2, box.y + box.height);
  }

  const activeXPoints = [
    { offset: 0, value: activeBox.x },
    { offset: activeBox.width / 2, value: activeBox.x + activeBox.width / 2 },
    { offset: activeBox.width, value: activeBox.x + activeBox.width },
  ];

  for (const pt of activeXPoints) {
    for (const target of xTargets) {
      if (Math.abs(pt.value - target) <= thresholdPx) {
        snappedX = target - pt.offset;
        guides.push({ axis: 'x', position: target });
        break;
      }
    }
  }

  const activeYPoints = [
    { offset: 0, value: activeBox.y },
    { offset: activeBox.height / 2, value: activeBox.y + activeBox.height / 2 },
    { offset: activeBox.height, value: activeBox.y + activeBox.height },
  ];

  for (const pt of activeYPoints) {
    for (const target of yTargets) {
      if (Math.abs(pt.value - target) <= thresholdPx) {
        snappedY = target - pt.offset;
        guides.push({ axis: 'y', position: target });
        break;
      }
    }
  }

  return { snappedX, snappedY, guides };
}

/**
 * BUG FIX: Normalizes Poster and Card templates when switching canvas dimensions
 * so posters and cards are ALWAYS aligned with the card boundaries without clipping.
 */
export function normalizeTemplateDimensions<T extends {
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
  isBackground?: boolean;
}>(
  layers: T[],
  fromWidth: number,
  fromHeight: number,
  toWidth: number,
  toHeight: number
): T[] {
  if (fromWidth === toWidth && fromHeight === toHeight) return layers;

  const uniformScale = Math.min(toWidth / fromWidth, toHeight / fromHeight);
  const offsetX = (toWidth - fromWidth * uniformScale) / 2;
  const offsetY = (toHeight - fromHeight * uniformScale) / 2;

  return layers.map((layer) => {
    if (layer.isBackground) {
      return {
        ...layer,
        x: 0,
        y: 0,
        width: toWidth,
        height: toHeight,
      };
    }

    return {
      ...layer,
      x: Math.round(layer.x * uniformScale + offsetX),
      y: Math.round(layer.y * uniformScale + offsetY),
      width: Math.round(layer.width * uniformScale),
      height: Math.round(layer.height * uniformScale),
      fontSize: layer.fontSize ? Math.round(layer.fontSize * uniformScale * 10) / 10 : undefined,
    };
  });
}
```

## 11.4 Reference Implementation: Pure 4K–16K Ultra-HD Export Engine (Zero Overlap, Zero Ratio Label, Zero Gradient Bleed)
```typescript
// src/engines/ultraHdExportEngine.ts
export type ExportResolutionTier = '4K' | '8K' | '12K' | '16K';

const TIER_LONG_EDGE: Record<ExportResolutionTier, number> = {
  '4K': 3840,   // Minimum Default Quality
  '8K': 7680,
  '12K': 11520,
  '16K': 15360, // Maximum Studio Extreme Quality
};

/**
 * Renders ONLY the pure card (no aspect-ratio badge, no ambient background gradient,
 * no text overlap) at true 4K to 16K resolution.
 */
export async function exportPureCardUltraHD(
  logicalWidth: number,
  logicalHeight: number,
  tier: ExportResolutionTier = '4K',
  format: 'image/png' | 'image/webp' = 'image/png',
  renderCardInLogicalSpace: (ctx: CanvasRenderingContext2D, w: number, h: number) => Promise<void> | void
): Promise<Blob> {
  // 1. Ensure all Google Fonts + Custom Uploaded Fonts are 100% ready to prevent text overlap
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }

  const targetLongEdge = TIER_LONG_EDGE[tier];
  const currentLongEdge = Math.max(logicalWidth, logicalHeight);
  const desiredScale = targetLongEdge / currentLongEdge;

  // 2. Check hardware max canvas dimension so 16K never crashes mobile/laptop GPUs
  const maxSafeDim = detectMaxCanvasDimension();
  const safeScale = Math.min(
    desiredScale,
    maxSafeDim / logicalWidth,
    maxSafeDim / logicalHeight
  );

  const exportWidth = Math.round(logicalWidth * safeScale);
  const exportHeight = Math.round(logicalHeight * safeScale);

  const offscreen = document.createElement('canvas');
  offscreen.width = exportWidth;
  offscreen.height = exportHeight;

  const ctx = offscreen.getContext('2d', { alpha: true, desynchronized: false });
  if (!ctx) {
    throw new Error('Failed to initialize high-resolution export context.');
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // 3. Clear offscreen buffer completely so ZERO ambient or page gradient ever leaks in
  ctx.clearRect(0, 0, exportWidth, exportHeight);

  // 4. Scale context uniformly so line-wrapping and coordinates match the preview 1:1
  ctx.save();
  ctx.scale(safeScale, safeScale);

  // 5. Execute pure card render pass (strictly excluding UI HUD or "4:5 Portrait" ratio badges)
  await renderCardInLogicalSpace(ctx, logicalWidth, logicalHeight);
  ctx.restore();

  return new Promise<Blob>((resolve, reject) => {
    offscreen.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas encoding failed at target resolution.'));
      },
      format,
      1.0
    );
  });
}

function detectMaxCanvasDimension(): number {
  // Most modern desktop GPUs support 16384px; fallback safely if constrained
  const testSizes = [16384, 12288, 8192, 4096];
  for (const size of testSizes) {
    try {
      const c = document.createElement('canvas');
      c.width = size;
      c.height = 64;
      const ctx = c.getContext('2d');
      if (ctx) return size;
    } catch {
      // Try next smaller size
    }
  }
  return 4096;
}
```

## 11.5 Reference Implementation: `Three.js` Physical 3D Card Stage
```typescript
// src/engines/threeCardStage.ts
import * as THREE from 'three';

export interface ThreeCardMaterialPreset {
  roughness: number;
  metalness: number;
  clearcoat: number;
  clearcoatRoughness: number;
  iridescence: number;
}

export function getThreeMaterialForSurface(surfaceId: string): ThreeCardMaterialPreset {
  if (surfaceId.includes('holo') || surfaceId.includes('rainbow') || surfaceId.includes('prismatic')) {
    return { roughness: 0.18, metalness: 0.35, clearcoat: 0.9, clearcoatRoughness: 0.1, iridescence: 1.0 };
  }
  if (surfaceId.includes('pvc') || surfaceId.includes('glossy') || surfaceId.includes('lanyard')) {
    return { roughness: 0.1, metalness: 0.05, clearcoat: 1.0, clearcoatRoughness: 0.05, iridescence: 0.15 };
  }
  if (surfaceId.includes('titanium') || surfaceId.includes('chrome') || surfaceId.includes('gold')) {
    return { roughness: 0.25, metalness: 0.82, clearcoat: 0.4, clearcoatRoughness: 0.2, iridescence: 0.0 };
  }
  // Default: Tactile Archival / Nano-Textured Paper
  return { roughness: 0.86, metalness: 0.0, clearcoat: 0.0, clearcoatRoughness: 0.9, iridescence: 0.0 };
}

export function createThreeCardPreviewScene(
  mountEl: HTMLElement,
  sourceCardCanvas: HTMLCanvasElement,
  aspectRatioWidth: number,
  aspectRatioHeight: number,
  surfaceId: string
) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, mountEl.clientWidth / mountEl.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 4.2);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(mountEl.clientWidth, mountEl.clientHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  mountEl.innerHTML = '';
  mountEl.appendChild(renderer.domElement);

  const cardTexture = new THREE.CanvasTexture(sourceCardCanvas);
  cardTexture.colorSpace = THREE.SRGBColorSpace;
  cardTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

  const normW = 1.8 * (aspectRatioWidth / Math.max(aspectRatioWidth, aspectRatioHeight));
  const normH = 1.8 * (aspectRatioHeight / Math.max(aspectRatioWidth, aspectRatioHeight));

  const geometry = new THREE.BoxGeometry(normW, normH, 0.018);
  const matProps = getThreeMaterialForSurface(surfaceId);

  const frontMaterial = new THREE.MeshPhysicalMaterial({
    map: cardTexture,
    ...matProps,
  });

  const edgeMaterial = new THREE.MeshStandardMaterial({
    color: 0xeae2d3,
    roughness: 0.9,
  });

  const cardMesh = new THREE.Mesh(geometry, [
    edgeMaterial, // right
    edgeMaterial, // left
    edgeMaterial, // top
    edgeMaterial, // bottom
    frontMaterial, // front face
    edgeMaterial, // back face
  ]);
  scene.add(cardMesh);

  const ambientLight = new THREE.AmbientLight(0xffffff, 1.35);
  const keyLight = new THREE.DirectionalLight(0xfff8eb, 1.8);
  keyLight.position.set(2.5, 3.2, 4.0);
  const rimLight = new THREE.DirectionalLight(0xe5b84b, 0.65);
  rimLight.position.set(-3.0, -2.0, 2.0);
  scene.add(ambientLight, keyLight, rimLight);

  let targetRotX = 0;
  let targetRotY = 0;

  const onPointerMove = (e: PointerEvent) => {
    const rect = mountEl.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    targetRotY = nx * 0.28;
    targetRotX = -ny * 0.22;
  };

  const onPointerLeave = () => {
    targetRotX = 0;
    targetRotY = 0;
  };

  mountEl.addEventListener('pointermove', onPointerMove);
  mountEl.addEventListener('pointerleave', onPointerLeave);

  let animId = 0;
  const animate = () => {
    animId = requestAnimationFrame(animate);
    cardMesh.rotation.x += (targetRotX - cardMesh.rotation.x) * 0.1;
    cardMesh.rotation.y += (targetRotY - cardMesh.rotation.y) * 0.1;
    cardTexture.needsUpdate = true;
    renderer.render(scene, camera);
  };
  animate();

  return () => {
    cancelAnimationFrame(animId);
    mountEl.removeEventListener('pointermove', onPointerMove);
    mountEl.removeEventListener('pointerleave', onPointerLeave);
    renderer.dispose();
  };
}
```

---

# PART XI — COMPREHENSIVE EDITORIAL STUDIO REDESIGN & AUDIT DIRECTIVE

## 11.1 Master Design System Decisions
1. **Color System & Saturated Yellow Elimination**:
   - Replaced Binance-derived electric yellow (`#fcd535`, `#facc15`, `#d97706`) across all primary UI chrome, focus indicators, range sliders, and active tabs.
   - Established restrained editorial palette:
     - Primary Canvas: Deep charcoal (`#0c0e12`)
     - Elevated Surfaces: Dark graphite & slate (`#12151b`, `#161920`, `#1e232b`)
     - Primary Accent: Warm bone / muted champagne (`#E2D9C8`), ink (`#111417`), hover (`#ece5d8`)
     - Text Primary: Soft white (`#f4f1ea`)
     - Text Secondary: Slate grey (`#94a3b8`)
     - Subtle Dividers: Low-contrast slate (`#222731`, `#2e3543`)
   - Card content artwork and preset swatches remain autonomous and uncompromised.

2. **Hero & Conversion Hierarchy**:
   - Dominant primary CTA: **"Open Card Creator"** (`bg-[#E2D9C8] text-[#111417]`).
   - Demoted secondary CTA: **"Launch Freeform Canvas"** styled as an understated ghost button (`bg-[#161920] border-[#222731] text-[#f4f1ea]`).
   - Tightened hero vertical rhythm (`py-10 sm:py-16`) to bring tangible card previews above the fold.

3. **Mobile Viewport Cannibalization Fix**:
   - Redesigned the cookie consent dialog from an oversized full-width overlay (which covered ~40% of mobile screens) into a compact, floating bottom banner consuming `< 8%` of the viewport.
   - Floats above the 64px mobile navigation bar with dynamic safe area calculation: `bottom-[calc(64px+env(safe-area-inset-bottom,8px))]`.
   - Clear decisions: "Accept" (bone accent) and understated "Decline" link.

4. **Excising Indefinite Placeholders**:
   - Eliminated indefinite "LOADING SURFACE..." and fake blueprint card mockups.
   - Implemented aspect-ratio-stable skeleton containers that preserve layout geometry without layout shifting.

5. **Normalized Header & Utility Ergonomics**:
   - Standardized all header controls (search, theme switch, navigation links) to `36px` (`h-9`) containers with consistent border radii and duotone stroke weights.
   - Added `Esc` keyboard shortcut handlers to cleanly dismiss search dropdowns and modal drawers.

6. **Full Functional Integrity Preserved**:
   - 100% of functional capabilities intact: 3D WebGL card stage with cursor-tracking PBR tilt, local IndexedDB custom font manager, WebAssembly offline photo background removal, procedural SVG texture filters, and 4K/8K/16K Ultra-HD export engines.

7. **Architectural Decoupling: Application UI Colors Separated from Canvas Palettes**:
   - Strictly isolated `--app-*` tokens (`--app-bg: #101114`, `--app-surface: #181A1E`, `--app-surface-secondary: #202228`, `--app-text-primary: #F1F0EC`, `--app-text-secondary: #AAA9A4`, `--app-border-subtle: #34353A`, `--app-accent: #E2D9C8`, `--app-accent-ink: #171717`) from dynamic card document state.
   - Excised `workspaceBackdropColor` in `CanvasEditorView.tsx` and removed dynamic `--workspace-backdrop` mutation in `ambientStageEngine.ts`.
   - Verified invariant: switching card palettes between cream, burgundy, celadon, acid yellow, or dark minimal leaves surrounding header, toolbars, inspector, navigation, and workspace stage background completely unchanged.

8. **Technical SEO Architecture: Sitemap.xml & Robots.txt Synchronized**:
   - `public/sitemap.xml`: Fully synchronized with all 28 production application routes (including all 9 template categories from `categories.ts`, all 7 educational guides from `guides.ts`, all 5 editorial blog articles from `blog.ts`, and core legal/trust pages). All `<lastmod>` timestamps updated to `2026-10-18`.
   - `public/robots.txt`: Explicitly updated with `Host: https://aestheticcardgenerator.pages.dev` and canonical sitemap index link.


