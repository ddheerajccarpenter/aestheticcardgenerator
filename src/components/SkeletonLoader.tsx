import React, { useState, useEffect } from 'react';

interface SkeletonLoaderProps {
  durationMs?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ durationMs = 1600 }) => {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Respect user's motion preference: if reduced motion is requested, dismiss faster
    const isReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const activeDuration = isReduced ? 400 : durationMs;

    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, activeDuration);

    const removeTimer = setTimeout(() => {
      setVisible(false);
    }, activeDuration + 350);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [durationMs]);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-50 flex flex-col bg-[var(--app-bg,#121110)] text-[var(--app-text,#efe6d8)] transition-opacity duration-300 pointer-events-none select-none ${
        fading ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Top Header Skeleton */}
      <header className="h-14 sm:h-16 border-b border-[var(--app-border-subtle,rgba(255,255,255,0.08))] px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--app-surface-secondary,rgba(255,255,255,0.06))] animate-pulse" />
          <div className="h-4 w-28 sm:w-36 rounded bg-[var(--app-surface-secondary,rgba(255,255,255,0.06))] animate-pulse" />
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:flex items-center gap-2">
            <div className="h-8 w-18 rounded-lg bg-[var(--app-surface-secondary,rgba(255,255,255,0.05))] animate-pulse" />
            <div className="h-8 w-20 rounded-lg bg-[var(--app-surface-secondary,rgba(255,255,255,0.05))] animate-pulse" />
          </div>
          <div className="w-9 h-9 rounded-xl bg-[var(--app-surface-secondary,rgba(255,255,255,0.06))] animate-pulse" />
          <div className="w-20 h-9 rounded-xl bg-[var(--app-surface-secondary,rgba(255,255,255,0.08))] animate-pulse" />
        </div>
      </header>

      {/* Main Content Skeleton Area */}
      <div className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 flex flex-col gap-6 overflow-hidden">
        {/* Editorial Title / Hero Area */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-2">
          <div className="flex flex-col gap-2">
            <div className="h-3 w-24 rounded bg-[var(--app-surface-secondary,rgba(255,255,255,0.05))] animate-pulse" />
            <div className="h-7 sm:h-9 w-64 sm:w-96 rounded-lg bg-[var(--app-surface-secondary,rgba(255,255,255,0.07))] animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-24 rounded-full bg-[var(--app-surface-secondary,rgba(255,255,255,0.05))] animate-pulse" />
            <div className="h-8 w-24 rounded-full bg-[var(--app-surface-secondary,rgba(255,255,255,0.05))] animate-pulse" />
          </div>
        </div>

        {/* Studio Stage / Featured Hero Card Wireframe */}
        <div className="w-full h-64 sm:h-80 rounded-2xl border border-[var(--app-border-subtle,rgba(255,255,255,0.08))] bg-[var(--app-surface,rgba(255,255,255,0.03))] p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent animate-shimmer-sweep pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <div className="h-4 w-32 rounded bg-[var(--app-surface-secondary,rgba(255,255,255,0.06))] animate-pulse" />
            <div className="h-6 w-16 rounded-full bg-[var(--app-surface-secondary,rgba(255,255,255,0.05))] animate-pulse" />
          </div>
          <div className="flex flex-col gap-3 my-auto max-w-lg relative z-10">
            <div className="h-6 w-3/4 rounded bg-[var(--app-surface-secondary,rgba(255,255,255,0.08))] animate-pulse" />
            <div className="h-4 w-1/2 rounded bg-[var(--app-surface-secondary,rgba(255,255,255,0.05))] animate-pulse" />
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-[var(--app-border-subtle,rgba(255,255,255,0.05))] relative z-10">
            <div className="h-3 w-24 rounded bg-[var(--app-surface-secondary,rgba(255,255,255,0.05))] animate-pulse" />
            <div className="h-7 w-24 rounded-lg bg-[var(--app-surface-secondary,rgba(255,255,255,0.06))] animate-pulse" />
          </div>
        </div>

        {/* Card Grid Skeleton Preview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {[1, 2, 3].map((idx) => (
            <div
              key={idx}
              className="h-44 rounded-xl border border-[var(--app-border-subtle,rgba(255,255,255,0.06))] bg-[var(--app-surface,rgba(255,255,255,0.02))] p-4 flex flex-col justify-between relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/8 dark:via-white/4 to-transparent animate-shimmer-sweep pointer-events-none" style={{ animationDelay: `${idx * 150}ms` }} />
              <div className="h-4 w-28 rounded bg-[var(--app-surface-secondary,rgba(255,255,255,0.05))] animate-pulse relative z-10" />
              <div className="h-8 w-4/5 rounded bg-[var(--app-surface-secondary,rgba(255,255,255,0.07))] animate-pulse my-auto relative z-10" />
              <div className="h-3 w-20 rounded bg-[var(--app-surface-secondary,rgba(255,255,255,0.04))] animate-pulse relative z-10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
