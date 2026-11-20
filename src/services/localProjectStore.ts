// src/services/localProjectStore.ts
import { sanitizeAndValidateCanvasDocument, sanitizeAndValidateCardState } from './schemaValidator';

export interface SavedProject {
  id: string;
  title: string;
  type: 'card' | 'canvas';
  aspectRatio: string;
  previewDataUrl?: string;
  updatedAt: number;
  data: any;
}

const DB_NAME = 'AestheticCardStudioProjectsDB';
const STORE_NAME = 'projects';
const DB_VERSION = 1;

function openProjectsDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
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

export async function saveProjectLocally(project: SavedProject): Promise<void> {
  if (!project || typeof project !== 'object') {
    throw new Error('Invalid project structure');
  }

  // Sanitize project payload before writing to persistent storage
  const sanitizedProject: SavedProject = {
    id: typeof project.id === 'string' ? project.id.slice(0, 100) : `project_${Date.now()}`,
    title: typeof project.title === 'string' ? project.title.slice(0, 200).replace(/[<>]/g, '') : 'Untitled Project',
    type: project.type === 'canvas' ? 'canvas' : 'card',
    aspectRatio: typeof project.aspectRatio === 'string' ? project.aspectRatio.slice(0, 20) : '1:1',
    previewDataUrl: typeof project.previewDataUrl === 'string' && project.previewDataUrl.startsWith('data:image/') ? project.previewDataUrl : undefined,
    updatedAt: typeof project.updatedAt === 'number' && Number.isFinite(project.updatedAt) ? project.updatedAt : Date.now(),
    data: project.type === 'canvas' ? sanitizeAndValidateCanvasDocument(project.data) : sanitizeAndValidateCardState(project.data),
  };

  const db = await openProjectsDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(sanitizedProject);
    req.onsuccess = () => resolve();
    req.onerror = () => {
      const err = req.error;
      const isQuota = err?.name === 'QuotaExceededError';
      if (isQuota) {
        reject(new Error('IndexedDB storage quota reached. Please delete old projects to free space.'));
      } else {
        reject(err || new Error('Failed to save project locally.'));
      }
    };
  });
}

export async function loadAllProjectsLocally(): Promise<SavedProject[]> {
  try {
    const db = await openProjectsDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const rawResults: SavedProject[] = req.result || [];
        const validated: SavedProject[] = [];

        for (const p of rawResults) {
          if (!p || typeof p !== 'object' || !p.id) continue;
          validated.push({
            id: String(p.id).slice(0, 100),
            title: String(p.title || 'Untitled Project').slice(0, 200),
            type: p.type === 'canvas' ? 'canvas' : 'card',
            aspectRatio: String(p.aspectRatio || '1:1'),
            previewDataUrl: p.previewDataUrl,
            updatedAt: typeof p.updatedAt === 'number' ? p.updatedAt : 0,
            data: p.data,
          });
        }

        const sorted = validated.sort((a, b) => b.updatedAt - a.updatedAt);
        resolve(sorted);
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

export async function deleteProjectLocally(id: string): Promise<void> {
  const db = await openProjectsDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
