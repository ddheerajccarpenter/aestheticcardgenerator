import React from 'react';

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

  const svgSize = size === 'sm' ? 16 : size === 'lg' ? 22 : 18;

  const renderIconContent = () => {
    if (boxicon) {
      return (
        <i className={`bx ${boxicon} text-[18px] text-[var(--icon-duotone-primary)] leading-none`} />
      );
    }

    switch (name) {
      case 'logo':
        return (
          <svg width={svgSize} height={svgSize} viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="7" height="7" rx="1.5" className="bx-duotone-primary" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" className="bx-duotone-secondary" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" className="bx-duotone-secondary" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" className="bx-duotone-primary" />
          </svg>
        );
      case 'search':
        return (
          <svg width={svgSize} height={svgSize} viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" className="bx-duotone-secondary" />
            <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="2.2" className="bx-duotone-primary" />
            <path d="M16 16L21 21" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="bx-duotone-primary" />
          </svg>
        );
      case 'book':
        return (
          <svg width={svgSize} height={svgSize} viewBox="0 0 24 24" fill="none">
            <path d="M4 19.5V6.5C4 5.12 5.12 4 6.5 4H12V20H6.5C5.12 20 4 19.5 4 19.5Z" className="bx-duotone-secondary" />
            <path d="M20 19.5V6.5C20 5.12 18.88 4 17.5 4H12V20H17.5C18.88 20 20 19.5 20 19.5Z" className="bx-duotone-secondary" />
            <path d="M12 4V20M4 19.5C4 18.12 5.12 17 6.5 17H20M4 6.5C4 5.12 5.12 4 6.5 4H17.5C18.88 4 20 5.12 20 6.5V19.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="bx-duotone-primary" />
          </svg>
        );
      case 'moon':
        return (
          <svg width={svgSize} height={svgSize} viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" className="bx-duotone-secondary" />
            <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" stroke="currentColor" strokeWidth="2.2" fill="currentColor" strokeLinecap="round" strokeLinejoin="round" className="bx-duotone-primary" />
          </svg>
        );
      case 'sun':
        return (
          <svg width={svgSize} height={svgSize} viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="5" className="bx-duotone-secondary" />
            <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2.2" className="bx-duotone-primary" />
            <path d="M12 2V4M12 20V22M4 12H2M22 12H20M19.07 4.93L17.66 6.34M6.34 17.66L4.93 19.07M19.07 19.07L17.66 17.66M6.34 6.34L4.93 4.93" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="bx-duotone-primary" />
          </svg>
        );
      case 'compare':
        return (
          <svg width={svgSize} height={svgSize} viewBox="0 0 24 24" fill="none">
            <rect x="3" y="4" width="7.5" height="16" rx="2" className="bx-duotone-secondary" />
            <rect x="13.5" y="4" width="7.5" height="16" rx="2" className="bx-duotone-secondary" />
            <rect x="3" y="4" width="7.5" height="16" rx="2" stroke="currentColor" strokeWidth="2" className="bx-duotone-primary" />
            <rect x="13.5" y="4" width="7.5" height="16" rx="2" stroke="currentColor" strokeWidth="2" className="bx-duotone-primary" />
          </svg>
        );
      case 'ambient':
        return (
          <svg width={svgSize} height={svgSize} viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" className="bx-duotone-secondary" />
            <path d="M12 3V21A9 9 0 0 0 12 3Z" fill="currentColor" className="bx-duotone-primary" />
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" className="bx-duotone-primary" />
          </svg>
        );
      case 'cube':
        return (
          <svg width={svgSize} height={svgSize} viewBox="0 0 24 24" fill="none">
            <path d="M12 2L3 7L12 12L21 7L12 2Z" className="bx-duotone-secondary" />
            <path d="M3 7V17L12 22V12L3 7Z" className="bx-duotone-secondary" />
            <path d="M21 7V17L12 22V12L21 7Z" className="bx-duotone-secondary" />
            <path d="M12 2L3 7L12 12L21 7L12 2ZM3 7V17L12 22M21 7V17L12 22M12 12V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="bx-duotone-primary" />
          </svg>
        );
      case 'download':
        return (
          <svg width={svgSize} height={svgSize} viewBox="0 0 24 24" fill="none">
            <path d="M4 17V19C4 20.1 4.9 21 6 21H18C19.1 21 20 20.1 20 19V17" className="bx-duotone-secondary" />
            <path d="M12 3V15M12 15L7 10M12 15L17 10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="bx-duotone-primary" />
            <path d="M4 17V19C4 20.1 4.9 21 6 21H18C19.1 21 20 20.1 20 19V17" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="bx-duotone-primary" />
          </svg>
        );
      case 'font':
        return (
          <svg width={svgSize} height={svgSize} viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="18" height="18" rx="3" className="bx-duotone-secondary" />
            <path d="M7 19L12 5L17 19M8.8 14H15.2" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="bx-duotone-primary" />
          </svg>
        );
      case 'eraser':
        return (
          <svg width={svgSize} height={svgSize} viewBox="0 0 24 24" fill="none">
            <path d="M19 14L10 5L3 12L12 21H21" className="bx-duotone-secondary" />
            <path d="M19 14L10 5L3 12L12 21H21M12 21L19 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="bx-duotone-primary" />
          </svg>
        );
      case 'grid':
        return (
          <svg width={svgSize} height={svgSize} viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="18" height="18" rx="2" className="bx-duotone-secondary" />
            <path d="M3 9H21M3 15H21M9 3V21M15 3V21" stroke="currentColor" strokeWidth="1.8" className="bx-duotone-primary" />
          </svg>
        );
      case 'arrow-right':
        return (
          <svg width={svgSize} height={svgSize} viewBox="0 0 24 24" fill="none">
            <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="bx-duotone-primary" />
          </svg>
        );
      case 'arrow-left':
        return (
          <svg width={svgSize} height={svgSize} viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M5 12L11 6M5 12L11 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="bx-duotone-primary" />
          </svg>
        );
      case 'check':
        return (
          <svg width={svgSize} height={svgSize} viewBox="0 0 24 24" fill="none">
            <path d="M5 13L9.5 17.5L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="bx-duotone-primary" />
          </svg>
        );
      case 'copy':
        return (
          <svg width={svgSize} height={svgSize} viewBox="0 0 24 24" fill="none">
            <rect x="8" y="8" width="12" height="12" rx="2" className="bx-duotone-secondary" />
            <rect x="8" y="8" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="2" className="bx-duotone-primary" />
            <path d="M16 8V5C16 4.45 15.55 4 15 4H5C4.45 4 4 4.45 4 5V15C4 15.55 4.45 16 5 16H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="bx-duotone-primary" />
          </svg>
        );
      case 'close':
        return (
          <svg width={svgSize} height={svgSize} viewBox="0 0 24 24" fill="none">
            <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="bx-duotone-primary" />
          </svg>
        );
      case 'menu':
        return (
          <svg width={svgSize} height={svgSize} viewBox="0 0 24 24" fill="none">
            <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="bx-duotone-primary" />
          </svg>
        );
      case 'undo':
        return (
          <svg width={svgSize} height={svgSize} viewBox="0 0 24 24" fill="none">
            <path d="M3 10H14C17.3 10 20 12.7 20 16C20 19.3 17.3 22 14 22H6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="bx-duotone-primary" />
            <path d="M7 6L3 10L7 14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="bx-duotone-primary" />
          </svg>
        );
      case 'redo':
        return (
          <svg width={svgSize} height={svgSize} viewBox="0 0 24 24" fill="none">
            <path d="M21 10H10C6.7 10 4 12.7 4 16C4 19.3 6.7 22 10 22H18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="bx-duotone-primary" />
            <path d="M17 6L21 10L17 14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="bx-duotone-primary" />
          </svg>
        );
      case 'safe-zone':
        return (
          <svg width={svgSize} height={svgSize} viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" className="bx-duotone-primary" />
            <rect x="6" y="6" width="12" height="12" rx="1.5" className="bx-duotone-secondary" />
            <rect x="6" y="6" width="12" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.8" className="bx-duotone-primary" />
          </svg>
        );
      default:
        return (
          <i className="bx bxs-circle text-[16px] text-[var(--icon-duotone-primary)]" />
        );
    }
  };

  return (
    <span
      className={`sq-duotone-icon ${sizeClasses} ${variantClass} shrink-0 cursor-pointer ${className}`}
      title={title}
      onClick={onClick}
    >
      {renderIconContent()}
    </span>
  );
};
