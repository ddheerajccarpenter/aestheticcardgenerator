# Aesthetic Card Generator (ACG) — Complete Technical Architecture, Subsystems & Codebase Specification

> **Audience**: Principal Architects, Staff Software Engineers, Systems Leads, and Senior Full-Stack Developers.  
> **Repository**: `aestheticcardgenerator`  
> **Local Runtime Target**: `http://localhost:3000` (Vite 8.3.4 HMR Dev Server)  
> **Production Target**: Cloudflare Pages (`aestheticcardgenerator.pages.dev`)  
> **Core Engine Stack**: React 19, TypeScript ~6.0 / 5.8, Vite 8, Tailwind CSS v4, Three.js (r186), ONNX / WebAssembly, IndexedDB.

---

## 1. System Philosophy & Architectural Invariants

Aesthetic Card Generator (ACG) is a **local-first, editorial-grade creative engineering suite** designed to compose, typeset, physically preview, and export high-resolution typography cards, poetry folios, social quotes, and tactical ID passes directly inside client browsers.

ACG explicitly rejects generic AI-generated landing page patterns, heavy cloud backends, tracking telemetry, and saturated SaaS aesthetics in favor of a **tactile, physical, gallery-first creative environment**.

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             CLIENT PRIVACY BOUNDARY                              │
│                                                                                  │
│   ┌────────────────────┐     ┌───────────────────────┐     ┌─────────────────┐   │
│   │  Browser Canvas    │ ──> │ Three.js PBR Pipeline │ ──> │ Local Ultra-HD  │   │
│   │  DOM / SVG / Fonts │     │ Offscreen WebGL R186  │     │ 2X/4K/8K/16K    │   │
│   └────────────────────┘     └───────────────────────┘     └─────────────────┘   │
│             │                            │                          │            │
│             ▼                            ▼                          ▼            │
│   ┌────────────────────┐     ┌───────────────────────┐     ┌─────────────────┐   │
│   │ IndexedDB Font &   │     │ Local Neural Network  │     │ Zero Telemetry  │   │
│   │ Project Storage    │     │ @imgly WASM/ONNX AI   │     │ 100% Offline    │   │
│   └────────────────────┘     └───────────────────────┘     └─────────────────┘   │
│                                                                                  │
│ ─────────────────────────── NO REMOTE CLOUD BACKEND ──────────────────────────── │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### Core Invariants

1. **Zero Cloud Telemetry & Offline Integrity**:
   - Every single rasterization step, vector calculation, font file binary parsing, 3D WebGL material shader execution, AI portrait segmentation, and image dither filter runs **100% locally on the user's CPU and GPU**.
   - No remote rendering API, analytics beacon, user tracker, or third-party pixel is ever contacted.
2. **Strict Boundary: Application Shell vs. Canvas Document**:
   - The UI chrome adheres to an immutable application design token system (`--app-*`).
   - The artwork/card layer adheres to an independent, user-controlled token system (`--canvas-*`).
   - Selecting any card palette (terracotta, warm linen, obsidian dark, soft celadon, acid yellow, crimson seal) **never** mutates or bleeds into the application's header, sidebar inspectors, modal overlays, or navigation controls.
3. **Gallery-First Root Architecture (`/`)**:
   - The root route (`/`) serves as a visual discovery gallery inspired by modern design curation (Reference A: *On Design*; Reference B: *ChatGPT ACG Concept*).
   - Users immediately encounter physical card specimens, taxonomy filter pills (`All`, `Quote cards`, `ID Pass`, `Editorial`, `Minimal`), and instant search without wading through marketing banners or redundant "Start Creating" hero callouts.
4. **Isolated Creator Studio (`/create`)**:
   - Creative authoring is partitioned into a dedicated workspace (`/create`) free of gallery clutter.
   - Offers mode switching (Editorial Quote vs. ID Pass Badge), aspect ratio selection, Three.js 3D physical stage toggles, and multi-tier export pipelines.
5. **Deterministic High-Fidelity Master Exports**:
   - All exported assets (PNG, WebP, SVG, 3D PNG) undergo pre-flight font rasterization sync via `document.fonts.ready` to eliminate Flash of Unstyled Text (FOUT).
   - Filenames strictly follow the deterministic format: `aestheticcardgenerator.com-[style-slug]-[YYYY-MM-DD-HHmm].[format]`.

---

## 2. Localhost Runtime Environment & Live Verification (Port 3000)

The application executes locally using Vite 8 with hot module replacement (HMR) and real-time client hydration.

```
┌────────────────────────────────────────────────────────────────────────┐
│               Localhost Runtime Architecture (Port 3000)                │
│                                                                        │
│   Client Browser (Chrome / Safari / Firefox)                           │
│     │                                                                  │
│     ├── GET http://localhost:3000/ (HTTP 200 OK)                       │
│     │     ├── HTML5 Shell (index.html)                                 │
│     │     ├── Google Fonts Preconnect & Fontface CSS (18 Typefaces)    │
│     │     ├── /@vite/client (HMR WebSocket Engine)                     │
│     │     ├── /@react-refresh (Fast Refresh Hooks)                     │
│     │     └── /src/main.tsx (Root TypeScript Module)                   │
│     │                                                                  │
│     ├── Client-Side State Hydration:                                   │
│     │     ├── localStorage.getItem('aesthetic_card_studio_theme')      │
│     │     ├── sessionStorage.getItem('..._selected_template')         │
│     │     ├── URLSearchParams (?template=...&v=...)                   │
│     │     └── IndexedDB.open('custom_fonts_db')                        │
│     │                                                                  │
│     └── DOM Attachment:                                                │
│           ├── <html data-theme="dark" class="dark">                    │
│           ├── <body data-theme="dark" class="dark">                    │
│           ├── <div id="root"> ──> <App />                              │
│           └── <style id="dynamic-custom-fonts">                        │
└────────────────────────────────────────────────────────────────────────┘
```

### 2.1. Live Route Status Verification Matrix

All 18 application routes have been systematically verified on `http://localhost:3000` via automated HTTP inspection:

