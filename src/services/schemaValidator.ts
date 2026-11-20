// src/services/schemaValidator.ts
import type {
  CanvasDocument,
  CanvasObject,
  CardState,
  TextCanvasObject,
  ImageCanvasObject,
  ShapeCanvasObject,
} from '../types/card';

/**
 * Checks for prototype pollution patterns (__proto__, constructor, prototype)
 */
export function isPrototypePolluted(obj: unknown): boolean {
  if (!obj || typeof obj !== 'object') return false;
  const visited = new Set<unknown>();

  const check = (cur: any): boolean => {
    if (!cur || typeof cur !== 'object') return false;
    if (visited.has(cur)) return false;
    visited.add(cur);

    if (
      Object.prototype.hasOwnProperty.call(cur, '__proto__') ||
      Object.prototype.hasOwnProperty.call(cur, 'constructor') ||
      Object.prototype.hasOwnProperty.call(cur, 'prototype')
    ) {
      return true;
    }

    for (const key of Object.keys(cur)) {
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        return true;
      }
      if (cur[key] && typeof cur[key] === 'object' && check(cur[key])) {
        return true;
      }
    }
    return false;
  };

  return check(obj);
}

/**
 * Safe JSON parse with prototype pollution stripping reviver
 */
export function safeJsonParse<T = unknown>(jsonStr: string | null | undefined): T | null {
  if (!jsonStr || typeof jsonStr !== 'string') return null;
  try {
    const parsed = JSON.parse(jsonStr, (key, value) => {
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        return undefined;
      }
      return value;
    });
    return parsed as T;
  } catch {
    return null;
  }
}

/**
 * Sanitize URLs to prevent javascript: or malicious protocol execution
 */
export function sanitizeUrl(url: unknown, defaultFallback = ''): string {
  if (typeof url !== 'string') return defaultFallback;
  const trimmed = url.trim();
  // Allow data:image/, blob:, https://, http://, and relative paths starting with /
  if (
    trimmed.startsWith('data:image/') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('./')
  ) {
    return trimmed;
  }
  return defaultFallback;
}

/**
 * Validates and sanitizes a CSS color string to prevent injection
 */
export function sanitizeColor(color: unknown, defaultColor = '#191715'): string {
  if (typeof color !== 'string') return defaultColor;
  const trimmed = color.trim();
  if (trimmed === 'transparent') return 'transparent';
  // Standard hex #RGB, #RGBA, #RRGGBB, #RRGGBBAA
  if (/^#[0-9a-fA-F]{3,8}$/.test(trimmed)) {
    return trimmed;
  }
  // Standard rgba / rgb / hsl syntax
  if (/^(rgb|hsl)a?\([0-9.,%\s-]+\)$/i.test(trimmed)) {
    return trimmed;
  }
  return defaultColor;
}

/**
 * Validates and sanitizes CanvasDocument objects imported or loaded from storage
 */
