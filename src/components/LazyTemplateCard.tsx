import React, { useEffect, useRef, useState } from 'react';
import { getStageInnerWidth } from '../utils/templateAspectRatio';

const observerCallbacks = new WeakMap<Element, () => void>();
let sharedObserver: IntersectionObserver | null = null;

function getSharedObserver(): IntersectionObserver | null {
  if (typeof IntersectionObserver === 'undefined') return null;
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const reveal = observerCallbacks.get(entry.target);
          sharedObserver?.unobserve(entry.target);
          observerCallbacks.delete(entry.target);
          reveal?.();
        }
      },
      { rootMargin: '240px 0px', threshold: 0.05 }
    );
  }
  return sharedObserver;
}

export const LazyTemplateCard: React.FC<{
  aspectRatioClass?: string;
  aspectRatio?: number;
  stageRatio?: number;
  stageClassName?: string;
  className?: string;
  children: React.ReactNode;
}> = ({ aspectRatioClass = 'aspect-[4/5]', aspectRatio, stageRatio, stageClassName = '', className = '', children }) => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(() => typeof IntersectionObserver === 'undefined');

  useEffect(() => {
    if (inView) return;
    const node = hostRef.current;
    const io = getSharedObserver();
    if (!node || !io) {
      setInView(true);
      return;
    }
    observerCallbacks.set(node, () => setInView(true));
    io.observe(node);
    return () => {
      io.unobserve(node);
      observerCallbacks.delete(node);
    };
  }, [inView]);

  const cardFrame = (
    <div
      ref={hostRef}
      className={`relative w-full overflow-hidden ${aspectRatioClass} ${className}`}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {inView && <div className="h-full w-full">{children}</div>}
    </div>
  );

  if (!stageRatio) return cardFrame;

  const resolvedRatio = aspectRatio ?? 4 / 5;
  return (
    <div className={stageClassName}>
      <div className="flex w-full items-center justify-center" style={{ aspectRatio: stageRatio }}>
        <div className="shrink-0" style={{ width: getStageInnerWidth(resolvedRatio, stageRatio) }}>
          {cardFrame}
        </div>
      </div>
    </div>
  );
};
