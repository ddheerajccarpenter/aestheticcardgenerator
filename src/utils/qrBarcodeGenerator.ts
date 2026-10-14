/**
 * Browser-native vector SVG generators for dynamic Barcode and QR code layers.
 */

// Simple pseudo-random hash generator for deterministic QR data patterns
function hashString(str: string): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < str.length; i++) {
    bytes.push(str.charCodeAt(i));
  }
  while (bytes.length < 32) {
    bytes.push((bytes[bytes.length - 1] * 31 + 17) % 256);
  }
  return bytes;
}

/**
 * Generates an SVG string of a 21x21 QR Code matrix with authentic position detection patterns
 */
export function generateQrCodeSvg(
  payload: string = 'https://aestheticcardgenerator.pages.dev',
  options: { fill?: string; bg?: string; showLabel?: boolean } = {}
): string {
  const fill = options.fill || '#111417';
  const size = 21; // Standard Version 1 QR matrix
  const matrix: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  // 1. Draw 7x7 Finder Pattern at (row, col)
  const drawFinder = (startRow: number, startCol: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isOuterBorder = r === 0 || r === 6 || c === 0 || c === 6;
        const isInnerCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        matrix[startRow + r][startCol + c] = isOuterBorder || isInnerCenter;
      }
    }
  };

  // Top-left, top-right, bottom-left finders
  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  // 2. Timing patterns
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // 3. Populate remaining data modules using deterministic bit stream
  const hash = hashString(payload);
  let bitIdx = 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // Don't overwrite finders or timing
      const inTopLeft = r <= 7 && c <= 7;
      const inTopRight = r <= 7 && c >= size - 8;
      const inBottomLeft = r >= size - 8 && c <= 7;
      const isTiming = (r === 6 && c >= 8 && c <= size - 8) || (c === 6 && r >= 8 && r <= size - 8);

      if (!inTopLeft && !inTopRight && !inBottomLeft && !isTiming) {
        const byte = hash[bitIdx % hash.length];
        const bit = (byte >> (bitIdx % 8)) & 1;
        matrix[r][c] = bit === 1;
        bitIdx++;
      }
    }
  }

  // 4. Construct SVG paths
  const rects: string[] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (matrix[r][c]) {
        rects.push(`<rect x="${c}" y="${r}" width="1" height="1" fill="${fill}" />`);
      }
    }
  }

  const labelSvg = options.showLabel
    ? `<text x="${size / 2}" y="${size + 2.5}" font-family="monospace" font-size="1.8" text-anchor="middle" fill="${fill}">${escapeXml(payload.slice(0, 20))}</text>`
    : '';

  const viewBoxHeight = options.showLabel ? size + 4 : size;

  return `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${viewBoxHeight}" shape-rendering="crispEdges">
      ${rects.join('')}
      ${labelSvg}
    </svg>`
  )}`;
}

/**
 * Generates an SVG string of a Code-128 / Code-39 style barcode with dynamic bar widths
 */
export function generateBarcodeSvg(
  payload: string = 'ACS-89420',
  options: { fill?: string; showLabel?: boolean } = {}
): string {
  const fill = options.fill || '#111417';
  const clean = payload.toUpperCase();

  // Guard bars at start
  const bars: number[] = [2, 1, 1, 2];

  for (let i = 0; i < clean.length; i++) {
    const code = clean.charCodeAt(i);
    // Convert ASCII code to 4 alternating bar widths
    bars.push(((code >> 0) & 1) + 1);
    bars.push(((code >> 1) & 1) + 1);
    bars.push(((code >> 2) & 1) + 1);
    bars.push(((code >> 3) & 1) + 1);
  }

  // Guard bars at stop
  bars.push(2, 1, 1, 1, 2);

  let currentX = 2;
  const barSvg: string[] = [];
  const barHeight = 44;

  for (let i = 0; i < bars.length; i++) {
    const barW = bars[i];
    // Even index is black bar, odd index is white space
    if (i % 2 === 0) {
      barSvg.push(`<rect x="${currentX}" y="2" width="${barW}" height="${barHeight}" fill="${fill}" />`);
    }
    currentX += barW;
  }

  const totalWidth = currentX + 2;
  const labelSvg = options.showLabel !== false
    ? `<text x="${totalWidth / 2}" y="56" font-family="monospace" font-size="8" font-weight="bold" letter-spacing="2" text-anchor="middle" fill="${fill}">${escapeXml(payload)}</text>`
    : '';

  const totalHeight = options.showLabel !== false ? 62 : 48;

  return `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} ${totalHeight}" shape-rendering="crispEdges">
      ${barSvg.join('')}
      ${labelSvg}
    </svg>`
  )}`;
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
