// src/data/surfaceTexturesCatalog.ts

export interface SurfaceTexture {
  id: string;
  name: string;
  category: 'archival' | 'printmaking' | 'plastic' | 'film' | 'architectural';
  categoryLabel: string;
  description: string;
  blendMode: 'multiply' | 'overlay' | 'soft-light' | 'screen';
  defaultIntensity: number; // 0-100
  defaultScale: number; // 50-200
  cssBackground?: string;
}

export function getSurfaceTextureById(id: string): SurfaceTexture | undefined {
  return SURFACE_TEXTURES_55.find((t) => t.id === id);
}

export const SURFACE_TEXTURE_CATEGORIES = [
  { id: 'all', name: 'All' },
  { id: 'archival', name: 'Archival' },
  { id: 'printmaking', name: 'Print & Riso' },
  { id: 'plastic', name: 'Polymer/PVC' },
  { id: 'film', name: 'Film & Scan' },
  { id: 'architectural', name: 'Grids' },
];

export const SURFACE_TEXTURES_55: SurfaceTexture[] = [
  // ──────────────────────────────────────────────────────────────────────────
  // CATEGORY A: Archival & Fine Papers (11 Textures)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'cotton-rag-300gsm',
    name: '300gsm Cotton Rag',
    category: 'archival',
    categoryLabel: 'Archival & Fine Papers',
    description: 'Warm, tactile archival cotton rag paper with subtle diffuse fiber tooth.',
    blendMode: 'multiply',
    defaultIntensity: 45,
    defaultScale: 100,
  },
  {
    id: 'cold-press-watercolor',
    name: 'Cold-Press Watercolor',
    category: 'archival',
    categoryLabel: 'Archival & Fine Papers',
    description: 'Deep, undulating watercolor tooth with organic specular depressions.',
    blendMode: 'multiply',
    defaultIntensity: 55,
    defaultScale: 120,
  },
  {
    id: 'japanese-kozo-washi',
    name: 'Japanese Kozo Washi',
    category: 'archival',
    categoryLabel: 'Archival & Fine Papers',
    description: 'Long anisotropic mulberry bark fibers and delicate organic flecks.',
    blendMode: 'multiply',
    defaultIntensity: 40,
    defaultScale: 100,
  },
  {
    id: 'unbleached-kraft-board',
    name: 'Unbleached Kraft Board',
    category: 'archival',
    categoryLabel: 'Archival & Fine Papers',
    description: 'Warm fibrous pulp grain with natural brown lignin inclusions.',
    blendMode: 'multiply',
    defaultIntensity: 50,
    defaultScale: 110,
  },
  {
    id: 'laid-linen-stationery',
    name: 'Laid Linen Stationery',
    category: 'archival',
    categoryLabel: 'Archival & Fine Papers',
    description: 'Horizontal wire chain lines intersected by watermark vertical ribs.',
    blendMode: 'multiply',
    defaultIntensity: 38,
    defaultScale: 100,
  },
  {
    id: 'woven-canvas-linen',
    name: 'Woven Canvas Linen',
    category: 'archival',
    categoryLabel: 'Archival & Fine Papers',
    description: 'Crisp orthogonal cross-hatched linen weave matrix.',
    blendMode: 'multiply',
    defaultIntensity: 42,
    defaultScale: 100,
  },
  {
    id: 'recycled-oat-pulp',
    name: 'Recycled Oat Pulp',
    category: 'archival',
    categoryLabel: 'Archival & Fine Papers',
    description: 'Speckled matte pulp with multi-tonal organic oat grain inclusions.',
    blendMode: 'multiply',
    defaultIntensity: 48,
    defaultScale: 100,
  },
  {
    id: 'crushed-translucent-vellum',
    name: 'Crushed Tracing Vellum',
    category: 'archival',
    categoryLabel: 'Archival & Fine Papers',
    description: 'Frosted transmittance veins and soft translucent micro-frosting.',
    blendMode: 'overlay',
    defaultIntensity: 35,
    defaultScale: 100,
  },
  {
    id: 'aged-parchment-vellum',
    name: 'Archival Manuscript Parchment',
    category: 'archival',
    categoryLabel: 'Archival & Fine Papers',
    description: 'Warm aged vignette patina with subtle historic mottling.',
    blendMode: 'multiply',
    defaultIntensity: 50,
    defaultScale: 110,
  },
  {
    id: 'french-ingres-charcoal',
    name: 'French Ingres Charcoal Paper',
    category: 'archival',
    categoryLabel: 'Archival & Fine Papers',
    description: 'Diagonal micro-ribbing tooth tailored for chalk and graphite.',
    blendMode: 'multiply',
    defaultIntensity: 36,
    defaultScale: 90,
  },
  {
    id: 'newsprint-pulp-grey',
    name: 'Vintage Newsprint Pulp',
    category: 'archival',
    categoryLabel: 'Archival & Fine Papers',
    description: 'High-frequency directional pulp grain with warm grey antique tint.',
    blendMode: 'multiply',
    defaultIntensity: 45,
    defaultScale: 95,
  },

  // ──────────────────────────────────────────────────────────────────────────
  // CATEGORY B: Printmaking, Zine & Halftone Press (11 Textures)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'risograph-soy-ink',
    name: 'Risograph Soy Ink Stipple',
    category: 'printmaking',
    categoryLabel: 'Printmaking & Zine Press',
    description: 'Stippled stochastic micro-dots with slight ink density variation.',
    blendMode: 'multiply',
    defaultIntensity: 52,
    defaultScale: 100,
  },
  {
    id: 'halftone-comic-45deg',
    name: '85-LPI Comic Halftone (45°)',
    category: 'printmaking',
    categoryLabel: 'Printmaking & Zine Press',
    description: 'Classic 45-degree angled circular dot matrix modulated by luminance.',
    blendMode: 'multiply',
    defaultIntensity: 48,
    defaultScale: 100,
  },
  {
    id: 'halftone-zine-coarse',
    name: 'Coarse Punk Zine Halftone',
    category: 'printmaking',
    categoryLabel: 'Printmaking & Zine Press',
    description: 'Macro 18px dot screen at 15-degree angle from underground publications.',
    blendMode: 'multiply',
    defaultIntensity: 56,
    defaultScale: 115,
  },
  {
    id: 'xerox-photocopy-toner',
    name: 'High-Contrast Xerox Toner',
    category: 'printmaking',
    categoryLabel: 'Printmaking & Zine Press',
    description: 'Vertical drum roller streaks and gritty high-contrast toner grit.',
    blendMode: 'multiply',
    defaultIntensity: 60,
    defaultScale: 105,
  },
  {
    id: 'letterpress-deep-deboss',
    name: 'Letterpress Heavy Bite',
    category: 'printmaking',
    categoryLabel: 'Printmaking & Zine Press',
    description: 'Inner edge bevel shadow and heavy cotton paper compression.',
    blendMode: 'multiply',
    defaultIntensity: 50,
    defaultScale: 100,
  },
  {
    id: 'silkscreen-mesh-110',
    name: '110-Mesh Screenprint Weave',
    category: 'printmaking',
    categoryLabel: 'Printmaking & Zine Press',
    description: 'Fine diagonal diamond ink deposit pattern from manual squeegee passes.',
    blendMode: 'multiply',
    defaultIntensity: 40,
    defaultScale: 100,
  },
  {
    id: 'offset-litho-rosette',
    name: 'CMYK Offset Print Rosette',
    category: 'printmaking',
    categoryLabel: 'Printmaking & Zine Press',
    description: 'Micro-moiré four-angle rosette structure of commercial lithography.',
    blendMode: 'multiply',
    defaultIntensity: 44,
    defaultScale: 90,
  },
  {
    id: 'distressed-rubber-stamp',
    name: 'Dry Ink Pad Stamp Distress',
    category: 'printmaking',
    categoryLabel: 'Printmaking & Zine Press',
    description: 'Thresholded fractal erosion cutting organic ink dropouts across text.',
    blendMode: 'multiply',
    defaultIntensity: 55,
    defaultScale: 100,
  },
  {
    id: 'carbon-copy-manifold',
    name: 'Blue Typewriter Carbon Smudge',
    category: 'printmaking',
    categoryLabel: 'Printmaking & Zine Press',
    description: 'Soft mechanical haloing and pressure smudges from carbon manifold paper.',
    blendMode: 'multiply',
    defaultIntensity: 45,
    defaultScale: 100,
  },
  {
    id: 'thermal-receipt-roll',
    name: 'POS Thermal Scan Striations',
    category: 'printmaking',
    categoryLabel: 'Printmaking & Zine Press',
    description: 'Subtle vertical heat-head scanlines and slight satin sheen.',
    blendMode: 'overlay',
    defaultIntensity: 38,
    defaultScale: 100,
  },
  {
    id: 'woodblock-relief-grain',
    name: 'Carved Ukiyo-e Woodblock Grain',
    category: 'printmaking',
    categoryLabel: 'Printmaking & Zine Press',
    description: 'Organic wood-ring linear grain bleeding through solid ink fills.',
    blendMode: 'multiply',
    defaultIntensity: 50,
    defaultScale: 110,
  },

  // ──────────────────────────────────────────────────────────────────────────
  // CATEGORY C: Plastic, ID Cards & Holographic Foils (11 Textures)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'glossy-pvc-id-card',
    name: 'Laminated PVC ID Badge',
    category: 'plastic',
    categoryLabel: 'Plastic, ID & Holographic',
    description: 'Crisp diagonal 135-degree specular reflection band and micro-bevel border.',
    blendMode: 'overlay',
    defaultIntensity: 55,
    defaultScale: 100,
  },
  {
    id: 'matte-frosted-polycarbonate',
    name: 'Sandblasted Polycarbonate',
    category: 'plastic',
    categoryLabel: 'Plastic, ID & Holographic',
    description: 'Ultra-fine isotropic micro-bead pass with soft zero-glare diffusion.',
    blendMode: 'overlay',
    defaultIntensity: 40,
    defaultScale: 100,
  },
  {
    id: 'rainbow-hologram-foil',
    name: 'Rainbow Iridescent Diffraction',
    category: 'plastic',
    categoryLabel: 'Plastic, ID & Holographic',
    description: 'Multi-stop spectral gradient sweep masked by fine micro-grooves.',
    blendMode: 'overlay',
    defaultIntensity: 65,
    defaultScale: 100,
  },
  {
    id: 'starburst-holo-laminate',
    name: 'Y2K Starburst Holographic',
    category: 'plastic',
    categoryLabel: 'Plastic, ID & Holographic',
    description: 'Repeating sparkling 4-point star refraction lattice.',
    blendMode: 'screen',
    defaultIntensity: 60,
    defaultScale: 100,
  },
  {
    id: 'prismatic-security-guilloche',
    name: 'Banknote Spirograph Guilloche',
    category: 'plastic',
    categoryLabel: 'Plastic, ID & Holographic',
    description: 'Interlocking sinusoidal vector security curves across the card.',
    blendMode: 'overlay',
    defaultIntensity: 45,
    defaultScale: 100,
  },
  {
    id: 'brushed-titanium-metal',
    name: 'Anodized Brushed Titanium',
    category: 'plastic',
    categoryLabel: 'Plastic, ID & Holographic',
    description: 'Horizontal metallic hairlines with cool specular gradient reflection.',
    blendMode: 'overlay',
    defaultIntensity: 50,
    defaultScale: 100,
  },
  {
    id: 'embossed-credit-plate',
    name: 'Raised Metallic Card Rim',
    category: 'plastic',
    categoryLabel: 'Plastic, ID & Holographic',
    description: 'Specular perimeter rim highlight and embossed metallic plate corners.',
    blendMode: 'overlay',
    defaultIntensity: 48,
    defaultScale: 100,
  },
  {
    id: 'lanyard-vinyl-pouch',
    name: 'Clear Vinyl Pass Pouch',
    category: 'plastic',
    categoryLabel: 'Plastic, ID & Holographic',
    description: 'Top lanyard slot punch and soft plastic ripple specular reflections.',
    blendMode: 'overlay',
    defaultIntensity: 50,
    defaultScale: 100,
  },
  {
    id: 'crinkled-cello-wrap',
    name: 'Glossy Cellophane Wrapper',
    category: 'plastic',
    categoryLabel: 'Plastic, ID & Holographic',
    description: 'Sharp geometric polygonal crease highlights and fold refraction.',
    blendMode: 'screen',
    defaultIntensity: 52,
    defaultScale: 110,
  },
  {
    id: 'liquid-chrome-sheen',
    name: 'Y2K Cyber Liquid Metal',
    category: 'plastic',
    categoryLabel: 'Plastic, ID & Holographic',
    description: 'Domain-distorted liquid chrome reflection curves.',
    blendMode: 'overlay',
    defaultIntensity: 58,
    defaultScale: 100,
  },
  {
    id: 'gold-leaf-kintsugi',
    name: 'Metallic Gold Foil Leaf',
    category: 'plastic',
    categoryLabel: 'Plastic, ID & Holographic',
    description: 'Irregular metallic gold foil flakes along card accents and edges.',
    blendMode: 'overlay',
    defaultIntensity: 62,
    defaultScale: 100,
  },

  // ──────────────────────────────────────────────────────────────────────────
  // CATEGORY D: Analog Film, CRT & Vintage Wear (11 Textures)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'kodak-portra-35mm',
    name: 'Kodak Portra 35mm Grain',
    category: 'film',
    categoryLabel: 'Analog Film & Vintage Wear',
    description: 'Organic silver-halide clumping in midtones with warm color roll-off.',
    blendMode: 'overlay',
    defaultIntensity: 46,
    defaultScale: 100,
  },
  {
    id: 'ilford-hp5-pushed-1600',
    name: 'Ilford HP5 Pushed 1600 Grain',
    category: 'film',
    categoryLabel: 'Analog Film & Vintage Wear',
    description: 'Chunky tactile monochrome silver grain for moody high-contrast cards.',
    blendMode: 'overlay',
    defaultIntensity: 58,
    defaultScale: 110,
  },
  {
    id: 'polaroid-sx70-emulsion',
    name: 'Instant Polaroid SX-70 Spread',
    category: 'film',
    categoryLabel: 'Analog Film & Vintage Wear',
    description: 'Subtle vertical chemical developer bars and soft edge vignetting.',
    blendMode: 'multiply',
    defaultIntensity: 42,
    defaultScale: 100,
  },
  {
    id: 'vhs-tracking-scanlines',
    name: '240p VHS Tracking Scanlines',
    category: 'film',
    categoryLabel: 'Analog Film & Vintage Wear',
    description: '2px horizontal alternating scanlines with subtle sync jitter.',
    blendMode: 'overlay',
    defaultIntensity: 50,
    defaultScale: 100,
  },
  {
    id: 'crt-trinitron-grille',
    name: 'Sony Trinitron Aperture Grille',
    category: 'film',
    categoryLabel: 'Analog Film & Vintage Wear',
    description: 'Vertical RGB phosphor grille bars with gentle barrel curvature.',
    blendMode: 'overlay',
    defaultIntensity: 45,
    defaultScale: 90,
  },
  {
    id: 'folded-magazine-quad',
    name: '4-Way Folded Poster Crease',
    category: 'film',
    categoryLabel: 'Analog Film & Vintage Wear',
    description: 'Crisp horizontal and vertical cross-fold wear with highlight and shadow.',
    blendMode: 'multiply',
    defaultIntensity: 55,
    defaultScale: 100,
  },
  {
    id: 'diagonal-pocket-crease',
    name: 'Dog-Ear Pocket Fold (32°)',
    category: 'film',
    categoryLabel: 'Analog Film & Vintage Wear',
    description: 'Top-right 32-degree diagonal paper crease line from notebook storage.',
    blendMode: 'multiply',
    defaultIntensity: 48,
    defaultScale: 100,
  },
  {
    id: 'dust-and-hair-darkroom',
    name: 'Darkroom Dust & Negative Scratches',
    category: 'film',
    categoryLabel: 'Analog Film & Vintage Wear',
    description: 'Fine white/black filament hairs and archival film dust specks.',
    blendMode: 'overlay',
    defaultIntensity: 40,
    defaultScale: 100,
  },
  {
    id: 'sun-bleached-book-spine',
    name: 'UV-Faded Edge Patina',
    category: 'film',
    categoryLabel: 'Analog Film & Vintage Wear',
    description: 'Warm oxidized yellowing and solarization along top and left borders.',
    blendMode: 'multiply',
    defaultIntensity: 45,
    defaultScale: 100,
  },
  {
    id: 'espresso-ring-stain',
    name: 'Notebook Espresso Ring Mark',
    category: 'film',
    categoryLabel: 'Analog Film & Vintage Wear',
    description: 'Faint circular coffee water-ring drying mark in the lower quadrant.',
    blendMode: 'multiply',
    defaultIntensity: 50,
    defaultScale: 100,
  },
  {
    id: 'microfiche-archive-scan',
    name: 'Library Microfiche Scan Aberration',
    category: 'film',
    categoryLabel: 'Analog Film & Vintage Wear',
    description: 'Subtle green/amber chromatic aberration and radial lens scan lines.',
    blendMode: 'overlay',
    defaultIntensity: 42,
    defaultScale: 100,
  },

  // ──────────────────────────────────────────────────────────────────────────
  // CATEGORY E: Nano-Textures, Grids & Architectural Surfaces (11 Textures)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'warm-nano-texture-matte',
    name: 'Warm Nano-Texture Matte',
    category: 'architectural',
    categoryLabel: 'Nano-Textures & Architectural',
    description: 'Ultra-fine sub-pixel silica micro-matte diffuser with zero reflection.',
    blendMode: 'multiply',
    defaultIntensity: 35,
    defaultScale: 85,
  },
  {
    id: 'bookcloth-buckram-weave',
    name: 'Hardcover Library Buckram',
    category: 'architectural',
    categoryLabel: 'Nano-Textures & Architectural',
    description: 'Starch-coated heavy thread grid with subtle bookbinding sheen.',
    blendMode: 'multiply',
    defaultIntensity: 46,
    defaultScale: 100,
  },
  {
    id: 'swiss-millimeter-grid',
    name: '1mm & 5mm Engineering Grid',
    category: 'architectural',
    categoryLabel: 'Nano-Textures & Architectural',
    description: 'Hairline 0.5px technical drafting rules at 8% ink opacity.',
    blendMode: 'multiply',
    defaultIntensity: 40,
    defaultScale: 100,
  },
  {
    id: 'isometric-axonometric-grid',
    name: '30° / 60° Axonometric Grid',
    category: 'architectural',
    categoryLabel: 'Nano-Textures & Architectural',
    description: 'Architectural isometric triangle coordinate lattice.',
    blendMode: 'multiply',
    defaultIntensity: 38,
    defaultScale: 100,
  },
  {
    id: 'dot-matrix-bullet-journal',
    name: '5mm Bullet Journal Dot Grid',
    category: 'architectural',
    categoryLabel: 'Nano-Textures & Architectural',
    description: 'Precise 1.2px ink dots spaced at 20px intervals.',
    blendMode: 'multiply',
    defaultIntensity: 40,
    defaultScale: 100,
  },
  {
    id: 'cyanotype-blueprint',
    name: 'Prussian Blue Blueprint Grain',
    category: 'architectural',
    categoryLabel: 'Nano-Textures & Architectural',
    description: 'White technical registration ticks over cyan fiber paper grain.',
    blendMode: 'multiply',
    defaultIntensity: 48,
    defaultScale: 100,
  },
  {
    id: 'perforated-ticket-stub',
    name: 'Cinema Ticket Stub Perforation',
    category: 'architectural',
    categoryLabel: 'Nano-Textures & Architectural',
    description: 'Notched edge punch holes and dashed tear perforation line.',
    blendMode: 'multiply',
    defaultIntensity: 52,
    defaultScale: 100,
  },
  {
    id: 'embossed-morocco-leather',
    name: 'Pebble Morocco Leatherette',
    category: 'architectural',
    categoryLabel: 'Nano-Textures & Architectural',
    description: 'Organic cellular Voronoi micro-pebbling with soft relief.',
    blendMode: 'multiply',
    defaultIntensity: 45,
    defaultScale: 105,
  },
  {
    id: 'architectural-concrete-pore',
    name: 'Fair-Faced Cast Concrete',
    category: 'architectural',
    categoryLabel: 'Nano-Textures & Architectural',
    description: 'Smooth mineral pores and architectural tie-rod perimeter marks.',
    blendMode: 'multiply',
    defaultIntensity: 42,
    defaultScale: 100,
  },
  {
    id: 'music-manuscript-staves',
    name: '5-Line Musical Manuscript Staff',
    category: 'architectural',
    categoryLabel: 'Nano-Textures & Architectural',
    description: 'Subtle horizontal music staff rulings across the card field.',
    blendMode: 'multiply',
    defaultIntensity: 38,
    defaultScale: 100,
  },
  {
    id: 'japanese-genkoyoshi-grid',
    name: 'Genkoyoshi Manuscript Grid',
    category: 'architectural',
    categoryLabel: 'Nano-Textures & Architectural',
    description: 'Squared vertical/horizontal character cells with center editorial alley.',
    blendMode: 'multiply',
    defaultIntensity: 40,
    defaultScale: 100,
  },
];

