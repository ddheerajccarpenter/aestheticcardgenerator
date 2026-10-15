/**
 * Universal 60:30:10 Scroll-Reactive 60FPS Gradient Engine
 * Tracks window.scrollY via requestAnimationFrame without layout thrashing
 */
export function initScrollGradientEngine(): () => void {
  let rafId: number | null = null;
  let bgEl: HTMLElement | null = null;

  const updateGradient = () => {
    if (!bgEl) {
      bgEl = document.querySelector('.universal-page-bg');
    }
    const target = bgEl || document.documentElement;

    const currentY = window.scrollY;
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = Math.min(1, Math.max(0, currentY / maxScroll));

    // Smoothly shift 60:30:10 stops and angle
    const angle = (180 - progress * 18).toFixed(2);
    const stop60 = (60 - progress * 10).toFixed(2);
    const stop30 = (90 - progress * 8).toFixed(2);

    target.style.setProperty('--grad-angle', `${angle}deg`);
    target.style.setProperty('--stop-60', `${stop60}%`);
    target.style.setProperty('--stop-30', `${stop30}%`);
    rafId = null;
  };

  const onScroll = () => {
    if (rafId === null) {
      rafId = window.requestAnimationFrame(updateGradient);
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  updateGradient();

  return () => {
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
    if (rafId !== null) cancelAnimationFrame(rafId);
  };
}