export function sanitizeAndValidateCanvasDocument(input: unknown): CanvasDocument | null {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return null;
  }
  if (isPrototypePolluted(input)) {
    console.warn('Blocked prototype pollution attempt in CanvasDocument schema');
    return null;
  }

  const raw = input as Record<string, any>;

  // Validate canvas dimensions
  const canvasWidth =
    typeof raw.canvasWidth === 'number' && Number.isFinite(raw.canvasWidth)
      ? Math.max(100, Math.min(16384, Math.round(raw.canvasWidth)))
      : 1200;
  const canvasHeight =
    typeof raw.canvasHeight === 'number' && Number.isFinite(raw.canvasHeight)
      ? Math.max(100, Math.min(16384, Math.round(raw.canvasHeight)))
      : 630;

  const id = typeof raw.id === 'string' && raw.id.trim() ? raw.id.slice(0, 100) : `doc_${Date.now()}`;
  const title =
    typeof raw.title === 'string' && raw.title.trim()
      ? raw.title.slice(0, 200).replace(/<[^>]*>/g, '').replace(/[<>]/g, '').trim() || 'Untitled Canvas'
      : 'Untitled Canvas';
  const background = sanitizeColor(raw.background, '#191715');

  const now = new Date().toISOString();
  const createdAt = typeof raw.createdAt === 'string' ? raw.createdAt : now;
  const updatedAt = typeof raw.updatedAt === 'string' ? raw.updatedAt : now;

  // Validate objects array (cap at 500 layers to protect against DOM freeze)
  const rawObjects = Array.isArray(raw.objects) ? raw.objects.slice(0, 500) : [];
  const validObjects: CanvasObject[] = [];

  for (let i = 0; i < rawObjects.length; i++) {
    const o = rawObjects[i];
    if (!o || typeof o !== 'object' || Array.isArray(o)) continue;

    const objId = typeof o.id === 'string' && o.id ? o.id.slice(0, 80) : `layer_${i}_${Date.now()}`;
    const name = typeof o.name === 'string' ? o.name.slice(0, 100) : `Layer ${i + 1}`;
    const x = typeof o.x === 'number' && Number.isFinite(o.x) ? Math.max(-10000, Math.min(10000, o.x)) : 0;
    const y = typeof o.y === 'number' && Number.isFinite(o.y) ? Math.max(-10000, Math.min(10000, o.y)) : 0;
    const width =
      typeof o.width === 'number' && Number.isFinite(o.width)
        ? Math.max(1, Math.min(16384, Math.round(o.width)))
        : 100;
    const height =
      typeof o.height === 'number' && Number.isFinite(o.height)
        ? Math.max(1, Math.min(16384, Math.round(o.height)))
        : 100;
    const rotation =
      typeof o.rotation === 'number' && Number.isFinite(o.rotation)
        ? ((Math.round(o.rotation) % 360) + 360) % 360
        : 0;
    const opacity =
      typeof o.opacity === 'number' && Number.isFinite(o.opacity)
        ? Math.max(0, Math.min(1, o.opacity))
        : 1;
    const locked = Boolean(o.locked);
    const visible = o.visible !== false;
    const zIndex = typeof o.zIndex === 'number' && Number.isFinite(o.zIndex) ? o.zIndex : i;
    const isBackground = Boolean(o.isBackground);

    if (o.type === 'text') {
      const text = typeof o.text === 'string' ? o.text.slice(0, 10000) : '';
      const fontFamily = typeof o.fontFamily === 'string' ? o.fontFamily.slice(0, 80) : 'sans';
      const fontSize =
        typeof o.fontSize === 'number' && Number.isFinite(o.fontSize)
          ? Math.max(6, Math.min(500, o.fontSize))
          : 16;
      const fontWeight = ['300', '400', '500', '600', '700', '800', '900'].includes(o.fontWeight)
        ? o.fontWeight
        : '400';
      const fontStyle = o.fontStyle === 'italic' ? 'italic' : 'normal';
      const color = sanitizeColor(o.color, '#efe6d8');
      const align = ['left', 'center', 'right'].includes(o.align) ? o.align : 'left';
      const lineHeight =
        typeof o.lineHeight === 'number' && Number.isFinite(o.lineHeight)
          ? Math.max(0.5, Math.min(5, o.lineHeight))
          : 1.2;
      const letterSpacing =
        typeof o.letterSpacing === 'number' && Number.isFinite(o.letterSpacing)
          ? Math.max(-5, Math.min(20, o.letterSpacing))
          : 0;

      const textObj: TextCanvasObject = {
        id: objId,
        type: 'text',
        name,
        x,
        y,
        width,
        height,
        rotation,
        locked,
        visible,
        zIndex,
        isBackground,
        text,
        fontFamily,
        fontSize,
        fontWeight,
        fontStyle,
        color,
        align,
        lineHeight,
        letterSpacing,
      };
      validObjects.push(textObj);
    } else if (o.type === 'image') {
      const src = sanitizeUrl(o.src, '');
      if (!src) continue; // Skip images with invalid or missing sources
      const objectFit = ['contain', 'cover', 'fill'].includes(o.objectFit) ? o.objectFit : 'cover';
      const borderRadius =
        typeof o.borderRadius === 'number' && Number.isFinite(o.borderRadius)
          ? Math.max(0, Math.min(1000, o.borderRadius))
          : 0;

      const imgObj: ImageCanvasObject = {
        id: objId,
        type: 'image',
        name,
        x,
        y,
        width,
        height,
        rotation,
        locked,
        visible,
        zIndex,
        isBackground,
        src,
        objectFit,
        opacity,
        borderRadius,
        filterPreset: typeof o.filterPreset === 'string' ? o.filterPreset : undefined,
        clipMask: typeof o.clipMask === 'string' ? o.clipMask : undefined,
        naturalWidth: typeof o.naturalWidth === 'number' && Number.isFinite(o.naturalWidth) ? o.naturalWidth : undefined,
        naturalHeight: typeof o.naturalHeight === 'number' && Number.isFinite(o.naturalHeight) ? o.naturalHeight : undefined,
      };
      validObjects.push(imgObj);
    } else if (o.type === 'shape') {
      const shape = typeof o.shape === 'string' ? o.shape : 'rect';
      const fill = sanitizeColor(o.fill, '#312c27');
      const stroke = sanitizeColor(o.stroke, 'transparent');
      const strokeWidth =
        typeof o.strokeWidth === 'number' && Number.isFinite(o.strokeWidth)
          ? Math.max(0, Math.min(50, o.strokeWidth))
          : 0;
      const borderRadius =
        typeof o.borderRadius === 'number' && Number.isFinite(o.borderRadius)
          ? Math.max(0, Math.min(1000, o.borderRadius))
          : 0;
      const payload = typeof o.payload === 'string' ? o.payload.slice(0, 1000) : undefined;
      const showTextLabel = Boolean(o.showTextLabel);
      const stampText = typeof o.stampText === 'string' ? o.stampText.slice(0, 50) : undefined;
      const starRating =
        typeof o.starRating === 'number' && Number.isFinite(o.starRating)
          ? Math.max(0, Math.min(5, o.starRating))
          : undefined;

      const shapeObj: ShapeCanvasObject = {
        id: objId,
        type: 'shape',
        name,
        x,
        y,
        width,
        height,
        rotation,
        locked,
        visible,
        zIndex,
        isBackground,
        shape: shape as any,
        fill,
        stroke,
        strokeWidth,
        opacity,
        borderRadius,
        payload,
        showTextLabel,
        stampText,
        starRating,
      };
      validObjects.push(shapeObj);
    }
  }

  return {
    id,
    title,
    canvasWidth,
    canvasHeight,
    background,
    objects: validObjects,
    createdAt,
    updatedAt,
  };
}

