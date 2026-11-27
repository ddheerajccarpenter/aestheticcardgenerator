// src/engines/canvasGridAndDimensionEngine.ts

export interface SnapGuide {
  axis: 'x' | 'y';
  position: number;
  label?: string;
}

export function computeMagneticGridSnap(
  activeBox: { x: number; y: number; width: number; height: number },
  otherBoxes: Array<{ id: string; x: number; y: number; width: number; height: number }>,
  canvasWidth: number,
  canvasHeight: number,
  thresholdPx = 6
): { snappedX: number; snappedY: number; guides: SnapGuide[] } {
  let snappedX = activeBox.x;
  let snappedY = activeBox.y;
  const guides: SnapGuide[] = [];

  // Candidate X snap lines: Canvas edges, Center (50%), Quarter Grid (25%, 75%)
  const xTargets: number[] = [0, canvasWidth * 0.25, canvasWidth * 0.5, canvasWidth * 0.75, canvasWidth];
  const yTargets: number[] = [0, canvasHeight * 0.25, canvasHeight * 0.5, canvasHeight * 0.75, canvasHeight];

  for (const box of otherBoxes) {
    xTargets.push(box.x, box.x + box.width / 2, box.x + box.width);
    yTargets.push(box.y, box.y + box.height / 2, box.y + box.height);
  }

  const activeXPoints = [
    { offset: 0, value: activeBox.x },
    { offset: activeBox.width / 2, value: activeBox.x + activeBox.width / 2 },
    { offset: activeBox.width, value: activeBox.x + activeBox.width },
  ];

  for (const pt of activeXPoints) {
    for (const target of xTargets) {
      if (Math.abs(pt.value - target) <= thresholdPx) {
        snappedX = target - pt.offset;
        guides.push({ axis: 'x', position: target });
        break;
      }
    }
  }

  const activeYPoints = [
    { offset: 0, value: activeBox.y },
    { offset: activeBox.height / 2, value: activeBox.y + activeBox.height / 2 },
    { offset: activeBox.height, value: activeBox.y + activeBox.height },
  ];

  for (const pt of activeYPoints) {
    for (const target of yTargets) {
      if (Math.abs(pt.value - target) <= thresholdPx) {
        snappedY = target - pt.offset;
        guides.push({ axis: 'y', position: target });
        break;
      }
    }
  }

  return { snappedX, snappedY, guides };
}

/**
 * Normalizes Poster and Card templates when switching canvas dimensions
 * so posters and cards are ALWAYS aligned with the card boundaries without clipping.
 */
