/**
 * Universal 60:30:10 Scroll-Reactive 60FPS Gradient Engine
 * Tracks window.scrollY via requestAnimationFrame without layout thrashing
 */
export function initScrollGradientEngine(): () => void {
  let rafId: number | null = null;
  let lastScrollY = typeof window !== 'undefined' ? window.scrollY : 0;
  let currentVelocity = 0;
  const root = document.documentElement;

  const updateGradient = () => {
    const currentY = window.scrollY;
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = Math.min(1, Math.max(0, currentY / maxScroll));

    // Smoothly shift 60:30:10 stops and angle at 60fps
    const angle = (180 - progress * 18).toFixed(2);
    const stop60 = (60 - progress * 10).toFixed(2);
    const stop30 = (90 - progress * 8).toFixed(2);

    // Track scroll velocity clamped to [-2.5, 2.5]
    const delta = (currentY - lastScrollY) * 0.08;
    currentVelocity = Math.max(-2.5, Math.min(2.5, delta));
    lastScrollY = currentY;

    root.style.setProperty('--scroll-p', progress.toFixed(4));
    root.style.setProperty('--grad-angle', `${angle}deg`);
    root.style.setProperty('--stop-60', `${stop60}%`);
    root.style.setProperty('--stop-30', `${stop30}%`);
    root.style.setProperty('--scroll-velocity', currentVelocity.toFixed(3));
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
