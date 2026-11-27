import { useEffect, useState } from 'react';
import { animate, createDrawable, cubicBezier, stagger } from 'animejs';

export const MOTION_STORAGE_KEY = 'acg_motion_paused';
export const EDITORIAL_EASE = cubicBezier(0.22, 1, 0.36, 1);

/** Checks OS reduced-motion preference or user pause toggle. */
export function isReducedMotion(): boolean {
  if (typeof window === 'undefined') return true;
  const osReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const userPaused = document.documentElement?.dataset?.motionPaused === 'true';
  return osReduced || userPaused;
}

export function getMotionPaused(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    if (document.documentElement?.dataset?.motionPaused === 'true') return true;
    return window.localStorage.getItem(MOTION_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setMotionPaused(paused: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(MOTION_STORAGE_KEY, paused ? 'true' : 'false');
  } catch {
    // Storage optional
  }
  if (paused) {
    document.documentElement.dataset.motionPaused = 'true';
  } else {
    delete document.documentElement.dataset.motionPaused;
  }
  window.dispatchEvent(new CustomEvent('acg:motion-toggled', { detail: { paused } }));
}

export function useMotionPaused(): boolean {
  const [paused, setPaused] = useState<boolean>(() => getMotionPaused());

  useEffect(() => {
    const sync = () => setPaused(getMotionPaused());
    window.addEventListener('acg:motion-toggled', sync);
    return () => window.removeEventListener('acg:motion-toggled', sync);
  }, []);

  return paused;
}

/**
 * Runs entrance choreography only once the initial SkeletonLoader begins lifting,
 * preventing mount animations from playing unseen behind the loading curtain.
 */
export function onStageReady(
  cb: () => void,
  getPreHideElements?: () => ArrayLike<HTMLElement> | null | undefined
): () => void {
  if (typeof window === 'undefined') return () => {};
  const win = window as unknown as { __acgLoaderDone?: boolean };
  if (win.__acgLoaderDone || !document.querySelector('[data-acg-skeleton]')) {
    cb();
    return () => {};
  }

  const preHidden: HTMLElement[] = [];
  if (!isReducedMotion() && getPreHideElements) {
    const els = getPreHideElements();
    if (els) {
      for (let i = 0; i < els.length; i++) {
        const el = els[i];
        el.style.opacity = '0';
        preHidden.push(el);
      }
    }
  }

  const revealFallback = () => {
    for (const el of preHidden) {
      el.style.opacity = '1';
      el.style.transform = 'none';
    }
  };

  const handleReady = () => {
    window.removeEventListener('acg:loader-cleared', handleReady);
    window.removeEventListener('acg:motion-toggled', handleMotion);
    cb();
  };
  const handleMotion = () => {
    if (isReducedMotion()) {
      window.removeEventListener('acg:loader-cleared', handleReady);
      window.removeEventListener('acg:motion-toggled', handleMotion);
      revealFallback();
    }
  };

  window.addEventListener('acg:loader-cleared', handleReady, { once: true });
  window.addEventListener('acg:motion-toggled', handleMotion);
  return () => {
    window.removeEventListener('acg:loader-cleared', handleReady);
    window.removeEventListener('acg:motion-toggled', handleMotion);
  };
}

/**
 * Editorial press word-mask reveal: words rise cleanly out of their line clip
 * so headline hierarchy reads like freshly inked type.
 */
export function revealPressWords(container: HTMLElement | null, delayOffset = 0): void {
  if (!container) return;
  const words = container.querySelectorAll<HTMLElement>('[data-press-word]');
  if (!words.length) return;

  if (isReducedMotion()) {
    words.forEach((w) => {
      w.style.opacity = '1';
      w.style.transform = 'none';
    });
    return;
  }

  animate(words, {
    y: ['108%', '0%'],
    opacity: [0, 1],
    duration: 560,
    delay: stagger(55, { start: delayOffset }),
    ease: EDITORIAL_EASE,
  });
}

/**
 * Draws SVG hairline paths (crop marks, registration dividers, checkmarks)
 * via Anime.js v4 createDrawable.
 */
export function drawSvgPaths(
  container: HTMLElement | SVGElement | null,
  selector = '[data-draw-path]',
  duration = 620,
  delayStep = 70
): void {
  if (!container) return;
  const nodes = container.querySelectorAll<SVGGeometryElement>(selector);
  if (!nodes.length || isReducedMotion()) return;

  const drawables = createDrawable(Array.from(nodes));
  animate(drawables, {
    draw: ['0 0', '0 1'],
    duration,
    delay: stagger(delayStep),
    ease: EDITORIAL_EASE,
  });
}

/**
 * Ensures gallery grid cards stay readable at rest with zero scroll-triggered hiding
 * or staggered scroll reveals per taste-skill motion rules.
 */
export function observeScrollReveal(
  container: HTMLElement | null,
  selector = '[data-reveal-card]',
  _options?: { staggerMs?: number; yOffset?: number; rootMargin?: string }
): () => void {
  if (!container || typeof window === 'undefined') return () => {};
  const nodes = Array.from(container.querySelectorAll<HTMLElement>(selector));
  for (const el of nodes) {
    el.style.opacity = '1';
    el.style.transform = 'none';
    el.dataset.revealed = '1';
  }
  return () => {};
}

/** Ease-out transition on stamps, toggles, or swapped card surfaces (no overshoot). */
export function animateSpringPop(
  target: HTMLElement | NodeListOf<HTMLElement> | HTMLElement[] | null,
  variant: 'stamp' | 'swap' | 'settle' = 'stamp'
): void {
  if (!target || isReducedMotion()) return;
  if (variant === 'stamp') {
    animate(target, {
      scale: [0.95, 1],
      duration: 200,
      ease: EDITORIAL_EASE,
    });
    return;
  }
  if (variant === 'swap') {
    animate(target, {
      opacity: [0.65, 1],
      y: [6, 0],
      duration: 240,
      ease: EDITORIAL_EASE,
    });
    return;
  }
  animate(target, {
    opacity: [0.75, 1],
    duration: 220,
    ease: EDITORIAL_EASE,
  });
}

/** Center-outward 2D grid stagger reveal for 5x5 Bingo deal & shuffle. */
export function animateGridWave(
  container: HTMLElement | null,
  selector: string,
  cols = 5,
  rows = 5
): void {
  if (!container || isReducedMotion()) return;
  const cells = container.querySelectorAll<HTMLElement>(selector);
  if (!cells.length) return;

  animate(cells, {
    scale: [0.94, 1],
    opacity: [0.4, 1],
    duration: 280,
    delay: stagger(18, { grid: [cols, rows], from: 'center' }),
    ease: EDITORIAL_EASE,
  });
}

const tiltLastUpdate = new WeakMap<HTMLElement, number>();

/** Pointer-reactive 3D paper tilt & specular light catch via CSS custom properties (capped ~60Hz, synchronous first hit). */
export function handleTiltPointerMove(e: React.PointerEvent<HTMLElement>): void {
  if (e.pointerType !== 'mouse' || isReducedMotion()) return;
  const el = e.currentTarget;
  const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const prev = tiltLastUpdate.get(el);
  if (prev !== undefined && now - prev < 16) return;
  const rect = el.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  tiltLastUpdate.set(el, now);
  const nx = Math.max(-0.5, Math.min(0.5, (e.clientX - rect.left) / rect.width - 0.5));
  const ny = Math.max(-0.5, Math.min(0.5, (e.clientY - rect.top) / rect.height - 0.5));
  el.style.setProperty('--tilt-x', `${(-ny * 8).toFixed(2)}deg`);
  el.style.setProperty('--tilt-y', `${(nx * 8).toFixed(2)}deg`);
  el.style.setProperty('--glint-x', `${((nx + 0.5) * 100).toFixed(1)}%`);
  el.style.setProperty('--glint-y', `${((ny + 0.5) * 100).toFixed(1)}%`);
}

export function handleTiltPointerLeave(e: React.PointerEvent<HTMLElement>): void {
  const el = e.currentTarget;
  tiltLastUpdate.delete(el);
  el.style.setProperty('--tilt-x', '0deg');
  el.style.setProperty('--tilt-y', '0deg');
  el.style.setProperty('--glint-x', '50%');
  el.style.setProperty('--glint-y', '50%');
}