/**
 * Validates and sanitizes CardState objects loaded from localStorage or URL query parameters
 */
export function sanitizeAndValidateCardState(input: unknown): CardState | null {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return null;
  }
  if (isPrototypePolluted(input)) {
    console.warn('Blocked prototype pollution attempt in CardState');
    return null;
  }

  const raw = input as Record<string, any>;

  const docTitle =
    typeof raw.docTitle === 'string'
      ? raw.docTitle.slice(0, 120).replace(/<[^>]*>/g, '').replace(/[<>]/g, '').trim() || 'My Card'
      : 'My Card';
  const quote = typeof raw.quote === 'string' ? raw.quote.slice(0, 5000) : '';
  const author = typeof raw.author === 'string' ? raw.author.slice(0, 500) : '';
  const tag = typeof raw.tag === 'string' ? raw.tag.slice(0, 500) : '';
  const badge = typeof raw.badge === 'string' ? raw.badge.slice(0, 500) : '';

  const bgColor = sanitizeColor(raw.bgColor, '#24211e');
  const inkColor = sanitizeColor(raw.inkColor, '#efe6d8');

  const validFonts = [
    'editorial',
    'serif',
    'instrument',
    'cormorant',
    'syne',
    'space-grotesk',
    'unbounded',
    'mono',
    'space-mono',
    'pixel',
    'caveat',
    'reenie',
    'sans',
  ];
  const fontChoice =
    typeof raw.fontChoice === 'string' &&
    (validFonts.includes(raw.fontChoice) || raw.fontChoice.startsWith('Custom_'))
      ? (raw.fontChoice as any)
      : 'editorial';

  const fontSize =
    typeof raw.fontSize === 'number' && Number.isFinite(raw.fontSize)
      ? Math.max(12, Math.min(120, raw.fontSize))
      : 32;
  const lineHeight =
    typeof raw.lineHeight === 'number' && Number.isFinite(raw.lineHeight)
      ? Math.max(0.8, Math.min(3, raw.lineHeight))
      : undefined;
  const letterSpacing =
    typeof raw.letterSpacing === 'number' && Number.isFinite(raw.letterSpacing)
      ? Math.max(-2, Math.min(10, raw.letterSpacing))
      : undefined;

  const verticalAlign = ['top', 'middle', 'bottom'].includes(raw.verticalAlign)
    ? raw.verticalAlign
    : undefined;
  const surfaceFinish = ['none', 'grain', 'halftone', 'crease', 'lanyard'].includes(raw.surfaceFinish)
    ? raw.surfaceFinish
    : undefined;
  const textureIntensity =
    typeof raw.textureIntensity === 'number' && Number.isFinite(raw.textureIntensity)
      ? Math.max(0, Math.min(100, raw.textureIntensity))
      : undefined;
  const isHolographic = typeof raw.isHolographic === 'boolean' ? raw.isHolographic : undefined;

  const align = ['left', 'center', 'right'].includes(raw.align) ? raw.align : 'left';
  const padding =
    typeof raw.padding === 'number' && Number.isFinite(raw.padding)
      ? Math.max(16, Math.min(128, raw.padding))
      : 48;
  const borderRadius =
    typeof raw.borderRadius === 'number' && Number.isFinite(raw.borderRadius)
      ? Math.max(0, Math.min(64, raw.borderRadius))
      : 16;

  const showGrain = Boolean(raw.showGrain);
  const showBorder = Boolean(raw.showBorder);
  const showIcon = Boolean(raw.showIcon);
  const iconName = typeof raw.iconName === 'string' ? raw.iconName.slice(0, 50) : 'sparkles';
  const aspectRatio = ['1:1', '4:5', '9:16', '16:9', '3:4', '2:3'].includes(raw.aspectRatio)
    ? raw.aspectRatio
    : '1:1';

  return {
    docTitle,
    quote,
    author,
    tag,
    badge,
    bgColor,
    inkColor,
    fontChoice,
    fontSize,
    lineHeight,
    letterSpacing,
    verticalAlign,
    surfaceFinish,
    textureIntensity,
    isHolographic,
    align,
    padding,
    borderRadius,
    showGrain,
    showBorder,
    showIcon,
    iconName,
    aspectRatio,
  };
}
