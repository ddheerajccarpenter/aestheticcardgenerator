export type AspectRatioId = '1:1' | '4:5' | '9:16' | '16:9' | '3:4' | '2:3';

export interface AspectRatioPreset {
  id: AspectRatioId;
  label: string;
  ratio: string;
  width: number;
  height: number;
  icon: string;
}

export type FontChoice =
  | 'editorial'      // Newsreader (Editorial Serif)
  | 'serif'          // Playfair Display (Editorial Serif)
  | 'instrument'     // Instrument Serif (Editorial Serif)
  | 'cormorant'      // Cormorant Garamond (Editorial Serif)
  | 'syne'           // Syne (Display & Y2K)
  | 'space-grotesk'  // Space Grotesk (Display & Y2K)
  | 'unbounded'      // Unbounded (Display & Y2K)
  | 'mono'           // JetBrains Mono (Archival Mono & Pixel)
  | 'space-mono'     // Space Mono (Archival Mono & Pixel)
  | 'pixel'          // VT323 (Archival Mono & Pixel)
  | 'caveat'         // Caveat (Handwritten & Zine)
  | 'reenie'         // Reenie Beanie (Handwritten & Zine)
  | 'sans';          // Plus Jakarta Sans / Inter

export type VerticalAlign = 'top' | 'middle' | 'bottom';
export type SurfaceFinish = 'none' | 'grain' | 'halftone' | 'crease' | 'lanyard';

export interface CardTheme {
  id: string;
  name: string;
  bg: string;
  ink: string;
  border?: string;
  category: 'editorial' | 'vintage' | 'minimal' | 'pastel' | 'vibrant' | 'badge';
}

export interface CardTemplate {
  id: string;
  title: string;
  category: 'quote' | 'reflection' | 'notes' | 'review' | 'poetry' | 'minimal' | 'id-card' | 'pastel' | 'fan' | 'vintage' | 'school';
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
  // Extended fields for richer ID-card layouts
  tags?: string[];
  hasPhotoArea?: boolean;
  layoutHint?: 'horizontal' | 'vertical' | 'square';
  accentColor?: string;
  description?: string;
  canvasDoc?: CanvasDocument;
  lineHeight?: number;
  letterSpacing?: number;
  verticalAlign?: VerticalAlign;
  surfaceFinish?: SurfaceFinish;
  textureIntensity?: number;
  isHolographic?: boolean;
}

export interface CardState {
  docTitle: string;
  quote: string;
  author: string;
  tag: string;
  badge: string;
  bgColor: string;
  inkColor: string;
  fontChoice: FontChoice;
  fontSize: number;
  lineHeight?: number;
  letterSpacing?: number;
  verticalAlign?: VerticalAlign;
  surfaceFinish?: SurfaceFinish;
  textureIntensity?: number;
  isHolographic?: boolean;
  align: 'left' | 'center' | 'right';
  padding: number;
  borderRadius: number;
  showGrain: boolean;
  showBorder: boolean;
  showIcon: boolean;
  iconName: string;
  aspectRatio: AspectRatioId;
}

export type AppView = 'home' | 'editor';

export type ExportFormat = 'png-2x' | 'png-1x' | 'webp' | 'svg';

export interface CategoryMeta {
  id: string;
  slug: string;
  path: string;
  title: string;
  subtitle: string;
  description: string;
  longDescription: string;
  useCase: string;
  designTips: string[];
  bestAspectRatios: AspectRatioId[];
  matchedTemplateIds: string[];
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  faq: { q: string; a: string }[];
}

export interface GuideSection {
  heading: string;
  body: string;
  bullets?: string[];
  callout?: { title: string; text: string };
  templateId?: string;
}

export interface GuideArticle {
  slug: string;
  path: string;
  title: string;
  subtitle: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  category: string;
  readTime: string;
  publishedDate: string;
  featuredAspect: AspectRatioId;
  recommendedTemplateIds: string[];
  sections: GuideSection[];
  actionPrompt: string;
}

export interface BlogPost {
  slug: string;
  path: string;
  title: string;
  subtitle: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  category: string;
  readTime: string;
  publishedDate: string;
  author: string;
  featuredTemplateId?: string;
  sections: {
    heading: string;
    body: string;
    bullets?: string[];
    callout?: { title: string; text: string };
    templateId?: string;
    actionPrompt?: string;
  }[];
}

// ─────────────────────────────────────────────────────────────────────────────
// CANVAS EDITOR — object model for the free-form canvas editor
// ─────────────────────────────────────────────────────────────────────────────

export type CanvasObjectType = 'text' | 'image' | 'shape';

export type ShapeKind =
  | 'rect'
  | 'rounded-rect'
  | 'circle'
  | 'ellipse'
  | 'line'
  | 'star'
  | 'heart'
  | 'diamond'
  | 'rubber-stamp'
  | 'security-seal'
  | 'washi-tape'
  | 'rating-stars'
  | 'audio-waveform'
  | 'qr-code'
  | 'barcode';

export type ImageFilterPreset = 'original' | 'dither' | 'photocopy' | 'duotone' | 'warm90s';
export type ImageClipMask = 'none' | 'rect' | 'circle' | 'oval' | 'star' | 'heart' | 'id-frame';

export interface BaseCanvasObject {
  id: string;
  type: CanvasObjectType;
  name: string;
  x: number;       // px from left of canvas
  y: number;       // px from top of canvas
  width: number;   // px
  height: number;  // px
  rotation: number; // degrees
  locked: boolean;
  visible: boolean;
  zIndex: number;
}

export interface TextCanvasObject extends BaseCanvasObject {
  type: 'text';
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: '300' | '400' | '500' | '600' | '700' | '800' | '900';
  fontStyle: 'normal' | 'italic';
  color: string;
  align: 'left' | 'center' | 'right';
  lineHeight: number;
  letterSpacing: number;
}

export interface ImageCanvasObject extends BaseCanvasObject {
  type: 'image';
  src: string;          // data URL or blob URL
  objectFit: 'contain' | 'cover' | 'fill';
  opacity: number;      // 0–1
  borderRadius: number; // px
  filterPreset?: ImageFilterPreset;
  clipMask?: ImageClipMask;
  filteredSrc?: string; // cached processed canvas dataUrl
}

export interface ShapeCanvasObject extends BaseCanvasObject {
  type: 'shape';
  shape: ShapeKind;
  fill: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
  borderRadius: number; // for rounded-rect
  payload?: string;     // URL or data for QR / Barcode
  showTextLabel?: boolean; // Label underneath barcode/QR
  stampText?: string;   // APPROVED, VIP, etc.
  starRating?: number;  // 0.5 to 5.0
}

export type CanvasObject = TextCanvasObject | ImageCanvasObject | ShapeCanvasObject;

export interface CanvasDocument {
  id: string;
  title: string;
  canvasWidth: number;  // px — the actual output resolution
  canvasHeight: number;
  background: string;   // CSS color or 'transparent'
  objects: CanvasObject[];
  createdAt: string;
  updatedAt: string;
}
