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
} from 'lucide-react';

interface CanvasEditorViewProps {
  theme?: 'dark' | 'light';
  onNavigateHome?: () => void;
}

const STORAGE_KEY = 'aesthetic_canvas_editor_draft_v1';
const MAX_HISTORY = 40;

export const CanvasEditorView: React.FC<CanvasEditorViewProps> = ({
  theme = 'dark',
}) => {
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

  // Viewport / Zoom
  const [zoom, setZoom] = useState<number>(1);
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [activeSidebarTab, setActiveSidebarTab] = useState<'inspector' | 'layers' | 'templates'>('inspector');

  // Modals & Drawers
  const [templateDrawerOpen, setTemplateDrawerOpen] = useState(false);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // References
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const canvasElementRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    (e: React.MouseEvent | MouseEvent) => {
      if (!canvasElementRef.current) return { x: 0, y: 0 };
      const rect = canvasElementRef.current.getBoundingClientRect();
      return {
        x: (e.clientX - rect.left) / zoom,
        y: (e.clientY - rect.top) / zoom,
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

  // ───────────────────────────────────────────────────────────────────────────
  // EXPORT ENGINE
  // ───────────────────────────────────────────────────────────────────────────

  const handleExport = async (format: 'png' | 'jpeg' | 'webp') => {
    if (!canvasElementRef.current) return;
    setExporting(true);
    setExportDropdownOpen(false);
    setSelectedId(null); // Temporarily deselect so handles & rings are NOT exported

    // Wait a frame for React to clear selection outlines
    await new Promise((resolve) => setTimeout(resolve, 80));

    try {
      const node = canvasElementRef.current;
      const scale = 2; // 2x Retina sharpness
      const options = {
        quality: 0.95,
        pixelRatio: scale,
        canvasWidth: doc.canvasWidth * scale,
        canvasHeight: doc.canvasHeight * scale,
      };

      let dataUrl: string;
      if (format === 'png') {
        dataUrl = await toPng(node, options);
      } else if (format === 'jpeg') {
        dataUrl = await toJpeg(node, { ...options, backgroundColor: doc.background || '#ffffff' });
      } else {
        const blob = await toBlob(node, { ...options, type: 'image/webp' });
        if (!blob) throw new Error('WebP blob creation failed');
        dataUrl = URL.createObjectURL(blob);
      }

      const filename = `${doc.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'aesthetic-card'}.${format}`;
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();

      showToast(`Exported ${doc.title} (${doc.canvasWidth}×${doc.canvasHeight}px, 2x Retina)!`);
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

  // ───────────────────────────────────────────────────────────────────────────
  // RENDER HELPERS
  // ───────────────────────────────────────────────────────────────────────────

  return (
    <div
      className={`w-full min-h-screen flex flex-col pt-16 transition-colors duration-200 ${
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

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* TOP STUDIO TOOLBAR                                                    */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      <header
        className={`h-14 border-b px-4 flex items-center justify-between shrink-0 transition-colors z-30 ${
          isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#14171d] border-[#222730]'
        }`}
      >
        {/* Left: Back & Title */}
        <div className="flex items-center gap-3">
          <a
            href="/templates"
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isLight ? 'border-[#e2e8f0] hover:bg-[#f8fafc]' : 'border-[#262c36] hover:bg-[#181d24]'
            }`}
            title="Browse all templates"
          >
            <ArrowLeft className="w-4 h-4" />
          </a>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={doc.title}
              onChange={(e) => setDoc((prev) => ({ ...prev, title: e.target.value }))}
              onBlur={(e) => commitDocumentChange({ ...doc, title: e.target.value })}
              className={`text-sm font-semibold tracking-tight bg-transparent border-b border-transparent hover:border-[#707a8a] focus:border-[#fcd535] focus:outline-none px-1 py-0.5 rounded transition-all max-w-[200px] sm:max-w-xs ${
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
        <div className="flex items-center gap-1">
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className={`p-2 rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
              isLight ? 'hover:bg-[#f1f3f5]' : 'hover:bg-[#181d24]'
            }`}
            title="Undo (⌘Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className={`p-2 rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
              isLight ? 'hover:bg-[#f1f3f5]' : 'hover:bg-[#181d24]'
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
          </div>

          <div className="h-4 w-px bg-[#262c36]/40 mx-1 hidden sm:block" />

          {/* Grid Toggle */}
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
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
        </div>

        {/* Right: Template Picker, Blank Canvas & Export */}
        <div className="flex items-center gap-2">
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
            onClick={() => handleCreateBlank()}
            className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
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
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md cursor-pointer ${
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
                className={`absolute right-0 top-full mt-2 w-48 rounded-xl border p-1 shadow-2xl z-50 flex flex-col gap-0.5 ${
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
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* MAIN WORKSPACE BODY                                                   */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* LEFT TOOLBAR: Add Elements */}
        <aside
          className={`w-16 border-r flex flex-col items-center py-4 gap-4 shrink-0 transition-colors z-20 ${
            isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#14171d] border-[#222730]'
          }`}
        >
          {/* Add Text */}
          <button
            onClick={() =>
              addObject(
                createTextObject({
                  text: 'New Aesthetic Text',
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

          {/* Quick Badges: Barcode / QR / Seal */}
          <button
            onClick={() =>
              addObject(
                createImageObject(ASSET_STICKERS.barcode, {
                  name: 'Barcode Sticker',
                  width: 240,
                  height: 60,
                  x: Math.round(doc.canvasWidth / 2 - 120),
                  y: doc.canvasHeight - 100,
                })
              )
            }
            className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center gap-0.5 border transition-all cursor-pointer group ${
              isLight
                ? 'bg-[#f8fafc] border-[#e2e8f0] hover:border-[#cbd5e1]'
                : 'bg-[#181d24] border-[#262c36] hover:border-[#444748]'
            }`}
            title="Add Barcode Sticker"
          >
            <Barcode className="w-4 h-4 text-[#f97316]" />
            <span className="text-[9px] font-medium text-[#707a8a]">Barcode</span>
          </button>

          <button
            onClick={() =>
              addObject(
                createImageObject(ASSET_STICKERS.qrCode, {
                  name: 'QR Code Sticker',
                  width: 100,
                  height: 100,
                  x: Math.round(doc.canvasWidth / 2 - 50),
                  y: Math.round(doc.canvasHeight / 2 - 50),
                })
              )
            }
            className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center gap-0.5 border transition-all cursor-pointer group ${
              isLight
                ? 'bg-[#f8fafc] border-[#e2e8f0] hover:border-[#cbd5e1]'
                : 'bg-[#181d24] border-[#262c36] hover:border-[#444748]'
            }`}
            title="Add QR Code"
          >
            <QrCode className="w-4 h-4 text-[#06b6d4]" />
            <span className="text-[9px] font-medium text-[#707a8a]">QR</span>
          </button>
        </aside>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* CENTER: THE INTERACTIVE CANVAS VIEWPORT                             */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <main
          ref={canvasContainerRef}
          onClick={() => setSelectedId(null)}
          className={`flex-1 overflow-auto flex items-center justify-center p-8 select-none relative transition-colors ${
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
          {/* Zoom Wrapper */}
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

                      {/* 2. IMAGE OBJECT */}
                      {obj.type === 'image' && (
                        <div
                          style={{
                            width: '100%',
                            height: '100%',
                            opacity: obj.opacity,
                            borderRadius: `${obj.borderRadius}px`,
                            overflow: 'hidden',
                          }}
                        >
                          <img
                            src={obj.src}
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

                      {/* 3. SHAPE OBJECT */}
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
                            { pos: 'e', top: '50%', right: -5, cursor: 'ew-resize', transform: 'translateY(-50%)' },
                            { pos: 'se', bottom: -5, right: -5, cursor: 'nwse-resize' },
                            { pos: 's', bottom: -5, left: '50%', cursor: 'ns-resize', transform: 'translateX(-50%)' },
                            { pos: 'sw', bottom: -5, left: -5, cursor: 'nesw-resize' },
                            { pos: 'w', top: '50%', left: -5, cursor: 'ew-resize', transform: 'translateY(-50%)' },
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

                      {/* If locked, display subtle lock badge on hover/select */}
                      {isSelected && obj.locked && (
                        <div className="absolute top-1 right-1 p-1 rounded bg-black/60 text-white pointer-events-none">
                          <Lock className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </main>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* RIGHT SIDEBAR: Inspector & Layers                                   */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <aside
          className={`w-80 border-l flex flex-col shrink-0 transition-colors z-20 ${
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
                    <div className="flex flex-col gap-3">
                      <span className="text-xs font-semibold text-[#707a8a]">Photo Properties</span>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className={`w-full py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                          isLight
                            ? 'bg-[#f8fafc] border-[#cbd5e1] hover:bg-[#f1f5f9]'
                            : 'bg-[#181d24] border-[#262c36] hover:bg-[#222730]'
                        }`}
                      >
                        <Upload className="w-3.5 h-3.5 text-[#ec4899]" />
                        <span>Replace Photo</span>
                      </button>

                      {/* Fit Mode */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] text-[#707a8a]">Fit Mode</label>
                        <div className="grid grid-cols-3 gap-1">
                          {(['cover', 'contain', 'fill'] as const).map((fit) => (
                            <button
                              key={fit}
                              onClick={() => updateObject(selectedObject.id, { objectFit: fit })}
                              className={`py-1.5 rounded-lg text-xs font-semibold capitalize border cursor-pointer ${
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
                            commitDocumentChange({
                              ...doc,
                              canvasWidth: preset.width,
                              canvasHeight: preset.height,
                            });
                            showToast(`Resized canvas to ${preset.label} (${preset.width}×${preset.height}px)`);
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

          {/* TAB 2: LAYERS PANEL */}
          {activeSidebarTab === 'layers' && (
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1.5">
              <div className="flex items-center justify-between px-1 py-1 text-xs text-[#707a8a] font-medium">
                <span>Top to bottom stacking</span>
                <span>{doc.objects.length} Layers</span>
              </div>

              {doc.objects.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#707a8a]">
                  No layers on canvas yet. Click Text, Photo, or Box on the left toolbar to add your first object.
                </div>
              ) : (
                [...doc.objects]
                  .sort((a, b) => b.zIndex - a.zIndex) // Top layer first
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
                        {/* Layer icon & name */}
                        <div className="flex items-center gap-2 truncate">
                          {obj.type === 'text' && <Type className="w-3.5 h-3.5 text-[#38bdf8] shrink-0" />}
                          {obj.type === 'image' && <ImageIcon className="w-3.5 h-3.5 text-[#ec4899] shrink-0" />}
                          {obj.type === 'shape' && <Square className="w-3.5 h-3.5 text-[#eab308] shrink-0" />}

                          <span className="text-xs truncate max-w-[140px]">{obj.name}</span>
                        </div>

                        {/* Visibility, Lock & Delete actions */}
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
        </aside>
      </div>

      {/* ───────────────────────────────────────────────────────────────────── */}
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
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
