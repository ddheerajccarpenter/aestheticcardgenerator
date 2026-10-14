// src/services/customFontManager.ts

export interface StoredCustomFont {
  id: string;
  familyName: string;
  fileName: string;
  buffer: ArrayBuffer;
  uploadedAt: number;
}

const DB_NAME = 'AestheticCardStudioFontsDB';
const STORE_NAME = 'custom_fonts';
const DB_VERSION = 1;

function openFontsDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveFontToIndexedDB(font: StoredCustomFont): Promise<void> {
  const db = await openFontsDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(font);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function loadAllFontsFromIndexedDB(): Promise<StoredCustomFont[]> {
  try {
    const db = await openFontsDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

export async function deleteFontFromIndexedDB(id: string): Promise<void> {
  const db = await openFontsDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/**
 * Registers an uploaded font file via the browser's FontFace API and saves to IndexedDB
 */
export async function registerAndSaveCustomFont(file: File): Promise<StoredCustomFont> {
  const buffer = await file.arrayBuffer();
  const cleanName = file.name
    .replace(/\.(ttf|otf|woff2?|TTF|OTF|WOFF2?)$/, '')
    .replace(/[-_]+/g, ' ')
    .trim();
  const familyName = `Custom_${cleanName.replace(/\s+/g, '_')}`;

  const fontFace = new FontFace(familyName, buffer, { style: 'normal', weight: '100 900' });
  const loadedFace = await fontFace.load();
  document.fonts.add(loadedFace);
  if (document.fonts.ready) {
    await document.fonts.ready;
  }

  const record: StoredCustomFont = {
    id: crypto.randomUUID(),
    familyName,
    fileName: file.name,
    buffer,
    uploadedAt: Date.now(),
  };

  await saveFontToIndexedDB(record);
  return record;
}

/**
 * Initializes and restores all previously saved custom fonts on application boot
 */
export async function restoreSavedCustomFonts(): Promise<StoredCustomFont[]> {
  const fonts = await loadAllFontsFromIndexedDB();
  for (const font of fonts) {
    try {
      const fontFace = new FontFace(font.familyName, font.buffer, { style: 'normal', weight: '100 900' });
      const loaded = await fontFace.load();
      document.fonts.add(loaded);
    } catch (err) {
      console.warn('Failed to restore custom font:', font.fileName, err);
    }
  }
  if (document.fonts.ready) {
    await document.fonts.ready;
  }
  return fonts;
}
