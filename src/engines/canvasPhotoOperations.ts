// src/engines/canvasPhotoOperations.ts

export interface CanvasImageLayer {
  id: string;
  type: 'image';
  name: string;
  src: string;
  imageElement?: HTMLImageElement;
  x: number;
  y: number;
  width: number;
  height: number;
  naturalWidth: number;
  naturalHeight: number;
  rotation: number;
  opacity: number;
  clipMask: 'none' | 'rounded' | 'circle' | 'star' | 'heart' | 'id-frame';
  filterPreset: 'original' | 'dither-1bit' | 'photocopy' | 'duotone' | 'film-90s';
  zIndex: number;
}

/**
 * BUG FIX: Replaces the photo of an existing image layer IN-PLACE while preserving
 * all template coordinates, dimensions, rotation, mask, and z-index.
 */
export async function replaceLayerPhotoInPlace(
  layers: CanvasImageLayer[],
  targetLayerId: string,
  newFile: File
): Promise<CanvasImageLayer[]> {
  const objectUrl = URL.createObjectURL(newFile);
  const img = await loadImageElement(objectUrl);

  return layers.map((layer) => {
    if (layer.id !== targetLayerId) return layer;
    return {
      ...layer,
      src: objectUrl,
      imageElement: img,
      naturalWidth: img.naturalWidth || img.width,
      naturalHeight: img.naturalHeight || img.height,
      // Explicitly preserve x, y, width, height, rotation, clipMask, filterPreset, zIndex
    };
  });
}

/**
 * OFFLINE BACKGROUND REMOVAL:
 * Runs 100% locally in the browser using WebAssembly / WebGPU segmentation.
 * Falls back to high-pass edge threshold alpha matte if model assets cannot be reached offline.
 */
export async function removeLayerBackgroundOffline(
  src: string,
  onProgress?: (percent: number) => void
): Promise<{ updatedSrc: string; updatedImg: HTMLImageElement }> {
  try {
    const { removeBackground } = await import('@imgly/background-removal');
    const resultBlob = await removeBackground(src, {
      model: 'isnet_fp16',
      output: { format: 'image/png', quality: 1.0 },
      progress: (_key: string, current: number, total: number) => {
        if (total > 0 && onProgress) {
          onProgress(Math.round((current / total) * 100));
        }
      },
    });

    const updatedSrc = URL.createObjectURL(resultBlob);
    const updatedImg = await loadImageElement(updatedSrc);
    return { updatedSrc, updatedImg };
  } catch (err) {
    console.warn('WASM background removal failed, using client-side edge chroma fallback:', err);
    // Client-side fallback: isolate background color and threshold alpha
    const fallbackBlob = await localCanvasChromaRemove(src);
    const updatedSrc = URL.createObjectURL(fallbackBlob);
    const updatedImg = await loadImageElement(updatedSrc);
    return { updatedSrc, updatedImg };
  }
}

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

/**
 * Client-side edge/corner chroma segmentation fallback
 */
async function localCanvasChromaRemove(src: string): Promise<Blob> {
  const img = await loadImageElement(src);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D context failed');

  ctx.drawImage(img, 0, 0);
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;

  // Sample corner background color
  const bgR = data[0];
  const bgG = data[1];
  const bgB = data[2];

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const dist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);
    if (dist < 42) {
      data[i + 3] = 0; // Transparent
    } else if (dist < 70) {
      data[i + 3] = Math.round(((dist - 42) / 28) * 255);
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to encode fallback PNG'));
    }, 'image/png');
  });
}
