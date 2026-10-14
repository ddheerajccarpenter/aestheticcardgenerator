import type { ImageFilterPreset } from '../types/card';

/**
 * Applies a 100% browser-native Canvas 2D aesthetic image filter.
 * Returns a high-res data URL.
 */
export async function processImageFilter(
  sourceUrl: string,
  filter: ImageFilterPreset,
  options?: { darkColor?: string; lightColor?: string }
): Promise<string> {
  if (filter === 'original') return sourceUrl;

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          resolve(sourceUrl);
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        const w = canvas.width;
        const h = canvas.height;

        if (filter === 'dither') {
          // 1-Bit Atkinson Dithering (Classic Mac / Zine stipple)
          const gray = new Float32Array(w * h);
          for (let i = 0; i < data.length; i += 4) {
            gray[i / 4] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          }

          for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
              const idx = y * w + x;
              const oldVal = gray[idx];
              const newVal = oldVal < 128 ? 0 : 255;
              gray[idx] = newVal;
              const err = (oldVal - newVal) / 8; // Atkinson distributes 1/8 error

              if (x + 1 < w) gray[idx + 1] += err;
              if (x + 2 < w) gray[idx + 2] += err;
              if (y + 1 < h) {
                if (x - 1 >= 0) gray[(y + 1) * w + (x - 1)] += err;
                gray[(y + 1) * w + x] += err;
                if (x + 1 < w) gray[(y + 1) * w + (x + 1)] += err;
              }
              if (y + 2 < h) {
                gray[(y + 2) * w + x] += err;
              }
            }
          }

          for (let i = 0; i < gray.length; i++) {
            const v = Math.min(255, Math.max(0, Math.round(gray[i])));
            const px = i * 4;
            data[px] = v;
            data[px + 1] = v;
            data[px + 2] = v;
          }
        } else if (filter === 'photocopy') {
          // High-Contrast Photocopy (Thresholding + Grain)
          for (let i = 0; i < data.length; i += 4) {
            const yVal = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            const noise = (Math.random() - 0.5) * 45;
            const thresholded = yVal + noise > 130 ? 255 : 15;
            data[i] = thresholded;
            data[i + 1] = thresholded;
            data[i + 2] = thresholded;
          }
        } else if (filter === 'duotone') {
          // Palette Duotone (maps darks to darkColor, lights to lightColor)
          const darkHex = options?.darkColor || '#181a20';
          const lightHex = options?.lightColor || '#f5ede4';

          const darkRgb = hexToRgb(darkHex);
          const lightRgb = hexToRgb(lightHex);

          for (let i = 0; i < data.length; i += 4) {
            const lum = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255;
            data[i] = Math.round(darkRgb.r + lum * (lightRgb.r - darkRgb.r));
            data[i + 1] = Math.round(darkRgb.g + lum * (lightRgb.g - darkRgb.g));
            data[i + 2] = Math.round(darkRgb.b + lum * (lightRgb.b - darkRgb.b));
          }
        } else if (filter === 'warm90s') {
          // Warm 90s Film: Lifted blacks, golden highlights, subtle organic grain
          for (let i = 0; i < data.length; i += 4) {
            let r = data[i];
            let g = data[i + 1];
            let b = data[i + 2];

            // Warmth boost
            r = r * 1.12 + 10;
            g = g * 1.04 + 6;
            b = b * 0.92;

            // Lift blacks & soften contrast
            r = Math.max(22, r);
            g = Math.max(18, g);
            b = Math.max(26, b);

            // Subtle film grain
            const grain = (Math.random() - 0.5) * 16;
            data[i] = Math.min(255, Math.max(0, r + grain));
            data[i + 1] = Math.min(255, Math.max(0, g + grain));
            data[i + 2] = Math.min(255, Math.max(0, b + grain));
          }
        }

        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch (err) {
        console.error('Filter processing error:', err);
        resolve(sourceUrl);
      }
    };
    img.onerror = () => resolve(sourceUrl);
    img.src = sourceUrl;
  });
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  const int = parseInt(clean, 16);
  if (isNaN(int)) return { r: 0, g: 0, b: 0 };
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  };
}
