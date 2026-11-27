/**
 * Client-side anti-inspect and anti-copy guards.
 * Keeps editable inputs/textareas and keyboard accessibility (Tab, Esc, Enter, ⌘K) working.
 */

export function isEditableTarget(target: EventTarget | null): boolean {
  if (!target || typeof target !== 'object') return false;
  const el = target as HTMLElement;
  const tag = el.tagName?.toUpperCase();
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
    const field = el as HTMLInputElement;
    return !field.readOnly && !field.disabled;
  }
  if (el.isContentEditable) return true;
  if (typeof el.closest === 'function') {
    return Boolean(
      el.closest(
        'input:not([readonly]):not([disabled]), textarea:not([readonly]):not([disabled]), select:not([disabled]), [contenteditable="true"], [contenteditable=""]'
      )
    );
  }
  return false;
}

export interface KeyGuardInput {
  key?: string;
  keyCode?: number;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  target?: EventTarget | null;
}

export function shouldBlockInspectOrCopyKey(e: KeyGuardInput): boolean {
  const key = (e.key || '').toLowerCase();
  const mod = Boolean(e.ctrlKey || e.metaKey);

  // F12 DevTools key
  if (key === 'f12' || e.keyCode === 123) return true;

  // Browser DevTools & Inspector shortcuts (Windows/Linux Ctrl+Shift+*, macOS Cmd+Opt+*)
  if (e.ctrlKey && e.shiftKey && (key === 'i' || key === 'j' || key === 'c' || key === 'k')) return true;
  if (e.metaKey && e.altKey && (key === 'i' || key === 'j' || key === 'c' || key === 'u' || key === 'k')) return true;

  // View Source, Save Page, Print
  if (mod && !e.shiftKey && (key === 'u' || key === 's' || key === 'p')) return true;

  // Copy, Cut, Select-All blocked outside user-editable inputs
  if (mod && !e.altKey && (key === 'c' || key === 'x' || key === 'a') && !isEditableTarget(e.target ?? null)) {
    return true;
  }

  return false;
}

export function installContentProtection(): () => void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return () => {};

  const onContextMenu = (e: Event) => {
    e.preventDefault();
  };

  const onSelectStart = (e: Event) => {
    if (!isEditableTarget(e.target)) {
      e.preventDefault();
    }
  };

  const onCopyOrCut = (e: ClipboardEvent) => {
    if (!isEditableTarget(e.target)) {
      e.preventDefault();
      try {
        e.clipboardData?.setData('text/plain', '');
      } catch {
        // Clipboard write optional in synthetic events
      }
    }
  };

  const onDragStart = (e: Event) => {
    e.preventDefault();
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (shouldBlockInspectOrCopyKey(e)) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  document.addEventListener('contextmenu', onContextMenu, true);
  document.addEventListener('selectstart', onSelectStart, true);
  document.addEventListener('copy', onCopyOrCut, true);
  document.addEventListener('cut', onCopyOrCut, true);
  document.addEventListener('dragstart', onDragStart, true);
  window.addEventListener('keydown', onKeyDown, true);

  return () => {
    document.removeEventListener('contextmenu', onContextMenu, true);
    document.removeEventListener('selectstart', onSelectStart, true);
    document.removeEventListener('copy', onCopyOrCut, true);
    document.removeEventListener('cut', onCopyOrCut, true);
    document.removeEventListener('dragstart', onDragStart, true);
    window.removeEventListener('keydown', onKeyDown, true);
  };
}
