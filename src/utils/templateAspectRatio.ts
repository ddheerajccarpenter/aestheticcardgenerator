import type { CardTemplate } from '../types/card';

export const getTemplateAspectRatio = (template: CardTemplate): number => {
  const doc = template.canvasDoc;
  if (doc?.canvasWidth && doc.canvasHeight) return doc.canvasWidth / doc.canvasHeight;
  if (template.layoutHint === 'vertical') return 2 / 3;
  if (template.layoutHint === 'square') return 1;
  return 8 / 5;
};