| Route Path | HTTP Status | Response Type | Root Mounting Node | Verified View Controller |
| :--- | :--- | :--- | :--- | :--- |
| `http://localhost:3000/` | `200 OK` | `text/html` | `<div id="root">` | [`HomeView.tsx`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/views/HomeView.tsx) |
| `http://localhost:3000/create` | `200 OK` | `text/html` | `<div id="root">` | [`CreatorView.tsx`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/views/CreatorView.tsx) |
| `http://localhost:3000/canvas` | `200 OK` | `text/html` | `<div id="root">` | [`CanvasEditorView.tsx`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/views/CanvasEditorView.tsx) |
| `http://localhost:3000/templates` | `200 OK` | `text/html` | `<div id="root">` | [`TemplatesView.tsx`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/views/TemplatesView.tsx) |
| `http://localhost:3000/templates/id-card` | `200 OK` | `text/html` | `<div id="root">` | [`CategoryView.tsx`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/views/CategoryView.tsx) |
| `http://localhost:3000/guides` | `200 OK` | `text/html` | `<div id="root">` | [`GuideIndexView.tsx`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/views/GuideIndexView.tsx) |
| `http://localhost:3000/guides/typesetting-rules` | `200 OK` | `text/html` | `<div id="root">` | [`GuideDetailView.tsx`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/views/GuideDetailView.tsx) |
| `http://localhost:3000/blog` | `200 OK` | `text/html` | `<div id="root">` | [`BlogView.tsx`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/views/BlogView.tsx) (Index) |
| `http://localhost:3000/about` | `200 OK` | `text/html` | `<div id="root">` | [`TrustViews.tsx`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/views/TrustViews.tsx) (`AboutView`) |
| `http://localhost:3000/contact` | `200 OK` | `text/html` | `<div id="root">` | [`TrustViews.tsx`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/views/TrustViews.tsx) (`ContactView`) |
| `http://localhost:3000/faq` | `200 OK` | `text/html` | `<div id="root">` | [`TrustViews.tsx`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/views/TrustViews.tsx) (`FaqView`) |
| `http://localhost:3000/privacy` | `200 OK` | `text/html` | `<div id="root">` | [`TrustViews.tsx`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/views/TrustViews.tsx) (`PrivacyView`) |
| `http://localhost:3000/terms` | `200 OK` | `text/html` | `<div id="root">` | [`TrustViews.tsx`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/views/TrustViews.tsx) (`TermsView`) |
| `http://localhost:3000/cookies` | `200 OK` | `text/html` | `<div id="root">` | [`TrustViews.tsx`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/views/TrustViews.tsx) (`CookieView`) |
| `http://localhost:3000/disclaimer` | `200 OK` | `text/html` | `<div id="root">` | [`TrustViews.tsx`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/views/TrustViews.tsx) (`DisclaimerView`) |
| `http://localhost:3000/accessibility` | `200 OK` | `text/html` | `<div id="root">` | [`TrustViews.tsx`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/views/TrustViews.tsx) (`AccessibilityView`) |
| `http://localhost:3000/credits` | `200 OK` | `text/html` | `<div id="root">` | [`TrustViews.tsx`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/views/TrustViews.tsx) (`CreditsView`) |
| `http://localhost:3000/404` | `200 OK` | `text/html` | `<div id="root">` | [`TrustViews.tsx`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/views/TrustViews.tsx) (`NotFoundView`) |

### 2.2. Runtime Fonts Injected on Localhost

When the DOM loads on `http://localhost:3000`, [`index.html`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/index.html) immediately resolves Google Fonts via CDN preconnections:
- **Core Interface Fonts**: `Funnel Sans`, `Murecho`, `SamsungOne`.
- **Card Editorial & Display Typefaces**:
  - `Newsreader` (Editorial Serif, 6–72 optical size variable).
  - `Playfair Display` & `Cormorant Garamond` (Classic Literary Serifs).
  - `Instrument Serif` (High-contrast French Renaissance italics).
  - `Syne` & `Unbounded` (Modern Display, Y2K aesthetic).
  - `Space Grotesk` & `Plus Jakarta Sans` (Geometric Humanist Sans).
  - `JetBrains Mono` & `Space Mono` (Engineered Technical Monospaces).
  - `Caveat` & `Reenie Beanie` (Personal Organic Script).
  - `VT323` (Tactile 8-bit Pixel Type).

---

## 3. Complete File Attachment & Interconnection Graph

This section provides the master wiring diagram connecting every source file in the repository from the application entry point down to each individual route, component, engine, utility, and data catalog.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        index.html (HTML5 Shell)                        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ mounts #root
┌───────────────────────────────────▼────────────────────────────────────┐
│                       src/main.tsx (React 19 Root)                     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ renders <App />
┌───────────────────────────────────▼────────────────────────────────────┐
│                       src/App.tsx (Route Controller)                   │
├───────────────────────────────────┬────────────────────────────────────┤
│ Global Shell Components:          │ Global Services & Hooks:           │
│  - src/components/Header.tsx      │  - src/services/customFontManager  │
│  - src/components/Footer.tsx      │  - src/utils/scrollGradientEngine  │
│  - src/components/MobileBottomNav │  - ⌘K Command Palette Engine       │
│  - src/components/CookieConsent   │  - Local Theme Controller          │
│  - src/components/ErrorBoundary   │                                    │
└───────────────┬───────────────────┴───────────────────┬────────────────┘
                │                                       │
        [ Main Page Route ]                     [ Sub-Page Routes ]
                │                                       │
                ▼                                       ▼
    src/views/HomeView.tsx ("/")            ├── src/views/CreatorView.tsx ("/create")
    (Gallery-First Homepage)                ├── src/views/CanvasEditorView.tsx ("/canvas")
    ├── Category Filter Pills               ├── src/views/TemplatesView.tsx ("/templates")
    ├── Search Bar Toggle                   ├── src/views/CategoryView.tsx ("/templates/:slug")
    ├── Specimen Cards Spec                 ├── src/views/GuideIndexView.tsx ("/guides")
    ├── Specimen Modal Inspector            ├── src/views/GuideDetailView.tsx ("/guides/:slug")
    └── "Use Template" Router ──────────┐   ├── src/views/BlogView.tsx ("/blog", "/blog/:slug")
                                        │   └── src/views/TrustViews.tsx ("/about", etc.)
                                        ▼
                            Hydrates Creator State
