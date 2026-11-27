import React from 'react';
import {
  type IconDefinition,
  faAlignCenter,
  faAlignLeft,
  faAlignRight,
  faArrowLeft,
  faArrowRight,
  faArrowUp,
  faArrowsRotate,
  faArrowsUpDown,
  faAward,
  faBarcode,
  faBars,
  faBold,
  faBook,
  faBookOpen,
  faBorderAll,
  faCalendar,
  faCheck,
  faChevronDown,
  faChevronLeft,
  faChevronRight,
  faCircle,
  faCircleCheck,
  faCircleExclamation,
  faCircleInfo,
  faCircleQuestion,
  faClock,
  faCloud,
  faCompass,
  faCookieBite,
  faCopy,
  faCropSimple,
  faCube,
  faDownLong,
  faDownload,
  faEllipsis,
  faEnvelope,
  faEye,
  faEyeDropper,
  faEyeSlash,
  faFaceSmile,
  faFileCirclePlus,
  faFileCircleQuestion,
  faFileLines,
  faFloppyDisk,
  faFolder,
  faFolderOpen,
  faFont,
  faHeart,
  faHighlighter,
  faImage,
  faItalic,
  faLayerGroup,
  faLock,
  faMagnifyingGlass,
  faMagnifyingGlassMinus,
  faMagnifyingGlassPlus,
  faMaximize,
  faMinimize,
  faMinus,
  faMoon,
  faMusic,
  faNewspaper,
  faPalette,
  faPause,
  faPenNib,
  faPenToSquare,
  faPlay,
  faPlus,
  faQrcode,
  faRotateLeft,
  faRotateRight,
  faShareNodes,
  faShuffle,
  faSliders,
  faSpinner,
  faSquare,
  faStamp,
  faStar,
  faSun,
  faTableCells,
  faTableCellsLarge,
  faTrashCan,
  faTriangleExclamation,
  faUnlock,
  faUpLong,
  faUpload,
  faVolumeHigh,
  faWandMagic,
  faWandMagicSparkles,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';

/** Semantic motion presets modeled after Remocn's action-matched icon kinematics. */
export type FaMotionKind =
  | 'none'
  | 'nudge-right'
  | 'nudge-left'
  | 'nudge-up'
  | 'nudge-down'
  | 'download'
  | 'upload'
  | 'search'
  | 'sun'
  | 'moon'
  | 'plus'
  | 'check'
  | 'copy'
  | 'trash'
  | 'spin-cw'
  | 'spin-ccw'
  | 'layers'
  | 'compass'
  | 'book'
  | 'menu'
  | 'tilt'
  | 'gleam'
  | 'pop'
  | 'spin';

export interface FaIconProps extends Omit<React.SVGProps<SVGSVGElement>, 'children'> {
  icon: IconDefinition;
  motion?: FaMotionKind;
  size?: number | string;
  strokeWidth?: number | string;
}

export const FaIcon: React.FC<FaIconProps> = ({
  icon,
  motion = 'pop',
  size,
  className = '',
  style,
  strokeWidth: _ignoredStroke,
  ...svgProps
}) => {
  const [width, height, , , svgPathData] = icon.icon;
  const resolvedStyle = size
    ? { width: size, height: size, ...style }
    : style;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${width} ${height}`}
      fill="currentColor"
      data-fa-motion={motion}
      className={`fa-solid-icon inline-block shrink-0 ${className}`.trim()}
      style={resolvedStyle}
      {...svgProps}
    >
      {typeof svgPathData === 'string' ? (
        <path d={svgPathData} />
      ) : (
        svgPathData.map((d, idx) => <path key={idx} d={d} />)
      )}
    </svg>
  );
};

export type FaNamedIconProps = Omit<FaIconProps, 'icon'>;

function defineFaIcon(
  icon: IconDefinition,
  defaultMotion: FaMotionKind,
  displayName: string
): React.FC<FaNamedIconProps> {
  const IconComponent: React.FC<FaNamedIconProps> = ({
    motion = defaultMotion,
    ...props
  }) => <FaIcon icon={icon} motion={motion} {...props} />;
  IconComponent.displayName = displayName;
  return IconComponent;
}

export const AlertCircle = defineFaIcon(faCircleExclamation, 'pop', 'AlertCircle');
export const AlertTriangle = defineFaIcon(faTriangleExclamation, 'pop', 'AlertTriangle');
export const AlignCenter = defineFaIcon(faAlignCenter, 'pop', 'AlignCenter');
export const AlignLeft = defineFaIcon(faAlignLeft, 'pop', 'AlignLeft');
export const AlignRight = defineFaIcon(faAlignRight, 'pop', 'AlignRight');
export const AlignVerticalJustifyStart = defineFaIcon(faUpLong, 'nudge-up', 'AlignVerticalJustifyStart');
export const AlignVerticalJustifyCenter = defineFaIcon(faArrowsUpDown, 'pop', 'AlignVerticalJustifyCenter');
export const AlignVerticalJustifyEnd = defineFaIcon(faDownLong, 'nudge-down', 'AlignVerticalJustifyEnd');
export const ArrowLeft = defineFaIcon(faArrowLeft, 'nudge-left', 'ArrowLeft');
export const ArrowRight = defineFaIcon(faArrowRight, 'nudge-right', 'ArrowRight');
export const ArrowUp = defineFaIcon(faArrowUp, 'nudge-up', 'ArrowUp');
export const Award = defineFaIcon(faAward, 'gleam', 'Award');
export const Barcode = defineFaIcon(faBarcode, 'pop', 'Barcode');
export const Bold = defineFaIcon(faBold, 'pop', 'Bold');
export const Book = defineFaIcon(faBook, 'book', 'Book');
export const BookOpen = defineFaIcon(faBookOpen, 'book', 'BookOpen');
export const Box = defineFaIcon(faCube, 'pop', 'Box');
export const Calendar = defineFaIcon(faCalendar, 'pop', 'Calendar');
export const Check = defineFaIcon(faCheck, 'check', 'Check');
export const CheckCircle2 = defineFaIcon(faCircleCheck, 'check', 'CheckCircle2');
export const ChevronDown = defineFaIcon(faChevronDown, 'nudge-down', 'ChevronDown');
export const ChevronLeft = defineFaIcon(faChevronLeft, 'nudge-left', 'ChevronLeft');
export const ChevronRight = defineFaIcon(faChevronRight, 'nudge-right', 'ChevronRight');
export const Circle = defineFaIcon(faCircle, 'pop', 'Circle');
export const Clock = defineFaIcon(faClock, 'pop', 'Clock');
export const Cloud = defineFaIcon(faCloud, 'layers', 'Cloud');
export const Compass = defineFaIcon(faCompass, 'compass', 'Compass');
export const Cookie = defineFaIcon(faCookieBite, 'pop', 'Cookie');
export const Copy = defineFaIcon(faCopy, 'copy', 'Copy');
export const Crop = defineFaIcon(faCropSimple, 'pop', 'Crop');
export const Download = defineFaIcon(faDownload, 'download', 'Download');
export const Edit3 = defineFaIcon(faPenToSquare, 'tilt', 'Edit3');
export const Eye = defineFaIcon(faEye, 'pop', 'Eye');
export const EyeOff = defineFaIcon(faEyeSlash, 'pop', 'EyeOff');
export const FilePlus = defineFaIcon(faFileCirclePlus, 'pop', 'FilePlus');
export const FileQuestion = defineFaIcon(faFileCircleQuestion, 'pop', 'FileQuestion');
export const FileText = defineFaIcon(faFileLines, 'pop', 'FileText');
export const Folder = defineFaIcon(faFolder, 'pop', 'Folder');
export const FolderOpen = defineFaIcon(faFolderOpen, 'pop', 'FolderOpen');
export const Grid = defineFaIcon(faBorderAll, 'pop', 'Grid');
export const Grid3X3 = defineFaIcon(faTableCells, 'pop', 'Grid3X3');
export const Heart = defineFaIcon(faHeart, 'pop', 'Heart');
export const HelpCircle = defineFaIcon(faCircleQuestion, 'pop', 'HelpCircle');
export const Highlighter = defineFaIcon(faHighlighter, 'tilt', 'Highlighter');
export const Image = defineFaIcon(faImage, 'pop', 'Image');
export const Info = defineFaIcon(faCircleInfo, 'pop', 'Info');
export const Italic = defineFaIcon(faItalic, 'pop', 'Italic');
export const Layers = defineFaIcon(faLayerGroup, 'layers', 'Layers');
export const LayoutTemplate = defineFaIcon(faTableCellsLarge, 'pop', 'LayoutTemplate');
export const Loader2 = defineFaIcon(faSpinner, 'spin', 'Loader2');
export const Lock = defineFaIcon(faLock, 'pop', 'Lock');
export const Mail = defineFaIcon(faEnvelope, 'pop', 'Mail');
export const Maximize2 = defineFaIcon(faMaximize, 'pop', 'Maximize2');
export const Menu = defineFaIcon(faBars, 'menu', 'Menu');
export const Minimize2 = defineFaIcon(faMinimize, 'pop', 'Minimize2');
export const Minus = defineFaIcon(faMinus, 'pop', 'Minus');
export const Moon = defineFaIcon(faMoon, 'moon', 'Moon');
export const MoreHorizontal = defineFaIcon(faEllipsis, 'pop', 'MoreHorizontal');
export const Music = defineFaIcon(faMusic, 'tilt', 'Music');
export const Newspaper = defineFaIcon(faNewspaper, 'pop', 'Newspaper');
export const Palette = defineFaIcon(faPalette, 'tilt', 'Palette');
export const Pause = defineFaIcon(faPause, 'pop', 'Pause');
export const PenTool = defineFaIcon(faPenNib, 'tilt', 'PenTool');
export const Pipette = defineFaIcon(faEyeDropper, 'tilt', 'Pipette');
export const Play = defineFaIcon(faPlay, 'pop', 'Play');
export const Plus = defineFaIcon(faPlus, 'plus', 'Plus');
export const QrCode = defineFaIcon(faQrcode, 'pop', 'QrCode');
export const Redo2 = defineFaIcon(faRotateRight, 'spin-cw', 'Redo2');
export const RefreshCw = defineFaIcon(faArrowsRotate, 'spin-cw', 'RefreshCw');
export const RotateCcw = defineFaIcon(faRotateLeft, 'spin-ccw', 'RotateCcw');
export const Save = defineFaIcon(faFloppyDisk, 'pop', 'Save');
export const Search = defineFaIcon(faMagnifyingGlass, 'search', 'Search');
export const Share2 = defineFaIcon(faShareNodes, 'pop', 'Share2');
export const Shuffle = defineFaIcon(faShuffle, 'spin-cw', 'Shuffle');
export const Sliders = defineFaIcon(faSliders, 'pop', 'Sliders');
export const Smile = defineFaIcon(faFaceSmile, 'pop', 'Smile');
export const Sparkles = defineFaIcon(faWandMagicSparkles, 'gleam', 'Sparkles');
export const Square = defineFaIcon(faSquare, 'pop', 'Square');
export const Stamp = defineFaIcon(faStamp, 'download', 'Stamp');
export const Star = defineFaIcon(faStar, 'gleam', 'Star');
export const Sun = defineFaIcon(faSun, 'sun', 'Sun');
export const Trash2 = defineFaIcon(faTrashCan, 'trash', 'Trash2');
export const Type = defineFaIcon(faFont, 'pop', 'Type');
export const Undo2 = defineFaIcon(faRotateLeft, 'spin-ccw', 'Undo2');
export const Unlock = defineFaIcon(faUnlock, 'pop', 'Unlock');
export const Upload = defineFaIcon(faUpload, 'upload', 'Upload');
export const Volume2 = defineFaIcon(faVolumeHigh, 'pop', 'Volume2');
export const Wand2 = defineFaIcon(faWandMagic, 'tilt', 'Wand2');
export const X = defineFaIcon(faXmark, 'plus', 'X');
export const ZoomIn = defineFaIcon(faMagnifyingGlassPlus, 'pop', 'ZoomIn');
export const ZoomOut = defineFaIcon(faMagnifyingGlassMinus, 'pop', 'ZoomOut');
