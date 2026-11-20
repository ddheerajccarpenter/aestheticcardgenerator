// src/services/customFontManager.ts
// Client-side Custom Font Subsystem with IndexedDB & FontFace API

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
const MAX_FONT_SIZE_BYTES = 15 * 1024 * 1024; // 15MB limit

function openFontsDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB is not supported in this browser environment.'));
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
 * Validates font file format, size, and header magic bytes.
 */
export function validateFontFile(file: File, buffer: ArrayBuffer): void {
  const ext = file.name.split('.').pop()?.toLowerCase();
  const validExtensions = ['ttf', 'otf', 'woff', 'woff2'];
  if (!ext || !validExtensions.includes(ext)) {
    throw new Error(`Unsupported font format ".${ext}". Please upload .woff2, .woff, .ttf, or .otf.`);
  }

  if (file.size > MAX_FONT_SIZE_BYTES) {
    throw new Error(`Font file exceeds 15MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB).`);
  }

  if (buffer.byteLength < 4) {
    throw new Error('Corrupted or invalid font file structure.');
  }

  // Check magic bytes
  const bytes = new Uint8Array(buffer.slice(0, 4));
  const isWoff2 = bytes[0] === 0x77 && bytes[1] === 0x4f && bytes[2] === 0x46 && bytes[3] === 0x32; // wOF2
  const isWoff = bytes[0] === 0x77 && bytes[1] === 0x4f && bytes[2] === 0x46 && bytes[3] === 0x46;  // wOFF
  const isTrueType = (bytes[0] === 0x00 && bytes[1] === 0x01 && bytes[2] === 0x00 && bytes[3] === 0x00) ||
                     (bytes[0] === 0x74 && bytes[1] === 0x72 && bytes[2] === 0x75 && bytes[3] === 0x65); // 0x00010000 or 'true'
  const isOpenType = bytes[0] === 0x4f && bytes[1] === 0x54 && bytes[2] === 0x54 && bytes[3] === 0x4f; // OTTO

  if (!isWoff2 && !isWoff && !isTrueType && !isOpenType) {
    throw new Error('Unrecognized font signature. Please ensure the file is an uncorrupted font.');
  }
}

/**
 * Registers an uploaded font file via the browser's FontFace API and saves to IndexedDB
 */
export async function registerAndSaveCustomFont(file: File): Promise<StoredCustomFont> {
  const buffer = await file.arrayBuffer();
  validateFontFile(file, buffer);

  const cleanName = file.name
    .replace(/\.(ttf|otf|woff2?|TTF|OTF|WOFF2?)$/, '')
    .replace(/[^a-zA-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '') || 'CustomFont';

  const familyName = `Custom_${cleanName}`;

  const fontFace = new FontFace(familyName, buffer, { style: 'normal', weight: '100 900' });
  const loadedFace = await fontFace.load();
  document.fonts.add(loadedFace);
  if (document.fonts.ready) {
    await document.fonts.ready;
  }

  const record: StoredCustomFont = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `cf_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    familyName,
    fileName: file.name,
    buffer,
    uploadedAt: Date.now(),
  };

  await saveFontToIndexedDB(record);
  return record;
}

/**
 * Deletes a font from IndexedDB and unregisters its FontFace from the document
 */
export async function removeCustomFont(fontId: string, familyName?: string): Promise<void> {
  await deleteFontFromIndexedDB(fontId);
  if (familyName && typeof document !== 'undefined' && document.fonts) {
    try {
      document.fonts.forEach((face) => {
        if (face.family === familyName) {
          document.fonts.delete(face);
        }
      });
    } catch (err) {
      console.warn('Could not unregister FontFace from document:', err);
    }
  }
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