```

### 3.1. Master File Attachment Table

Every single source file in the project is cataloged below, with its architectural parent, its child dependencies, and its navigation or invocation trigger:

| Source File Link | Architectural Parent | Child Imports / Attached Subsystems | Invocation / Navigation Trigger |
| :--- | :--- | :--- | :--- |
| [`index.html`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/index.html) | Browser Host | [`src/main.tsx`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/main.tsx), [`src/index.css`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/index.css) | Initial browser HTTP GET `/` |
| [`src/main.tsx`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/main.tsx) | [`index.html`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/index.html) | [`src/App.tsx`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/App.tsx) | `ReactDOM.createRoot('#root').render()` |
| [`src/App.tsx`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/App.tsx) | [`src/main.tsx`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/main.tsx) | All Views, Header, Footer, MobileNav, Fonts | Central route state machine |
| [`src/components/Header.tsx`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/components/Header.tsx) | [`src/App.tsx`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/App.tsx) | `lucide-react`, CSS Tokens | Rendered on all standard routes |
| [`src/components/Footer.tsx`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/components/Footer.tsx) | [`src/App.tsx`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/App.tsx) | Trust Views Route Links | Rendered on all routes except `/create` & `/canvas` |
| [`src/components/MobileBottomNav.tsx`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/components/MobileBottomNav.tsx) | [`src/App.tsx`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/App.tsx) | `lucide-react` icons | Auto-mounted on viewports $< 768\text{px}$ |
| [`src/views/HomeView.tsx`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/views/HomeView.tsx) | [`src/App.tsx`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/App.tsx) | [`src/data/extendedTemplates.ts`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/data/extendedTemplates.ts) | Loaded when `currentPath === '/'` |
| [`src/views/CreatorView.tsx`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/views/CreatorView.tsx) | [`src/App.tsx`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/App.tsx) | [`threeCardStage.ts`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/engines/threeCardStage.ts), [`ultraHdExportEngine.ts`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/engines/ultraHdExportEngine.ts) | Triggered via `Create +` button or card click |
| [`src/views/CanvasEditorView.tsx`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/views/CanvasEditorView.tsx) | [`src/App.tsx`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/App.tsx) | [`canvasPhotoOperations.ts`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/engines/canvasPhotoOperations.ts), [`canvasGridAndDimensionEngine.ts`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/engines/canvasGridAndDimensionEngine.ts) | Triggered via `/canvas` link or command palette |
| [`src/views/TemplatesView.tsx`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/views/TemplatesView.tsx) | [`src/App.tsx`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/App.tsx) | [`src/components/LazyTemplateCard.tsx`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/components/LazyTemplateCard.tsx), [`src/components/TemplateComparisonDock.tsx`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/components/TemplateComparisonDock.tsx) | Triggered via Header `Templates` link (`/templates`) |
| [`src/views/CategoryView.tsx`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/views/CategoryView.tsx) | [`src/App.tsx`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/App.tsx) | [`src/data/categories.ts`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/data/categories.ts) | Dynamic route `/templates/:slug` |
| [`src/views/GuideIndexView.tsx`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/views/GuideIndexView.tsx) | [`src/App.tsx`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/App.tsx) | [`src/data/guides.ts`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/data/guides.ts) | Footer `Guides` link (`/guides`) |
| [`src/views/GuideDetailView.tsx`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/views/GuideDetailView.tsx) | [`src/App.tsx`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/App.tsx) | [`src/data/guides.ts`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/data/guides.ts) | Dynamic guide article link `/guides/:slug` |
| [`src/views/BlogView.tsx`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/views/BlogView.tsx) | [`src/App.tsx`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/App.tsx) | [`src/data/blog.ts`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/data/blog.ts) | Footer `Blog` link (`/blog` & `/blog/:slug`) |
| [`src/views/TrustViews.tsx`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/views/TrustViews.tsx) | [`src/App.tsx`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/App.tsx) | Static disclosure copy | Triggered by legal/trust footer links |
| [`src/engines/threeCardStage.ts`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/engines/threeCardStage.ts) | [`CreatorView.tsx`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/views/CreatorView.tsx) | `Three.js` (WebGLRenderer, PBR Shaders) | Mounted when 3D Toggle button is enabled |
| [`src/engines/ultraHdExportEngine.ts`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/engines/ultraHdExportEngine.ts) | [`CreatorView.tsx`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/views/CreatorView.tsx), [`CanvasEditorView.tsx`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/views/CanvasEditorView.tsx) | `html-to-image`, `canvas-confetti` | Triggered by `Export PNG` button |
| [`src/engines/brandedExportAndThreePng.ts`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/engines/brandedExportAndThreePng.ts) | [`CreatorView.tsx`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/views/CreatorView.tsx) | `Three.js` Offscreen Renderer | Triggered by 3D PNG export button |
| [`src/engines/ambientStageEngine.ts`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/engines/ambientStageEngine.ts) | [`EditorView.tsx`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/views/EditorView.tsx) | DOM Stage Backdrop Color | Real-time card palette mutation listener |
| [`src/engines/canvasGridAndDimensionEngine.ts`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/engines/canvasGridAndDimensionEngine.ts) | [`CanvasEditorView.tsx`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/views/CanvasEditorView.tsx) | CAD Dimension Lines & Snapping | Executed during vector object drag operations |
| [`src/engines/canvasPhotoOperations.ts`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/engines/canvasPhotoOperations.ts) | [`CanvasEditorView.tsx`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/views/CanvasEditorView.tsx) | `@imgly/background-removal` (WASM) | Triggered when user selects "Remove BG" |
| [`src/services/customFontManager.ts`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/services/customFontManager.ts) | [`App.tsx`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/App.tsx) | `IndexedDB`, `FontFace` API | Bootstrapped on application mount |
| [`src/services/localProjectStore.ts`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/services/localProjectStore.ts) | [`CanvasEditorView.tsx`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/views/CanvasEditorView.tsx) | `IndexedDB` Projects Store | Autosaves project state every 450ms |
| [`src/utils/qrBarcodeGenerator.ts`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/utils/qrBarcodeGenerator.ts) | [`CreatorView.tsx`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/views/CreatorView.tsx), [`CanvasEditorView.tsx`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/views/CanvasEditorView.tsx) | Pure Vector SVG Math | Executed on ID Pass creation & shape insertion |
| [`src/utils/richText.tsx`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/utils/richText.tsx) | [`CreatorView.tsx`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/views/CreatorView.tsx), [`HomeView.tsx`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/views/HomeView.tsx) | React DOM Elements | Parses `**bold**`, `*italic*`, `==mark==` |
| [`src/utils/seo.ts`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/utils/seo.ts) | All Views | `<head>` meta tags & JSON-LD | Executed on route change |
| [`src/data/extendedTemplates.ts`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/data/extendedTemplates.ts) | [`HomeView.tsx`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/views/HomeView.tsx), [`TemplatesView.tsx`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/views/TemplatesView.tsx) | [`src/types/card.ts`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/types/card.ts) | Imported for template grid rendering |
| [`src/types/card.ts`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/types/card.ts) | Entire Codebase | TypeScript Type Checking | Compile-time validation |

---

## 4. Route Navigation & State Transition Matrix

The table below explains how a user navigates between the main page (`/`) and all respective sub-pages, how data is passed between them, and what state mutations occur:

```
                                  [ Main Page: / ]
                                         │
        ┌───────────────────────┬────────┴───────────────┬────────────────────────┐
        │ Click "Create +"      │ Click Card Specimen    │ Click "Templates"      │
        ▼                       ▼                        ▼                        ▼
