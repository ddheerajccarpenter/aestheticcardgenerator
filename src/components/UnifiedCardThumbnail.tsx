import React, { useMemo } from 'react';
import type { CanvasDocument, CanvasObject, ImageCanvasObject, ShapeCanvasObject, CardTemplate } from '../types/card';
import { templateToCanvasDoc, resolveCanvasFontFamily } from '../utils/canvasBuilder';
import { generateBarcodeSvg, generateQrCodeSvg } from '../utils/qrBarcodeGenerator';

interface UnifiedCardThumbnailProps {
  template: CardTemplate;
  isLight?: boolean;
  className?: string;
  minHeight?: string;
  interactiveTilt?: boolean;
  onClick?: () => void;
}

const pct = (value: number, total: number) => `${(value / total) * 100}%`;

const imageClip = (object: ImageCanvasObject): React.CSSProperties => {
  if (object.clipMask === 'circle') return { clipPath: 'circle(50% at 50% 50%)' };
  if (object.clipMask === 'oval') return { clipPath: 'ellipse(50% 50% at 50% 50%)' };
  if (object.clipMask === 'star') return { clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' };
  if (object.clipMask === 'heart') return { clipPath: 'polygon(50% 15%, 65% 0%, 85% 0%, 100% 15%, 100% 35%, 50% 85%, 0% 35%, 0% 15%, 15% 0%, 35% 0%)' };
  if (object.clipMask === 'id-frame') return { border: '1px solid rgba(0,0,0,0.3)', borderRadius: '6px', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.25), 0 2px 5px rgba(0,0,0,0.15)' };
  return {};
};

const renderShape = (object: ShapeCanvasObject, canvasWidth: number): React.ReactNode => {
  const scaled = (value: number) => `${(value / canvasWidth) * 100}cqw`;
  const outline = object.strokeWidth ? `${scaled(object.strokeWidth)} solid ${object.stroke}` : 'none';
  const shapeStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    backgroundColor: object.fill,
    border: outline,
    boxSizing: 'border-box',
    borderRadius: object.shape === 'rounded-rect' ? scaled(object.borderRadius || 16) : undefined,
  };

  switch (object.shape) {
    case 'rect':
    case 'rounded-rect':
    case 'line':
      return <div style={shapeStyle} />;
    case 'circle':
    case 'ellipse':
      return <div style={{ ...shapeStyle, borderRadius: '50%' }} />;
    case 'star':
      return <svg viewBox="0 0 100 100" className="h-full w-full"><polygon points="50,5 64,36 98,36 70,57 81,91 50,70 19,91 30,57 2,36 36,36" fill={object.fill} stroke={object.strokeWidth ? object.stroke : 'none'} strokeWidth={object.strokeWidth} /></svg>;
    case 'heart':
      return <svg viewBox="0 0 100 100" className="h-full w-full"><path d="M 50,85 C 20,60 5,40 5,25 C 5,10 20,5 35,5 C 43,5 50,15 50,15 C 50,15 57,5 65,5 C 80,5 95,10 95,25 C 95,40 80,60 50,85 Z" fill={object.fill} stroke={object.strokeWidth ? object.stroke : 'none'} strokeWidth={object.strokeWidth} /></svg>;
    case 'diamond':
      return <svg viewBox="0 0 100 100" className="h-full w-full"><polygon points="50,3 97,50 50,97 3,50" fill={object.fill} stroke={object.strokeWidth ? object.stroke : 'none'} strokeWidth={object.strokeWidth} /></svg>;
    case 'rubber-stamp':
      return <div className="flex h-full w-full items-center justify-center text-center font-mono font-bold uppercase tracking-[0.15em]" style={{ color: object.fill, border: `${scaled(3)} dashed currentColor`, padding: scaled(6), borderRadius: scaled(object.borderRadius || 8), fontSize: scaled(12) }}><span className="border border-current" style={{ padding: `${scaled(2)} ${scaled(10)}` }}>{object.stampText || 'APPROVED'}</span></div>;
    case 'security-seal':
      return <svg viewBox="0 0 100 100" className="h-full w-full" style={{ color: object.fill }}><circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="3 2" /><circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" /><text x="50" y="44" textAnchor="middle" fontSize="8" fontWeight="bold" fill="currentColor">OFFICIAL</text><text x="50" y="56" textAnchor="middle" fontSize="6" fontWeight="600" fill="currentColor" letterSpacing="1">SECURE PASS</text><circle cx="50" cy="50" r="49" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>;
    case 'washi-tape':
      return <div className="h-full w-full" style={{ backgroundColor: object.fill, clipPath: 'polygon(0% 12%, 3% 0%, 6% 14%, 9% 0%, 91% 0%, 94% 12%, 97% 0%, 100% 12%, 100% 88%, 97% 100%, 94% 86%, 91% 100%, 9% 100%, 6% 86%, 3% 100%, 0% 88%)' }} />;
    case 'rating-stars':
      return <div className="flex h-full w-full items-center justify-center">{[1, 2, 3, 4, 5].map((star) => <svg key={star} viewBox="0 0 24 24" className="h-full flex-1" fill={(object.starRating ?? 5) >= star ? object.fill : 'none'} stroke={object.fill} strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>)}</div>;
    case 'audio-waveform':
      return <div className="flex h-full w-full items-center justify-around gap-[1cqw] rounded border border-current/20 bg-black/10 px-[2cqw]" style={{ color: object.fill }}><span className="text-[3cqw]">▶</span><div className="flex h-3/4 flex-1 items-center justify-around">{[28, 44, 20, 54, 34, 48, 24, 60, 38, 54, 28, 44, 20, 38, 54, 34, 24, 48, 38].map((height, index) => <i key={index} className="w-[0.5cqw] rounded-full bg-current" style={{ height: `${height}%` }} />)}</div><span className="font-mono text-[2cqw]">02:40</span></div>;
    case 'barcode':
      return <img src={generateBarcodeSvg(object.payload || 'ACS-94820', { fill: object.fill, showLabel: object.showTextLabel !== false })} alt="" className="h-full w-full object-contain" />;
    case 'qr-code':
      return <img src={generateQrCodeSvg(object.payload || 'https://aestheticcardgenerator.pages.dev', { fill: object.fill, showLabel: object.showTextLabel })} alt="" className="h-full w-full object-contain" />;
    default:
      return null;
  }
};

