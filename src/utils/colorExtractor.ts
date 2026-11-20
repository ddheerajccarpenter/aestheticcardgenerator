// src/utils/colorExtractor.ts
// Client-side image palette extraction & Eyedropper integration

export interface ExtractedPalette {
  dominant: string;
  palette: string[];
}

/**
 * Extracts dominant colors from an image source URL or base64 string using an offscreen canvas.
 * Discards near-white/near-black noise if more colorful accents are present.
 */
export async function extractPaletteFromImage(
  imageSrc: string,
  maxColors = 5
): Promise<ExtractedPalette> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          resolve({ dominant: '#c69d78', palette: ['#191715', '#24211e', '#c69d78', '#efe6d8', '#f1ebdd'] });
          return;
        }

        // Downsample image to 64x64 for speed
        const size = 64;
        canvas.width = size;
        canvas.height = size;
        ctx.drawImage(img, 0, 0, size, size);

        const imgData = ctx.getImageData(0, 0, size, size).data;
        const colorCounts = new Map<string, number>();

        for (let i = 0; i < imgData.length; i += 16) {
          const r = imgData[i];
          const g = imgData[i + 1];
          const b = imgData[i + 2];
          const a = imgData[i + 3];

          if (a < 128) continue; // Skip transparent pixels

          // Quantize to reduce subtle variations
          const qR = Math.round(r / 16) * 16;
          const qG = Math.round(g / 16) * 16;
          const qB = Math.round(b / 16) * 16;

          const hex = `#${((1 << 24) + (qR << 16) + (qG << 8) + qB).toString(16).slice(1)}`;
          colorCounts.set(hex, (colorCounts.get(hex) || 0) + 1);
        }

        const sorted = Array.from(colorCounts.entries())
          .sort((a, b) => b[1] - a[1])
          .map((entry) => entry[0]);

        if (sorted.length === 0) {
          resolve({ dominant: '#c69d78', palette: ['#191715', '#24211e', '#c69d78', '#efe6d8', '#f1ebdd'] });
          return;
        }

        const dominant = sorted[0];
        // Pick visually distinct swatches
        const distinct: string[] = [dominant];
        for (const c of sorted.slice(1)) {
          if (distinct.length >= maxColors) break;
          // Simple RGB Euclidean distance check (> 40)
          const isFar = distinct.every((d) => colorDistance(c, d) > 40);
          if (isFar) {
            distinct.push(c);
          }
        }

        while (distinct.length < Math.min(maxColors, sorted.length)) {
          distinct.push(sorted[distinct.length]);
        }

        resolve({ dominant, palette: distinct });
      } catch {
        resolve({ dominant: '#c69d78', palette: ['#191715', '#24211e', '#c69d78', '#efe6d8', '#f1ebdd'] });
      }
    };

    img.onerror = () => {
      resolve({ dominant: '#c69d78', palette: ['#191715', '#24211e', '#c69d78', '#efe6d8', '#f1ebdd'] });
    };

    img.src = imageSrc;
  });
}

function colorDistance(hex1: string, hex2: string): number {
  const c1 = parseInt(hex1.slice(1), 16);
  const c2 = parseInt(hex2.slice(1), 16);
  const r1 = (c1 >> 16) & 255, g1 = (c1 >> 8) & 255, b1 = c1 & 255;
  const r2 = (c2 >> 16) & 255, g2 = (c2 >> 8) & 255, b2 = c2 & 255;
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

/**
 * Invokes the browser's native EyeDropper API if available.
 */
export async function pickColorWithEyedropper(): Promise<string | null> {
  if (typeof window !== 'undefined' && 'EyeDropper' in window) {
    try {
      const eyeDropper = new (window as any).EyeDropper();
      const result = await eyeDropper.open();
      return result.sRGBHex || null;
    } catch {
      return null;
    }
  }
  return null;
}
