// src/engines/ambientAtmosphere.ts
// ACG Ambient Atmosphere Engine — Scroll-Reactive Diffuse Lighting

export interface AmbientTones {
  primary: string; // Hex or CSS color
  secondary: string;
  neutral: string;
}

const AMBIENT_STORAGE_KEY = 'acg_ambient_enabled';

// Default neutral ambient tones
export const DEFAULT_DARK_AMBIENT: AmbientTones = {
  primary: '#c69d78',
  secondary: '#938677',
  neutral: '#24211e',
};

export const DEFAULT_LIGHT_AMBIENT: AmbientTones = {
  primary: '#6f4637',
  secondary: '#c9beaf',
  neutral: '#faf5eb',
};

/**
 * Normalizes an arbitrary color into a filmic, restrained ambient wash tone.
 * Clamps chroma and controls lightness so vivid colors become soft atmospheric tints.
 */
export function normalizeAmbientColor(
  hexColor: string,
  mode: 'dark' | 'light' = 'dark'
): string {
  if (!hexColor || !hexColor.startsWith('#')) {
    return mode === 'dark' ? '#c69d78' : '#6f4637';
  }

  let clean = hexColor.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  const num = parseInt(clean, 16);
  if (isNaN(num)) return mode === 'dark' ? '#c69d78' : '#6f4637';

  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;

  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rNorm: h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0); break;
      case gNorm: h = (bNorm - rNorm) / d + 2; break;
      case bNorm: h = (rNorm - gNorm) / d + 4; break;
    }
    h /= 6;
  }

  // Restrained normalization:
  // Dark mode: deep, rich ambient cast (l: 0.12 - 0.18, max saturation 0.40)
  // Light mode: pale, whisper-light paper wash (l: 0.88 - 0.94, max saturation 0.25)
  const targetL = mode === 'dark' ? 0.14 : 0.91;
  const targetS = mode === 'dark' ? Math.min(0.38, s * 0.75 + 0.05) : Math.min(0.22, s * 0.55 + 0.02);

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

// Global Ambient State Store
type AmbientListener = (tones: AmbientTones, enabled: boolean) => void;
const listeners = new Set<AmbientListener>();

let currentTones: AmbientTones = DEFAULT_DARK_AMBIENT;
let isEnabled: boolean = (() => {
  if (typeof window === 'undefined') return true;
  const saved = localStorage.getItem(AMBIENT_STORAGE_KEY);
  return saved === null ? true : saved === 'true';
})();

export function getAmbientState(): { tones: AmbientTones; enabled: boolean } {
  return { tones: currentTones, enabled: isEnabled };
}

export function setAmbientEnabled(enabled: boolean): void {
  isEnabled = enabled;
  if (typeof window !== 'undefined') {
    localStorage.setItem(AMBIENT_STORAGE_KEY, String(enabled));
  }
  notify();
}

export function setAmbientTones(tones: AmbientTones): void {
  currentTones = tones;
  notify();
}

export function subscribeAmbient(listener: AmbientListener): () => void {
  listeners.add(listener);
  listener(currentTones, isEnabled);
  return () => {
    listeners.delete(listener);
  };
}

function notify(): void {
  listeners.forEach((fn) => fn(currentTones, isEnabled));
}
