import React from 'react';
import {
  faCircleHalfStroke,
  faCodeCompare,
  faEraser,
} from '@fortawesome/free-solid-svg-icons';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Box,
  Check,
  Copy,
  Download,
  FaIcon,
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
} from './faIcons';

export {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Box,
  Check,
  Copy,
  Download,
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
};

export const EraserFallback: React.FC<{
  kind: 'compare' | 'ambient' | 'eraser';
  size: number;
  className?: string;
}> = ({ kind, size, className }) => {
  const icon =
    kind === 'compare'
      ? faCodeCompare
      : kind === 'ambient'
        ? faCircleHalfStroke
        : faEraser;
  return <FaIcon icon={icon} motion="pop" size={size} className={className} aria-hidden="true" />;
};
