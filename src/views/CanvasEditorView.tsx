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
  Grid,
  Upload,
  ChevronDown,
  LayoutTemplate,
  FilePlus,
  HelpCircle,
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
  Terminal,
  Folder,
  FolderOpen,
  RefreshCw,
} from 'lucide-react';
import { processImageFilter } from '../utils/imageFilters';
import { generateQrCodeSvg, generateBarcodeSvg } from '../utils/qrBarcodeGenerator';
import { MediaImportModal, type MediaResult } from '../components/MediaImportModal';
import { removeLayerBackgroundOffline } from '../engines/canvasPhotoOperations';
import {
  autoAlignLayersInGrid,
  normalizeTemplateDimensions,
} from '../engines/canvasGridAndDimensionEngine';
import { updateWorkspaceAmbientBackdrop } from '../engines/ambientStageEngine';
import { createThreeCardPreviewScene } from '../engines/threeCardStage';
import {
  getBrandedExportFilename,
  exportThreeDimensionalCardPNG,
} from '../engines/brandedExportAndThreePng';
import type { ImageFilterPreset, ImageClipMask } from '../types/card';

interface CanvasEditorViewProps {
  theme?: 'dark' | 'light';
  onNavigateHome?: () => void;
  onEditingSheetChange?: (isOpen: boolean) => void;
  onToggleTheme?: () => void;
}

const STORAGE_KEY = 'aesthetic_canvas_editor_draft_v1';
const MAX_HISTORY = 40;

