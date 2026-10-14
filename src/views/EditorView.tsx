import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { CardTemplate, AspectRatioId, FontChoice, ExportFormat, CardState } from '../types/card';
import { ASPECT_RATIOS, PALETTE_PRESETS, SAMPLE_QUOTES, PRESET_TEMPLATES } from '../data/templates';
import { toPng, toBlob, toSvg } from 'html-to-image';
import confetti from 'canvas-confetti';
import { updatePageSEO } from '../utils/seo';
import {
  RotateCcw,
  Undo2,
  Redo2,
  Crop,
  ZoomIn,
  ZoomOut,
  Grid,
  Copy,
  Download,
  Shuffle,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  Palette,
  Sliders,
  Check,
  ChevronDown,
  Sparkles,
  LayoutTemplate,
  Wand2,
  ArrowLeft,
  FileText,
  Save,
  CheckCircle2,
  X,
  Layers,
  MoreHorizontal,
} from 'lucide-react';

interface EditorViewProps {
  initialTemplate?: CardTemplate;
  onNavigateHome?: () => void;
  theme?: 'dark' | 'light';
  onEditingSheetChange?: (isOpen: boolean) => void;
}

const DRAFT_STORAGE_KEY = 'aesthetic_card_studio_draft';

export const EditorView: React.FC<EditorViewProps> = ({
  initialTemplate,
  theme = 'dark',
  onEditingSheetChange,
}) => {
  const isLight = theme === 'light';

  useEffect(() => {
    updatePageSEO({
      title: 'Online Card Creator Studio — Aesthetic Text-to-Card Generator',
      description:
        'Interactive browser-based card creator. Format poetry, literature quotes, and minimal study notes with custom typography, archival color palettes, and instant 2x Retina exports.',
      canonicalPath: '/create',
      ogType: 'website',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Aesthetic Card Creator Studio',
        applicationCategory: 'DesignApplication',
        operatingSystem: 'All web browsers',
        browserRequirements: 'Requires JavaScript. Works in Chrome, Safari, Firefox, Edge.',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
      },
    });
  }, []);

  // Base state definitions
  const [docTitle, setDocTitle] = useState('Reflections on Design — Vol. 04');
  const [aspectRatio, setAspectRatio] = useState<AspectRatioId>('1:1');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'type' | 'palette' | 'decor'>('content');

  // Selected canvas element for direct manipulation
  const [selectedElement, setSelectedElement] = useState<'quote' | 'author' | 'tag' | 'badge' | 'card' | null>(null);

  // Content state
  const [quote, setQuote] = useState(
    initialTemplate?.quote ||
      'Simplicity is not the lack of clutter, that’s simply a consequence of simplicity. Simplicity is describing the purpose and place of an object.'
  );
  const [author, setAuthor] = useState(initialTemplate?.author || 'Jony Ive — On Designing the Necessary');
  const [tag, setTag] = useState(initialTemplate?.tag || 'VOL. 08 • ST. GERMAIN NOTES');
  const [badge, setBadge] = useState(initialTemplate?.badge || 'EST. 1997');

  // Styling state
  const [bgColor, setBgColor] = useState(initialTemplate?.theme.bg || '#f4ede4');
  const [inkColor, setInkColor] = useState(initialTemplate?.theme.ink || '#2c2825');
  const [fontChoice, setFontChoice] = useState<FontChoice>(initialTemplate?.font || 'editorial');
  const [fontSize, setFontSize] = useState<number>(initialTemplate?.fontSize || 26);
  const [align, setAlign] = useState<'left' | 'center' | 'right'>(initialTemplate?.align || 'left');
  const [padding, setPadding] = useState<number>(initialTemplate?.padding || 36);
  const [borderRadius, setBorderRadius] = useState<number>(initialTemplate?.borderRadius || 12);
  const [showGrain, setShowGrain] = useState(initialTemplate?.showGrain ?? true);
  const [showBorder, setShowBorder] = useState(initialTemplate?.showBorder ?? true);
  const [showIcon, setShowIcon] = useState(initialTemplate?.showIcon ?? true);
  const [iconName, setIconName] = useState(initialTemplate?.iconName || 'format_quote');

  // UI Modals & Popovers
  const [aspectMenuOpen, setAspectMenuOpen] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [templateDrawerOpen, setTemplateDrawerOpen] = useState(false);
  const [preserveTextOnSwitch, setPreserveTextOnSwitch] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [draftSavedTimestamp, setDraftSavedTimestamp] = useState<string>('Saved locally');

  // Mobile drawer & sheet state
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [mobileOptionsOpen, setMobileOptionsOpen] = useState(false);

  useEffect(() => {
    onEditingSheetChange?.(mobileSheetOpen || mobileOptionsOpen);
  }, [mobileSheetOpen, mobileOptionsOpen, onEditingSheetChange]);

  const openMobileTab = (tab: 'content' | 'type' | 'palette' | 'decor') => {
    setActiveTab(tab);
    setMobileSheetOpen(true);
  };

  // Card element ref for exports
  const cardRef = useRef<HTMLDivElement>(null);
  const quoteInputRef = useRef<HTMLTextAreaElement>(null);
  const authorInputRef = useRef<HTMLInputElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);

  // Undo / Redo History Stack
  const [history, setHistory] = useState<CardState[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const isHistoryActionRef = useRef<boolean>(false);

  // Helper to construct current CardState snapshot
  const getCurrentSnapshot = useCallback((): CardState => {
    return {
      docTitle,
      quote,
      author,
      tag,
      badge,
      bgColor,
      inkColor,
      fontChoice,
      fontSize,
      align,
      padding,
      borderRadius,
      showGrain,
      showBorder,
      showIcon,
      iconName,
      aspectRatio,
    };
  }, [
    docTitle,
    quote,
    author,
    tag,
    badge,
    bgColor,
    inkColor,
    fontChoice,
    fontSize,
    align,
    padding,
    borderRadius,
    showGrain,
    showBorder,
    showIcon,
    iconName,
    aspectRatio,
  ]);

  // Push snapshot into history stack
  const pushHistorySnapshot = useCallback(
    (snapshot: CardState) => {
      if (isHistoryActionRef.current) return;
      setHistory((prev) => {
        const truncated = prev.slice(0, historyIndex + 1);
        // Avoid duplicate identical states
        const last = truncated[truncated.length - 1];
        if (last && JSON.stringify(last) === JSON.stringify(snapshot)) {
          return prev;
        }
        const updated = [...truncated, snapshot];
        // Cap history to 50 items
        if (updated.length > 50) updated.shift();
        return updated;
      });
      setHistoryIndex((prev) => Math.min(prev + 1, 49));
    },
    [historyIndex]
  );

  // Initialize history with initial state or restored draft on mount
  useEffect(() => {
    // Check local draft
    const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!initialTemplate && savedDraft) {
      try {
        const parsed: CardState = JSON.parse(savedDraft);
        setDocTitle(parsed.docTitle || 'Reflections on Design — Vol. 04');
        setQuote(parsed.quote);
        setAuthor(parsed.author);
        setTag(parsed.tag);
        setBadge(parsed.badge);
        setBgColor(parsed.bgColor);
        setInkColor(parsed.inkColor);
        setFontChoice(parsed.fontChoice);
        setFontSize(parsed.fontSize);
        setAlign(parsed.align);
        setPadding(parsed.padding);
        setBorderRadius(parsed.borderRadius);
        setShowGrain(parsed.showGrain);
        setShowBorder(parsed.showBorder);
        setShowIcon(parsed.showIcon);
        setIconName(parsed.iconName);
        setAspectRatio(parsed.aspectRatio);

        setHistory([parsed]);
        setHistoryIndex(0);
        showToast('Restored your previous local draft');
        return;
      } catch (e) {
        console.warn('Failed to parse local draft:', e);
      }
    }

    const initialSnapshot = getCurrentSnapshot();
    setHistory([initialSnapshot]);
    setHistoryIndex(0);
  }, []);

  // Sync when initialTemplate prop changes
  useEffect(() => {
    if (initialTemplate) {
      setQuote(initialTemplate.quote);
      setAuthor(initialTemplate.author);
      setTag(initialTemplate.tag);
      setBadge(initialTemplate.badge);
      setBgColor(initialTemplate.theme.bg);
      setInkColor(initialTemplate.theme.ink);
      setFontChoice(initialTemplate.font);
      setFontSize(initialTemplate.fontSize);
      setAlign(initialTemplate.align);
      setPadding(initialTemplate.padding);
      setBorderRadius(initialTemplate.borderRadius);
      setShowGrain(initialTemplate.showGrain);
      setShowBorder(initialTemplate.showBorder);
      setShowIcon(initialTemplate.showIcon);
      setIconName(initialTemplate.iconName);

      const snapshot: CardState = {
        docTitle,
        quote: initialTemplate.quote,
        author: initialTemplate.author,
        tag: initialTemplate.tag,
        badge: initialTemplate.badge,
        bgColor: initialTemplate.theme.bg,
        inkColor: initialTemplate.theme.ink,
        fontChoice: initialTemplate.font,
        fontSize: initialTemplate.fontSize,
        align: initialTemplate.align,
        padding: initialTemplate.padding,
        borderRadius: initialTemplate.borderRadius,
        showGrain: initialTemplate.showGrain,
        showBorder: initialTemplate.showBorder,
        showIcon: initialTemplate.showIcon,
        iconName: initialTemplate.iconName,
        aspectRatio,
      };
      setHistory([snapshot]);
      setHistoryIndex(0);
    }
  }, [initialTemplate]);

  // Debounced auto-save & history snapshot recording
  useEffect(() => {
    if (isHistoryActionRef.current) {
      isHistoryActionRef.current = false;
      return;
    }

    const timer = setTimeout(() => {
      const snap = getCurrentSnapshot();
      pushHistorySnapshot(snap);

      // Save to localStorage
      try {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(snap));
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setDraftSavedTimestamp(`Saved at ${timeStr}`);
      } catch (err) {
        console.error('LocalStorage draft save error:', err);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [
    docTitle,
    quote,
    author,
    tag,
    badge,
    bgColor,
    inkColor,
    fontChoice,
    fontSize,
    align,
    padding,
    borderRadius,
    showGrain,
    showBorder,
    showIcon,
    iconName,
    aspectRatio,
  ]);

  // Show temporary toast message
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 3200);
  };

  // Undo implementation
  const handleUndo = () => {
    if (historyIndex > 0) {
      isHistoryActionRef.current = true;
      const targetState = history[historyIndex - 1];
      applySnapshot(targetState);
      setHistoryIndex(historyIndex - 1);
      showToast('Undo applied');
    }
  };

  // Redo implementation
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      isHistoryActionRef.current = true;
      const targetState = history[historyIndex + 1];
      applySnapshot(targetState);
      setHistoryIndex(historyIndex + 1);
      showToast('Redo applied');
    }
  };

  // Apply a snapshot to state
  const applySnapshot = (s: CardState) => {
    setDocTitle(s.docTitle);
    setQuote(s.quote);
    setAuthor(s.author);
    setTag(s.tag);
    setBadge(s.badge);
    setBgColor(s.bgColor);
    setInkColor(s.inkColor);
    setFontChoice(s.fontChoice);
    setFontSize(s.fontSize);
    setAlign(s.align);
    setPadding(s.padding);
    setBorderRadius(s.borderRadius);
    setShowGrain(s.showGrain);
    setShowBorder(s.showBorder);
    setShowIcon(s.showIcon);
    setIconName(s.iconName);
    setAspectRatio(s.aspectRatio);
  };

  // Global keydown shortcuts: Cmd+Z, Cmd+Shift+Z, Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmd = e.metaKey || e.ctrlKey;
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
      } else if (e.key === 'Escape') {
        setSelectedElement(null);
        setAspectMenuOpen(false);
        setExportMenuOpen(false);
        setTemplateDrawerOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history]);

  // Current aspect preset
  const currentRatioPreset = ASPECT_RATIOS.find((r) => r.id === aspectRatio) || ASPECT_RATIOS[0];

  // Font class resolver
  const getFontFamilyClass = (f: FontChoice) => {
    switch (f) {
      case 'editorial':
        return 'font-editorial';
      case 'serif':
        return 'font-display-serif';
      case 'sans':
        return 'font-modern-sans';
      case 'mono':
        return 'font-mono-code';
      default:
        return 'font-editorial';
    }
  };

  // Auto-fit font size based on text length
  const handleAutoFitFontSize = () => {
    const length = quote.length;
    let optimal = 26;
    if (length > 350) optimal = 18;
    else if (length > 250) optimal = 20;
    else if (length > 180) optimal = 22;
    else if (length > 120) optimal = 24;
    else if (length < 60) optimal = 32;

    setFontSize(optimal);
    showToast(`Adjusted font size to ${optimal}px for optimal typographic balance`);
  };

  // Random quote inspirer
  const handleRandomQuote = () => {
    const random = SAMPLE_QUOTES[Math.floor(Math.random() * SAMPLE_QUOTES.length)];
    setQuote(random.q);
    setAuthor(random.a);
    setTag(random.t);
    showToast('Loaded inspirational excerpt');
  };

  // Reset to clean default values
  const handleReset = () => {
    if (window.confirm('Reset this card to clean editorial defaults? Unsaved custom styling will be replaced.')) {
      setQuote('Simplicity is about subtracting the obvious and adding the meaningful.');
      setAuthor('John Maeda — The Laws of Simplicity');
      setTag('DAILY REFLECTION • VOLUME 01');
      setBadge('CANON');
      setBgColor('#f4ede4');
      setInkColor('#2c2825');
      setFontSize(26);
      setFontChoice('editorial');
      setAlign('left');
      setPadding(36);
      setBorderRadius(12);
      setShowGrain(true);
      setShowBorder(true);
      setShowIcon(true);
      setIconName('format_quote');
      setSelectedElement(null);
      showToast('Reset to defaults');
    }
  };

  // Clear local draft from browser storage
  const handleClearDraft = () => {
    if (window.confirm('Clear saved draft from browser storage?')) {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setDraftSavedTimestamp('Draft cleared');
      showToast('Local draft storage cleared');
    }
  };

  // Switch template with preservation option
  const handleApplyTemplate = (tmpl: CardTemplate) => {
    setBgColor(tmpl.theme.bg);
    setInkColor(tmpl.theme.ink);
    setFontChoice(tmpl.font);
    setFontSize(tmpl.fontSize);
    setAlign(tmpl.align);
    setPadding(tmpl.padding);
    setBorderRadius(tmpl.borderRadius);
    setShowGrain(tmpl.showGrain);
    setShowBorder(tmpl.showBorder);
    setShowIcon(tmpl.showIcon);
    setIconName(tmpl.iconName);

    if (!preserveTextOnSwitch) {
      setQuote(tmpl.quote);
      setAuthor(tmpl.author);
      setTag(tmpl.tag);
      setBadge(tmpl.badge);
    }

    setTemplateDrawerOpen(false);
    showToast(
      preserveTextOnSwitch
        ? `Applied "${tmpl.title}" style (retained your custom words)`
        : `Switched to "${tmpl.title}" preset`
    );
  };

  // Clean elements before export/copy
  const prepareCanvasForCapture = () => {
    setSelectedElement(null);
    setShowGuidelines(false);
  };

  // Copy Image to Clipboard
  const handleCopyImage = async () => {
    if (!cardRef.current) return;
    prepareCanvasForCapture();

    try {
      // Small tick for React state to clear selection rings
      await new Promise((resolve) => setTimeout(resolve, 60));
      const blob = await toBlob(cardRef.current, { pixelRatio: 2 });
      if (blob && navigator.clipboard && (window as any).ClipboardItem) {
        await navigator.clipboard.write([
          new (window as any).ClipboardItem({ 'image/png': blob }),
        ]);
        setCopied(true);
        showToast('Card image copied to clipboard (2× Retina)');
        setTimeout(() => setCopied(false), 2200);
      } else {
        showToast('Clipboard image copying is not supported in this browser.');
      }
    } catch (err) {
      console.error('Failed to copy image:', err);
      showToast('Failed to copy card to clipboard');
    }
  };

  // High-Res Export (WebP, PNG 1×, PNG 2×, SVG)
  const handleExport = async (format: ExportFormat) => {
    if (!cardRef.current) return;
    prepareCanvasForCapture();
    setIsExporting(true);
    setExportMenuOpen(false);

    try {
      // Small tick to ensure UI selection borders are removed from DOM
      await new Promise((resolve) => setTimeout(resolve, 80));

      const filename = `${docTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${aspectRatio}`;
      let downloadUrl = '';
      let downloadExt = 'png';

      if (format === 'png-2x') {
        downloadUrl = await toPng(cardRef.current, { pixelRatio: 2 });
        downloadExt = 'png';
      } else if (format === 'png-1x') {
        downloadUrl = await toPng(cardRef.current, { pixelRatio: 1 });
        downloadExt = 'png';
      } else if (format === 'svg') {
        downloadUrl = await toSvg(cardRef.current);
        downloadExt = 'svg';
      } else if (format === 'webp') {
        // Convert to WebP via canvas blob
        const pngUrl = await toPng(cardRef.current, { pixelRatio: 2 });
        const img = new Image();
        img.src = pngUrl;
        await new Promise((resolve) => {
          img.onload = resolve;
        });
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          downloadUrl = canvas.toDataURL('image/webp', 0.95);
          downloadExt = 'webp';
        } else {
          downloadUrl = pngUrl;
          downloadExt = 'png';
        }
      }

      const link = document.createElement('a');
      link.download = `${filename}.${downloadExt}`;
      link.href = downloadUrl;
      link.click();

      // Confetti celebration
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#fcd535', '#ffffff', '#aa2d00', '#0a2e0e'],
      });

      showToast(`Exported ${downloadExt.toUpperCase()} file successfully!`);
    } catch (err) {
      console.error('Export failed:', err);
      showToast('Export failed. Please check canvas content and try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Container aspect ratio styling
  const getCardAspectRatioStyle = () => {
    switch (aspectRatio) {
      case '1:1':
        return { aspectRatio: '1 / 1', maxWidth: '520px' };
      case '4:5':
        return { aspectRatio: '4 / 5', maxWidth: '440px' };
      case '9:16':
        return { aspectRatio: '9 / 16', maxWidth: '360px' };
      case '16:9':
        return { aspectRatio: '16 / 9', maxWidth: '640px' };
      default:
        return { aspectRatio: '1 / 1', maxWidth: '520px' };
    }
  };

  // Text length warnings
  const isLongText = quote.length > 240;

  return (
    <div
      className={`w-full pt-16 min-h-screen flex flex-col transition-colors duration-200 ${
        isLight ? 'bg-[#f6f8fa] text-[#181a20]' : 'bg-[#0b0e11] text-[#e1e2e7]'
      }`}
      onClick={() => {
        // Deselect when clicking empty background
        setAspectMenuOpen(false);
        setExportMenuOpen(false);
      }}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#181d24] text-white border border-[#384252] shadow-2xl animate-fade-in text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 text-[#0ecb81] shrink-0" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-[#707a8a] hover:text-white">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Semantic SEO & Screen Reader Header */}
      <div className="sr-only">
        <h1>Card Creator Studio — Aesthetic Text-to-Card Generator</h1>
        <p>
          Interactive browser-based typesetting editor. Compose literature quotes, poetry reflections, and study notes
          using custom archival paper palettes, editorial fonts, and standard aspect ratios. Export 2× Retina images locally.
        </p>
      </div>

      {/* STUDIO TOOLBAR */}
      <div
        className={`w-full border-b px-4 md:px-8 py-2.5 flex items-center justify-between gap-4 sticky top-16 z-40 backdrop-blur-md transition-colors duration-200 ${
          isLight
            ? 'bg-white/90 border-[#e2e8f0] text-[#0f172a]'
            : 'bg-[#111417]/90 border-[#262c36] text-[#e1e2e7]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left: Back, Title, Undo, Redo, Reset, Draft Status */}
        <div className="flex items-center gap-2 min-w-0">
          <a
            href="/templates"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer shrink-0 ${
              isLight
                ? 'bg-white border-[#e2e8f0] text-[#475569] hover:text-[#0f172a] hover:bg-[#f8fafc]'
                : 'bg-[#181d24] border-[#262c36] text-[#c4c7c8] hover:text-white hover:border-[#444748]'
            }`}
            title="Back to Template Gallery"
            aria-label="Back to templates"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Styles</span>
          </a>

          <a
            href="/canvas"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
              isLight
                ? 'bg-white border-[#e2e8f0] text-[#0f172a] hover:bg-[#f8fafc]'
                : 'bg-[#181d24] border-[#262c36] text-white hover:border-[#444748]'
            }`}
            title="Switch to Freeform Canvas Studio (Photo cards & multi-layer designs)"
          >
            <Layers className="w-3.5 h-3.5 text-[#fcd535]" />
            <span className="hidden md:inline">Canvas Studio</span>
          </a>

          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
              isLight ? 'bg-[#f8fafc] border-[#e2e8f0]' : 'bg-[#181d24] border-[#262c36]'
            }`}
          >
            <FileText className={`w-3.5 h-3.5 ${isLight ? 'text-[#94a3b8]' : 'text-[#707a8a]'}`} />
            <input
              type="text"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              className={`bg-transparent text-xs font-semibold focus:outline-none w-32 sm:w-48 truncate border-none p-0 ${
                isLight ? 'text-[#0f172a]' : 'text-white'
              }`}
              title="Click to rename artifact"
              aria-label="Document Title"
            />
          </div>

          {/* Undo / Redo Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-all ${
                historyIndex <= 0
                  ? 'opacity-40 cursor-not-allowed border-transparent'
                  : isLight
                  ? 'bg-white border-[#e2e8f0] text-[#0f172a] hover:bg-[#f1f5f9] cursor-pointer'
                  : 'bg-[#181d24] border-[#262c36] text-[#c4c7c8] hover:text-white hover:border-[#444748] cursor-pointer'
              }`}
              title="Undo (⌘Z)"
              aria-label="Undo edit"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-all ${
                historyIndex >= history.length - 1
                  ? 'opacity-40 cursor-not-allowed border-transparent'
                  : isLight
                  ? 'bg-white border-[#e2e8f0] text-[#0f172a] hover:bg-[#f1f5f9] cursor-pointer'
                  : 'bg-[#181d24] border-[#262c36] text-[#c4c7c8] hover:text-white hover:border-[#444748] cursor-pointer'
              }`}
              title="Redo (⌘⇧Z)"
              aria-label="Redo edit"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className={`h-5 w-px hidden sm:block ${isLight ? 'bg-[#e2e8f0]' : 'bg-[#262c36]'}`}></div>

          {/* Reset button */}
          <button
            onClick={handleReset}
            className={`w-8 h-8 hidden sm:flex items-center justify-center rounded-lg border transition-colors cursor-pointer ${
              isLight
                ? 'bg-white border-[#e2e8f0] text-[#475569] hover:text-[#0f172a] hover:bg-[#f1f5f9]'
                : 'bg-[#181d24] border-[#262c36] text-[#c4c7c8] hover:text-white hover:border-[#444748]'
            }`}
            title="Reset to clean defaults"
            aria-label="Reset card settings"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Draft indicator */}
          <div className="hidden xl:flex items-center gap-1.5 text-[11px] text-[#707a8a] pl-1">
            <Save className="w-3 h-3 text-[#0ecb81]" />
            <span>{draftSavedTimestamp}</span>
            <button
              onClick={handleClearDraft}
              className="text-[10px] text-[#9ca3af] hover:text-red-400 underline ml-1 cursor-pointer"
              title="Clear saved browser draft"
            >
              clear
            </button>
          </div>
        </div>

        {/* Center: Dimensions, Zoom, Preset Drawer & Guidelines */}
        <div className="flex items-center gap-2">
          {/* Quick Style Switcher Drawer Button */}
          <button
            onClick={() => setTemplateDrawerOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
              isLight
                ? 'bg-white border-[#e2e8f0] text-[#0f172a] hover:bg-[#f8fafc]'
                : 'bg-[#181d24] border-[#262c36] text-white hover:border-[#444748]'
            }`}
            title="Switch template style"
          >
            <LayoutTemplate className={`w-3.5 h-3.5 ${isLight ? 'text-[#d97706]' : 'text-[#fcd535]'}`} />
            <span className="hidden sm:inline">Styles</span>
          </button>

          {/* Aspect ratio selector */}
          <div className="relative">
            <button
              onClick={() => setAspectMenuOpen(!aspectMenuOpen)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                isLight
                  ? 'bg-white border-[#e2e8f0] text-[#0f172a] hover:border-[#cbd5e1]'
                  : 'bg-[#181d24] border-[#262c36] text-white hover:border-[#444748]'
              }`}
            >
              <Crop className={`w-3.5 h-3.5 ${isLight ? 'text-[#d97706]' : 'text-[#fcd535]'}`} />
              <span>{currentRatioPreset.label}</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>

            {aspectMenuOpen && (
              <div
                className={`absolute top-full left-0 mt-1 w-56 rounded-xl border shadow-2xl py-1 z-50 ${
                  isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#1d2023] border-[#262c36]'
                }`}
              >
                {ASPECT_RATIOS.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setAspectRatio(r.id);
                      setAspectMenuOpen(false);
                      showToast(`Aspect ratio set to ${r.label}`);
                    }}
                    className={`w-full px-3 py-2 text-left flex items-center justify-between text-xs transition-colors cursor-pointer ${
                      aspectRatio === r.id
                        ? isLight
                          ? 'bg-[#f1f5f9] text-[#0f172a] font-semibold'
                          : 'bg-[#272a2e] text-white font-semibold'
                        : isLight
                        ? 'text-[#475569] hover:bg-[#f8fafc] hover:text-[#0f172a]'
                        : 'text-[#c4c7c8] hover:bg-[#222730] hover:text-white'
                    }`}
                  >
                    <span>{r.label}</span>
                    <span className="font-mono text-[10px] opacity-60">{r.ratio}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Zoom controls */}
          <div
            className={`hidden lg:flex items-center border rounded-lg px-2 py-1 gap-1 ${
              isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#181d24] border-[#262c36]'
            }`}
          >
            <button
              onClick={() => setZoomLevel(Math.max(60, zoomLevel - 10))}
              className="p-0.5 opacity-60 hover:opacity-100 cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-mono w-10 text-center font-medium">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel(Math.min(140, zoomLevel + 10))}
              className="p-0.5 opacity-60 hover:opacity-100 cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Guidelines Grid toggle */}
          <button
            onClick={() => setShowGuidelines(!showGuidelines)}
            className={`w-8 h-8 hidden sm:flex items-center justify-center rounded-lg border transition-colors cursor-pointer ${
              showGuidelines
                ? isLight
                  ? 'bg-[#d97706] text-white border-[#d97706]'
                  : 'bg-[#fcd535] text-[#0b0e11] border-[#fcd535]'
                : isLight
                ? 'bg-white text-[#475569] border-[#e2e8f0] hover:text-[#0f172a]'
                : 'bg-[#181d24] text-[#c4c7c8] border-[#262c36] hover:text-white'
            }`}
            title="Toggle safe margins & alignment grid"
            aria-label="Toggle print guidelines"
          >
            <Grid className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Copy Image & Multi-Format Export */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyImage}
            className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
              isLight
                ? 'bg-white border-[#e2e8f0] text-[#0f172a] hover:bg-[#f8fafc]'
                : 'bg-[#181d24] border-[#262c36] text-white hover:bg-[#222730]'
            }`}
            title="Copy high-res card to clipboard"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-[#0ecb81]" />
            ) : (
              <Copy className={`w-3.5 h-3.5 ${isLight ? 'text-[#d97706]' : 'text-[#fcd535]'}`} />
            )}
            <span>{copied ? 'Copied!' : 'Copy Image'}</span>
          </button>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setExportMenuOpen(!exportMenuOpen)}
              disabled={isExporting}
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-[0.98] cursor-pointer shadow-lg disabled:opacity-50 ${
                isLight
                  ? 'bg-[#0f172a] text-white hover:bg-[#1e293b]'
                  : 'bg-white text-[#0b0e11] hover:bg-[#e2e2e2]'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Rendering...' : 'Export Card'}</span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>

            {exportMenuOpen && (
              <div
                className={`absolute right-0 mt-1 w-56 rounded-xl border shadow-2xl py-1.5 z-50 ${
                  isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#1d2023] border-[#262c36]'
                }`}
              >
                <div className="px-3 py-1 text-[10px] uppercase font-semibold text-[#707a8a] tracking-wider">
                  Download Formats
                </div>
                <button
                  onClick={() => handleExport('png-2x')}
                  className={`w-full px-3 py-2 text-left flex items-center justify-between text-xs cursor-pointer ${
                    isLight ? 'text-[#0f172a] hover:bg-[#f1f5f9]' : 'text-white hover:bg-[#222730]'
                  }`}
                >
                  <div>
                    <span className="font-medium block">PNG (2× Retina)</span>
                    <span className="text-[10px] text-[#707a8a]">Crisp 2160px for social & print</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#0ecb81] font-bold">HQ</span>
                </button>
                <button
                  onClick={() => handleExport('webp')}
                  className={`w-full px-3 py-2 text-left flex items-center justify-between text-xs cursor-pointer ${
                    isLight ? 'text-[#0f172a] hover:bg-[#f1f5f9]' : 'text-white hover:bg-[#222730]'
                  }`}
                >
                  <div>
                    <span className="font-medium block">WebP Lossless</span>
                    <span className="text-[10px] text-[#707a8a]">Small file size, sharp text</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#3b82f6]">Web</span>
                </button>
                <button
                  onClick={() => handleExport('png-1x')}
                  className={`w-full px-3 py-2 text-left flex items-center justify-between text-xs cursor-pointer ${
                    isLight ? 'text-[#0f172a] hover:bg-[#f1f5f9]' : 'text-white hover:bg-[#222730]'
                  }`}
                >
                  <div>
                    <span className="font-medium block">PNG (Standard 1×)</span>
                    <span className="text-[10px] text-[#707a8a]">Standard 1080px resolution</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#707a8a]">1×</span>
                </button>
                <button
                  onClick={() => handleExport('svg')}
                  className={`w-full px-3 py-2 text-left flex items-center justify-between text-xs cursor-pointer border-t ${
                    isLight ? 'border-[#e2e8f0] text-[#0f172a] hover:bg-[#f1f5f9]' : 'border-[#262c36] text-white hover:bg-[#222730]'
                  }`}
                >
                  <div>
                    <span className="font-medium block">SVG Vector Artifact</span>
                    <span className="text-[10px] text-[#707a8a]">Scalable vector format</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#d97706]">SVG</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* WORKSPACE: CANVAS + EDITING PALETTE */}
      <div className="flex-1 flex flex-col lg:flex-row w-full overflow-hidden">
        {/* LEFT / DESKTOP SIDEBAR: CONTROLS */}
        <div
          className={`w-full lg:w-96 border-r flex flex-col h-auto lg:h-[calc(100vh-104px)] overflow-y-auto transition-colors duration-200 ${
            isLight
              ? 'bg-[#ffffff] border-[#e2e8f0] text-[#0f172a]'
              : 'bg-[#111417] border-[#262c36] text-[#e1e2e7]'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Navigation Control Tabs */}
          <div
            className={`grid grid-cols-4 border-b p-1 ${
              isLight ? 'bg-[#f8fafc] border-[#e2e8f0]' : 'bg-[#14171d] border-[#262c36]'
            }`}
          >
            <button
              onClick={() => setActiveTab('content')}
              className={`py-2 text-xs font-medium rounded-lg flex flex-col items-center gap-1 transition-colors cursor-pointer ${
                activeTab === 'content'
                  ? isLight
                    ? 'bg-white text-[#0f172a] shadow-sm font-semibold'
                    : 'bg-[#222730] text-white shadow-sm'
                  : 'text-[#707a8a] hover:text-[#0f172a]'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>Words</span>
            </button>
            <button
              onClick={() => setActiveTab('type')}
              className={`py-2 text-xs font-medium rounded-lg flex flex-col items-center gap-1 transition-colors cursor-pointer ${
                activeTab === 'type'
                  ? isLight
                    ? 'bg-white text-[#0f172a] shadow-sm font-semibold'
                    : 'bg-[#222730] text-white shadow-sm'
                  : 'text-[#707a8a] hover:text-[#0f172a]'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Type</span>
            </button>
            <button
              onClick={() => setActiveTab('palette')}
              className={`py-2 text-xs font-medium rounded-lg flex flex-col items-center gap-1 transition-colors cursor-pointer ${
                activeTab === 'palette'
                  ? isLight
                    ? 'bg-white text-[#0f172a] shadow-sm font-semibold'
                    : 'bg-[#222730] text-white shadow-sm'
                  : 'text-[#707a8a] hover:text-[#0f172a]'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Palette</span>
            </button>
            <button
              onClick={() => setActiveTab('decor')}
              className={`py-2 text-xs font-medium rounded-lg flex flex-col items-center gap-1 transition-colors cursor-pointer ${
                activeTab === 'decor'
                  ? isLight
                    ? 'bg-white text-[#0f172a] shadow-sm font-semibold'
                    : 'bg-[#222730] text-white shadow-sm'
                  : 'text-[#707a8a] hover:text-[#0f172a]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Details</span>
            </button>
          </div>

          <div className="p-5 flex flex-col gap-6">
            {/* TAB 1: CONTENT */}
            {activeTab === 'content' && (
              <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <label
                    className={`text-xs font-semibold uppercase tracking-wider ${
                      isLight ? 'text-[#0f172a]' : 'text-white'
                    }`}
                  >
                    Quote / Main Body
                  </label>
                  <button
                    onClick={handleRandomQuote}
                    className={`inline-flex items-center gap-1 text-[11px] hover:underline cursor-pointer ${
                      isLight ? 'text-[#d97706]' : 'text-[#fcd535]'
                    }`}
                  >
                    <Shuffle className="w-3 h-3" />
                    <span>Inspiration</span>
                  </button>
                </div>

                <div className="relative">
                  <textarea
                    ref={quoteInputRef}
                    value={quote}
                    onChange={(e) => setQuote(e.target.value)}
                    rows={4}
                    className={`w-full rounded-xl p-3 text-sm leading-relaxed resize-none focus:outline-none border transition-all ${
                      isLight
                        ? 'bg-white border-[#cbd5e1] text-[#0f172a] focus:border-[#d97706]'
                        : 'bg-[#181d24] border-[#262c36] text-white focus:border-[#fcd535]'
                    }`}
                    placeholder="Paste or type your quote, poetry, or thoughts..."
                  />

                  {/* Character count & Long Text Warning */}
                  <div className="flex items-center justify-between pt-1 px-1 text-[11px] text-[#707a8a]">
                    <span>{quote.length} characters • {quote.trim().split(/\s+/).filter(Boolean).length} words</span>
                    {isLongText && (
                      <button
                        onClick={handleAutoFitFontSize}
                        className={`flex items-center gap-1 font-medium cursor-pointer ${
                          isLight ? 'text-[#d97706]' : 'text-[#fcd535]'
                        }`}
                        title="Auto-adjust font size to fit"
                      >
                        <Wand2 className="w-3 h-3" />
                        <span>Auto-Fit Size</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    className={`text-xs font-semibold uppercase tracking-wider ${
                      isLight ? 'text-[#0f172a]' : 'text-white'
                    }`}
                  >
                    Author / Citation
                  </label>
                  <input
                    ref={authorInputRef}
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className={`w-full rounded-xl px-3 py-2 text-xs border focus:outline-none ${
                      isLight
                        ? 'bg-white border-[#cbd5e1] text-[#0f172a] focus:border-[#d97706]'
                        : 'bg-[#181d24] border-[#262c36] text-white focus:border-[#fcd535]'
                    }`}
                    placeholder="e.g. Albert Camus — Return to Tipasa"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label
                      className={`text-xs font-semibold uppercase tracking-wider ${
                        isLight ? 'text-[#0f172a]' : 'text-white'
                      }`}
                    >
                      Header Tag
                    </label>
                    <input
                      ref={tagInputRef}
                      type="text"
                      value={tag}
                      onChange={(e) => setTag(e.target.value)}
                      className={`w-full rounded-xl px-3 py-2 text-xs border focus:outline-none ${
                        isLight
                          ? 'bg-white border-[#cbd5e1] text-[#0f172a] focus:border-[#d97706]'
                          : 'bg-[#181d24] border-[#262c36] text-white focus:border-[#fcd535]'
                      }`}
                      placeholder="e.g. VOL. 08 • NOTES"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label
                      className={`text-xs font-semibold uppercase tracking-wider ${
                        isLight ? 'text-[#0f172a]' : 'text-white'
                      }`}
                    >
                      Corner Badge
                    </label>
                    <input
                      type="text"
                      value={badge}
                      onChange={(e) => setBadge(e.target.value)}
                      className={`w-full rounded-xl px-3 py-2 text-xs border focus:outline-none ${
                        isLight
                          ? 'bg-white border-[#cbd5e1] text-[#0f172a] focus:border-[#d97706]'
                          : 'bg-[#181d24] border-[#262c36] text-white focus:border-[#fcd535]'
                      }`}
                      placeholder="e.g. EST. 1997"
                    />
                  </div>
                </div>

                {/* Sample Excerpts */}
                <div className={`pt-3 border-t flex flex-col gap-2 ${isLight ? 'border-[#e2e8f0]' : 'border-[#1f242c]'}`}>
                  <span className="text-[11px] font-semibold text-[#707a8a] uppercase">Quick Curated Quotes</span>
                  <div className="flex flex-col gap-1.5">
                    {SAMPLE_QUOTES.slice(0, 4).map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setQuote(item.q);
                          setAuthor(item.a);
                          setTag(item.t);
                          showToast('Loaded quote into editor');
                        }}
                        className={`text-left p-2.5 rounded-lg border text-[11px] transition-colors cursor-pointer truncate ${
                          isLight
                            ? 'bg-[#f8fafc] border-[#e2e8f0] text-[#334155] hover:bg-white hover:text-[#0f172a]'
                            : 'bg-[#14171d] border-[#262c36] text-[#c4c7c8] hover:bg-[#181d24] hover:text-white'
                        }`}
                      >
                        “{item.q}”
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: TYPOGRAPHY */}
            {activeTab === 'type' && (
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label
                    className={`text-xs font-semibold uppercase tracking-wider ${
                      isLight ? 'text-[#0f172a]' : 'text-white'
                    }`}
                  >
                    Font Family Stack
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setFontChoice('editorial')}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        fontChoice === 'editorial'
                          ? isLight
                            ? 'border-[#d97706] bg-[#fffbeb] text-[#0f172a] ring-2 ring-[#d97706]/40'
                            : 'border-[#fcd535] bg-[#181d24] text-white shadow-sm ring-1 ring-[#fcd535]'
                          : isLight
                          ? 'border-[#e2e8f0] bg-white text-[#475569] hover:text-[#0f172a]'
                          : 'border-[#262c36] bg-[#14171d] text-[#9ca3af] hover:text-white'
                      }`}
                    >
                      <span className="font-editorial text-lg block leading-none">Newsreader</span>
                      <span className="text-[10px] text-[#707a8a]">Editorial Serif</span>
                    </button>
                    <button
                      onClick={() => setFontChoice('serif')}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        fontChoice === 'serif'
                          ? isLight
                            ? 'border-[#d97706] bg-[#fffbeb] text-[#0f172a] ring-2 ring-[#d97706]/40'
                            : 'border-[#fcd535] bg-[#181d24] text-white shadow-sm ring-1 ring-[#fcd535]'
                          : isLight
                          ? 'border-[#e2e8f0] bg-white text-[#475569] hover:text-[#0f172a]'
                          : 'border-[#262c36] bg-[#14171d] text-[#9ca3af] hover:text-white'
                      }`}
                    >
                      <span className="font-display-serif text-lg block leading-none">Playfair</span>
                      <span className="text-[10px] text-[#707a8a]">Display Title</span>
                    </button>
                    <button
                      onClick={() => setFontChoice('sans')}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        fontChoice === 'sans'
                          ? isLight
                            ? 'border-[#d97706] bg-[#fffbeb] text-[#0f172a] ring-2 ring-[#d97706]/40'
                            : 'border-[#fcd535] bg-[#181d24] text-white shadow-sm ring-1 ring-[#fcd535]'
                          : isLight
                          ? 'border-[#e2e8f0] bg-white text-[#475569] hover:text-[#0f172a]'
                          : 'border-[#262c36] bg-[#14171d] text-[#9ca3af] hover:text-white'
                      }`}
                    >
                      <span className="font-modern-sans text-lg block leading-none">Inter</span>
                      <span className="text-[10px] text-[#707a8a]">Clean Humanist</span>
                    </button>
                    <button
                      onClick={() => setFontChoice('mono')}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        fontChoice === 'mono'
                          ? isLight
                            ? 'border-[#d97706] bg-[#fffbeb] text-[#0f172a] ring-2 ring-[#d97706]/40'
                            : 'border-[#fcd535] bg-[#181d24] text-white shadow-sm ring-1 ring-[#fcd535]'
                          : isLight
                          ? 'border-[#e2e8f0] bg-white text-[#475569] hover:text-[#0f172a]'
                          : 'border-[#262c36] bg-[#14171d] text-[#9ca3af] hover:text-white'
                      }`}
                    >
                      <span className="font-mono-code text-sm block leading-none">JetBrains</span>
                      <span className="text-[10px] text-[#707a8a]">Tabular Code</span>
                    </button>
                  </div>
                </div>

                {/* Font Size Slider with Auto-Fit */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className={`font-semibold uppercase tracking-wider ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
                      Font Size
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleAutoFitFontSize}
                        className={`text-[10px] underline cursor-pointer ${isLight ? 'text-[#d97706]' : 'text-[#fcd535]'}`}
                      >
                        Auto-Fit
                      </button>
                      <span className={`font-mono font-bold ${isLight ? 'text-[#d97706]' : 'text-[#fcd535]'}`}>
                        {fontSize}px
                      </span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={16}
                    max={44}
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full accent-[#fcd535] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#707a8a]">
                    <span>16px (Dense)</span>
                    <span>26px (Standard)</span>
                    <span>44px (Display)</span>
                  </div>
                </div>

                {/* Alignment */}
                <div className="flex flex-col gap-2">
                  <span className={`text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
                    Alignment
                  </span>
                  <div
                    className={`grid grid-cols-3 gap-2 p-1 rounded-xl border ${
                      isLight ? 'bg-[#f8fafc] border-[#e2e8f0]' : 'bg-[#14171d] border-[#262c36]'
                    }`}
                  >
                    <button
                      onClick={() => setAlign('left')}
                      className={`py-1.5 rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
                        align === 'left'
                          ? isLight
                            ? 'bg-white text-[#0f172a] shadow-sm'
                            : 'bg-[#222730] text-white shadow-sm'
                          : 'text-[#707a8a] hover:text-white'
                      }`}
                      title="Align Left"
                    >
                      <AlignLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setAlign('center')}
                      className={`py-1.5 rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
                        align === 'center'
                          ? isLight
                            ? 'bg-white text-[#0f172a] shadow-sm'
                            : 'bg-[#222730] text-white shadow-sm'
                          : 'text-[#707a8a] hover:text-white'
                      }`}
                      title="Align Center"
                    >
                      <AlignCenter className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setAlign('right')}
                      className={`py-1.5 rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
                        align === 'right'
                          ? isLight
                            ? 'bg-white text-[#0f172a] shadow-sm'
                            : 'bg-[#222730] text-white shadow-sm'
                          : 'text-[#707a8a] hover:text-white'
                      }`}
                      title="Align Right"
                    >
                      <AlignRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: PALETTE */}
            {activeTab === 'palette' && (
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label
                    className={`text-xs font-semibold uppercase tracking-wider ${
                      isLight ? 'text-[#0f172a]' : 'text-white'
                    }`}
                  >
                    Curated Color Sets
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {PALETTE_PRESETS.map((p) => {
                      const isSelected = bgColor === p.bg && inkColor === p.ink;
                      return (
                        <button
                          key={p.id}
                          onClick={() => {
                            setBgColor(p.bg);
                            setInkColor(p.ink);
                            showToast(`Palette switched to ${p.name}`);
                          }}
                          style={{ backgroundColor: p.bg, color: p.ink }}
                          className={`p-2.5 rounded-xl text-left border flex items-center justify-between transition-all cursor-pointer shadow-sm ${
                            isSelected
                              ? 'ring-2 ring-[#fcd535] border-transparent font-semibold'
                              : 'border-black/15'
                          }`}
                        >
                          <span className="text-xs truncate">{p.name}</span>
                          <span
                            style={{ backgroundColor: p.ink }}
                            className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                          ></span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Hex Pickers */}
                <div className={`grid grid-cols-2 gap-3 pt-3 border-t ${isLight ? 'border-[#e2e8f0]' : 'border-[#1f242c]'}`}>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-[#707a8a] uppercase">Card Paper Hex</label>
                    <div
                      className={`flex items-center gap-2 p-1.5 rounded-xl border ${
                        isLight ? 'bg-[#f8fafc] border-[#e2e8f0]' : 'bg-[#181d24] border-[#262c36]'
                      }`}
                    >
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-7 h-7 rounded border-none cursor-pointer bg-transparent"
                      />
                      <span className={`text-xs font-mono uppercase ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
                        {bgColor}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-[#707a8a] uppercase">Ink Text Hex</label>
                    <div
                      className={`flex items-center gap-2 p-1.5 rounded-xl border ${
                        isLight ? 'bg-[#f8fafc] border-[#e2e8f0]' : 'bg-[#181d24] border-[#262c36]'
                      }`}
                    >
                      <input
                        type="color"
                        value={inkColor}
                        onChange={(e) => setInkColor(e.target.value)}
                        className="w-7 h-7 rounded border-none cursor-pointer bg-transparent"
                      />
                      <span className={`text-xs font-mono uppercase ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
                        {inkColor}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: GEOMETRY & DETAILS */}
            {activeTab === 'decor' && (
              <div className="flex flex-col gap-5">
                {/* Padding */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className={`font-semibold uppercase tracking-wider ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
                      Internal Margins
                    </span>
                    <span className={`font-mono font-bold ${isLight ? 'text-[#d97706]' : 'text-[#fcd535]'}`}>
                      {padding}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min={20}
                    max={60}
                    value={padding}
                    onChange={(e) => setPadding(Number(e.target.value))}
                    className="w-full accent-[#fcd535] cursor-pointer"
                  />
                </div>

                {/* Border Radius */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className={`font-semibold uppercase tracking-wider ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
                      Corner Rounding
                    </span>
                    <span className={`font-mono font-bold ${isLight ? 'text-[#d97706]' : 'text-[#fcd535]'}`}>
                      {borderRadius}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={32}
                    value={borderRadius}
                    onChange={(e) => setBorderRadius(Number(e.target.value))}
                    className="w-full accent-[#fcd535] cursor-pointer"
                  />
                </div>

                {/* Toggles */}
                <div className={`flex flex-col gap-2.5 pt-3 border-t ${isLight ? 'border-[#e2e8f0]' : 'border-[#1f242c]'}`}>
                  <label
                    className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer ${
                      isLight ? 'bg-[#f8fafc] border-[#e2e8f0]' : 'bg-[#181d24] border-[#262c36]'
                    }`}
                  >
                    <span className={`text-xs font-medium ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
                      Analog Film Grain
                    </span>
                    <input
                      type="checkbox"
                      checked={showGrain}
                      onChange={(e) => setShowGrain(e.target.checked)}
                      className="accent-[#fcd535] w-4 h-4 cursor-pointer"
                    />
                  </label>

                  <label
                    className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer ${
                      isLight ? 'bg-[#f8fafc] border-[#e2e8f0]' : 'bg-[#181d24] border-[#262c36]'
                    }`}
                  >
                    <span className={`text-xs font-medium ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
                      Subtle Boundary Border
                    </span>
                    <input
                      type="checkbox"
                      checked={showBorder}
                      onChange={(e) => setShowBorder(e.target.checked)}
                      className="accent-[#fcd535] w-4 h-4 cursor-pointer"
                    />
                  </label>

                  <label
                    className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer ${
                      isLight ? 'bg-[#f8fafc] border-[#e2e8f0]' : 'bg-[#181d24] border-[#262c36]'
                    }`}
                  >
                    <span className={`text-xs font-medium ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
                      Corner Ornament Glyph
                    </span>
                    <input
                      type="checkbox"
                      checked={showIcon}
                      onChange={(e) => setShowIcon(e.target.checked)}
                      className="accent-[#fcd535] w-4 h-4 cursor-pointer"
                    />
                  </label>

                  {showIcon && (
                    <div className="flex flex-col gap-1.5 pt-1">
                      <span className="text-[11px] font-semibold text-[#707a8a] uppercase">Ornament Glyph</span>
                      <div
                        className={`grid grid-cols-6 gap-1.5 p-1.5 rounded-xl border ${
                          isLight ? 'bg-[#f8fafc] border-[#e2e8f0]' : 'bg-[#14171d] border-[#262c36]'
                        }`}
                      >
                        {['format_quote', 'auto_awesome', 'terminal', 'edit_note', 'bookmark', 'grid_view', 'stars', 'favorite', 'badge', 'qr_code', 'verified'].map(
                          (ic) => (
                            <button
                              key={ic}
                              onClick={() => setIconName(ic)}
                              className={`p-1.5 rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
                                iconName === ic
                                  ? isLight
                                    ? 'bg-white text-[#d97706] shadow-sm font-bold'
                                    : 'bg-[#222730] text-[#fcd535]'
                                  : 'text-[#707a8a] hover:text-[#0f172a]'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[16px]">{ic}</span>
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CENTER / MAIN WORKSPACE CANVAS */}
        <div
          className={`flex-1 p-4 md:p-12 flex flex-col items-center justify-center overflow-auto min-h-[520px] transition-colors duration-200 ${
            isLight ? 'bg-[#f1f5f9]' : 'bg-[#0b0e11]'
          }`}
          onClick={(e) => {
            // Click on the empty workspace background to deselect
            if (e.target === e.currentTarget) {
              setSelectedElement(null);
            }
          }}
        >
          {/* Active Selection Breadcrumb / Quick Control Strip */}
          {selectedElement && (
            <div
              className={`mb-3 flex items-center gap-2 px-3 py-1 rounded-full text-xs border shadow-sm animate-fade-in ${
                isLight ? 'bg-white border-[#e2e8f0] text-[#0f172a]' : 'bg-[#181d24] border-[#262c36] text-white'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#fcd535]"></span>
              <span>
                Selected: <strong className="capitalize">{selectedElement}</strong>
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedElement(null);
                }}
                className="ml-1 text-[#707a8a] hover:text-white cursor-pointer"
                title="Deselect element"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          <div
            style={{
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: 'center center',
              transition: 'transform 0.15s ease-out',
            }}
            className="w-full flex items-center justify-center"
          >
            {/* The Live Renderable Card Element */}
            <div
              ref={cardRef}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedElement('card');
              }}
              style={{
                ...getCardAspectRatioStyle(),
                backgroundColor: bgColor,
                color: inkColor,
                padding: `${padding}px`,
                borderRadius: `${borderRadius}px`,
              }}
              className={`relative w-full shadow-2xl transition-colors duration-200 flex flex-col justify-between overflow-hidden select-text ${
                showBorder ? 'border border-current/15' : ''
              } ${selectedElement === 'card' ? 'ring-2 ring-[#fcd535]/80 ring-offset-2' : ''}`}
            >
              {/* Optional Analog Grain Texture Layer */}
              {showGrain && (
                <div
                  className="card-noise absolute inset-0 pointer-events-none opacity-40 mix-blend-multiply"
                  aria-hidden="true"
                ></div>
              )}

              {/* Safe Guidelines Overlay */}
              {showGuidelines && (
                <div
                  className="absolute inset-4 border border-dashed border-[#fcd535]/60 pointer-events-none z-30 flex items-center justify-center"
                  aria-hidden="true"
                >
                  <span className="text-[10px] font-mono bg-[#fcd535] text-black px-1.5 py-0.5 rounded font-bold">
                    SAFE PRINT AREA
                  </span>
                </div>
              )}

              {/* Header / Folio Ribbon */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedElement('tag');
                  setActiveTab('content');
                  tagInputRef.current?.focus();
                }}
                className={`relative z-10 flex items-center justify-between pb-3.5 border-b border-current/15 text-[11px] font-mono tracking-wider opacity-75 cursor-pointer rounded transition-all ${
                  selectedElement === 'tag' ? 'ring-1 ring-[#fcd535] bg-black/5 p-1' : ''
                }`}
                title="Click to edit folio header tag"
              >
                <div className="flex items-center gap-1.5">
                  {showIcon && (
                    <span className="material-symbols-outlined text-[14px]">{iconName}</span>
                  )}
                  <span className="uppercase font-semibold">{tag}</span>
                </div>
                {badge && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedElement('badge');
                      setActiveTab('content');
                    }}
                    className={`px-1.5 py-0.5 rounded border border-current/25 text-[10px] cursor-pointer ${
                      selectedElement === 'badge' ? 'ring-1 ring-[#fcd535] bg-black/10' : ''
                    }`}
                    title="Click to edit corner badge"
                  >
                    {badge}
                  </span>
                )}
              </div>

              {/* Main Body Quote / Prose */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedElement('quote');
                  setActiveTab('content');
                  quoteInputRef.current?.focus();
                }}
                className={`relative z-10 my-auto py-4 cursor-pointer rounded transition-all ${
                  selectedElement === 'quote' ? 'ring-1 ring-[#fcd535] bg-black/5 p-2' : ''
                }`}
                title="Click to edit quote text and typography"
              >
                <blockquote
                  style={{
                    fontSize: `${fontSize}px`,
                    textAlign: align,
                  }}
                  className={`${getFontFamilyClass(fontChoice)} leading-relaxed tracking-tight`}
                >
                  “{quote}”
                </blockquote>
              </div>

              {/* Footer Citation & Signature */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedElement('author');
                  setActiveTab('content');
                  authorInputRef.current?.focus();
                }}
                className={`relative z-10 pt-3.5 border-t border-current/15 flex items-center justify-between cursor-pointer rounded transition-all ${
                  selectedElement === 'author' ? 'ring-1 ring-[#fcd535] bg-black/5 p-1' : ''
                }`}
                title="Click to edit author and citation"
              >
                <cite className="not-italic text-xs font-medium opacity-80 truncate max-w-[80%]">
                  — {author}
                </cite>
                <span className="text-[10px] font-mono opacity-50 uppercase">
                  {aspectRatio}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK STYLE SWITCHER MODAL / DRAWER */}
      {templateDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setTemplateDrawerOpen(false)}
        >
          <div
            className={`w-full max-w-2xl max-h-[85vh] rounded-2xl border shadow-2xl flex flex-col overflow-hidden ${
              isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#181d24] border-[#262c36]'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className={`p-4 border-b flex items-center justify-between ${isLight ? 'border-[#e2e8f0]' : 'border-[#262c36]'}`}>
              <div className="flex items-center gap-2">
                <LayoutTemplate className={`w-4 h-4 ${isLight ? 'text-[#d97706]' : 'text-[#fcd535]'}`} />
                <h3 className={`text-sm font-semibold ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
                  Choose Preset Art Direction
                </h3>
              </div>
              <button
                onClick={() => setTemplateDrawerOpen(false)}
                className="text-[#707a8a] hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Preservation Toggle Bar */}
            <div
              className={`px-4 py-2.5 border-b flex items-center justify-between text-xs ${
                isLight ? 'bg-[#f8fafc] border-[#e2e8f0]' : 'bg-[#14171d] border-[#262c36]'
              }`}
            >
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preserveTextOnSwitch}
                  onChange={(e) => setPreserveTextOnSwitch(e.target.checked)}
                  className="accent-[#fcd535] w-4 h-4 cursor-pointer"
                />
                <span className={isLight ? 'text-[#334155]' : 'text-[#c4c7c8]'}>
                  Preserve my current quote and author text (recommended)
                </span>
              </label>
              <span className="text-[11px] text-[#707a8a]">12 Styles</span>
            </div>

            {/* Template Selection Grid */}
            <div className="p-4 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {PRESET_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => handleApplyTemplate(tmpl)}
                  style={{ backgroundColor: tmpl.theme.bg, color: tmpl.theme.ink }}
                  className="p-3.5 rounded-xl border border-black/15 text-left flex flex-col justify-between min-h-[140px] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-md"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono opacity-70">
                    <span className="truncate max-w-[120px]">{tmpl.tag}</span>
                    <span className="border border-current/30 px-1 rounded">{tmpl.badge}</span>
                  </div>

                  <p className="text-xs my-2 line-clamp-2 leading-snug">
                    “{preserveTextOnSwitch ? quote : tmpl.quote}”
                  </p>

                  <div className="text-[10px] font-semibold opacity-80 truncate border-t border-current/15 pt-1.5 flex items-center justify-between">
                    <span>{tmpl.title}</span>
                    <span className="uppercase text-[9px]">{tmpl.font}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditorView;