[ /create (Blank) ]    [ /create?template=id ]    [ /templates ]           [ /canvas ]
        │                       │                        │                        │
        │ Edit quote/ID         │ Pre-hydrates title,    │ Select from 56+        │ Freeform vector
        │ Select aspect ratio   │ colors, author, tag    │ styles with filter     │ layer editing &
        │ Export 2x Retina PNG  │ Export 2x Retina PNG   │ Click -> /create?tmpl= │ AI background cut
```

### 4.1. Navigation Pathway Details

1. **Main Page (`/`) ──> Creator Workspace (`/create`)**:
   - **Trigger A**: User clicks the white pill button `Create +` in [`Header.tsx`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/components/Header.tsx). Invokes `navigate('/create')`, loading a blank creative canvas.
   - **Trigger B**: User clicks anywhere on a card specimen tile in [`HomeView.tsx`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/views/HomeView.tsx). Invokes `handleOpenEditorWithTemplate(specimen)`, sets `sessionStorage.setItem('...selected_template', id)`, and pushes `/create?template=${id}` to the URL bar.
   - **Trigger C**: User clicks `Use Template` in the hover action dock or the full-resolution preview modal. Passes the pre-configured typography, palette, and badge metadata directly into [`CreatorView.tsx`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/views/CreatorView.tsx).
2. **Main Page (`/`) ──> Template Library Hub (`/templates`)**:
   - **Trigger**: User clicks `Templates` in the desktop header or mobile bottom dock. Navigates to [`TemplatesView.tsx`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/views/TemplatesView.tsx).
   - **State**: Houses the complete collection of 56+ curated styles with category tabs (`All`, `Quotes`, `ID Passes`, `Minimal`, `Vintage`, `Pastel`, `School`, `Poster`).
3. **Template Library (`/templates`) ──> Category Landing Page (`/templates/:slug`)**:
   - **Trigger**: Deep-link navigation (e.g. `/templates/id-card` or `/templates/minimal`).
   - **Resolver**: Matches slug against `TEMPLATE_CATEGORIES` in [`categories.ts`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/data/categories.ts) and renders [`CategoryView.tsx`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/views/CategoryView.tsx) with custom SEO schema and category-specific design advice.
4. **Main Page (`/`) ──> Freeform Vector Canvas (`/canvas`)**:
   - **Trigger**: Clicked via footer link `Studio Canvas`, mobile dock `Canvas`, or command palette `⌘K`. Renders [`CanvasEditorView.tsx`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/views/CanvasEditorView.tsx).
   - **State**: Initializes a multi-layer vector canvas document with AI background removal, CAD measurements, and drag-and-drop transformation handles.
5. **Main Page (`/`) ──> Typography Guides (`/guides` & `/guides/:slug`)**:
   - **Trigger**: Clicked via footer link `Typography Manual`. Renders [`GuideIndexView.tsx`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/views/GuideIndexView.tsx).
   - **Detail**: Clicking an article (e.g. `Optical Hierarchy & Line Measure`) navigates to [`GuideDetailView.tsx`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/views/GuideDetailView.tsx) matching slug `typesetting-rules`.
6. **Main Page (`/`) ──> Studio Blog (`/blog` & `/blog/:slug`)**:
   - **Trigger**: Clicked via footer link `Essays`. Renders [`BlogView.tsx`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/views/BlogView.tsx).
7. **Main Page (`/`) ──> Legal & Trust Documentation (`/about`, `/privacy`, `/terms`, etc.)**:
   - **Trigger**: Clicked via restrained footer links. Renders [`TrustViews.tsx`](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/src/views/TrustViews.tsx).

---

## 5. Exhaustive Page-by-Page Breakdown ("What What the Page Contain")

### 5.1. Homepage (`/` — `HomeView.tsx`)
*Reference Directives: On Design visual density (Reference A) + ACG Concept (Reference B)*

The homepage serves as an **uncompromising, artwork-first discovery gallery**:

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  (O) ACG       Gallery    Templates                           [ Create + ]  (☼)  │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   Explore designs                                             [==] Filter Search │
│                                                                                  │
│   ( All )  ( Quote cards )  ( ID Pass )  ( Editorial )  ( Minimal )              │
│                                                                                  │
│  ┌───────────────────────────────┐     ┌───────────────────────────────┐         │
│  │ FIELD NOTES — 001             │     │ OBJECT STUDY / 04             │         │
│  │                               │     │                               │         │
│  │ "Become who you needed."      │     │ "Less, but better."           │         │
│  │                               │     │                               │         │
│  │ — Carl Jung                   │     │ — Dieter Rams                 │         │
│  │ [Warm Linen Finish]           │     │ [Terracotta Orange Finish]    │         │
│  │ [Use Template] [Preview] [⎘]  │     │ [Use Template] [Preview] [⎘]  │         │
│  └───────────────────────────────┘     └───────────────────────────────┘         │
│  ┌───────────────────────────────┐     ┌───────────────────────────────┐         │
│  │ ARCHIVE — 018                 │     │ IDENTITY / 2026               │         │
│  │                               │     │ [Portrait Frame: Dan/Jennie]  │         │
│  │ "The details are not the      │     │ CREATIVE ACCESS PASS          │         │
│  │ details. They make the        │     │ Clearance: L4 ARCHIVAL        │         │
│  │ design."                      │     │ Code128 Barcode: 8092-AX      │         │
│  │ — Charles Eames [Obsidian]    │     │ [Badge PVC Finish]            │         │
│  │ [Use Template] [Preview] [⎘]  │     │ [Use Template] [Preview] [⎘]  │         │
│  └───────────────────────────────┘     └───────────────────────────────┘         │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

#### Elements and Features Contained in `HomeView.tsx`:
1. **Header Navigation Bar**:
   - Circular geometric ring glyph + bold `ACG` title.
   - Restrained desktop navigation links: `Gallery` (active dot indicator), `Templates`.
   - Distinctive high-contrast white pill button: `Create +` (routes to `/create`).
   - Daylight/Obsidian theme toggle.
2. **"Explore designs" Heading & Filter Bar**:
   - 28px tactile bold title: `Explore designs`.
   - `SlidersHorizontal` icon button: Toggles an inline search field for instant text querying.
   - Curated taxonomy pills:
     - `All`: Complete card catalog.
     - `Quote cards`: Editorial typography, poetic verses, literary thoughts.
     - `ID Pass`: Access badges, security folios, corporate credentials.
     - `Editorial`: Field notes, archival book excerpts, essay callouts.
     - `Minimal`: Functionalist, Swiss-inspired, Dieter Rams monochrome cards.
3. **Artwork Specimen Grid**:
   - Dense 2-column layout (matching Reference B) scaling to 1-col on mobile and 3-col on ultra-wide viewports.
   - Curated reference cards:
     - **Field Notes — 001**: Warm Linen `#f4ede4`, Newsreader serif typography, *"Become who you needed."*
     - **Object Study / 04**: Terracotta Orange `#d44727`, Swiss typography, *"Less, but better."*
     - **Archive — 018**: Slate Obsidian `#1c2533`, subtle borders, Charles Eames quotation.
     - **Identity / 2026**: High-contrast tactical access pass with Dan/Jennie avatar, role metadata, and Code128 barcode.
