// src/utils/paletteExtractor.ts

export interface ExtractedPalette {
  dominant: string;
  secondary: string;
  accent: string;
  surface: string;
  ink: string;
  swatches: string[];
}

/**
 * Extracts 5 dominant harmonious colors from an image source
 * using canvas downsampling and color clustering.
 */
export async function extractPaletteFromImage(
  imageSource: string | HTMLImageElement
): Promise<ExtractedPalette> {
  let img: HTMLImageElement;
  if (typeof imageSource === 'string') {
    img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.crossOrigin = 'anonymous';
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = imageSource;
    });
  } else {
    img = imageSource;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context not available');
  }

  ctx.drawImage(img, 0, 0, 64, 64);
  const imgData = ctx.getImageData(0, 0, 64, 64).data;

  const colorCounts = new Map<string, number>();

  for (let i = 0; i < imgData.length; i += 4) {
    const a = imgData[i + 3];
    if (a < 128) continue; // Skip transparent pixels

    // Quantize color by rounding to nearest 24 to reduce variance
    const r = Math.round(imgData[i] / 24) * 24;
    const g = Math.round(imgData[i + 1] / 24) * 24;
    const b = Math.round(imgData[i + 2] / 24) * 24;

    const hex = rgbToHex(Math.min(255, r), Math.min(255, g), Math.min(255, b));
    colorCounts.set(hex, (colorCounts.get(hex) || 0) + 1);
  }

  // Sort colors by frequency
  const sorted = Array.from(colorCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([hex]) => hex);

  const swatches: string[] = [];
  for (const hex of sorted) {
    if (swatches.length >= 5) break;
    // Ensure visually distinct swatches
    const isTooClose = swatches.some((existing) => colorDistance(hex, existing) < 32);
    if (!isTooClose) {
      swatches.push(hex);
    }
  }

  // Ensure 5 swatches fallback
  const fallback = ['#1a1917', '#f4ede4', '#b85d3b', '#6b7280', '#e5b84b'];
  while (swatches.length < 5) {
    swatches.push(fallback[swatches.length]);
  }

  // Calibrate surface and ink contrast
  const dominant = swatches[0];
  const secondary = swatches[1];
  const accent = swatches[2];

  // Pick lightest swatch as paper surface and darkest as ink
  const sortedByLum = [...swatches].sort((a, b) => getLuminance(b) - getLuminance(a));
  const surface = sortedByLum[0];
  const ink = sortedByLum[sortedByLum.length - 1];

  return {
    dominant,
    secondary,
    accent,
    surface,
    ink,
    swatches,
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function colorDistance(hex1: string, hex2: string): number {
  const [r1, g1, b1] = hexToRgb(hex1);
  const [r2, g2, b2] = hexToRgb(hex2);
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

function getLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return 0.299 * r + 0.587 * g + 0.114 * b;
}
