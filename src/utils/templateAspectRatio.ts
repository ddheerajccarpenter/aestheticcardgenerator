import type { CardTemplate } from '../types/card';

export const getTemplateAspectRatio = (template: CardTemplate): number => {
  const doc = template.canvasDoc;
  if (doc?.canvasWidth && doc.canvasHeight) return doc.canvasWidth / doc.canvasHeight;
  if (template.layoutHint === 'vertical') return 2 / 3;
  if (template.layoutHint === 'square') return 1;
  return 8 / 5;
};

/** Sizes a card wrapper by width percentage so any aspect ratio fits uncropped inside a uniform stage. */
export const getStageInnerWidth = (cardRatio: number, stageRatio = 1): string => {
  if (!Number.isFinite(cardRatio) || cardRatio <= 0 || !Number.isFinite(stageRatio) || stageRatio <= 0) {
    return '100%';
  }
  return cardRatio < stageRatio ? `${((cardRatio / stageRatio) * 100).toFixed(4)}%` : '100%';
};
