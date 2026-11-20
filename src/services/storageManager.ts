// src/services/storageManager.ts

/**
 * Storage keys used across ACG
 */
export const ACG_STORAGE_KEYS = {
  CANVAS_DRAFT_V2: 'aesthetic_canvas_editor_draft_v2',
  CANVAS_DRAFT_V1: 'aesthetic_canvas_editor_draft_v1',
  CARD_DRAFT: 'aesthetic_card_studio_draft_v1',
  RECYCLED_CLIPS: 'aesthetic_recycled_clips',
  AMBIENT_ENABLED: 'acg_ambient_enabled',
  THEME_PREFERENCE: 'acg_theme_preference',
  HERO_QUOTE_SESSION: 'aesthetic_card_studio_hero_quote',
} as const;

/**
 * Stale or legacy storage keys to clean up when quota is tight
 */
const PRUNABLE_KEYS = [
  'aesthetic_canvas_editor_draft_v1',
  'aesthetic_card_studio_hero_quote',
  'acg_temporary_export_cache',
];

/**
 * Safe localStorage setter with automatic quota recovery and exception shielding
 */
export function safeLocalStorageSet(
  key: string,
  value: string
): { success: boolean; quotaExceeded?: boolean; error?: string } {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { success: false, error: 'localStorage unavailable' };
  }

  try {
    localStorage.setItem(key, value);
    return { success: true };
  } catch (err: any) {
    const isQuota =
      err?.name === 'QuotaExceededError' ||
      err?.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      err?.code === 22 ||
      err?.code === 1014;

    if (isQuota) {
      console.warn(`localStorage quota reached while writing "${key}". Pruning stale cache keys...`);
      // Evict legacy and temporary storage keys
      for (const prunable of PRUNABLE_KEYS) {
        try {
          localStorage.removeItem(prunable);
        } catch {
          // ignore
        }
      }

      // Retry once after pruning
      try {
        localStorage.setItem(key, value);
        return { success: true };
      } catch (retryErr: any) {
        console.error('Failed to write to localStorage after pruning:', retryErr);
        return { success: false, quotaExceeded: true, error: 'Storage quota exceeded' };
      }
    }

    return { success: false, error: err?.message || 'Storage write failed' };
  }
}

/**
 * Safe localStorage getter that shields against private browsing mode security errors
 */
export function safeLocalStorageGet(key: string): string | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * Safe localStorage remover
 */
export function safeLocalStorageRemove(key: string): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

/**
 * Safe sessionStorage setter
 */
export function safeSessionStorageSet(key: string, value: string): boolean {
  if (typeof window === 'undefined' || !window.sessionStorage) return false;
  try {
    sessionStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Safe sessionStorage getter
 */
export function safeSessionStorageGet(key: string): string | null {
  if (typeof window === 'undefined' || !window.sessionStorage) return null;
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}
