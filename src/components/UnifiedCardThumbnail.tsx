import React, { useState, useRef } from 'react';
import type { CardTemplate } from '../types/card';
import { ASSET_AVATARS } from '../data/canvasAssets';
import { sanitizeQuote } from '../utils/richText';

interface UnifiedCardThumbnailProps {
  template: CardTemplate;
  isLight?: boolean;
  className?: string;
  minHeight?: string;
  interactiveTilt?: boolean;
  onClick?: () => void;
}

export const UnifiedCardThumbnail: React.FC<UnifiedCardThumbnailProps> = ({
  template,
  className = '',
  minHeight,
  interactiveTilt = true,
  onClick,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tiltStyle, setTiltStyle] = useState<React.CSSProperties>({});
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });

  const isIdStyle = template.hasPhotoArea || template.category === 'id-card';
  const isVertical = template.layoutHint === 'vertical';

  const defaultMinH = minHeight || (isVertical ? 'min-h-[290px]' : 'min-h-[240px]');

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!interactiveTilt || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const px = (x / rect.width) * 100;
    const py = (y / rect.height) * 100;

    const rotY = ((x / rect.width) - 0.5) * 10;
    const rotX = -((y / rect.height) - 0.5) * 10;

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(1.01, 1.01, 1.01)`,
      transition: 'transform 80ms ease-out',
    });
    setGlarePos({ x: px, y: py, opacity: 0.15 });
  };

  const handlePointerLeave = () => {
    if (!interactiveTilt) return;
    setTiltStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 360ms cubic-bezier(0.34, 1.56, 0.64, 1)',
    });
    setGlarePos((prev) => ({ ...prev, opacity: 0 }));
  };

  // Select sample avatar based on template vibe
  const avatarSrc =
    (template.canvasDoc?.objects?.find((o) => o.type === 'image') as any)?.src ||
    (template.id.includes('pretty') || template.id.includes('kawaii') || template.id.includes('soulmate')
      ? ASSET_AVATARS.jenniePretty
      : template.id.includes('dan') || template.id.includes('delulu') || template.id.includes('cyber') || template.id.includes('acid')
      ? ASSET_AVATARS.grungeDan
      : template.id.includes('anime') || template.id.includes('travel')
      ? ASSET_AVATARS.animeTraveler
      : ASSET_AVATARS.studentScholar);

  const cleanQuote = sanitizeQuote(template.quote);

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onClick={onClick}
      style={{
        backgroundColor: template.theme.bg,
        color: template.theme.ink,
        ...tiltStyle,
      }}
      className={`relative p-6 flex flex-col justify-between border-b border-black/10 overflow-hidden select-none will-change-transform ${defaultMinH} ${className}`}
    >
      {/* Subtle tactile paper micro-grain */}
      <div className="absolute inset-0 card-noise opacity-20 pointer-events-none" />

      {/* Dynamic 3D glare / sheen layer */}
      {interactiveTilt && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-200"
          style={{
            background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,${glarePos.opacity}) 0%, transparent 60%)`,
          }}
        />
      )}

      {/* Pure Header Strip: Folio tag & Badge */}
      <div className="flex items-center justify-between text-[11px] font-mono opacity-80 z-10 shrink-0">
        <span className="font-semibold truncate max-w-[200px] tracking-wider">
          {template.tag || template.categoryLabel}
        </span>
        <span className="border border-current/35 px-1.5 py-0.5 rounded font-mono text-[9px] font-bold tracking-tight">
          {template.badge || 'EST. 2026'}
        </span>
      </div>

      {/* Center Body Visuals */}
      {isIdStyle ? (
        <div className="my-3 flex items-center gap-3.5 z-10">
          <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden border border-current/30 shadow-md shrink-0 relative bg-black/10">
            <img
              src={avatarSrc}
              alt={template.title}
              className="w-full h-full object-cover grayscale contrast-125"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-current/10 mix-blend-multiply pointer-events-none" />
          </div>
          <div className="flex-1 min-w-0 flex flex-col gap-1 text-[11px] font-sans">
            <span className="font-bold text-sm tracking-tight truncate block">
              {template.title}
            </span>
            <p className="opacity-75 line-clamp-2 text-[10px] leading-snug font-body">
              {cleanQuote}
            </p>
            <div className="mt-1 flex items-center gap-1.5 text-[9px] font-mono opacity-65">
              <span className="font-bold tracking-widest">||||| ||| ||||</span>
              <span>ID-PASS</span>
            </div>
          </div>
        </div>
      ) : (
        <blockquote className="my-4 text-base sm:text-lg leading-relaxed line-clamp-3 font-editorial z-10 font-normal">
          “{cleanQuote}”
        </blockquote>
      )}

      {/* Pure Footer: Author & Category Label */}
      <div className="flex items-center justify-between text-[11px] font-medium opacity-80 truncate z-10 pt-2 border-t border-current/15 shrink-0">
        <cite className="not-italic truncate max-w-[200px] font-subheading">
          — {template.author}
        </cite>
        <span className="font-mono text-[9px] uppercase opacity-70 tracking-wider">
          {template.categoryLabel}
        </span>
      </div>
    </div>
  );
};
