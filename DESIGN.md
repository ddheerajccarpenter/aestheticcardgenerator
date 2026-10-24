# Aesthetic Card Studio — Editorial Design System Specification

---
version: 2.0.0-editorial
name: Aesthetic-Card-Studio-Editorial-Design-System
description: The official design system for Aesthetic Card Generator (aestheticcardgenerator.pages.dev). Formulated around tactile editorial craftsmanship, deep charcoal canvas surfaces, restrained warm bone/champagne primary accents (#E2D9C8), high-precision typography (Murecho, Funnel Sans, SamsungOne), zero AI slop, and a mobile-first responsive architecture.
---

## 1. Executive Summary & Design Philosophy

The Aesthetic Card Generator interface is engineered as an **editorial-grade creative studio** designed for typographers, curators, authors, and visual artists. It rejects generic SaaS dashboards, artificial AI-generated templates, and saturated marketing accents in favor of a restrained, tactile, and physically grounded aesthetic.

### Core Principles
1. **Restraint & Craftsmanship**: Visual weight is carried by typography and user artwork, not loud UI chrome. Primary accents use warm bone/champagne (`#E2D9C8`) rather than high-voltage neon yellow or saturated gold.
2. **Tactile Materiality**: Real procedural paper grain, cold-press watercolor tooth, metallic leaf, and physical 3D PBR viewport rendering. Zero indefinite blueprint placeholders.
3. **Ergonomic Hierarchy**: Exactly one dominant primary action per viewport. "Open Card Creator" serves as the primary gateway, with "Launch Freeform Canvas" positioned as an understated secondary workflow.
4. **Mobile-First Integrity**: The mobile experience preserves full creative capabilities without viewport cannibalization. The cookie consent interface is a compact floating card consuming less than 8% of the viewport.
5. **Universal Accessibility**: Strict WCAG AA+ contrast on all text and interactive controls, keyboard navigation with visible bone focus rings, Esc-to-close modals, and full `@media (prefers-reduced-motion)` compliance.

---

## 2. Color System & Architectural Separation

### 2.0 Architectural Rule: Strict Separation of Application Colors from Canvas Colors
**Non-negotiable architectural invariant**: The application UI maintains an independent, stable color system. The editable artwork/canvas maintains a separate, user-controlled color system. Selecting a different canvas palette (e.g., pink, yellow, blue, cream, burgundy) MUST NOT mutate or recolor global UI tokens, toolbars, navigation, inspectors, dialogs, or stage backdrops.

```
┌──────────────────────────────────────────────┐
│  APPLICATION UI TOKENS (--app-*)             │
│  Fixed charcoal, slate & warm bone palette   │
│  - Navigation, toolbars, dialogs, inspectors │
└──────────────────────────────────────────────┘
                       ≠
┌──────────────────────────────────────────────┐
│  CANVAS / ARTWORK TOKENS (--canvas-*)        │
│  User-chosen card background, ink & accents  │
│  - Confined strictly to the card boundary    │
└──────────────────────────────────────────────┘
```

### 2.1 Dark Mode (Primary Studio Canvas)
| Token Name | Value | Purpose |
| :--- | :--- | :--- |
| `--app-bg` / `--color-canvas` | `#101114` | Primary near-black studio canvas background |
| `--app-surface` / `--color-surface` | `#181A1E` | Elevated application surface (header, inspector, dock) |
| `--app-surface-secondary` | `#202228` | Secondary interactive containers & toolbars |
| `--app-border-subtle` | `#34353A` | Subtle structural borders and dividers |
| `--app-border-strong` | `#44454c` | Active borders and focus indicators |
| `--app-accent` / `--color-accent` | `#E2D9C8` | **Warm bone / champagne** primary action accent |
| `--app-accent-hover` | `#ece5d8` | Hover state for primary actions |
| `--app-accent-ink` | `#171717` | High-contrast dark text on bone accent buttons |
| `--app-text-primary` | `#F1F0EC` | Primary soft-white display titles and headings |
| `--app-text-secondary` | `#AAA9A4` | Secondary slate grey for body copy and controls |
| `--app-text-muted` | `#787980` | Low-emphasis annotations, shortcuts, and captions |

### 2.2 Light Mode (Transactional / High-Key)
| Token Name | Value | Purpose |
| :--- | :--- | :--- |
| `--app-bg` / `--color-canvas-light` | `#f8fafc` | Clean slate-white canvas |
| `--app-surface` / `--color-surface-light`| `#ffffff` | Pure white container cards and modals |
| `--app-surface-secondary` | `#f1f5f9` | Light slate toolbars, secondary buttons |
| `--app-border-subtle` | `#e2e8f0` | Crisp dividers and panel borders |
| `--app-accent` | `#171717` | Deep near-black primary action button |
| `--app-accent-ink` | `#ffffff` | Pure white ink on light-mode primary buttons |
| `--app-text-primary` | `#101114` | Deep obsidian ink for display and headings |
| `--app-text-secondary` | `#475569` | Mid-tone slate for body text and controls |

### 2.3 Semantic Accents & Status Indicators
| Status | Dark Mode | Light Mode | Application |
| :--- | :--- | :--- | :--- |
| **Info / Selection** | `#38bdf8` / `#60a5fa` | `#0284c7` | CAD alignment guides, selection indicators |
| **Success** | `#10b981` | `#059669` | Export completed, clipboard copy confirmation |
| **Warning** | `#f59e0b` | `#d97706` | Social safe zone warning, file size alert |
| **Danger** | `#f43f5e` | `#e11d48` | Delete layer, reset document confirmation |

---

## 3. Typographic Hierarchy

The typography system deploys three distinct, harmonious font families:

```
Headings & Display  ──>  Murecho (Weights 700, 800, 900)
Subheadings & Nav   ──>  Funnel Sans (Weights 500, 600, 700)
Body, Sliders & UI  ──>  SamsungOne / One UI Sans (Weights 600, 700)
```

### 3.1 Scale & Hierarchy Matrix
| Role | Font Family | Size | Weight | Tracking | Line Height | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero Display** | Murecho | `3.5rem` (56px) | 800 | `-0.03em` | 1.08 | Homepage primary proposition |
| **Display XL** | Murecho | `2.5rem` (40px) | 800 | `-0.025em` | 1.15 | Studio headline, category title |
| **Section Title** | Murecho | `1.75rem` (28px) | 700 | `-0.02em` | 1.25 | Feature sections, guide headers |
| **Subheading** | Funnel Sans | `1.125rem` (18px) | 600 | `-0.01em` | 1.35 | Card titles, modal subtitles |
| **Nav & Tabs** | Funnel Sans | `0.875rem` (14px) | 600 | `0.005em` | 1.4 | Navigation items, category tabs |
| **Micro Labels** | Funnel Sans | `0.6875rem` (11px)| 700 | `0.06em` | 1.2 | Uppercase aspect badges, shortcut keys |
| **Body Large** | SamsungOne | `1.0rem` (16px) | 600 | `0` | 1.55 | Introductory paragraphs |
| **Body Regular** | SamsungOne | `0.875rem` (14px) | 600 | `0` | 1.5 | General descriptions, legal text |
| **UI Controls** | SamsungOne | `0.75rem` (12px) | 700 | `0.01em` | 1.4 | Range slider values, tooltips, buttons |

---

## 4. Header & Navigation Architecture

### 4.1 Layout & Optical Alignment
- **Fixed Height**: `60px` (`h-[60px]`) with `backdrop-blur-md` and `z-50`.
- **Containers**: All interactive utility controls (Search, Theme Switch, Clear, Navigation links) use normalized `36px` (`h-9`) containers with consistent `rounded-lg` geometry.
- **Brand Mark**: Clean geometric duotone icon paired with `Funnel Sans` tracking `tracking-tight` typography.
- **Search Dropdown**:
  - Modal overlay with Escape-key dismiss.
  - Live query highlighting.
  - Categorized template search results with keyboard selection.
- **Mobile Menu**:
  - Unrolls cleanly without jumping or obscuring active viewports.
  - Direct routes to Card Creator, Canvas Studio, Templates, and Guides.

---

## 5. Hero & Conversion Hierarchy

### 5.1 Value Proposition & Copy
- **Proposition**: *"Design quote cards, posters, and aesthetic IDs."*
- **Supporting Narrative**: *"Set crisp typography on 50+ tactile paper and holographic surfaces, or build multi-layer cards in the studio. Runs 100% in your browser."*
- **Padding**: Controlled vertical rhythm (`py-10 sm:py-16`) replacing oversized empty gaps.

### 5.2 CTA Action Hierarchy
1. **Primary Dominant CTA**:
   - Label: **"Open Card Creator"**
   - Style: Bone accent button (`bg-[#E2D9C8] text-[#111417] hover:bg-[#ece5d8] active:scale-[0.98] shadow-sm font-bold`).
   - Sizing: `px-6 py-3.5 rounded-xl text-sm`.
2. **Secondary Ghost CTA**:
   - Label: **"Launch Freeform Canvas"**
   - Style: Understated slate container (`bg-[#161920] hover:bg-[#1e232b] text-[#f4f1ea] border border-[#222731] active:scale-[0.98] font-semibold`).
   - Sizing: Matches primary dimensions for geometric symmetry without competing for visual hierarchy.

---

## 6. Mobile Viewport & Consent UI Architecture

### 6.1 Viewport Cannibalization Solution
- **The Problem**: Traditional full-width mobile cookie dialogs consumed 40%+ of the visible screen, covering hero CTAs and interactive canvases.
- **The Solution**: Compact floating bottom banner (`src/components/CookieConsentBanner.tsx`):
  - On Mobile: Positioned dynamically above the mobile bottom nav bar (`bottom-[calc(64px+env(safe-area-inset-bottom,8px))]`).
  - Screen Footprint: Limited to `< 8%` of the active viewport.
  - Layout: Horizontal compact bar with concise notice (*"We use local browser storage to persist custom fonts and design preferences."*), an understated **"Decline"** link, and a crisp **"Accept"** button.
  - Persistence: Saved in `localStorage` under `card_studio_cookie_consent_v2`.

### 6.2 Mobile Bottom Navigation
- Fixed 64px bottom bar with safe-area bottom insets (`env(safe-area-inset-bottom)`).
- 4 primary destinations: Home, Card Creator, Studio Canvas, Templates.
- Active state indicated with `#E2D9C8` bone icon and typography.

---

## 7. Lifecycle States & Stability

### 7.1 Lifecycle Progression
1. **Initial / Mount**: Neutral aspect-ratio-stable skeleton container matching the final dimensions (`aspect-square`, `aspect-[4/5]`, `aspect-[9/16]`).
2. **Loading**: Subtle pulse transition without layout shifting (`layout shift score = 0.00`).
3. **Success**: Rendered procedural texture, high-resolution card artwork, or active WebGL canvas.
4. **Empty State**: Purposeful editorial explanation with an immediate recovery action (e.g., *"No layers selected — tap an element on the canvas"* or *"No templates matched your query — clear filters"*).
5. **Error State**: Safe local fallback with explicit retry trigger.

### 7.2 Zero Fake Placeholders
- **Excised**: Indefinite "LOADING SURFACE..." blueprint mocks and decorative fake badges.
- **Enforced**: True procedural SVG feTurbulence filters, real Three.js PBR specular highlights, and active WebAssembly background removal.

---

## 8. Component Design Language

### 8.1 Primary Button (`button-primary`)
- Default: `bg-[#E2D9C8] text-[#111417] border border-[#E2D9C8] font-bold`
- Hover: `bg-[#ece5d8]`
- Active: `scale-[0.98] transition-transform duration-100`
- Focus: `ring-2 ring-[#E2D9C8] ring-offset-2 ring-offset-[#0c0e12]`

### 8.2 Secondary Button (`button-secondary`)
- Default: `bg-[#161920] text-[#f4f1ea] border border-[#222731] font-semibold`
- Hover: `bg-[#1e232b] border-[#2e3543]`
- Active: `scale-[0.98]`
- Focus: `ring-2 ring-[#2e3543] ring-offset-2 ring-offset-[#0c0e12]`

### 8.3 Form Controls & Range Sliders
- Input fields: `bg-[#12151b] border-[#222731] text-[#f4f1ea] focus:border-[#E2D9C8] focus:ring-1 focus:ring-[#E2D9C8]`
- Sliders: Accent track tinted with `--color-accent` (`#E2D9C8`), thumb styled with high-contrast bone indicator.
- Tabs & Category Filter Chips:
  - Active: `bg-[#E2D9C8] text-[#111417] font-bold shadow-sm`
  - Inactive: `bg-[#161920] text-[#94a3b8] hover:bg-[#1e232b] hover:text-[#f4f1ea]`

---

## 9. Animation & Motion Standards

- **Principle**: Purposeful micro-transitions reinforcing spatial hierarchy. No gratuitous bounces, parallax loops, or GPU-heavy blur animations.
- **Timing**: `140ms` to `200ms` with `cubic-bezier(0.16, 1, 0.3, 1)` easing.
- **Reduced Motion Support**:
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
  ```

---

## 10. Verification & Quality Checklist

- [x] Saturated yellow removed from all primary interface chrome.
- [x] Restrained bone/champagne accent (`#E2D9C8`) active across all views.
- [x] Three-tier typography hierarchy enforced (`Murecho`, `Funnel Sans`, `SamsungOne`).
- [x] Hero CTA hierarchy established: Open Card Creator dominant, Launch Canvas secondary.
- [x] Outlined square container around right-arrow glyph removed; clean aligned Lucide icons deployed.
- [x] Application UI colors strictly decoupled from editable canvas/card palettes.
- [x] Workspace stage background pinned to `--app-bg` (`#101114` / `#f8fafc`), eliminating stage recoloring.
- [x] Mobile consent UI footprint reduced from 40% to < 8% floating card.
- [x] Indefinite blueprint placeholders replaced with stable skeletons.
- [x] `public/sitemap.xml` fully synchronized with all 28 active routes and current `2026-10-18` timestamp.
- [x] `public/robots.txt` updated with Host directive and sitemap index.
- [x] 100% of functional capabilities preserved (3D tilt, PBR, 55+ textures, 16K export).
- [x] Clean TypeScript build (`tsc -b && vite build`) and lint passing.
