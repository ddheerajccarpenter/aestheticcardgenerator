// src/engines/ambientStageEngine.ts

export interface RGBTriplet {
  r: number;
  g: number;
  b: number;
}

/**
 * Generates a color that is harmoniously darker than the input template color.
 * For dark mode: produces a deep, rich atmospheric studio tone (luminance ~9-13%)
 * of the exact same hue.
 * For light mode: produces a warm, muted shade ~15-20% darker than the card.
 */
export function getDarkerColor(
  colorStr: string,
  mode: 'dark' | 'light' = 'dark',
  darkFactor = 0.2
): string {
  if (!colorStr) return mode === 'dark' ? '#0f1115' : '#e2e8f0';

  let hex = colorStr.trim();
  if (hex.startsWith('rgb')) {
    const nums = hex.match(/\d+/g);
    if (nums && nums.length >= 3) {
      return rgbToDarkerHex(
        parseInt(nums[0], 10),
        parseInt(nums[1], 10),
        parseInt(nums[2], 10),
        mode,
        darkFactor
      );
    }
  }

  if (!hex.startsWith('#')) hex = '#f5eee3';
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  const num = parseInt(clean, 16);
  if (isNaN(num)) return mode === 'dark' ? '#0f1115' : '#e2e8f0';

  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;

  return rgbToDarkerHex(r, g, b, mode, darkFactor);
}

function rgbToDarkerHex(
  r: number,
  g: number,
  b: number,
  mode: 'dark' | 'light',
  factor: number
): string {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  let h = 0;
  let s = 0;
  let l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rNorm:
        h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
        break;
      case gNorm:
        h = (bNorm - rNorm) / d + 2;
        break;
      case bNorm:
        h = (rNorm - gNorm) / d + 4;
        break;
    }
    h /= 6;
  }

  let targetL: number;
  let targetS: number;

  if (mode === 'dark') {
    // If original is already very dark (< 0.18), darken it further
    if (l < 0.18) {
      targetL = Math.max(0.04, l * 0.75);
      targetS = Math.min(1, s * 1.2);
    } else {
      // For light/cream/colorful templates: create a deep moody studio background
      // that preserves the hue and subtle warmth/tint of the template
      targetL = 0.11;
      targetS = Math.min(0.45, s * 0.85 + 0.08);
    }
  } else {
    // In light mode: visibly darker than the template so the card stands out (15-25% darker)
    targetL = Math.max(0.68, l * (1 - factor));
    targetS = Math.min(1, s * 1.15);
  }

  return hslToHex(h * 360, targetS, targetL);
}

function hslToHex(h: number, s: number, l: number): string {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) { r = c; g = x; b = 0; }
  else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
  else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
  else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
  else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
  else if (300 <= h && h < 360) { r = c; g = 0; b = x; }

  const toHex = (val: number) => {
    const hex = Math.round((val + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Samples the active card canvas or element to extract 3 harmonious ambient tones
 * and applies them ONLY to the outer workspace wrapper (.editor-ambient-stage).
 */
export function updateWorkspaceAmbientBackdrop(
  cardElement: HTMLElement | HTMLCanvasElement | null,
  ambientWrapperEl: HTMLElement | null,
  enabled: boolean,
  fallbackColors?: { bg: string; ink: string; accent?: string },
  isLight = false
): void {
  if (!ambientWrapperEl) return;
  if (!enabled) {
    ambientWrapperEl.style.setProperty('--ambient-opacity', '0');
    return;
  }

  // Mandatory separation: the workspace backdrop NEVER inherits or tints with the card palette.
  // It remains strictly pinned to the application's fixed UI canvas token.
  const appCanvasBg = isLight ? '#f8fafc' : '#101114';
  ambientWrapperEl.style.setProperty('--workspace-backdrop', appCanvasBg);

  // If cardElement is a canvas with contents
  if (cardElement instanceof HTMLCanvasElement && cardElement.width > 0 && cardElement.height > 0) {
    try {
      const sampleCanvas = document.createElement('canvas');
      sampleCanvas.width = 16;
      sampleCanvas.height = 16;
      const sCtx = sampleCanvas.getContext('2d', { willReadFrequently: true });
      if (sCtx) {
        sCtx.drawImage(cardElement, 0, 0, 16, 16);
        const data = sCtx.getImageData(0, 0, 16, 16).data;

        const pickPixel = (x: number, y: number): string => {
          const idx = (y * 16 + x) * 4;
          return `${data[idx]}, ${data[idx + 1]}, ${data[idx + 2]}`;
        };

        const c1 = pickPixel(3, 3);
        const c2 = pickPixel(8, 8);
        const c3 = pickPixel(12, 12);

        ambientWrapperEl.style.setProperty('--ambient-c1', c1);
        ambientWrapperEl.style.setProperty('--ambient-c2', c2);
        ambientWrapperEl.style.setProperty('--ambient-c3', c3);
        ambientWrapperEl.style.setProperty('--ambient-opacity', isLight ? '0.3' : '0.45');
        return;
      }
    } catch {
      // Canvas may be tainted; use fallback
    }
  }

  // Fallback extraction from colors
  if (fallbackColors) {
    const hexToRgb = (hex: string): string => {
      const clean = hex.replace('#', '');
      const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
      const num = parseInt(full, 16) || 0;
      return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
    };

    ambientWrapperEl.style.setProperty('--ambient-c1', hexToRgb(fallbackColors.bg));
    ambientWrapperEl.style.setProperty('--ambient-c2', hexToRgb(fallbackColors.accent || fallbackColors.bg));
    ambientWrapperEl.style.setProperty(
      '--ambient-c3',
      hexToRgb(fallbackColors.ink)
    );
    ambientWrapperEl.style.setProperty('--ambient-opacity', isLight ? '0.28' : '0.45');
  }
}
