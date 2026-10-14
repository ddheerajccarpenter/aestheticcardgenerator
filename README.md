# Aesthetic Card Studio

<div align="center">

```
  ┌────────────────────────────────────────────────────────┐
  │   A E S T H E T I C   C A R D   G E N E R A T O R    │
  │   Type words. Select an art direction. Export pure.    │
  └────────────────────────────────────────────────────────┘
```

[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare_Pages-Edge-F38020?style=flat-square&logo=cloudflare&logoColor=white)](https://pages.cloudflare.com/)
[![Local--First](https://img.shields.io/badge/Privacy-100%25_Client--Side-0ECB81?style=flat-square)](https://aestheticcardgenerator.pages.dev)

**A high-precision, client-side typesetting studio for quotes, poetry, editorial cards, passes, and physical 3D cards.**  
Built with a 60:30:10 ambient color system, zero server dependencies, and offline WebAssembly processing.

[Launch Studio](https://aestheticcardgenerator.pages.dev) • [Explore Templates](https://aestheticcardgenerator.pages.dev/templates) • [Guides](https://aestheticcardgenerator.pages.dev/guides)

</div>

---

## Visual Philosophy

The studio is designed around strict mathematical balance and tactile typography:

- **60:30:10 Scroll Dynamic**: 60% deep obsidian (`#0b0e11`), 30% structured slate surfaces (`#14171d`), 10% electric amber (`#fcd535`) and rose (`#ec4899`) accents.
- **Harmonious Typography**:
  - **Murecho**: Expressive, editorial display headings.
  - **Funnel Sans**: Precision badges, tags, and categorical labels.
  - **SamsungOne Bold**: High-legibility UI controls and reading body copy.
- **Dual Layout Harmony**: Strict 2-column or 4-column layouts across all viewport sizes.
- **Pure Card Isolation**: Ambient workspace glows, guideline rulers, and ratio badges stay strictly in the editor and never contaminate exported images.

---

## Core Capabilities

### 1. Interactive Typesetting Editor
- **Live Text Rendering**: Real-time typographic scaling, kerning, line height, and multi-align controls.
- **Dynamic 3D Card Stage**: Three.js physical card viewport with real-time cursor tilt and dynamic PBR specular reflections.
- **Isolated Ambient Lighting**: Card-reactive radial backdrop glow confined strictly to the workspace stage.
- **Social Safe Zones**: Built-in HUD overlays for Instagram Feed (4:5), Reels / Stories (9:16), and 3mm print bleeds.
- **5-Color Palette Quantizer**: Instant color extraction from uploaded photos with single-click palette synchronization.

### 2. Freeform Canvas Studio
- **In-Place Photo Replacement**: Swap images instantly while preserving x/y coordinates, frame geometry, rotation, and clip masks.
- **Offline Background Removal**: Local WebAssembly / WebGPU segmentation via `@imgly/background-removal` with client-side fallback.
- **Auto-Align to 8px Grid**: One-click magnetic snapping that straightens near-horizontal rotations (<4°) and centers primary layers.
- **Floating Contextual Toolbar**: Quick-action bar positioned 14px above active layers for duplicate, delete, lock, and alignment.
- **Custom Font Loader**: Drag-and-drop `.ttf`, `.otf`, `.woff`, `.woff2` support persisted locally via `IndexedDB` and `FontFace`.

### 3. Procedural Texture & Element Catalog
- **55+ Procedural Surfaces**: Noise, grain, handmade cotton, vintage risograph, metallic leaf, and architectural concrete.
- **55+ Decorative Elements**: Minimalist glyphs, seals, astrological marks, floral stamps, and editorial frames.

### 4. Ultra-HD Master Export
- **Multi-Format Export**: Lossless PNG, clean WebP, or compact JPEG.
- **Ultra-HD Scales**: 2x Retina, 4K (3840px), 8K (7680px), and 16K (15360px) pure card renders with zero UI bleed.
- **3D Transparent PNG**: Offscreen WebGL render of tilted cards with pure alpha transparency and grounding contact shadow.
- **Studio Filename Standard**: Every export downloads cleanly as `aestheticcardgenerator.com.png` (or `-3D.png`, `-4K.png`, etc.).

---

## Curated Art Directions

| Style Family | Aesthetic Essence | Ideal Ratios |
|:---|:---|:---:|
| **Swiss Editorial** | Asymmetric grid, stark serif headlines, citation markers | `1:1`, `4:5` |
| **Vintage Risograph** | Textured paper grain, dithered halftones, warm nostalgic tones | `4:5`, `9:16` |
| **Neon Cyberpunk** | Deep obsidian contrast, dual-tone edge glow, tabular data | `16:9`, `1:1` |
| **Minimal Poetry** | Generous negative space, centered lyricism, muted earth ink | `1:1`, `3:4` |
| **Collector Card** | Foil holographic accents, barcode metadata, verification stamp | `2.5:3.5`, `3:4` |
| **Brutalist Poster** | Heavy grotesque type, stark contrast, industrial border rules | `9:16`, `3:4` |

---

## Architectural Stack

```
aestheticcardgenerator/
├── src/
│   ├── components/         # Navigation, comparison dock, duotone icons, modals
│   ├── views/              # Studio, canvas editor, template index, guides, legal
│   ├── engines/            # Ultra-HD export, 3D stage, snap grid, ambient stage
│   ├── services/           # IndexedDB font manager & project auto-save
│   ├── data/               # 55+ textures, 55+ elements, 18 curated templates
│   ├── utils/              # 60fps scroll gradient, palette extractor, filters
│   ├── types/              # Type models for canvas documents, layers, themes
│   └── index.css           # 60:30:10 color tokens & typographic hierarchy
├── public/                 # Edge headers, SPA rewrites, manifest, favicon
├── vite.config.ts          # Optimized bundler configuration
└── wrangler.jsonc          # Cloudflare Pages edge deployment rules
```

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Vanilla CSS tokens with Tailwind CSS utilities
- **3D Graphics**: Three.js (WebGL PBR materials)
- **Local AI**: `@imgly/background-removal` (ONNX Runtime WASM / WebGPU)
- **Export**: `html-to-image` with isolated pixel ratio matrix

---

## Local Development

```bash
# Clone the repository
git clone https://github.com/ddheerajcarpenter/aestheticcardgenerator.git
cd aestheticcardgenerator

# Install dependencies
npm install

# Start local dev server (default: http://localhost:3000)
npm run dev

# Run type checks and build production bundle
npm run build
```

---

## Edge Deployment

### Cloudflare Pages
```bash
npm run pages:deploy
```
Deploys `dist/` directly to Cloudflare edge network with automatic routing via `public/_redirects` and caching headers via `public/_headers`.

### Vercel
```bash
vercel --prod
```
Static output directory points to `dist` with client-side SPA fallback.

---

## Privacy Guarantee

Aesthetic Card Studio operates **100% locally in the browser**.
- No account registration or paywalls.
- User copy, quotes, and uploaded photos are processed exclusively on your device.
- Zero server-side tracking, storage, or telemetry.

**Questions or Feedback**: [ddheerajcarpenter@gmail.com](mailto:ddheerajcarpenter@gmail.com)
