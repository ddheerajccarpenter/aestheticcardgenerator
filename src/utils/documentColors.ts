import type { CanvasDocument } from '../types/card';

const normalize = (color: string): string => {
  const hex = color.toLowerCase();
  return /^#[\da-f]{3}$/.test(hex) ? `#${[...hex.slice(1)].map(c => c + c).join('')}` : hex;
};

export const getDocumentColors = (doc: CanvasDocument): string[] => [...new Set([
  doc.background,
  ...doc.objects.flatMap(object => object.type === 'text' ? [object.color] : object.type === 'shape' ? [object.fill, ...(object.strokeWidth > 0 ? [object.stroke] : [])] : []),
].map(normalize).filter(color => /^#[\da-f]{6}$/.test(color)))];

export const replaceDocumentColor = (doc: CanvasDocument, from: string, to: string): CanvasDocument => {
  if (!/^#[\da-f]{6}$/i.test(to)) return doc;
  const replace = (color: string) => normalize(color) === normalize(from) ? to : color;
  return {
    ...doc,
    background: replace(doc.background),
    objects: doc.objects.map(object => object.type === 'text'
      ? { ...object, color: replace(object.color) }
      : object.type === 'shape'
        ? { ...object, fill: replace(object.fill), stroke: replace(object.stroke) }
        : object),
  };
};
