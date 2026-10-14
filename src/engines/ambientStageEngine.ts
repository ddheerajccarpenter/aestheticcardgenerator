// src/engines/ambientStageEngine.ts

export interface RGBTriplet {
  r: number;
  g: number;
  b: number;
}

/**
 * Samples the active card canvas or element to extract 3 harmonious ambient tones
 * (Top-Left/Primary, Center/Midtone, Bottom-Right/Accent) and applies them
 * ONLY to the outer workspace wrapper (.editor-ambient-stage), NEVER to the card canvas.
 */
export function updateWorkspaceAmbientBackdrop(
  cardElement: HTMLElement | HTMLCanvasElement | null,
  ambientWrapperEl: HTMLElement | null,
  enabled: boolean,
  fallbackColors?: { bg: string; ink: string; accent?: string }
): void {
  if (!ambientWrapperEl) return;
  if (!enabled) {
    ambientWrapperEl.style.setProperty('--ambient-opacity', '0');
    return;
  }

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
        ambientWrapperEl.style.setProperty('--ambient-opacity', '0.42');
        return;
      }
    } catch {
      // Canvas may be tainted or cross-origin; use fallback color extraction
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
    ambientWrapperEl.style.setProperty('--ambient-c2', hexToRgb(fallbackColors.ink));
    ambientWrapperEl.style.setProperty(
      '--ambient-c3',
      hexToRgb(fallbackColors.accent || fallbackColors.bg)
    );
    ambientWrapperEl.style.setProperty('--ambient-opacity', '0.36');
  }
}
