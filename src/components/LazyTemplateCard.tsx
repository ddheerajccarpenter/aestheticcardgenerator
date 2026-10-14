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
          const timer = window.setTimeout(() => setHydrated(true), 180);
          io.disconnect();
          return () => window.clearTimeout(timer);
        }
      },
      { rootMargin: '180px 0px', threshold: 0.05 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={hostRef}
      className={`relative overflow-hidden rounded-[18px] border border-white/10 ${aspectRatioClass} ${className} template-card-kinetic`}
    >
      {/* Archival Blueprint Skeleton Loader while lazy-loading */}
      {!hydrated && (
        <div
          aria-hidden="true"
          className="absolute inset-0 z-10 flex flex-col justify-between p-5 bg-[#14161b] transition-opacity duration-300 pointer-events-none select-none"
        >
          <div className="flex justify-between items-center text-[10px] tracking-widest uppercase opacity-60 font-subheading">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#fcd535] animate-pulse" />
              + PLATE REG.
            </span>
            <span>LOADING SURFACE...</span>
          </div>

          {/* Architectural Crosshair Grid */}
          <div className="relative flex-1 flex items-center justify-center my-4 opacity-15">
            <div className="w-full h-[1px] bg-white/40 absolute top-1/2 left-0 -translate-y-1/2" />
            <div className="h-full w-[1px] bg-white/40 absolute left-1/2 top-0 -translate-x-1/2" />
            <div className="w-16 h-16 rounded-full border border-white/30 flex items-center justify-center text-[9px] font-mono">
              3D PBR
            </div>
          </div>

          <div className="lazy-shimmer-sweep absolute inset-0 pointer-events-none" />

          <div className="flex justify-between items-center text-[10px] opacity-50 font-subheading">
            <span className="font-mono">4K READY • MASTER</span>
            <span>+</span>
          </div>
        </div>
      )}

      {/* Real Card Content with Blur-Up & Spring Unfold */}
      {inView && (
        <div
          className={`w-full h-full transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            hydrated ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-[0.96] blur-[6px]'
          }`}
        >
          {children}
        </div>
      )}
    </div>
  );
};
