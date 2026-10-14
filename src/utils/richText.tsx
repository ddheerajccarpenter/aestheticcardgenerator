import React from 'react';

/**
 * Lightweight inline markdown and tactile highlighter parser:
 * **text** -> Bold weight
 * *text*   -> Italic style
 * ==text== -> Tactile marker highlighter swatch with soft rounded background
 */
export function parseRichText(
  text: string,
  accentColor: string = '#facc15'
): React.ReactNode[] {
  if (!text) return [];

  // Match token pairs: **bold**, *italic*, ==highlight==
  const regex = /(\*\*[\s\S]*?\*\*|\*[^*\s][\s\S]*?\*|==[\s\S]*?==)/g;
  const parts = text.split(regex);

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
            backgroundColor: `${accentColor}40`,
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
    .replace(/==(.*? bureaucracy)?==/g, '$1')
    .replace(/==(.*?)==/g, '$1')
    .replace(/\*(.*?)\*/g, '$1');
}
