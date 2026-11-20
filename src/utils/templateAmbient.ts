// src/utils/templateAmbient.ts
import type { CardTemplate } from '../types/card';
import { normalizeAmbientColor, type AmbientTones, DEFAULT_DARK_AMBIENT, DEFAULT_LIGHT_AMBIENT } from '../engines/ambientAtmosphere';

/**
 * Deterministically derives or returns precomputed ambient tones for a card template.
 * Avoids runtime canvas sampling or DOM reading during rapid scrolling.
 */
export function getTemplateAmbientTones(
  template: CardTemplate,
  mode: 'dark' | 'light' = 'dark'
): AmbientTones {
  if (template.ambient) {
    return {
      primary: normalizeAmbientColor(template.ambient.primary, mode),
      secondary: normalizeAmbientColor(template.ambient.secondary, mode),
      neutral: normalizeAmbientColor(template.ambient.neutral, mode),
    };
  }

  const baseHueColor = template.accentColor || template.theme.bg || '#f4ede4';
  const inkColor = template.theme.ink || '#2c2825';

  return {
    primary: normalizeAmbientColor(baseHueColor, mode),
    secondary: normalizeAmbientColor(inkColor, mode),
    neutral: mode === 'dark' ? DEFAULT_DARK_AMBIENT.neutral : DEFAULT_LIGHT_AMBIENT.neutral,
  };
}