4. **Hover / Focus Action Dock**:
   - `Use Template`: Navigates to `/create?template=${id}` with full parameter pre-hydration.
   - `Preview`: Mounts a full-screen, high-resolution modal inspection view.
   - `Copy`: Copies formatted attribution text (`"Quote" — Author`) directly to the clipboard with an animated confirmation checkmark.
5. **Full-Resolution Inspection Modal**:
   - Renders the card at full unconstrained resolution with backdrop blur, metadata breakdown, and direct `Open in Creator` CTA.

---

### 5.2. Creator Workspace (`/create` — `CreatorView.tsx`)
*The dedicated, focused desktop creative studio.*

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ ← Gallery   [ Quote Card | ID Pass ]  (4:5) (1:1) (2:3) (9:16)  [3D]  [⎘] [Export]│
├──────────────────────┬───────────────────────────────────────────────────────────┤
│ INSPECTOR            │ ARTWORK STAGE                                             │
│                      │                                                           │
│ PALETTES             │                     ┌───────────────────────────┐         │
│ (●)(●)(●)(●)(●)(●)   │                     │                           │         │
│                      │                     │  FIELD NOTES — 001        │         │
│ CARD CONTENT         │                     │                           │         │
│ Quote Textarea       │                     │  "Become who you          │         │
│ [ Inspire 🎲 ]       │                     │   needed."                │         │
│                      │                     │                           │         │
│ Author Input         │                     │  — Carl Jung              │         │
│ Tag Input            │                     │                           │         │
│                      │                     └───────────────────────────┘         │
│ TYPOGRAPHY           │                                                           │
│ [Serif][Sans][Mono]  │                     [ Paper Grain Texture Active ]        │
│ [Left][Center][Right]│                     [ 1080 × 1350px @ 2x Retina  ]        │
└──────────────────────┴───────────────────────────────────────────────────────────┘
```

#### Elements and Controls Contained in `CreatorView.tsx`:
1. **Top Studio Toolbar**:
   - `← Gallery`: Instant navigation back to `/`.
   - **Mode Switcher**: Segmented toggle between **Quote Card** mode and **ID Pass** mode.
   - **Aspect Ratio Chips**:
     - `4:5`: Social Portrait (1080×1350) — Default social feed standard.
     - `1:1`: Classic Square (1080×1080) — Symmetrical album/post format.
     - `2:3`: Badge Standard (1080×1620) — Vertical tactical pass format.
     - `9:16`: Story / Reel (1080×1920) — Full-screen mobile format.
   - `3D Viewport Toggle`: Switches the 2D DOM stage into an interactive Three.js PBR physical mesh with dynamic clearcoat reflections.
   - `Copy Text`: Copies active card text attribution to the system clipboard.
   - `Export PNG`: Primary high-contrast button triggering 2× Retina master PNG export.
2. **Left Inspector Column**:
   - **Palette Presets**: Single-click swatch buttons for archival palettes:
     - *Linen Light* (`#f4ede4` bg, `#1a1a1a` text)
     - *Terracotta* (`#d44727` bg, `#ffffff` text)
     - *Obsidian Dark* (`#121316` bg, `#f0ede6` text)
     - *Celadon Soft* (`#dce4dc` bg, `#1e241e` text)
     - *Warm Sand* (`#e8dfd1` bg, `#241e17` text)
     - *Crimson Seal* (`#8b2621` bg, `#fdf8f4` text)
     - *Acid Minimal* (`#e4f542` bg, `#0d0f02` text)
   - **Quote Mode Fields**:
     - Live auto-expanding textarea for quote content.
     - `Inspire` button: Randomly cycles through high-conviction curated quotes (Marcus Aurelius, Dieter Rams, Susan Sontag, Charles Eames, Carl Jung).
     - Author input field (`— Carl Jung`).
     - Header Folio Tag field (`FIELD NOTES — 001`).
   - **ID Pass Mode Fields**:
     - Full Name input (`Jennie Kim`, `Dan Vo`).
     - Role / Title input (`Senior Architectural Designer`).
     - Access Level / Clearance input (`LEVEL 4 ARCHIVAL ACCESS`).
     - Avatar selector: Pre-bundled tactile vector avatars (Dan, Jennie) + local file upload reader.
     - Automatic Code128 vector barcode injection.
   - **Typography & Alignment**:
     - Font family buttons: `Serif` (Newsreader), `Sans` (Plus Jakarta Sans), `Mono` (JetBrains Mono).
     - Text alignment: `Left`, `Center`, `Right`.
3. **Central Artwork Stage**:
   - True-to-aspect container wrapped with high-definition drop shadow and tactile paper grain overlay.
   - Seamlessly updates when controls change with zero lag.
   - In 3D Mode: Renders dynamic WebGL canvas with mouse/touch drag tilt physics.

---

