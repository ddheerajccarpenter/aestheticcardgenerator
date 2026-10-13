# Aesthetic Text-to-Card Generator

> **Start with words. Choose a design. Make it yours. Export it.**

An elegant, browser-based **text-to-card generator** featuring a curated preloaded design library and a live interactive canvas editor. Users can input or paste quotes, poems, reviews, or announcements, select from distinct art-directed templates, customize design layers directly on the canvas, and export high-resolution cards locally.

---

## Important Project & Wireframe Notices

### 1. Wireframe Images are Structural References Only (Not App Content)
The two UI mockups provided in the repository:
- [`asthethiccardgenerator ui 2.png`](./asthethiccardgenerator%20ui%202.png)
- [`ui for astheticcardgenerateor.png`](./ui%20for%20astheticcardgenerateor.png)

> [!IMPORTANT]
> **Wireframe Reference Notice:**
> These images are provided **strictly as layout, spatial, and wireframe references** (to inform the split-pane layout, property panel hierarchy, canvas zoom/pan controls, and responsive UI structure).
> - **DO NOT** use the images as static app content, placeholder cards, or hardcoded dummy copy.
> - The application generates dynamic, fully editable cards driven by user input and structured template definitions.

### 2. Mandatory Change Documentation Policy
> [!IMPORTANT]
> **All Web App Modifications Must Be Documented Here:**
> Any time code, UI components, design tokens, features, state models, or dependencies are added, updated, or refactored anywhere in the web app, they **must be documented and explained in this `README.md` file** under the [Changelog & Architecture Decision Records](#changelog--architecture-decision-records-adrs) section.
> This guarantees an exemplary, production-grade GitHub repository with transparent version tracking.

---

## Design System

The application UI and styling follow the comprehensive unified design system specified in [`DESIGN.md`](./DESIGN.md), which synthesizes:
- **Unified Foundation**: Strict 4px mathematical spatial grid, flat color-block depth hierarchy, 1px hairline boundaries, WCAG AAA touch targets, and default/active state discipline.
- **Dialect A (Airtable Editorial)**: Pure white canvas (`#ffffff`), relaxed 96px vertical section rhythm, near-black primary CTA (`#181d26`), Haas Grotesk typography, and vivid signature cards in coral, forest, cream, peach, and mint.
- **Dialect B (Binance Financial & Trading)**: Deep dark canvas (`#0b0e11`) with light transactional mode (`#ffffff`), electric Binance Yellow (`#FCD535`) primary CTAs, BinanceNova + BinancePlex tabular typography, and trading green/red indicators.

---

## Core Product Principles & Constraints

- **Static-First & Client-Side Only**: The entire editor, template engine, canvas state, and export pipeline run 100% in the user's browser.
- **Zero Backend / Zero Database**: No servers, no authentication, no accounts, and no cloud databases.
- **Zero External AI / API Dependencies**: No third-party API keys or external generation microservices required.
- **Local-First Privacy**: User text and uploaded personal images remain strictly on the local device and are never sent over the wire.
- **Structured Vector Canvas**: Templates are structured, versionable JSON layer trees (not flattened raster graphics), allowing freeform text, color, font, and layout customization.

---

## User Workflow

```
[1. Input Text] ---> [2. Select Template] ---> [3. Live Canvas Edit] ---> [4. Review & Export]
   Paste quote,         Filter 25-40 art          Adjust typography,         Overflow warning check,
   poem, review, or     directions (editorial,    colors, spacing,           instant 1-click download
   announcement copy    vintage, brutalist)       layers, decorations        (PNG / SVG, no sign-up)
```

1. **Input Text**: Type or paste arbitrary text with preserved line breaks and formatting.
2. **Browse Library**: Filter polished, distinct template categories (Editorial, Minimalist, Vintage Paper, Retro Print, Dark Mode, Typography).
3. **Map & Customize**: Selected templates dynamically map user text to designated editable placeholders while allowing direct on-canvas layer manipulation.
4. **Export**: Instant local high-res render and download without sign-up or paywalls.

---

## Repository Structure

```
aestheticcardgenerator/
├── src/
│   ├── components/
│   │   ├── Header.tsx                      # Universal sticky navigation with path routing & mobile menu
│   │   ├── Footer.tsx                      # Grouped sitemap navigation linking all product, guide & trust routes
│   │   └── AdSlot.tsx                      # Layout-stable Google AdSense slot component (disabled by default)
│   ├── views/
│   │   ├── HomeView.tsx                    # Explore & Landing page (interactive hero, style families, FAQs)
│   │   ├── EditorView.tsx                  # Interactive Typesetting Studio (live canvas, controls, 2x export)
│   │   ├── TemplatesView.tsx               # Template Library directory with category filtering & live search
│   │   ├── CategoryView.tsx                # Distinct category landing page template with use-case guides & FAQs
│   │   ├── GuideIndexView.tsx              # Educational guides knowledge base hub
│   │   ├── GuideDetailView.tsx             # Long-form typesetting and design article reader with structured data
│   │   └── TrustViews.tsx                  # Trust & legal views (About, Contact, FAQ, Privacy, Terms, Cookies, etc.)
│   ├── data/
│   │   ├── templates.ts                    # Preloaded design library, palettes, aspect ratios, quotes
│   │   ├── categories.ts                   # Metadata, use cases, and design tips for all 8 template categories
│   │   └── guides.ts                       # Substantive editorial content for 7 educational design guides
│   ├── types/
│   │   └── card.ts                         # Strongly typed models for cards, themes, categories, and guides
│   ├── utils/
│   │   └── seo.ts                          # Dynamic document head updater (metadata, Open Graph, JSON-LD)
│   ├── App.tsx                             # Master application coordinator and HTML5 History API router
│   ├── main.tsx                            # React 19 root mount
│   └── index.css                           # Tailwind CSS v4 setup + DESIGN.md custom CSS tokens
├── public/
│   ├── favicon.svg                         # Studio brand favicon
│   ├── robots.txt                          # Search crawler rules and sitemap reference
│   └── sitemap.xml                         # Canonical XML sitemap for all 21 indexable routes
├── index.html                              # Vite single-page application mount point
├── vite.config.ts                          # Vite bundler configuration with @tailwindcss/vite
├── package.json                            # React 19, TypeScript, Tailwind v4, Lucide dependencies
├── tsconfig.json                           # TypeScript configuration
├── DESIGN.md                               # Master design system specification (Airtable + Binance)
├── DESIGN_STUDIO_REFERENCE.md              # Studio UI tokens reference
├── README.md                               # Project documentation, guidelines & changelog (this file)
├── asthethiccardgenerator ui 2.png         # Layout & wireframe reference image 1
├── ui for astheticcardgenerateor.png       # Layout & wireframe reference image 2
├── reference_home_screen.png               # Reference capture of home screen layout
└── reference_editor_screen.png             # Reference capture of card editor layout
```

---

## Changelog & Architecture Decision Records (ADRs)

*Every modification to the application architecture, UI, design tokens, or features must be appended to this log.*

### [2026-10-13] — Freeform Canvas Studio Engine & 56-Template Multi-Layer Library Expansion
- **Freeform Canvas Studio (`/canvas`)**:
  - Implemented complete blank-canvas and template-based multi-layer editor allowing users to create cards from scratch.
  - Interactive direct object manipulation: drag-and-drop, 8-point corner/edge resize handles, and 360-degree rotation knob with normalized canvas coordinate math.
  - Comprehensive object library: independent typography layers (font family, weight 300-900, size, color, alignment), local image upload via base64 data URLs, vector SVG avatar presets (Jennie, Grunge Dan, Anime Traveler, Kawaii Boba, etc.), and decorative vector shapes (stamps, barcodes, QR codes, stars, hearts, ribbons, seals).
  - Synchronized Layers Panel: real-time reordering (Bring Forward, Send Backward), layer renaming, locking, visibility toggle, and deletion.
  - Contextual Inspector: granular controls for typography, dimensions, positions, border radius, stroke, shadow, and opacity.
  - 40-step snapshot Undo / Redo engine with keyboard shortcuts (Cmd/Ctrl+Z, Cmd/Ctrl+Shift+Z, Cmd/Ctrl+D duplicate, Delete, nudge).
  - Client-side Retina 2x export in PNG, WebP, and JPEG without watermarks or UI chrome.
  - LocalStorage draft persistence for in-progress canvas compositions.
- **Template Library Expansion (56 Total Templates)**:
  - Scaled template library from 18 to 56 distinct, fully editable multi-layer templates across 8 aesthetic categories.
  - Added 8 Aesthetic ID Cards, 8 Cute & Pastel cards, 6 Fan & Character Photocards, 6 Vintage & Retro cards, 5 Minimalist cards (strictly designed without stars, hearts, ribbons, or stickers), and 5 School & Academy identity cards.
  - All templates feature native `CanvasDocument` structures allowing dual editing: instant quote typesetting or full freeform canvas manipulation.

### [2026-10-13] — Aesthetic ID Cards & Badges Category, Pinterest Wireframe Templates, Studio Blog & Trust Navigation
- **Aesthetic ID Cards & Badges Category (`/templates/aesthetic-id-cards`)**:
  - Implemented the 9th dedicated category inspired by the Pinterest reference wireframes, featuring vintage passport passes, romantic soulmate credentials, Y2K cyber badges, and student identity templates.
  - Added comprehensive category metadata, curated design tips, aspect ratio recommendations, and specialized FAQs.
- **6 New Aesthetic ID & Clearance Pass Templates**:
  - `travel-license-pass`: Permanent License of Travel inspired by Tyler the Creator's "Call Me If You Get Lost", with star-stamped perimeters, registration serial TTC6253021, and vintage kraft tones.
  - `soulmate-clearance-pass`: Romantic Soulmate Department Pass styled with deep wine burgundy (#4d0b1a) and rose tones, official clearance metadata (Role, Status, Validity: Forever).
  - `y2k-creative-studio-pass`: Y2K cyber badge with neon acid lime (#dcff02) and deep violet ink, monospace pixel pusher metadata, star tags, and QR code badge icon.
  - `kawaii-pastel-member-id`: Soft pastel baby pink member ID (#ffdfeb) with delicate floral and lace styling, certified dreamer numbering, and cute status metadata.
  - `campus-student-identity`: Minimal camel and oat academic student identity card (#d4c0ad) with honor code typography and institute registration details.
  - `vip-backstage-credentials`: High-contrast dark graphite and electric cyan lanyard credential (#101216 / #22d3ee) with all-areas access and crew verification.
- **6 New Badge Theme Palettes**:
  - Added `travel-license` (#f5edd6/#183c48), `soulmate-wine` (#4d0b1a/#ffdfdf), `y2k-cyber` (#dcff02/#360033), `kawaii-lace` (#ffdfeb/#4a1525), `campus-camel` (#d4c0ad/#191716), and `vip-lanyard` (#101216/#22d3ee) to `PALETTE_PRESETS`.
  - Expanded Editor icon glyphs with material symbols: `stars`, `favorite`, `badge`, `qr_code`, `verified`.
- **Dedicated Studio Blog Infrastructure (`/blog` and `/blog/:slug`)**:
  - Created `src/data/blog.ts` with 5 in-depth original articles:
    - "The Rise of Aesthetic ID Cards, Passport Passes & Y2K Credentials"
    - "The Typography of Memory: How to Typeset Literary Excerpts & Quotations"
    - "Archival Paper Tones: The Color Psychology of Cream, Kraft, and Celadon"
    - "Aspect Ratios Unpacked: Choosing Between 1:1, 4:5, 9:16, and 16:9"
    - "Why Browser-Native Architecture is the Future of Creative Privacy"
  - Created `src/views/BlogView.tsx` implementing `BlogIndexView` (featured hero story, category pills, responsive grid) and `BlogDetailView` (breadcrumbs, metadata, structured body sections, interactive template launch button, author bio, related stories, and JSON-LD BlogPosting schema).
- **Navigation & Trust Page Link Integration**:
  - Updated `Header.tsx` to include direct links for Home (`/`), Templates (`/templates`), Blog (`/blog`), Guides (`/guides`), About (`/about`), Contact (`/contact`), and Create Card (`/create`).
  - Updated mobile menu drawer with complete links to Blog, About, Contact, Privacy, Terms, and FAQ.
  - Updated `Footer.tsx` columns to feature Aesthetic ID Cards, Studio Blog & Articles, and full legal links (About, Contact, Privacy Policy, Terms of Use, Cookie Policy, Accessibility, Credits).
  - Updated `public/sitemap.xml` with all new blog articles and the ID card category.
  - Updated `HomeView.tsx` with instant category pill filtering for Aesthetic ID Cards.
  - Maintained native `<a href="...">` reload routing for all navigation links as requested.

### [2026-10-13] — SEO Page Architecture, Educational Knowledge Base & Google AdSense Readiness
- **Core Architecture & Routing Overview**:
  - Upgraded navigation across Header, Footer, and all views into native <a href="..."> links with full browser page reload and standard multi-page browser behavior for all 21 canonical routes.
  - Retained the established client-side, zero-backend, browser-native processing model with zero server uploads and zero authentication overhead.
- **Implemented Route Structure**:
  - **Core Product Pages**:
    - `/`: Homepage retaining the interactive hero preview, curated style directory, 4-step workflow pipeline, and collapsible FAQ accordion.
    - `/create`: Dedicated Card Creator Studio with semantic heading hierarchy (`<h1>`), introductory instructions, draft autosave recovery, full canvas manipulation, and instant 2x Retina exports.
    - `/templates`: Central Template Library featuring live keyword search, category filter pills, real template card previews, and 1-click studio launch buttons.
  - **8 Distinct Category Landing Pages**:
    - `/templates/aesthetic-text-cards`: Archetypal editorial serif cards with archival paper textures.
    - `/templates/quote-cards`: Literature and high-contrast dramatic display quotation cards.
    - `/templates/journal-cards`: Personal reflection cards with dated badges and tactile tags.
    - `/templates/book-review-cards`: Structured reading critique cards with star ratings and publication metadata.
    - `/templates/study-note-cards`: Structured monospaced concept cards for active recall and technical axioms.
    - `/templates/scrapbook-cards`: Mixed tactile ephemera cards with grain textures and craft-inspired palettes.
    - `/templates/minimal-cards`: High-contrast Swiss-style layout cards focusing on whitespace and typography.
    - `/templates/social-text-cards`: 4:5 and 9:16 portrait format cards optimized for high-density mobile feeds.
    - Each category includes tailored use cases, practical design tips, recommended aspect ratios, specific FAQ items, and direct template launch triggers.
  - **Educational Knowledge Base (7 Substantive Guides)**:
    - `/guides`: Central educational hub indexing all typesetting and design articles.
    - `/guides/how-to-make-aesthetic-text-cards`: Step-by-step masterclass on visual hierarchy and paper palettes.
    - `/guides/how-to-design-quote-cards`: Typographic alignment, font pairings, and attribution formatting.
    - `/guides/card-sizes-for-social-media`: Technical aspect ratios (1:1, 4:5, 9:16, 16:9) and Retina export resolutions.
    - `/guides/typography-and-text-readability`: Optical kerning, measure length (45-65 chars), and contrast ratios.
    - `/guides/how-to-make-a-book-review-card`: Information architecture for literary reviews and reading journals.
    - `/guides/digital-journal-card-design`: Tactile reflection cards, dating systems, and emotional color palettes.
    - `/guides/how-to-use-scrapbook-card-styles`: Craft textures, noise grain intensity, and layered border accents.
  - **Trust, Legal & Compliance Pages**:
    - `/about`: Transparent explanation of client-side architecture, local memory model, and target audience.
    - `/contact`: Direct `mailto:` contact channel and issue reporting guide (zero fake submission forms).
    - `/faq`: Comprehensive 8-point FAQ covering browser privacy, offline capabilities, export resolutions, and commercial usage.
    - `/privacy`: Complete privacy policy draft detailing zero server transmission, client-side image processing, and future ad disclosures.
    - `/terms`: Clear acceptable use terms, user responsibility for entered copy, and intellectual property disclaimers.
    - `/cookies`: Precise cookie and local storage disclosure explaining `aesthetic_card_studio_theme` and draft autosave.
    - `/accessibility`: Accessibility commitment covering WCAG contrast, keyboard navigation, and reporting mechanisms.
    - `/credits`: Transparent font licenses (SIL Open Font License) and Lucide icon attributions.
    - `/404`: Dedicated recovery page with direct shortcuts back to Home, Template Library, and Studio Editor.
- **Technical SEO Implementation**:
  - `src/utils/seo.ts`: Central dynamic metadata and structured data manager updating document titles, meta descriptions, canonical URLs, Open Graph tags (`og:title`, `og:description`, `og:url`, `og:type`), and Twitter summary cards.
  - JSON-LD Structured Data: Configured valid Schema.org schemas for `WebSite`, `SoftwareApplication`, `Article`, and `BreadcrumbList`.
  - `public/robots.txt`: Search crawler directives allowing all public content and referencing the XML sitemap.
  - `public/sitemap.xml`: Valid XML sitemap declaring canonical URLs, change frequencies, and priority weights for all 21 indexable pages.
- **Google AdSense Preparation**:
  - `src/components/AdSlot.tsx`: Reusable advertising slot component with predefined layout boundaries and zero cumulative layout shifts (CLS).
  - Component is disabled by default (`ADSENSE_ENABLED = false`) and displays zero decorative mock ads or simulated banners.
  - Strict layout policy: advertising slots are placed only within long-form guides and informational footers, strictly avoiding canvas editing zones, controls, and export action buttons.
- **Component & Data Additions**:
  - Created `src/types/card.ts` metadata extensions (`CategoryMeta`, `GuideArticle`, `GuideSection`).
  - Created `src/data/categories.ts` and `src/data/guides.ts` containing original, comprehensive editorial copy.
  - Created `src/views/CategoryView.tsx`, `src/views/GuideIndexView.tsx`, `src/views/GuideDetailView.tsx`, `src/views/TemplatesView.tsx`, and `src/views/TrustViews.tsx`.
  - Updated `src/components/Header.tsx` and `src/components/Footer.tsx` with unified, working route links.

### [2026-10-13] — Complete Functionality Audit & Repair: Full State Engine, History, Theme Engine & Export
- **Audit Objective & Scope**:
  - Conducted a comprehensive functional audit of every interactive component, view, dialog, and control across the application.
  - Repaired underlying root causes rather than applying visual workarounds.
  - Preserved established design tokens, typography, and light/dark visual direction with zero server dependencies.
- **Key Repairs & Enhancements Implemented**:
  1. **Working Light/Dark Workspace Theme Engine**:
     - Converted the nonfunctional Sun icon button into a bidirectional Theme Switcher (Obsidian Dark vs Daylight Light mode).
     - Persists user theme preference to browser `localStorage` (`aesthetic_card_studio_theme`).
     - Toggles `html.light` with dedicated CSS tokens in `src/index.css` without disrupting the card's user-selected paper/ink colors.
  2. **Template Library Live Search, Filtering & Empty States**:
     - Added instant search bar with partial, case-insensitive keyword matching on titles, tags, authors, categories, and quotes.
     - Live result counter (`Showing X of 12 styles`) and single-click clear button (`X`).
     - Friendly empty state with "Show All Styles" reset button when queries return no matches.
     - Smart template switching drawer in the editor with a "Preserve my current words" checkbox, ensuring users never lose custom text when browsing new art directions.
  3. **Complete Undo / Redo History Stack (`CardState`)**:
     - Implemented full snapshot-based state history tracking (`history: CardState[]`, `historyIndex`).
     - Wired toolbar Undo and Redo buttons with live enabled/disabled states.
     - Added global keyboard shortcut listeners for <kbd>Cmd+Z</kbd> / <kbd>Ctrl+Z</kbd> (Undo) and <kbd>Cmd+Shift+Z</kbd> / <kbd>Ctrl+Y</kbd> (Redo).
  4. **Direct Canvas Element Selection & Inspector Synchronization**:
     - Canvas elements (`quote`, `author`, `tag`, `badge`, `card`) are now directly selectable via mouse click.
     - Active element displays a subtle focus ring and toolbar breadcrumb badge.
     - Clicking elements automatically focuses the corresponding inspector inputs.
     - Selection borders and safe print guidelines are cleanly decoupled and automatically hidden during exports and clipboard captures.
  5. **Client-Side Draft Autosave & Recovery**:
     - Automatically persists full card state to `localStorage` (`aesthetic_card_studio_draft`) with debouncing.
     - Displays live "Saved locally at HH:MM" indicator in the studio toolbar with a one-click "clear" action.
     - On page reload, restores previous drafts seamlessly without data loss.
  6. **True Multi-Format Export Pipeline (PNG 2x, PNG 1x, WebP, SVG)**:
     - Real file generation supporting high-res 2x Retina PNG (2160px), standard 1x PNG, lossless WebP, and vector SVG.
     - Deselects active elements and removes overlay guidelines before capture.
     - Dynamic, meaningful download filenames (`{docTitle}-{aspectRatio}.{ext}`).
     - Actionable toast feedback and celebration particle effects upon successful export.
  7. **Text Overflow & Optical Balance Engine**:
     - Real-time character and word count tracking.
     - Added an "Auto-Fit Size" smart action for long text (> 240 chars) to balance margins and prevent clipping.
  8. **Enhanced Quick Command Palette (Cmd+K) & Typography Guide**:
     - Enhanced `Cmd+K` palette with live template search, direct jump actions, and theme toggling.
     - Added comprehensive Typography & Typesetting Principles modal guide accessible from the header and hero.

### [2026-10-13] — Full Migration to React 19 + TypeScript (`.tsx`) & Tailwind CSS v4
- **Eliminated Static HTML Architecture**:
  - Replaced legacy standalone monolithic `.html` files (`index.html` and `editor.html`) with modular React + TypeScript (`.tsx`) components.
  - Initialized high-performance Vite build system configured with `@tailwindcss/vite` and strict TypeScript compilation (`verbatimModuleSyntax`).
- **Component Architecture Implemented**:
  - `src/App.tsx`: Central coordinator with stateful view management (`home` vs `editor`), active template memory, and `Cmd+K` keyboard shortcuts.
  - `src/components/Header.tsx`: Responsive navigation with quick studio launch, mode toggle, and style navigation.
  - `src/components/Footer.tsx`: 6-column comprehensive sitemap and local-first architecture notice.
  - `src/views/HomeView.tsx`: Explore & Landing screen featuring live interactive card preview with theme buttons, curated style directory, 4-step pipeline, and collapsible FAQ accordion.
  - `src/views/EditorView.tsx`: Full-featured typesetting studio with aspect ratio switching (1:1, 4:5, 9:16, 16:9), typography sliders, palette swatches, paper grain overlay, and lossless 2x export with celebratory confetti.
  - `src/types/card.ts` & `src/data/templates.ts`: Strongly typed data models for templates, curated palettes, and quotes.
- **Client-Side Export & Polish**:
  - Integrated `html-to-image` for high-resolution PNG, WebP, and SVG client-side rendering with zero server latency.
  - Added clipboard copy simulation and `canvas-confetti` celebration triggers on export.
- **Local Dev Server**:
  - Application running live at `http://localhost:3000`.

### [2026-10-13] — UI Extraction, Navigation Wiring & Local Server Setup
- **Extracted Reference Material to Project Root**:
  - Moved UI implementations out of nested `stitch_reference_material_tracker/` directly to root.
    - `index.html`: Web application entrance with responsive header, hero typesetting preview, curated style families, and directory links.
    - `editor.html`: Full-featured interactive Card Editor with live canvas rendering, aspect ratio presets (1:1, 9:16, 4:5, 16:9), typography controls, palette swatches, noise texture toggles, and multi-format export dropdown.
    - `DESIGN_STUDIO_REFERENCE.md`: Extracted design token specifications for the studio interface.
    - Preserved visual reference screens as `reference_home_screen.png` and `reference_editor_screen.png`.
- **Bidirectional Navigation Interconnection**:
  - Linked all `data-path="editor"` buttons in `index.html` ("Open Editor", "Create Card", "Customize in Studio ->") directly to `editor.html`.
  - Linked logo and "Explore" menu items in `editor.html` directly back to `index.html`.
- **Local Development Server Launched**:
  - Initialized client-side static server on port 3000 (`http://localhost:3000`).

### [2026-10-13] — Architecture Baseline & Design System Unification
- **Design System Merge**:
  - Unified Airtable's editorial workflow design system and Binance's financial trading design system into master [`DESIGN.md`](./DESIGN.md).
  - Standardized the shared 4px spatial scale, flat color-block elevation model, and touch ergonomics.
  - Resolved token namespaces for colors, typography, border radii, and components without naming collisions.
- **Wireframe & Content Policy Established**:
  - Clarified that `asthethiccardgenerator ui 2.png` and `ui for astheticcardgenerateor.png` serve exclusively as structural wireframes and not as static card content or mock copy.
- **Repository Documentation Standards**:
  - Created [`README.md`](./README.md) as the single source of truth for repository documentation, product constraints, and change tracking.
  - Implemented the policy requiring all subsequent web app changes to be logged directly in this document.

---

## How to Add New Changes to This Repository

Whenever you introduce a change:
1. Make your code/design changes in the respective files.
2. If design tokens or component definitions changed, update [`DESIGN.md`](./DESIGN.md).
3. Append an entry to the **Changelog & Architecture Decision Records** section above detailing:
   - Date and version/feature title
   - Summary of changes
   - Rationale / architectural motivation
   - Affected files and user-facing benefits
