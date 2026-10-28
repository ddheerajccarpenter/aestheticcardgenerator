import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type {
  CanvasDocument,
  CanvasObject,
  TextCanvasObject,
  CardTemplate,
} from '../types/card';
import { PRESET_TEMPLATES } from '../data/templates';
import { ASSET_AVATARS, ASSET_STICKERS } from '../data/canvasAssets';
import {
  createBlankCanvas,
  createTextObject,
  createImageObject,
  createShapeObject,
  createObjectId,
  templateToCanvasDoc,
  CANVAS_DIMENSION_PRESETS,
  DEFAULT_CANVAS_FONT_FAMILY,
  resolveCanvasFontFamily,
} from '../utils/canvasBuilder';
import { updatePageSEO } from '../utils/seo';
import { toPng, toJpeg, toBlob } from 'html-to-image';
import {
  Type,
  Image as ImageIcon,
  Square,
  Circle,
  Star,
  Heart,
  Minus,
  Sparkles,
  Layers,
  Sliders,
  Undo2,
  Redo2,
  Download,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  ZoomIn,
  ZoomOut,
  ArrowLeft,
  Check,
  Grid,
  Upload,
  ChevronDown,
  LayoutTemplate,
  FilePlus,
  QrCode,
  Barcode,
  Award,
  BookOpen,
  Volume2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  Crop,
  Wand2,
  Sun,
  Moon,
  Box,
  Folder,
  FolderOpen,
  RefreshCw,
  Search,
  X,
  Maximize2,
} from 'lucide-react';
import { processImageFilter } from '../utils/imageFilters';
import { generateQrCodeSvg, generateBarcodeSvg } from '../utils/qrBarcodeGenerator';
import { MediaImportModal, type MediaResult } from '../components/MediaImportModal';
import { removeLayerBackgroundOffline } from '../engines/canvasPhotoOperations';
import {
  autoAlignLayersInGrid,
  normalizeTemplateDimensions,
} from '../engines/canvasGridAndDimensionEngine';
import {
  updateWorkspaceAmbientBackdrop,
} from '../engines/ambientStageEngine';
import { createThreeCardPreviewScene } from '../engines/threeCardStage';
import {
  getBrandedExportFilename,
  exportThreeDimensionalCardPNG,
  triggerBrandedBlobDownload,
} from '../engines/brandedExportAndThreePng';
import type { ImageFilterPreset, ImageClipMask } from '../types/card';

interface CanvasEditorViewProps {
  theme?: 'dark' | 'light';
  onNavigateHome?: () => void;
  onEditingSheetChange?: (isOpen: boolean) => void;
  onToggleTheme?: () => void;
}

const STORAGE_KEY = 'aesthetic_canvas_editor_draft_v2';
const LEGACY_STORAGE_KEY = 'aesthetic_canvas_editor_draft_v1';
const MAX_HISTORY = 40;

const getCanvasDefaultTextColor = (background?: string, muted = false): string => {
  if (!background) return muted ? '#756d62' : '#24211b';

  const hex = background.match(/^#([\da-f]{3}|[\da-f]{6})$/i)?.[1];
  if (!hex) return muted ? '#756d62' : '#24211b';

  const normalized = hex.length === 3
    ? hex.split('').map((part) => `${part}${part}`).join('')
    : hex;
  const channels = [0, 2, 4].map((offset) => parseInt(normalized.slice(offset, offset + 2), 16) / 255);
  const [r, g, b] = channels.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  );
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  if (luminance > 0.45) return muted ? '#756d62' : '#24211b';
  return muted ? '#bcb5aa' : '#f4ede4';
};

const isDocumentCollapsed = (d: CanvasDocument): boolean => {
  if (!d || !d.objects || d.objects.length === 0) return false;
  const nonBg = d.objects.filter(
    (o) =>
      !(o.width >= d.canvasWidth * 0.85 && o.height >= d.canvasHeight * 0.85) &&
      !/paper|card base|card outline|parchment|background frame/i.test(o.name)
  );
  if (nonBg.length === 0) return false;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const o of nonBg) {
    minX = Math.min(minX, o.x);
    minY = Math.min(minY, o.y);
    maxX = Math.max(maxX, o.x + o.width);
    maxY = Math.max(maxY, o.y + o.height);
  }
  const spanW = maxX - minX;
  const spanH = maxY - minY;
  return spanW < d.canvasWidth * 0.35 || spanH < d.canvasHeight * 0.35;
};