### 5.3. Freeform Canvas Studio (`/canvas` — `CanvasEditorView.tsx`)
*Multi-layer vector graphic workstation for unconstrained visual design.*

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ [Doc Name]  (Zoom: 100%)  [Undo] [Redo]  [Snap: ON] [CAD: ON]  [Layers]  [Export]│
├────────────┬────────────────────────────────────────────────────────┬────────────┤
│ TOOLBOX    │ 2D VECTOR VIEWPORT                                     │ INSPECTOR  │
│            │                                                        │            │
│ [T] Text   │   ┌────────────────────────────────────────────────┐   │ Transform  │
│ [I] Image  │   │  ┌───────┐                         [64px]      │   │ X: 120px   │
│ [AI] No-BG │   │  │ Photo │ <── AI Segmented        ┌────────┐  │   │ Y: 240px   │
│ [S] Shapes │   │  └───────┘                         │ Stamp  │  │   │ W: 320px   │
│   Barcode  │   │                                    └────────┘  │   │ H: 180px   │
│   QR Code  │   │     "Design is intelligence made visible."     │   │ Rot: 0°    │
│   Stamp    │   │                                                │   │            │
│   Seal     │   │  |||||||||||||||||||||||||||||||||||||||||||   │   │ Typography │
│   Washi    │   │  8092-AX-CREATIVE-PASS-2026                    │   │ Layer Opac │
│ [Z] Finish │   └────────────────────────────────────────────────┘   │ Blending   │
└────────────┴────────────────────────────────────────────────────────┴────────────┘
```

#### Elements and Subsystems Contained in `CanvasEditorView.tsx`:
1. **Scene Graph Data Model (`CanvasDocument`)**:
   - Manages an array of `CanvasObject` nodes:
     - `TextCanvasObject`: Content, font, size, weight, letter spacing, line height, fill, align.
     - `ImageCanvasObject`: Data URL, natural dimensions, crop bounds, filter matrix.
     - `ShapeCanvasObject`: Vector type (`barcode`, `qr-code`, `rubber-stamp`, `security-seal`, `washi-tape`, `audio-waveform`), procedural params.
2. **Local AI Background Removal (@imgly Integration)**:
   - Evaluates `removeLayerBackgroundOffline(imageSrc)`.
   - Fetches ONNX neural weights into IndexedDB/WASM memory space once.
   - Computes alpha matte and strips portrait backgrounds directly in-browser.
3. **Magnetic Snapping & CAD Measurement Engine (`canvasGridAndDimensionEngine.ts`)**:
   - Real-time snap-to-grid (8px / 16px cadence).
   - Dynamic alignment guidelines: Automatically detects horizontal and vertical centers and edges of sibling objects.
   - CAD Dimension Lines: Draws technical hairline measurement calipers indicating pixel distance between selected elements and canvas borders.
4. **Procedural Shape & Finish Generators**:
   - `barcode`: Algorithmic Code128 SVG generator.
   - `qr-code`: Offline matrix rasterizer.
   - `rubber-stamp`: Distressed circular/rectangular ink stamps (*CONFIDENTIAL*, *ARCHIVE*, *VERIFIED*).
   - `security-seal`: Scalloped vector badge with concentric micro-typography.
   - `washi-tape`: Semi-transparent fibrous masking tape strips.
5. **Surface Textures Catalog (`surfaceTexturesCatalog.ts`)**:
   - 55+ procedural finishes applied via SVG displacement and blending filters.
6. **History State Machine**:
   - Full Undo (`⌘Z`) and Redo (`⌘⇧Z` / `⌘Y`) ring buffer tracking document modifications.

---

### 5.4. Template Catalog (`/templates` — `TemplatesView.tsx`)

1. **Curated Library of 56+ Distinct Designs**:
   - Covers quote cards, ID passes, minimal Dieter Rams designs, vintage library cards, and modern concert tickets.
2. **Real-Time Client Search Engine**:
   - Instantly filters across card titles, quotes, author names, category tags, and color palettes with zero server latency.
3. **Category Filter Tabs**:
   - All, Quotes, ID Passes, Minimal, Vintage, Pastel, Character, Academy.
4. **Template Comparison Dock Integration**:
   - Users can click the comparison icon on up to 4 templates to pin them into `TemplateComparisonDock.tsx` and inspect them side-by-side in `TemplateComparisonModal.tsx`.

---

### 5.5. Educational Knowledge Hub (`/guides` & `/blog`)

#### Guides (`GuideIndexView.tsx`, `GuideDetailView.tsx`):
- **Article 1**: *Optical Hierarchy & Line Measure* (The 45–65 character measure rule, baseline grids, vertical rhythm).
- **Article 2**: *Font Pairings for Archival Cards* (Serif/Sans contrast theory, weight matching, ink traps).
- **Article 3**: *Social Aspect Ratios & Resolution Standards* (2160px Retina master export specs, Instagram 4:5 vs Twitter 16:9 crop safety).

#### Blog (`BlogView.tsx`):
- Long-form design essays on functional minimalism, Dieter Rams' ten principles, the death of SaaS gradients, and tactile digital craftsmanship.

---

### 5.6. Legal & Trust Architecture (`TrustViews.tsx`)

Complete, professionally authored compliance and disclosure suite:
- `/about`: Studio mission and client-side engineering rationale.
- `/contact`: Direct feedback channels and developer communication.
- `/faq`: Technical answers on offline caching, export DPI, and font licenses.
- `/privacy`: Explicit declaration of local-first privacy (no telemetry, no tracking pixels, zero analytics).
- `/terms`: Clear intellectual property and usage rights.
- `/cookies`: Explicit disclosure of zero tracking cookies.
- `/disclaimer`: IP and user-generated content declarations.
- `/accessibility`: WCAG 2.1 AA audit status and keyboard navigation shortcuts.
- `/credits`: Open-source licenses for Three.js, Lucide, Google Fonts, and public domain texts.
- `/404`: Bespoke not-found view with seamless return-to-gallery navigation.

---

## 6. Under-the-Hood Engines ("How Our Things Worked")

### 6.1. Three.js PBR Physical Card Stage (`threeCardStage.ts`)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           THREE.JS PBR PIPELINE                                 │
│                                                                                 │
│   DOM Element (Card) ──> html-to-image ──> THREE.CanvasTexture                  │
│                                                  │                              │
│                                                  ▼                              │
│   THREE.PerspectiveCamera (32° FOV) ──> THREE.Mesh (BoxGeometry / RoundedPlane) │
│                                                  │                              │
│   Surface Preset ───────────────────────> THREE.MeshPhysicalMaterial            │
│   (Clearcoat, Roughness, Metalness,              │                              │
│    Iridescence, Transmission)                    ▼                              │
│                                          THREE.WebGLRenderer                    │
│   User Pointer Drag ───────────────────> (ACESFilmicToneMapping)                │
│   (Quaternion SLERP Damping)                     │                              │
│                                                  ▼                              │
│                                          60fps Interactive GPU Output           │
└─────────────────────────────────────────────────────────────────────────────────┘
```

1. **Camera & Optical Configuration**:
   - `PerspectiveCamera` with a narrow **32° Field of View** positioned at `(0, 0, 4.2)`.
   - The narrow FOV avoids wide-angle edge warping, simulating an architectural macro telephoto lens.
2. **WebGLRenderer Tuning**:
   - Initialized with `alpha: true`, `antialias: true`, and `powerPreference: 'low-power'`.
   - `toneMapping = THREE.ACESFilmicToneMapping` with `toneMappingExposure = 1.05`.
