// src/services/imageSecurity.ts

/**
 * Maximum image size allowed for client-side uploads (10MB)
 */
export const MAX_IMAGE_FILE_SIZE_BYTES = 10 * 1024 * 1024;

/**
 * Supported image MIME types
 */
export const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/avif',
  'image/gif',
  'image/svg+xml',
]);

/**
 * Fast, memory-safe conversion from Data URL to Blob without fetch()
 * Works synchronously and prevents WebKit/Safari fetch(dataUrl) length limits
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const commaIdx = dataUrl.indexOf(',');
  if (commaIdx === -1) {
    return new Blob([], { type: 'application/octet-stream' });
  }

  const header = dataUrl.slice(0, commaIdx);
  const data = dataUrl.slice(commaIdx + 1);
  const mimeMatch = header.match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/png';
  const isBase64 = header.includes(';base64');

  if (isBase64) {
    const binary = atob(data);
    const len = binary.length;
    const u8arr = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      u8arr[i] = binary.charCodeAt(i);
    }
    return new Blob([u8arr], { type: mime });
  } else {
    const text = decodeURIComponent(data);
    return new Blob([text], { type: mime });
  }
}

/**
 * Validates binary image signatures (magic bytes) to prevent disguised files
 */
export function validateImageMagicBytes(buffer: ArrayBuffer): { valid: boolean; detectedMime?: string } {
  const bytes = new Uint8Array(buffer.slice(0, 16));
  if (bytes.length < 4) return { valid: false };

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return { valid: true, detectedMime: 'image/png' };
  }

  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { valid: true, detectedMime: 'image/jpeg' };
  }

  // GIF: GIF87a or GIF89a (47 49 46 38)
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) {
    return { valid: true, detectedMime: 'image/gif' };
  }

  // WebP: RIFF .... WEBP
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes.length >= 12 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return { valid: true, detectedMime: 'image/webp' };
  }

  // AVIF: ....ftypavif
  if (bytes.length >= 12) {
    const headerStr = String.fromCharCode(...bytes.slice(4, 12));
    if (headerStr.includes('ftyp') || headerStr.includes('avif')) {
      return { valid: true, detectedMime: 'image/avif' };
    }
  }

  // SVG: Starts with <svg or <?xml in UTF-8
  const textHeader = new TextDecoder().decode(bytes.slice(0, 16)).trim().toLowerCase();
  if (textHeader.startsWith('<svg') || textHeader.startsWith('<?xml') || textHeader.includes('<svg')) {
    return { valid: true, detectedMime: 'image/svg+xml' };
  }

  return { valid: false };
}

/**
 * Sanitizes SVG markup to eliminate XSS vectors (script tags, inline event handlers, javascript: hrefs)
 */
export function sanitizeSvgMarkup(svgText: string): string {
  if (!svgText || typeof svgText !== 'string') return '';

  let sanitized = svgText;

  // 1. Remove XML comments that might hide payloads
  sanitized = sanitized.replace(/<!--[\s\S]*?-->/g, '');

  // 2. Strip dangerous executable containers: <script>, <foreignObject>, <iframe>, <embed>, <object>
  sanitized = sanitized.replace(/<\s*script\b[\s\S]*?<\s*\/\s*script\s*>/gi, '');
  sanitized = sanitized.replace(/<\s*script\b[^>]*\/>/gi, '');
  sanitized = sanitized.replace(/<\s*foreignObject\b[\s\S]*?<\s*\/\s*foreignObject\s*>/gi, '');
  sanitized = sanitized.replace(/<\s*foreignObject\b[^>]*\/>/gi, '');
  sanitized = sanitized.replace(/<\s*iframe\b[\s\S]*?<\s*\/\s*iframe\s*>/gi, '');
  sanitized = sanitized.replace(/<\s*iframe\b[^>]*\/>/gi, '');
  sanitized = sanitized.replace(/<\s*embed\b[^>]*>/gi, '');
  sanitized = sanitized.replace(/<\s*object\b[\s\S]*?<\s*\/\s*object\s*>/gi, '');

  // 3. Strip all inline DOM event handlers (onload, onerror, onclick, onmouseover, etc.)
  sanitized = sanitized.replace(/\s+on[a-zA-Z]+\s*=\s*(["'][^"']*["']|[^\s>]+)/gi, '');

  // 4. Strip javascript:, vbscript:, and data:text/html protocol attributes
  sanitized = sanitized.replace(
    /\s+(?:href|xlink:href|src)\s*=\s*(["'])\s*(?:javascript|vbscript|data:text\/html):[\s\S]*?\1/gi,
    ' href=""'
  );

  return sanitized.trim();
}

export interface SanitizedImageResult {
  safeDataUrl: string;
  width: number;
  height: number;
  mimeType: string;
}

/**
 * Validates, checks magic bytes, sanitizes SVGs, and verifies natural dimensions for uploaded image files.
 */
export async function validateAndSanitizeImageFile(file: File): Promise<SanitizedImageResult> {
  if (!file) {
    throw new Error('No file provided');
  }

  // 1. Size ceiling
  if (file.size > MAX_IMAGE_FILE_SIZE_BYTES) {
    throw new Error('File exceeds the 10MB limit. Please upload a smaller image.');
  }

  // 2. Initial MIME check
  const declaredMime = file.type.toLowerCase();
  if (declaredMime && !ALLOWED_IMAGE_MIME_TYPES.has(declaredMime)) {
    throw new Error('Unsupported image format. Please use PNG, JPEG, WebP, AVIF, or SVG.');
  }

  // 3. Magic byte inspection
  const buffer = await file.arrayBuffer();
  const magic = validateImageMagicBytes(buffer);
  if (!magic.valid) {
    throw new Error('Corrupted or invalid image file signature.');
  }

  // 4. Handle SVG sanitization
  if (magic.detectedMime === 'image/svg+xml' || declaredMime === 'image/svg+xml') {
    const rawSvg = new TextDecoder('utf-8').decode(buffer);
    const cleanedSvg = sanitizeSvgMarkup(rawSvg);

    if (!cleanedSvg.includes('<svg')) {
      throw new Error('Invalid SVG artwork structure.');
    }

    const safeDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(cleanedSvg)}`;

    // Measure dimensions via offscreen Image
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const w = img.naturalWidth || 400;
        const h = img.naturalHeight || 400;
        resolve({
          safeDataUrl,
          width: w,
          height: h,
          mimeType: 'image/svg+xml',
        });
      };
      img.onerror = () => {
        // Fallback for SVGs without intrinsic width/height attributes
        resolve({
          safeDataUrl,
          width: 400,
          height: 400,
          mimeType: 'image/svg+xml',
        });
      };
      img.src = safeDataUrl;
    });
  }

  // 5. Handle Raster Images (PNG, JPEG, WebP, AVIF, GIF)
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) {
        reject(new Error('Failed to read image data.'));
        return;
      }

      const img = new Image();
      img.onload = () => {
        // Check for decompression bombs (e.g. 50,000 x 50,000 px)
        const nw = img.naturalWidth || img.width;
        const nh = img.naturalHeight || img.height;
        if (nw > 16384 || nh > 16384 || nw * nh > 67108864) {
          reject(new Error('Image dimensions exceed the 16,384px maximum resolution.'));
          return;
        }

        resolve({
          safeDataUrl: dataUrl,
          width: nw,
          height: nh,
          mimeType: magic.detectedMime || file.type || 'image/png',
        });
      };
      img.onerror = () => {
        reject(new Error('Browser could not decode the image file.'));
      };
      img.src = dataUrl;
    };
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
}