export function normalizeTemplateDimensions<T extends {
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
  strokeWidth?: number;
  borderRadius?: number;
  letterSpacing?: number;
  isBackground?: boolean;
  name?: string;
}>(
  layers: T[],
  fromWidth: number,
  fromHeight: number,
  toWidth: number,
  toHeight: number
): T[] {
  if (!layers || layers.length === 0) return layers;

  const isFullBleed = (layer: T): boolean =>
    layer.x <= 2 &&
    layer.y <= 2 &&
    layer.width >= fromWidth - 4 &&
    layer.height >= fromHeight - 4;

  const isBgLayer = (layer: T): boolean => {
    if (layer.isBackground || isFullBleed(layer)) return true;
    return layer.width >= fromWidth - 80 && layer.height >= fromHeight - 80;
  };

  const dimScale = Math.min(toWidth / fromWidth, toHeight / fromHeight);
  const scaleBgLayer = (layer: T): T => {
    if (isFullBleed(layer)) {
      return {
        ...layer,
        x: 0,
        y: 0,
        width: toWidth,
        height: toHeight,
      };
    }
    const insetX = Math.max(0, Math.round(layer.x * (toWidth / fromWidth)));
    const insetY = Math.max(0, Math.round(layer.y * (toHeight / fromHeight)));
    return {
      ...layer,
      x: insetX,
      y: insetY,
      width: Math.max(20, toWidth - insetX * 2),
      height: Math.max(20, toHeight - insetY * 2),
      strokeWidth:
        typeof layer.strokeWidth === 'number' && layer.strokeWidth > 0
          ? Math.max(1, Math.round(layer.strokeWidth * dimScale * 10) / 10)
          : layer.strokeWidth,
      borderRadius:
        typeof layer.borderRadius === 'number' && layer.borderRadius > 0
          ? Math.round(layer.borderRadius * dimScale)
          : layer.borderRadius,
    };
  };

  const contentLayers = layers.filter((l) => !isBgLayer(l));

  if (contentLayers.length === 0) {
    return layers.map((l) => scaleBgLayer(l));
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const l of contentLayers) {
    minX = Math.min(minX, l.x);
    minY = Math.min(minY, l.y);
    maxX = Math.max(maxX, l.x + l.width);
    maxY = Math.max(maxY, l.y + l.height);
  }

  const contentW = maxX - minX;
  const contentH = maxY - minY;

  // If content bounding box is invalid, fallback to uniform direct scaling
  if (contentW <= 0 || contentH <= 0) {
    return layers.map((l) => ({
      ...l,
      x: Math.round(l.x * dimScale),
      y: Math.round(l.y * dimScale),
      width: Math.max(4, Math.round(l.width * dimScale)),
      height: Math.max(4, Math.round(l.height * dimScale)),
      fontSize: l.fontSize ? Math.round(l.fontSize * dimScale * 10) / 10 : undefined,
      strokeWidth:
        typeof l.strokeWidth === 'number' && l.strokeWidth > 0
          ? Math.max(1, Math.round(l.strokeWidth * dimScale * 10) / 10)
          : l.strokeWidth,
      borderRadius:
        typeof l.borderRadius === 'number' && l.borderRadius > 0
          ? Math.round(l.borderRadius * dimScale)
          : l.borderRadius,
      letterSpacing:
        typeof l.letterSpacing === 'number' && l.letterSpacing !== 0
          ? Math.round(l.letterSpacing * dimScale * 10) / 10
          : l.letterSpacing,
    }));
  }

  // Margin for content elements inside card base
  const marginX = Math.max(32, Math.round(toWidth * 0.05));
  const marginY = Math.max(32, Math.round(toHeight * 0.07));
  const availW = Math.max(100, toWidth - marginX * 2);
  const availH = Math.max(100, toHeight - marginY * 2);

  // If same canvas size and content is already properly filling the canvas, no need to touch it
  if (fromWidth === toWidth && fromHeight === toHeight && contentW >= availW * 0.75) {
    return layers;
  }

  const scale = Math.min(availW / contentW, availH / contentH);
  const targetW = contentW * scale;
  const targetH = contentH * scale;

  const targetMinX = Math.round((toWidth - targetW) / 2);
  const targetMinY = Math.round((toHeight - targetH) / 2);

  return layers.map((layer) => {
    if (isBgLayer(layer)) {
      return scaleBgLayer(layer);
    }

    const relX = (layer.x - minX) / contentW;
    const relY = (layer.y - minY) / contentH;

    return {
      ...layer,
      x: Math.round(targetMinX + relX * targetW),
      y: Math.round(targetMinY + relY * targetH),
      width: Math.max(4, Math.round(layer.width * scale)),
      height: Math.max(4, Math.round(layer.height * scale)),
      fontSize: layer.fontSize ? Math.round(layer.fontSize * scale * 10) / 10 : undefined,
      strokeWidth:
        typeof layer.strokeWidth === 'number' && layer.strokeWidth > 0
          ? Math.max(1, Math.round(layer.strokeWidth * scale * 10) / 10)
          : layer.strokeWidth,
      borderRadius:
        typeof layer.borderRadius === 'number' && layer.borderRadius > 0
          ? Math.round(layer.borderRadius * scale)
          : layer.borderRadius,
      letterSpacing:
        typeof layer.letterSpacing === 'number' && layer.letterSpacing !== 0
          ? Math.round(layer.letterSpacing * scale * 10) / 10
          : layer.letterSpacing,
    };
  });
}

/**
 * One-Click "Auto-Align in Grid":
 * Straightens near-horizontal rotations (<4° to 0°), snaps to 8px baseline grid,
 * and centers primary elements.
 */
export function autoAlignLayersInGrid<T extends {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  isBackground?: boolean;
}>(layers: T[], canvasWidth: number, canvasHeight: number): T[] {
  const round8 = (val: number) => Math.round(val / 8) * 8;

  return layers.map((layer) => {
    if (layer.isBackground) return layer;

    let rot = layer.rotation || 0;
    if (Math.abs(rot) < 4) rot = 0;

    let newX = round8(layer.x);
    let newY = round8(layer.y);

    // If near canvas horizontal center, snap directly to center
    const centerX = canvasWidth / 2 - layer.width / 2;
    if (Math.abs(layer.x - centerX) < 14) {
      newX = Math.round(centerX);
    }

    // Keep within bounds
    newX = Math.max(8, Math.min(canvasWidth - layer.width - 8, newX));
    newY = Math.max(8, Math.min(canvasHeight - layer.height - 8, newY));

    return {
      ...layer,
      x: newX,
      y: newY,
      rotation: rot,
    };
  });
}