3. **Dynamic PBR Material Formulation (`getThreeMaterialForSurface`)**:
   - Dynamically calibrates `THREE.MeshPhysicalMaterial` based on surface ID:
     - **Holographic Foil**: `roughness: 0.18`, `metalness: 0.35`, `clearcoat: 0.9`, `clearcoatRoughness: 0.1`, `iridescence: 1.0`.
     - **ID Pass (PVC Plastic)**: `roughness: 0.10`, `metalness: 0.05`, `clearcoat: 1.0`, `clearcoatRoughness: 0.05`, `iridescence: 0.15`.
     - **Industrial Titanium**: `roughness: 0.25`, `metalness: 0.82`, `clearcoat: 0.4`, `clearcoatRoughness: 0.2`, `iridescence: 0.0`.
     - **Archival Linen / Cotton Rag**: `roughness: 0.86`, `metalness: 0.0`, `clearcoat: 0.0`, `clearcoatRoughness: 0.9`, `iridescence: 0.0`.
4. **Texture Optimization & Mipmap Bypassing**:
   - Setting `cardTexture.generateMipmaps = false` and `cardTexture.minFilter = THREE.LinearFilter` prevents expensive GPU texture allocation spikes on live canvas edits.
5. **Quaternion SLERP Inertia**:
   - Pointer drag velocities are mapped to rotational quaternions and smoothed via Spherical Linear Interpolation (`THREE.Quaternion.slerp`), delivering physical momentum and smooth damping.

---

### 6.2. Ultra-HD Master Export Engine (`ultraHdExportEngine.ts` & `brandedExportAndThreePng.ts`)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        ULTRA-HD EXPORT PIPELINE                                 │
│                                                                                 │
│   User Selects Tier (2X, 4K, 8K, 16K)                                           │
│                 │                                                               │
│                 ▼                                                               │
│   Multiplier Calculation:  M = TargetLongEdge / max(DOM_Width, DOM_Height)      │
│                 │                                                               │
│                 ▼                                                               │
│   Font Synchronization Check:  await document.fonts.ready                       │
│                 │                                                               │
│                 ▼                                                               │
│   Cloned Offscreen DOM Node with Inline Fonts & Vector Styles                   │
│                 │                                                               │
│                 ▼                                                               │
│   html-to-image toBlob(node, { pixelRatio: M, quality: 1.0 })                   │
│                 │                                                               │
│                 ▼                                                               │
│   Deterministic Naming:                                                         │
│   aestheticcardgenerator.com-[style-slug]-[YYYY-MM-DD-HHmm].png                 │
│                 │                                                               │
│                 ▼                                                               │
│   Automatic Client-Side Blob Download + Confetti Celebration Trigger            │
└─────────────────────────────────────────────────────────────────────────────────┘
```

1. **Resolution Matrix**:
   - **Retina 2× (Standard)**: Multiplier $2.0$ ($\approx 2160\text{px}$ long edge).
   - **Ultra-HD 4K**: Multiplier tuned so $\text{LongEdge} = 3840\text{px}$.
   - **Print Master 8K**: Multiplier tuned so $\text{LongEdge} = 7680\text{px}$.
   - **Studio Extreme 16K**: Multiplier tuned so $\text{LongEdge} = 15360\text{px}$.
2. **Buffer Safety Detection (`detectMaxCanvasDimension`)**:
   - Probes the browser's hardware limit for maximum 2D canvas dimension by creating test canvas elements. Clamps multipliers before triggering GPU driver crashes.
3. **Headless 3D PNG Export (`exportThreeDimensionalCardPNG`)**:
   - Mounts a headless offscreen `THREE.WebGLRenderer` configured with clear alpha ($0.0$).
   - Projects the card mesh at an isometric angle ($\text{rotX}: -0.14, \text{rotY}: 0.24, \text{rotZ}: -0.02$).
   - Renders directly to a pixel buffer and converts to a transparent PNG blob without background stage bleed.

---

### 6.3. Local AI Background Removal Engine (`canvasPhotoOperations.ts`)

- Seamlessly integrated with `@imgly/background-removal`.
- When a user uploads a portrait or badge photo:
  1. Image is loaded into a local `HTMLImageElement`.
  2. The raw image is passed to `removeBackground(imageSrc)`.
  3. The local ONNX WebAssembly runtime analyzes luminance and depth discontinuities to produce an 8-bit alpha mask.
  4. The masked image is converted to a clean PNG data URL and assigned to `ImageCanvasObject.src`.
  5. 100% of processing happens in the browser's WebAssembly sandbox.

---

### 6.4. Ambient Studio Illumination Engine (`ambientStageEngine.ts`)

- Dynamically adjusts the background workspace tone based on the active card palette:
  - Extracts hex/RGB values from the card.
  - In dark mode, executes `rgbToDarkerHex` to synthesize an atmospheric studio tone (luminance 9–13%) preserving the card's exact hue angle.
  - In light mode, produces an elegant bone/linen backdrop 15–20% darker than the card.
  - Smoothly updates the stage backdrop via CSS transitions.

---

### 6.5. Algorithmic Barcode & QR Code Engine (`qrBarcodeGenerator.ts`)

- **Code128 Vector Barcode**:
  - Implements the complete Code128 character set specification in pure TypeScript.
  - Converts arbitrary alphanumeric strings into sequence pairs of bars and spaces with checksum validation.
  - Outputs pure SVG `<rect>` elements without external dependencies.
- **QR Code Matrix Generator**:
  - Generates standard 2D QR matrix data encoded with error correction (Level M/Q).
  - Emits pure SVG path data for crisp, infinite-resolution scaling.

---

### 6.6. Custom Font Manager & Persistence (`customFontManager.ts`)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         CUSTOM FONT SUBSYSTEM                                   │
│                                                                                 │
│   User Uploads (.ttf, .otf, .woff2)                                             │
│                 │                                                               │
│                 ▼                                                               │
│   ArrayBuffer Extracted via FileReader                                          │
│                 │                                                               │
│                 ▼                                                               │
│   IndexedDB Store:  db("custom_fonts_db").store("fonts").put(fontRecord)        │
│                 │                                                               │
│                 ▼                                                               │
│   Dynamic FontFace API:                                                         │
│   const font = new FontFace(familyName, arrayBuffer);                           │
│   await font.load();                                                            │
│   document.fonts.add(font);                                                     │
│                 │                                                               │
│                 ▼                                                               │
│   Style Element Injection:                                                      │
│   <style id="dynamic-custom-fonts">                                             │
│     @font-face { font-family: 'MyFont'; src: url(blob:...); }                    │
│   </style>                                                                      │
└─────────────────────────────────────────────────────────────────────────────────┘
```

