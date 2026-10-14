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
  isBackground?: boolean;
}>(
  layers: T[],
  fromWidth: number,
  fromHeight: number,
  toWidth: number,
  toHeight: number
): T[] {
  if (fromWidth === toWidth && fromHeight === toHeight) return layers;

  const uniformScale = Math.min(toWidth / fromWidth, toHeight / fromHeight);
  const offsetX = (toWidth - fromWidth * uniformScale) / 2;
  const offsetY = (toHeight - fromHeight * uniformScale) / 2;

  return layers.map((layer) => {
    if (layer.isBackground) {
      return {
        ...layer,
        x: 0,
        y: 0,
        width: toWidth,
        height: toHeight,
      };
    }

    return {
      ...layer,
      x: Math.round(layer.x * uniformScale + offsetX),
      y: Math.round(layer.y * uniformScale + offsetY),
      width: Math.round(layer.width * uniformScale),
      height: Math.round(layer.height * uniformScale),
      fontSize: layer.fontSize ? Math.round(layer.fontSize * uniformScale * 10) / 10 : undefined,
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
