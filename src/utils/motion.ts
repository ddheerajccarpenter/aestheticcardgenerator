import { useEffect, useState } from 'react';
import { animate, createDrawable, cubicBezier, spring, stagger } from 'animejs';

export const MOTION_STORAGE_KEY = 'acg_motion_paused';
export const EDITORIAL_EASE = cubicBezier(0.16, 1, 0.3, 1);

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
 * Batched IntersectionObserver reveal: animates elements in row batches as they
 * enter the viewport instead of firing unseen animations at initial load.
 */
export function observeScrollReveal(
  container: HTMLElement | null,
  selector = '[data-reveal-card]',
  options?: { staggerMs?: number; yOffset?: number; rootMargin?: string }
): () => void {
  if (!container || typeof window === 'undefined') return () => {};
  const nodes = Array.from(container.querySelectorAll<HTMLElement>(selector));
  if (!nodes.length) return () => {};

  if (isReducedMotion() || typeof IntersectionObserver === 'undefined') {
    nodes.forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    return () => {};
  }

  const staggerMs = options?.staggerMs ?? 38;
  const yOffset = options?.yOffset ?? 18;
  const pending = new Set<HTMLElement>();
  let rafId: number | null = null;

  const flushBatch = () => {
    rafId = null;
    if (!pending.size) return;
    const batch = Array.from(pending);
    pending.clear();
    batch.forEach((el) => {
      el.dataset.revealed = '1';
    });
    animate(batch, {
      opacity: [0, 1],
      y: [yOffset, 0],
      scale: [0.985, 1],
      duration: 460,
      delay: stagger(staggerMs),
      ease: EDITORIAL_EASE,
    });
  };

  // Pre-hide only elements that have not yet revealed so offscreen cards animate on scroll.
  nodes.forEach((el) => {
    if (el.dataset.revealed === '1') return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.96) {
      el.style.opacity = '0';
      pending.add(el);
    } else {
      el.style.opacity = '0';
    }
  });

  if (pending.size) {
    rafId = window.requestAnimationFrame(flushBatch);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const target = entry.target as HTMLElement;
        observer.unobserve(target);
        if (target.dataset.revealed === '1') continue;
        pending.add(target);
      }
      if (pending.size && rafId === null) {
        rafId = window.requestAnimationFrame(flushBatch);
      }
    },
    { rootMargin: options?.rootMargin ?? '40px 0px', threshold: 0.04 }
  );

  nodes.forEach((el) => {
    if (el.dataset.revealed !== '1' && !pending.has(el)) {
      observer.observe(el);
    }
  });

  const handleMotionToggle = () => {
    if (isReducedMotion()) {
      observer.disconnect();
      nodes.forEach((el) => {
        el.style.opacity = '1';
        el.style.transform = 'none';
        el.dataset.revealed = '1';
      });
    }
  };
  window.addEventListener('acg:motion-toggled', handleMotionToggle);

  return () => {
    observer.disconnect();
    window.removeEventListener('acg:motion-toggled', handleMotionToggle);
    if (rafId !== null) window.cancelAnimationFrame(rafId);
  };
}

/** Tactile spring impulse on stamps, buttons, or newly swapped card surfaces. */
export function animateSpringPop(
  target: HTMLElement | NodeListOf<HTMLElement> | HTMLElement[] | null,
  variant: 'stamp' | 'swap' | 'settle' = 'stamp'
): void {
  if (!target || isReducedMotion()) return;
  if (variant === 'stamp') {
    animate(target, {
      scale: [0.88, 1.03, 1],
      duration: 380,
      ease: spring({ bounce: 0.34, duration: 360 }),
    });
    return;
  }
  if (variant === 'swap') {
    animate(target, {
      opacity: [0.55, 1],
      y: [8, 0],
      duration: 320,
      ease: EDITORIAL_EASE,
    });
    return;
  }
  animate(target, {
    scale: [0.96, 1],
    opacity: [0.7, 1],
    duration: 340,
    ease: EDITORIAL_EASE,
  });
}

/** Center-outward 2D grid ripple (ideal for 5x5 Bingo deal & shuffle). */
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
    scale: [0.84, 1],
    opacity: [0.35, 1],
    duration: 400,
    delay: stagger(20, { grid: [cols, rows], from: 'center' }),
    ease: spring({ bounce: 0.22, duration: 380 }),
  });
}

/** Pointer-reactive 3D paper tilt & specular light catch via CSS custom properties (no React re-renders). */
export function handleTiltPointerMove(e: React.PointerEvent<HTMLElement>): void {
  if (e.pointerType !== 'mouse' || isReducedMotion()) return;
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const nx = Math.max(-0.5, Math.min(0.5, (e.clientX - rect.left) / rect.width - 0.5));
  const ny = Math.max(-0.5, Math.min(0.5, (e.clientY - rect.top) / rect.height - 0.5));
  el.style.setProperty('--tilt-x', `${(-ny * 8).toFixed(2)}deg`);
  el.style.setProperty('--tilt-y', `${(nx * 8).toFixed(2)}deg`);
  el.style.setProperty('--glint-x', `${((nx + 0.5) * 100).toFixed(1)}%`);
  el.style.setProperty('--glint-y', `${((ny + 0.5) * 100).toFixed(1)}%`);
}

export function handleTiltPointerLeave(e: React.PointerEvent<HTMLElement>): void {
  const el = e.currentTarget;
  el.style.setProperty('--tilt-x', '0deg');
  el.style.setProperty('--tilt-y', '0deg');
  el.style.setProperty('--glint-x', '50%');
  el.style.setProperty('--glint-y', '50%');
}
