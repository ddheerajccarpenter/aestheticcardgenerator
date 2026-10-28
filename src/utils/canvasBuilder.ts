import type {
  CanvasDocument,
  CanvasObject,
  TextCanvasObject,
  ImageCanvasObject,
  ShapeCanvasObject,
  CardTemplate,
  ShapeKind,
} from '../types/card';
import { ASSET_AVATARS } from '../data/canvasAssets';

export const DEFAULT_CANVAS_FONT_FAMILY = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

export const resolveCanvasFontFamily = (fontFamily?: string): string => {
  if (!fontFamily || fontFamily.trim().toLowerCase() === 'inter') {
    return DEFAULT_CANVAS_FONT_FAMILY;
  }
  return fontFamily;
};

// Helper to generate unique object IDs
export const createObjectId = (prefix = 'obj'): string => {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
};

// Preset canvas dimensions with labels
export interface CanvasDimensionPreset {
  id: string;
  label: string;
  width: number;
  height: number;
  ratio: string;
  description: string;
}

export const CANVAS_DIMENSION_PRESETS: CanvasDimensionPreset[] = [
  { id: 'id-landscape', label: 'ID Card (Landscape)', width: 960, height: 600, ratio: '8:5', description: 'Standard wallet / plastic ID card proportion' },
  { id: 'id-portrait', label: 'ID Badge (Lanyard)', width: 640, height: 960, ratio: '2:3', description: 'Vertical lanyard badge & event credentials' },
  { id: 'square', label: 'Square (1:1)', width: 1080, height: 1080, ratio: '1:1', description: 'Instagram post / Album art / Profile card' },
  { id: 'social-portrait', label: 'Social Portrait (4:5)', width: 1080, height: 1350, ratio: '4:5', description: 'Vertical feed & showcase cards' },
  { id: 'story', label: 'Story / Reel (9:16)', width: 1080, height: 1920, ratio: '9:16', description: 'Full screen mobile story format' },
  { id: 'landscape-hd', label: 'Landscape Banner (16:9)', width: 1920, height: 1080, ratio: '16:9', description: 'Wide screen desktop / header format' },
];