/**
 * Returns procedural SVG/CSS styling for any of the 55 textures
 */
export function getTextureStyle(
  textureId: string,
  intensity: number = 50,
  scale: number = 100,
  blendModeOverride?: 'multiply' | 'overlay' | 'soft-light' | 'screen'
): React.CSSProperties {
  const texture = SURFACE_TEXTURES_55.find((t) => t.id === textureId) || SURFACE_TEXTURES_55[0];
  const opacity = (intensity / 100).toFixed(2);
  const blendMode = blendModeOverride || texture.blendMode;

  // Custom procedural CSS backgrounds for distinct visual presence
  if (textureId === 'cotton-rag-300gsm') {
    return {
      backgroundImage: `radial-gradient(rgba(0,0,0,0.22) 1px, transparent 0)`,
      backgroundSize: `${3 * (scale / 100)}px ${3 * (scale / 100)}px`,
      mixBlendMode: blendMode,
      opacity: Number(opacity),
    };
  }

  if (textureId === 'halftone-comic-45deg' || textureId === 'halftone-zine-coarse') {
    const dotSize = textureId === 'halftone-zine-coarse' ? 9 : 5;
    return {
      backgroundImage: `radial-gradient(circle, rgba(0,0,0,0.35) 1.5px, transparent 1.6px)`,
      backgroundSize: `${dotSize * (scale / 100)}px ${dotSize * (scale / 100)}px`,
      backgroundPosition: '0 0, 50% 50%',
      mixBlendMode: blendMode,
      opacity: Number(opacity),
    };
  }

  if (textureId === 'swiss-millimeter-grid' || textureId === 'japanese-genkoyoshi-grid') {
    const gridSize = textureId === 'japanese-genkoyoshi-grid' ? 24 : 12;
    return {
      backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px)`,
      backgroundSize: `${gridSize * (scale / 100)}px ${gridSize * (scale / 100)}px`,
      mixBlendMode: blendMode,
      opacity: Number(opacity),
    };
  }

  if (textureId === 'dot-matrix-bullet-journal') {
    return {
      backgroundImage: `radial-gradient(rgba(0,0,0,0.28) 1.2px, transparent 1.2px)`,
      backgroundSize: `${20 * (scale / 100)}px ${20 * (scale / 100)}px`,
      mixBlendMode: blendMode,
      opacity: Number(opacity),
    };
  }

  if (textureId === 'rainbow-hologram-foil' || textureId === 'starburst-holo-laminate') {
    return {
      background: `linear-gradient(125deg, rgba(255,154,158,0.5) 0%, rgba(254,207,239,0.5) 25%, rgba(161,196,253,0.5) 50%, rgba(194,233,251,0.5) 75%, rgba(253,203,241,0.5) 100%)`,
      mixBlendMode: blendMode,
      opacity: Number(opacity),
    };
  }

  if (textureId === 'vhs-tracking-scanlines' || textureId === 'crt-trinitron-grille') {
    return {
      backgroundImage: `repeating-linear-gradient(0deg, rgba(0,0,0,0.18), rgba(0,0,0,0.18) 1.5px, transparent 1.5px, transparent 3px)`,
      mixBlendMode: blendMode,
      opacity: Number(opacity),
    };
  }

  if (textureId === 'folded-magazine-quad') {
    return {
      backgroundImage: `linear-gradient(90deg, transparent 49.5%, rgba(0,0,0,0.14) 50%, rgba(255,255,255,0.2) 50.5%, transparent 51%), linear-gradient(0deg, transparent 49.5%, rgba(0,0,0,0.14) 50%, rgba(255,255,255,0.2) 50.5%, transparent 51%)`,
      boxShadow: 'inset 0 0 35px rgba(0,0,0,0.08)',
      mixBlendMode: blendMode,
      opacity: Number(opacity),
    };
  }

  // Default: Organic tactile silica micro-grain
  return {
    backgroundImage: `radial-gradient(rgba(0,0,0,0.2) 1px, transparent 0)`,
    backgroundSize: `${4 * (scale / 100)}px ${4 * (scale / 100)}px`,
    mixBlendMode: blendMode,
    opacity: Number(opacity),
  };
}
