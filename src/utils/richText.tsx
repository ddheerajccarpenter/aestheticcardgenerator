import React from 'react';

/**
 * Lightweight inline markdown and tactile highlighter parser:
 * **text** -> Bold weight
 * *text*   -> Italic style
 * ==text== -> Tactile marker highlighter swatch with soft rounded background
 */
export function parseRichText(
  text: string,
  accentColor: string = '#fcd535'
): React.ReactNode[] {
  if (!text) return [];

  // Match token pairs: **bold**, *italic*, ==highlight==
  const regex = /(\*\*[\s\S]*?\*\*|\*[^*\s][\s\S]*?\*|==[\s\S]*?==)/g;
  const parts = text.split(regex);

  // If accentColor is dark (e.g. #000 or #181a20 or #2c2825), fall back to luminous warm amber #fcd535
  const isDarkColor = (hex: string) => {
    if (!hex || !hex.startsWith('#') || hex.length < 7) return false;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 120;
  };

  const highlightBg = isDarkColor(accentColor)
    ? 'rgba(252, 213, 53, 0.35)'
    : accentColor.startsWith('#') && accentColor.length === 7
    ? `${accentColor}40`
    : accentColor || 'rgba(252, 213, 53, 0.35)';

  return parts.map((part, index) => {
    if (!part) return null;

    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      const inner = part.slice(2, -2);
      return (
        <strong key={index} className="font-bold tracking-tight">
          {inner}
        </strong>
      );
    }

    if (part.startsWith('==') && part.endsWith('==') && part.length >= 4) {
      const inner = part.slice(2, -2);
      return (
        <mark
          key={index}
          style={{
            backgroundColor: highlightBg,
            boxDecorationBreak: 'clone',
            WebkitBoxDecorationBreak: 'clone',
          }}
          className="px-1.5 py-0.5 rounded-md text-inherit font-inherit not-italic shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
        >
          {inner}
        </mark>
      );
    }

    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      const inner = part.slice(1, -1);
      return (
        <em key={index} className="italic font-serif opacity-95">
          {inner}
        </em>
      );
    }

    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

/**
 * Strips formatting tokens to calculate raw character count or line measure
 */
export function stripRichText(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/==([\s\S]*?)==/g, '$1')
    .replace(/\*(.*?)\*/g, '$1');
}