export const CanvasEditorView: React.FC<CanvasEditorViewProps> = ({
  theme = 'dark',
  onNavigateHome,
  onEditingSheetChange,
  onToggleTheme,
}) => {
  const [mobileAddSheetOpen, setMobileAddSheetOpen] = useState(false);
  const [mobileInspectorOpen, setMobileInspectorOpen] = useState(false);
  const addMenuRef = useRef<HTMLDetailsElement>(null);
  const isLight = theme === 'light';

  // ───────────────────────────────────────────────────────────────────────────
  // STATE & DOCUMENT MODEL
  // ───────────────────────────────────────────────────────────────────────────

  // Initialize document from URL param (?template= or ?blank=true) or localStorage draft
  const [doc, setDoc] = useState<CanvasDocument>(() => {
    const params = new URLSearchParams(window.location.search);
    const tmplId = params.get('template');
    const isBlank = params.get('blank') === 'true';

    if (tmplId) {
      const found = PRESET_TEMPLATES.find((t) => t.id === tmplId);
      if (found) {
        return templateToCanvasDoc(found);
      }
    }

    if (isBlank) {
      return createBlankCanvas();
    }

    if (!isBlank) {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && Array.isArray(parsed.objects) && parsed.objects.length > 0) {
            // Check if draft was collapsed by the previous dimension compounding bug
            if (isDocumentCollapsed(parsed)) {
              // Try to find the original template and restore it cleanly
              const matchedTemplate = PRESET_TEMPLATES.find(
                (t) =>
                  t.title.toLowerCase().trim() === parsed.title?.toLowerCase().trim() ||
                  t.id === parsed.id
              );
              if (matchedTemplate) {
                return templateToCanvasDoc(matchedTemplate);
              }
              // Keep custom compositions intact. The collapse heuristic is only safe
              // when we can restore a known template with its original geometry.
              return parsed;
            }
            return parsed;
          }
        } catch {
          // ignore corrupted draft
        }
      }
    }

    // Default to the first preset template or blank
    const defaultTmpl = PRESET_TEMPLATES[0];
    return defaultTmpl ? templateToCanvasDoc(defaultTmpl) : createBlankCanvas();
  });

  // Selection
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Undo / Redo history
  const [history, setHistory] = useState<CanvasDocument[]>([doc]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Viewport / Zoom & Stage Toggles
  const [zoom, setZoom] = useState<number>(1);
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [ambientModeEnabled, setAmbientModeEnabled] = useState<boolean>(false);
  const [is3DMode, setIs3DMode] = useState<boolean>(false);
  const [activeSidebarTab, setActiveSidebarTab] = useState<'inspector' | 'layers' | 'recycle' | 'templates'>('inspector');
  const [layerViewMode, setLayerViewMode] = useState<'folders' | 'flat'>('folders');
  const [folderOpen, setFolderOpen] = useState({
    photo: true,
    text: true,
    accents: true,
    frame: true,
  });

  // Natural-Language Quick Command Bar State (Leftover Item 5)
  const [quickCommandText, setQuickCommandText] = useState('');
  const [quickCommandOpen, setQuickCommandOpen] = useState(false);

  // Saved Clips & Recycle Drawer (Leftover Item 6)
  const [savedClips, setSavedClips] = useState<CanvasObject[]>(() => {
    try {
      const stored = localStorage.getItem('aesthetic_recycled_clips');
      if (stored) return JSON.parse(stored);
    } catch {
      // Fallback
    }
    return [
      {
        id: 'clip-star-seal',
        name: '★ Holographic Pass Seal',
        type: 'shape',
        shapeType: 'star',
        x: 40,
        y: 40,
        width: 64,
        height: 64,
        rotation: 0,
        opacity: 0.9,
        fill: '#fcd535',
        stroke: '#000000',
        strokeWidth: 2,
        borderRadius: 0,
        zIndex: 20,
        locked: false,
        visible: true,
      },
      {
        id: 'clip-barcode',
        name: 'Verified 90s Barcode Strip',
        type: 'image',
        src: generateBarcodeSvg('VERIFIED-ACCESS-2026', { fill: '#ffffff' }),
        x: 40,
        y: 40,
        width: 220,
        height: 48,
        naturalWidth: 220,
        naturalHeight: 48,
        rotation: 0,
        opacity: 0.85,
        objectFit: 'contain',
        borderRadius: 4,
        zIndex: 21,
        locked: false,
        visible: true,
      },
    ];
  });

  // Modals & Drawers
  const [templateDrawerOpen, setTemplateDrawerOpen] = useState(false);

  useEffect(() => {
    onEditingSheetChange?.(mobileAddSheetOpen || mobileInspectorOpen || templateDrawerOpen);
  }, [mobileAddSheetOpen, mobileInspectorOpen, templateDrawerOpen, onEditingSheetChange]);

  // BUG 8 FIX: Run zoomToFitViewport unconditionally on all devices and window resize
  const handleFitToScreen = useCallback(() => {
    if (!canvasContainerRef.current) return;
    const container = canvasContainerRef.current;
    const paddingX = window.innerWidth < 640 ? 20 : 64;
    const paddingY = window.innerWidth < 640 ? 36 : 64;
    const availableWidth = container.clientWidth - paddingX;
    const availableHeight = container.clientHeight - paddingY;
    if (availableWidth <= 0 || availableHeight <= 0) return;

    const scaleX = availableWidth / doc.canvasWidth;
    const scaleY = availableHeight / doc.canvasHeight;
    const fitScale = Math.min(scaleX, scaleY, 1.0);
    setZoom(Number(Math.max(0.18, fitScale).toFixed(2)));
  }, [doc.canvasWidth, doc.canvasHeight]);

  useEffect(() => {
    const timer = setTimeout(handleFitToScreen, 120);
    window.addEventListener('resize', handleFitToScreen);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleFitToScreen);
    };
  }, [doc.canvasWidth, doc.canvasHeight, handleFitToScreen]);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Template Picker Search & Filter State
  const [templateSearchQuery, setTemplateSearchQuery] = useState('');
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState<
    'all' | 'pinterest' | 'id-card' | 'poster' | 'vintage' | 'minimal'
  >('all');

  // Filtered Templates for Template Library Modal
  const isPinterestTemplate = useCallback((tmpl: CardTemplate) => {
    return Boolean(
      tmpl.tags?.includes('pinterest') ||
      tmpl.id.includes('pinterest') ||
      tmpl.tag?.toLowerCase().includes('pinterest') ||
      tmpl.categoryLabel?.toLowerCase().includes('pinterest')
    );
  }, []);

  const templateCategoryCounts = useMemo(() => {
    let pinterest = 0;
    let idCard = 0;
    let poster = 0;
    let vintage = 0;
    let minimal = 0;

    for (const tmpl of PRESET_TEMPLATES) {
      if (isPinterestTemplate(tmpl)) pinterest++;
      if (tmpl.category === 'id-card' || tmpl.tags?.includes('id-card') || tmpl.tags?.includes('badge') || tmpl.tags?.includes('passport')) idCard++;
      if (tmpl.category === 'poster' || tmpl.tags?.includes('poster')) poster++;
      if (tmpl.category === 'vintage' || tmpl.theme.category === 'vintage' || tmpl.tags?.includes('vintage') || tmpl.tags?.includes('retro')) vintage++;
      if (tmpl.theme.category === 'minimal' || tmpl.tags?.includes('minimal') || tmpl.tags?.includes('modern')) minimal++;
    }

    return { all: PRESET_TEMPLATES.length, pinterest, idCard, poster, vintage, minimal };
  }, [isPinterestTemplate]);

  const filteredTemplates = useMemo(() => {
    return PRESET_TEMPLATES.filter((tmpl) => {
      if (templateCategoryFilter === 'pinterest' && !isPinterestTemplate(tmpl)) return false;
      if (templateCategoryFilter === 'id-card') {
        const isId = tmpl.category === 'id-card' || tmpl.tags?.includes('id-card') || tmpl.tags?.includes('badge') || tmpl.tags?.includes('passport');
        if (!isId) return false;
      }
      if (templateCategoryFilter === 'poster') {
        const isPoster = tmpl.category === 'poster' || tmpl.tags?.includes('poster');
        if (!isPoster) return false;
      }
      if (templateCategoryFilter === 'vintage') {
        const isVintage = tmpl.category === 'vintage' || tmpl.theme.category === 'vintage' || tmpl.tags?.includes('vintage') || tmpl.tags?.includes('retro');
        if (!isVintage) return false;
      }
      if (templateCategoryFilter === 'minimal') {
        const isMinimal = tmpl.theme.category === 'minimal' || tmpl.tags?.includes('minimal') || tmpl.tags?.includes('modern');
        if (!isMinimal) return false;
      }

      if (templateSearchQuery.trim()) {
        const q = templateSearchQuery.toLowerCase().trim();
        const matchTitle = tmpl.title.toLowerCase().includes(q);
        const matchTag = tmpl.tag.toLowerCase().includes(q);
        const matchBadge = tmpl.badge.toLowerCase().includes(q);
        const matchCategory = tmpl.categoryLabel.toLowerCase().includes(q);
        const matchQuote = tmpl.quote?.toLowerCase().includes(q);
        const matchTags = tmpl.tags?.some((t) => t.toLowerCase().includes(q));
        const matchDesc = tmpl.description?.toLowerCase().includes(q);
        if (!matchTitle && !matchTag && !matchBadge && !matchCategory && !matchQuote && !matchTags && !matchDesc) {
          return false;
        }
      }

      return true;
    });
  }, [templateCategoryFilter, templateSearchQuery, isPinterestTemplate]);

  // Direct Inline Text Editing state (Canva-style)
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const pendingReplaceLayerIdRef = useRef<string | null>(null);

  // Synchronous document ref to eradicate stale closures and coordinate drift during drag
  const docRef = useRef<CanvasDocument>(doc);
  useEffect(() => {
    docRef.current = doc;
  }, [doc]);

  // Snap guides overlay state
  const [snapGuides, setSnapGuides] = useState<Array<{ orientation: 'x' | 'y'; pos: number }>>([]);

  // Stamps & Accents drawer state
  const [stampsDrawerOpen, setStampsDrawerOpen] = useState(false);

  // Book & Music import modal
  const [mediaModalOpen, setMediaModalOpen] = useState(false);

  // References
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const canvasElementRef = useRef<HTMLDivElement>(null);
  const threeMountRef = useRef<HTMLDivElement>(null);
  const threeCleanupRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);

  // Mandatory separation: the canvas workspace background NEVER changes with the artwork palette.
  // It remains strictly pinned to the application UI color tokens (--app-bg / #101114).
  useEffect(() => {
    updateWorkspaceAmbientBackdrop(
      canvasContainerRef.current,
      ambientModeEnabled,
      isLight
    );
  }, [ambientModeEnabled, isLight]);

  // Sync 3D physical card stage (Three.js) with debouncing and in-place texture reuse
  useEffect(() => {
    if (!is3DMode || !threeMountRef.current || !canvasElementRef.current) {
      if (threeCleanupRef.current) {
        threeCleanupRef.current();
        threeCleanupRef.current = null;
      }
      return;
    }

    let isMounted = true;
    const timer = setTimeout(async () => {
      try {
        if (!canvasElementRef.current) return;
        const rawDataUrl = await toPng(canvasElementRef.current, { pixelRatio: 1.5, skipFonts: true });
        if (!isMounted) return;
        const img = new Image();
        img.onload = () => {
          if (!isMounted || !threeMountRef.current) return;
          const offCanvas = document.createElement('canvas');
          offCanvas.width = img.width;
          offCanvas.height = img.height;
          const ctx = offCanvas.getContext('2d');
          if (!ctx) return;
          ctx.drawImage(img, 0, 0);

          if (threeCleanupRef.current && (threeCleanupRef.current as any).updateTexture) {
            (threeCleanupRef.current as any).updateTexture(offCanvas, 'cotton-rag-300gsm');
          } else {
            if (threeCleanupRef.current) threeCleanupRef.current();
            threeCleanupRef.current = createThreeCardPreviewScene(
              threeMountRef.current,
              offCanvas,
              doc.canvasWidth,
              doc.canvasHeight,
              'cotton-rag-300gsm'
            );
          }
        };
        img.src = rawDataUrl;
      } catch (err) {
        console.error('Three.js canvas init error', err);
        if (isMounted) setIs3DMode(false);
      }
    }, 180);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [is3DMode, doc.canvasWidth, doc.canvasHeight, doc.objects, doc.background]);

  useEffect(() => {
    return () => {
      if (threeCleanupRef.current) {
        threeCleanupRef.current();
        threeCleanupRef.current = null;
      }
    };
  }, []);

  // Offline AI Background Removal state
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [bgProgress, setBgProgress] = useState(0);

  // Drag & Transform Tracking state
  const dragRef = useRef<{
    isDragging: boolean;
    isResizing: boolean;
    isRotating: boolean;
    handle: string | null;
    startX: number;
    startY: number;
    startObjX: number;
    startObjY: number;
    startWidth: number;
    startHeight: number;
    startRotation: number;
    centerX: number;
    centerY: number;
  }>({
    isDragging: false,
    isResizing: false,
    isRotating: false,
    handle: null,
    startX: 0,
    startY: 0,
    startObjX: 0,
    startObjY: 0,
    startWidth: 0,
    startHeight: 0,
    startRotation: 0,
    centerX: 0,
    centerY: 0,
  });

  // Selected Object helper
  const selectedObject = useMemo(() => {
    return doc.objects.find((o) => o.id === selectedId) || null;
  }, [doc.objects, selectedId]);

  // Toast notifier
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // SEO
  useEffect(() => {
    updatePageSEO({
      title: 'Freeform Canvas Studio — Design Aesthetic Cards from Scratch',
      description:
        'Full freeform graphic editor for custom aesthetic ID cards, anime travel licenses, scrapbook journals, and badges. Move, resize, layer, and export with zero accounts.',
      canonicalPath: '/canvas',
      ogType: 'website',
    });
  }, []);

  // Persist draft to localStorage (debounced)
  useEffect(() => {
    const timeout = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(doc));
      } catch (err) {
        console.warn('Storage quota exceeded or private mode:', err);
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [doc]);

  // ───────────────────────────────────────────────────────────────────────────
  // HISTORY & STATE MANAGEMENT
  // ───────────────────────────────────────────────────────────────────────────

  const commitDocumentChange = useCallback((newDoc: CanvasDocument) => {
    setDoc(newDoc);
    docRef.current = newDoc;
    setHistory((prev) => {
      const nextHistory = prev.slice(0, historyIndex + 1);
      if (nextHistory.length >= MAX_HISTORY) {
        nextHistory.shift();
      }
      return [...nextHistory, newDoc];
    });
    setHistoryIndex((prev) => Math.min(prev + 1, MAX_HISTORY - 1));
  }, [historyIndex]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const nextIndex = historyIndex - 1;
      setHistoryIndex(nextIndex);
      setDoc(history[nextIndex]);
      docRef.current = history[nextIndex];
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setDoc(history[nextIndex]);
      docRef.current = history[nextIndex];
    }
  }, [history, historyIndex]);

  // ───────────────────────────────────────────────────────────────────────────
  // OBJECT ACTIONS
  // ───────────────────────────────────────────────────────────────────────────

  const updateObject = useCallback(
    (id: string, updates: Partial<CanvasObject>, commit = true) => {
      const currentDoc = docRef.current;
      const nextDoc: CanvasDocument = {
        ...currentDoc,
        updatedAt: new Date().toISOString(),
        objects: currentDoc.objects.map((obj) => {
          if (obj.id === id) {
            return { ...obj, ...updates } as CanvasObject;
          }
          return obj;
        }),
      };
      docRef.current = nextDoc;

      if (commit) {
        commitDocumentChange(nextDoc);
      } else {
        setDoc(nextDoc); // intermediate drag update
      }
    },
    [commitDocumentChange]
  );

  const addObject = useCallback(
    (newObj: CanvasObject) => {
      const currentDoc = docRef.current;
      // Set zIndex to top
      const maxZ = currentDoc.objects.reduce((max, o) => Math.max(max, o.zIndex), 0);
      newObj.zIndex = maxZ + 1;

      const nextDoc: CanvasDocument = {
        ...currentDoc,
        updatedAt: new Date().toISOString(),
        objects: [...currentDoc.objects, newObj],
      };
      commitDocumentChange(nextDoc);
      setSelectedId(newObj.id);
      setActiveSidebarTab('inspector');
    },
    [commitDocumentChange]
  );

  const deleteObject = useCallback(
    (id: string) => {
      const currentDoc = docRef.current;
      const nextDoc: CanvasDocument = {
        ...currentDoc,
        updatedAt: new Date().toISOString(),
        objects: currentDoc.objects.filter((o) => o.id !== id),
      };
      commitDocumentChange(nextDoc);
      if (selectedId === id) setSelectedId(null);
    },
    [selectedId, commitDocumentChange]
  );

  const duplicateObject = useCallback(
    (id: string) => {
      const currentDoc = docRef.current;
      const target = currentDoc.objects.find((o) => o.id === id);
      if (!target) return;

      const maxZ = currentDoc.objects.reduce((max, o) => Math.max(max, o.zIndex), 0);
      const clone: CanvasObject = {
        ...JSON.parse(JSON.stringify(target)),
        id: createObjectId(target.type),
        name: `${target.name} Copy`,
        x: target.x + 24,
        y: target.y + 24,
        zIndex: maxZ + 1,
      };

      const nextDoc: CanvasDocument = {
        ...currentDoc,
        updatedAt: new Date().toISOString(),
        objects: [...currentDoc.objects, clone],
      };
      commitDocumentChange(nextDoc);
      setSelectedId(clone.id);
    },
    [commitDocumentChange]
  );

  // Layer ordering
  const reorderObject = useCallback(
    (id: string, direction: 'front' | 'back' | 'up' | 'down') => {
      const currentDoc = docRef.current;
      const sorted = [...currentDoc.objects].sort((a, b) => a.zIndex - b.zIndex);
      const index = sorted.findIndex((o) => o.id === id);
      if (index === -1) return;

      if (direction === 'up' && index < sorted.length - 1) {
        const temp = sorted[index].zIndex;
        sorted[index].zIndex = sorted[index + 1].zIndex;
        sorted[index + 1].zIndex = temp;
      } else if (direction === 'down' && index > 0) {
        const temp = sorted[index].zIndex;
        sorted[index].zIndex = sorted[index - 1].zIndex;
        sorted[index - 1].zIndex = temp;
      } else if (direction === 'front') {
        const maxZ = sorted.reduce((max, o) => Math.max(max, o.zIndex), 0);
        sorted[index].zIndex = maxZ + 1;
      } else if (direction === 'back') {
        const minZ = sorted.reduce((min, o) => Math.min(min, o.zIndex), 0);
        sorted[index].zIndex = Math.max(0, minZ - 1);
      }

      const nextDoc: CanvasDocument = {
        ...currentDoc,
        updatedAt: new Date().toISOString(),
        objects: sorted,
      };
      commitDocumentChange(nextDoc);
    },
    [commitDocumentChange]
  );

  // ───────────────────────────────────────────────────────────────────────────
  // POINTER COORDINATES & DRAG / RESIZE / ROTATE
  // ───────────────────────────────────────────────────────────────────────────

  const getCanvasCoords = useCallback(
    (e: React.PointerEvent | PointerEvent) => {
      if (!canvasElementRef.current) return { x: 0, y: 0 };
      const rect = canvasElementRef.current.getBoundingClientRect();
      return {
        x: (e.clientX - rect.left) / zoom,
        y: (e.clientY - rect.top) / zoom,
      };
    },
    [zoom]
  );

  const handleObjectPointerDown = (e: React.PointerEvent, obj: CanvasObject) => {
    e.stopPropagation();
    if (obj.locked) {
      setSelectedId(obj.id);
      return;
    }

    setSelectedId(obj.id);
    const coords = getCanvasCoords(e);

    dragRef.current = {
      isDragging: true,
      isResizing: false,
      isRotating: false,
      handle: null,
      startX: coords.x,
      startY: coords.y,
      startObjX: obj.x,
      startObjY: obj.y,
      startWidth: obj.width,
      startHeight: obj.height,
      startRotation: obj.rotation || 0,
      centerX: obj.x + obj.width / 2,
      centerY: obj.y + obj.height / 2,
    };
  };

  const handleResizeHandlePointerDown = (
    e: React.PointerEvent,
    handle: string,
    obj: CanvasObject
  ) => {
    e.stopPropagation();
    if (obj.locked) return;

    const coords = getCanvasCoords(e);
    dragRef.current = {
      isDragging: false,
      isResizing: true,
      isRotating: false,
      handle,
      startX: coords.x,
      startY: coords.y,
      startObjX: obj.x,
      startObjY: obj.y,
      startWidth: obj.width,
      startHeight: obj.height,
      startRotation: obj.rotation || 0,
      centerX: obj.x + obj.width / 2,
      centerY: obj.y + obj.height / 2,
    };
  };

  const handleRotateHandlePointerDown = (e: React.PointerEvent, obj: CanvasObject) => {
    e.stopPropagation();
    if (obj.locked) return;

    const coords = getCanvasCoords(e);
    const centerX = obj.x + obj.width / 2;
    const centerY = obj.y + obj.height / 2;

    dragRef.current = {
      isDragging: false,
      isResizing: false,
      isRotating: true,
      handle: 'rotate',
      startX: coords.x,
      startY: coords.y,
      startObjX: obj.x,
      startObjY: obj.y,
      startWidth: obj.width,
      startHeight: obj.height,
      startRotation: obj.rotation || 0,
      centerX,
      centerY,
    };
  };

  // 6-Button Quick Alignment Handlers
  const handleAlign = (alignment: 'left' | 'hcenter' | 'right' | 'top' | 'vmiddle' | 'bottom') => {
    if (!selectedId || !selectedObject) return;
    const w = selectedObject.width;
    const h = selectedObject.height;

    switch (alignment) {
      case 'left':
        updateObject(selectedId, { x: 0 });
        showToast('Aligned layer left');
        break;
      case 'hcenter':
        updateObject(selectedId, { x: Math.round((doc.canvasWidth - w) / 2) });
        showToast('Centered layer horizontally');
        break;
      case 'right':
        updateObject(selectedId, { x: doc.canvasWidth - w });
        showToast('Aligned layer right');
        break;
      case 'top':
        updateObject(selectedId, { y: 0 });
        showToast('Aligned layer top');
        break;
      case 'vmiddle':
        updateObject(selectedId, { y: Math.round((doc.canvasHeight - h) / 2) });
        showToast('Centered layer vertically');
        break;
      case 'bottom':
        updateObject(selectedId, { y: doc.canvasHeight - h });
        showToast('Aligned layer bottom');
        break;
    }
  };

  // Media auto-fill handler for /canvas
  const handleMediaImport = (item: MediaResult) => {
    const imgUrl = item.type === 'book' ? item.coverUrl : item.artworkUrl;
    if (imgUrl) {
      addObject(
        createImageObject(imgUrl, {
          name: `${item.title} Cover`,
          width: 220,
          height: 220,
          x: Math.round(doc.canvasWidth / 2 - 240),
          y: Math.round(doc.canvasHeight / 2 - 110),
          borderRadius: 12,
        })
      );
    }

    addObject(
      createTextObject({
        text: item.title,
        fontSize: 26,
        fontWeight: '700',
        x: Math.round(doc.canvasWidth / 2),
        y: Math.round(doc.canvasHeight / 2 - 80),
        width: 360,
        height: 60,
        color: getCanvasDefaultTextColor(doc.background),
      })
    );

    addObject(
      createTextObject({
        text: item.type === 'book' ? item.author : item.artist,
        fontSize: 16,
        fontWeight: '500',
        x: Math.round(doc.canvasWidth / 2),
        y: Math.round(doc.canvasHeight / 2 - 20),
        width: 360,
        height: 40,
        color: getCanvasDefaultTextColor(doc.background, true),
      })
    );

    if (item.year) {
      addObject(
        createShapeObject('rounded-rect', {
          name: 'Year Pill',
          fill: '#fcd535',
          x: Math.round(doc.canvasWidth / 2),
          y: Math.round(doc.canvasHeight / 2 + 30),
          width: 90,
          height: 26,
          borderRadius: 13,
        })
      );
      addObject(
        createTextObject({
          text: `EST. ${item.year}`,
          fontSize: 11,
          fontWeight: '700',
          x: Math.round(doc.canvasWidth / 2),
          y: Math.round(doc.canvasHeight / 2 + 30),
          width: 90,
          height: 26,
          align: 'center',
          color: '#000000',
        })
      );
    }

    showToast(`Imported ${item.title} onto canvas!`);
  };

  // Global pointer move & up handlers (Supports mouse, touch, and stylus)
  useEffect(() => {
    let animFrameId: number | null = null;

    const handlePointerMove = (e: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag.isDragging && !drag.isResizing && !drag.isRotating) return;
      if (!selectedId) return;

      const coords = getCanvasCoords(e);
      const deltaX = coords.x - drag.startX;
      const deltaY = coords.y - drag.startY;

      if (animFrameId !== null) cancelAnimationFrame(animFrameId);
      animFrameId = requestAnimationFrame(() => {
        animFrameId = null;
        if (drag.isDragging) {
          let newX = drag.startObjX + deltaX;
          let newY = drag.startObjY + deltaY;

          // Snapping if grid enabled
          if (showGrid) {
            newX = Math.round(newX / 20) * 20;
            newY = Math.round(newY / 20) * 20;
          }

          // Magnetic Smart Snapping (Proximity <= 6px to canvas center & bounding edges)
          const SNAP_PROXIMITY = 6;
          const guides: Array<{ orientation: 'x' | 'y'; pos: number }> = [];

          const objW = drag.startWidth;
          const objH = drag.startHeight;

          // Proximity to Canvas Centers
          const canvasCenterX = Math.round(docRef.current.canvasWidth / 2);
          const canvasCenterY = Math.round(docRef.current.canvasHeight / 2);
          const objCenterX = newX + objW / 2;
          const objCenterY = newY + objH / 2;

          if (Math.abs(objCenterX - canvasCenterX) <= SNAP_PROXIMITY) {
            newX = canvasCenterX - objW / 2;
            guides.push({ orientation: 'x', pos: canvasCenterX });
          }
          if (Math.abs(objCenterY - canvasCenterY) <= SNAP_PROXIMITY) {
            newY = canvasCenterY - objH / 2;
            guides.push({ orientation: 'y', pos: canvasCenterY });
          }

          // Proximity to other visible layers
          for (const other of docRef.current.objects) {
            if (other.id === selectedId || !other.visible) continue;

            if (Math.abs(newX - other.x) <= SNAP_PROXIMITY) {
              newX = other.x;
              guides.push({ orientation: 'x', pos: other.x });
            }
            if (Math.abs((newX + objW) - (other.x + other.width)) <= SNAP_PROXIMITY) {
              newX = other.x + other.width - objW;
              guides.push({ orientation: 'x', pos: other.x + other.width });
            }
            if (Math.abs(newY - other.y) <= SNAP_PROXIMITY) {
              newY = other.y;
              guides.push({ orientation: 'y', pos: other.y });
            }
            if (Math.abs((newY + objH) - (other.y + other.height)) <= SNAP_PROXIMITY) {
              newY = other.y + other.height - objH;
              guides.push({ orientation: 'y', pos: other.y + other.height });
            }
          }

          setSnapGuides(guides);
          updateObject(selectedId, { x: Math.round(newX), y: Math.round(newY) }, false);
        } else if (drag.isResizing && drag.handle) {
          const h = drag.handle;
          const isCorner = h.length === 2;
          const currentObj = docRef.current.objects.find((o) => o.id === selectedId);
          const isImage = currentObj?.type === 'image';
          const isShift = e.shiftKey;

          // Rotation-aware local transform
          const rad = ((drag.startRotation || 0) * Math.PI) / 180;
          const cos = Math.cos(-rad);
          const sin = Math.sin(-rad);
          const localDx = deltaX * cos - deltaY * sin;
          const localDy = deltaX * sin + deltaY * cos;

          let newWidth = drag.startWidth;
          let newHeight = drag.startHeight;

          if (h.includes('e')) newWidth = Math.max(20, drag.startWidth + localDx);
          if (h.includes('w')) newWidth = Math.max(20, drag.startWidth - localDx);
          if (h.includes('s')) newHeight = Math.max(20, drag.startHeight + localDy);
          if (h.includes('n')) newHeight = Math.max(20, drag.startHeight - localDy);

          // Lock aspect ratio for images or if shift is held on corner handle
          if (isCorner && (isImage || isShift)) {
            const origRatio = drag.startWidth / drag.startHeight;
            if (Math.abs(localDx) > Math.abs(localDy)) {
              newHeight = Math.max(20, Math.round(newWidth / origRatio));
            } else {
              newWidth = Math.max(20, Math.round(newHeight * origRatio));
            }
          }

          // Center anchor shift in local coordinates
          const localCenterDx = (newWidth - drag.startWidth) * (h.includes('w') ? -0.5 : h.includes('e') ? 0.5 : 0);
          const localCenterDy = (newHeight - drag.startHeight) * (h.includes('n') ? -0.5 : h.includes('s') ? 0.5 : 0);

          // Transform center shift back to world space
          const cosW = Math.cos(rad);
          const sinW = Math.sin(rad);
          const worldCenterDx = localCenterDx * cosW - localCenterDy * sinW;
          const worldCenterDy = localCenterDx * sinW + localCenterDy * cosW;

          const newCenterX = drag.centerX + worldCenterDx;
          const newCenterY = drag.centerY + worldCenterDy;
          const newX = newCenterX - newWidth / 2;
          const newY = newCenterY - newHeight / 2;

          updateObject(
            selectedId,
            {
              x: Math.round(newX),
              y: Math.round(newY),
              width: Math.round(newWidth),
              height: Math.round(newHeight),
            },
            false
          );
        } else if (drag.isRotating) {
          const rad = Math.atan2(coords.y - drag.centerY, coords.x - drag.centerX);
          let deg = Math.round((rad * 180) / Math.PI) - 90;
          if (deg < 0) deg += 360;
          // Snap to 15 degrees if shift key pressed
          if (e.shiftKey) {
            deg = Math.round(deg / 15) * 15;
          }
          updateObject(selectedId, { rotation: deg }, false);
        }
      });
    };

    const finishPointerDrag = () => {
      const drag = dragRef.current;
      if (drag.isDragging || drag.isResizing || drag.isRotating) {
        drag.isDragging = false;
        drag.isResizing = false;
        drag.isRotating = false;
        drag.handle = null;
        setSnapGuides([]);
        // Commit change to history stack with the latest synchronized docRef
        commitDocumentChange(docRef.current);
      }
    };

    const handlePointerUp = () => {
      if (animFrameId !== null) {
        requestAnimationFrame(finishPointerDrag);
        return;
      }
      finishPointerDrag();
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
    return () => {
      if (animFrameId !== null) cancelAnimationFrame(animFrameId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [selectedId, showGrid, getCanvasCoords, updateObject, commitDocumentChange]);

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmd = e.metaKey || e.ctrlKey;
      const target = e.target as HTMLElement;
      if (
        editingTextId ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        Boolean(target.closest('input, textarea, [contenteditable="true"]'))
      ) {
        return;
      }

      if (isCmd && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if (isCmd && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      } else if (isCmd && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        if (selectedId) duplicateObject(selectedId);
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedId) {
          e.preventDefault();
          deleteObject(selectedId);
        }
      } else if (e.key === 'Escape') {
        setSelectedId(null);
      } else if (selectedId && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        const targetObj = doc.objects.find((o) => o.id === selectedId);
        if (!targetObj || targetObj.locked) return;

        let dx = 0;
        let dy = 0;
        if (e.key === 'ArrowLeft') dx = -step;
        if (e.key === 'ArrowRight') dx = step;
        if (e.key === 'ArrowUp') dy = -step;
        if (e.key === 'ArrowDown') dy = step;

        updateObject(selectedId, { x: targetObj.x + dx, y: targetObj.y + dy });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingTextId, selectedId, doc.objects, handleUndo, handleRedo, duplicateObject, deleteObject, updateObject]);

  // ───────────────────────────────────────────────────────────────────────────
  // IMAGE UPLOAD HANDLER
  // ───────────────────────────────────────────────────────────────────────────

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.currentTarget.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPEG, WebP, SVG).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      showToast('File size is too large (max 8MB). Please choose a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) return;

      const img = new Image();
      img.onload = () => {
        // Keep both wide and tall images inside a sensible first placement.
        const maxWidth = Math.min(docRef.current.canvasWidth * 0.45, 360);
        const maxHeight = Math.min(docRef.current.canvasHeight * 0.6, 360);
        const scale = Math.min(1, maxWidth / img.naturalWidth, maxHeight / img.naturalHeight);
        const w = Math.max(1, Math.round(img.naturalWidth * scale));
        const h = Math.max(1, Math.round(img.naturalHeight * scale));

        const newImgObj = createImageObject(dataUrl, {
          name: file.name.replace(/\.[^/.]+$/, '').slice(0, 20) || 'Uploaded Photo',
          width: w,
          height: h,
          x: Math.round(docRef.current.canvasWidth / 2 - w / 2),
          y: Math.round(docRef.current.canvasHeight / 2 - h / 2),
          borderRadius: 12,
        });

        addObject(newImgObj);
        showToast('Photo added to canvas!');
      };
      img.onerror = () => showToast('Could not open this image. Please try another file.');
      img.src = dataUrl;
    };
    reader.onerror = () => {
      showToast('Error reading image file. Please try another image.');
    };
    reader.readAsDataURL(file);
  };

  // In-Place Photo Replacement: Preserves all position coordinates, dimensions, rotation, clip masks, and z-index
  const handleReplacePhotoInPlace = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const targetId = pendingReplaceLayerIdRef.current || selectedId;
    pendingReplaceLayerIdRef.current = null;
    e.currentTarget.value = '';
    if (!file || !targetId) return;

    const currentObj = docRef.current.objects.find((o) => o.id === targetId);
    if (!currentObj || currentObj.type !== 'image') return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPEG, WebP, SVG).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      showToast('File size is too large (max 8MB). Please choose a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) return;

      const img = new Image();
      img.onload = () => {
        updateObject(targetId, {
          src: dataUrl,
          filteredSrc: undefined,
          naturalWidth: img.naturalWidth || img.width,
          naturalHeight: img.naturalHeight || img.height,
          name: file.name.replace(/\.[^/.]+$/, '').slice(0, 20) || currentObj.name,
        });
        showToast('Photo replaced in-place while keeping layout intact!');
      };
      img.onerror = () => {
        showToast('Could not open this image. The current photo was kept.');
      };
      img.src = dataUrl;
    };
    reader.onerror = () => {
      showToast('Error reading image file.');
    };
    reader.readAsDataURL(file);
  };

  // Offline AI Background Removal: Runs 100% locally via WASM/WebGPU with client-side chroma fallback
  const handleRemoveBackground = async () => {
    if (!selectedObject || selectedObject.type !== 'image') return;
    try {
      setIsRemovingBg(true);
      setBgProgress(10);
      showToast('Removing background locally in browser...');

      const result = await removeLayerBackgroundOffline(
        selectedObject.filteredSrc || selectedObject.src,
        (pct) => setBgProgress(pct)
      );

      updateObject(selectedObject.id, {
        src: result.updatedSrc,
        filteredSrc: undefined,
      });
      showToast('Background removed successfully!');
    } catch (err) {
      console.error('BG removal failed:', err);
      showToast('Failed to remove background.');
    } finally {
      setIsRemovingBg(false);
      setBgProgress(0);
    }
  };

  // ───────────────────────────────────────────────────────────────────────────
  // EXPORT ENGINE (Standard 2x Retina & Ultra-HD 4K / 8K / 16K Pure Card Isolation)
  // ───────────────────────────────────────────────────────────────────────────

  const handleExport = async (format: 'png' | 'jpeg' | 'webp' | '4k' | '8k' | '16k' | '3d-4k' | '3d-8k') => {
    if (!canvasElementRef.current) return;
    setExporting(true);
    setExportDropdownOpen(false);

    // Wait for selection controls to hide before capturing the artwork.
    await new Promise((resolve) => setTimeout(resolve, 80));

    try {
      const node = canvasElementRef.current;

      // Handle 3D Transparent PNG Export (Part V.2 & Part IX.1)
      if (format === '3d-4k' || format === '3d-8k') {
        const rawUrl = await toPng(node, { pixelRatio: 2, cacheBust: true, skipFonts: true });
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = rawUrl;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
        const offCanvas = document.createElement('canvas');
        offCanvas.width = img.naturalWidth;
        offCanvas.height = img.naturalHeight;
        const oCtx = offCanvas.getContext('2d');
        if (oCtx) {
          oCtx.drawImage(img, 0, 0);
        }
        const resolution = format === '3d-8k' ? 7680 : 3840;
        await exportThreeDimensionalCardPNG(
          offCanvas,
          doc.canvasWidth,
          doc.canvasHeight,
          'pvc-clearcoat',
          { rotX: -0.14, rotY: 0.24, rotZ: -0.02 },
          resolution
        );
        showToast(`Exported 3D Card (${resolution}px Transparent PNG)!`);
        return;
      }

      let scale = 2; // Default 2x Retina
      if (format === '4k') {
        scale = Math.max(2, Math.round(3840 / doc.canvasWidth));
      } else if (format === '8k') {
        scale = Math.max(3, Math.round(7680 / doc.canvasWidth));
      } else if (format === '16k') {
        scale = Math.max(4, Math.round(15360 / doc.canvasWidth));
      }

      const options = {
        quality: 0.98,
        pixelRatio: scale,
        canvasWidth: doc.canvasWidth,
        canvasHeight: doc.canvasHeight,
        // Avoid external font stylesheet reads that can stall canvas downloads.
        skipFonts: true,
      };

      let dataUrl: string;
      const isUltra = format === '4k' || format === '8k' || format === '16k';
      const actualFormat = isUltra ? 'png' : format;

      if (actualFormat === 'png') {
        dataUrl = await toPng(node, options);
      } else if (actualFormat === 'jpeg') {
        dataUrl = await toJpeg(node, { ...options, backgroundColor: doc.background || '#ffffff' });
      } else {
        const blob = await toBlob(node, { ...options, type: 'image/webp' });
        if (!blob) throw new Error('WebP blob creation failed');
        dataUrl = URL.createObjectURL(blob);
      }

      // MANDATORY FILENAME RULE: Always starts with aestheticcardgenerator.com
      const filename = getBrandedExportFilename(
        actualFormat as 'png' | 'jpeg' | 'webp',
        '2d',
        isUltra ? (format.toUpperCase() as '4K' | '8K' | '16K') : undefined
      );

      const exportBlob = await (await fetch(dataUrl)).blob();
      triggerBrandedBlobDownload(exportBlob, filename);
      if (actualFormat === 'webp') {
        window.setTimeout(() => URL.revokeObjectURL(dataUrl), 3000);
      }

      showToast(`Exported ${doc.title} (${Math.round(doc.canvasWidth * scale)}×${Math.round(doc.canvasHeight * scale)}px pure card isolate)!`);
    } catch (err) {
      console.error('Export failed:', err);
      showToast('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  // ───────────────────────────────────────────────────────────────────────────
  // TEMPLATE SWITCHING & NEW CARD
  // ───────────────────────────────────────────────────────────────────────────

  const handleApplyTemplate = (template: CardTemplate) => {
    const nextDoc = templateToCanvasDoc(template);
    if (template.theme?.bg && (!nextDoc.background || nextDoc.background === '#ffffff')) {
      nextDoc.background = template.theme.bg;
    }
    commitDocumentChange(nextDoc);
    setTemplateDrawerOpen(false);
    setSelectedId(null);
    showToast(`Loaded template: ${template.title}`);
  };

  const handleCreateBlank = (presetId?: string) => {
    const preset = CANVAS_DIMENSION_PRESETS.find((p) => p.id === presetId) || CANVAS_DIMENSION_PRESETS[0];
    const newDoc = createBlankCanvas(preset.width, preset.height, '#ffffff', 'Custom Aesthetic Card');
    commitDocumentChange(newDoc);
    setSelectedId(null);
    showToast(`Created new blank canvas (${preset.width}×${preset.height}px)!`);
  };

  // Smart "Fit Card Content to Canvas" - scales and reflows elements to fill canvas with clean margins
  const handleFitCardToCanvas = useCallback(() => {
    const currentDoc = docRef.current;
    const expanded = normalizeTemplateDimensions(
      currentDoc.objects as any,
      currentDoc.canvasWidth,
      currentDoc.canvasHeight,
      currentDoc.canvasWidth,
      currentDoc.canvasHeight
    );
    commitDocumentChange({
      ...currentDoc,
      objects: expanded as any,
    });
    showToast('Fitted card elements to canvas!');
  }, [commitDocumentChange]);

  // Quick Command Execution (Leftover Item 5)
  const handleExecuteQuickCommand = useCallback((cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;
    const lower = trimmed.toLowerCase();

    // 1. Rename / text update: "change name to Sarah" or "name Alex"
    const nameMatch = lower.match(/(?:change\s+name\s+to|rename\s+to|name\s+is|name)\s+([^,.;]+)/i);
    if (nameMatch && nameMatch[1]) {
      const newName = nameMatch[1].trim();
      const targetObj = doc.objects.find(
        (o) => o.type === 'text' && (o.name.toLowerCase().includes('name') || o.name.toLowerCase().includes('title') || o.name.toLowerCase().includes('holder'))
      ) || doc.objects.find((o) => o.type === 'text');

      if (targetObj) {
        updateObject(targetObj.id, { text: newName } as any);
        showToast(`Quick Edit: Set name to "${newName}"`);
        setQuickCommandText('');
        return;
      }
    }

    // 2. Palette / color updates
    if (lower.includes('pink') || lower.includes('cyber')) {
      commitDocumentChange({ ...doc, background: '#1c0f1d' });
      showToast('Quick Edit: Switched to Cyber Pink palette');
      setQuickCommandText('');
      return;
    }
    if (lower.includes('dark') || lower.includes('black') || lower.includes('obsidian')) {
      commitDocumentChange({ ...doc, background: '#121417' });
      showToast('Quick Edit: Switched to Obsidian Dark palette');
      setQuickCommandText('');
      return;
    }
    if (lower.includes('vintage') || lower.includes('sepia') || lower.includes('cream')) {
      commitDocumentChange({ ...doc, background: '#f5eee3' });
      showToast('Quick Edit: Switched to Vintage Paper palette');
      setQuickCommandText('');
      return;
    }

    // 3. Auto-align
    if (lower.includes('align') || lower.includes('center') || lower.includes('grid')) {
      const aligned = autoAlignLayersInGrid(doc.objects as any, doc.canvasWidth, doc.canvasHeight);
      commitDocumentChange({ ...doc, objects: aligned as any });
      showToast('Quick Edit: Auto-aligned layers to 8px grid');
      setQuickCommandText('');
      return;
    }

    // 4. Photo mask
    if (lower.includes('circle') || lower.includes('circular') || lower.includes('round')) {
      const photoObj = doc.objects.find((o) => o.type === 'image');
      if (photoObj) {
        updateObject(photoObj.id, { clipMask: 'circle' } as any);
        showToast('Quick Edit: Made photo mask circular');
        setQuickCommandText('');
        return;
      }
    }
    if (lower.includes('star')) {
      const photoObj = doc.objects.find((o) => o.type === 'image');
      if (photoObj) {
        updateObject(photoObj.id, { clipMask: 'star' } as any);
        showToast('Quick Edit: Made photo mask star-shaped');
        setQuickCommandText('');
        return;
      }
    }

    // Fallback: update first text layer
    const firstText = doc.objects.find((o) => o.type === 'text');
    if (firstText) {
      updateObject(firstText.id, { text: trimmed } as any);
      showToast(`Quick Edit: Updated text to "${trimmed}"`);
      setQuickCommandText('');
      return;
    }

    showToast(`Quick Command executed: "${trimmed}"`);
    setQuickCommandText('');
  }, [doc, commitDocumentChange, updateObject]);

  // Saved Clips & Recycle Drawer Handlers (Leftover Item 6)
  const handleSaveToRecycleClips = useCallback((obj: CanvasObject) => {
    const newClip: CanvasObject = {
      ...obj,
      id: `recycled-${Date.now()}`,
    };
    const updated = [newClip, ...savedClips.slice(0, 19)];
    setSavedClips(updated);
    try {
      localStorage.setItem('aesthetic_recycled_clips', JSON.stringify(updated));
    } catch {
      // Storage quota
    }
    showToast(`Saved "${obj.name}" to Recycle Tray!`);
  }, [savedClips]);

  const handleInsertRecycledClip = useCallback((clip: CanvasObject) => {
    const inserted: CanvasObject = {
      ...clip,
      id: createObjectId(clip.type),
      x: Math.round(doc.canvasWidth / 2 - clip.width / 2),
      y: Math.round(doc.canvasHeight / 2 - clip.height / 2),
      zIndex: (Math.max(...doc.objects.map((o) => o.zIndex), 0) || 0) + 1,
    };
    commitDocumentChange({
      ...doc,
      objects: [...doc.objects, inserted],
    });
    setSelectedId(inserted.id);
    showToast(`Recycled "${clip.name}" onto active canvas!`);
  }, [doc, commitDocumentChange]);

  // ───────────────────────────────────────────────────────────────────────────
  // RENDER HELPERS
  // ───────────────────────────────────────────────────────────────────────────

  return (
    <div className="canvas-editor w-full h-dvh min-h-0 overflow-hidden flex flex-col pt-0 transition-colors duration-200 bg-[var(--app-bg)] text-[var(--app-text)]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl studio-panel shadow-2xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 text-[var(--app-text)]">
          <Check className="w-4 h-4 text-[var(--app-text-secondary)]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hidden File Input (New Image Layer) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Hidden File Input (In-Place Photo Replacement) */}
      <input
        ref={replaceFileInputRef}
        type="file"
        accept="image/*"
        onChange={handleReplacePhotoInPlace}
        className="hidden"
      />

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* TOP STUDIO TOOLBAR                                                    */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      <header className="editor-top-toolbar h-13 sm:h-14 border-b border-[var(--app-border-subtle)] px-2 sm:px-4 flex items-center justify-between shrink-0 transition-colors z-30 pt-[env(safe-area-inset-top,0px)] bg-[var(--app-surface)] text-[var(--app-text)]">
        {/* Left: Back & Title */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <button
            onClick={() => {
              if (onNavigateHome) onNavigateHome();
              else window.location.href = '/templates';
            }}
            className="p-1.5 rounded-lg border border-[var(--app-border-subtle)] bg-[var(--app-surface-secondary)] hover:border-[var(--app-accent)]/40 text-[var(--app-text)] transition-colors cursor-pointer"
            title="Return to Studio Home / Templates"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={doc.title}
              onChange={(e) => setDoc((prev) => ({ ...prev, title: e.target.value }))}
              onBlur={(e) => commitDocumentChange({ ...doc, title: e.target.value })}
              className={`doc-title-input text-xs sm:text-sm font-semibold tracking-tight bg-transparent border-b border-transparent hover:border-[#81786d] focus:border-[#24211b] dark:focus:border-[#E2D9C8] focus:outline-none px-1 py-0.5 rounded transition-all max-w-[90px] sm:max-w-[160px] md:max-w-xs ${
                isLight ? 'text-[var(--app-accent)]' : 'text-white'
              }`}
              title="Click to rename document"
            />
            <span className="hidden xl:inline-block text-[11px] font-mono px-2 py-0.5 rounded bg-[#81786d]/10 text-[#81786d]">
              {doc.canvasWidth} × {doc.canvasHeight} px
            </span>
          </div>
        </div>

        {/* Center: Undo/Redo & Zoom Controls */}
        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className={`p-1.5 sm:p-2 rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
              isLight ? 'hover:bg-[#f0ede7] text-slate-700' : 'hover:bg-[#211e19] text-slate-300'
            }`}
            title="Undo (⌘Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className={`p-1.5 sm:p-2 rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
              isLight ? 'hover:bg-[#f0ede7] text-slate-700' : 'hover:bg-[#211e19] text-slate-300'
            }`}
            title="Redo (⌘⇧Z)"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-[#39342d]/40 mx-1 hidden sm:block" />

          {/* Zoom Controls */}
          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={() => setZoom((z) => Math.max(0.2, Number((z - 0.1).toFixed(2))))}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isLight ? 'hover:bg-[#f0ede7]' : 'hover:bg-[#211e19]'
              }`}
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-mono w-12 text-center text-[#81786d]">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(2.5, Number((z + 0.1).toFixed(2))))}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isLight ? 'hover:bg-[#f0ede7]' : 'hover:bg-[#211e19]'
              }`}
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleFitToScreen}
              className={`p-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                isLight ? 'hover:bg-[#f0ede7]' : 'hover:bg-[#211e19]'
              }`}
              title="Fit Viewport to Screen"
            >
              Fit
            </button>
          </div>

          <div className="h-4 w-px bg-[#39342d]/40 mx-1 hidden sm:block" />

          <details className="relative">
            <summary className={`list-none p-2 rounded-lg flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-colors ${
              isLight ? 'hover:bg-[#f0ede7] text-[#81786d]' : 'hover:bg-[#211e19] text-[#a0a5ad]'
            }`}>
              <Eye className="w-4 h-4" />
              <span className="hidden md:inline">View</span>
              <ChevronDown className="w-3 h-3" />
            </summary>
            <div className={`absolute left-0 sm:left-auto sm:right-0 top-full mt-2 w-52 rounded-xl border p-2 shadow-2xl z-50 flex flex-col gap-1 canvas-utility-popover ${
              isLight ? 'bg-white border-[#e3ddd3]' : 'bg-[#211e19] border-[#39342d]'
            }`}>
              <button
                onClick={(e) => {
                  setShowGrid((shown) => !shown);
                  e.currentTarget.closest('details')?.removeAttribute('open');
                }}
                className={`w-full px-2 py-2 text-left text-xs flex items-center justify-between cursor-pointer transition-colors ${
                  isLight ? 'hover:bg-[#f0ede7]' : 'hover:bg-[#29251f]'
                }`}
                aria-pressed={showGrid}
              >
                <span className="flex items-center gap-2"><Grid className="w-3.5 h-3.5" /> Alignment grid</span>
                <span className="text-[var(--app-text-muted)]">{showGrid ? 'On' : 'Off'}</span>
              </button>
              <button
                onClick={(e) => {
                  setZoom(1);
                  e.currentTarget.closest('details')?.removeAttribute('open');
                }}
                className={`w-full px-2 py-2 text-left text-xs flex items-center gap-2 cursor-pointer transition-colors ${
                  isLight ? 'hover:bg-[#f0ede7]' : 'hover:bg-[#29251f]'
                }`}
              >
                <ZoomIn className="w-3.5 h-3.5" /> Actual size (100%)
              </button>
              <button
                onClick={(e) => {
                  handleFitCardToCanvas();
                  e.currentTarget.closest('details')?.removeAttribute('open');
                }}
                className={`w-full px-2 py-2 text-left text-xs flex items-center gap-2 cursor-pointer transition-colors ${
                  isLight ? 'hover:bg-[#f0ede7]' : 'hover:bg-[#29251f]'
                }`}
                title="Scale and reflow the layers to fit the canvas"
              >
                <Maximize2 className="w-3.5 h-3.5" /> Fit layers to canvas
              </button>
              <div className="h-px w-full bg-[var(--app-border-subtle)] my-1" />
              <button
                onClick={(e) => {
                  const aligned = autoAlignLayersInGrid(doc.objects as any, doc.canvasWidth, doc.canvasHeight);
                  commitDocumentChange({ ...doc, objects: aligned as any });
                  showToast('Layers aligned to grid');
                  e.currentTarget.closest('details')?.removeAttribute('open');
                }}
                className={`w-full px-2 py-2 text-left text-xs flex items-center gap-2 cursor-pointer transition-colors ${
                  isLight ? 'hover:bg-[#f0ede7]' : 'hover:bg-[#29251f]'
                }`}
                title="Align layers to an 8px baseline grid"
              >
                <AlignCenter className="w-3.5 h-3.5" /> Align layers
              </button>
              <button
                onClick={(e) => {
                  setAmbientModeEnabled((enabled) => !enabled);
                  e.currentTarget.closest('details')?.removeAttribute('open');
                }}
                className={`w-full px-2 py-2 text-left text-xs flex items-center justify-between cursor-pointer transition-colors ${
                  isLight ? 'hover:bg-[#f0ede7]' : 'hover:bg-[#29251f]'
                }`}
                aria-pressed={ambientModeEnabled}
              >
                <span className="flex items-center gap-2"><Sun className="w-3.5 h-3.5" /> Stage tone</span>
                <span className="text-[var(--app-text-muted)]">{ambientModeEnabled ? 'Soft' : 'Plain'}</span>
              </button>
              <button
                onClick={(e) => {
                  setSelectedId(null);
                  setIs3DMode((enabled) => !enabled);
                  e.currentTarget.closest('details')?.removeAttribute('open');
                }}
                className={`w-full px-2 py-2 text-left text-xs flex items-center justify-between cursor-pointer transition-colors ${
                  isLight ? 'hover:bg-[#f0ede7]' : 'hover:bg-[#29251f]'
                }`}
                aria-pressed={is3DMode}
              >
                <span className="flex items-center gap-2"><Box className="w-3.5 h-3.5" /> 3D preview</span>
                <span className="text-[var(--app-text-muted)]">{is3DMode ? 'On' : 'Off'}</span>
              </button>
            </div>
          </details>
        </div>

        {/* Right: Common options and export */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            onClick={() => setTemplateDrawerOpen(true)}
            className={`hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
              isLight
                ? 'bg-white border-[#e3ddd3] text-[var(--app-accent)] hover:bg-[#f8f5ef]'
                : 'bg-[#211e19] border-[#39342d] text-white hover:bg-[#29251f]'
            }`}
          >
            <LayoutTemplate className={`w-3.5 h-3.5 ${isLight ? 'text-[#24211b]' : 'text-[#E2D9C8]'}`} />
            <span>Templates</span>
          </button>

          <details className="relative">
            <summary className={`list-none inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
              isLight
                ? 'bg-white border-[#e3ddd3] text-[var(--app-accent)] hover:bg-[#f8f5ef]'
                : 'bg-[#211e19] border-[#39342d] text-white hover:bg-[#29251f]'
            }`}>
              <span>More</span>
              <ChevronDown className="w-3 h-3" />
            </summary>
            <div className={`absolute right-0 top-full mt-2 w-52 rounded-xl border p-1 shadow-2xl z-50 flex flex-col gap-0.5 canvas-utility-popover ${
              isLight ? 'bg-white border-[#e3ddd3]' : 'bg-[#211e19] border-[#39342d]'
            }`}>
              <button
                onClick={(e) => {
                  setTemplateDrawerOpen(true);
                  e.currentTarget.closest('details')?.removeAttribute('open');
                }}
                className={`xl:hidden w-full text-left px-3 py-2 text-xs flex items-center gap-2 cursor-pointer transition-colors ${
                  isLight ? 'hover:bg-[#f0ece4]' : 'hover:bg-[#29251f]'
                }`}
              >
                <LayoutTemplate className="w-3.5 h-3.5" /> Templates
              </button>
              {onToggleTheme && (
                <button
                  onClick={(e) => {
                    onToggleTheme();
                    e.currentTarget.closest('details')?.removeAttribute('open');
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 cursor-pointer transition-colors ${
                    isLight ? 'hover:bg-[#f0ece4]' : 'hover:bg-[#29251f]'
                  }`}
                >
                  {isLight ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                  Switch to {isLight ? 'dark' : 'light'} theme
                </button>
              )}
              <div className="h-px w-full bg-[var(--app-border-subtle)] my-1" />
              <button
                onClick={(e) => {
                  setMediaModalOpen(true);
                  e.currentTarget.closest('details')?.removeAttribute('open');
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
                  isLight ? 'hover:bg-[#f0ece4]' : 'hover:bg-[#29251f]'
                }`}
                title="Search and import book or song cover & metadata"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Book / song</span>
              </button>
              <button
                onClick={(e) => {
                  handleCreateBlank();
                  e.currentTarget.closest('details')?.removeAttribute('open');
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
                  isLight ? 'hover:bg-[#f0ece4]' : 'hover:bg-[#29251f]'
                }`}
              >
                <FilePlus className="w-3.5 h-3.5" />
                <span>Blank canvas</span>
              </button>
              <button
                onClick={(e) => {
                  setQuickCommandOpen((open) => !open);
                  e.currentTarget.closest('details')?.removeAttribute('open');
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
                  isLight ? 'hover:bg-[#f0ece4]' : 'hover:bg-[#29251f]'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{quickCommandOpen ? 'Close quick edit' : 'Quick edit'}</span>
              </button>
            </div>
          </details>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
              disabled={exporting}
              className={`inline-flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md cursor-pointer ${
                isLight
                  ? 'bg-[#24211b] text-white hover:bg-[#2a2620]'
                  : 'bg-[#E2D9C8] text-[#24211b] hover:bg-[#d3cabc]'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>{exporting ? 'Rendering...' : 'Export'}</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {exportDropdownOpen && (
              <div
                className={`absolute right-0 top-full mt-2 w-52 rounded-xl border p-1 shadow-2xl z-50 flex flex-col gap-0.5 canvas-utility-popover ${
                  isLight ? 'bg-white border-[#e3ddd3]' : 'bg-[#211e19] border-[#39342d]'
                }`}
              >
                <button
                  onClick={() => handleExport('png')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                    isLight ? 'hover:bg-[#f0ece4]' : 'hover:bg-[#29251f]'
                  }`}
                >
                  <span>PNG (2x Retina)</span>
                  <span className="text-[10px] opacity-60 font-mono">Crisp</span>
                </button>
                <button
                  onClick={() => handleExport('webp')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                    isLight ? 'hover:bg-[#f0ece4]' : 'hover:bg-[#29251f]'
                  }`}
                >
                  <span>WebP (Lossless)</span>
                  <span className="text-[10px] opacity-60 font-mono">Modern</span>
                </button>
                <button
                  onClick={() => handleExport('jpeg')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                    isLight ? 'hover:bg-[#f0ece4]' : 'hover:bg-[#29251f]'
                  }`}
                >
                  <span>JPEG (Social)</span>
                  <span className="text-[10px] opacity-60 font-mono">Small</span>
                </button>
                <div className={`h-px my-1 ${isLight ? 'bg-slate-200' : 'bg-[#39342d]'}`} />
                <div className="px-3 py-1 text-[11px] font-medium text-[var(--app-text-muted)]">
                  High resolution
                </div>
                <button
                  onClick={() => handleExport('4k')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                    isLight ? 'hover:bg-[#f0ece4]' : 'hover:bg-[#29251f]'
                  }`}
                >
                  <span>Ultra-HD 4K</span>
                  <span className="text-[10px] text-[#E2D9C8] font-mono">3840px</span>
                </button>
                <button
                  onClick={() => handleExport('8k')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                    isLight ? 'hover:bg-[#f0ece4]' : 'hover:bg-[#29251f]'
                  }`}
                >
                  <span>Ultra-HD 8K</span>
                  <span className="text-[10px] text-[var(--app-text-secondary)] font-mono">7680px</span>
                </button>
                <button
                  onClick={() => handleExport('16k')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                    isLight ? 'hover:bg-[#f0ece4]' : 'hover:bg-[#29251f]'
                  }`}
                >
                  <span>Ultra-HD 16K</span>
                  <span className="text-[10px] text-[var(--app-text-secondary)] font-mono">15360px</span>
                </button>
                <div className={`h-px my-1 ${isLight ? 'bg-slate-200' : 'bg-[#39342d]'}`} />
                <div className="px-3 py-1 text-[11px] font-medium text-[var(--app-text-muted)]">
                  Transparent 3D
                </div>
                <button
                  onClick={() => handleExport('3d-4k')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                    isLight ? 'hover:bg-[#f0ece4]' : 'hover:bg-[#29251f]'
                  }`}
                >
                  <span>3D card (4K, transparent)</span>
                  <span className="text-[10px] text-[var(--app-accent)] font-mono">3840px</span>
                </button>
                <button
                  onClick={() => handleExport('3d-8k')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                    isLight ? 'hover:bg-[#f0ece4]' : 'hover:bg-[#29251f]'
                  }`}
                >
                  <span>3D card (8K, transparent)</span>
                  <span className="text-[10px] text-[var(--app-accent)] font-mono">7680px</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* QUICK COMMAND BAR ("TELL STUDIO WHAT TO CHANGE" - Leftover Item 5)    */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      {quickCommandOpen && (
      <div
        className={`px-4 py-2 border-b flex items-center gap-3 transition-colors shrink-0 z-20 ${
          isLight ? 'bg-white border-[#e3ddd3]' : 'bg-[#171513] border-[#29251f]'
        }`}
      >
        <div className="flex items-center gap-1.5 text-xs text-[#24211b] dark:text-[#E2D9C8] font-mono shrink-0">
          <Sliders className="w-4 h-4" />
          <span className="hidden sm:inline font-bold">Quick edit</span>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleExecuteQuickCommand(quickCommandText);
            setQuickCommandOpen(false);
          }}
          className="flex-1 flex items-center gap-2"
        >
          <input
            type="text"
            value={quickCommandText}
            onChange={(e) => setQuickCommandText(e.target.value)}
            placeholder="Describe a small change to this design"
            className={`flex-1 px-3 py-1.5 rounded-lg text-xs border outline-none transition-all ${
              isLight
                ? 'bg-slate-50 border-slate-200 text-[var(--app-accent)] focus:border-[#24211b]'
                : 'bg-[#211e19] border-[#3b352e] text-white focus:border-[#E2D9C8]'
            }`}
          />
          <button
            type="submit"
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
              isLight
                ? 'bg-[#24211b] text-white hover:bg-[#2a2620]'
                : 'bg-[#E2D9C8] text-[#24211b] hover:bg-[#d3cabc]'
            }`}
          >
            Apply
          </button>
        </form>
      </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* MAIN WORKSPACE BODY                                                   */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 flex overflow-hidden relative">
        {/* LEFT TOOLBAR: Add Elements (Desktop) */}
        <aside
          className={`hidden lg:flex w-16 border-r flex-col items-center py-4 gap-2 shrink-0 transition-colors z-20 ${
            isLight ? 'bg-white border-[#e3ddd3]' : 'bg-[#171513] border-[#29251f]'
          }`}
        >
          <details
            ref={addMenuRef}
            className="relative"
            onClick={(event) => {
              if ((event.target as HTMLElement).closest('button[data-close-add-menu]')) {
                addMenuRef.current?.removeAttribute('open');
              }
            }}
          >
            <summary className={`list-none w-11 h-11 rounded-xl border flex flex-col items-center justify-center gap-0.5 text-xs font-semibold cursor-pointer ${
              isLight
                ? 'bg-[#f8f5ef] border-[#e3ddd3] hover:bg-[#f0ece4]'
                : 'bg-[#211e19] border-[#39342d] hover:bg-[#29251f]'
            }`}>
              <FilePlus className="w-4 h-4" />
              <span>Add</span>
            </summary>
            <div className={`absolute left-full top-0 ml-2 z-50 w-72 rounded-2xl border p-3 shadow-2xl canvas-utility-popover canvas-add-menu ${
              isLight ? 'bg-white border-[#e3ddd3]' : 'bg-[#171513] border-[#39342d]'
            }`}>
              <h4 className="px-1 pb-2 text-xs font-semibold">Add to canvas</h4>
              <div className="grid grid-cols-2 gap-1">
          {/* Add Text */}
          <button
            onClick={() =>
              addObject(
                createTextObject({
                  text: 'Your text here',
                  fontSize: 28,
                  x: Math.round(doc.canvasWidth / 2 - 160),
                  y: Math.round(doc.canvasHeight / 2 - 30),
                  color: getCanvasDefaultTextColor(doc.background),
                })
              )
            }
            className={`w-full h-9 rounded-none flex flex-row items-center justify-start gap-2 px-2 border transition-all cursor-pointer group ${
              isLight
                ? 'bg-[#f8f5ef] border-[#e3ddd3] hover:border-[#d4cdbf] hover:bg-[#f0ece4]'
                : 'bg-[#211e19] border-[#39342d] hover:border-[#444748] hover:bg-[#29251f]'
            }`}
            aria-label="Add text layer"
            data-close-add-menu
            title="Add independent Text layer"
          >
            <Type className="w-4 h-4 text-[var(--app-text-secondary)]" />
            <span className="text-xs font-medium text-[#81786d]">Text</span>
          </button>

          {/* Add Image */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`w-full h-9 rounded-none flex flex-row items-center justify-start gap-2 px-2 border transition-all cursor-pointer group ${
              isLight
                ? 'bg-[#f8f5ef] border-[#e3ddd3] hover:border-[#d4cdbf] hover:bg-[#f0ece4]'
                : 'bg-[#211e19] border-[#39342d] hover:border-[#444748] hover:bg-[#29251f]'
            }`}
            aria-label="Upload an image"
            data-close-add-menu
            title="Upload Photo / Avatar from your device"
          >
            <Upload className="w-4 h-4 text-[var(--app-text-secondary)]" />
            <span className="text-xs font-medium text-[#81786d]">Upload</span>
          </button>

          {/* Sample Avatars Picker */}
          <button
            onClick={() => {
              const avatars = Object.values(ASSET_AVATARS);
              const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];
              addObject(
                createImageObject(randomAvatar, {
                  name: 'Sample Avatar',
                  x: Math.round(doc.canvasWidth / 2 - 130),
                  y: Math.round(doc.canvasHeight / 2 - 160),
                  width: 260,
                  height: 320,
                  borderRadius: 14,
                })
              );
              showToast('Added vector portrait avatar!');
            }}
            className={`w-full h-9 rounded-none flex flex-row items-center justify-start gap-2 px-2 border transition-all cursor-pointer group ${
              isLight
                ? 'bg-[#f8f5ef] border-[#e3ddd3] hover:border-[#d4cdbf] hover:bg-[#f0ece4]'
                : 'bg-[#211e19] border-[#39342d] hover:border-[#444748] hover:bg-[#29251f]'
            }`}
            aria-label="Add a sample avatar"
            data-close-add-menu
            title="Add preset vector portrait"
          >
            <ImageIcon className="w-4 h-4 text-[var(--app-text-secondary)]" />
            <span className="text-xs font-medium text-[#81786d]">Avatar</span>
          </button>

          <div className="col-span-2 w-full h-px bg-[#39342d]/40" />

          {/* Add Shapes */}
          <button
            onClick={() =>
              addObject(
                createShapeObject('rounded-rect', {
                  name: 'Card Container',
                  x: Math.round(doc.canvasWidth / 2 - 180),
                  y: Math.round(doc.canvasHeight / 2 - 120),
                  width: 360,
                  height: 240,
                  fill: '#e4ddcf',
                  stroke: '#a7a197',
                  strokeWidth: 2,
                  borderRadius: 16,
                })
              )
            }
            className={`w-full h-9 rounded-none flex flex-row items-center justify-start gap-2 px-2 border transition-all cursor-pointer group ${
              isLight
                ? 'bg-[#f8f5ef] border-[#e3ddd3] hover:border-[#d4cdbf]'
                : 'bg-[#211e19] border-[#39342d] hover:border-[#444748]'
            }`}
            aria-label="Add a rounded rectangle"
            data-close-add-menu
            title="Add Rounded Box"
          >
            <Square className="w-4 h-4 text-[var(--app-text-secondary)]" />
            <span className="text-xs font-medium text-[#81786d]">Box</span>
          </button>

          <button
            onClick={() =>
              addObject(
                createShapeObject('circle', {
                  name: 'Circle Stamp',
                  x: Math.round(doc.canvasWidth / 2 - 60),
                  y: Math.round(doc.canvasHeight / 2 - 60),
                  width: 120,
                  height: 120,
                  fill: '#e4ddcf',
                  stroke: '#a7a197',
                  strokeWidth: 2,
                })
              )
            }
            className={`w-full h-9 rounded-none flex flex-row items-center justify-start gap-2 px-2 border transition-all cursor-pointer group ${
              isLight
                ? 'bg-[#f8f5ef] border-[#e3ddd3] hover:border-[#d4cdbf]'
                : 'bg-[#211e19] border-[#39342d] hover:border-[#444748]'
            }`}
            aria-label="Add a circle"
            data-close-add-menu
            title="Add Circle"
          >
            <Circle className="w-4 h-4 text-[var(--app-text-secondary)]" />
            <span className="text-xs font-medium text-[#81786d]">Circle</span>
          </button>

          <button
            onClick={() =>
              addObject(
                createShapeObject('star', {
                  name: 'Decorative Star',
                  x: Math.round(doc.canvasWidth / 2 - 25),
                  y: Math.round(doc.canvasHeight / 2 - 25),
                  width: 50,
                  height: 50,
                  fill: '#d8cfbd',
                })
              )
            }
            className={`w-full h-9 rounded-none flex flex-row items-center justify-start gap-2 px-2 border transition-all cursor-pointer group ${
              isLight
                ? 'bg-[#f8f5ef] border-[#e3ddd3] hover:border-[#d4cdbf]'
                : 'bg-[#211e19] border-[#39342d] hover:border-[#444748]'
            }`}
            aria-label="Add a star"
            data-close-add-menu
            title="Add Star"
          >
            <Star className="w-4 h-4 text-[var(--app-text-secondary)]" />
            <span className="text-xs font-medium text-[#81786d]">Star</span>
          </button>

          <button
            onClick={() =>
              addObject(
                createShapeObject('heart', {
                  name: 'Heart Stamp',
                  x: Math.round(doc.canvasWidth / 2 - 25),
                  y: Math.round(doc.canvasHeight / 2 - 25),
                  width: 50,
                  height: 50,
                  fill: '#d8cfbd',
                })
              )
            }
            className={`w-full h-9 rounded-none flex flex-row items-center justify-start gap-2 px-2 border transition-all cursor-pointer group ${
              isLight
                ? 'bg-[#f8f5ef] border-[#e3ddd3] hover:border-[#d4cdbf]'
                : 'bg-[#211e19] border-[#39342d] hover:border-[#444748]'
            }`}
            aria-label="Add a heart"
            data-close-add-menu
            title="Add Heart"
          >
            <Heart className="w-4 h-4 text-[var(--app-text-secondary)]" />
            <span className="text-xs font-medium text-[#81786d]">Heart</span>
          </button>

          <button
            onClick={() =>
              addObject(
                createShapeObject('line', {
                  name: 'Divider Line',
                  x: Math.round(doc.canvasWidth / 2 - 150),
                  y: Math.round(doc.canvasHeight / 2),
                  width: 300,
                  height: 2,
                  fill: '#a7a197',
                })
              )
            }
            className={`w-full h-9 rounded-none flex flex-row items-center justify-start gap-2 px-2 border transition-all cursor-pointer group ${
              isLight
                ? 'bg-[#f8f5ef] border-[#e3ddd3] hover:border-[#d4cdbf]'
                : 'bg-[#211e19] border-[#39342d] hover:border-[#444748]'
            }`}
            aria-label="Add a divider line"
            data-close-add-menu
            title="Add Divider Line"
          >
            <Minus className="w-4 h-4 text-[var(--app-text-secondary)]" />
            <span className="text-xs font-medium text-[#81786d]">Line</span>
          </button>

          <div className="col-span-2 w-full h-px bg-[#39342d]/40" />

          {/* Stamps & Accents Popover Drawer Trigger */}
          <div className="relative">
            <button
              onClick={() => setStampsDrawerOpen(!stampsDrawerOpen)}
              className={`w-full h-9 rounded-none flex flex-row items-center justify-start gap-2 px-2 border transition-all cursor-pointer group ${
                stampsDrawerOpen
                  ? isLight
                    ? 'bg-[#24211b] text-white border-[#24211b] font-bold shadow-md'
                    : 'bg-[#E2D9C8] text-[#24211b] border-[#E2D9C8] font-bold shadow-md'
                  : isLight
                  ? 'bg-[#f8f5ef] border-[#e3ddd3] hover:border-[#d4cdbf]'
                  : 'bg-[#211e19] border-[#39342d] hover:border-[#444748]'
              }`}
              aria-label="Browse stamps and accents"
              title="Open Curated Stamps, Badges & Accents Drawer"
            >
              <Award className="w-4 h-4 text-[var(--app-text-secondary)]" />
              <span className="text-[9px] font-medium">Stamps</span>
            </button>

            {/* Stamps Popover Menu */}
            {stampsDrawerOpen && (
              <div
                className={`absolute left-full top-0 ml-2 w-64 rounded-2xl border p-2.5 shadow-2xl z-50 canvas-utility-popover flex flex-col gap-2 ${
                  isLight ? 'bg-white border-[#e3ddd3]' : 'bg-[#211e19] border-[#39342d]'
                }`}
              >
                <div className="flex items-center justify-between pb-1.5 border-b border-current/10">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#81786d]">
                    Stamps & Accents
                  </span>
                  <button
                    onClick={() => setStampsDrawerOpen(false)}
                    className="text-[10px] text-[#81786d] hover:text-white"
                  >
                    Close
                  </button>
                </div>

                <div className="flex flex-col gap-1.5 max-h-72 overflow-y-auto pr-1">
                  {/* Rubber Stamp */}
                  <button
                    onClick={() => {
                      addObject(
                        createShapeObject('rubber-stamp', {
                          name: 'Rubber Stamp',
                          fill: '#dc2626',
                          stampText: 'APPROVED',
                          width: 140,
                          height: 48,
                          x: Math.round(doc.canvasWidth / 2 - 70),
                          y: Math.round(doc.canvasHeight / 2 - 24),
                          rotation: -8,
                        })
                      );
                      setStampsDrawerOpen(false);
                    }}
                    aria-label="Add approved stamp"
                    data-close-add-menu
                    className={`p-2 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-colors ${
                      isLight ? 'hover:bg-slate-50 border-slate-200' : 'hover:bg-[#29251f] border-[#39342d]'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-[var(--app-text-primary)] font-mono tracking-wider">APPROVED</span>
                      <span className="text-[10px] text-[#81786d]">Distressed Rubber Ink</span>
                    </div>
                    <span className="text-xs font-mono opacity-50">STAMP</span>
                  </button>

                  {/* Holographic Security Seal */}
                  <button
                    onClick={() => {
                      addObject(
                        createShapeObject('security-seal', {
                          name: 'Security Rosette Seal',
                          fill: '#fcd535',
                          width: 90,
                          height: 90,
                          x: Math.round(doc.canvasWidth / 2 - 45),
                          y: Math.round(doc.canvasHeight / 2 - 45),
                        })
                      );
                      setStampsDrawerOpen(false);
                    }}
                    aria-label="Add security seal"
                    data-close-add-menu
                    className={`p-2 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-colors ${
                      isLight ? 'hover:bg-slate-50 border-slate-200' : 'hover:bg-[#29251f] border-[#39342d]'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-[var(--app-text-primary)]">Security Rosette</span>
                      <span className="text-[10px] text-[#81786d]">Holographic metallic seal</span>
                    </div>
                    <span className="text-xs font-mono opacity-50">FOIL</span>
                  </button>

                  {/* Washi Masking Tape */}
                  <button
                    onClick={() => {
                      addObject(
                        createShapeObject('washi-tape', {
                          name: 'Washi Tape',
                          fill: '#fef08a',
                          opacity: 0.8,
                          width: 180,
                          height: 34,
                          x: Math.round(doc.canvasWidth / 2 - 90),
                          y: Math.round(doc.canvasHeight / 2 - 80),
                          rotation: -4,
                        })
                      );
                      setStampsDrawerOpen(false);
                    }}
                    aria-label="Add washi tape strip"
                    data-close-add-menu
                    className={`p-2 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-colors ${
                      isLight ? 'hover:bg-slate-50 border-slate-200' : 'hover:bg-[#29251f] border-[#39342d]'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-[var(--app-text-primary)]">Washi Tape Strip</span>
                      <span className="text-[10px] text-[#81786d]">Translucent torn-edge tape</span>
                    </div>
                    <span className="text-xs font-mono opacity-50">TAPE</span>
                  </button>

                  {/* 5-Star Rating Bar */}
                  <button
                    onClick={() => {
                      addObject(
                        createShapeObject('rating-stars', {
                          name: '5-Star Rating',
                          fill: '#fcd535',
                          starRating: 5.0,
                          width: 140,
                          height: 32,
                          x: Math.round(doc.canvasWidth / 2 - 70),
                          y: Math.round(doc.canvasHeight / 2 + 60),
                        })
                      );
                      setStampsDrawerOpen(false);
                    }}
                    aria-label="Add five-star rating"
                    data-close-add-menu
                    className={`p-2 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-colors ${
                      isLight ? 'hover:bg-slate-50 border-slate-200' : 'hover:bg-[#29251f] border-[#39342d]'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-[var(--app-text-primary)]">★★★★★ Review Bar</span>
                      <span className="text-[10px] text-[#81786d]">0.5 to 5.0 star selector</span>
                    </div>
                    <span className="text-xs font-mono opacity-50">STARS</span>
                  </button>

                  {/* Audio Waveform */}
                  <button
                    onClick={() => {
                      addObject(
                        createShapeObject('audio-waveform', {
                          name: 'Music Waveform',
                          fill: '#10b981',
                          width: 220,
                          height: 48,
                          x: Math.round(doc.canvasWidth / 2 - 110),
                          y: Math.round(doc.canvasHeight / 2 + 100),
                        })
                      );
                      setStampsDrawerOpen(false);
                    }}
                    aria-label="Add audio waveform"
                    data-close-add-menu
                    className={`p-2 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-colors ${
                      isLight ? 'hover:bg-slate-50 border-slate-200' : 'hover:bg-[#29251f] border-[#39342d]'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-[var(--app-text-primary)]">Audio Track Player</span>
                      <span className="text-[10px] text-[#81786d]">Scannable waveform bars</span>
                    </div>
                    <Volume2 className="w-4 h-4 text-[var(--app-text-secondary)]" />
                  </button>

                  {/* Dynamic Code-128 Barcode */}
                  <button
                    onClick={() => {
                      addObject(
                        createShapeObject('barcode', {
                          name: 'Dynamic Barcode',
                          fill: '#24211b',
                          payload: 'ACS-98420',
                          showTextLabel: true,
                          width: 240,
                          height: 60,
                          x: Math.round(doc.canvasWidth / 2 - 120),
                          y: doc.canvasHeight - 90,
                        })
                      );
                      setStampsDrawerOpen(false);
                    }}
                    aria-label="Add dynamic barcode"
                    data-close-add-menu
                    className={`p-2 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-colors ${
                      isLight ? 'hover:bg-slate-50 border-slate-200' : 'hover:bg-[#29251f] border-[#39342d]'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-[var(--app-text-primary)]">Dynamic Barcode</span>
                      <span className="text-[10px] text-[#81786d]">Code-128 SVG with live payload</span>
                    </div>
                    <Barcode className="w-4 h-4 text-[var(--app-text-secondary)]" />
                  </button>

                  {/* Dynamic QR Code */}
                  <button
                    onClick={() => {
                      addObject(
                        createShapeObject('qr-code', {
                          name: 'Dynamic QR Code',
                          fill: '#24211b',
                          payload: 'https://aestheticcardgenerator.pages.dev',
                          showTextLabel: false,
                          width: 90,
                          height: 90,
                          x: Math.round(doc.canvasWidth / 2 - 45),
                          y: Math.round(doc.canvasHeight / 2 - 45),
                        })
                      );
                      setStampsDrawerOpen(false);
                    }}
                    aria-label="Add dynamic QR code"
                    data-close-add-menu
                    className={`p-2 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-colors ${
                      isLight ? 'hover:bg-slate-50 border-slate-200' : 'hover:bg-[#29251f] border-[#39342d]'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-[var(--app-text-primary)]">Dynamic QR Matrix</span>
                      <span className="text-[10px] text-[#81786d]">Live URL / Spotify binding</span>
                    </div>
                    <QrCode className="w-4 h-4 text-[var(--app-text-secondary)]" />
                  </button>
                </div>
              </div>
            )}
          </div>

              </div>
            </div>
          </details>
        </aside>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* CENTER: THE INTERACTIVE CANVAS VIEWPORT                             */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <main
          id="canvas-scroll-container"
          ref={canvasContainerRef}
          onClick={() => setSelectedId(null)}
          className="editor-ambient-stage editor-canvas-stage-mobile flex-1 overflow-auto flex items-center justify-center p-3 pb-16 sm:p-8 select-none relative transition-colors duration-300"
          style={{
            backgroundColor: isLight ? '#f8f5ef' : '#101114',
            backgroundImage: showGrid
              ? isLight
                ? 'radial-gradient(rgba(0,0,0,0.18) 1px, transparent 0)'
                : 'radial-gradient(rgba(255,255,255,0.15) 1px, transparent 0)'
              : 'none',
            backgroundSize: '24px 24px',
          }}
        >
          {is3DMode && (
            <div
              ref={threeMountRef}
              style={{
                width: `${Math.min(doc.canvasWidth, 680)}px`,
                height: `${Math.min(doc.canvasHeight, 680)}px`,
              }}
              className="flex items-center justify-center"
            />
          )}
          <div
            aria-hidden={is3DMode}
            className={is3DMode ? 'pointer-events-none absolute -left-[10000px] top-0' : ''}
          >
            {/* Zoom Wrapper */}
            <div
              style={{
                transform: `scale(${is3DMode ? 1 : zoom})`,
                transformOrigin: 'center center',
                transition: 'transform 0.1s ease-out',
              }}
              className="relative"
            >
              {/* The Actual Scaled Canvas */}
              <div
                ref={canvasElementRef}
                id="aesthetic-card-canvas"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedId(null);
              }}
              style={{
                width: `${doc.canvasWidth}px`,
                height: `${doc.canvasHeight}px`,
                backgroundColor: doc.background || '#ffffff',
                boxShadow: isLight
                  ? '0 8px 18px -14px rgba(41, 39, 34, 0.28), 0 0 0 1px rgba(41, 39, 34, 0.12)'
                  : '0 14px 28px -18px rgba(0, 0, 0, 0.56), 0 0 0 1px rgba(226, 217, 200, 0.08)',
              }}
              className="relative overflow-hidden shrink-0 transition-colors"
            >
              {/* Magnetic Smart Snap Guide Lines */}
              {snapGuides.map((guide, idx) => (
                <div
                  key={idx}
                  style={{
                    position: 'absolute',
                    ...(guide.orientation === 'x'
                      ? { left: `${guide.pos}px`, top: 0, bottom: 0, width: 1 }
                      : { top: `${guide.pos}px`, left: 0, right: 0, height: 1 }),
                    backgroundColor: 'var(--app-accent)',
                    zIndex: 99999,
                    pointerEvents: 'none',
                    opacity: 0.8,
                  }}
                />
              ))}

              {/* Objects in Z-order */}
              {[...doc.objects]
                .sort((a, b) => a.zIndex - b.zIndex)
                .map((obj) => {
                  if (!obj.visible) return null;
                  const isSelected = obj.id === selectedId && !exporting;

                  return (
                    <div
                      key={obj.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedId(obj.id);
                      }}
                      onPointerDown={(e) => handleObjectPointerDown(e, obj)}
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        width: `${obj.width}px`,
                        height: `${obj.height}px`,
                        transform: `translate3d(${obj.x}px, ${obj.y}px, 0) rotate(${obj.rotation || 0}deg)`,
                        transformOrigin: 'center center',
                        zIndex: obj.zIndex,
                        cursor: obj.locked ? 'default' : editingTextId === obj.id ? 'text' : 'move',
                        touchAction: 'none',
                        willChange: isSelected ? 'transform' : undefined,
                      }}
                      className="group"
                    >
                      {/* 1. TEXT OBJECT */}
                      {obj.type === 'text' && (
                        editingTextId === obj.id ? (
                          <textarea
                            autoFocus
                            value={obj.text}
                            onChange={(e) => updateObject(obj.id, { text: e.target.value }, false)}
                            onBlur={() => {
                              setEditingTextId(null);
                              commitDocumentChange(docRef.current);
                            }}
                            onKeyDown={(e) => {
                              e.stopPropagation();
                              if (e.key === 'Escape') {
                                setEditingTextId(null);
                              } else if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                setEditingTextId(null);
                                commitDocumentChange(docRef.current);
                              }
                            }}
                            style={{
                              width: '100%',
                              height: '100%',
                              fontFamily: resolveCanvasFontFamily(obj.fontFamily),
                              fontSize: `${obj.fontSize}px`,
                              fontWeight: obj.fontWeight,
                              fontStyle: obj.fontStyle,
                              color: obj.color,
                              textAlign: obj.align,
                              lineHeight: obj.lineHeight,
                              letterSpacing: `${obj.letterSpacing}px`,
                              background: 'color-mix(in srgb, var(--app-accent) 8%, transparent)',
                              border: `2px dashed ${isLight ? '#24211b' : '#E2D9C8'}`,
                              borderRadius: '4px',
                              outline: 'none',
                              resize: 'none',
                              padding: '2px 4px',
                              margin: 0,
                              boxSizing: 'border-box',
                            }}
                          />
                        ) : (
                          <div
                            onDoubleClick={(e) => {
                              e.stopPropagation();
                              if (!obj.locked) setEditingTextId(obj.id);
                            }}
                            style={{
                              width: '100%',
                              height: '100%',
                              fontFamily: resolveCanvasFontFamily(obj.fontFamily),
                              fontSize: `${obj.fontSize}px`,
                              fontWeight: obj.fontWeight,
                              fontStyle: obj.fontStyle,
                              color: obj.color,
                              textAlign: obj.align,
                              lineHeight: obj.lineHeight,
                              letterSpacing: `${obj.letterSpacing}px`,
                              whiteSpace: 'pre-wrap',
                              wordBreak: 'break-word',
                              userSelect: 'none',
                            }}
                            className="flex items-center"
                            title="Double-click to edit text"
                          >
                            {obj.text}
                          </div>
                        )
                      )}

                      {/* 2. IMAGE OBJECT WITH PHOTO TREATMENT & CLIPPING MASKS */}
                      {obj.type === 'image' && (
                        <div
                          onDoubleClick={(e) => {
                            e.stopPropagation();
                            if (!obj.locked) {
                              pendingReplaceLayerIdRef.current = obj.id;
                              replaceFileInputRef.current?.click();
                            }
                          }}
                          title="Double-click to replace photo in-place"
                          style={{
                            width: '100%',
                            height: '100%',
                            opacity: obj.opacity,
                            borderRadius: obj.clipMask === 'circle' ? '50%' : `${obj.borderRadius}px`,
                            overflow: 'hidden',
                            ...(obj.clipMask === 'circle'
                              ? { clipPath: 'circle(50% at 50% 50%)' }
                              : obj.clipMask === 'oval'
                              ? { clipPath: 'ellipse(50% 50% at 50% 50%)' }
                              : obj.clipMask === 'star'
                              ? { clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }
                              : obj.clipMask === 'heart'
                              ? { clipPath: 'polygon(50% 15%, 65% 0%, 85% 0%, 100% 15%, 100% 35%, 50% 85%, 0% 35%, 0% 15%, 15% 0%, 35% 0%)' }
                              : obj.clipMask === 'id-frame'
                              ? {
                                  border: '1px solid rgba(0,0,0,0.3)',
                                  borderRadius: '6px',
                                  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.25), 0 2px 5px rgba(0,0,0,0.15)',
                                }
                              : {}),
                          }}
                        >
                          <img
                            src={obj.filteredSrc || obj.src}
                            alt={obj.name}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: obj.objectFit,
                              pointerEvents: 'none',
                            }}
                          />
                        </div>
                      )}

                      {/* 3. SHAPE & ACCENT STAMP OBJECTS */}
                      {obj.type === 'shape' && (
                        <div
                          style={{
                            width: '100%',
                            height: '100%',
                            opacity: obj.opacity,
                          }}
                        >
                          {/* Rectangle / Rounded Rect */}
                          {(obj.shape === 'rect' || obj.shape === 'rounded-rect') && (
                            <div
                              style={{
                                width: '100%',
                                height: '100%',
                                backgroundColor: obj.fill,
                                border: obj.strokeWidth
                                  ? `${obj.strokeWidth}px solid ${obj.stroke}`
                                  : 'none',
                                borderRadius:
                                  obj.shape === 'rounded-rect'
                                    ? `${obj.borderRadius || 16}px`
                                    : '0px',
                              }}
                            />
                          )}

                          {/* Circle */}
                          {obj.shape === 'circle' && (
                            <div
                              style={{
                                width: '100%',
                                height: '100%',
                                backgroundColor: obj.fill,
                                border: obj.strokeWidth
                                  ? `${obj.strokeWidth}px solid ${obj.stroke}`
                                  : 'none',
                                borderRadius: '50%',
                              }}
                            />
                          )}

                          {/* Line / Divider */}
                          {obj.shape === 'line' && (
                            <div
                              style={{
                                width: '100%',
                                height: '100%',
                                backgroundColor: obj.fill,
                              }}
                            />
                          )}

                          {/* Star SVG */}
                          {obj.shape === 'star' && (
                            <svg viewBox="0 0 100 100" className="w-full h-full">
                              <polygon
                                points="50,5 64,36 98,36 70,57 81,91 50,70 19,91 30,57 2,36 36,36"
                                fill={obj.fill}
                                stroke={obj.strokeWidth ? obj.stroke : 'none'}
                                strokeWidth={obj.strokeWidth}
                              />
                            </svg>
                          )}

                          {/* Heart SVG */}
                          {obj.shape === 'heart' && (
                            <svg viewBox="0 0 100 100" className="w-full h-full">
                              <path
                                d="M 50,85 C 20,60 5,40 5,25 C 5,10 20,5 35,5 C 43,5 50,15 50,15 C 50,15 57,5 65,5 C 80,5 95,10 95,25 C 95,40 80,60 50,85 Z"
                                fill={obj.fill}
                                stroke={obj.strokeWidth ? obj.stroke : 'none'}
                                strokeWidth={obj.strokeWidth}
                              />
                            </svg>
                          )}

                          {/* Rubber Stamp */}
                          {obj.shape === 'rubber-stamp' && (
                            <div
                              style={{
                                width: '100%',
                                height: '100%',
                                color: obj.fill || '#dc2626',
                                border: '3px dashed currentColor',
                                borderRadius: `${obj.borderRadius || 8}px`,
                              }}
                              className="flex items-center justify-center p-1.5 select-none"
                            >
                              <span className="font-mono font-black text-xs uppercase tracking-widest border-2 border-current px-2 py-0.5 text-center truncate">
                                {obj.stampText || 'APPROVED'}
                              </span>
                            </div>
                          )}

                          {/* Holographic Security Seal */}
                          {obj.shape === 'security-seal' && (
                            <div className="w-full h-full relative flex items-center justify-center select-none holographic-foil rounded-full shadow-lg p-2">
                              <svg viewBox="0 0 100 100" className="w-full h-full">
                                <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="3 2" />
                                <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="1" />
                                <text x="50" y="44" textAnchor="middle" fontSize="8" fontWeight="bold" fill="currentColor">
                                  OFFICIAL
                                </text>
                                <text x="50" y="56" textAnchor="middle" fontSize="6" fontWeight="600" fill="currentColor" letterSpacing="1">
                                  SECURE PASS
                                </text>
                                <circle cx="50" cy="50" r="49" fill="none" stroke="currentColor" strokeWidth="1.5" />
                              </svg>
                            </div>
                          )}

                          {/* Washi Masking Tape */}
                          {obj.shape === 'washi-tape' && (
                            <div
                              style={{
                                width: '100%',
                                height: '100%',
                                backgroundColor: obj.fill || '#fef08a',
                                opacity: obj.opacity ?? 0.8,
                                boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                                clipPath: 'polygon(0% 12%, 3% 0%, 6% 14%, 9% 0%, 91% 0%, 94% 12%, 97% 0%, 100% 12%, 100% 88%, 97% 100%, 94% 86%, 91% 100%, 9% 100%, 6% 86%, 3% 100%, 0% 88%)',
                              }}
                            />
                          )}

                          {/* 5-Star Rating Bar */}
                          {obj.shape === 'rating-stars' && (
                            <div className="w-full h-full flex items-center justify-center gap-1 select-none">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <svg
                                  key={star}
                                  viewBox="0 0 24 24"
                                  className="w-5 h-5"
                                  fill={(obj.starRating ?? 5) >= star ? (obj.fill || '#fcd535') : 'none'}
                                  stroke={obj.fill || '#fcd535'}
                                  strokeWidth="2"
                                >
                                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                </svg>
                              ))}
                            </div>
                          )}

                          {/* Audio Waveform Bar */}
                          {obj.shape === 'audio-waveform' && (
                            <div
                              style={{ color: obj.fill || '#10b981' }}
                              className="w-full h-full p-2 rounded-xl bg-black/10 border border-current/20 flex items-center gap-2 select-none"
                            >
                              <div className="w-6 h-6 rounded-full bg-current/20 flex items-center justify-center shrink-0">
                                <div className="w-0 h-0 border-y-4 border-y-transparent border-l-6 border-l-current ml-0.5" />
                              </div>
                              <div className="flex-1 flex items-center gap-1 h-6">
                                {[12, 18, 8, 22, 14, 20, 10, 24, 16, 22, 12, 18, 8, 16, 22, 14, 10, 20, 16].map((h, i) => (
                                  <div
                                    key={i}
                                    style={{ height: `${h}px` }}
                                    className="w-1 bg-current rounded-full"
                                  />
                                ))}
                              </div>
                              <span className="text-[10px] font-mono opacity-80 shrink-0">02:40</span>
                            </div>
                          )}

                          {/* Live Dynamic Barcode */}
                          {obj.shape === 'barcode' && (
                            <div className="w-full h-full flex items-center justify-center overflow-hidden">
                              <img
                                src={generateBarcodeSvg(obj.payload || 'ACS-94820', {
                                  fill: obj.fill,
                                  showLabel: obj.showTextLabel !== false,
                                })}
                                alt="Dynamic Barcode"
                                className="w-full h-full object-contain pointer-events-none"
                              />
                            </div>
                          )}

                          {/* Live Dynamic QR Code */}
                          {obj.shape === 'qr-code' && (
                            <div className="w-full h-full flex items-center justify-center overflow-hidden">
                              <img
                                src={generateQrCodeSvg(obj.payload || 'https://aestheticcardgenerator.pages.dev', {
                                  fill: obj.fill,
                                  showLabel: obj.showTextLabel,
                                })}
                                alt="Dynamic QR Code"
                                className="w-full h-full object-contain pointer-events-none"
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {/* ─────────────────────────────────────────────────── */}
                      {/* SELECTION OVERLAY & RESIZE/ROTATE HANDLES          */}
                      {/* ─────────────────────────────────────────────────── */}
                      {isSelected && !obj.locked && (
                        <div
                          style={{
                            position: 'absolute',
                            inset: -3,
                            border: `2px solid ${isLight ? '#24211b' : '#E2D9C8'}`,
                            pointerEvents: 'none',
                            zIndex: 9999,
                          }}
                        >
                          {/* Floating Contextual Quick Actions Toolbar (14px above layer/handles) */}
                          <div
                            onMouseDown={(e) => e.stopPropagation()}
                            onPointerDown={(e) => e.stopPropagation()}
                            style={{
                              top: obj.y >= 56
                                ? undefined
                                : obj.y + obj.height + 48 <= doc.canvasHeight
                                  ? 'calc(100% + 8px)'
                                  : 4,
                            }}
                            className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-0.5 px-2 py-1 rounded-xl bg-[#171513]/95 backdrop-blur-md border border-[#39342d] shadow-2xl z-[10000] pointer-events-auto select-none"
                          >
                            {obj.type === 'text' && (
                              <>
                                <button
                                  onClick={() => setEditingTextId(obj.id)}
                                  title="Edit text inline (or double-click text)"
                                  className="p-1 rounded-lg text-[var(--app-accent)] hover:text-[var(--app-text-primary)] hover:bg-white/10 transition-colors flex items-center gap-1 text-[10px] font-semibold cursor-pointer"
                                >
                                  <Type className="w-3.5 h-3.5" />
                                  <span>Edit</span>
                                </button>
                                <div className="w-px h-3 bg-white/20 mx-0.5" />
                              </>
                            )}
                            <button
                              onClick={() => duplicateObject(obj.id)}
                              title="Duplicate layer"
                              className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteObject(obj.id)}
                              title="Delete layer"
                              className="p-1 rounded-lg text-red-400 hover:text-red-300 hover:bg-white/10 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => updateObject(obj.id, { locked: true })}
                              title="Lock layer"
                              className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                            >
                              <Lock className="w-3.5 h-3.5" />
                            </button>
                            <div className="w-px h-3 bg-white/20 mx-0.5" />
                            <button
                              onClick={() => reorderObject(obj.id, 'up')}
                              title="Bring layer forward"
                              className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                            >
                              <ChevronDown className="w-3.5 h-3.5 rotate-180" />
                            </button>
                            <button
                              onClick={() => reorderObject(obj.id, 'down')}
                              title="Send layer backward"
                              className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                            <div className="w-px h-3 bg-white/20 mx-0.5" />
                            <button
                              onClick={() => handleAlign('hcenter')}
                              title="Center horizontally on canvas"
                              className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                            >
                              <AlignCenter className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleAlign('vmiddle')}
                              title="Center vertically on canvas"
                              className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                            >
                              <AlignVerticalJustifyCenter className="w-3.5 h-3.5" />
                            </button>
                            {obj.type === 'image' && (
                              <>
                                <div className="w-px h-3 bg-white/20 mx-0.5" />
                                <button
                                  onClick={() => {
                                    pendingReplaceLayerIdRef.current = obj.id;
                                    replaceFileInputRef.current?.click();
                                  }}
                                  title="Replace photo in-place"
                                  className="p-1 rounded-lg text-[var(--app-text-secondary)] hover:bg-white/10 transition-colors flex items-center gap-1 text-[10px] font-semibold cursor-pointer"
                                >
                                  <Upload className="w-3 h-3" />
                                  <span>Replace</span>
                                </button>
                                <button
                                  onClick={handleRemoveBackground}
                                  disabled={isRemovingBg}
                                  title="Offline AI background removal"
                                  className="p-1 rounded-lg text-[#24211b] dark:text-[#E2D9C8] hover:bg-white/10 transition-colors flex items-center gap-1 text-[10px] font-semibold disabled:opacity-50 cursor-pointer"
                                >
                                  <Wand2 className="w-3 h-3" />
                                  <span>{isRemovingBg ? `${bgProgress}%` : 'BG'}</span>
                                </button>
                              </>
                            )}
                          </div>

                          {/* Rotation handle protruding above */}
                          <div
                            onPointerDown={(e) => handleRotateHandlePointerDown(e, obj)}
                            style={{
                              position: 'absolute',
                              top: -26,
                              left: '50%',
                              transform: 'translateX(-50%)',
                              width: 14,
                              height: 14,
                              borderRadius: '50%',
                              backgroundColor: '#ffffff',
                              border: `2px solid ${isLight ? '#24211b' : '#E2D9C8'}`,
                              pointerEvents: 'auto',
                              cursor: 'grab',
                              touchAction: 'none',
                            }}
                            title="Rotate layer"
                          />
                          <div
                            style={{
                              position: 'absolute',
                              top: -14,
                              left: '50%',
                              transform: 'translateX(-50%)',
                              width: 1,
                              height: 12,
                              backgroundColor: isLight ? '#24211b' : '#E2D9C8',
                            }}
                          />

                          {/* 8 Resize Handles */}
                          {[
                            { pos: 'nw', top: -5, left: -5, cursor: 'nwse-resize' },
                            { pos: 'n', top: -5, left: '50%', cursor: 'ns-resize', transform: 'translateX(-50%)' },
                            { pos: 'ne', top: -5, right: -5, cursor: 'nesw-resize' },
                            { pos: 'e', top: 50 + '%', right: -5, cursor: 'ew-resize', transform: 'translateY(-50%)' },
                            { pos: 'se', bottom: -5, right: -5, cursor: 'nwse-resize' },
                            { pos: 's', bottom: -5, left: '50%', cursor: 'ns-resize', transform: 'translateX(-50%)' },
                            { pos: 'sw', bottom: -5, left: -5, cursor: 'nesw-resize' },
                            { pos: 'w', top: 50 + '%', left: -5, cursor: 'ew-resize', transform: 'translateY(-50%)' },
                          ].map((handle) => (
                            <div
                              key={handle.pos}
                              onPointerDown={(e) => handleResizeHandlePointerDown(e, handle.pos, obj)}
                              style={{
                                position: 'absolute',
                                width: 10,
                                height: 10,
                                backgroundColor: '#ffffff',
                                border: `2px solid ${isLight ? '#24211b' : '#E2D9C8'}`,
                                borderRadius: 2,
                                pointerEvents: 'auto',
                                touchAction: 'none',
                                ...handle,
                              }}
                            />
                          ))}
                        </div>
                      )}

                      {/* If locked, display lock badge & quick unlock button */}
                      {isSelected && obj.locked && (
                        <div
                          onMouseDown={(e) => e.stopPropagation()}
                          className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#171513]/95 backdrop-blur-md border border-[#39342d] shadow-2xl z-[10000] pointer-events-auto select-none"
                        >
                          <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Locked
                          </span>
                          <button
                            onClick={() => updateObject(obj.id, { locked: false })}
                            className="ml-1 px-1.5 py-0.5 text-[10px] rounded bg-white/10 hover:bg-white/20 text-white font-semibold cursor-pointer"
                          >
                            Unlock
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
          </div>
        </main>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* RIGHT SIDEBAR: Inspector & Layers (Desktop)                         */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <aside
          className={`hidden lg:flex min-h-0 w-80 border-l flex-col shrink-0 transition-colors z-20 ${
            isLight ? 'bg-white border-[#e3ddd3]' : 'bg-[#171513] border-[#29251f]'
          }`}
        >
          {/* Sidebar Tabs */}
          <div className="flex border-b border-[#39342d]/40 p-1">
            <button
              onClick={() => setActiveSidebarTab('inspector')}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                activeSidebarTab === 'inspector'
                  ? isLight
                    ? 'bg-[var(--app-accent)] text-white shadow-sm'
                    : 'bg-[#29251f] text-white shadow-sm border border-[#444748]'
                  : 'text-[#81786d] hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Inspector</span>
            </button>
            <button
              onClick={() => setActiveSidebarTab('layers')}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                activeSidebarTab === 'layers'
                  ? isLight
                    ? 'bg-[var(--app-accent)] text-white shadow-sm'
                    : 'bg-[#29251f] text-white shadow-sm border border-[#444748]'
                  : 'text-[#81786d] hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Layers ({doc.objects.length})</span>
            </button>
            <button
              onClick={() => setActiveSidebarTab('recycle')}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                activeSidebarTab === 'recycle'
                  ? isLight
                    ? 'bg-[var(--app-accent)] text-white shadow-sm'
                    : 'bg-[#29251f] text-white shadow-sm border border-[#444748]'
                  : 'text-[#81786d] hover:text-white'
              }`}
              title="Saved Clips & Recycle Tray (Notebook Page 3)"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[var(--app-accent)]" />
              <span>Clips</span>
            </button>
          </div>

          {/* TAB 1: PROPERTIES INSPECTOR */}
          {activeSidebarTab === 'inspector' && (
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
              {/* A. If Object is Selected: Object Properties */}
              {selectedObject ? (
                <>
                  {/* Object Header: Name & Quick Actions */}
                  <div className="sticky top-0 z-10 -mx-4 px-4 py-2 flex items-center justify-between border-b border-[#39342d]/30 bg-[var(--app-surface)]">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#81786d]">
                        {selectedObject.type} Layer
                      </span>
                      <h4 className="text-sm font-semibold truncate max-w-[170px]">
                        {selectedObject.name}
                      </h4>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          updateObject(selectedObject.id, { locked: !selectedObject.locked })
                        }
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                          selectedObject.locked
                            ? isLight
                              ? 'bg-[#24211b] text-white border-[#24211b]'
                              : 'bg-[#E2D9C8] text-[#24211b] border-[#E2D9C8]'
                            : isLight
                            ? 'border-[#e3ddd3] text-[#81786d] hover:bg-[#f0ece4]'
                            : 'border-[#39342d] text-[#81786d] hover:bg-[#211e19]'
                        }`}
                        title={selectedObject.locked ? 'Unlock' : 'Lock position'}
                      >
                        {selectedObject.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => duplicateObject(selectedObject.id)}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                          isLight
                            ? 'border-[#e3ddd3] text-[#81786d] hover:bg-[#f0ece4]'
                            : 'border-[#39342d] text-[#81786d] hover:bg-[#211e19]'
                        }`}
                        title="Duplicate layer (⌘D)"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteObject(selectedObject.id)}
                        aria-label={`Delete ${selectedObject.name}`}
                        className={`px-2 py-1.5 rounded-lg border text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer flex items-center gap-1.5 text-xs ${
                          isLight ? 'border-[#e3ddd3]' : 'border-[#39342d]'
                        }`}
                        title="Delete layer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>

                  {/* Quick Alignment Toolbar */}
                  <div className="flex flex-col gap-1.5 pb-2 border-b border-[#39342d]/20">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#81786d]">Alignment</span>
                      <span className="text-[10px] font-mono opacity-50">Canvas Snap</span>
                    </div>
                    <div className={`grid grid-cols-6 gap-1 p-1 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/20 border-white/10'}`}>
                      <button onClick={() => handleAlign('left')} title="Align Left" className="p-1.5 rounded-lg flex items-center justify-center hover:bg-black/10 text-[#81786d] hover:text-white cursor-pointer"><AlignLeft className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleAlign('hcenter')} title="Align Horizontal Center" className="p-1.5 rounded-lg flex items-center justify-center hover:bg-black/10 text-[#81786d] hover:text-white cursor-pointer"><AlignCenter className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleAlign('right')} title="Align Right" className="p-1.5 rounded-lg flex items-center justify-center hover:bg-black/10 text-[#81786d] hover:text-white cursor-pointer"><AlignRight className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleAlign('top')} title="Align Top" className="p-1.5 rounded-lg flex items-center justify-center hover:bg-black/10 text-[#81786d] hover:text-white cursor-pointer"><AlignVerticalJustifyStart className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleAlign('vmiddle')} title="Align Vertical Middle" className="p-1.5 rounded-lg flex items-center justify-center hover:bg-black/10 text-[#81786d] hover:text-white cursor-pointer"><AlignVerticalJustifyCenter className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleAlign('bottom')} title="Align Bottom" className="p-1.5 rounded-lg flex items-center justify-center hover:bg-black/10 text-[#81786d] hover:text-white cursor-pointer"><AlignVerticalJustifyEnd className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>

                  {/* Transform Grid (X, Y, W, H, Rotate) */}
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-semibold text-[#81786d]">Transform & Dimensions</span>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <div className="flex items-center gap-2 p-2 rounded-lg border border-[#39342d]/40">
                        <span className="text-[#81786d]">X</span>
                        <input
                          type="number"
                          value={selectedObject.x}
                          onChange={(e) =>
                            updateObject(selectedObject.id, { x: Number(e.target.value) || 0 })
                          }
                          className="w-full bg-transparent focus:outline-none"
                        />
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded-lg border border-[#39342d]/40">
                        <span className="text-[#81786d]">Y</span>
                        <input
                          type="number"
                          value={selectedObject.y}
                          onChange={(e) =>
                            updateObject(selectedObject.id, { y: Number(e.target.value) || 0 })
                          }
                          className="w-full bg-transparent focus:outline-none"
                        />
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded-lg border border-[#39342d]/40">
                        <span className="text-[#81786d]">W</span>
                        <input
                          type="number"
                          value={selectedObject.width}
                          onChange={(e) =>
                            updateObject(selectedObject.id, { width: Math.max(10, Number(e.target.value) || 10) })
                          }
                          className="w-full bg-transparent focus:outline-none"
                        />
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded-lg border border-[#39342d]/40">
                        <span className="text-[#81786d]">H</span>
                        <input
                          type="number"
                          value={selectedObject.height}
                          onChange={(e) =>
                            updateObject(selectedObject.id, { height: Math.max(10, Number(e.target.value) || 10) })
                          }
                          className="w-full bg-transparent focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs p-2 rounded-lg border border-[#39342d]/40">
                      <span className="text-[#81786d]">Rotation Angle</span>
                      <div className="flex items-center gap-1 font-mono">
                        <input
                          type="number"
                          value={selectedObject.rotation || 0}
                          onChange={(e) =>
                            updateObject(selectedObject.id, { rotation: Number(e.target.value) || 0 })
                          }
                          className="w-12 text-right bg-transparent focus:outline-none"
                        />
                        <span>°</span>
                      </div>
                    </div>
                  </div>

                  {/* ──────────────────────────────────────────────────────── */}
                  {/* TYPE-SPECIFIC CONTROLS                                   */}
                  {/* ──────────────────────────────────────────────────────── */}

                  {/* TEXT INSPECTOR */}
                  {selectedObject.type === 'text' && (
                    <div className="flex flex-col gap-3">
                      <span className="text-xs font-semibold text-[#81786d]">Typography & Content</span>
                      {/* Text content textarea */}
                      <textarea
                        value={selectedObject.text}
                        onChange={(e) => updateObject(selectedObject.id, { text: e.target.value })}
                        rows={3}
                        className={`w-full p-2.5 rounded-xl text-xs border focus:outline-none focus:border-[var(--app-accent)] leading-relaxed ${
                          isLight ? 'bg-[#f8f5ef] border-[#d4cdbf]' : 'bg-[#211e19] border-[#39342d]'
                        }`}
                        placeholder="Type text here..."
                      />

                      {/* Font Family */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] text-[#81786d]">Font Family</label>
                        <select
                          value={resolveCanvasFontFamily(selectedObject.fontFamily)}
                          onChange={(e) => updateObject(selectedObject.id, { fontFamily: e.target.value })}
                          className={`w-full p-2 rounded-lg text-xs border focus:outline-none ${
                            isLight ? 'bg-[#f8f5ef] border-[#d4cdbf]' : 'bg-[#211e19] border-[#39342d]'
                          }`}
                        >
                          <option value={DEFAULT_CANVAS_FONT_FAMILY}>System Sans (Local)</option>
                          <option value="'Newsreader', Georgia, serif">Newsreader (Editorial Serif)</option>
                          <option value="'Playfair Display', Georgia, serif">Playfair Display (Display Serif)</option>
                          <option value="'JetBrains Mono', monospace">JetBrains Mono (Technical)</option>
                          <option value="'Plus Jakarta Sans', sans-serif">Plus Jakarta Sans (Geometric)</option>
                        </select>
                      </div>

                      {/* Font Size & Weight */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col gap-1">
                          <label className="text-[11px] text-[#81786d]">Size ({selectedObject.fontSize}px)</label>
                          <input
                            type="range"
                            min={10}
                            max={96}
                            value={selectedObject.fontSize}
                            onChange={(e) => updateObject(selectedObject.id, { fontSize: Number(e.target.value) })}
                            className="w-full accent-[var(--app-accent)]"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[11px] text-[#81786d]">Weight</label>
                          <select
                            value={selectedObject.fontWeight}
                            onChange={(e) =>
                              updateObject(selectedObject.id, {
                                fontWeight: e.target.value as TextCanvasObject['fontWeight'],
                              })
                            }
                            className={`w-full p-1.5 rounded-lg text-xs border focus:outline-none ${
                              isLight ? 'bg-[#f8f5ef] border-[#d4cdbf]' : 'bg-[#211e19] border-[#39342d]'
                            }`}
                          >
                            <option value="400">Regular (400)</option>
                            <option value="500">Medium (500)</option>
                            <option value="600">Semibold (600)</option>
                            <option value="700">Bold (700)</option>
                            <option value="800">Extra Bold (800)</option>
                            <option value="900">Black (900)</option>
                          </select>
                        </div>
                      </div>

                      {/* Color & Alignment */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <label className="text-[11px] text-[#81786d]">Color</label>
                          <input
                            type="color"
                            value={selectedObject.color}
                            onChange={(e) => updateObject(selectedObject.id, { color: e.target.value })}
                            className="w-7 h-7 rounded-lg border border-transparent cursor-pointer"
                          />
                        </div>

                        <div className="flex items-center gap-1 border rounded-lg p-0.5 border-[#39342d]/40">
                          {(['left', 'center', 'right'] as const).map((align) => (
                            <button
                              key={align}
                              onClick={() => updateObject(selectedObject.id, { align })}
                              className={`px-2 py-1 rounded text-[11px] font-semibold capitalize transition-colors cursor-pointer ${
                                selectedObject.align === align
                                  ? isLight
                                    ? 'bg-[var(--app-accent)] text-white'
                                    : 'bg-[#29251f] text-white'
                                  : 'text-[#81786d]'
                              }`}
                            >
                              {align}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Italic Toggle */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#81786d]">Italic Style</span>
                        <button
                          onClick={() =>
                            updateObject(selectedObject.id, {
                              fontStyle: selectedObject.fontStyle === 'italic' ? 'normal' : 'italic',
                            })
                          }
                          className={`px-3 py-1 rounded-lg border text-xs font-semibold cursor-pointer ${
                            selectedObject.fontStyle === 'italic'
                              ? 'bg-[#E2D9C8] text-[#24211b] border-[#E2D9C8]'
                              : isLight
                              ? 'border-[#e3ddd3]'
                              : 'border-[#39342d]'
                          }`}
                        >
                          {selectedObject.fontStyle === 'italic' ? 'Italic Active' : 'Normal'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* IMAGE INSPECTOR */}
                  {selectedObject.type === 'image' && (
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#81786d]">Photo Treatment</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleRemoveBackground}
                            disabled={isRemovingBg}
                            className="text-[11px] font-semibold text-[#24211b] dark:text-[#E2D9C8] hover:underline cursor-pointer flex items-center gap-1 disabled:opacity-50"
                            title="Offline AI background removal"
                          >
                            <Wand2 className="w-3 h-3" />
                            <span>{isRemovingBg ? `${bgProgress}%` : 'Remove BG'}</span>
                          </button>
                          <button
                            onClick={() => replaceFileInputRef.current?.click()}
                            className="text-[11px] font-semibold text-[var(--app-text-secondary)] hover:underline cursor-pointer flex items-center gap-1"
                            title="Replace image in-place keeping layout and crop"
                          >
                            <Upload className="w-3 h-3" />
                            <span>Replace</span>
                          </button>
                        </div>
                      </div>

                      {/* One-Click Aesthetic Filters */}
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-[#81786d]">Aesthetic Filters</span>
                          <Wand2 className="w-3 h-3 text-[#24211b] dark:text-[#E2D9C8]" />
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          {[
                            { id: 'original' as ImageFilterPreset, name: 'Original' },
                            { id: 'dither' as ImageFilterPreset, name: '1-Bit Dither' },
                            { id: 'photocopy' as ImageFilterPreset, name: 'Photocopy' },
                            { id: 'duotone' as ImageFilterPreset, name: 'Duotone' },
                            { id: 'warm90s' as ImageFilterPreset, name: 'Warm 90s Film' },
                          ].map((f) => (
                            <button
                              key={f.id}
                              onClick={async () => {
                                const processed = await processImageFilter(selectedObject.src, f.id);
                                updateObject(selectedObject.id, { filterPreset: f.id, filteredSrc: processed });
                                showToast(`Applied ${f.name} filter`);
                              }}
                              className={`p-2 rounded-xl text-left border text-xs font-semibold cursor-pointer transition-all ${
                                selectedObject.filterPreset === f.id || (!selectedObject.filterPreset && f.id === 'original')
                                  ? 'border-[#E2D9C8] bg-[#E2D9C8]/10 text-[#E2D9C8] ring-1 ring-[#E2D9C8]'
                                  : isLight ? 'border-slate-200 hover:bg-slate-50' : 'border-[#39342d] hover:bg-[#211e19]'
                              }`}
                            >
                              <span className="truncate block">{f.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Shape Clipping Masks */}
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-[#81786d]">Shape Clipping Mask</span>
                          <Crop className="w-3 h-3 text-[var(--app-text-secondary)]" />
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          {[
                            { id: 'none' as ImageClipMask, label: 'None' },
                            { id: 'circle' as ImageClipMask, label: 'Circle' },
                            { id: 'oval' as ImageClipMask, label: 'Oval' },
                            { id: 'star' as ImageClipMask, label: 'Star' },
                            { id: 'heart' as ImageClipMask, label: 'Heart' },
                            { id: 'id-frame' as ImageClipMask, label: 'ID Frame' },
                          ].map((mask) => (
                            <button
                              key={mask.id}
                              onClick={() => updateObject(selectedObject.id, { clipMask: mask.id })}
                              className={`py-1.5 px-1 rounded-lg text-[11px] font-semibold border text-center cursor-pointer transition-all ${
                                (selectedObject.clipMask || 'none') === mask.id
                                  ? isLight
                                    ? 'border-[#24211b] bg-[#24211b]/5 text-[#24211b] ring-1 ring-[#24211b]'
                                    : 'border-[#E2D9C8] bg-[#E2D9C8]/10 text-[#E2D9C8] ring-1 ring-[#E2D9C8]'
                                  : isLight ? 'border-slate-200 text-slate-700 hover:bg-slate-50' : 'border-[#39342d] text-[#81786d] hover:bg-[#211e19]'
                              }`}
                            >
                              {mask.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Fit Mode */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] text-[#81786d]">Fit Mode</label>
                        <div className="flex gap-1">
                          {(['cover', 'contain', 'fill'] as const).map((fit) => (
                            <button
                              key={fit}
                              onClick={() => updateObject(selectedObject.id, { objectFit: fit })}
                              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize border cursor-pointer ${
                                selectedObject.objectFit === fit
                                  ? 'bg-[#E2D9C8] text-[#24211b] border-[#E2D9C8]'
                                  : isLight
                                  ? 'border-[#e3ddd3] text-[#81786d]'
                                  : 'border-[#39342d] text-[#81786d]'
                              }`}
                            >
                              {fit}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Photo Crop, Zoom & Pan (Bug 10 Fix) */}
                      <div className="flex flex-col gap-2 p-2.5 rounded-xl border border-current/10 bg-black/5 dark:bg-white/5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-[#81786d]">Crop & Pan Alignment</span>
                          <span className="text-[10px] font-mono opacity-65">{((selectedObject as any).zoomScale || 1).toFixed(1)}x</span>
                        </div>

                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between text-[10px] text-[#81786d]">
                            <span>Zoom ({((selectedObject as any).zoomScale || 1).toFixed(1)}x)</span>
                            <button
                              onClick={() => updateObject(selectedObject.id, { zoomScale: 1, panX: 0, panY: 0 } as any)}
                              className="text-[#24211b] dark:text-[#E2D9C8] hover:underline cursor-pointer"
                            >
                              Reset
                            </button>
                          </div>
                          <input
                            type="range"
                            min={1}
                            max={3}
                            step={0.05}
                            value={(selectedObject as any).zoomScale || 1}
                            onChange={(e) => updateObject(selectedObject.id, { zoomScale: Number(e.target.value) } as any)}
                            className="w-full accent-[#24211b] dark:accent-[#E2D9C8]"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] text-[#81786d]">Pan X ({(selectedObject as any).panX || 0}%)</span>
                            <input
                              type="range"
                              min={-50}
                              max={50}
                              value={(selectedObject as any).panX || 0}
                              onChange={(e) => updateObject(selectedObject.id, { panX: Number(e.target.value) } as any)}
                              className="w-full accent-[var(--app-accent)]"
                            />
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] text-[#81786d]">Pan Y ({(selectedObject as any).panY || 0}%)</span>
                            <input
                              type="range"
                              min={-50}
                              max={50}
                              value={(selectedObject as any).panY || 0}
                              onChange={(e) => updateObject(selectedObject.id, { panY: Number(e.target.value) } as any)}
                              className="w-full accent-[var(--app-accent)]"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Corner Radius & Opacity */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] text-[#81786d]">
                          Corner Radius ({selectedObject.borderRadius}px)
                        </label>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={selectedObject.borderRadius}
                          onChange={(e) => updateObject(selectedObject.id, { borderRadius: Number(e.target.value) })}
                          className="w-full accent-[var(--app-accent)]"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] text-[#81786d]">
                          Opacity ({Math.round(selectedObject.opacity * 100)}%)
                        </label>
                        <input
                          type="range"
                          min={0.1}
                          max={1}
                          step={0.05}
                          value={selectedObject.opacity}
                          onChange={(e) => updateObject(selectedObject.id, { opacity: Number(e.target.value) })}
                          className="w-full accent-[var(--app-accent)]"
                        />
                      </div>
                    </div>
                  )}

                  {/* SHAPE INSPECTOR */}
                  {selectedObject.type === 'shape' && (
                    <div className="flex flex-col gap-3">
                      <span className="text-xs font-semibold text-[#81786d]">Shape & Colors</span>
                      {/* Fill & Stroke */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2">
                          <label className="text-[11px] text-[#81786d]">Fill</label>
                          <input
                            type="color"
                            value={selectedObject.fill}
                            onChange={(e) => updateObject(selectedObject.id, { fill: e.target.value })}
                            className="w-7 h-7 rounded-lg cursor-pointer"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-[11px] text-[#81786d]">Border</label>
                          <input
                            type="color"
                            value={selectedObject.stroke || '#000000'}
                            onChange={(e) => updateObject(selectedObject.id, { stroke: e.target.value })}
                            className="w-7 h-7 rounded-lg cursor-pointer"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] text-[#81786d]">
                          Border Width ({selectedObject.strokeWidth}px)
                        </label>
                        <input
                          type="range"
                          min={0}
                          max={20}
                          value={selectedObject.strokeWidth}
                          onChange={(e) => updateObject(selectedObject.id, { strokeWidth: Number(e.target.value) })}
                          className="w-full accent-[var(--app-accent)]"
                        />
                      </div>

                      {selectedObject.shape === 'rounded-rect' && (
                        <div className="flex flex-col gap-1">
                          <label className="text-[11px] text-[#81786d]">
                            Corner Radius ({selectedObject.borderRadius}px)
                          </label>
                          <input
                            type="range"
                            min={0}
                            max={60}
                            value={selectedObject.borderRadius}
                            onChange={(e) => updateObject(selectedObject.id, { borderRadius: Number(e.target.value) })}
                            className="w-full accent-[var(--app-accent)]"
                          />
                        </div>
                      )}

                      {/* Rubber Stamp Text Control */}
                      {selectedObject.shape === 'rubber-stamp' && (
                        <div className="flex flex-col gap-1 pt-1">
                          <label className="text-[11px] text-[#81786d]">Rubber Stamp Text</label>
                          <input
                            type="text"
                            value={selectedObject.stampText || 'APPROVED'}
                            onChange={(e) => updateObject(selectedObject.id, { stampText: e.target.value.toUpperCase() })}
                            className={`w-full px-2.5 py-1.5 text-xs font-mono font-bold rounded-lg border focus:outline-none ${
                              isLight ? 'bg-white border-[#d4cdbf]' : 'bg-[#211e19] border-[#39342d]'
                            }`}
                            placeholder="e.g. APPROVED / VIP / REJECTED"
                          />
                        </div>
                      )}

                      {/* 5-Star Rating Control */}
                      {selectedObject.shape === 'rating-stars' && (
                        <div className="flex flex-col gap-1 pt-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[#81786d]">Star Rating ({selectedObject.starRating ?? 5.0} / 5.0)</span>
                          </div>
                          <input
                            type="range"
                            min="0.5"
                            max="5.0"
                            step="0.5"
                            value={selectedObject.starRating ?? 5.0}
                            onChange={(e) => updateObject(selectedObject.id, { starRating: Number(e.target.value) })}
                            className="w-full accent-[#24211b] dark:accent-[#E2D9C8] cursor-pointer"
                          />
                        </div>
                      )}

                      {/* Live Barcode / QR Code Payload Binding */}
                      {(selectedObject.shape === 'barcode' || selectedObject.shape === 'qr-code') && (
                        <div className="flex flex-col gap-2 p-2.5 rounded-xl border border-current/15 bg-black/10 pt-2">
                          <div className="flex items-center justify-between text-xs font-semibold">
                            <span>{selectedObject.shape === 'qr-code' ? 'Live QR Payload' : 'Live Barcode Payload'}</span>
                            <span className="text-[10px] text-[#24211b] dark:text-[#E2D9C8] font-mono">Real-time SVG</span>
                          </div>
                          <input
                            type="text"
                            value={selectedObject.payload || ''}
                            onChange={(e) => updateObject(selectedObject.id, { payload: e.target.value })}
                            className={`w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border focus:outline-none ${
                              isLight ? 'bg-white border-[#d4cdbf]' : 'bg-[#211e19] border-[#39342d]'
                            }`}
                            placeholder={selectedObject.shape === 'qr-code' ? 'Enter URL or text...' : 'e.g. ACS-94820'}
                          />
                          <label className="flex items-center gap-2 cursor-pointer pt-1">
                            <input
                              type="checkbox"
                              checked={selectedObject.showTextLabel ?? (selectedObject.shape === 'barcode')}
                              onChange={(e) => updateObject(selectedObject.id, { showTextLabel: e.target.checked })}
                              className="accent-[#24211b] dark:accent-[#E2D9C8] w-3.5 h-3.5 cursor-pointer"
                            />
                            <span className="text-[11px] text-[#81786d]">Show human-readable text label underneath</span>
                          </label>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Stacking Order buttons */}
                  <div className="flex flex-col gap-2 pt-3 border-t border-[#39342d]/30">
                    <span className="text-xs font-semibold text-[#81786d]">Stacking Order</span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button
                        onClick={() => reorderObject(selectedObject.id, 'front')}
                        className={`p-2 rounded-lg border font-medium cursor-pointer ${
                          isLight ? 'border-[#e3ddd3] hover:bg-[#f0ece4]' : 'border-[#39342d] hover:bg-[#211e19]'
                        }`}
                      >
                        Bring to Front
                      </button>
                      <button
                        onClick={() => reorderObject(selectedObject.id, 'back')}
                        className={`p-2 rounded-lg border font-medium cursor-pointer ${
                          isLight ? 'border-[#e3ddd3] hover:bg-[#f0ece4]' : 'border-[#39342d] hover:bg-[#211e19]'
                        }`}
                      >
                        Send to Back
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                /* B. Nothing Selected: CANVAS & DOCUMENT PROPERTIES */
                <div className="flex flex-col gap-5">
                  <div className={`border p-3 ${isLight ? 'border-[#e3ddd3] bg-[#f8f5ef]' : 'border-[#39342d] bg-[#211e19]'}`}>
                    <h4 className="text-sm font-semibold text-[var(--app-text-primary)]">Quick start</h4>
                    <ol className="mt-2 space-y-1.5 text-xs leading-relaxed text-[var(--app-text-secondary)]">
                      <li><span className="font-semibold text-[var(--app-text-primary)]">1.</span> Choose <strong>Add</strong> to place text, a photo, or a shape.</li>
                      <li><span className="font-semibold text-[var(--app-text-primary)]">2.</span> Select an item to edit it here or on the canvas.</li>
                      <li><span className="font-semibold text-[var(--app-text-primary)]">3.</span> Use <strong>Delete</strong> to remove it, or Undo to restore it.</li>
                    </ol>
                  </div>
                  <div className="pb-3 border-b border-[#39342d]/30">
                    <h4 className="text-base font-semibold">Canvas</h4>
                  </div>

                  {/* Canvas Presets */}
                  <details>
                    <summary className={`list-none flex items-center justify-between py-2 text-xs font-semibold cursor-pointer ${
                      isLight ? 'text-[#6b6257]' : 'text-[#a0a5ad]'
                    }`}>
                      <span>Canvas size</span>
                      <span className="font-mono text-[11px]">{doc.canvasWidth} × {doc.canvasHeight}</span>
                    </summary>
                    <div className="flex flex-col gap-1.5 mt-1">
                      {CANVAS_DIMENSION_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          onClick={() => {
                            const resizedLayers = normalizeTemplateDimensions(
                              doc.objects as any,
                              doc.canvasWidth,
                              doc.canvasHeight,
                              preset.width,
                              preset.height
                            );
                            commitDocumentChange({
                              ...doc,
                              canvasWidth: preset.width,
                              canvasHeight: preset.height,
                              objects: resizedLayers as any,
                            });
                            showToast(`Resized canvas to ${preset.label} (${preset.width}×${preset.height}px) with smart reflow!`);
                          }}
                          className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                            doc.canvasWidth === preset.width && doc.canvasHeight === preset.height
                              ? isLight
                                ? 'border-[#24211b] bg-[#24211b]/5 text-[#24211b] font-semibold'
                                : 'border-[#E2D9C8] bg-[#E2D9C8]/10 text-[#E2D9C8] font-semibold'
                              : isLight
                              ? 'border-[#e3ddd3] hover:bg-[#f8f5ef]'
                              : 'border-[#39342d] hover:bg-[#211e19]'
                          }`}
                        >
                          <div>
                            <div className="text-xs font-semibold">{preset.label}</div>
                            <div className="text-[10px] text-[#81786d]">{preset.description}</div>
                          </div>
                          <span className="text-[10px] font-mono text-[#81786d]">
                            {preset.width}×{preset.height}
                          </span>
                        </button>
                      ))}
                      <button
                        onClick={handleFitCardToCanvas}
                        className={`w-full mt-2 p-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                          isLight
                            ? 'border-[#24211b]/30 bg-[#24211b]/5 text-[#24211b] hover:bg-[#24211b]/10'
                            : 'border-[#E2D9C8]/30 bg-[#E2D9C8]/5 text-[#E2D9C8] hover:bg-[#E2D9C8]/10'
                        }`}
                        title="Fit all card elements to fill current canvas dimensions"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>Fit Content to Canvas</span>
                      </button>
                    </div>
                  </details>

                  {/* Custom Canvas Width & Height */}
                  <details>
                    <summary className={`py-2 text-xs font-semibold cursor-pointer ${
                      isLight ? 'text-[#6b6257]' : 'text-[#a0a5ad]'
                    }`}>Custom dimensions</summary>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono mt-1">
                      <div className="flex items-center gap-2 p-2 rounded-lg border border-[#39342d]/40">
                        <span className="text-[#81786d]">W</span>
                        <input
                          type="number"
                          value={doc.canvasWidth}
                          onChange={(e) =>
                            commitDocumentChange({
                              ...doc,
                              canvasWidth: Math.max(300, Math.min(3840, Number(e.target.value) || 960)),
                            })
                          }
                          className="w-full bg-transparent focus:outline-none"
                        />
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded-lg border border-[#39342d]/40">
                        <span className="text-[#81786d]">H</span>
                        <input
                          type="number"
                          value={doc.canvasHeight}
                          onChange={(e) =>
                            commitDocumentChange({
                              ...doc,
                              canvasHeight: Math.max(300, Math.min(3840, Number(e.target.value) || 600)),
                            })
                          }
                          className="w-full bg-transparent focus:outline-none"
                        />
                      </div>
                    </div>
                  </details>

                  {/* Background Color */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-[#81786d]">Canvas Background</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={doc.background || '#ffffff'}
                        onChange={(e) => commitDocumentChange({ ...doc, background: e.target.value })}
                        className="w-8 h-8 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={doc.background}
                        onChange={(e) => commitDocumentChange({ ...doc, background: e.target.value })}
                        className={`flex-1 p-2 rounded-lg text-xs font-mono border focus:outline-none ${
                          isLight ? 'bg-[#f8f5ef] border-[#d4cdbf]' : 'bg-[#211e19] border-[#39342d]'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Quick Color Presets */}
                  <details>
                    <summary className={`py-2 text-xs font-semibold cursor-pointer ${
                      isLight ? 'text-[#6b6257]' : 'text-[#a0a5ad]'
                    }`}>Color presets</summary>
                    <div className="grid grid-cols-6 gap-1.5 mt-1">
                    {[
                      '#ffffff',
                      '#f4ede4',
                      '#f8f8f8',
                      '#fff0f3',
                      '#f2effe',
                      '#111111',
                      '#171513',
                      '#e4ff37',
                      '#efe5cb',
                      '#f2f8f4',
                      'var(--app-accent-hover)',
                      '#0a0a0a',
                    ].map((c) => (
                      <button
                        key={c}
                        onClick={() => commitDocumentChange({ ...doc, background: c })}
                        style={{ backgroundColor: c }}
                        className="w-8 h-8 rounded-lg border border-black/20 hover:scale-110 transition-transform cursor-pointer"
                        title={c}
                      />
                    ))}
                    </div>
                  </details>

                </div>
              )}
            </div>
          )}

          {/* TAB 2: LAYERS PANEL (Grouped Folders & Flat View - Leftover Item 5) */}
          {activeSidebarTab === 'layers' && (
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
              {/* Header with View Toggle */}
              <div className="flex items-center justify-between px-1 py-1 text-xs">
                <div className="flex items-center gap-1 bg-black/10 dark:bg-white/10 p-0.5 rounded-lg">
                  <button
                    onClick={() => setLayerViewMode('folders')}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                      layerViewMode === 'folders'
                        ? 'bg-[#E2D9C8] text-[#24211b] shadow-sm'
                        : 'text-[#81786d] hover:text-white'
                    }`}
                  >
                    Folders (4)
                  </button>
                  <button
                    onClick={() => setLayerViewMode('flat')}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                      layerViewMode === 'flat'
                        ? 'bg-[#E2D9C8] text-[#24211b] shadow-sm'
                        : 'text-[#81786d] hover:text-white'
                    }`}
                  >
                    Stacking
                  </button>
                </div>
                <span className="text-[11px] font-mono text-[#81786d]">
                  {doc.objects.length} Layers
                </span>
              </div>

              {doc.objects.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#81786d]">
                  No layers on canvas yet. Click Text, Photo, or Box on the left toolbar to add your first object.
                </div>
              ) : layerViewMode === 'folders' ? (
                /* Grouped 4-Folder Architecture */
                <div className="flex flex-col gap-2">
                  {/* Folder 1: Profile Photo & Avatar */}
                  {(() => {
                    const photos = doc.objects.filter(
                      (o) => o.type === 'image' && !o.name.toLowerCase().includes('barcode') && !o.name.toLowerCase().includes('qr')
                    );
                    return (
                      <div className="border border-current/10 rounded-2xl overflow-hidden bg-black/5 dark:bg-black/20">
                        <button
                          onClick={() => setFolderOpen((f) => ({ ...f, photo: !f.photo }))}
                          className="w-full px-3 py-2 flex items-center justify-between text-xs font-bold text-left cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
                        >
                          <div className="flex items-center gap-2">
                            {folderOpen.photo ? <FolderOpen className="w-4 h-4 text-[var(--app-text-secondary)]" /> : <Folder className="w-4 h-4 text-[var(--app-text-secondary)]" />}
                            <span>📁 1. Profile Photo & Avatar</span>
                          </div>
                          <span className="text-[10px] opacity-60 font-mono">{photos.length}</span>
                        </button>
                        {folderOpen.photo && (
                          <div className="p-2 pt-0 flex flex-col gap-1.5">
                            {photos.length === 0 ? (
                              <div className="p-2 text-[11px] opacity-60 italic text-center">No photos on canvas. Click Photo on left toolbar.</div>
                            ) : (
                              photos.map((obj) => (
                                <div
                                  key={obj.id}
                                  onClick={() => setSelectedId(obj.id)}
                                  className={`p-2 rounded-xl border flex flex-col gap-2 cursor-pointer transition-all ${
                                    obj.id === selectedId
                                      ? 'border-[var(--app-accent)] bg-[var(--color-accent-soft)]'
                                      : 'border-current/10 hover:bg-black/5 dark:hover:bg-white/5'
                                  }`}
                                >
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="font-semibold truncate max-w-[140px]">{obj.name}</span>
                                    <div className="flex items-center gap-1.5">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedId(obj.id);
                                          replaceFileInputRef.current?.click();
                                        }}
                                        className="text-[10px] font-bold text-[var(--app-text-secondary)] hover:underline cursor-pointer"
                                      >
                                        Replace
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedId(obj.id);
                                          handleRemoveBackground();
                                        }}
                                        className="text-[10px] font-bold text-[#24211b] dark:text-[#E2D9C8] hover:underline cursor-pointer"
                                      >
                                        Remove BG
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Folder 2: Editable Text Fields */}
                  {(() => {
                    const texts = doc.objects.filter((o) => o.type === 'text') as TextCanvasObject[];
                    return (
                      <div className="border border-current/10 rounded-2xl overflow-hidden bg-black/5 dark:bg-black/20">
                        <button
                          onClick={() => setFolderOpen((f) => ({ ...f, text: !f.text }))}
                          className="w-full px-3 py-2 flex items-center justify-between text-xs font-bold text-left cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
                        >
                          <div className="flex items-center gap-2">
                            {folderOpen.text ? <FolderOpen className="w-4 h-4 text-[var(--app-text-secondary)]" /> : <Folder className="w-4 h-4 text-[var(--app-text-secondary)]" />}
                            <span>📁 2. Editable Text Fields</span>
                          </div>
                          <span className="text-[10px] opacity-60 font-mono">{texts.length}</span>
                        </button>
                        {folderOpen.text && (
                          <div className="p-2 pt-0 flex flex-col gap-2">
                            {texts.map((obj) => (
                              <div
                                key={obj.id}
                                onClick={() => setSelectedId(obj.id)}
                                className={`p-2 rounded-xl border flex flex-col gap-1 cursor-pointer transition-all ${
                                  obj.id === selectedId
                                    ? 'border-[var(--app-accent)] bg-[var(--color-accent-soft)]'
                                    : 'border-current/10 hover:bg-black/5 dark:hover:bg-white/5'
                                }`}
                              >
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="font-semibold opacity-75">{obj.name}</span>
                                  <span className="text-[9px] font-mono opacity-50">{obj.fontSize}px</span>
                                </div>
                                <input
                                  type="text"
                                  value={obj.text}
                                  onChange={(e) => updateObject(obj.id, { text: e.target.value })}
                                  className={`w-full px-2 py-1 rounded text-xs border outline-none font-medium ${
                                    isLight
                                      ? 'bg-white border-slate-300 text-black focus:border-[var(--app-accent)]'
                                      : 'bg-[#211e19] border-[#3b352e] text-white focus:border-[var(--app-accent)]'
                                  }`}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Folder 3: Stamps, Barcodes & Accents */}
                  {(() => {
                    const accents = doc.objects.filter(
                      (o) =>
                        (o.type === 'image' && (o.name.toLowerCase().includes('barcode') || o.name.toLowerCase().includes('qr'))) ||
                        (o.type === 'shape' && !o.isBackground && o.width < doc.canvasWidth * 0.9)
                    );
                    return (
                      <div className="border border-current/10 rounded-2xl overflow-hidden bg-black/5 dark:bg-black/20">
                        <button
                          onClick={() => setFolderOpen((f) => ({ ...f, accents: !f.accents }))}
                          className="w-full px-3 py-2 flex items-center justify-between text-xs font-bold text-left cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
                        >
                          <div className="flex items-center gap-2">
                            {folderOpen.accents ? <FolderOpen className="w-4 h-4 text-[#24211b] dark:text-[#E2D9C8]" /> : <Folder className="w-4 h-4 text-[#24211b] dark:text-[#E2D9C8]" />}
                            <span>📁 3. Stamps, Barcodes & Accents</span>
                          </div>
                          <span className="text-[10px] opacity-60 font-mono">{accents.length}</span>
                        </button>
                        {folderOpen.accents && (
                          <div className="p-2 pt-0 flex flex-col gap-1.5">
                            {accents.map((obj) => (
                              <div
                                key={obj.id}
                                onClick={() => setSelectedId(obj.id)}
                                className={`p-2 rounded-xl border flex items-center justify-between text-xs cursor-pointer ${
                                  obj.id === selectedId
                                    ? 'border-[#E2D9C8] bg-[#E2D9C8]/10'
                                    : 'border-current/10 hover:bg-black/5 dark:hover:bg-white/5'
                                }`}
                              >
                                <span className="font-semibold truncate max-w-[150px]">{obj.name}</span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSaveToRecycleClips(obj);
                                  }}
                                  className="text-[10px] font-bold text-[var(--app-accent)] hover:underline cursor-pointer"
                                  title="Save to Recycle Tray"
                                >
                                  + Save Clip
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Folder 4: Card Frame & Background */}
                  {(() => {
                    const frames = doc.objects.filter(
                      (o) =>
                        o.isBackground ||
                        (o.type === 'shape' && o.width >= doc.canvasWidth * 0.9) ||
                        o.name.toLowerCase().includes('border') ||
                        o.name.toLowerCase().includes('frame') ||
                        o.name.toLowerCase().includes('background')
                    );
                    return (
                      <div className="border border-current/10 rounded-2xl overflow-hidden bg-black/5 dark:bg-black/20">
                        <button
                          onClick={() => setFolderOpen((f) => ({ ...f, frame: !f.frame }))}
                          className="w-full px-3 py-2 flex items-center justify-between text-xs font-bold text-left cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
                        >
                          <div className="flex items-center gap-2">
                            {folderOpen.frame ? <FolderOpen className="w-4 h-4 text-[var(--app-text-secondary)]" /> : <Folder className="w-4 h-4 text-[var(--app-text-secondary)]" />}
                            <span>📁 4. Card Frame & Background</span>
                          </div>
                          <span className="text-[10px] opacity-60 font-mono">{frames.length}</span>
                        </button>
                        {folderOpen.frame && (
                          <div className="p-2 pt-0 flex flex-col gap-1.5">
                            {frames.map((obj) => (
                              <div
                                key={obj.id}
                                onClick={() => setSelectedId(obj.id)}
                                className={`p-2 rounded-xl border flex items-center justify-between text-xs cursor-pointer ${
                                  obj.id === selectedId
                                    ? 'border-[var(--app-accent)] bg-[var(--color-accent-soft)]'
                                    : 'border-current/10 hover:bg-black/5 dark:hover:bg-white/5'
                                }`}
                              >
                                <span className="font-semibold truncate max-w-[150px]">{obj.name}</span>
                                <span className="text-[10px] opacity-60 font-mono">{obj.width}×{obj.height}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              ) : (
                /* Flat Stacking Order */
                [...doc.objects]
                  .sort((a, b) => b.zIndex - a.zIndex)
                  .map((obj) => {
                    const isSelected = obj.id === selectedId;
                    return (
                      <div
                        key={obj.id}
                        onClick={() => setSelectedId(obj.id)}
                        className={`flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer group ${
                          isSelected
                            ? 'bg-[var(--color-accent-soft)] border-[var(--app-accent)] text-[var(--app-accent)] font-semibold'
                            : isLight
                            ? 'bg-[#f8f5ef] border-[#e3ddd3] hover:bg-[#f0ece4]'
                            : 'bg-[#211e19] border-[#39342d] hover:bg-[#29251f]'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          {obj.type === 'text' && <Type className="w-3.5 h-3.5 text-[var(--app-text-secondary)] shrink-0" />}
                          {obj.type === 'image' && <ImageIcon className="w-3.5 h-3.5 text-[var(--app-text-secondary)] shrink-0" />}
                          {obj.type === 'shape' && <Square className="w-3.5 h-3.5 text-[var(--app-text-secondary)] shrink-0" />}
                          <span className="text-xs truncate max-w-[140px]">{obj.name}</span>
                        </div>
                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateObject(obj.id, { visible: !obj.visible });
                            }}
                            className="p-1 hover:text-white"
                            title={obj.visible ? 'Hide layer' : 'Show layer'}
                          >
                            {obj.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-[#81786d]" />}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateObject(obj.id, { locked: !obj.locked });
                            }}
                            className="p-1 hover:text-white"
                            title={obj.locked ? 'Unlock' : 'Lock'}
                          >
                            {obj.locked ? <Lock className="w-3.5 h-3.5 text-[#24211b] dark:text-[#E2D9C8]" /> : <Unlock className="w-3.5 h-3.5 text-[#81786d]" />}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteObject(obj.id);
                            }}
                            className="p-1 text-red-500 hover:text-red-400"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          )}

          {/* TAB 3: RECYCLE TRAY & SAVED CLIPS (Leftover Item 6) */}
          {activeSidebarTab === 'recycle' && (
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[var(--app-accent)] uppercase tracking-wider font-mono">
                    ♻ Recycle Drawer
                  </span>
                  <span className="text-[10px] text-[#81786d]">{savedClips.length} Clips</span>
                </div>
                <p className="text-[11px] text-[#81786d] leading-relaxed">
                  Recycle any custom-styled text, cutout photo, or stamp across cards.
                </p>
              </div>

              {selectedObject && (
                <button
                  onClick={() => handleSaveToRecycleClips(selectedObject)}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer ${
                    isLight
                      ? 'bg-[var(--app-accent)] text-[var(--app-accent-ink)] hover:bg-[var(--app-accent-hover)]'
                      : 'bg-[var(--app-accent)] text-[var(--app-accent-ink)] hover:bg-[var(--app-accent-hover)]'
                  }`}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Save "{selectedObject.name}" to Clips</span>
                </button>
              )}

              <div className="flex flex-col gap-2 pt-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#81786d]">
                  Reusable Clips Tray
                </span>
                {savedClips.map((clip) => (
                  <div
                    key={clip.id}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-2 shadow-sm ${
                      isLight ? 'bg-white border-[#e3ddd3]' : 'bg-[#211e19] border-[#39342d]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="w-8 h-8 rounded-lg bg-black/10 dark:bg-white/10 flex items-center justify-center shrink-0">
                        {clip.type === 'image' ? (
                          <ImageIcon className="w-4 h-4 text-[var(--app-text-secondary)]" />
                        ) : clip.type === 'text' ? (
                          <Type className="w-4 h-4 text-[var(--app-text-secondary)]" />
                        ) : (
                          <Sparkles className="w-4 h-4 text-[#24211b] dark:text-[#E2D9C8]" />
                        )}
                      </div>
                      <div className="truncate">
                        <span className="text-xs font-bold truncate block">{clip.name}</span>
                        <span className="text-[10px] font-mono text-[#81786d]">{clip.width}×{clip.height}px</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleInsertRecycledClip(clip)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                        isLight
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                          : 'bg-[#29251f] hover:bg-[#3b352e] text-[#E2D9C8]'
                      }`}
                    >
                      + Use
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* MOBILE BOTTOM DOCKED CANVAS ACTION BAR (< lg)                         */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      <div
        className={`lg:hidden fixed bottom-0 left-0 right-0 z-30 border-t backdrop-blur-lg px-2 py-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom,0px))] transition-colors ${
          isLight ? 'bg-white/95 border-[#e3ddd3]' : 'bg-[#24211b]/95 border-[#39342d]'
        }`}
      >
        <div className="grid grid-cols-4 gap-1 max-w-md mx-auto">
          <button
            onClick={() => {
              setMobileAddSheetOpen(true);
              setMobileInspectorOpen(false);
            }}
            className={`py-2 px-1 rounded-xl flex flex-col items-center gap-1 text-[11px] font-semibold transition-all cursor-pointer ${
              mobileAddSheetOpen
                ? isLight ? 'bg-[#24211b] text-white shadow-sm' : 'bg-[#E2D9C8] text-[#24211b] shadow-sm'
                : isLight ? 'text-[#6b6257] hover:bg-[#f0ece4]' : 'text-[#c7c0b5] hover:bg-[#211e19]'
            }`}
          >
            <FilePlus className="w-4 h-4" />
            <span>+ Add</span>
          </button>

          <button
            onClick={() => {
              setActiveSidebarTab('inspector');
              setMobileInspectorOpen(true);
              setMobileAddSheetOpen(false);
            }}
            className={`py-2 px-1 rounded-xl flex flex-col items-center gap-1 text-[11px] font-semibold transition-all cursor-pointer ${
              mobileInspectorOpen && activeSidebarTab === 'inspector'
                ? isLight ? 'bg-[#24211b] text-white shadow-sm' : 'bg-[#E2D9C8] text-[#24211b] shadow-sm'
                : isLight ? 'text-[#6b6257] hover:bg-[#f0ece4]' : 'text-[#c7c0b5] hover:bg-[#211e19]'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>{selectedObject ? 'Edit' : 'Inspector'}</span>
          </button>

          <button
            onClick={() => {
              setActiveSidebarTab('layers');
              setMobileInspectorOpen(true);
              setMobileAddSheetOpen(false);
            }}
            className={`py-2 px-1 rounded-xl flex flex-col items-center gap-1 text-[11px] font-semibold transition-all cursor-pointer ${
              mobileInspectorOpen && activeSidebarTab === 'layers'
                ? isLight ? 'bg-[#24211b] text-white shadow-sm' : 'bg-[#E2D9C8] text-[#24211b] shadow-sm'
                : isLight ? 'text-[#6b6257] hover:bg-[#f0ece4]' : 'text-[#c7c0b5] hover:bg-[#211e19]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Layers ({doc.objects.length})</span>
          </button>

          <button
            onClick={handleFitToScreen}
            className={`py-2 px-1 rounded-xl flex flex-col items-center gap-1 text-[11px] font-semibold transition-all cursor-pointer ${
              isLight ? 'text-[#6b6257] hover:bg-[#f0ece4]' : 'text-[#c7c0b5] hover:bg-[#211e19]'
            }`}
            title="Fit canvas to phone screen"
          >
            <ZoomIn className="w-4 h-4" />
            <span>Fit {Math.round(zoom * 100)}%</span>
          </button>
        </div>
      </div>

      {/* MOBILE ADD ELEMENT SHEET */}
      {mobileAddSheetOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in"
            onClick={() => setMobileAddSheetOpen(false)}
            aria-hidden="true"
          />
          <div
            className={`lg:hidden fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border-t shadow-2xl p-4 flex flex-col max-h-[75vh] animate-slide-up transition-colors ${
              isLight ? 'bg-white border-[#e3ddd3] text-[var(--app-accent)]' : 'bg-[#24211b] border-[#39342d] text-[#e1e2e7]'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-current/10 shrink-0">
              <h3 className="text-xs font-bold uppercase tracking-wider">Add Elements to Canvas</h3>
              <button
                onClick={() => setMobileAddSheetOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10"
              >
                Done
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-4 overflow-y-auto">
              <button
                onClick={() => {
                  setTemplateDrawerOpen(true);
                  setMobileAddSheetOpen(false);
                }}
                className="p-3 rounded-xl border flex flex-col items-center gap-1.5 cursor-pointer hover:border-[#E2D9C8]"
              >
                <LayoutTemplate className="w-5 h-5 text-[#E2D9C8]" />
                <span className="text-xs font-medium">Templates</span>
              </button>

              <button
                onClick={() => {
                  setMediaModalOpen(true);
                  setMobileAddSheetOpen(false);
                }}
                className="p-3 rounded-xl border flex flex-col items-center gap-1.5 cursor-pointer hover:border-[#E2D9C8]"
              >
                <BookOpen className="w-5 h-5 text-[#E2D9C8]" />
                <span className="text-xs font-medium">Book / Song</span>
              </button>

              <button
                onClick={() => {
                  addObject(createTextObject({ text: 'Your text here', fontSize: 24, color: getCanvasDefaultTextColor(doc.background) }));
                  setMobileAddSheetOpen(false);
                }}
                className="p-3 rounded-xl border flex flex-col items-center gap-1.5 cursor-pointer hover:border-[#24211b] dark:hover:border-[#E2D9C8]"
              >
                <Type className="w-5 h-5 text-[var(--app-text-secondary)]" />
                <span className="text-xs font-medium">Text</span>
              </button>

              <button
                onClick={() => {
                  fileInputRef.current?.click();
                  setMobileAddSheetOpen(false);
                }}
                className="p-3 rounded-xl border flex flex-col items-center gap-1.5 cursor-pointer hover:border-[#24211b] dark:hover:border-[#E2D9C8]"
              >
                <Upload className="w-5 h-5 text-[var(--app-text-secondary)]" />
                <span className="text-xs font-medium">Upload Photo</span>
              </button>

              <button
                onClick={() => {
                  addObject(createImageObject(ASSET_AVATARS.jenniePretty, { name: 'Illustrated Avatar', width: 140, height: 140 }));
                  setMobileAddSheetOpen(false);
                }}
                className="p-3 rounded-xl border flex flex-col items-center gap-1.5 cursor-pointer hover:border-[#24211b] dark:hover:border-[#E2D9C8]"
              >
                <Sparkles className="w-5 h-5 text-[var(--app-text-secondary)]" />
                <span className="text-xs font-medium">Avatar</span>
              </button>

              <button
                onClick={() => {
                  addObject(createShapeObject('rect', { name: 'Card Box', width: 200, height: 120, fill: '#e4ddcf' }));
                  setMobileAddSheetOpen(false);
                }}
                className="p-3 rounded-xl border flex flex-col items-center gap-1.5 cursor-pointer hover:border-[#24211b] dark:hover:border-[#E2D9C8]"
              >
                <Square className="w-5 h-5 text-[var(--app-accent)]" />
                <span className="text-xs font-medium">Box</span>
              </button>

              <button
                onClick={() => {
                  addObject(createShapeObject('circle', { name: 'Circle Badge', width: 100, height: 100, fill: '#e4ddcf' }));
                  setMobileAddSheetOpen(false);
                }}
                className="p-3 rounded-xl border flex flex-col items-center gap-1.5 cursor-pointer hover:border-[#24211b] dark:hover:border-[#E2D9C8]"
              >
                <Circle className="w-5 h-5 text-[var(--app-text-secondary)]" />
                <span className="text-xs font-medium">Circle</span>
              </button>

              <button
                onClick={() => {
                  addObject(createShapeObject('star', { name: 'Star Badge', width: 80, height: 80, fill: '#d8cfbd' }));
                  setMobileAddSheetOpen(false);
                }}
                className="p-3 rounded-xl border flex flex-col items-center gap-1.5 cursor-pointer hover:border-[#24211b] dark:hover:border-[#E2D9C8]"
              >
                <Star className="w-5 h-5 text-[var(--app-text-secondary)]" />
                <span className="text-xs font-medium">Star</span>
              </button>

              <button
                onClick={() => {
                  addObject(createShapeObject('heart', { name: 'Heart Stamp', width: 80, height: 80, fill: '#d8cfbd' }));
                  setMobileAddSheetOpen(false);
                }}
                className="p-3 rounded-xl border flex flex-col items-center gap-1.5 cursor-pointer hover:border-[#24211b] dark:hover:border-[#E2D9C8]"
              >
                <Heart className="w-5 h-5 text-[var(--app-text-secondary)]" />
                <span className="text-xs font-medium">Heart</span>
              </button>

              <button
                onClick={() => {
                  addObject(createImageObject(ASSET_STICKERS.barcode, { name: 'Barcode Sticker', width: 200, height: 50 }));
                  setMobileAddSheetOpen(false);
                }}
                className="p-3 rounded-xl border flex flex-col items-center gap-1.5 cursor-pointer hover:border-[#24211b] dark:hover:border-[#E2D9C8]"
              >
                <Barcode className="w-5 h-5 text-[var(--app-accent)]" />
                <span className="text-xs font-medium">Barcode</span>
              </button>

              <button
                onClick={() => {
                  addObject(createImageObject(ASSET_STICKERS.qrCode, { name: 'QR Code Sticker', width: 80, height: 80 }));
                  setMobileAddSheetOpen(false);
                }}
                className="p-3 rounded-xl border flex flex-col items-center gap-1.5 cursor-pointer hover:border-[#24211b] dark:hover:border-[#E2D9C8]"
              >
                <QrCode className="w-5 h-5 text-[var(--app-accent)]" />
                <span className="text-xs font-medium">QR Code</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* MOBILE INSPECTOR & LAYERS SHEET */}
      {mobileInspectorOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in"
            onClick={() => setMobileInspectorOpen(false)}
            aria-hidden="true"
          />
          <div
            className={`lg:hidden fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border-t shadow-2xl flex flex-col max-h-[75vh] animate-slide-up transition-colors ${
              isLight ? 'bg-white border-[#e3ddd3] text-[var(--app-accent)]' : 'bg-[#24211b] border-[#39342d] text-[#e1e2e7]'
            }`}
          >
            {/* Sheet Tabs Header */}
            <div className={`p-2 border-b flex items-center justify-between shrink-0 ${isLight ? 'border-[#e3ddd3]' : 'border-[#39342d]'}`}>
              <div className="flex gap-1">
                <button
                  onClick={() => setActiveSidebarTab('inspector')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                    activeSidebarTab === 'inspector'
                      ? isLight ? 'bg-[#24211b] text-white' : 'bg-[#E2D9C8] text-[#24211b]'
                      : 'text-[#81786d]'
                  }`}
                >
                  Inspector
                </button>
                <button
                  onClick={() => setActiveSidebarTab('layers')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                    activeSidebarTab === 'layers'
                      ? isLight ? 'bg-[#24211b] text-white' : 'bg-[#E2D9C8] text-[#24211b]'
                      : 'text-[#81786d]'
                  }`}
                >
                  Layers ({doc.objects.length})
                </button>
              </div>
              <button
                onClick={() => setMobileInspectorOpen(false)}
                className="px-2.5 py-1 text-xs font-semibold text-[#81786d] hover:text-white"
              >
                Done
              </button>
            </div>

            {/* Content Container */}
            <div className="flex-1 overflow-y-auto p-4 pb-12">
              {activeSidebarTab === 'inspector' ? (
                selectedObject ? (
                  <div className="flex flex-col gap-4">
                    <div className="sticky top-0 z-10 -mx-4 px-4 py-2 flex items-center justify-between border-b border-current/10 bg-[var(--app-surface)]">
                      <div>
                        <span className="text-[10px] font-mono text-[#81786d] uppercase">{selectedObject.type} Layer</span>
                        <h4 className="text-sm font-semibold truncate max-w-[200px]">{selectedObject.name}</h4>
                      </div>
                      <button
                        onClick={() => deleteObject(selectedObject.id)}
                        aria-label={`Delete ${selectedObject.name}`}
                        className="px-2 py-1.5 rounded-lg text-red-400 hover:bg-red-500/10 flex items-center gap-1.5 text-xs"
                        title="Delete layer"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>

                    {selectedObject.type === 'text' && (
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold">Text Content</label>
                        <textarea
                          value={(selectedObject as TextCanvasObject).text}
                          onChange={(e) => updateObject(selectedObject.id, { text: e.target.value })}
                          rows={2}
                          className={`w-full rounded-xl p-2.5 text-xs border focus:outline-none ${
                            isLight ? 'bg-white border-[#d4cdbf]' : 'bg-[#211e19] border-[#39342d]'
                          }`}
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex flex-col gap-1">
                        <span>X: {selectedObject.x}px</span>
                        <span>Y: {selectedObject.y}px</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span>Width: {selectedObject.width}px</span>
                        <span>Height: {selectedObject.height}px</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-xs text-[#81786d]">
                    Tap any layer on the canvas to inspect its properties.
                  </div>
                )
              ) : (
                <div className="flex flex-col gap-2">
                  {[...doc.objects]
                    .sort((a, b) => b.zIndex - a.zIndex)
                    .map((obj) => (
                      <div
                        key={obj.id}
                        onClick={() => setSelectedId(obj.id)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer ${
                          obj.id === selectedId
                            ? isLight ? 'bg-[#f0ece4] border-[var(--app-accent)]' : 'bg-[#211e19] border-[#E2D9C8]'
                            : isLight ? 'bg-white border-[#e3ddd3]' : 'bg-[#171513] border-[#39342d]'
                        }`}
                      >
                        <span className="text-xs font-medium truncate max-w-[180px]">{obj.name}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateObject(obj.id, { visible: !obj.visible });
                            }}
                            className="p-1 text-[#81786d]"
                          >
                            {obj.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteObject(obj.id);
                            }}
                            className="p-1 text-red-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* Book & Music Metadata Auto-Fill Modal */}
      <MediaImportModal
        isOpen={mediaModalOpen}
        onClose={() => setMediaModalOpen(false)}
        onSelect={handleMediaImport}
      />

      {/* TEMPLATE PICKER DRAWER / MODAL                                        */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      {templateDrawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in"
          onClick={() => setTemplateDrawerOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-5xl max-h-[90vh] rounded-3xl border flex flex-col overflow-hidden shadow-2xl transition-colors ${
              isLight ? 'bg-white border-[#d4cdbf] text-[var(--app-accent)]' : 'bg-[#171513] border-[#39342d] text-[#e1e2e7]'
            }`}
          >
            {/* Modal Header */}
            <div className={`p-5 sm:p-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 ${
              isLight ? 'border-[#e3ddd3] bg-[#f8f5ef]' : 'border-[#39342d]/70 bg-[#1c1914]'
            }`}>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg sm:text-xl font-bold tracking-tight">Aesthetic Template Library</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    isLight ? 'bg-slate-200 text-[var(--app-accent)]' : 'bg-[#E2D9C8]/10 text-[#E2D9C8] border border-[#E2D9C8]/25'
                  }`}>
                    {filteredTemplates.length} {filteredTemplates.length === 1 ? 'Template' : 'Templates'}
                  </span>
                </div>
                <p className="text-xs text-[#81786d] mt-1">
                  Choose from trending Pinterest moodboards, vinyl records, aesthetic ID passes, receipts & posters.
                </p>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => setTemplateDrawerOpen(false)}
                  className={`p-2 rounded-xl border flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-colors ${
                    isLight
                      ? 'border-[#d4cdbf] hover:bg-slate-200 text-[#6b6257]'
                      : 'border-[#39342d] hover:bg-white/10 text-[#a0aec0]'
                  }`}
                  title="Close library (Esc)"
                >
                  <X className="w-4 h-4" />
                  <span className="hidden sm:inline">Close</span>
                </button>
              </div>
            </div>

            {/* Search Bar & Category Filters Bar */}
            <div className={`p-4 sm:px-6 border-b flex flex-col gap-3 shrink-0 ${
              isLight ? 'border-[#e3ddd3] bg-white' : 'border-[#39342d]/50 bg-[#171513]'
            }`}>
              {/* Search Bar */}
              <div className="relative w-full">
                <Search className="w-4 h-4 text-[#81786d] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={templateSearchQuery}
                  onChange={(e) => setTemplateSearchQuery(e.target.value)}
                  placeholder="Search templates (e.g. Pinterest, Polaroid, Vinyl, Matcha, Y2K, Boarding Pass, Jennie)..."
                  className={`w-full pl-10 pr-9 py-2.5 rounded-xl text-xs sm:text-sm border transition-all focus:outline-none ${
                    isLight
                      ? 'bg-[#f0ece4] border-[#d4cdbf] text-[var(--app-accent)] focus:border-[#24211b] focus:bg-white'
                      : 'bg-[#181d26] border-[#39342d] text-white focus:border-[#E2D9C8] focus:bg-[#2a2620]'
                  }`}
                />
                {templateSearchQuery && (
                  <button
                    onClick={() => setTemplateSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#81786d] hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                <button
                  onClick={() => setTemplateCategoryFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                    templateCategoryFilter === 'all'
                      ? isLight ? 'bg-[#24211b] text-white shadow-sm' : 'bg-[#E2D9C8] text-[#24211b] font-bold shadow-sm'
                      : isLight ? 'bg-slate-100 text-[#6b6257] hover:bg-slate-200' : 'bg-[#211e19] text-[#a7a197] hover:text-white hover:bg-[#2b2721]'
                  }`}
                >
                  All ({templateCategoryCounts.all})
                </button>

                <button
                  onClick={() => setTemplateCategoryFilter('pinterest')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 ${
                    templateCategoryFilter === 'pinterest'
                      ? isLight ? 'bg-[#24211b] text-white font-bold shadow-sm' : 'bg-[#E2D9C8] text-[#24211b] font-bold shadow-sm'
                      : isLight ? 'bg-slate-100 text-[#6b6257] hover:bg-slate-200' : 'bg-[#211e19] text-[#a7a197] hover:text-white hover:bg-[#2b2721]'
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Pinterest Trending ({templateCategoryCounts.pinterest})</span>
                </button>

                <button
                  onClick={() => setTemplateCategoryFilter('id-card')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                    templateCategoryFilter === 'id-card'
                      ? isLight ? 'bg-[#24211b] text-white shadow-sm' : 'bg-[#E2D9C8] text-[#24211b] font-bold shadow-sm'
                      : isLight ? 'bg-slate-100 text-[#6b6257] hover:bg-slate-200' : 'bg-[#211e19] text-[#a7a197] hover:text-white hover:bg-[#2b2721]'
                  }`}
                >
                  Aesthetic IDs & Badges ({templateCategoryCounts.idCard})
                </button>

                <button
                  onClick={() => setTemplateCategoryFilter('poster')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                    templateCategoryFilter === 'poster'
                      ? isLight ? 'bg-[#24211b] text-white shadow-sm' : 'bg-[#E2D9C8] text-[#24211b] font-bold shadow-sm'
                      : isLight ? 'bg-slate-100 text-[#6b6257] hover:bg-slate-200' : 'bg-[#211e19] text-[#a7a197] hover:text-white hover:bg-[#2b2721]'
                  }`}
                >
                  Wall Art & Posters ({templateCategoryCounts.poster})
                </button>

                <button
                  onClick={() => setTemplateCategoryFilter('vintage')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                    templateCategoryFilter === 'vintage'
                      ? isLight ? 'bg-[#24211b] text-white shadow-sm' : 'bg-[#E2D9C8] text-[#24211b] font-bold shadow-sm'
                      : isLight ? 'bg-slate-100 text-[#6b6257] hover:bg-slate-200' : 'bg-[#211e19] text-[#a7a197] hover:text-white hover:bg-[#2b2721]'
                  }`}
                >
                  Vintage & Receipts ({templateCategoryCounts.vintage})
                </button>

                <button
                  onClick={() => setTemplateCategoryFilter('minimal')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                    templateCategoryFilter === 'minimal'
                      ? isLight ? 'bg-[#24211b] text-white shadow-sm' : 'bg-[#E2D9C8] text-[#24211b] font-bold shadow-sm'
                      : isLight ? 'bg-slate-100 text-[#6b6257] hover:bg-slate-200' : 'bg-[#211e19] text-[#a7a197] hover:text-white hover:bg-[#2b2721]'
                  }`}
                >
                  Minimalist ({templateCategoryCounts.minimal})
                </button>
              </div>
            </div>

            {/* Grid of Templates */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {filteredTemplates.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTemplates.map((tmpl) => {
                    const isPinterest = isPinterestTemplate(tmpl);
                    return (
                      <div
                        key={tmpl.id}
                        onClick={() => handleApplyTemplate(tmpl)}
                        className={`group rounded-2xl p-4 flex flex-col justify-between border transition-all duration-200 hover:-translate-y-1 hover:shadow-xl cursor-pointer relative overflow-hidden ${
                          isLight
                            ? 'bg-[#f8f5ef] border-[#e3ddd3] hover:border-[#d4cdbf] hover:bg-white'
                            : 'bg-[#1a1713] border-[#39342d] hover:border-[#4a4339] hover:bg-[#211e19]'
                        }`}
                      >
                        {/* Top Preview Card */}
                        <div
                          style={{ backgroundColor: tmpl.theme.bg, color: tmpl.theme.ink }}
                          className="h-36 rounded-xl p-3.5 flex flex-col justify-between mb-3.5 border border-black/10 relative overflow-hidden shadow-inner select-none"
                        >
                          {/* Pinterest Pick Floating Badge */}
                          {isPinterest && (
                            <div className="absolute top-2.5 right-2.5 z-10 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-black/70 text-[#E2D9C8] border border-[#E2D9C8]/40 backdrop-blur-xs flex items-center gap-1 shadow-sm">
                              <Sparkles className="w-2.5 h-2.5 text-[var(--app-accent)]" />
                              <span>Pinterest</span>
                            </div>
                          )}

                          <div className="flex items-center gap-2 font-mono text-[9px] opacity-75 max-w-[70%] truncate">
                            <span className="font-semibold">{tmpl.tag}</span>
                          </div>

                          <div className="my-auto">
                            <h4 className="font-bold text-xs sm:text-sm line-clamp-2 leading-tight">
                              {tmpl.title}
                            </h4>
                            {tmpl.quote && (
                              <p className="text-[10px] opacity-75 line-clamp-2 mt-1 italic font-serif leading-snug">
                                “{tmpl.quote.slice(0, 80)}…”
                              </p>
                            )}
                          </div>

                          <div className="flex items-center justify-between font-mono text-[9px] opacity-75 border-t border-current/10 pt-1.5">
                            <span>{tmpl.badge}</span>
                            <span className="uppercase text-[8px] tracking-wider">{tmpl.categoryLabel}</span>
                          </div>

                          {/* Hover Overlay Button */}
                          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className={`px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-lg flex items-center gap-1.5 transform group-hover:scale-105 transition-transform ${
                              isLight ? 'bg-[#24211b] text-white' : 'bg-[#E2D9C8] text-[#24211b]'
                            }`}>
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Load Template</span>
                            </span>
                          </div>
                        </div>

                        {/* Bottom Metadata & Description */}
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <h5 className="text-xs sm:text-sm font-bold truncate">{tmpl.title}</h5>
                            <span className="text-[10px] font-mono text-[#81786d] shrink-0">
                              {tmpl.layoutHint === 'square'
                                ? '1080×1080'
                                : tmpl.layoutHint === 'vertical'
                                ? '640×960'
                                : '960×600'}
                            </span>
                          </div>

                          <p className="text-[11px] text-[#81786d] line-clamp-2 leading-relaxed">
                            {tmpl.description || `High-resolution ${tmpl.categoryLabel.toLowerCase()} with pre-configured editable layers.`}
                          </p>

                          {/* Tag chips */}
                          {tmpl.tags && tmpl.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1 pt-1.5 border-t border-current/10">
                              {tmpl.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className={`px-1.5 py-0.5 rounded text-[9px] font-mono ${
                                    isLight ? 'bg-slate-200/60 text-[#6b6257]' : 'bg-[#2b2721] text-[#a7a197]'
                                  }`}
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 ${
                    isLight ? 'bg-slate-100 text-slate-400' : 'bg-[#211e19] text-[#81786d]'
                  }`}>
                    <Search className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold mb-1">No templates found</h4>
                  <p className="text-xs text-[#81786d] max-w-sm mb-4">
                    We couldn't find any templates matching "{templateSearchQuery}". Try searching for "polaroid", "vinyl", or "matcha".
                  </p>
                  <button
                    onClick={() => {
                      setTemplateSearchQuery('');
                      setTemplateCategoryFilter('all');
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                      isLight ? 'bg-[#24211b] text-white' : 'bg-[#E2D9C8] text-[#24211b]'
                    }`}
                  >
                    Reset Search & Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
