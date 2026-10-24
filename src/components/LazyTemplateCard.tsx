// src/components/LazyTemplateCard.tsx
import React, { useEffect, useRef, useState } from 'react';

export const LazyTemplateCard: React.FC<{
  aspectRatioClass?: string;
  className?: string;
  children: React.ReactNode;
}> = ({ aspectRatioClass = 'aspect-[4/5]', className = '', children }) => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const node = hostRef.current;
    if (!node) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          const timer = window.setTimeout(() => setHydrated(true), 60);
          io.disconnect();
          return () => window.clearTimeout(timer);
        }
      },
      { rootMargin: '240px 0px', threshold: 0.05 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={hostRef}
      className={`relative overflow-hidden rounded-2xl border border-white/[0.08] dark:border-white/[0.08] ${aspectRatioClass} ${className} template-card-kinetic`}
    >
      {/* Clean, Neutral Geometric Skeleton while mounting */}
      {!hydrated && (
        <div
          aria-hidden="true"
          className="absolute inset-0 z-10 flex flex-col justify-between p-6 bg-[#13161c] transition-opacity duration-300 pointer-events-none select-none"
        >
          {/* Top metadata skeleton */}
          <div className="flex justify-between items-center">
            <div className="h-3 w-20 rounded bg-white/[0.06]" />
            <div className="h-4 w-12 rounded bg-white/[0.06]" />
          </div>

          {/* Central quote text skeleton */}
          <div className="space-y-2.5 my-auto">
            <div className="h-4 w-5/6 rounded bg-white/[0.07]" />
            <div className="h-4 w-4/6 rounded bg-white/[0.07]" />
            <div className="h-4 w-3/6 rounded bg-white/[0.05]" />
          </div>

          {/* Bottom citation skeleton */}
          <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
            <div className="h-3 w-28 rounded bg-white/[0.06]" />
            <div className="h-3 w-8 rounded bg-white/[0.04]" />
          </div>

          {/* Ambient subtle shimmer sweep */}
          <div className="lazy-shimmer-sweep absolute inset-0 pointer-events-none" />
        </div>
      )}

      {/* Real Card Content Reveal */}
      {inView && (
        <div
          className={`w-full h-full transition-opacity duration-300 ease-out ${
            hydrated ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {children}
        </div>
      )}
    </div>
  );
};
