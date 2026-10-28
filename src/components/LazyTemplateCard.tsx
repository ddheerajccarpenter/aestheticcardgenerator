import React, { useEffect, useRef, useState } from 'react';

export const LazyTemplateCard: React.FC<{
  aspectRatioClass?: string;
  aspectRatio?: number;
  className?: string;
  children: React.ReactNode;
}> = ({ aspectRatioClass = 'aspect-[4/5]', aspectRatio, className = '', children }) => {
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

  return (
    <div
      ref={hostRef}
      className={`relative w-full overflow-hidden ${aspectRatioClass} ${className}`}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {inView && <div className="h-full w-full">{children}</div>}
    </div>
  );
};