const renderObject = (object: CanvasObject, doc: CanvasDocument) => {
  if (!object.visible) return null;
  const frame: React.CSSProperties = {
    position: 'absolute',
    left: pct(object.x, doc.canvasWidth),
    top: pct(object.y, doc.canvasHeight),
    width: pct(object.width, doc.canvasWidth),
    height: pct(object.height, doc.canvasHeight),
    transform: object.rotation ? `rotate(${object.rotation}deg)` : undefined,
    transformOrigin: 'center',
    zIndex: object.zIndex,
    opacity: object.type === 'shape' || object.type === 'image' ? object.opacity : undefined,
  };

  if (object.type === 'text') {
    return <div key={object.id} style={{ ...frame, fontFamily: resolveCanvasFontFamily(object.fontFamily), fontSize: `${(object.fontSize / doc.canvasWidth) * 100}cqw`, fontWeight: object.fontWeight, fontStyle: object.fontStyle, color: object.color, textAlign: object.align, lineHeight: object.lineHeight, letterSpacing: `${(object.letterSpacing / doc.canvasWidth) * 100}cqw`, whiteSpace: 'pre-wrap', wordBreak: 'break-word', display: 'flex', alignItems: 'center' }}>{object.text}</div>;
  }

  if (object.type === 'image') {
    return <div key={object.id} style={{ ...frame, borderRadius: `${(object.borderRadius / doc.canvasWidth) * 100}cqw`, overflow: 'hidden', ...imageClip(object) }}><img src={object.filteredSrc || object.src} alt="" loading="lazy" draggable={false} style={{ width: '100%', height: '100%', objectFit: object.objectFit }} /></div>;
  }

  return <div key={object.id} style={{ ...frame, color: object.fill }}>{renderShape(object, doc.canvasWidth)}</div>;
};

export const UnifiedCardThumbnail: React.FC<UnifiedCardThumbnailProps> = ({ template, className = '', onClick }) => {
  const document = useMemo(
    () => template.canvasDoc?.objects.length ? template.canvasDoc : templateToCanvasDoc(template),
    [template]
  );

  return (
    <div
      onClick={onClick}
      aria-hidden="true"
      className={`relative block w-full overflow-hidden ${className}`}
      style={{ aspectRatio: `${document.canvasWidth} / ${document.canvasHeight}`, backgroundColor: document.background, containerType: 'inline-size' }}
    >
      {!template.canvasDoc?.objects.length && template.showGrain && (
        <div className="card-noise pointer-events-none absolute inset-0 z-[2]" style={{ opacity: template.textureIntensity ?? 0.12 }} />
      )}
      {document.objects.slice().sort((a, b) => a.zIndex - b.zIndex).map((object) => renderObject(object, document))}
    </div>
  );
};