export const CanvasEditorView: React.FC<CanvasEditorViewProps> = ({
  theme = 'dark',
  onNavigateHome,
  onEditingSheetChange,
  onToggleTheme,
}) => {
  const [mobileAddSheetOpen, setMobileAddSheetOpen] = useState(false);
  const [mobileInspectorOpen, setMobileInspectorOpen] = useState(false);
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

    if (!isBlank) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && Array.isArray(parsed.objects)) {
            return parsed;
          }
        } catch {
          // ignore corrupted draft
        }
      }
    }

    // Default to the Jennie Pretty ID Pass or blank
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
  const [ambientModeEnabled, setAmbientModeEnabled] = useState<boolean>(true);
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

  // Sync ambient workspace backdrop with card colors (YouTube-style ambient mode - Leftover Item 3)
  useEffect(() => {
    updateWorkspaceAmbientBackdrop(
      canvasElementRef.current,
      canvasContainerRef.current,
      ambientModeEnabled,
      { bg: doc.background || '#18191c', ink: '#ffffff', accent: '#fcd535' }
    );
  }, [ambientModeEnabled, doc.background, doc.objects]);

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
        const rawDataUrl = await toPng(canvasElementRef.current, { pixelRatio: 1.5 });
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

  // Auto-fit zoom on mount or canvas resize
  useEffect(() => {
    const fitZoom = () => {
      if (!canvasContainerRef.current) return;
      const containerW = canvasContainerRef.current.clientWidth - 80;
      const containerH = canvasContainerRef.current.clientHeight - 80;
      if (containerW <= 0 || containerH <= 0) return;

      const scaleW = containerW / doc.canvasWidth;
      const scaleH = containerH / doc.canvasHeight;
      const targetScale = Math.min(scaleW, scaleH, 1);
      setZoom(Math.max(0.2, Number(targetScale.toFixed(2))));
    };

    fitZoom();
    window.addEventListener('resize', fitZoom);
    return () => window.removeEventListener('resize', fitZoom);
  }, [doc.canvasWidth, doc.canvasHeight]);

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
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setDoc(history[nextIndex]);
    }
  }, [history, historyIndex]);

  // ───────────────────────────────────────────────────────────────────────────
  // OBJECT ACTIONS
  // ───────────────────────────────────────────────────────────────────────────

  const updateObject = useCallback(
    (id: string, updates: Partial<CanvasObject>, commit = true) => {
      const nextDoc: CanvasDocument = {
        ...doc,
        updatedAt: new Date().toISOString(),
        objects: doc.objects.map((obj) => {
          if (obj.id === id) {
            return { ...obj, ...updates } as CanvasObject;
          }
          return obj;
        }),
      };

      if (commit) {
        commitDocumentChange(nextDoc);
      } else {
        setDoc(nextDoc); // intermediate drag update
      }
    },
    [doc, commitDocumentChange]
  );

  const addObject = useCallback(
    (newObj: CanvasObject) => {
      // Set zIndex to top
      const maxZ = doc.objects.reduce((max, o) => Math.max(max, o.zIndex), 0);
      newObj.zIndex = maxZ + 1;

      const nextDoc: CanvasDocument = {
        ...doc,
        updatedAt: new Date().toISOString(),
        objects: [...doc.objects, newObj],
      };
      commitDocumentChange(nextDoc);
      setSelectedId(newObj.id);
      setActiveSidebarTab('inspector');
    },
    [doc, commitDocumentChange]
  );

  const deleteObject = useCallback(
    (id: string) => {
      const nextDoc: CanvasDocument = {
        ...doc,
        updatedAt: new Date().toISOString(),
        objects: doc.objects.filter((o) => o.id !== id),
      };
      commitDocumentChange(nextDoc);
      if (selectedId === id) setSelectedId(null);
    },
    [doc, selectedId, commitDocumentChange]
  );

  const duplicateObject = useCallback(
    (id: string) => {
      const target = doc.objects.find((o) => o.id === id);
      if (!target) return;

      const maxZ = doc.objects.reduce((max, o) => Math.max(max, o.zIndex), 0);
      const clone: CanvasObject = {
        ...JSON.parse(JSON.stringify(target)),
        id: createObjectId(target.type),
        name: `${target.name} Copy`,
        x: target.x + 24,
        y: target.y + 24,
        zIndex: maxZ + 1,
      };

      const nextDoc: CanvasDocument = {
        ...doc,
        updatedAt: new Date().toISOString(),
        objects: [...doc.objects, clone],
      };
      commitDocumentChange(nextDoc);
      setSelectedId(clone.id);
    },
    [doc, commitDocumentChange]
  );

  // Layer ordering
  const reorderObject = useCallback(
    (id: string, direction: 'front' | 'back' | 'up' | 'down') => {
      const sorted = [...doc.objects].sort((a, b) => a.zIndex - b.zIndex);
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
        ...doc,
        updatedAt: new Date().toISOString(),
        objects: sorted,
      };
      commitDocumentChange(nextDoc);
    },
    [doc, commitDocumentChange]
  );

  // ───────────────────────────────────────────────────────────────────────────
  // POINTER COORDINATES & DRAG / RESIZE / ROTATE
  // ───────────────────────────────────────────────────────────────────────────

  const getCanvasCoords = useCallback(
    (e: React.MouseEvent | MouseEvent | React.TouchEvent | TouchEvent) => {
      if (!canvasElementRef.current) return { x: 0, y: 0 };
      const rect = canvasElementRef.current.getBoundingClientRect();
      const clientX =
        'touches' in e && e.touches.length > 0
          ? e.touches[0].clientX
          : 'changedTouches' in e && e.changedTouches.length > 0
          ? e.changedTouches[0].clientX
          : (e as MouseEvent).clientX;
      const clientY =
        'touches' in e && e.touches.length > 0
          ? e.touches[0].clientY
          : 'changedTouches' in e && e.changedTouches.length > 0
          ? e.changedTouches[0].clientY
          : (e as MouseEvent).clientY;
      return {
        x: (clientX - rect.left) / zoom,
        y: (clientY - rect.top) / zoom,
      };
    },
    [zoom]
  );

  const handleObjectMouseDown = (e: React.MouseEvent, obj: CanvasObject) => {
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

  const handleResizeHandleMouseDown = (
    e: React.MouseEvent,
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

  const handleRotateHandleMouseDown = (e: React.MouseEvent, obj: CanvasObject) => {
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
        color: isLight ? '#0f172a' : '#ffffff',
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
        color: '#707a8a',
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

    // Global mouse move & up handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const drag = dragRef.current;
      if (!drag.isDragging && !drag.isResizing && !drag.isRotating) return;
      if (!selectedId) return;

      const coords = getCanvasCoords(e);
      const deltaX = coords.x - drag.startX;
      const deltaY = coords.y - drag.startY;

      if (drag.isDragging) {
        let newX = drag.startObjX + deltaX;
        let newY = drag.startObjY + deltaY;

        // Snapping if grid enabled
        if (showGrid) {
          newX = Math.round(newX / 20) * 20;
          newY = Math.round(newY / 20) * 20;
        }

        // Magnetic Smart Snapping (Proximity <= 5px to canvas center & bounding edges)
        const SNAP_PROXIMITY = 5;
        const guides: Array<{ orientation: 'x' | 'y'; pos: number }> = [];

        const objW = drag.startWidth;
        const objH = drag.startHeight;

        // Proximity to Canvas Centers
        const canvasCenterX = Math.round(doc.canvasWidth / 2);
        const canvasCenterY = Math.round(doc.canvasHeight / 2);
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
        for (const other of doc.objects) {
          if (other.id === selectedId || !other.visible) continue;

          // Align Left-to-Left
          if (Math.abs(newX - other.x) <= SNAP_PROXIMITY) {
            newX = other.x;
            guides.push({ orientation: 'x', pos: other.x });
          }
          // Align Right-to-Right
          if (Math.abs((newX + objW) - (other.x + other.width)) <= SNAP_PROXIMITY) {
            newX = other.x + other.width - objW;
            guides.push({ orientation: 'x', pos: other.x + other.width });
          }
          // Align Top-to-Top
          if (Math.abs(newY - other.y) <= SNAP_PROXIMITY) {
            newY = other.y;
            guides.push({ orientation: 'y', pos: other.y });
          }
          // Align Bottom-to-Bottom
          if (Math.abs((newY + objH) - (other.y + other.height)) <= SNAP_PROXIMITY) {
            newY = other.y + other.height - objH;
            guides.push({ orientation: 'y', pos: other.y + other.height });
          }
        }

        setSnapGuides(guides);
        updateObject(selectedId, { x: Math.round(newX), y: Math.round(newY) }, false);
      } else if (drag.isResizing && drag.handle) {
        let newWidth = drag.startWidth;
        let newHeight = drag.startHeight;
        let newX = drag.startObjX;
        let newY = drag.startObjY;

        const h = drag.handle;
        if (h.includes('e')) newWidth = Math.max(20, drag.startWidth + deltaX);
        if (h.includes('s')) newHeight = Math.max(20, drag.startHeight + deltaY);
        if (h.includes('w')) {
          const w = Math.max(20, drag.startWidth - deltaX);
          newX = drag.startObjX + (drag.startWidth - w);
          newWidth = w;
        }
        if (h.includes('n')) {
          const hgt = Math.max(20, drag.startHeight - deltaY);
          newY = drag.startObjY + (drag.startHeight - hgt);
          newHeight = hgt;
        }

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
    };

    const handleMouseUp = () => {
      const drag = dragRef.current;
      if (drag.isDragging || drag.isResizing || drag.isRotating) {
        drag.isDragging = false;
        drag.isResizing = false;
        drag.isRotating = false;
        drag.handle = null;
        setSnapGuides([]);
        // Commit change to history stack
        commitDocumentChange(doc);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [selectedId, doc, showGrid, getCanvasCoords, updateObject, commitDocumentChange]);

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmd = e.metaKey || e.ctrlKey;
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

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
  }, [selectedId, doc.objects, handleUndo, handleRedo, duplicateObject, deleteObject, updateObject]);

  // ───────────────────────────────────────────────────────────────────────────
  // IMAGE UPLOAD HANDLER
  // ───────────────────────────────────────────────────────────────────────────

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
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
        // Calculate balanced initial dimensions
        let w = img.naturalWidth;
        let h = img.naturalHeight;
        const maxInitial = Math.min(doc.canvasWidth * 0.45, 360);
        if (w > maxInitial) {
          h = Math.round((h * maxInitial) / w);
          w = maxInitial;
        }

        const newImgObj = createImageObject(dataUrl, {
          name: file.name.replace(/\.[^/.]+$/, '').slice(0, 20) || 'Uploaded Photo',
          width: w,
          height: h,
          x: Math.round(doc.canvasWidth / 2 - w / 2),
          y: Math.round(doc.canvasHeight / 2 - h / 2),
          borderRadius: 12,
        });

        addObject(newImgObj);
        showToast('Photo added to canvas!');
      };
      img.src = dataUrl;
    };
    reader.onerror = () => {
      showToast('Error reading image file. Please try another image.');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // In-Place Photo Replacement: Preserves all position coordinates, dimensions, rotation, clip masks, and z-index
  const handleReplacePhotoInPlace = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedObject || selectedObject.type !== 'image') return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPEG, WebP, SVG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) return;

      updateObject(selectedObject.id, {
        src: dataUrl,
        filteredSrc: undefined,
        name: file.name.replace(/\.[^/.]+$/, '').slice(0, 20) || selectedObject.name,
      });
      showToast('Photo replaced in-place while keeping layout intact!');
    };
    reader.onerror = () => {
      showToast('Error reading image file.');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
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
    setSelectedId(null); // Temporarily deselect so handles & rings are NOT exported

    // Wait a frame for React to clear selection outlines
    await new Promise((resolve) => setTimeout(resolve, 80));

    try {
      const node = canvasElementRef.current;

      // Handle 3D Transparent PNG Export (Part V.2 & Part IX.1)
      if (format === '3d-4k' || format === '3d-8k') {
        const rawUrl = await toPng(node, { pixelRatio: 2, cacheBust: true });
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
        canvasWidth: doc.canvasWidth * scale,
        canvasHeight: doc.canvasHeight * scale,
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
        actualFormat === 'jpeg' ? 'png' : (actualFormat as 'png' | 'webp'),
        '2d',
        isUltra ? (format.toUpperCase() as '4K' | '8K' | '16K') : undefined
      );

      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();

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
    <div
      className={`w-full min-h-screen flex flex-col pt-0 transition-colors duration-200 ${
        isLight ? 'bg-[#f1f3f5] text-[#181a20]' : 'bg-[#0b0e11] text-[#e1e2e7]'
      }`}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-[#181d24] text-white border border-[#262c36] shadow-2xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3">
          <Sparkles className="w-4 h-4 text-[#fcd535]" />
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
      <header
        className={`editor-top-toolbar h-13 sm:h-14 border-b px-2 sm:px-4 flex items-center justify-between shrink-0 transition-colors z-30 pt-[env(safe-area-inset-top,0px)] ${
          isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#14171d] border-[#222730]'
        }`}
      >
        {/* Left: Back & Title */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <button
            onClick={() => {
              if (onNavigateHome) onNavigateHome();
              else window.location.href = '/templates';
            }}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isLight ? 'border-[#e2e8f0] hover:bg-[#f8fafc] text-slate-700' : 'border-[#262c36] hover:bg-[#181d24] text-slate-200'
            }`}
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
              className={`doc-title-input text-xs sm:text-sm font-semibold tracking-tight bg-transparent border-b border-transparent hover:border-[#707a8a] focus:border-[#fcd535] focus:outline-none px-1 py-0.5 rounded transition-all max-w-[90px] sm:max-w-[160px] md:max-w-xs ${
                isLight ? 'text-[#0f172a]' : 'text-white'
              }`}
              title="Click to rename document"
            />
            <span className="hidden sm:inline-block text-[11px] font-mono px-2 py-0.5 rounded bg-[#707a8a]/10 text-[#707a8a]">
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
              isLight ? 'hover:bg-[#f1f3f5] text-slate-700' : 'hover:bg-[#181d24] text-slate-300'
            }`}
            title="Undo (⌘Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className={`p-1.5 sm:p-2 rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
              isLight ? 'hover:bg-[#f1f3f5] text-slate-700' : 'hover:bg-[#181d24] text-slate-300'
            }`}
            title="Redo (⌘⇧Z)"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-[#262c36]/40 mx-1 hidden sm:block" />

          {/* Zoom Controls */}
          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={() => setZoom((z) => Math.max(0.2, Number((z - 0.1).toFixed(2))))}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isLight ? 'hover:bg-[#f1f3f5]' : 'hover:bg-[#181d24]'
              }`}
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-mono w-12 text-center text-[#707a8a]">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(2.5, Number((z + 0.1).toFixed(2))))}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isLight ? 'hover:bg-[#f1f3f5]' : 'hover:bg-[#181d24]'
              }`}
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className={`p-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                isLight ? 'hover:bg-[#f1f3f5]' : 'hover:bg-[#181d24]'
              }`}
              title="Reset to 100%"
            >
              1:1
            </button>
            <button
              onClick={handleFitToScreen}
              className={`p-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                isLight ? 'hover:bg-[#f1f3f5]' : 'hover:bg-[#181d24]'
              }`}
              title="Fit to Screen"
            >
              Fit
            </button>
          </div>

          <div className="h-4 w-px bg-[#262c36]/40 mx-1 hidden sm:block" />

          {/* Grid Toggle (Desktop/Tablet) */}
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`hidden sm:inline-flex p-2 rounded-lg transition-colors cursor-pointer ${
              showGrid
                ? isLight
                  ? 'bg-[#0f172a] text-white'
                  : 'bg-[#fcd535] text-[#0b0e11]'
                : isLight
                ? 'hover:bg-[#f1f3f5] text-[#707a8a]'
                : 'hover:bg-[#181d24] text-[#707a8a]'
            }`}
            title="Toggle alignment grid (20px)"
          >
            <Grid className="w-4 h-4" />
          </button>

          {/* Auto-Align in 8px Grid (Desktop/Tablet) */}
          <button
            onClick={() => {
              const aligned = autoAlignLayersInGrid(doc.objects as any, doc.canvasWidth, doc.canvasHeight);
              commitDocumentChange({ ...doc, objects: aligned as any });
              showToast('Auto-aligned all layers to 8px baseline grid');
            }}
            className={`hidden sm:inline-flex p-2 rounded-lg transition-colors cursor-pointer ${
              isLight ? 'hover:bg-[#f1f3f5] text-[#707a8a]' : 'hover:bg-[#181d24] text-[#707a8a]'
            }`}
            title="Auto-align layers to 8px baseline grid & center alignments"
          >
            <Sparkles className="w-4 h-4 text-[#ec4899]" />
          </button>

          <div className="h-4 w-px bg-[#262c36]/40 mx-0.5 sm:mx-1" />

          {/* Ambient Lighting Toggle (YouTube-Style - Leftover Item 3) */}
          <button
            onClick={() => setAmbientModeEnabled(!ambientModeEnabled)}
            className={`p-1.5 sm:px-2 sm:py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
              ambientModeEnabled
                ? isLight
                  ? 'bg-[#d97706]/15 text-[#d97706]'
                  : 'bg-[#fcd535]/15 text-[#fcd535]'
                : 'text-[#707a8a] hover:text-white'
            }`}
            title="Toggle YouTube-style Ambient Glow around card stage"
          >
            <Sun className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Ambient</span>
          </button>

          {/* 3D Physical Card View Toggle (Three.js - Leftover Item 2) */}
          <button
            onClick={() => setIs3DMode(!is3DMode)}
            className={`p-1.5 sm:px-2 sm:py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
              is3DMode
                ? 'bg-[#fcd535] text-black font-bold'
                : isLight
                ? 'bg-slate-100 text-slate-700 hover:text-black'
                : 'bg-[#181d24] text-[#a0a5ad] hover:text-white'
            }`}
            title="Toggle Three.js 3D Physical Card Stage with dynamic reflections"
          >
            <Box className="w-3.5 h-3.5" />
            <span className="hidden md:inline">3D View</span>
          </button>
        </div>

        {/* Right: Theme Toggle, Template Picker, Blank Canvas & Export */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Studio Theme Toggle Button */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className={`p-1.5 sm:p-2 rounded-lg border transition-colors cursor-pointer ${
                isLight
                  ? 'bg-white border-[#e2e8f0] text-amber-500 hover:bg-[#f8fafc]'
                  : 'bg-[#181d24] border-[#262c36] text-[#fcd535] hover:bg-[#222730]'
              }`}
              title={`Switch to ${isLight ? 'Dark' : 'Light'} Mode`}
              aria-label="Toggle Theme"
            >
              {isLight ? <Moon className="w-3.5 h-3.5 text-slate-700" /> : <Sun className="w-3.5 h-3.5 text-[#fcd535]" />}
            </button>
          )}

          <button
            onClick={() => setTemplateDrawerOpen(true)}
            className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
              isLight
                ? 'bg-white border-[#e2e8f0] text-[#0f172a] hover:bg-[#f8fafc]'
                : 'bg-[#181d24] border-[#262c36] text-white hover:bg-[#222730]'
            }`}
          >
            <LayoutTemplate className="w-3.5 h-3.5 text-[#fcd535]" />
            <span>Templates</span>
          </button>

          <button
            onClick={() => setMediaModalOpen(true)}
            className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
              isLight
                ? 'bg-white border-[#e2e8f0] text-[#0f172a] hover:bg-[#f8fafc]'
                : 'bg-[#181d24] border-[#262c36] text-white hover:bg-[#222730]'
            }`}
            title="Search and import book or song cover & metadata"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#fcd535]" />
            <span>Import Book / Song</span>
          </button>

          <button
            onClick={() => handleCreateBlank()}
            className={`hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
              isLight
                ? 'bg-white border-[#e2e8f0] text-[#0f172a] hover:bg-[#f8fafc]'
                : 'bg-[#181d24] border-[#262c36] text-white hover:bg-[#222730]'
            }`}
            title="Start fresh blank canvas"
          >
            <FilePlus className="w-3.5 h-3.5" />
            <span>Blank</span>
          </button>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
              disabled={exporting}
              className={`inline-flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md cursor-pointer ${
                isLight
                  ? 'bg-[#0f172a] text-white hover:bg-[#1e293b]'
                  : 'bg-[#fcd535] text-[#0b0e11] hover:bg-[#ffe270]'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>{exporting ? 'Rendering...' : 'Export'}</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {exportDropdownOpen && (
              <div
                className={`absolute right-0 top-full mt-2 w-52 rounded-xl border p-1 shadow-2xl z-50 flex flex-col gap-0.5 ${
                  isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#181d24] border-[#262c36]'
                }`}
              >
                <button
                  onClick={() => handleExport('png')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                    isLight ? 'hover:bg-[#f1f5f9]' : 'hover:bg-[#222730]'
                  }`}
                >
                  <span>PNG (2x Retina)</span>
                  <span className="text-[10px] opacity-60 font-mono">Crisp</span>
                </button>
                <button
                  onClick={() => handleExport('webp')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                    isLight ? 'hover:bg-[#f1f5f9]' : 'hover:bg-[#222730]'
                  }`}
                >
                  <span>WebP (Lossless)</span>
                  <span className="text-[10px] opacity-60 font-mono">Modern</span>
                </button>
                <button
                  onClick={() => handleExport('jpeg')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                    isLight ? 'hover:bg-[#f1f5f9]' : 'hover:bg-[#222730]'
                  }`}
                >
                  <span>JPEG (Social)</span>
                  <span className="text-[10px] opacity-60 font-mono">Small</span>
                </button>
                <div className={`h-px my-1 ${isLight ? 'bg-slate-200' : 'bg-[#262c36]'}`} />
                <div className="px-3 py-1 text-[10px] font-semibold text-[#707a8a] uppercase tracking-wider">
                  Ultra-HD Master
                </div>
                <button
                  onClick={() => handleExport('4k')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                    isLight ? 'hover:bg-[#f1f5f9]' : 'hover:bg-[#222730]'
                  }`}
                >
                  <span>Ultra-HD 4K</span>
                  <span className="text-[10px] text-[#fcd535] font-mono">3840px</span>
                </button>
                <button
                  onClick={() => handleExport('8k')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                    isLight ? 'hover:bg-[#f1f5f9]' : 'hover:bg-[#222730]'
                  }`}
                >
                  <span>Ultra-HD 8K</span>
                  <span className="text-[10px] text-[#ec4899] font-mono">7680px</span>
                </button>
                <button
                  onClick={() => handleExport('16k')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                    isLight ? 'hover:bg-[#f1f5f9]' : 'hover:bg-[#222730]'
                  }`}
                >
                  <span>Ultra-HD 16K</span>
                  <span className="text-[10px] text-[#3b82f6] font-mono">15360px</span>
                </button>
                <div className={`h-px my-1 ${isLight ? 'bg-slate-200' : 'bg-[#262c36]'}`} />
                <div className="px-3 py-1 text-[10px] font-semibold text-[#707a8a] uppercase tracking-wider">
                  3D Transparent PNG
                </div>
                <button
                  onClick={() => handleExport('3d-4k')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                    isLight ? 'hover:bg-[#f1f5f9]' : 'hover:bg-[#222730]'
                  }`}
                >
                  <span>🧊 3D Card (4K Alpha)</span>
                  <span className="text-[10px] text-[#0ecb81] font-mono">3840px</span>
                </button>
                <button
                  onClick={() => handleExport('3d-8k')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                    isLight ? 'hover:bg-[#f1f5f9]' : 'hover:bg-[#222730]'
                  }`}
                >
                  <span>🧊 3D Card (8K Alpha)</span>
                  <span className="text-[10px] text-[#0ecb81] font-mono">7680px</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* QUICK COMMAND BAR ("TELL STUDIO WHAT TO CHANGE" - Leftover Item 5)    */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      <div
        className={`px-4 py-2 border-b flex items-center gap-3 transition-colors shrink-0 z-20 ${
          isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#12151b] border-[#222730]'
        }`}
      >
        <div className="flex items-center gap-1.5 text-xs text-[#fcd535] font-mono shrink-0">
          <Terminal className="w-4 h-4" />
          <span className="hidden sm:inline font-bold">Quick Command:</span>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleExecuteQuickCommand(quickCommandText);
          }}
          className="flex-1 flex items-center gap-2"
        >
          <input
            type="text"
            value={quickCommandText}
            onChange={(e) => setQuickCommandText(e.target.value)}
            placeholder='Type a quick edit: e.g. "Change name to Arya", "Switch to cyber pink", "Auto-align layers", "Make photo circular"...'
            className={`flex-1 px-3 py-1.5 rounded-lg text-xs border outline-none transition-all ${
              isLight
                ? 'bg-slate-50 border-slate-200 text-[#0f172a] focus:border-[#d97706]'
                : 'bg-[#181d24] border-[#2c3340] text-white focus:border-[#fcd535]'
            }`}
          />
          <button
            type="submit"
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
              isLight
                ? 'bg-[#0f172a] text-white hover:bg-[#1e293b]'
                : 'bg-[#fcd535] text-black hover:bg-[#ffe270]'
            }`}
          >
            Apply
          </button>
        </form>
      </div>

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* MAIN WORKSPACE BODY                                                   */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* LEFT TOOLBAR: Add Elements (Desktop) */}
        <aside
          className={`hidden lg:flex w-16 border-r flex-col items-center py-4 gap-4 shrink-0 transition-colors z-20 ${
            isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#14171d] border-[#222730]'
          }`}
        >
          {/* Add Text */}
          <button
            onClick={() =>
              addObject(
                createTextObject({
                  text: 'Your text here',
                  fontSize: 28,
                  x: Math.round(doc.canvasWidth / 2 - 160),
                  y: Math.round(doc.canvasHeight / 2 - 30),
                  color: isLight ? '#111111' : '#ffffff',
                })
              )
            }
            className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center gap-0.5 border transition-all cursor-pointer group ${
              isLight
                ? 'bg-[#f8fafc] border-[#e2e8f0] hover:border-[#cbd5e1] hover:bg-[#f1f5f9]'
                : 'bg-[#181d24] border-[#262c36] hover:border-[#444748] hover:bg-[#222730]'
            }`}
            title="Add independent Text layer"
          >
            <Type className="w-4 h-4 text-[#38bdf8]" />
            <span className="text-[9px] font-medium text-[#707a8a]">Text</span>
          </button>

          {/* Add Image */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center gap-0.5 border transition-all cursor-pointer group ${
              isLight
                ? 'bg-[#f8fafc] border-[#e2e8f0] hover:border-[#cbd5e1] hover:bg-[#f1f5f9]'
                : 'bg-[#181d24] border-[#262c36] hover:border-[#444748] hover:bg-[#222730]'
            }`}
            title="Upload Photo / Avatar from your device"
          >
            <Upload className="w-4 h-4 text-[#ec4899]" />
            <span className="text-[9px] font-medium text-[#707a8a]">Upload</span>
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
            className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center gap-0.5 border transition-all cursor-pointer group ${
              isLight
                ? 'bg-[#f8fafc] border-[#e2e8f0] hover:border-[#cbd5e1] hover:bg-[#f1f5f9]'
                : 'bg-[#181d24] border-[#262c36] hover:border-[#444748] hover:bg-[#222730]'
            }`}
            title="Add preset vector portrait"
          >
            <ImageIcon className="w-4 h-4 text-[#a855f7]" />
            <span className="text-[9px] font-medium text-[#707a8a]">Avatar</span>
          </button>

          <div className="w-8 h-px bg-[#262c36]/40" />

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
                  fill: isLight ? '#f1f5f9' : '#1e242c',
                  stroke: isLight ? '#cbd5e1' : '#333b47',
                  strokeWidth: 2,
                  borderRadius: 16,
                })
              )
            }
            className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center gap-0.5 border transition-all cursor-pointer group ${
              isLight
                ? 'bg-[#f8fafc] border-[#e2e8f0] hover:border-[#cbd5e1]'
                : 'bg-[#181d24] border-[#262c36] hover:border-[#444748]'
            }`}
            title="Add Rounded Box"
          >
            <Square className="w-4 h-4 text-[#eab308]" />
            <span className="text-[9px] font-medium text-[#707a8a]">Box</span>
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
                  fill: '#ffccd5',
                  stroke: '#ff4d6d',
                  strokeWidth: 2,
                })
              )
            }
            className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center gap-0.5 border transition-all cursor-pointer group ${
              isLight
                ? 'bg-[#f8fafc] border-[#e2e8f0] hover:border-[#cbd5e1]'
                : 'bg-[#181d24] border-[#262c36] hover:border-[#444748]'
            }`}
            title="Add Circle"
          >
            <Circle className="w-4 h-4 text-[#10b981]" />
            <span className="text-[9px] font-medium text-[#707a8a]">Circle</span>
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
                  fill: '#fcd535',
                })
              )
            }
            className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center gap-0.5 border transition-all cursor-pointer group ${
              isLight
                ? 'bg-[#f8fafc] border-[#e2e8f0] hover:border-[#cbd5e1]'
                : 'bg-[#181d24] border-[#262c36] hover:border-[#444748]'
            }`}
            title="Add Star"
          >
            <Star className="w-4 h-4 text-[#fcd535]" />
            <span className="text-[9px] font-medium text-[#707a8a]">Star</span>
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
                  fill: '#ff4d6d',
                })
              )
            }
            className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center gap-0.5 border transition-all cursor-pointer group ${
              isLight
                ? 'bg-[#f8fafc] border-[#e2e8f0] hover:border-[#cbd5e1]'
                : 'bg-[#181d24] border-[#262c36] hover:border-[#444748]'
            }`}
            title="Add Heart"
          >
            <Heart className="w-4 h-4 text-[#f43f5e]" />
            <span className="text-[9px] font-medium text-[#707a8a]">Heart</span>
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
                  fill: isLight ? '#cbd5e1' : '#475569',
                })
              )
            }
            className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center gap-0.5 border transition-all cursor-pointer group ${
              isLight
                ? 'bg-[#f8fafc] border-[#e2e8f0] hover:border-[#cbd5e1]'
                : 'bg-[#181d24] border-[#262c36] hover:border-[#444748]'
            }`}
            title="Add Divider Line"
          >
            <Minus className="w-4 h-4 text-[#94a3b8]" />
            <span className="text-[9px] font-medium text-[#707a8a]">Line</span>
          </button>

          <div className="w-8 h-px bg-[#262c36]/40" />

          {/* Stamps & Accents Popover Drawer Trigger */}
          <div className="relative">
            <button
              onClick={() => setStampsDrawerOpen(!stampsDrawerOpen)}
              className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center gap-0.5 border transition-all cursor-pointer group ${
                stampsDrawerOpen
                  ? 'bg-[#fcd535] text-black border-[#fcd535] font-bold shadow-md'
                  : isLight
                  ? 'bg-[#f8fafc] border-[#e2e8f0] hover:border-[#cbd5e1]'
                  : 'bg-[#181d24] border-[#262c36] hover:border-[#444748]'
              }`}
              title="Open Curated Stamps, Badges & Accents Drawer"
            >
              <Award className="w-4 h-4 text-[#ec4899]" />
              <span className="text-[9px] font-medium">Stamps</span>
            </button>

            {/* Stamps Popover Menu */}
            {stampsDrawerOpen && (
              <div
                className={`absolute left-14 top-0 w-64 rounded-2xl border p-2.5 shadow-2xl z-50 flex flex-col gap-2 ${
                  isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#181d24] border-[#262c36]'
                }`}
              >
                <div className="flex items-center justify-between pb-1.5 border-b border-current/10">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#707a8a]">
                    Stamps & Accents
                  </span>
                  <button
                    onClick={() => setStampsDrawerOpen(false)}
                    className="text-[10px] text-[#707a8a] hover:text-white"
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
                    className={`p-2 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-colors ${
                      isLight ? 'hover:bg-slate-50 border-slate-200' : 'hover:bg-[#222730] border-[#262c36]'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-red-500 font-mono tracking-wider">APPROVED</span>
                      <span className="text-[10px] text-[#707a8a]">Distressed Rubber Ink</span>
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
                    className={`p-2 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-colors ${
                      isLight ? 'hover:bg-slate-50 border-slate-200' : 'hover:bg-[#222730] border-[#262c36]'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-amber-400">Security Rosette</span>
                      <span className="text-[10px] text-[#707a8a]">Holographic metallic seal</span>
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
                    className={`p-2 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-colors ${
                      isLight ? 'hover:bg-slate-50 border-slate-200' : 'hover:bg-[#222730] border-[#262c36]'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-yellow-600">Washi Tape Strip</span>
                      <span className="text-[10px] text-[#707a8a]">Translucent torn-edge tape</span>
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
                    className={`p-2 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-colors ${
                      isLight ? 'hover:bg-slate-50 border-slate-200' : 'hover:bg-[#222730] border-[#262c36]'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-amber-500">★★★★★ Review Bar</span>
                      <span className="text-[10px] text-[#707a8a]">0.5 to 5.0 star selector</span>
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
                    className={`p-2 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-colors ${
                      isLight ? 'hover:bg-slate-50 border-slate-200' : 'hover:bg-[#222730] border-[#262c36]'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-emerald-500">Audio Track Player</span>
                      <span className="text-[10px] text-[#707a8a]">Scannable waveform bars</span>
                    </div>
                    <Volume2 className="w-4 h-4 text-emerald-500" />
                  </button>

                  {/* Dynamic Code-128 Barcode */}
                  <button
                    onClick={() => {
                      addObject(
                        createShapeObject('barcode', {
                          name: 'Dynamic Barcode',
                          fill: '#111417',
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
                    className={`p-2 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-colors ${
                      isLight ? 'hover:bg-slate-50 border-slate-200' : 'hover:bg-[#222730] border-[#262c36]'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-orange-500">Dynamic Barcode</span>
                      <span className="text-[10px] text-[#707a8a]">Code-128 SVG with live payload</span>
                    </div>
                    <Barcode className="w-4 h-4 text-orange-500" />
                  </button>

                  {/* Dynamic QR Code */}
                  <button
                    onClick={() => {
                      addObject(
                        createShapeObject('qr-code', {
                          name: 'Dynamic QR Code',
                          fill: '#111417',
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
                    className={`p-2 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-colors ${
                      isLight ? 'hover:bg-slate-50 border-slate-200' : 'hover:bg-[#222730] border-[#262c36]'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-cyan-500">Dynamic QR Matrix</span>
                      <span className="text-[10px] text-[#707a8a]">Live URL / Spotify binding</span>
                    </div>
                    <QrCode className="w-4 h-4 text-cyan-500" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* CENTER: THE INTERACTIVE CANVAS VIEWPORT                             */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <main
          ref={canvasContainerRef}
          onClick={() => setSelectedId(null)}
          className={`editor-ambient-stage editor-canvas-stage-mobile flex-1 overflow-auto flex items-center justify-center p-3 pb-16 sm:p-8 select-none relative transition-colors ${
            isLight ? 'bg-[#e2e8f0]' : 'bg-[#080a0d]'
          }`}
          style={{
            backgroundImage: showGrid
              ? isLight
                ? 'radial-gradient(#94a3b8 1px, transparent 0)'
                : 'radial-gradient(#262c36 1px, transparent 0)'
              : 'none',
            backgroundSize: '24px 24px',
          }}
        >
          {is3DMode ? (
            <div
              ref={threeMountRef}
              style={{
                width: `${Math.min(doc.canvasWidth, 680)}px`,
                height: `${Math.min(doc.canvasHeight, 680)}px`,
              }}
              className="flex items-center justify-center"
            />
          ) : (
            /* Zoom Wrapper */
            <div
              style={{
                transform: `scale(${zoom})`,
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
                boxShadow:
                  '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(0,0,0,0.1)',
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
                    backgroundColor: guide.orientation === 'x' ? '#ec4899' : '#fcd535',
                    zIndex: 99999,
                    pointerEvents: 'none',
                    boxShadow: '0 0 3px rgba(236,72,153,0.8)',
                  }}
                />
              ))}

              {/* Objects in Z-order */}
              {[...doc.objects]
                .sort((a, b) => a.zIndex - b.zIndex)
                .map((obj) => {
                  if (!obj.visible) return null;
                  const isSelected = obj.id === selectedId;

                  return (
                    <div
                      key={obj.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedId(obj.id);
                      }}
                      onMouseDown={(e) => handleObjectMouseDown(e, obj)}
                      style={{
                        position: 'absolute',
                        left: `${obj.x}px`,
                        top: `${obj.y}px`,
                        width: `${obj.width}px`,
                        height: `${obj.height}px`,
                        transform: `rotate(${obj.rotation || 0}deg)`,
                        transformOrigin: 'center center',
                        zIndex: obj.zIndex,
                        cursor: obj.locked ? 'default' : 'move',
                      }}
                      className="group"
                    >
                      {/* 1. TEXT OBJECT */}
                      {obj.type === 'text' && (
                        <div
                          style={{
                            width: '100%',
                            height: '100%',
                            fontFamily: obj.fontFamily,
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
                        >
                          {obj.text}
                        </div>
                      )}

                      {/* 2. IMAGE OBJECT WITH PHOTO TREATMENT & CLIPPING MASKS */}
                      {obj.type === 'image' && (
                        <div
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
                            border: '2px solid #3b82f6',
                            pointerEvents: 'none',
                            zIndex: 9999,
                          }}
                        >
                          {/* Floating Contextual Quick Actions Toolbar (14px above layer/handles) */}
                          <div
                            onMouseDown={(e) => e.stopPropagation()}
                            className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-0.5 px-2 py-1 rounded-xl bg-[#14171d]/95 backdrop-blur-md border border-[#262c36] shadow-2xl z-[10000] pointer-events-auto select-none"
                          >
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
                                  onClick={() => replaceFileInputRef.current?.click()}
                                  title="Replace photo in-place"
                                  className="p-1 rounded-lg text-[#ec4899] hover:bg-white/10 transition-colors flex items-center gap-1 text-[10px] font-semibold cursor-pointer"
                                >
                                  <Upload className="w-3 h-3" />
                                  <span>Replace</span>
                                </button>
                                <button
                                  onClick={handleRemoveBackground}
                                  disabled={isRemovingBg}
                                  title="Offline AI background removal"
                                  className="p-1 rounded-lg text-[#fcd535] hover:bg-white/10 transition-colors flex items-center gap-1 text-[10px] font-semibold disabled:opacity-50 cursor-pointer"
                                >
                                  <Wand2 className="w-3 h-3" />
                                  <span>{isRemovingBg ? `${bgProgress}%` : 'BG'}</span>
                                </button>
                              </>
                            )}
                          </div>

                          {/* Rotation handle protruding above */}
                          <div
                            onMouseDown={(e) => handleRotateHandleMouseDown(e, obj)}
                            style={{
                              position: 'absolute',
                              top: -26,
                              left: '50%',
                              transform: 'translateX(-50%)',
                              width: 14,
                              height: 14,
                              borderRadius: '50%',
                              backgroundColor: '#ffffff',
                              border: '2px solid #3b82f6',
                              pointerEvents: 'auto',
                              cursor: 'grab',
                            }}
                            title="Rotate"
                          />
                          <div
                            style={{
                              position: 'absolute',
                              top: -14,
                              left: '50%',
                              transform: 'translateX(-50%)',
                              width: 1,
                              height: 12,
                              backgroundColor: '#3b82f6',
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
                              onMouseDown={(e) => handleResizeHandleMouseDown(e, handle.pos, obj)}
                              style={{
                                position: 'absolute',
                                width: 10,
                                height: 10,
                                backgroundColor: '#ffffff',
                                border: '2px solid #3b82f6',
                                borderRadius: 2,
                                pointerEvents: 'auto',
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
                          className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#14171d]/95 backdrop-blur-md border border-[#262c36] shadow-2xl z-[10000] pointer-events-auto select-none"
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
          )}
        </main>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* RIGHT SIDEBAR: Inspector & Layers (Desktop)                         */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <aside
          className={`hidden lg:flex w-80 border-l flex-col shrink-0 transition-colors z-20 ${
            isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#14171d] border-[#222730]'
          }`}
        >
          {/* Sidebar Tabs */}
          <div className="flex border-b border-[#262c36]/40 p-1">
            <button
              onClick={() => setActiveSidebarTab('inspector')}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                activeSidebarTab === 'inspector'
                  ? isLight
                    ? 'bg-[#0f172a] text-white shadow-sm'
                    : 'bg-[#222730] text-white shadow-sm border border-[#444748]'
                  : 'text-[#707a8a] hover:text-white'
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
                    ? 'bg-[#0f172a] text-white shadow-sm'
                    : 'bg-[#222730] text-white shadow-sm border border-[#444748]'
                  : 'text-[#707a8a] hover:text-white'
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
                    ? 'bg-[#0f172a] text-white shadow-sm'
                    : 'bg-[#222730] text-white shadow-sm border border-[#444748]'
                  : 'text-[#707a8a] hover:text-white'
              }`}
              title="Saved Clips & Recycle Tray (Notebook Page 3)"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#0ecb81]" />
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
                  <div className="flex items-center justify-between pb-3 border-b border-[#262c36]/30">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#707a8a]">
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
                            ? 'bg-[#fcd535] text-[#0b0e11] border-[#fcd535]'
                            : isLight
                            ? 'border-[#e2e8f0] text-[#707a8a] hover:bg-[#f1f5f9]'
                            : 'border-[#262c36] text-[#707a8a] hover:bg-[#181d24]'
                        }`}
                        title={selectedObject.locked ? 'Unlock' : 'Lock position'}
                      >
                        {selectedObject.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => duplicateObject(selectedObject.id)}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                          isLight
                            ? 'border-[#e2e8f0] text-[#707a8a] hover:bg-[#f1f5f9]'
                            : 'border-[#262c36] text-[#707a8a] hover:bg-[#181d24]'
                        }`}
                        title="Duplicate layer (⌘D)"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteObject(selectedObject.id)}
                        className={`p-1.5 rounded-lg border text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer ${
                          isLight ? 'border-[#e2e8f0]' : 'border-[#262c36]'
                        }`}
                        title="Delete layer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Quick Alignment Toolbar */}
                  <div className="flex flex-col gap-1.5 pb-2 border-b border-[#262c36]/20">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#707a8a]">Alignment</span>
                      <span className="text-[10px] font-mono opacity-50">Canvas Snap</span>
                    </div>
                    <div className={`grid grid-cols-6 gap-1 p-1 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/20 border-white/10'}`}>
                      <button onClick={() => handleAlign('left')} title="Align Left" className="p-1.5 rounded-lg flex items-center justify-center hover:bg-black/10 text-[#707a8a] hover:text-white cursor-pointer"><AlignLeft className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleAlign('hcenter')} title="Align Horizontal Center" className="p-1.5 rounded-lg flex items-center justify-center hover:bg-black/10 text-[#707a8a] hover:text-white cursor-pointer"><AlignCenter className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleAlign('right')} title="Align Right" className="p-1.5 rounded-lg flex items-center justify-center hover:bg-black/10 text-[#707a8a] hover:text-white cursor-pointer"><AlignRight className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleAlign('top')} title="Align Top" className="p-1.5 rounded-lg flex items-center justify-center hover:bg-black/10 text-[#707a8a] hover:text-white cursor-pointer"><AlignVerticalJustifyStart className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleAlign('vmiddle')} title="Align Vertical Middle" className="p-1.5 rounded-lg flex items-center justify-center hover:bg-black/10 text-[#707a8a] hover:text-white cursor-pointer"><AlignVerticalJustifyCenter className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleAlign('bottom')} title="Align Bottom" className="p-1.5 rounded-lg flex items-center justify-center hover:bg-black/10 text-[#707a8a] hover:text-white cursor-pointer"><AlignVerticalJustifyEnd className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>

                  {/* Transform Grid (X, Y, W, H, Rotate) */}
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-semibold text-[#707a8a]">Transform & Dimensions</span>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <div className="flex items-center gap-2 p-2 rounded-lg border border-[#262c36]/40">
                        <span className="text-[#707a8a]">X</span>
                        <input
                          type="number"
                          value={selectedObject.x}
                          onChange={(e) =>
                            updateObject(selectedObject.id, { x: Number(e.target.value) || 0 })
                          }
                          className="w-full bg-transparent focus:outline-none"
                        />
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded-lg border border-[#262c36]/40">
                        <span className="text-[#707a8a]">Y</span>
                        <input
                          type="number"
                          value={selectedObject.y}
                          onChange={(e) =>
                            updateObject(selectedObject.id, { y: Number(e.target.value) || 0 })
                          }
                          className="w-full bg-transparent focus:outline-none"
                        />
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded-lg border border-[#262c36]/40">
                        <span className="text-[#707a8a]">W</span>
                        <input
                          type="number"
                          value={selectedObject.width}
                          onChange={(e) =>
                            updateObject(selectedObject.id, { width: Math.max(10, Number(e.target.value) || 10) })
                          }
                          className="w-full bg-transparent focus:outline-none"
                        />
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded-lg border border-[#262c36]/40">
                        <span className="text-[#707a8a]">H</span>
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
                    <div className="flex items-center justify-between text-xs p-2 rounded-lg border border-[#262c36]/40">
                      <span className="text-[#707a8a]">Rotation Angle</span>
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
                      <span className="text-xs font-semibold text-[#707a8a]">Typography & Content</span>
                      {/* Text content textarea */}
                      <textarea
                        value={selectedObject.text}
                        onChange={(e) => updateObject(selectedObject.id, { text: e.target.value })}
                        rows={3}
                        className={`w-full p-2.5 rounded-xl text-xs border focus:outline-none focus:border-[#3b82f6] leading-relaxed ${
                          isLight ? 'bg-[#f8fafc] border-[#cbd5e1]' : 'bg-[#181d24] border-[#262c36]'
                        }`}
                        placeholder="Type text here..."
                      />

                      {/* Font Family */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] text-[#707a8a]">Font Family</label>
                        <select
                          value={selectedObject.fontFamily}
                          onChange={(e) => updateObject(selectedObject.id, { fontFamily: e.target.value })}
                          className={`w-full p-2 rounded-lg text-xs border focus:outline-none ${
                            isLight ? 'bg-[#f8fafc] border-[#cbd5e1]' : 'bg-[#181d24] border-[#262c36]'
                          }`}
                        >
                          <option value="Inter">Inter (Clean Modern)</option>
                          <option value="'Newsreader', Georgia, serif">Newsreader (Editorial Serif)</option>
                          <option value="'Playfair Display', Georgia, serif">Playfair Display (Display Serif)</option>
                          <option value="'JetBrains Mono', monospace">JetBrains Mono (Technical)</option>
                          <option value="'Plus Jakarta Sans', sans-serif">Plus Jakarta Sans (Geometric)</option>
                        </select>
                      </div>

                      {/* Font Size & Weight */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col gap-1">
                          <label className="text-[11px] text-[#707a8a]">Size ({selectedObject.fontSize}px)</label>
                          <input
                            type="range"
                            min={10}
                            max={96}
                            value={selectedObject.fontSize}
                            onChange={(e) => updateObject(selectedObject.id, { fontSize: Number(e.target.value) })}
                            className="w-full accent-[#3b82f6]"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[11px] text-[#707a8a]">Weight</label>
                          <select
                            value={selectedObject.fontWeight}
                            onChange={(e) =>
                              updateObject(selectedObject.id, {
                                fontWeight: e.target.value as TextCanvasObject['fontWeight'],
                              })
                            }
                            className={`w-full p-1.5 rounded-lg text-xs border focus:outline-none ${
                              isLight ? 'bg-[#f8fafc] border-[#cbd5e1]' : 'bg-[#181d24] border-[#262c36]'
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
                          <label className="text-[11px] text-[#707a8a]">Color</label>
                          <input
                            type="color"
                            value={selectedObject.color}
                            onChange={(e) => updateObject(selectedObject.id, { color: e.target.value })}
                            className="w-7 h-7 rounded-lg border border-transparent cursor-pointer"
                          />
                        </div>

                        <div className="flex items-center gap-1 border rounded-lg p-0.5 border-[#262c36]/40">
                          {(['left', 'center', 'right'] as const).map((align) => (
                            <button
                              key={align}
                              onClick={() => updateObject(selectedObject.id, { align })}
                              className={`px-2 py-1 rounded text-[11px] font-semibold capitalize transition-colors cursor-pointer ${
                                selectedObject.align === align
                                  ? isLight
                                    ? 'bg-[#0f172a] text-white'
                                    : 'bg-[#222730] text-white'
                                  : 'text-[#707a8a]'
                              }`}
                            >
                              {align}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Italic Toggle */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#707a8a]">Italic Style</span>
                        <button
                          onClick={() =>
                            updateObject(selectedObject.id, {
                              fontStyle: selectedObject.fontStyle === 'italic' ? 'normal' : 'italic',
                            })
                          }
                          className={`px-3 py-1 rounded-lg border text-xs font-semibold cursor-pointer ${
                            selectedObject.fontStyle === 'italic'
                              ? 'bg-[#3b82f6] text-white border-[#3b82f6]'
                              : isLight
                              ? 'border-[#e2e8f0]'
                              : 'border-[#262c36]'
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
                        <span className="text-xs font-semibold text-[#707a8a]">Photo Treatment</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleRemoveBackground}
                            disabled={isRemovingBg}
                            className="text-[11px] font-semibold text-[#fcd535] hover:underline cursor-pointer flex items-center gap-1 disabled:opacity-50"
                            title="Offline AI background removal"
                          >
                            <Wand2 className="w-3 h-3" />
                            <span>{isRemovingBg ? `${bgProgress}%` : 'Remove BG'}</span>
                          </button>
                          <button
                            onClick={() => replaceFileInputRef.current?.click()}
                            className="text-[11px] font-semibold text-[#ec4899] hover:underline cursor-pointer flex items-center gap-1"
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
                          <span className="font-semibold text-[#707a8a]">Aesthetic Filters</span>
                          <Wand2 className="w-3 h-3 text-[#fcd535]" />
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
                                  ? 'border-[#3b82f6] bg-[#3b82f6]/10 text-white ring-1 ring-[#3b82f6]'
                                  : isLight ? 'border-slate-200 hover:bg-slate-50' : 'border-[#262c36] hover:bg-[#181d24]'
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
                          <span className="font-semibold text-[#707a8a]">Shape Clipping Mask</span>
                          <Crop className="w-3 h-3 text-[#ec4899]" />
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
                                  ? 'border-[#ec4899] bg-[#ec4899]/15 text-white ring-1 ring-[#ec4899]'
                                  : isLight ? 'border-slate-200 text-slate-700 hover:bg-slate-50' : 'border-[#262c36] text-[#707a8a] hover:bg-[#181d24]'
                              }`}
                            >
                              {mask.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Fit Mode */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] text-[#707a8a]">Fit Mode</label>
                        <div className="flex gap-1">
                          {(['cover', 'contain', 'fill'] as const).map((fit) => (
                            <button
                              key={fit}
                              onClick={() => updateObject(selectedObject.id, { objectFit: fit })}
                              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize border cursor-pointer ${
                                selectedObject.objectFit === fit
                                  ? 'bg-[#3b82f6] text-white border-[#3b82f6]'
                                  : isLight
                                  ? 'border-[#e2e8f0] text-[#707a8a]'
                                  : 'border-[#262c36] text-[#707a8a]'
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
                          <span className="font-semibold text-[#707a8a]">Crop & Pan Alignment</span>
                          <span className="text-[10px] font-mono opacity-65">{((selectedObject as any).zoomScale || 1).toFixed(1)}x</span>
                        </div>

                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between text-[10px] text-[#707a8a]">
                            <span>Zoom ({((selectedObject as any).zoomScale || 1).toFixed(1)}x)</span>
                            <button
                              onClick={() => updateObject(selectedObject.id, { zoomScale: 1, panX: 0, panY: 0 } as any)}
                              className="text-[#fcd535] hover:underline cursor-pointer"
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
                            className="w-full accent-[#fcd535]"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] text-[#707a8a]">Pan X ({(selectedObject as any).panX || 0}%)</span>
                            <input
                              type="range"
                              min={-50}
                              max={50}
                              value={(selectedObject as any).panX || 0}
                              onChange={(e) => updateObject(selectedObject.id, { panX: Number(e.target.value) } as any)}
                              className="w-full accent-[#38bdf8]"
                            />
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] text-[#707a8a]">Pan Y ({(selectedObject as any).panY || 0}%)</span>
                            <input
                              type="range"
                              min={-50}
                              max={50}
                              value={(selectedObject as any).panY || 0}
                              onChange={(e) => updateObject(selectedObject.id, { panY: Number(e.target.value) } as any)}
                              className="w-full accent-[#38bdf8]"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Corner Radius & Opacity */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] text-[#707a8a]">
                          Corner Radius ({selectedObject.borderRadius}px)
                        </label>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={selectedObject.borderRadius}
                          onChange={(e) => updateObject(selectedObject.id, { borderRadius: Number(e.target.value) })}
                          className="w-full accent-[#3b82f6]"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] text-[#707a8a]">
                          Opacity ({Math.round(selectedObject.opacity * 100)}%)
                        </label>
                        <input
                          type="range"
                          min={0.1}
                          max={1}
                          step={0.05}
                          value={selectedObject.opacity}
                          onChange={(e) => updateObject(selectedObject.id, { opacity: Number(e.target.value) })}
                          className="w-full accent-[#3b82f6]"
                        />
                      </div>
                    </div>
                  )}

                  {/* SHAPE INSPECTOR */}
                  {selectedObject.type === 'shape' && (
                    <div className="flex flex-col gap-3">
                      <span className="text-xs font-semibold text-[#707a8a]">Shape & Colors</span>
                      {/* Fill & Stroke */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2">
                          <label className="text-[11px] text-[#707a8a]">Fill</label>
                          <input
                            type="color"
                            value={selectedObject.fill}
                            onChange={(e) => updateObject(selectedObject.id, { fill: e.target.value })}
                            className="w-7 h-7 rounded-lg cursor-pointer"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-[11px] text-[#707a8a]">Border</label>
                          <input
                            type="color"
                            value={selectedObject.stroke || '#000000'}
                            onChange={(e) => updateObject(selectedObject.id, { stroke: e.target.value })}
                            className="w-7 h-7 rounded-lg cursor-pointer"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] text-[#707a8a]">
                          Border Width ({selectedObject.strokeWidth}px)
                        </label>
                        <input
                          type="range"
                          min={0}
                          max={20}
                          value={selectedObject.strokeWidth}
                          onChange={(e) => updateObject(selectedObject.id, { strokeWidth: Number(e.target.value) })}
                          className="w-full accent-[#3b82f6]"
                        />
                      </div>

                      {selectedObject.shape === 'rounded-rect' && (
                        <div className="flex flex-col gap-1">
                          <label className="text-[11px] text-[#707a8a]">
                            Corner Radius ({selectedObject.borderRadius}px)
                          </label>
                          <input
                            type="range"
                            min={0}
                            max={60}
                            value={selectedObject.borderRadius}
                            onChange={(e) => updateObject(selectedObject.id, { borderRadius: Number(e.target.value) })}
                            className="w-full accent-[#3b82f6]"
                          />
                        </div>
                      )}

                      {/* Rubber Stamp Text Control */}
                      {selectedObject.shape === 'rubber-stamp' && (
                        <div className="flex flex-col gap-1 pt-1">
                          <label className="text-[11px] text-[#707a8a]">Rubber Stamp Text</label>
                          <input
                            type="text"
                            value={selectedObject.stampText || 'APPROVED'}
                            onChange={(e) => updateObject(selectedObject.id, { stampText: e.target.value.toUpperCase() })}
                            className={`w-full px-2.5 py-1.5 text-xs font-mono font-bold rounded-lg border focus:outline-none ${
                              isLight ? 'bg-white border-[#cbd5e1]' : 'bg-[#181d24] border-[#262c36]'
                            }`}
                            placeholder="e.g. APPROVED / VIP / REJECTED"
                          />
                        </div>
                      )}

                      {/* 5-Star Rating Control */}
                      {selectedObject.shape === 'rating-stars' && (
                        <div className="flex flex-col gap-1 pt-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[#707a8a]">Star Rating ({selectedObject.starRating ?? 5.0} / 5.0)</span>
                          </div>
                          <input
                            type="range"
                            min="0.5"
                            max="5.0"
                            step="0.5"
                            value={selectedObject.starRating ?? 5.0}
                            onChange={(e) => updateObject(selectedObject.id, { starRating: Number(e.target.value) })}
                            className="w-full accent-[#fcd535] cursor-pointer"
                          />
                        </div>
                      )}

                      {/* Live Barcode / QR Code Payload Binding */}
                      {(selectedObject.shape === 'barcode' || selectedObject.shape === 'qr-code') && (
                        <div className="flex flex-col gap-2 p-2.5 rounded-xl border border-current/15 bg-black/10 pt-2">
                          <div className="flex items-center justify-between text-xs font-semibold">
                            <span>{selectedObject.shape === 'qr-code' ? 'Live QR Payload' : 'Live Barcode Payload'}</span>
                            <span className="text-[10px] text-[#fcd535] font-mono">Real-time SVG</span>
                          </div>
                          <input
                            type="text"
                            value={selectedObject.payload || ''}
                            onChange={(e) => updateObject(selectedObject.id, { payload: e.target.value })}
                            className={`w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border focus:outline-none ${
                              isLight ? 'bg-white border-[#cbd5e1]' : 'bg-[#181d24] border-[#262c36]'
                            }`}
                            placeholder={selectedObject.shape === 'qr-code' ? 'Enter URL or text...' : 'e.g. ACS-94820'}
                          />
                          <label className="flex items-center gap-2 cursor-pointer pt-1">
                            <input
                              type="checkbox"
                              checked={selectedObject.showTextLabel ?? (selectedObject.shape === 'barcode')}
                              onChange={(e) => updateObject(selectedObject.id, { showTextLabel: e.target.checked })}
                              className="accent-[#fcd535] w-3.5 h-3.5 cursor-pointer"
                            />
                            <span className="text-[11px] text-[#707a8a]">Show human-readable text label underneath</span>
                          </label>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Stacking Order buttons */}
                  <div className="flex flex-col gap-2 pt-3 border-t border-[#262c36]/30">
                    <span className="text-xs font-semibold text-[#707a8a]">Stacking Order</span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button
                        onClick={() => reorderObject(selectedObject.id, 'front')}
                        className={`p-2 rounded-lg border font-medium cursor-pointer ${
                          isLight ? 'border-[#e2e8f0] hover:bg-[#f1f5f9]' : 'border-[#262c36] hover:bg-[#181d24]'
                        }`}
                      >
                        Bring to Front
                      </button>
                      <button
                        onClick={() => reorderObject(selectedObject.id, 'back')}
                        className={`p-2 rounded-lg border font-medium cursor-pointer ${
                          isLight ? 'border-[#e2e8f0] hover:bg-[#f1f5f9]' : 'border-[#262c36] hover:bg-[#181d24]'
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
                  <div className="pb-3 border-b border-[#262c36]/30">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#707a8a]">
                      Global Document Setup
                    </span>
                    <h4 className="text-sm font-semibold">Canvas Settings</h4>
                  </div>

                  {/* Canvas Presets */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-[#707a8a]">Dimensions Presets</label>
                    <div className="flex flex-col gap-1.5">
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
                              ? 'border-[#3b82f6] bg-[#3b82f6]/10 text-white font-semibold'
                              : isLight
                              ? 'border-[#e2e8f0] hover:bg-[#f8fafc]'
                              : 'border-[#262c36] hover:bg-[#181d24]'
                          }`}
                        >
                          <div>
                            <div className="text-xs font-semibold">{preset.label}</div>
                            <div className="text-[10px] text-[#707a8a]">{preset.description}</div>
                          </div>
                          <span className="text-[10px] font-mono text-[#707a8a]">
                            {preset.width}×{preset.height}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Canvas Width & Height */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-[#707a8a]">Custom Canvas Dimensions (px)</label>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <div className="flex items-center gap-2 p-2 rounded-lg border border-[#262c36]/40">
                        <span className="text-[#707a8a]">W</span>
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
                      <div className="flex items-center gap-2 p-2 rounded-lg border border-[#262c36]/40">
                        <span className="text-[#707a8a]">H</span>
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
                  </div>

                  {/* Background Color */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-[#707a8a]">Canvas Background</label>
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
                          isLight ? 'bg-[#f8fafc] border-[#cbd5e1]' : 'bg-[#181d24] border-[#262c36]'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Quick Color Presets */}
                  <div className="grid grid-cols-6 gap-1.5">
                    {[
                      '#ffffff',
                      '#f4ede4',
                      '#f8f8f8',
                      '#fff0f3',
                      '#f2effe',
                      '#111111',
                      '#141820',
                      '#e4ff37',
                      '#efe5cb',
                      '#f2f8f4',
                      '#1e293b',
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

                  {/* Tip banner */}
                  <div
                    className={`p-3 rounded-xl border text-[11px] leading-relaxed flex items-start gap-2 ${
                      isLight ? 'bg-[#f8fafc] border-[#e2e8f0] text-[#64748b]' : 'bg-[#181d24] border-[#262c36] text-[#9ca3af]'
                    }`}
                  >
                    <HelpCircle className="w-4 h-4 text-[#fcd535] shrink-0 mt-0.5" />
                    <span>
                      Click any element on the canvas or in the Layers tab to edit its text, typography, size, or colors.
                    </span>
                  </div>
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
                        ? 'bg-[#3b82f6] text-white shadow-sm'
                        : 'text-[#707a8a] hover:text-white'
                    }`}
                  >
                    Folders (4)
                  </button>
                  <button
                    onClick={() => setLayerViewMode('flat')}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                      layerViewMode === 'flat'
                        ? 'bg-[#3b82f6] text-white shadow-sm'
                        : 'text-[#707a8a] hover:text-white'
                    }`}
                  >
                    Stacking
                  </button>
                </div>
                <span className="text-[11px] font-mono text-[#707a8a]">
                  {doc.objects.length} Layers
                </span>
              </div>

              {doc.objects.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#707a8a]">
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
                            {folderOpen.photo ? <FolderOpen className="w-4 h-4 text-[#ec4899]" /> : <Folder className="w-4 h-4 text-[#ec4899]" />}
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
                                      ? 'border-[#ec4899] bg-[#ec4899]/10'
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
                                        className="text-[10px] font-bold text-[#ec4899] hover:underline cursor-pointer"
                                      >
                                        Replace
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedId(obj.id);
                                          handleRemoveBackground();
                                        }}
                                        className="text-[10px] font-bold text-[#fcd535] hover:underline cursor-pointer"
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
                            {folderOpen.text ? <FolderOpen className="w-4 h-4 text-[#38bdf8]" /> : <Folder className="w-4 h-4 text-[#38bdf8]" />}
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
                                    ? 'border-[#38bdf8] bg-[#38bdf8]/10'
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
                                      ? 'bg-white border-slate-300 text-black focus:border-[#38bdf8]'
                                      : 'bg-[#181d24] border-[#2c3340] text-white focus:border-[#38bdf8]'
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
                            {folderOpen.accents ? <FolderOpen className="w-4 h-4 text-[#fcd535]" /> : <Folder className="w-4 h-4 text-[#fcd535]" />}
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
                                    ? 'border-[#fcd535] bg-[#fcd535]/10'
                                    : 'border-current/10 hover:bg-black/5 dark:hover:bg-white/5'
                                }`}
                              >
                                <span className="font-semibold truncate max-w-[150px]">{obj.name}</span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSaveToRecycleClips(obj);
                                  }}
                                  className="text-[10px] font-bold text-[#0ecb81] hover:underline cursor-pointer"
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
                            {folderOpen.frame ? <FolderOpen className="w-4 h-4 text-[#a855f7]" /> : <Folder className="w-4 h-4 text-[#a855f7]" />}
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
                                    ? 'border-[#a855f7] bg-[#a855f7]/10'
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
                            ? 'bg-[#3b82f6]/10 border-[#3b82f6] text-white font-semibold'
                            : isLight
                            ? 'bg-[#f8fafc] border-[#e2e8f0] hover:bg-[#f1f5f9]'
                            : 'bg-[#181d24] border-[#262c36] hover:bg-[#222730]'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          {obj.type === 'text' && <Type className="w-3.5 h-3.5 text-[#38bdf8] shrink-0" />}
                          {obj.type === 'image' && <ImageIcon className="w-3.5 h-3.5 text-[#ec4899] shrink-0" />}
                          {obj.type === 'shape' && <Square className="w-3.5 h-3.5 text-[#eab308] shrink-0" />}
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
                            {obj.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-[#707a8a]" />}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateObject(obj.id, { locked: !obj.locked });
                            }}
                            className="p-1 hover:text-white"
                            title={obj.locked ? 'Unlock' : 'Lock'}
                          >
                            {obj.locked ? <Lock className="w-3.5 h-3.5 text-[#fcd535]" /> : <Unlock className="w-3.5 h-3.5 text-[#707a8a]" />}
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
                  <span className="font-bold text-[#0ecb81] uppercase tracking-wider font-mono">
                    ♻ Recycle Drawer
                  </span>
                  <span className="text-[10px] text-[#707a8a]">{savedClips.length} Clips</span>
                </div>
                <p className="text-[11px] text-[#707a8a] leading-relaxed">
                  Recycle any custom-styled text, cutout photo, or stamp across cards.
                </p>
              </div>

              {selectedObject && (
                <button
                  onClick={() => handleSaveToRecycleClips(selectedObject)}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer ${
                    isLight
                      ? 'bg-[#0f172a] text-white hover:bg-[#1e293b]'
                      : 'bg-[#0ecb81] text-black hover:bg-[#12e09b]'
                  }`}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Save "{selectedObject.name}" to Clips</span>
                </button>
              )}

              <div className="flex flex-col gap-2 pt-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#707a8a]">
                  Reusable Clips Tray
                </span>
                {savedClips.map((clip) => (
                  <div
                    key={clip.id}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-2 shadow-sm ${
                      isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#181d24] border-[#262c36]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="w-8 h-8 rounded-lg bg-black/10 dark:bg-white/10 flex items-center justify-center shrink-0">
                        {clip.type === 'image' ? (
                          <ImageIcon className="w-4 h-4 text-[#ec4899]" />
                        ) : clip.type === 'text' ? (
                          <Type className="w-4 h-4 text-[#38bdf8]" />
                        ) : (
                          <Sparkles className="w-4 h-4 text-[#fcd535]" />
                        )}
                      </div>
                      <div className="truncate">
                        <span className="text-xs font-bold truncate block">{clip.name}</span>
                        <span className="text-[10px] font-mono text-[#707a8a]">{clip.width}×{clip.height}px</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleInsertRecycledClip(clip)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                        isLight
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                          : 'bg-[#222730] hover:bg-[#2c3340] text-[#fcd535]'
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
          isLight ? 'bg-white/95 border-[#e2e8f0]' : 'bg-[#111417]/95 border-[#262c36]'
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
                ? isLight ? 'bg-[#0f172a] text-white shadow-sm' : 'bg-[#fcd535] text-black shadow-sm'
                : isLight ? 'text-[#475569] hover:bg-[#f1f5f9]' : 'text-[#c4c7c8] hover:bg-[#181d24]'
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
                ? isLight ? 'bg-[#0f172a] text-white shadow-sm' : 'bg-[#fcd535] text-black shadow-sm'
                : isLight ? 'text-[#475569] hover:bg-[#f1f5f9]' : 'text-[#c4c7c8] hover:bg-[#181d24]'
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
                ? isLight ? 'bg-[#0f172a] text-white shadow-sm' : 'bg-[#fcd535] text-black shadow-sm'
                : isLight ? 'text-[#475569] hover:bg-[#f1f5f9]' : 'text-[#c4c7c8] hover:bg-[#181d24]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Layers ({doc.objects.length})</span>
          </button>

          <button
            onClick={handleFitToScreen}
            className={`py-2 px-1 rounded-xl flex flex-col items-center gap-1 text-[11px] font-semibold transition-all cursor-pointer ${
              isLight ? 'text-[#475569] hover:bg-[#f1f5f9]' : 'text-[#c4c7c8] hover:bg-[#181d24]'
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
              isLight ? 'bg-white border-[#e2e8f0] text-[#0f172a]' : 'bg-[#111417] border-[#262c36] text-[#e1e2e7]'
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
                className="p-3 rounded-xl border flex flex-col items-center gap-1.5 cursor-pointer hover:border-[#fcd535]"
              >
                <LayoutTemplate className="w-5 h-5 text-[#fcd535]" />
                <span className="text-xs font-medium">Templates</span>
              </button>

              <button
                onClick={() => {
                  setMediaModalOpen(true);
                  setMobileAddSheetOpen(false);
                }}
                className="p-3 rounded-xl border flex flex-col items-center gap-1.5 cursor-pointer hover:border-[#fcd535]"
              >
                <BookOpen className="w-5 h-5 text-[#fcd535]" />
                <span className="text-xs font-medium">Book / Song</span>
              </button>

              <button
                onClick={() => {
                  addObject(createTextObject({ text: 'Your text here', fontSize: 24, color: isLight ? '#0f172a' : '#ffffff' }));
                  setMobileAddSheetOpen(false);
                }}
                className="p-3 rounded-xl border flex flex-col items-center gap-1.5 cursor-pointer hover:border-[#fcd535]"
              >
                <Type className="w-5 h-5 text-[#3b82f6]" />
                <span className="text-xs font-medium">Text</span>
              </button>

              <button
                onClick={() => {
                  fileInputRef.current?.click();
                  setMobileAddSheetOpen(false);
                }}
                className="p-3 rounded-xl border flex flex-col items-center gap-1.5 cursor-pointer hover:border-[#fcd535]"
              >
                <Upload className="w-5 h-5 text-[#10b981]" />
                <span className="text-xs font-medium">Upload Photo</span>
              </button>

              <button
                onClick={() => {
                  addObject(createImageObject(ASSET_AVATARS.jenniePretty, { name: 'Illustrated Avatar', width: 140, height: 140 }));
                  setMobileAddSheetOpen(false);
                }}
                className="p-3 rounded-xl border flex flex-col items-center gap-1.5 cursor-pointer hover:border-[#fcd535]"
              >
                <Sparkles className="w-5 h-5 text-[#8b5cf6]" />
                <span className="text-xs font-medium">Avatar</span>
              </button>

              <button
                onClick={() => {
                  addObject(createShapeObject('rect', { name: 'Card Box', width: 200, height: 120, fill: '#f1f5f9' }));
                  setMobileAddSheetOpen(false);
                }}
                className="p-3 rounded-xl border flex flex-col items-center gap-1.5 cursor-pointer hover:border-[#fcd535]"
              >
                <Square className="w-5 h-5 text-[#f59e0b]" />
                <span className="text-xs font-medium">Box</span>
              </button>

              <button
                onClick={() => {
                  addObject(createShapeObject('circle', { name: 'Circle Badge', width: 100, height: 100, fill: '#e2e8f0' }));
                  setMobileAddSheetOpen(false);
                }}
                className="p-3 rounded-xl border flex flex-col items-center gap-1.5 cursor-pointer hover:border-[#fcd535]"
              >
                <Circle className="w-5 h-5 text-[#ec4899]" />
                <span className="text-xs font-medium">Circle</span>
              </button>

              <button
                onClick={() => {
                  addObject(createShapeObject('star', { name: 'Star Badge', width: 80, height: 80, fill: '#fcd535' }));
                  setMobileAddSheetOpen(false);
                }}
                className="p-3 rounded-xl border flex flex-col items-center gap-1.5 cursor-pointer hover:border-[#fcd535]"
              >
                <Star className="w-5 h-5 text-[#fcd535]" />
                <span className="text-xs font-medium">Star</span>
              </button>

              <button
                onClick={() => {
                  addObject(createShapeObject('heart', { name: 'Heart Stamp', width: 80, height: 80, fill: '#ff4d6d' }));
                  setMobileAddSheetOpen(false);
                }}
                className="p-3 rounded-xl border flex flex-col items-center gap-1.5 cursor-pointer hover:border-[#fcd535]"
              >
                <Heart className="w-5 h-5 text-[#ff4d6d]" />
                <span className="text-xs font-medium">Heart</span>
              </button>

              <button
                onClick={() => {
                  addObject(createImageObject(ASSET_STICKERS.barcode, { name: 'Barcode Sticker', width: 200, height: 50 }));
                  setMobileAddSheetOpen(false);
                }}
                className="p-3 rounded-xl border flex flex-col items-center gap-1.5 cursor-pointer hover:border-[#fcd535]"
              >
                <Barcode className="w-5 h-5 text-[#f97316]" />
                <span className="text-xs font-medium">Barcode</span>
              </button>

              <button
                onClick={() => {
                  addObject(createImageObject(ASSET_STICKERS.qrCode, { name: 'QR Code Sticker', width: 80, height: 80 }));
                  setMobileAddSheetOpen(false);
                }}
                className="p-3 rounded-xl border flex flex-col items-center gap-1.5 cursor-pointer hover:border-[#fcd535]"
              >
                <QrCode className="w-5 h-5 text-[#06b6d4]" />
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
              isLight ? 'bg-white border-[#e2e8f0] text-[#0f172a]' : 'bg-[#111417] border-[#262c36] text-[#e1e2e7]'
            }`}
          >
            {/* Sheet Tabs Header */}
            <div className={`p-2 border-b flex items-center justify-between shrink-0 ${isLight ? 'border-[#e2e8f0]' : 'border-[#262c36]'}`}>
              <div className="flex gap-1">
                <button
                  onClick={() => setActiveSidebarTab('inspector')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                    activeSidebarTab === 'inspector'
                      ? isLight ? 'bg-[#0f172a] text-white' : 'bg-[#fcd535] text-black'
                      : 'text-[#707a8a]'
                  }`}
                >
                  Inspector
                </button>
                <button
                  onClick={() => setActiveSidebarTab('layers')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                    activeSidebarTab === 'layers'
                      ? isLight ? 'bg-[#0f172a] text-white' : 'bg-[#fcd535] text-black'
                      : 'text-[#707a8a]'
                  }`}
                >
                  Layers ({doc.objects.length})
                </button>
              </div>
              <button
                onClick={() => setMobileInspectorOpen(false)}
                className="px-2.5 py-1 text-xs font-semibold text-[#707a8a] hover:text-white"
              >
                Done
              </button>
            </div>

            {/* Content Container */}
            <div className="flex-1 overflow-y-auto p-4 pb-12">
              {activeSidebarTab === 'inspector' ? (
                selectedObject ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between pb-2 border-b border-current/10">
                      <div>
                        <span className="text-[10px] font-mono text-[#707a8a] uppercase">{selectedObject.type} Layer</span>
                        <h4 className="text-sm font-semibold truncate max-w-[200px]">{selectedObject.name}</h4>
                      </div>
                      <button
                        onClick={() => deleteObject(selectedObject.id)}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10"
                        title="Delete layer"
                      >
                        <Trash2 className="w-4 h-4" />
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
                            isLight ? 'bg-white border-[#cbd5e1]' : 'bg-[#181d24] border-[#262c36]'
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
                  <div className="text-center py-8 text-xs text-[#707a8a]">
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
                            ? isLight ? 'bg-[#f1f5f9] border-[#d97706]' : 'bg-[#181d24] border-[#fcd535]'
                            : isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#14171d] border-[#262c36]'
                        }`}
                      >
                        <span className="text-xs font-medium truncate max-w-[180px]">{obj.name}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateObject(obj.id, { visible: !obj.visible });
                            }}
                            className="p-1 text-[#707a8a]"
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
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`w-full max-w-4xl max-h-[85vh] rounded-2xl border flex flex-col overflow-hidden shadow-2xl ${
              isLight ? 'bg-white border-[#cbd5e1]' : 'bg-[#14171d] border-[#262c36]'
            }`}
          >
            {/* Header */}
            <div className="p-5 border-b border-[#262c36]/40 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Aesthetic Template Library</h3>
                <p className="text-xs text-[#707a8a]">
                  Select a template to load its editable layers directly into your canvas.
                </p>
              </div>
              <button
                onClick={() => setTemplateDrawerOpen(false)}
                className="px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>

            {/* Grid of Templates */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {PRESET_TEMPLATES.map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => handleApplyTemplate(tmpl)}
                  className={`border rounded-xl p-4 flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-lg cursor-pointer ${
                    isLight ? 'bg-[#f8fafc] border-[#e2e8f0]' : 'bg-[#181d24] border-[#262c36]'
                  }`}
                >
                  <div
                    style={{ backgroundColor: tmpl.theme.bg, color: tmpl.theme.ink }}
                    className="h-28 rounded-lg p-3 flex flex-col justify-between mb-3 border border-black/10 text-[11px]"
                  >
                    <div className="flex justify-between font-mono text-[9px] opacity-75">
                      <span>{tmpl.tag}</span>
                      <span>{tmpl.badge}</span>
                    </div>
                    <div className="font-semibold line-clamp-2">{tmpl.title}</div>
                  </div>

                  <div>
                    <h5 className="text-xs font-bold truncate">{tmpl.title}</h5>
                    <span className="text-[10px] text-[#707a8a]">{tmpl.categoryLabel}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
