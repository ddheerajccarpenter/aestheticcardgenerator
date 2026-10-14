// Presentation backdrop renderer for cards (Instagram/Pinterest/X ready)
// Renders card centered on a tactile surface (Dark Obsidian, Warm Linen, or Blurred Mesh)
// with realistic multi-layer drop shadows.

export type BackdropSurface = 'none' | 'obsidian' | 'linen' | 'mesh';
export type BackdropRatio = '4:5' | '1:1';

export async function renderCardWithBackdrop(
  cardImgUrl: string,
  surface: BackdropSurface,
  ratio: BackdropRatio = '4:5',
  pixelRatio: number = 2,
  cardBgColor: string = '#f4ede4'
): Promise<string> {
  if (surface === 'none') return cardImgUrl;

  const baseW = ratio === '4:5' ? 1080 : 1080;
  const baseH = ratio === '4:5' ? 1350 : 1080;
  const width = baseW * pixelRatio;
  const height = baseH * pixelRatio;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return cardImgUrl;

  // 1. Draw Backdrop Surface
  if (surface === 'obsidian') {
    // Dark Obsidian Concrete
    const grad = ctx.createRadialGradient(
      width / 2,
      height / 2,
      width * 0.1,
      width / 2,
      height / 2,
      width * 0.8
    );
    grad.addColorStop(0, '#1c1f26');
    grad.addColorStop(1, '#0b0d11');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Subtle grain speckles
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    for (let i = 0; i < 400; i++) {
      const rx = Math.random() * width;
      const ry = Math.random() * height;
      ctx.fillRect(rx, ry, pixelRatio * 1.5, pixelRatio * 1.5);
    }
  } else if (surface === 'linen') {
    // Warm Linen Desk
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#f2ece4');
    grad.addColorStop(0.5, '#e5dcd1');
    grad.addColorStop(1, '#ded3c5');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Subtle fiber grain
    ctx.fillStyle = 'rgba(69, 26, 3, 0.03)';
    for (let i = 0; i < 600; i++) {
      const rx = Math.random() * width;
      const ry = Math.random() * height;
      ctx.fillRect(rx, ry, pixelRatio, pixelRatio * 2);
    }
  } else if (surface === 'mesh') {
    // Blurred Palette Mesh
    const grad = ctx.createRadialGradient(
      width * 0.4,
      height * 0.35,
      width * 0.1,
      width / 2,
      height / 2,
      width * 0.7
    );
    grad.addColorStop(0, cardBgColor);
    grad.addColorStop(1, '#111417');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }

  // 2. Load card image
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = cardImgUrl;
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
  });

  // 3. Compute fitting dimensions with generous padding (72% of frame)
  const maxCardW = width * 0.78;
  const maxCardH = height * 0.78;
  const imgRatio = img.naturalWidth / img.naturalHeight;

  let drawW = maxCardW;
  let drawH = drawW / imgRatio;

  if (drawH > maxCardH) {
    drawH = maxCardH;
    drawW = drawH * imgRatio;
  }

  const drawX = (width - drawW) / 2;
  const drawY = (height - drawH) / 2;

  // 4. Draw Multi-Layer Drop Shadow
  ctx.save();
  // Deep ambient shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
  ctx.shadowBlur = 60 * pixelRatio;
  ctx.shadowOffsetY = 28 * pixelRatio;
  ctx.shadowOffsetX = 0;
  ctx.fillStyle = 'rgba(0,0,0,1)';
  // Draw dummy rect for shadow
  ctx.fillRect(drawX + 4, drawY + 4, drawW - 8, drawH - 8);
  ctx.restore();

  // Crisp contact shadow
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
  ctx.shadowBlur = 15 * pixelRatio;
  ctx.shadowOffsetY = 6 * pixelRatio;
  ctx.fillRect(drawX + 2, drawY + 2, drawW - 4, drawH - 4);
  ctx.restore();

  // 5. Draw the actual card
  ctx.drawImage(img, drawX, drawY, drawW, drawH);

  return canvas.toDataURL('image/png', 1.0);
}
