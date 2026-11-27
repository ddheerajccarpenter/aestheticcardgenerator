import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Box,
  Check,
  Copy,
  Download,
  EraserFallback,
  Grid,
  Layers,
  Menu,
  Moon,
  Palette,
  Redo2,
  Search,
  Sliders,
  Sun,
  Trash2,
  Type,
  Undo2,
  Upload,
  X,
} from './icons/faBadgeIcons';

export type DuotoneIconName =
  | 'logo'
  | 'search'
  | 'book'
  | 'moon'
  | 'sun'
  | 'compare'
  | 'ambient'
  | 'cube'
  | 'font'
  | 'image-add'
  | 'eraser'
  | 'grid'
  | 'download'
  | 'arrow-right'
  | 'arrow-left'
  | 'check'
  | 'copy'
  | 'close'
  | 'menu'
  | 'undo'
  | 'redo'
  | 'trash'
  | 'palette'
  | 'sliders'
  | 'safe-zone'
  | 'layers';

interface SquareDuotoneIconProps {
  name?: DuotoneIconName;
  boxicon?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'dark' | 'light' | 'inherit';
  className?: string;
  title?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export const SquareDuotoneIcon: React.FC<SquareDuotoneIconProps> = ({
  name,
  boxicon,
  size = 'md',
  variant = 'default',
  className = '',
  title,
  onClick,
}) => {
  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-10 h-10 text-base',
  }[size];

  const variantClass = variant === 'dark' ? 'sq-icon-dark' : variant === 'light' ? 'sq-icon-light' : '';
  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 19 : 16;

  const renderIconContent = () => {
    if (boxicon) {
      return (
        <i className={`bx ${boxicon} text-[18px] text-[var(--icon-duotone-primary)] leading-none`} />
      );
    }

    const cls = 'text-[var(--icon-duotone-primary)]';
    switch (name) {
      case 'search':
        return <Search size={iconSize} className={cls} aria-hidden="true" />;
      case 'book':
        return <BookOpen size={iconSize} className={cls} aria-hidden="true" />;
      case 'moon':
        return <Moon size={iconSize} className={cls} aria-hidden="true" />;
      case 'sun':
        return <Sun size={iconSize} className={cls} aria-hidden="true" />;
      case 'compare':
        return <EraserFallback size={iconSize} kind="compare" className={cls} />;
      case 'ambient':
        return <EraserFallback size={iconSize} kind="ambient" className={cls} />;
      case 'cube':
        return <Box size={iconSize} className={cls} aria-hidden="true" />;
      case 'download':
        return <Download size={iconSize} className={cls} aria-hidden="true" />;
      case 'font':
        return <Type size={iconSize} className={cls} aria-hidden="true" />;
      case 'eraser':
        return <EraserFallback size={iconSize} kind="eraser" className={cls} />;
      case 'grid':
      case 'logo':
        return <Grid size={iconSize} className={cls} aria-hidden="true" />;
      case 'arrow-right':
        return <ArrowRight size={iconSize} className={cls} aria-hidden="true" />;
      case 'arrow-left':
        return <ArrowLeft size={iconSize} className={cls} aria-hidden="true" />;
      case 'check':
        return <Check size={iconSize} className={cls} aria-hidden="true" />;
      case 'copy':
        return <Copy size={iconSize} className={cls} aria-hidden="true" />;
      case 'close':
        return <X size={iconSize} className={cls} aria-hidden="true" />;
      case 'menu':
        return <Menu size={iconSize} className={cls} aria-hidden="true" />;
      case 'undo':
        return <Undo2 size={iconSize} className={cls} aria-hidden="true" />;
      case 'redo':
        return <Redo2 size={iconSize} className={cls} aria-hidden="true" />;
      case 'trash':
        return <Trash2 size={iconSize} className={cls} aria-hidden="true" />;
      case 'palette':
        return <Palette size={iconSize} className={cls} aria-hidden="true" />;
      case 'sliders':
        return <Sliders size={iconSize} className={cls} aria-hidden="true" />;
      case 'image-add':
        return <Upload size={iconSize} className={cls} aria-hidden="true" />;
      case 'safe-zone':
      case 'layers':
      default:
        return <Layers size={iconSize} className={cls} aria-hidden="true" />;
    }
  };

  return (
    <span
      className={`sq-duotone-icon interactive-icon-host ${sizeClasses} ${variantClass} shrink-0 cursor-pointer ${className}`}
      title={title}
      onClick={onClick}
    >
      {renderIconContent()}
    </span>
  );
};
