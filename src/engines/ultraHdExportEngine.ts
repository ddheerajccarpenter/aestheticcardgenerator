// src/engines/ultraHdExportEngine.ts

export type ExportResolutionTier = '4K' | '8K' | '12K' | '16K';

export const TIER_LONG_EDGE: Record<ExportResolutionTier, number> = {
  '4K': 3840,   // Minimum Default Quality
  '8K': 7680,   // Print Master
  '12K': 11520, // Archival Gallery
  '16K': 15360, // Studio Extreme
};

export function detectMaxCanvasDimension(): number {
  const testSizes = [16384, 12288, 8192, 4096];
  for (const size of testSizes) {
    try {
      const c = document.createElement('canvas');
      c.width = size;
      c.height = 64;
      const ctx = c.getContext('2d');
      if (ctx) return size;
    } catch {
      // Try next smaller size
    }
  }
  return 4096;
}

/**
 * Pure 4K–16K Ultra-HD Export Engine:
 * Renders ONLY the pure card (no aspect-ratio badge, no ambient background gradient,
 * no text overlap) at true 4K to 16K resolution.
 */
export async function exportPureCardUltraHD(
  logicalWidth: number,
  logicalHeight: number,
  tier: ExportResolutionTier = '4K',
  format: 'image/png' | 'image/webp' = 'image/png',
  renderCardInLogicalSpace: (ctx: CanvasRenderingContext2D, w: number, h: number) => Promise<void> | void
): Promise<Blob> {
  // 1. Ensure all Google Fonts + Custom Uploaded Fonts are 100% ready to prevent text overlap
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }

  const targetLongEdge = TIER_LONG_EDGE[tier];
  const currentLongEdge = Math.max(logicalWidth, logicalHeight);
  const desiredScale = targetLongEdge / currentLongEdge;

  // 2. Check hardware max canvas dimension so 16K never crashes mobile/laptop GPUs
  const maxSafeDim = detectMaxCanvasDimension();
  const safeScale = Math.min(
    desiredScale,
    maxSafeDim / logicalWidth,
    maxSafeDim / logicalHeight
  );

  const exportWidth = Math.round(logicalWidth * safeScale);
  const exportHeight = Math.round(logicalHeight * safeScale);

  const offscreen = document.createElement('canvas');
  offscreen.width = exportWidth;
  offscreen.height = exportHeight;

  const ctx = offscreen.getContext('2d', { alpha: true, desynchronized: false });
  if (!ctx) {
    throw new Error('Failed to initialize high-resolution export context.');
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // 3. Clear offscreen buffer completely so ZERO ambient or page gradient ever leaks in
  ctx.clearRect(0, 0, exportWidth, exportHeight);

  // 4. Scale context uniformly so line-wrapping and coordinates match the preview 1:1
  ctx.save();
  ctx.scale(safeScale, safeScale);

  // 5. Execute pure card render pass (strictly excluding UI HUD or "4:5 Portrait" ratio badges)
  await renderCardInLogicalSpace(ctx, logicalWidth, logicalHeight);
  ctx.restore();

  return new Promise<Blob>((resolve, reject) => {
    offscreen.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas encoding failed at target resolution.'));
      },
      format,
      1.0
    );
  });
}