// Create a pristine blank canvas document
export const createBlankCanvas = (
  width = 960,
  height = 600,
  background = '#ffffff',
  title = 'Untitled Card'
): CanvasDocument => {
  return {
    id: createObjectId('doc'),
    title,
    canvasWidth: width,
    canvasHeight: height,
    background,
    objects: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

// Quick object creators
export const createTextObject = (
  overrides?: Partial<TextCanvasObject>
): TextCanvasObject => ({
  id: createObjectId('text'),
  type: 'text',
  name: overrides?.name || 'Text Layer',
  text: overrides?.text || 'Enter your text here',
  fontFamily: resolveCanvasFontFamily(overrides?.fontFamily),
  fontSize: overrides?.fontSize || 24,
  fontWeight: overrides?.fontWeight || '500',
  fontStyle: overrides?.fontStyle || 'normal',
  color: overrides?.color || '#181a20',
  align: overrides?.align || 'left',
  lineHeight: overrides?.lineHeight || 1.3,
  letterSpacing: overrides?.letterSpacing || 0,
  x: overrides?.x ?? 80,
  y: overrides?.y ?? 80,
  width: overrides?.width ?? 320,
  height: overrides?.height ?? 60,
  rotation: overrides?.rotation ?? 0,
  locked: false,
  visible: true,
  zIndex: overrides?.zIndex ?? 10,
});

export const createImageObject = (
  src: string,
  overrides?: Partial<ImageCanvasObject>
): ImageCanvasObject => ({
  id: createObjectId('img'),
  type: 'image',
  name: overrides?.name || 'Photo Layer',
  src,
  objectFit: overrides?.objectFit || 'cover',
  opacity: overrides?.opacity ?? 1,
  borderRadius: overrides?.borderRadius ?? 8,
  x: overrides?.x ?? 60,
  y: overrides?.y ?? 80,
  width: overrides?.width ?? 260,
  height: overrides?.height ?? 320,
  rotation: overrides?.rotation ?? 0,
  locked: false,
  visible: true,
  zIndex: overrides?.zIndex ?? 5,
});

export const createShapeObject = (
  shape: ShapeKind,
  overrides?: Partial<ShapeCanvasObject>
): ShapeCanvasObject => ({
  id: createObjectId('shape'),
  type: 'shape',
  name: overrides?.name || `${shape.charAt(0).toUpperCase() + shape.slice(1)} Layer`,
  shape,
  fill: overrides?.fill || '#e4ddcf',
  stroke: overrides?.stroke || 'transparent',
  strokeWidth: overrides?.strokeWidth ?? 0,
  opacity: overrides?.opacity ?? 1,
  borderRadius: overrides?.borderRadius ?? 0,
  x: overrides?.x ?? 60,
  y: overrides?.y ?? 60,
  width: overrides?.width ?? 120,
  height: overrides?.height ?? 120,
  rotation: overrides?.rotation ?? 0,
  locked: false,
  visible: true,
  zIndex: overrides?.zIndex ?? 1,
});

// Converts any CardTemplate into a fully editable CanvasDocument
export const templateToCanvasDoc = (template: CardTemplate): CanvasDocument => {
  // If template already has a native multi-object canvas document, return a deep clone with fresh IDs
  if (template.canvasDoc && template.canvasDoc.objects.length > 0) {
    const doc = template.canvasDoc;
    return {
      ...doc,
      id: createObjectId('doc'),
      title: template.title,
      objects: doc.objects.map((obj) => ({
        ...obj,
        id: createObjectId(obj.type),
      })),
      updatedAt: new Date().toISOString(),
    };
  }

  // Fallback: convert traditional quote/badge template into editable canvas objects
  const width = template.layoutHint === 'vertical' ? 640 : template.layoutHint === 'square' ? 1080 : 960;
  const height = template.layoutHint === 'vertical' ? 960 : template.layoutHint === 'square' ? 1080 : 600;

  const fontFamMap: Record<string, string> = {
    editorial: "'Newsreader', Georgia, serif",
    serif: "'Playfair Display', Georgia, serif",
    instrument: "'Instrument Serif', Georgia, serif",
    cormorant: "'Cormorant Garamond', Georgia, serif",
    syne: "'Syne', sans-serif",
    'space-grotesk': "'Space Grotesk', sans-serif",
    unbounded: "'Unbounded', sans-serif",
    sans: "'Plus Jakarta Sans', Inter, sans-serif",
    mono: "'JetBrains Mono', monospace",
    'space-mono': "'Space Mono', monospace",
    pixel: "'VT323', monospace",
    caveat: "'Caveat', cursive",
    reenie: "'Reenie Beanie', cursive",
  };
  const fontFam = fontFamMap[template.font] || DEFAULT_CANVAS_FONT_FAMILY;

  if (template.category === 'id-card' || template.hasPhotoArea) {
    const isLandscape = width >= height;
    const image = isLandscape
      ? createImageObject(ASSET_AVATARS.studentScholar, { name: 'Portrait Photo', x: 60, y: 120, width: 220, height: 330, borderRadius: 8, zIndex: 5 })
      : createImageObject(ASSET_AVATARS.studentScholar, { name: 'Portrait Photo', x: (width - width * 0.48) / 2, y: 105, width: width * 0.48, height: height * 0.34, borderRadius: 8, zIndex: 5 });
    const textX = isLandscape ? 330 : 60;
    const textWidth = isLandscape ? width - 390 : width - 120;
    const titleY = isLandscape ? 125 : height * 0.49;
    const quoteY = titleY + 78;
    const authorY = quoteY + 90;
    const objects: CanvasObject[] = [
      createShapeObject('rounded-rect', {
        name: 'Card Base', x: 30, y: 30, width: width - 60, height: height - 60,
        fill: template.theme.bg, stroke: template.showBorder ? (template.theme.border || 'rgba(0,0,0,0.15)') : 'transparent',
        strokeWidth: template.showBorder ? 2 : 0, borderRadius: template.borderRadius || 16, zIndex: 1,
      }),
      createTextObject({ name: 'Header Tag', text: template.tag, fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: '600', color: template.theme.ink, x: 60, y: 58, width: width - 240, height: 32, zIndex: 10 }),
      createShapeObject('rounded-rect', { name: 'Badge Box', x: width - 190, y: 54, width: 120, height: 36, fill: 'transparent', stroke: template.theme.ink, strokeWidth: 1.5, borderRadius: 6, zIndex: 9 }),
      createTextObject({ name: 'Badge Text', text: template.badge, fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: '600', color: template.theme.ink, x: width - 190, y: 61, width: 120, height: 24, align: 'center', zIndex: 10 }),
      image,
      createTextObject({ name: 'Card Title', text: template.title, fontFamily: fontFam, fontSize: 30, fontWeight: '700', color: template.theme.ink, x: textX, y: titleY, width: textWidth, height: 70, zIndex: 15 }),
      createTextObject({ name: 'Access Details', text: template.quote, fontFamily: "'JetBrains Mono', monospace", fontSize: 17, fontWeight: '600', color: template.theme.ink, x: textX, y: quoteY, width: textWidth, height: 80, lineHeight: 1.35, zIndex: 15 }),
      createShapeObject('line', { name: 'ID Divider', x: textX, y: authorY - 8, width: textWidth, height: 2, fill: template.theme.ink, opacity: 0.28, zIndex: 4 }),
      createTextObject({ name: 'Issuer', text: template.author, fontFamily: fontFam, fontSize: 17, fontWeight: '500', color: template.theme.ink, x: textX, y: authorY + 8, width: textWidth, height: 52, zIndex: 15 }),
      createShapeObject('barcode', { name: 'Access Barcode', x: isLandscape ? 60 : 60, y: isLandscape ? height - 100 : height - 115, width: isLandscape ? 220 : width - 120, height: 48, fill: template.theme.ink, payload: template.id, showTextLabel: false, zIndex: 7 }),
      createTextObject({ name: 'Category Mark', text: template.categoryLabel.toUpperCase(), fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: '600', color: template.theme.ink, align: isLandscape ? 'right' : 'center', x: isLandscape ? textX : 60, y: height - 80, width: isLandscape ? textWidth : width - 120, height: 26, zIndex: 15 }),
    ];

    return {
      id: createObjectId('doc'),
      title: template.title,
      canvasWidth: width,
      canvasHeight: height,
      background: template.theme.bg || '#ffffff',
      objects,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  const objects: CanvasObject[] = [
    // Background card border shape
    createShapeObject('rounded-rect', {
      name: 'Card Base',
      x: 30,
      y: 30,
      width: width - 60,
      height: height - 60,
      fill: template.theme.bg,
      stroke: template.showBorder ? (template.theme.border || 'rgba(0,0,0,0.15)') : 'transparent',
      strokeWidth: template.showBorder ? 2 : 0,
      borderRadius: template.borderRadius || 16,
      zIndex: 1,
    }),
    // Top tag
    createTextObject({
      name: 'Header Tag',
      text: template.tag,
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 14,
      fontWeight: '600',
      color: template.theme.ink,
      x: 70,
      y: 65,
      width: width - 260,
      height: 30,
      align: 'left',
      zIndex: 10,
    }),
    // Top badge
    createShapeObject('rounded-rect', {
      name: 'Badge Box',
      x: width - 180,
      y: 60,
      width: 110,
      height: 32,
      fill: 'transparent',
      stroke: template.theme.ink,
      strokeWidth: 1.5,
      borderRadius: 6,
      zIndex: 9,
    }),
    createTextObject({
      name: 'Badge Text',
      text: template.badge,
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 12,
      fontWeight: '600',
      color: template.theme.ink,
      x: width - 180,
      y: 66,
      width: 110,
      height: 24,
      align: 'center',
      zIndex: 10,
    }),
    // Quote body
    createTextObject({
      name: 'Card Quote',
      text: `“${template.quote}”`,
      fontFamily: fontFam,
      fontSize: template.fontSize || 28,
      fontWeight: '500',
      color: template.theme.ink,
      x: 70,
      y: height > 700 ? 200 : 140,
      width: width - 140,
      height: height > 700 ? 340 : 260,
      align: template.align || 'left',
      lineHeight: 1.45,
      zIndex: 15,
    }),
    // Author
    createTextObject({
      name: 'Author Citation',
      text: `— ${template.author}`,
      fontFamily: fontFam,
      fontSize: 16,
      fontWeight: '600',
      color: template.theme.ink,
      x: 70,
      y: height - 120,
      width: width - 140,
      height: 40,
      align: template.align || 'left',
      zIndex: 15,
    }),
  ];

  return {
    id: createObjectId('doc'),
    title: template.title,
    canvasWidth: width,
    canvasHeight: height,
    background: template.theme.bg || '#ffffff',
    objects,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};