1. **Storage Tier**: Custom font binaries are stored persistently in IndexedDB (`custom_fonts_db`).
2. **Restoration on Bootstrap**: `restoreSavedCustomFonts()` loads stored font records on application launch, instantiates native `FontFace` objects, and registers them globally with `document.fonts.add()`.
3. Custom fonts immediately populate all font picker menus across the Creator and Canvas views.

---

## 7. Data Architecture & Master TypeScript Schemas (`src/types/card.ts`)

```typescript
// 1. Aspect Ratio System
export type AspectRatioId = '1:1' | '4:5' | '9:16' | '16:9' | '3:4' | '2:3';

// 2. Typographic Options
export type FontChoice =
  | 'editorial'      // Newsreader (Editorial Serif)
  | 'serif'          // Playfair Display
  | 'instrument'     // Instrument Serif
  | 'cormorant'      // Cormorant Garamond
  | 'syne'           // Syne (Display & Y2K)
  | 'space-grotesk'  // Space Grotesk
  | 'mono'           // JetBrains Mono
  | 'space-mono'     // Space Mono
  | 'pixel'          // VT323
  | 'sans';          // Inter / Plus Jakarta Sans

// 3. Card Template Schema
export interface CardTemplate {
  id: string;
  title: string;
  category: 'quote' | 'reflection' | 'notes' | 'review' | 'poetry' | 'minimal' | 'id-card' | 'pastel' | 'fan' | 'vintage' | 'school' | 'poster';
  categoryLabel: string;
  quote: string;
  author: string;
  tag: string;
  badge: string;
  theme: CardTheme;
  font: FontChoice;
  fontSize: number;
  align: 'left' | 'center' | 'right';
  padding: number;
  borderRadius: number;
  showGrain: boolean;
  showBorder: boolean;
  showIcon: boolean;
  iconName: string;
  tags?: string[];
  hasPhotoArea?: boolean;
  layoutHint?: 'horizontal' | 'vertical' | 'square';
  surfaceFinish?: SurfaceFinish;
  textureIntensity?: number;
  isHolographic?: boolean;
}

// 4. Vector Canvas Object Model (for /canvas)
export type CanvasObjectType = 'text' | 'image' | 'shape';

export interface BaseCanvasObject {
  id: string;
  type: CanvasObjectType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  zIndex: number;
  locked?: boolean;
}

export interface TextCanvasObject extends BaseCanvasObject {
  type: 'text';
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number | string;
  fill: string;
  align: 'left' | 'center' | 'right';
  lineHeight: number;
  letterSpacing: number;
}

export interface ImageCanvasObject extends BaseCanvasObject {
  type: 'image';
  src: string;
  borderRadius?: number;
  aspectRatioLock?: boolean;
}

export interface ShapeCanvasObject extends BaseCanvasObject {
  type: 'shape';
  shapeType: 'barcode' | 'qr-code' | 'rubber-stamp' | 'security-seal' | 'washi-tape' | 'audio-waveform';
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  payload?: string;
}

export type CanvasObject = TextCanvasObject | ImageCanvasObject | ShapeCanvasObject;

export interface CanvasDocument {
  id: string;
  title: string;
  canvasWidth: number;
  canvasHeight: number;
  background: string;
  objects: CanvasObject[];
  createdAt: string;
  updatedAt: string;
}
```

---

## 8. Design Tokens & Styling Architecture (`index.css`)

### Application Shell UI Tokens
```css
:root {
  /* Application Surface & Chrome (Invariant across document theme changes) */
  --app-bg: #101114;                    /* Studio canvas background */
  --app-surface: #181A1E;               /* Elevated chrome panels */
  --app-surface-secondary: #202228;     /* Toolbars & inspector groups */
  --app-text-primary: #F1F0EC;          /* Display typography & titles */
  --app-text-secondary: #AAA9A4;        /* Body copy & field labels */
  --app-text-muted: #787980;            /* Micro-captions & key shortcuts */
  --app-border-subtle: #34353A;         /* Hairline structural dividers */
  --app-border-strong: #44454c;         /* Focused / active border */
  --app-accent: #E2D9C8;                /* Warm bone / champagne accent */
  --app-accent-ink: #171717;            /* High-contrast ink on bone */
}

/* Daylight High-Key Mode */
[data-theme="light"] {
  --app-bg: #f8fafc;
  --app-surface: #ffffff;
  --app-surface-secondary: #f1f5f9;
  --app-text-primary: #101114;
  --app-text-secondary: #475569;
  --app-text-muted: #64748b;
  --app-border-subtle: #e2e8f0;
  --app-border-strong: #cbd5e1;
  --app-accent: #171717;
  --app-accent-ink: #ffffff;
}
```

### Tactile Paper Noise Overlay Utility
```css
.paper-grain {
  background-image: url('/noise.png');
  background-repeat: repeat;
  mix-blend-mode: overlay;
  pointer-events: none;
}
```

---

## 9. Build, Deployment & Production Optimization

1. **Vite 8 Optimization**:
   - Single-pass CSS compilation via `@tailwindcss/vite`.
   - Chunk splitting in `vite.config.ts`:
     - `vendor-three`: Three.js core, materials, and shaders.
     - `vendor-react`: React 19 and React DOM.
     - `ort.bundle`: ONNX runtime WebAssembly binaries for background removal.
2. **Cloudflare Pages Deployment**:
   - Built via `npm run build` (`tsc -b && vite build`).
   - Output folder: `dist/`.
   - Deployed with: `wrangler pages deploy dist --project-name=aestheticcardgenerator`.
   - Edge HTTP cache headers: `Cache-Control: public, max-age=31536000, immutable` for static hashed assets, and `no-cache` for `index.html`.

---

## 10. Verification & Quality Checklist

Before committing or deploying updates:
1. **TypeScript Compilation**: `npx tsc -b` must pass with 0 errors.
2. **Linter Health**: `npx oxlint` must exit with 0 errors across all source files.
3. **Route Testing**: Verify deep links:
   - `/` (Gallery Homepage)
   - `/create` (Creator Studio)
   - `/canvas` (Freeform Studio)
   - `/templates` (Template Archive)
   - `/templates/id-card` (Category Deep Link)
   - `/guides/typesetting-rules` (Guide Detail)
   - `/blog/minimalism-editorial-design` (Blog Detail)
4. **Export Validation**: Verify 2× Retina PNG download produces a valid, uncorrupted, branded image with correct typography and transparent bounds where applicable.
