import React, { useEffect, useRef, useState } from 'react';
import { getStageInnerWidth } from '../utils/templateAspectRatio';

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
    const node = hostRef.current;
    if (!node) return;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setInView(true);
      io.disconnect();
    }, { rootMargin: '240px 0px', threshold: 0.05 });
    io.observe(node);
    return () => io.disconnect();
  }, []);

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
