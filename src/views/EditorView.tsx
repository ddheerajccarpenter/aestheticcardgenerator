import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { CardTemplate, AspectRatioId, FontChoice, ExportFormat, CardState, VerticalAlign, SurfaceFinish } from '../types/card';
import { ASPECT_RATIOS, PALETTE_PRESETS, SAMPLE_QUOTES, PRESET_TEMPLATES } from '../data/templates';
import { toPng, toBlob, toSvg } from 'html-to-image';
import confetti from 'canvas-confetti';
import { updatePageSEO } from '../utils/seo';
import { parseRichText } from '../utils/richText';
import { MediaImportModal, type MediaResult } from '../components/MediaImportModal';
import { renderCardWithBackdrop, type BackdropSurface, type BackdropRatio } from '../utils/backdropExport';
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
  Share2,
  Bold,
  Italic,
  Highlighter,
  BookOpen,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyEnd,
  Upload,
  Box,
  Sun,
  Maximize2,
} from 'lucide-react';
import { updateWorkspaceAmbientBackdrop } from '../engines/ambientStageEngine';
import {
  registerAndSaveCustomFont,
  restoreSavedCustomFonts,
  type StoredCustomFont,
} from '../services/customFontManager';
import {
  SURFACE_TEXTURES_55,
  SURFACE_TEXTURE_CATEGORIES,
  getTextureStyle,
} from '../data/surfaceTexturesCatalog';
import {
  ELEMENTS_55_CATALOG,
  ELEMENT_CATEGORIES,
  getElementById,
} from '../data/elementsCatalog';
import { extractPaletteFromImage, type ExtractedPalette } from '../utils/paletteExtractor';
import { createThreeCardPreviewScene } from '../engines/threeCardStage';
import { TIER_LONG_EDGE } from '../engines/ultraHdExportEngine';
import {
  getBrandedExportFilename,
  exportThreeDimensionalCardPNG,
} from '../engines/brandedExportAndThreePng';

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
  const [docTitle, setDocTitle] = useState('My Card');
  const [aspectRatio, setAspectRatio] = useState<AspectRatioId>('1:1');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'type' | 'palette' | 'decor'>('content');

  // Selected canvas element for direct manipulation
  const [selectedElement, setSelectedElement] = useState<'quote' | 'author' | 'tag' | 'badge' | 'card' | null>(null);

  // Content state
  const [quote, setQuote] = useState(
    initialTemplate?.quote ||
      'In the depth of winter, I finally learned that within me there lay an invincible summer.'
  );
  const [author, setAuthor] = useState(initialTemplate?.author || 'Albert Camus — Return to Tipasa');
  const [tag, setTag] = useState(initialTemplate?.tag || 'FAVORITE LINES • NO. 04');
  const [badge, setBadge] = useState(initialTemplate?.badge || 'READING NOTES');

  // Styling state
  const [bgColor, setBgColor] = useState(initialTemplate?.theme.bg || '#f4ede4');
  const [inkColor, setInkColor] = useState(initialTemplate?.theme.ink || '#2c2825');
  const [fontChoice, setFontChoice] = useState<FontChoice>(initialTemplate?.font || 'editorial');
  const [fontSize, setFontSize] = useState<number>(initialTemplate?.fontSize || 26);
  const [lineHeight, setLineHeight] = useState<number>(initialTemplate?.lineHeight || 1.45);
  const [letterSpacing, setLetterSpacing] = useState<number>(initialTemplate?.letterSpacing || 0);
  const [verticalAlign, setVerticalAlign] = useState<VerticalAlign>(initialTemplate?.verticalAlign || 'middle');
  const [surfaceFinish, setSurfaceFinish] = useState<SurfaceFinish>(
    initialTemplate?.surfaceFinish || (initialTemplate?.showGrain ? 'grain' : 'none')
  );
  const [textureIntensity, setTextureIntensity] = useState<number>(initialTemplate?.textureIntensity ?? 50);
  const [isHolographic, setIsHolographic] = useState<boolean>(initialTemplate?.isHolographic || false);
  const [align, setAlign] = useState<'left' | 'center' | 'right'>(initialTemplate?.align || 'left');
  const [padding, setPadding] = useState<number>(initialTemplate?.padding || 36);
  const [borderRadius, setBorderRadius] = useState<number>(initialTemplate?.borderRadius || 12);
  const [showGrain, setShowGrain] = useState(initialTemplate?.showGrain ?? true);
  const [showBorder, setShowBorder] = useState(initialTemplate?.showBorder ?? true);
  const [showIcon, setShowIcon] = useState(initialTemplate?.showIcon ?? true);
  const [iconName, setIconName] = useState(initialTemplate?.iconName || 'format_quote');

  // Presentation Backdrop Export Mode
  const [backdropSurface, setBackdropSurface] = useState<BackdropSurface>('none');
  const [backdropRatio, setBackdropRatio] = useState<BackdropRatio>('4:5');

  // Media auto-fill modal
  const [mediaModalOpen, setMediaModalOpen] = useState(false);

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
  const stageRef = useRef<HTMLDivElement>(null);
  const quoteInputRef = useRef<HTMLTextAreaElement>(null);
  const authorInputRef = useRef<HTMLInputElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);

  // Workspace Ambient Lighting
  const [ambientModeEnabled, setAmbientModeEnabled] = useState<boolean>(true);

  // 3D Card Stage View
  const [is3DMode, setIs3DMode] = useState<boolean>(false);
  const threeMountRef = useRef<HTMLDivElement>(null);
  const threeCleanupRef = useRef<(() => void) | null>(null);

  // Social Safe-Zones Overlay ('none' | 'print' | 'reels' | 'feed')
  const [safeZoneMode, setSafeZoneMode] = useState<'none' | 'print' | 'reels' | 'feed'>('none');

  // Custom Font Engine
  const [customFonts, setCustomFonts] = useState<StoredCustomFont[]>([]);
  const customFontInputRef = useRef<HTMLInputElement>(null);

  // 55+ Procedural Surface Textures
  const [selectedTextureId, setSelectedTextureId] = useState<string>(
    initialTemplate?.surfaceFinish === 'halftone' ? 'halftone-screen-60lpi' :
    initialTemplate?.surfaceFinish === 'crease' ? 'creased-zine-fold' :
    initialTemplate?.surfaceFinish === 'lanyard' ? 'pvc-security-id-sheen' :
    'cotton-rag-300gsm'
  );
  const [textureCategory, setTextureCategory] = useState<string>('all');
  const [textureScale, setTextureScale] = useState<number>(100);
  const [textureBlendMode, setTextureBlendMode] = useState<'multiply' | 'screen' | 'overlay' | 'soft-light'>('multiply');

  // 55+ Decorative Elements
  const [selectedElementId, setSelectedElementId] = useState<string>('botanical-olive-branch');
  const [elementCategory, setElementCategory] = useState<string>('all');

  // Photo Palette Extraction
  const [extractedPalette, setExtractedPalette] = useState<ExtractedPalette | null>(null);
  const [isExtractingPalette, setIsExtractingPalette] = useState<boolean>(false);
  const paletteFileInputRef = useRef<HTMLInputElement>(null);

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
      lineHeight,
      letterSpacing,
      verticalAlign,
      surfaceFinish,
      textureIntensity,
      isHolographic,
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
    lineHeight,
    letterSpacing,
    verticalAlign,
    surfaceFinish,
    textureIntensity,
    isHolographic,
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
  // Initialize history with initial state or restored draft on mount, plus URL param & hero hydration
  useEffect(() => {
    // 1. Check local session storage from homepage mini studio
    const heroImport = sessionStorage.getItem('aesthetic_card_studio_hero_quote');
    if (heroImport) {
      try {
        const data = JSON.parse(heroImport);
        if (data.quote) setQuote(data.quote);
        if (data.author) setAuthor(data.author);
        if (data.tag) setTag(data.tag);
        if (data.bg) setBgColor(data.bg);
        if (data.ink) setInkColor(data.ink);
        sessionStorage.removeItem('aesthetic_card_studio_hero_quote');
        showToast('Loaded custom quote from homepage mini-studio!');
        const snap = getCurrentSnapshot();
        setHistory([snap]);
        setHistoryIndex(0);
        return;
      } catch (e) {
        console.error(e);
      }
    }

    // 2. Check shareable URL parameters
    const params = new URLSearchParams(window.location.search);
    if (params.has('share') || params.has('q')) {
      const q = params.get('q') || params.get('quote');
      const a = params.get('a') || params.get('author');
      const t = params.get('t') || params.get('tag');
      const b = params.get('b') || params.get('badge');
      const f = params.get('font') as FontChoice;
      const fs = params.get('size');
      const lh = params.get('lh');
      const ls = params.get('ls');
      const va = params.get('va') as VerticalAlign;
      const bg = params.get('bg');
      const ink = params.get('ink');
      const pad = params.get('pad');
      const rad = params.get('rad');
      const surf = params.get('surf') as SurfaceFinish;
      const tint = params.get('int');
      const holo = params.get('holo');

      if (q) setQuote(decodeURIComponent(q));
      if (a) setAuthor(decodeURIComponent(a));
      if (t) setTag(decodeURIComponent(t));
      if (b) setBadge(decodeURIComponent(b));
      if (f) setFontChoice(f);
      if (fs) setFontSize(Number(fs));
      if (lh) setLineHeight(Number(lh));
      if (ls) setLetterSpacing(Number(ls));
      if (va) setVerticalAlign(va);
      if (bg) setBgColor(bg.startsWith('#') ? bg : `#${bg}`);
      if (ink) setInkColor(ink.startsWith('#') ? ink : `#${ink}`);
      if (pad) setPadding(Number(pad));
      if (rad) setBorderRadius(Number(rad));
      if (surf) setSurfaceFinish(surf);
      if (tint) setTextureIntensity(Number(tint));
      if (holo) setIsHolographic(holo === '1' || holo === 'true');

      showToast('Loaded shared card template from link!');
      const snap = getCurrentSnapshot();
      setHistory([snap]);
      setHistoryIndex(0);
      return;
    }

    // 3. Check local draft
    const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!initialTemplate && savedDraft) {
      try {
        const parsed: CardState = JSON.parse(savedDraft);
        setDocTitle(parsed.docTitle || 'My Card');
        setQuote(parsed.quote);
        setAuthor(parsed.author);
        setTag(parsed.tag);
        setBadge(parsed.badge);
        setBgColor(parsed.bgColor);
        setInkColor(parsed.inkColor);
        setFontChoice(parsed.fontChoice);
        setFontSize(parsed.fontSize);
        if (parsed.lineHeight !== undefined) setLineHeight(parsed.lineHeight);
        if (parsed.letterSpacing !== undefined) setLetterSpacing(parsed.letterSpacing);
        if (parsed.verticalAlign !== undefined) setVerticalAlign(parsed.verticalAlign);
        if (parsed.surfaceFinish !== undefined) setSurfaceFinish(parsed.surfaceFinish);
        if (parsed.textureIntensity !== undefined) setTextureIntensity(parsed.textureIntensity);
        if (parsed.isHolographic !== undefined) setIsHolographic(parsed.isHolographic);
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
      if (initialTemplate.lineHeight !== undefined) setLineHeight(initialTemplate.lineHeight);
      if (initialTemplate.letterSpacing !== undefined) setLetterSpacing(initialTemplate.letterSpacing);
      if (initialTemplate.verticalAlign !== undefined) setVerticalAlign(initialTemplate.verticalAlign);
      if (initialTemplate.surfaceFinish !== undefined) setSurfaceFinish(initialTemplate.surfaceFinish);
      if (initialTemplate.textureIntensity !== undefined) setTextureIntensity(initialTemplate.textureIntensity);
      if (initialTemplate.isHolographic !== undefined) setIsHolographic(initialTemplate.isHolographic);

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
        lineHeight: initialTemplate.lineHeight || 1.45,
        letterSpacing: initialTemplate.letterSpacing || 0,
        verticalAlign: initialTemplate.verticalAlign || 'middle',
        surfaceFinish: initialTemplate.surfaceFinish || (initialTemplate.showGrain ? 'grain' : 'none'),
        textureIntensity: initialTemplate.textureIntensity ?? 50,
        isHolographic: initialTemplate.isHolographic || false,
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
    if (s.lineHeight !== undefined) setLineHeight(s.lineHeight);
    if (s.letterSpacing !== undefined) setLetterSpacing(s.letterSpacing);
    if (s.verticalAlign !== undefined) setVerticalAlign(s.verticalAlign);
    if (s.surfaceFinish !== undefined) setSurfaceFinish(s.surfaceFinish);
    if (s.textureIntensity !== undefined) setTextureIntensity(s.textureIntensity);
    if (s.isHolographic !== undefined) setIsHolographic(s.isHolographic);
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

  // Load custom fonts from IndexedDB on mount
  useEffect(() => {
    restoreSavedCustomFonts().then((fonts) => {
      setCustomFonts(fonts);
    });
  }, []);

  // Update workspace ambient glow strictly on stage wrapper
  useEffect(() => {
    updateWorkspaceAmbientBackdrop(cardRef.current, stageRef.current, ambientModeEnabled, {
      bg: bgColor,
      ink: inkColor,
    });
  }, [ambientModeEnabled, bgColor, inkColor, aspectRatio, padding, borderRadius, selectedTextureId]);

  // Manage Three.js 3D Card Scene with debouncing and GPU texture reuse
  useEffect(() => {
    if (!is3DMode || !threeMountRef.current || !cardRef.current) {
      if (threeCleanupRef.current) {
        threeCleanupRef.current();
        threeCleanupRef.current = null;
      }
      return;
    }

    let isMounted = true;
    const timer = setTimeout(async () => {
      try {
        if (!cardRef.current) return;
        const rawUrl = await toPng(cardRef.current, { pixelRatio: 1.5 });
        if (!isMounted) return;
        const img = new Image();
        img.src = rawUrl;
        await new Promise((res) => { img.onload = res; });
        if (!isMounted || !threeMountRef.current) return;

        const offscreen = document.createElement('canvas');
        offscreen.width = img.naturalWidth;
        offscreen.height = img.naturalHeight;
        const ctx = offscreen.getContext('2d');
        if (ctx) ctx.drawImage(img, 0, 0);

        if (threeCleanupRef.current && (threeCleanupRef.current as any).updateTexture) {
          (threeCleanupRef.current as any).updateTexture(offscreen, selectedTextureId);
        } else {
          if (threeCleanupRef.current) threeCleanupRef.current();
          const cleanup = createThreeCardPreviewScene(
            threeMountRef.current,
            offscreen,
            cardRef.current.offsetWidth,
            cardRef.current.offsetHeight,
            selectedTextureId
          );
          threeCleanupRef.current = cleanup;
        }
      } catch (err) {
        console.error('Failed to initialize 3D scene:', err);
      }
    }, 180);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [is3DMode, bgColor, inkColor, quote, author, tag, fontChoice, selectedTextureId, aspectRatio]);

  useEffect(() => {
    return () => {
      if (threeCleanupRef.current) {
        threeCleanupRef.current();
        threeCleanupRef.current = null;
      }
    };
  }, []);

  // Current aspect preset
  const currentRatioPreset = ASPECT_RATIOS.find((r) => r.id === aspectRatio) || ASPECT_RATIOS[0];

  // Font class resolver for 12 curated fonts
  const getFontFamilyClass = (f: FontChoice) => {
    switch (f) {
      case 'editorial':
        return 'font-newsreader';
      case 'serif':
        return 'font-playfair';
      case 'instrument':
        return 'font-instrument';
      case 'cormorant':
        return 'font-cormorant';
      case 'syne':
        return 'font-syne';
      case 'space-grotesk':
        return 'font-space-grotesk';
      case 'unbounded':
        return 'font-unbounded';
      case 'space-mono':
        return 'font-space-mono';
      case 'mono':
        return 'font-jetbrains';
      case 'pixel':
        return 'font-vt323';
      case 'caveat':
        return 'font-caveat';
      case 'reenie':
        return 'font-reenie';
      case 'sans':
      default:
        return 'font-modern-sans';
    }
  };

  // Quick rich-text formatter for quote textarea
  const insertFormat = (prefix: string, suffix: string = prefix) => {
    if (!quoteInputRef.current) return;
    const textarea = quoteInputRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = quote.substring(start, end);
    const replacement = selected ? `${prefix}${selected}${suffix}` : `${prefix}text${suffix}`;
    const newQuote = quote.substring(0, start) + replacement + quote.substring(end);
    setQuote(newQuote);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + replacement.length - suffix.length);
    }, 0);
  };

  // Share style link generator
  const handleShareStyleLink = () => {
    const url = new URL(window.location.origin + '/create');
    url.searchParams.set('share', '1');
    url.searchParams.set('q', encodeURIComponent(quote));
    url.searchParams.set('a', encodeURIComponent(author));
    url.searchParams.set('t', encodeURIComponent(tag));
    url.searchParams.set('b', encodeURIComponent(badge));
    url.searchParams.set('font', fontChoice);
    url.searchParams.set('size', String(fontSize));
    url.searchParams.set('lh', String(lineHeight));
    url.searchParams.set('ls', String(letterSpacing));
    url.searchParams.set('va', verticalAlign);
    url.searchParams.set('bg', bgColor.replace('#', ''));
    url.searchParams.set('ink', inkColor.replace('#', ''));
    url.searchParams.set('pad', String(padding));
    url.searchParams.set('rad', String(borderRadius));
    url.searchParams.set('surf', surfaceFinish);
    url.searchParams.set('int', String(textureIntensity));
    if (isHolographic) url.searchParams.set('holo', '1');

    navigator.clipboard.writeText(url.toString());
    setCopied(true);
    showToast('Shareable style link copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  // Handle Book / Song auto-fill
  const handleMediaSelect = (item: MediaResult) => {
    if (item.type === 'book') {
      setAuthor(item.author);
      setTag(item.title.toUpperCase());
      if (item.year) setBadge(`EST. ${item.year}`);
      if (item.firstSentence) {
        setQuote(`“${item.firstSentence}”`);
      }
      showToast(`Imported book: ${item.title}`);
    } else {
      setAuthor(item.artist);
      setTag(item.title.toUpperCase());
      if (item.year) setBadge(`RELEASED ${item.year}`);
      showToast(`Imported track: ${item.title}`);
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

  // Random palette inspirer
  const handleRandomPalette = () => {
    const random = PALETTE_PRESETS[Math.floor(Math.random() * PALETTE_PRESETS.length)];
    if (random) {
      setBgColor(random.bg);
      setInkColor(random.ink);
      showToast(`Switched palette to ${random.name}`);
    }
  };

  // Reset to clean default values
  const handleReset = () => {
    if (window.confirm('Reset this card to clean defaults? Unsaved custom styling will be replaced.')) {
      setQuote('In the depth of winter, I finally learned that within me there lay an invincible summer.');
      setAuthor('Albert Camus — Return to Tipasa');
      setTag('FAVORITE LINES • NO. 04');
      setBadge('READING NOTES');
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

  // High-Res & Ultra-HD Export (4K, 8K, 16K, 3D PNG, WebP, PNG 1×, PNG 2×, SVG)
  const handleExport = async (format: ExportFormat | 'ultra-4k' | 'ultra-8k' | 'ultra-16k' | '3d-4k' | '3d-8k') => {
    if (!cardRef.current) return;
    prepareCanvasForCapture();
    setIsExporting(true);
    setExportMenuOpen(false);

    try {
      // Small tick to ensure UI selection borders are removed from DOM
      await new Promise((resolve) => setTimeout(resolve, 80));

      // Handle 3D Transparent PNG Export (Part V.2 & Part IX.1)
      if (format === '3d-4k' || format === '3d-8k') {
        const rawUrl = await toPng(cardRef.current, { pixelRatio: 2, cacheBust: true });
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
          cardRef.current.offsetWidth,
          cardRef.current.offsetHeight,
          surfaceFinish,
          { rotX: -0.14, rotY: 0.24, rotZ: -0.02 },
          resolution
        );
        showToast(`Exported 3D Card (${resolution}px Transparent PNG)!`);
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#E2D9C8', '#ffffff', '#222731', '#111417'],
        });
        return;
      }

      let downloadUrl = '';
      let downloadExt: 'png' | 'webp' | 'svg' = 'png';
      const isUltra = format.startsWith('ultra-');

      if (isUltra) {
        const tier = format === 'ultra-16k' ? '16K' : format === 'ultra-8k' ? '8K' : '4K';
        const targetLongEdge = TIER_LONG_EDGE[tier];
        const currentLongEdge = Math.max(cardRef.current.offsetWidth, cardRef.current.offsetHeight) || 520;
        const pixelRatio = Math.min(16, Math.max(4, Math.round(targetLongEdge / currentLongEdge)));

        if (document.fonts && document.fonts.ready) {
          await document.fonts.ready;
        }

        downloadUrl = await toPng(cardRef.current, {
          pixelRatio,
          cacheBust: true,
        });
        downloadExt = 'png';
      } else if (format === 'png-2x') {
        const rawUrl = await toPng(cardRef.current, { pixelRatio: 2 });
        downloadUrl = backdropSurface !== 'none'
          ? await renderCardWithBackdrop(rawUrl, backdropSurface, backdropRatio, 2, bgColor)
          : rawUrl;
        downloadExt = 'png';
      } else if (format === 'png-1x') {
        const rawUrl = await toPng(cardRef.current, { pixelRatio: 1 });
        downloadUrl = backdropSurface !== 'none'
          ? await renderCardWithBackdrop(rawUrl, backdropSurface, backdropRatio, 1, bgColor)
          : rawUrl;
        downloadExt = 'png';
      } else if (format === 'svg') {
        downloadUrl = await toSvg(cardRef.current);
        downloadExt = 'svg';
      } else if (format === 'webp') {
        const rawUrl = await toPng(cardRef.current, { pixelRatio: 2 });
        const backdropProcessed = backdropSurface !== 'none'
          ? await renderCardWithBackdrop(rawUrl, backdropSurface, backdropRatio, 2, bgColor)
          : rawUrl;
        const img = new Image();
        img.src = backdropProcessed;
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
          downloadUrl = backdropProcessed;
          downloadExt = 'png';
        }
      }

      // MANDATORY FILENAME RULE: Always starts with aestheticcardgenerator.com
      const brandedFilename = getBrandedExportFilename(
        downloadExt,
        '2d',
        isUltra ? (format.replace('ultra-', '').toUpperCase() as '4K' | '8K' | '16K') : undefined
      );

      const link = document.createElement('a');
      link.download = brandedFilename;
      link.href = downloadUrl;
      link.click();

      // Confetti celebration
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#E2D9C8', '#ffffff', '#222731', '#111417'],
      });

      showToast(`Exported ${downloadExt.toUpperCase()} (${format.startsWith('ultra-') ? format.toUpperCase() : 'Master'})`);
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

  // Pure vector Boxicon mapping to completely prevent unstyled ligature words (e.g. 'terminal') from leaking as raw text
  const getCardHeaderIconClass = (icon: string): string => {
    const iconMap: Record<string, string> = {
      terminal: 'bx bx-terminal',
      format_quote: 'bx bxs-quote-left',
      bookmark: 'bx bxs-bookmark-alt',
      auto_awesome: 'bx bxs-magic-wand',
      sparkles: 'bx bxs-sparkles',
      grid_view: 'bx bx-grid-alt',
      edit_note: 'bx bx-edit-alt',
      stars: 'bx bxs-star',
      star: 'bx bxs-star',
      favorite: 'bx bxs-heart',
      qr_code: 'bx bx-qr',
      badge: 'bx bx-id-card',
      verified: 'bx bxs-badge-check',
      fingerprint: 'bx bx-fingerprint',
      palette: 'bx bx-palette',
      album: 'bx bx-disc',
      cloud: 'bx bx-cloud',
      menu_book: 'bx bx-book-open',
      task_alt: 'bx bx-check-circle',
      draw: 'bx bx-pencil',
      restaurant: 'bx bx-restaurant',
      flight_takeoff: 'bx bx-paper-plane',
      shield: 'bx bxs-shield',
      stream: 'bx bx-slider',
      public: 'bx bx-globe',
      hotel: 'bx bx-hotel',
      local_florist: 'bx bxs-florist',
      description: 'bx bx-file',
      crop_square: 'bx bx-square',
    };
    return iconMap[icon] || 'bx bxs-quote-left';
  };

  const renderCardHeaderIcon = () => {
    if (!showIcon) return null;
    const elDef = getElementById(selectedElementId);
    if (elDef && selectedElementId !== 'none') {
      return (
        <span className={`text-[13px] leading-none shrink-0 select-none ${isHolographic ? 'holographic-foil' : ''}`}>
          {elDef.glyph || '✦'}
        </span>
      );
    }
    const iconCls = getCardHeaderIconClass(iconName);
    return (
      <i className={`${iconCls} text-[14px] leading-none shrink-0 select-none ${isHolographic ? 'holographic-foil' : ''}`} />
    );
  };

  // ───────────────────────────────────────────────────────────────────────────
  // REUSABLE CONTROL TABS & PANELS (Shared between desktop sidebar & mobile sheet)
  // ───────────────────────────────────────────────────────────────────────────

  const renderControlTabs = (isMobileSheet = false) => (
    <div
      className={`grid grid-cols-4 border-b p-1 shrink-0 ${
        isLight ? 'bg-[#f8fafc] border-[#e2e8f0]' : 'bg-[#14171d] border-[#262c36]'
      }`}
    >
      <button
        onClick={() => {
          setActiveTab('content');
          if (!isMobileSheet) setMobileSheetOpen(false);
        }}
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
        onClick={() => {
          setActiveTab('type');
          if (!isMobileSheet) setMobileSheetOpen(false);
        }}
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
        onClick={() => {
          setActiveTab('palette');
          if (!isMobileSheet) setMobileSheetOpen(false);
        }}
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
        onClick={() => {
          setActiveTab('decor');
          if (!isMobileSheet) setMobileSheetOpen(false);
        }}
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
  );

  const renderControlPanelContent = (isMobileSheet = false) => (
    <div className="p-4 sm:p-5 flex flex-col gap-6">
      {/* TAB 1: WORDS & TEXT */}
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
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMediaModalOpen(true)}
                className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border cursor-pointer transition-colors ${
                  isLight
                    ? 'bg-white border-[#cbd5e1] text-[#0f172a] hover:bg-[#f1f5f9]'
                    : 'bg-[#181d24] border-[#262c36] text-[#c4c7c8] hover:text-white hover:border-[#444748]'
                }`}
                title="Search book or track metadata"
              >
                <BookOpen className="w-3 h-3 text-[#111417] dark:text-[#E2D9C8]" />
                <span>Import Book / Song</span>
              </button>
              <button
                onClick={handleRandomQuote}
                className={`inline-flex items-center gap-1 text-[11px] hover:underline cursor-pointer ${
                  isLight ? 'text-[#111417]' : 'text-[#E2D9C8]'
                }`}
              >
                <Shuffle className="w-3 h-3" />
                <span>Inspiration</span>
              </button>
            </div>
          </div>

          {/* Quick Inline Format Toolbar */}
          <div className="flex items-center gap-1.5 -mb-2">
            <span className="text-[10px] text-[#707a8a] uppercase font-mono mr-1">Format:</span>
            <button
              type="button"
              onClick={() => insertFormat('**')}
              className={`px-2 py-1 rounded text-xs font-bold border transition-colors cursor-pointer ${
                isLight ? 'bg-white border-[#e2e8f0] text-[#0f172a] hover:bg-[#f8fafc]' : 'bg-[#181d24] border-[#262c36] text-white hover:bg-[#222730]'
              }`}
              title="Bold: **bold text**"
            >
              <Bold className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => insertFormat('*')}
              className={`px-2 py-1 rounded text-xs italic border transition-colors cursor-pointer ${
                isLight ? 'bg-white border-[#e2e8f0] text-[#0f172a] hover:bg-[#f8fafc]' : 'bg-[#181d24] border-[#262c36] text-white hover:bg-[#222730]'
              }`}
              title="Italic: *italic text*"
            >
              <Italic className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => insertFormat('==')}
              className={`px-2 py-1 rounded text-xs border flex items-center gap-1 transition-colors cursor-pointer ${
                isLight ? 'bg-amber-100 border-amber-300 text-amber-900 hover:bg-amber-200' : 'bg-amber-400/20 border-amber-400/40 text-amber-200 hover:bg-amber-400/30'
              }`}
              title="Highlight: ==highlighted words=="
            >
              <Highlighter className="w-3 h-3" />
              <span className="text-[10px] font-mono">==Highlight==</span>
            </button>
          </div>

          <div className="relative">
            <textarea
              ref={quoteInputRef}
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              rows={isMobileSheet ? 3 : 4}
              className={`w-full rounded-xl p-3 text-sm leading-relaxed resize-none focus:outline-none border transition-all ${
                isLight
                  ? 'bg-white border-[#cbd5e1] text-[#0f172a] focus:border-[#111417]'
                  : 'bg-[#181d24] border-[#262c36] text-white focus:border-[#E2D9C8]'
              }`}
              placeholder="Paste or type your quote, poetry, or thoughts..."
            />

            {/* Character count & Long Text Warning */}
            <div className="flex items-center justify-between pt-1 px-1 text-[11px] text-[#707a8a]">
              <span>
                {quote.length} characters • {quote.trim().split(/\s+/).filter(Boolean).length} words
              </span>
              {isLongText && (
                <button
                  onClick={handleAutoFitFontSize}
                  className={`flex items-center gap-1 font-medium cursor-pointer ${
                    isLight ? 'text-[#111417]' : 'text-[#E2D9C8]'
                  }`}
                  title="Auto-adjust font size to fit"
                >
                  <Wand2 className="w-3 h-3" />
                  <span>Auto-fit</span>
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
              Author / Attribution
            </label>
            <input
              ref={authorInputRef}
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className={`w-full rounded-xl px-3 py-2 text-xs border focus:outline-none ${
                isLight
                  ? 'bg-white border-[#cbd5e1] text-[#0f172a] focus:border-[#111417]'
                  : 'bg-[#181d24] border-[#262c36] text-white focus:border-[#E2D9C8]'
              }`}
              placeholder="e.g. Albert Camus — Return to Tipasa"
            />
          </div>

          {/* Header Tag & Corner Badge stacked responsively */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    ? 'bg-white border-[#cbd5e1] text-[#0f172a] focus:border-[#111417]'
                    : 'bg-[#181d24] border-[#262c36] text-white focus:border-[#E2D9C8]'
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
                    ? 'bg-white border-[#cbd5e1] text-[#0f172a] focus:border-[#111417]'
                    : 'bg-[#181d24] border-[#262c36] text-white focus:border-[#E2D9C8]'
                }`}
                placeholder="e.g. EST. 1997"
              />
            </div>
          </div>

          {/* Curated Quotes: Naturally Wrapped Cards with Dedicated "Use Quote" Action */}
          <div
            className={`pt-4 border-t flex flex-col gap-2.5 ${
              isLight ? 'border-[#e2e8f0]' : 'border-[#1f242c]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#707a8a] uppercase tracking-wider">
                Curated Quotes & Reflections
              </span>
              <span className="text-[10px] text-[#707a8a] font-mono">
                {SAMPLE_QUOTES.length} Available
              </span>
            </div>
            <div className="flex flex-col gap-2.5 max-h-72 overflow-y-auto pr-1">
              {SAMPLE_QUOTES.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border flex flex-col gap-2 transition-all ${
                    isLight
                      ? 'bg-[#f8fafc] border-[#e2e8f0] hover:border-[#cbd5e1]'
                      : 'bg-[#14171d] border-[#262c36] hover:border-[#444748]'
                  }`}
                >
                  <p
                    className={`text-xs leading-relaxed italic ${
                      isLight ? 'text-[#1e293b]' : 'text-[#e2e8f0]'
                    }`}
                  >
                    “{item.q}”
                  </p>
                  <div className="flex items-center justify-between pt-1 border-t border-current/10">
                    <span className="text-[11px] font-medium opacity-70">
                      {item.a} • <span className="opacity-60">{item.t}</span>
                    </span>
                    <button
                      onClick={() => {
                        setQuote(item.q);
                        setAuthor(item.a);
                        setTag(item.t);
                        showToast('Loaded quote into editor');
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                        isLight
                          ? 'bg-[#111417] text-white hover:bg-[#222731]'
                          : 'bg-[#E2D9C8] text-[#111417] hover:bg-[#d5cbba]'
                      }`}
                    >
                      Use Quote
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TYPOGRAPHY (12 Curated Fonts in 4 Categories) */}
      {activeTab === 'type' && (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label
                className={`text-xs font-semibold uppercase tracking-wider ${
                  isLight ? 'text-[#0f172a]' : 'text-white'
                }`}
              >
                Curated Font Stacks (12)
              </label>
              <span className="text-[10px] text-[#707a8a] font-mono">4 Categories</span>
            </div>

            {/* Editorial Serif */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] uppercase font-mono font-semibold text-[#707a8a]">Editorial Serif</span>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'editorial' as FontChoice, name: 'Newsreader', cls: 'font-newsreader' },
                  { id: 'serif' as FontChoice, name: 'Playfair Display', cls: 'font-playfair' },
                  { id: 'instrument' as FontChoice, name: 'Instrument Serif', cls: 'font-instrument' },
                  { id: 'cormorant' as FontChoice, name: 'Cormorant Garamond', cls: 'font-cormorant' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFontChoice(f.id)}
                    className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                      fontChoice === f.id
                        ? isLight
                          ? 'border-[#111417] bg-[#f8fafc] text-[#0f172a] ring-1 ring-[#111417]'
                          : 'border-[#E2D9C8] bg-[#181d24] text-white ring-1 ring-[#E2D9C8]'
                        : isLight
                        ? 'border-[#e2e8f0] bg-white text-[#475569] hover:text-[#0f172a]'
                        : 'border-[#262c36] bg-[#14171d] text-[#9ca3af] hover:text-white'
                    }`}
                  >
                    <span className={`${f.cls} text-sm block leading-tight truncate`}>{f.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Display & Y2K */}
            <div className="flex flex-col gap-1.5 pt-1">
              <span className="text-[10px] uppercase font-mono font-semibold text-[#707a8a]">Display & Y2K</span>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'syne' as FontChoice, name: 'Syne', cls: 'font-syne' },
                  { id: 'space-grotesk' as FontChoice, name: 'Space Grotesk', cls: 'font-space-grotesk' },
                  { id: 'unbounded' as FontChoice, name: 'Unbounded', cls: 'font-unbounded' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFontChoice(f.id)}
                    className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                      fontChoice === f.id
                        ? isLight
                          ? 'border-[#111417] bg-[#f8fafc] text-[#0f172a] ring-1 ring-[#111417]'
                          : 'border-[#E2D9C8] bg-[#181d24] text-white ring-1 ring-[#E2D9C8]'
                        : isLight
                        ? 'border-[#e2e8f0] bg-white text-[#475569] hover:text-[#0f172a]'
                        : 'border-[#262c36] bg-[#14171d] text-[#9ca3af] hover:text-white'
                    }`}
                  >
                    <span className={`${f.cls} text-xs block leading-tight truncate font-bold`}>{f.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Archival Mono & Pixel */}
            <div className="flex flex-col gap-1.5 pt-1">
              <span className="text-[10px] uppercase font-mono font-semibold text-[#707a8a]">Archival Mono & Pixel</span>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'space-mono' as FontChoice, name: 'Space Mono', cls: 'font-space-mono' },
                  { id: 'mono' as FontChoice, name: 'JetBrains', cls: 'font-jetbrains' },
                  { id: 'pixel' as FontChoice, name: 'VT323 Pixel', cls: 'font-vt323' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFontChoice(f.id)}
                    className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                      fontChoice === f.id
                        ? isLight
                          ? 'border-[#111417] bg-[#f8fafc] text-[#0f172a] ring-1 ring-[#111417]'
                          : 'border-[#E2D9C8] bg-[#181d24] text-white ring-1 ring-[#E2D9C8]'
                        : isLight
                        ? 'border-[#e2e8f0] bg-white text-[#475569] hover:text-[#0f172a]'
                        : 'border-[#262c36] bg-[#14171d] text-[#9ca3af] hover:text-white'
                    }`}
                  >
                    <span className={`${f.cls} text-xs block leading-tight truncate`}>{f.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Handwritten & Zine */}
            <div className="flex flex-col gap-1.5 pt-1">
              <span className="text-[10px] uppercase font-mono font-semibold text-[#707a8a]">Handwritten & Zine</span>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'caveat' as FontChoice, name: 'Caveat Script', cls: 'font-caveat' },
                  { id: 'reenie' as FontChoice, name: 'Reenie Beanie', cls: 'font-reenie' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFontChoice(f.id)}
                    className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                      fontChoice === f.id
                        ? isLight
                          ? 'border-[#111417] bg-[#f8fafc] text-[#0f172a] ring-1 ring-[#111417]'
                          : 'border-[#E2D9C8] bg-[#181d24] text-white ring-1 ring-[#E2D9C8]'
                        : isLight
                        ? 'border-[#e2e8f0] bg-white text-[#475569] hover:text-[#0f172a]'
                        : 'border-[#262c36] bg-[#14171d] text-[#9ca3af] hover:text-white'
                    }`}
                  >
                    <span className={`${f.cls} text-sm block leading-tight truncate`}>{f.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Uploaded Fonts Engine */}
            <div className="flex flex-col gap-2 pt-2 border-t border-current/10">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono font-semibold text-[#707a8a]">
                  Custom Uploaded Fonts ({customFonts.length})
                </span>
                <button
                  type="button"
                  onClick={() => customFontInputRef.current?.click()}
                  className="text-[11px] font-semibold text-[#111417] dark:text-[#E2D9C8] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Upload className="w-3 h-3" />
                  <span>+ Upload Font</span>
                </button>
              </div>

              <input
                ref={customFontInputRef}
                type="file"
                accept=".ttf,.otf,.woff,.woff2"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    const meta = await registerAndSaveCustomFont(file);
                    setCustomFonts((prev) => [meta, ...prev.filter((f) => f.familyName !== meta.familyName)]);
                    setFontChoice(meta.familyName as any);
                    showToast(`Loaded font "${meta.familyName.replace('Custom_', '').replace(/_/g, ' ')}"`);
                  } catch (err: any) {
                    showToast(err?.message || 'Failed to register font');
                  }
                  e.target.value = '';
                }}
                className="hidden"
              />

              {customFonts.length > 0 ? (
                <div className="grid grid-cols-2 gap-1.5">
                  {customFonts.map((cf) => (
                    <button
                      key={cf.id}
                      onClick={() => setFontChoice(cf.familyName as any)}
                      className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                        fontChoice === cf.familyName
                          ? isLight
                            ? 'border-[#111417] bg-[#f8fafc] text-[#0f172a] ring-1 ring-[#111417]'
                            : 'border-[#E2D9C8] bg-[#181d24] text-white ring-1 ring-[#E2D9C8]'
                          : isLight
                          ? 'border-[#e2e8f0] bg-white text-[#475569] hover:text-[#0f172a]'
                          : 'border-[#262c36] bg-[#14171d] text-[#9ca3af] hover:text-white'
                      }`}
                    >
                      <span style={{ fontFamily: cf.familyName }} className="text-sm block leading-tight truncate">
                        {cf.familyName.replace('Custom_', '').replace(/_/g, ' ')}
                      </span>
                      <span className="text-[9px] text-[#707a8a] font-mono uppercase">{cf.fileName.split('.').pop()}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div
                  onClick={() => customFontInputRef.current?.click()}
                  className="p-3 rounded-xl border border-dashed border-current/20 text-center cursor-pointer hover:border-[#111417] dark:hover:border-[#E2D9C8] transition-colors"
                >
                  <span className="text-xs text-[#707a8a] block">Click to upload .ttf, .otf, .woff, or .woff2</span>
                  <span className="text-[10px] text-[#707a8a]/70">Zero server upload • Saved to browser IndexedDB</span>
                </div>
              )}
            </div>
          </div>

          {/* Font Size Slider */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs">
              <span className={`font-semibold uppercase tracking-wider ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
                Type Scale
              </span>
              <span className="font-mono text-[11px] text-[#707a8a]">{fontSize}px</span>
            </div>
            <input
              type="range"
              min="14"
              max="42"
              step="1"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full accent-[#111417] dark:accent-[#E2D9C8] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#707a8a]">
              <span>Small 14px</span>
              <span>Default 26px</span>
              <span>Hero 42px</span>
            </div>
          </div>

          {/* Line Height (Leading) Slider */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs">
              <span className={`font-semibold uppercase tracking-wider ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
                Line Height (Leading)
              </span>
              <span className="font-mono text-[11px] text-[#707a8a] tabular-nums">{lineHeight.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="2.0"
              step="0.05"
              value={lineHeight}
              onChange={(e) => setLineHeight(Number(e.target.value))}
              className="w-full accent-[#111417] dark:accent-[#E2D9C8] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#707a8a]">
              <span>Tight 1.0</span>
              <span>Default 1.45</span>
              <span>Loose 2.0</span>
            </div>
          </div>

          {/* Letter Spacing (Tracking) Slider */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs">
              <span className={`font-semibold uppercase tracking-wider ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
                Letter Spacing (Tracking)
              </span>
              <span className="font-mono text-[11px] text-[#707a8a] tabular-nums">{letterSpacing.toFixed(2)}em</span>
            </div>
            <input
              type="range"
              min="-0.04"
              max="0.20"
              step="0.01"
              value={letterSpacing}
              onChange={(e) => setLetterSpacing(Number(e.target.value))}
              className="w-full accent-[#111417] dark:accent-[#E2D9C8] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#707a8a]">
              <span>Compact -0.04em</span>
              <span>Normal 0.00em</span>
              <span>Spaced 0.20em</span>
            </div>
          </div>

          {/* Alignment & Vertical Alignment Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label
                className={`text-xs font-semibold uppercase tracking-wider ${
                  isLight ? 'text-[#0f172a]' : 'text-white'
                }`}
              >
                Horizontal
              </label>
              <div
                className={`flex gap-1 border p-1 rounded-xl ${
                  isLight ? 'bg-[#f8fafc] border-[#e2e8f0]' : 'bg-[#181d24] border-[#262c36]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setAlign('left')}
                  className={`flex-1 py-1.5 flex justify-center items-center rounded-lg transition-colors cursor-pointer ${
                    align === 'left'
                      ? isLight ? 'bg-white shadow-sm text-[#0f172a]' : 'bg-[#222730] text-white'
                      : 'text-[#707a8a] hover:text-[#0f172a]'
                  }`}
                  title="Align left"
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setAlign('center')}
                  className={`flex-1 py-1.5 flex justify-center items-center rounded-lg transition-colors cursor-pointer ${
                    align === 'center'
                      ? isLight ? 'bg-white shadow-sm text-[#0f172a]' : 'bg-[#222730] text-white'
                      : 'text-[#707a8a] hover:text-[#0f172a]'
                  }`}
                  title="Align center"
                >
                  <AlignCenter className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setAlign('right')}
                  className={`flex-1 py-1.5 flex justify-center items-center rounded-lg transition-colors cursor-pointer ${
                    align === 'right'
                      ? isLight ? 'bg-white shadow-sm text-[#0f172a]' : 'bg-[#222730] text-white'
                      : 'text-[#707a8a] hover:text-[#0f172a]'
                  }`}
                  title="Align right"
                >
                  <AlignRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                className={`text-xs font-semibold uppercase tracking-wider ${
                  isLight ? 'text-[#0f172a]' : 'text-white'
                }`}
              >
                Vertical Position
              </label>
              <div
                className={`flex gap-1 border p-1 rounded-xl ${
                  isLight ? 'bg-[#f8fafc] border-[#e2e8f0]' : 'bg-[#181d24] border-[#262c36]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setVerticalAlign('top')}
                  className={`flex-1 py-1.5 flex justify-center items-center rounded-lg transition-colors cursor-pointer ${
                    verticalAlign === 'top'
                      ? isLight ? 'bg-white shadow-sm text-[#0f172a]' : 'bg-[#222730] text-white'
                      : 'text-[#707a8a] hover:text-[#0f172a]'
                  }`}
                  title="Top alignment"
                >
                  <AlignVerticalJustifyStart className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setVerticalAlign('middle')}
                  className={`flex-1 py-1.5 flex justify-center items-center rounded-lg transition-colors cursor-pointer ${
                    verticalAlign === 'middle'
                      ? isLight ? 'bg-white shadow-sm text-[#0f172a]' : 'bg-[#222730] text-white'
                      : 'text-[#707a8a] hover:text-[#0f172a]'
                  }`}
                  title="Middle alignment"
                >
                  <AlignVerticalJustifyCenter className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setVerticalAlign('bottom')}
                  className={`flex-1 py-1.5 flex justify-center items-center rounded-lg transition-colors cursor-pointer ${
                    verticalAlign === 'bottom'
                      ? isLight ? 'bg-white shadow-sm text-[#0f172a]' : 'bg-[#222730] text-white'
                      : 'text-[#707a8a] hover:text-[#0f172a]'
                  }`}
                  title="Bottom alignment"
                >
                  <AlignVerticalJustifyEnd className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PALETTE */}
      {activeTab === 'palette' && (
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <label
              className={`text-xs font-semibold uppercase tracking-wider ${
                isLight ? 'text-[#0f172a]' : 'text-white'
              }`}
            >
              Curated Color Sets
            </label>
            <button
              onClick={handleRandomPalette}
              className={`inline-flex items-center gap-1 text-[11px] hover:underline cursor-pointer ${
                isLight ? 'text-[#111417]' : 'text-[#E2D9C8]'
              }`}
            >
              <Shuffle className="w-3 h-3" />
              <span>Shuffle</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {PALETTE_PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setBgColor(p.bg);
                  setInkColor(p.ink);
                }}
                className={`p-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                  bgColor === p.bg && inkColor === p.ink
                    ? isLight
                      ? 'border-[#111417] ring-1 ring-[#111417] shadow-sm'
                      : 'border-[#E2D9C8] ring-1 ring-[#E2D9C8] shadow-sm'
                    : isLight
                    ? 'border-[#e2e8f0] bg-white hover:border-[#cbd5e1]'
                    : 'border-[#262c36] bg-[#181d24] hover:border-[#444748]'
                }`}
              >
                <div
                  style={{ backgroundColor: p.bg }}
                  className="w-7 h-7 rounded-lg border border-black/10 shrink-0 flex items-center justify-center shadow-inner"
                >
                  <div style={{ backgroundColor: p.ink }} className="w-2.5 h-2.5 rounded-full" />
                </div>
                <div className="flex flex-col text-left truncate">
                  <span className={`text-xs font-medium truncate ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
                    {p.name}
                  </span>
                  <span className="text-[10px] text-[#707a8a] uppercase">{p.category}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Custom Color Pickers */}
          <div className={`pt-3 border-t flex flex-col gap-3 ${isLight ? 'border-[#e2e8f0]' : 'border-[#1f242c]'}`}>
            <span className="text-[11px] font-semibold text-[#707a8a] uppercase">Custom Tone Overrides</span>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs">Background Paper</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent"
                  />
                  <input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className={`w-full text-xs font-mono px-2 py-1.5 rounded-lg border focus:outline-none ${
                      isLight ? 'bg-white border-[#cbd5e1]' : 'bg-[#181d24] border-[#262c36]'
                    }`}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-xs">Ink / Text Color</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={inkColor}
                    onChange={(e) => setInkColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent"
                  />
                  <input
                    type="text"
                    value={inkColor}
                    onChange={(e) => setInkColor(e.target.value)}
                    className={`w-full text-xs font-mono px-2 py-1.5 rounded-lg border focus:outline-none ${
                      isLight ? 'bg-white border-[#cbd5e1]' : 'bg-[#181d24] border-[#262c36]'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Photo Palette Extraction Engine */}
          <div className={`pt-3 border-t flex flex-col gap-2.5 ${isLight ? 'border-[#e2e8f0]' : 'border-[#1f242c]'}`}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#707a8a] uppercase tracking-wider">
                Photo Palette Matcher
              </span>
              <button
                type="button"
                onClick={() => paletteFileInputRef.current?.click()}
                className="text-[11px] font-semibold text-[#111417] dark:text-[#E2D9C8] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Upload className="w-3 h-3" />
                <span>Upload Photo</span>
              </button>
            </div>

            <input
              ref={paletteFileInputRef}
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setIsExtractingPalette(true);
                try {
                  const reader = new FileReader();
                  reader.onload = async (evt) => {
                    const dataUrl = evt.target?.result as string;
                    const pal = await extractPaletteFromImage(dataUrl);
                    setExtractedPalette(pal);
                    setIsExtractingPalette(false);
                    showToast('Palette extracted! Click swatches or "Apply".');
                  };
                  reader.readAsDataURL(file);
                } catch {
                  setIsExtractingPalette(false);
                  showToast('Failed to extract colors from image');
                }
                e.target.value = '';
              }}
              className="hidden"
            />

            {isExtractingPalette && (
              <div className="p-3 rounded-xl border border-[#E2D9C8]/40 bg-[#E2D9C8]/5 text-center text-xs animate-pulse">
                Extracting 5-color palette from photo...
              </div>
            )}

            {extractedPalette && (
              <div className="flex flex-col gap-2 p-3 rounded-xl border border-current/10 bg-black/5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">Extracted Swatches</span>
                  <button
                    type="button"
                    onClick={() => {
                      setBgColor(extractedPalette.dominant);
                      setInkColor(extractedPalette.ink);
                      showToast('Applied photo palette to card');
                    }}
                    className="text-[11px] px-2 py-0.5 rounded bg-[#111417] text-white dark:bg-[#E2D9C8] dark:text-[#111417] font-semibold cursor-pointer"
                  >
                    Apply All
                  </button>
                </div>
                <div className="grid grid-cols-5 gap-1.5 pt-1">
                  {extractedPalette.swatches.map((color, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setBgColor(color)}
                      style={{ backgroundColor: color }}
                      className="h-8 rounded-lg border border-black/20 shadow-inner hover:scale-105 transition-transform cursor-pointer"
                      title={`Set as Background: ${color}`}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-[#707a8a]">
                  <span>Dominant: {extractedPalette.dominant}</span>
                  <span>Ink: {extractedPalette.ink}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: DETAILS */}
      {activeTab === 'decor' && (
        <div className="flex flex-col gap-5">
          {/* Card Padding Slider */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs">
              <span className={`font-semibold uppercase tracking-wider ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
                Card Inset Padding
              </span>
              <span className="font-mono text-[11px] text-[#707a8a]">{padding}px</span>
            </div>
            <input
              type="range"
              min="20"
              max="64"
              step="4"
              value={padding}
              onChange={(e) => setPadding(Number(e.target.value))}
              className="w-full accent-[#111417] dark:accent-[#E2D9C8] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#707a8a]">
              <span>Compact 20px</span>
              <span>Spacious 64px</span>
            </div>
          </div>

          {/* Corner Radius Slider */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs">
              <span className={`font-semibold uppercase tracking-wider ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
                Corner Radius
              </span>
              <span className="font-mono text-[11px] text-[#707a8a]">{borderRadius}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="32"
              step="2"
              value={borderRadius}
              onChange={(e) => setBorderRadius(Number(e.target.value))}
              className="w-full accent-[#111417] dark:accent-[#E2D9C8] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#707a8a]">
              <span>Sharp 0px</span>
              <span>Pill 32px</span>
            </div>
          </div>

          {/* Toggle Switches */}
          <div className={`pt-3 border-t flex flex-col gap-3 ${isLight ? 'border-[#e2e8f0]' : 'border-[#1f242c]'}`}>
            <span className="text-[11px] font-semibold text-[#707a8a] uppercase">Editorial Accents</span>

            {/* 55+ Procedural Surface Textures Catalog */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <label className={`text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
                  Surface Textures ({SURFACE_TEXTURES_55.length})
                </label>
                <span className="text-[10px] text-[#707a8a] font-mono capitalize">{textureCategory}</span>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px]">
                {SURFACE_TEXTURE_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setTextureCategory(cat.id)}
                    className={`px-2 py-1 rounded-md capitalize font-medium shrink-0 transition-colors cursor-pointer ${
                      textureCategory === cat.id
                        ? isLight
                          ? 'bg-[#111417] text-white'
                          : 'bg-[#E2D9C8] text-[#111417] font-semibold'
                        : isLight
                        ? 'bg-slate-100 text-slate-600 hover:text-slate-900'
                        : 'bg-black/30 text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Texture Cards (2-column layout) */}
              <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
                {SURFACE_TEXTURES_55
                  .filter((t) => textureCategory === 'all' || t.category === textureCategory)
                  .map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setSelectedTextureId(t.id);
                        setSurfaceFinish(t.id === 'none' ? 'none' : 'grain');
                      }}
                      className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                        selectedTextureId === t.id
                          ? isLight
                            ? 'border-[#111417] bg-[#f8fafc] text-[#0f172a] ring-1 ring-[#111417]'
                            : 'border-[#E2D9C8] bg-[#181d24] text-white ring-1 ring-[#E2D9C8]'
                          : isLight
                          ? 'border-[#e2e8f0] bg-white text-[#475569] hover:text-[#0f172a]'
                          : 'border-[#262c36] bg-[#14171d] text-[#9ca3af] hover:text-white'
                      }`}
                    >
                      <span className="text-xs font-semibold block truncate">{t.name}</span>
                      <span className="text-[9px] text-[#707a8a] truncate block">{t.description}</span>
                    </button>
                  ))}
              </div>

              {/* Texture Sliders & Controls */}
              {selectedTextureId !== 'none' && (
                <div className="flex flex-col gap-2.5 p-2.5 rounded-xl border border-current/10 bg-black/5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold uppercase tracking-wider text-[10px] text-[#707a8a]">
                      Texture Intensity
                    </span>
                    <span className="font-mono text-[11px] text-[#707a8a] tabular-nums">{textureIntensity}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={textureIntensity}
                    onChange={(e) => setTextureIntensity(Number(e.target.value))}
                    className="w-full accent-[#111417] dark:accent-[#E2D9C8] cursor-pointer"
                  />

                  <div className="flex justify-between items-center text-xs pt-1">
                    <span className="font-semibold uppercase tracking-wider text-[10px] text-[#707a8a]">
                      Pattern Scale
                    </span>
                    <span className="font-mono text-[11px] text-[#707a8a] tabular-nums">{textureScale}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="200"
                    step="10"
                    value={textureScale}
                    onChange={(e) => setTextureScale(Number(e.target.value))}
                    className="w-full accent-[#111417] dark:accent-[#E2D9C8] cursor-pointer"
                  />

                  {/* Blend Modes */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] font-semibold text-[#707a8a] uppercase">Blend Mode</span>
                    <div className="flex items-center gap-1">
                      {(['multiply', 'screen', 'overlay', 'soft-light'] as const).map((bm) => (
                        <button
                          key={bm}
                          type="button"
                          onClick={() => setTextureBlendMode(bm)}
                          className={`text-[9px] px-1.5 py-0.5 rounded font-mono uppercase cursor-pointer ${
                            textureBlendMode === bm
                              ? 'bg-[#111417] text-white dark:bg-[#E2D9C8] dark:text-[#111417] font-bold'
                              : 'bg-black/20 text-[#707a8a] hover:text-white'
                          }`}
                        >
                          {bm.replace('-light', '')}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Holographic Foil Toggle */}
            <label
              className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer ${
                isLight ? 'bg-[#f8fafc] border-[#e2e8f0]' : 'bg-[#181d24] border-[#262c36]'
              }`}
            >
              <div className="flex flex-col">
                <span className={`text-xs font-medium ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
                  Holographic Metallic Foil
                </span>
                <span className="text-[10px] text-[#707a8a]">Iridescent foil gradient on badges & glyphs</span>
              </div>
              <input
                type="checkbox"
                checked={isHolographic}
                onChange={(e) => setIsHolographic(e.target.checked)}
                className="accent-[#111417] dark:accent-[#E2D9C8] w-4 h-4 cursor-pointer"
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
                className="accent-[#111417] dark:accent-[#E2D9C8] w-4 h-4 cursor-pointer"
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
                className="accent-[#111417] dark:accent-[#E2D9C8] w-4 h-4 cursor-pointer"
              />
            </label>

            {/* 55+ Elements Catalog */}
            {showIcon && (
              <div className="flex flex-col gap-2 pt-1 border-t border-current/10">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#707a8a] uppercase">
                    Curated Elements ({ELEMENTS_55_CATALOG.length})
                  </span>
                  <span className="text-[10px] text-[#707a8a] font-mono capitalize">{elementCategory}</span>
                </div>

                {/* Element Category Pills */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px]">
                  {ELEMENT_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setElementCategory(cat.id)}
                      className={`px-2 py-0.5 rounded-md capitalize font-medium shrink-0 transition-colors cursor-pointer ${
                        elementCategory === cat.id
                          ? isLight
                            ? 'bg-[#111417] text-white'
                            : 'bg-[#E2D9C8] text-[#111417] font-semibold'
                          : isLight
                          ? 'bg-slate-100 text-slate-600 hover:text-slate-900'
                          : 'bg-black/30 text-slate-400 hover:text-white'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>

                {/* Elements Grid (4-column layout) */}
                <div className="grid grid-cols-4 gap-1.5 p-2 rounded-xl border max-h-40 overflow-y-auto bg-black/5">
                  {ELEMENTS_55_CATALOG
                    .filter((el) => elementCategory === 'all' || el.category === elementCategory)
                    .map((el) => (
                      <button
                        key={el.id}
                        type="button"
                        onClick={() => {
                          setSelectedElementId(el.id);
                          setIconName(el.id);
                        }}
                        title={el.name}
                        className={`p-1.5 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all aspect-square ${
                          selectedElementId === el.id
                            ? isLight
                              ? 'bg-[#111417] text-white ring-2 ring-[#111417]'
                              : 'bg-[#E2D9C8] text-[#111417] ring-2 ring-[#E2D9C8]'
                            : isLight
                            ? 'bg-white hover:bg-slate-100 text-slate-800'
                            : 'bg-[#181d24] hover:bg-[#222730] text-slate-300'
                        }`}
                      >
                        <span className="text-base select-none leading-none">
                          {el.glyph || '✦'}
                        </span>
                        <span className="text-[8px] truncate max-w-full block mt-0.5 opacity-70">
                          {el.name.split(' ')[0]}
                        </span>
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div
      className="w-full pt-13 sm:pt-16 min-h-screen flex flex-col transition-colors duration-200 bg-[var(--app-bg)] text-[var(--app-text)]"
      onClick={() => {
        // Deselect when clicking empty background
        setAspectMenuOpen(false);
        setExportMenuOpen(false);
      }}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl studio-panel shadow-2xl animate-fade-in text-xs font-medium text-[var(--app-text)]">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 cursor-pointer text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition-colors"
          >
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

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* PRIMARY STUDIO TOOLBAR (Compact, Responsive, No Collisions)         */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div
        className="w-full border-b border-[var(--app-border-subtle)] px-3 sm:px-6 py-2 flex items-center justify-between gap-2 sticky top-13 sm:top-16 z-40 backdrop-blur-md transition-colors duration-200 bg-[var(--app-bg)]/95 text-[var(--app-text)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left: Back, Studio Switch, Title, Undo / Redo */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <a
            href="/templates"
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-[var(--app-border-subtle)] bg-[var(--app-surface)] text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-secondary)] text-xs font-medium transition-colors cursor-pointer shrink-0"
            title="Back to Template Gallery"
            aria-label="Back to templates"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Styles</span>
          </a>

          <a
            href="/canvas"
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-[var(--app-border-subtle)] bg-[var(--app-surface)] text-[var(--app-text)] hover:bg-[var(--app-surface-secondary)] text-xs font-semibold transition-colors cursor-pointer shrink-0"
            title="Switch to Freeform Canvas Studio"
            aria-label="Switch to Canvas Studio"
          >
            <Layers className="w-3.5 h-3.5 text-[var(--app-accent)]" />
            <span className="hidden md:inline">Canvas Studio</span>
          </a>

          <div
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border min-w-0 ${
              isLight ? 'bg-[#f8fafc] border-[#e2e8f0]' : 'bg-[#181d24] border-[#262c36]'
            }`}
          >
            <FileText className={`w-3.5 h-3.5 shrink-0 ${isLight ? 'text-[#94a3b8]' : 'text-[#707a8a]'}`} />
            <input
              type="text"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              className={`bg-transparent text-xs font-semibold focus:outline-none w-20 sm:w-36 md:w-48 truncate border-none p-0 ${
                isLight ? 'text-[#0f172a]' : 'text-white'
              }`}
              title="Click to rename card"
              aria-label="Document Title"
            />
          </div>

          {/* Undo / Redo */}
          <div className="flex items-center gap-0.5 sm:gap-1">
            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg border transition-all ${
                historyIndex <= 0
                  ? 'opacity-30 cursor-not-allowed border-transparent'
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
              className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg border transition-all ${
                historyIndex >= history.length - 1
                  ? 'opacity-30 cursor-not-allowed border-transparent'
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

          {/* Desktop-only Reset button */}
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

        {/* Center / Desktop controls: Aspect ratio & Zoom */}
        <div className="hidden lg:flex items-center gap-2">
          {/* Preset Styles Switcher */}
          <button
            onClick={() => setTemplateDrawerOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
              isLight
                ? 'bg-white border-[#e2e8f0] text-[#0f172a] hover:bg-[#f8fafc]'
                : 'bg-[#181d24] border-[#262c36] text-white hover:border-[#444748]'
            }`}
            title="Switch template style"
          >
            <LayoutTemplate className={`w-3.5 h-3.5 ${isLight ? 'text-[#111417]' : 'text-[#E2D9C8]'}`} />
            <span>Presets</span>
          </button>

          {/* Desktop Aspect Ratio Dropdown */}
          <div className="relative">
            <button
              onClick={() => setAspectMenuOpen(!aspectMenuOpen)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                isLight
                  ? 'bg-white border-[#e2e8f0] text-[#0f172a] hover:border-[#cbd5e1]'
                  : 'bg-[#181d24] border-[#262c36] text-white hover:border-[#444748]'
              }`}
            >
              <Crop className={`w-3.5 h-3.5 ${isLight ? 'text-[#111417]' : 'text-[#E2D9C8]'}`} />
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
            className={`flex items-center border rounded-lg px-2 py-1 gap-1 ${
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
            className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-colors cursor-pointer ${
              showGuidelines
                ? isLight
                  ? 'bg-[#111417] text-white border-[#111417]'
                  : 'bg-[#E2D9C8] text-[#111417] border-[#E2D9C8]'
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

        {/* Right: Presets (mobile/tablet), More Options, Export */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setTemplateDrawerOpen(true)}
            className={`lg:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
              isLight
                ? 'bg-white border-[#e2e8f0] text-[#0f172a] hover:bg-[#f8fafc]'
                : 'bg-[#181d24] border-[#262c36] text-white hover:border-[#444748]'
            }`}
            title="Switch template style"
          >
            <LayoutTemplate className={`w-3.5 h-3.5 ${isLight ? 'text-[#111417]' : 'text-[#E2D9C8]'}`} />
            <span className="hidden xs:inline text-[11px]">Styles</span>
          </button>

          {/* Mobile Options Drawer Button */}
          <button
            onClick={() => setMobileOptionsOpen(true)}
            className={`sm:hidden w-8 h-8 flex items-center justify-center rounded-lg border transition-colors cursor-pointer ${
              isLight
                ? 'bg-white border-[#e2e8f0] text-[#475569] hover:text-[#0f172a]'
                : 'bg-[#181d24] border-[#262c36] text-[#c4c7c8] hover:text-white'
            }`}
            title="More Options"
            aria-label="More canvas options"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {/* Share Style Link Button */}
          <button
            type="button"
            onClick={handleShareStyleLink}
            className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
              isLight
                ? 'bg-white border-[#e2e8f0] text-[#0f172a] hover:bg-[#f8fafc]'
                : 'bg-[#181d24] border-[#262c36] text-white hover:bg-[#222730]'
            }`}
            title="Share customized card URL with friends"
          >
            <Share2 className={`w-3.5 h-3.5 ${isLight ? 'text-[#111417]' : 'text-[#E2D9C8]'}`} />
            <span>Share Link</span>
          </button>

          {/* Desktop Copy Button */}
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
              <Copy className={`w-3.5 h-3.5 ${isLight ? 'text-[#111417]' : 'text-[#E2D9C8]'}`} />
            )}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          {/* Export Dropdown (Always accessible, never squashed) */}
          <div className="relative">
            <button
              onClick={() => setExportMenuOpen(!exportMenuOpen)}
              disabled={isExporting}
              className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-[0.98] cursor-pointer shadow-md disabled:opacity-50 shrink-0 ${
                isLight
                  ? 'bg-[#0f172a] text-white hover:bg-[#1e293b]'
                  : 'bg-white text-[#0b0e11] hover:bg-[#e2e2e2]'
              }`}
              aria-label="Export Card"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Exporting...' : 'Export'}</span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>

            {exportMenuOpen && (
              <div
                className={`absolute right-0 mt-1 w-56 rounded-xl border shadow-2xl py-1.5 z-50 ${
                  isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#1d2023] border-[#262c36]'
                }`}
              >
                {/* Presentation Backdrop Toggle */}
                <div className="px-3 py-1.5 border-b border-current/10 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[10px] uppercase font-semibold text-[#707a8a] tracking-wider">
                    <span>Backdrop Frame</span>
                    <button
                      type="button"
                      onClick={() => setBackdropRatio(backdropRatio === '4:5' ? '1:1' : '4:5')}
                      className="text-[9px] font-mono px-1 rounded border border-current/20 cursor-pointer"
                    >
                      {backdropRatio}
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {[
                      { id: 'none' as BackdropSurface, label: 'Card' },
                      { id: 'obsidian' as BackdropSurface, label: 'Obsidian' },
                      { id: 'linen' as BackdropSurface, label: 'Linen' },
                      { id: 'mesh' as BackdropSurface, label: 'Mesh' },
                    ].map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setBackdropSurface(b.id)}
                        className={`py-1 text-[10px] rounded border text-center transition-all cursor-pointer ${
                          backdropSurface === b.id
                            ? isLight
                              ? 'bg-[#111417] text-white font-bold border-[#111417]'
                              : 'bg-[#E2D9C8] text-[#111417] font-bold border-[#E2D9C8]'
                            : isLight
                            ? 'bg-slate-100 text-slate-700 border-slate-200'
                            : 'bg-black/30 text-slate-300 border-white/10'
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>

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
                    <span className="font-medium block">SVG Vector File</span>
                    <span className="text-[10px] text-[#707a8a]">Scalable vector format</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#707a8a]">SVG</span>
                </button>

                <div className="px-3 py-1 text-[10px] uppercase font-semibold text-[#111417] dark:text-[#E2D9C8] tracking-wider border-t border-current/10 mt-1">
                  Ultra-HD Master Exporters
                </div>
                <button
                  onClick={() => handleExport('ultra-4k')}
                  className={`w-full px-3 py-2 text-left flex items-center justify-between text-xs cursor-pointer ${
                    isLight ? 'text-[#0f172a] hover:bg-[#f1f5f9]' : 'text-white hover:bg-[#222730]'
                  }`}
                >
                  <div>
                    <span className="font-semibold block">Ultra-HD 4K (3840px)</span>
                    <span className="text-[10px] text-[#707a8a]">Pure card isolation, zero gradient bleed</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#111417] dark:text-[#E2D9C8] font-bold">4K</span>
                </button>
                <button
                  onClick={() => handleExport('ultra-8k')}
                  className={`w-full px-3 py-2 text-left flex items-center justify-between text-xs cursor-pointer ${
                    isLight ? 'text-[#0f172a] hover:bg-[#f1f5f9]' : 'text-white hover:bg-[#222730]'
                  }`}
                >
                  <div>
                    <span className="font-semibold block">Print Master 8K (7680px)</span>
                    <span className="text-[10px] text-[#707a8a]">Gallery & offset print archival fidelity</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#111417] dark:text-[#E2D9C8] font-bold">8K</span>
                </button>
                <button
                  onClick={() => handleExport('ultra-16k')}
                  className={`w-full px-3 py-2 text-left flex items-center justify-between text-xs cursor-pointer ${
                    isLight ? 'text-[#0f172a] hover:bg-[#f1f5f9]' : 'text-white hover:bg-[#222730]'
                  }`}
                >
                  <div>
                    <span className="font-semibold block">Studio Extreme 16K (15360px)</span>
                    <span className="text-[10px] text-[#707a8a]">GPU-accelerated max canvas print</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#0ecb81] font-bold">16K</span>
                </button>
                <div className={`px-3 py-1.5 text-[10px] font-bold tracking-wider uppercase border-t ${
                  isLight ? 'text-[#64748b] bg-[#f8fafc] border-[#e2e8f0]' : 'text-[#707a8a] bg-[#14171d] border-[#262c36]'
                }`}>
                  3D Transparent PNG
                </div>
                <button
                  onClick={() => handleExport('3d-4k')}
                  className={`w-full px-3 py-2 text-left flex items-center justify-between text-xs cursor-pointer ${
                    isLight ? 'text-[#0f172a] hover:bg-[#f1f5f9]' : 'text-white hover:bg-[#222730]'
                  }`}
                >
                  <div>
                    <span className="font-semibold block">🧊 3D Card (4K Transparent)</span>
                    <span className="text-[10px] text-[#707a8a]">PBR surface tilt on 100% alpha</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#0ecb81] font-bold">4K</span>
                </button>
                <button
                  onClick={() => handleExport('3d-8k')}
                  className={`w-full px-3 py-2 text-left flex items-center justify-between text-xs cursor-pointer ${
                    isLight ? 'text-[#0f172a] hover:bg-[#f1f5f9]' : 'text-white hover:bg-[#222730]'
                  }`}
                >
                  <div>
                    <span className="font-semibold block">🧊 3D Card (8K Transparent)</span>
                    <span className="text-[10px] text-[#707a8a]">Archival 7680px PBR alpha render</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#0ecb81] font-bold">8K</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* MOBILE SECONDARY SUB-BAR (Direct Aspect Ratio Chips & Quick Actions) */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div
        className={`lg:hidden w-full border-b px-3 py-1.5 flex items-center justify-between gap-1.5 sticky top-[89px] sm:top-[104px] z-30 backdrop-blur-md overflow-x-auto no-scrollbar transition-colors ${
          isLight ? 'bg-white/90 border-[#e2e8f0]' : 'bg-[#111417]/90 border-[#262c36]'
        }`}
      >
        {/* Aspect Ratio Chips */}
        <div className="flex items-center gap-1 shrink-0">
          {ASPECT_RATIOS.map((r) => (
            <button
              key={r.id}
              onClick={() => {
                setAspectRatio(r.id);
                showToast(`Aspect ratio set to ${r.label}`);
              }}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer shrink-0 ${
                aspectRatio === r.id
                  ? isLight
                    ? 'bg-[#111417] text-white font-semibold'
                    : 'bg-[#E2D9C8] text-[#111417] font-semibold shadow-sm'
                  : isLight
                  ? 'bg-[#f1f5f9] text-[#475569] hover:text-[#0f172a]'
                  : 'bg-[#181d24] text-[#a0a5ad] hover:text-white'
              }`}
            >
              {r.id === '1:1' && '1:1 Square'}
              {r.id === '4:5' && '4:5 Portrait'}
              {r.id === '9:16' && '9:16 Story'}
              {r.id === '16:9' && '16:9 Landscape'}
            </button>
          ))}
        </div>

        {/* Secondary quick triggers */}
        <div className="flex items-center gap-1 shrink-0">
          {isLongText && (
            <button
              onClick={handleAutoFitFontSize}
              className={`px-2 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 cursor-pointer ${
                isLight ? 'bg-[#f1f5f9] text-[#111417]' : 'bg-[#E2D9C8]/15 text-[#E2D9C8]'
              }`}
              title="Auto-fit font size"
            >
              <Wand2 className="w-3 h-3" />
              <span>Fit</span>
            </button>
          )}

          {/* Ambient Lighting Toggle */}
          <button
            onClick={() => setAmbientModeEnabled(!ambientModeEnabled)}
            className={`px-2 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors ${
              ambientModeEnabled
                ? isLight
                  ? 'bg-[#111417]/10 text-[#111417]'
                  : 'bg-[#E2D9C8]/15 text-[#E2D9C8]'
                : 'text-[#707a8a] hover:text-white'
            }`}
            title="Toggle real-time workspace ambient backglow (isolated to stage wrapper, never exported)"
          >
            <Sun className="w-3 h-3" />
            <span className="hidden sm:inline">Ambient</span>
          </button>

          {/* 3D View Toggle */}
          <button
            onClick={() => setIs3DMode(!is3DMode)}
            className={`px-2 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors ${
              is3DMode
                ? isLight
                  ? 'bg-[#111417] text-white font-semibold'
                  : 'bg-[#E2D9C8] text-[#111417] font-semibold'
                : isLight
                ? 'bg-[#f1f5f9] text-[#475569] hover:text-[#0f172a]'
                : 'bg-[#181d24] text-[#a0a5ad] hover:text-white'
            }`}
            title="Toggle Three.js 3D Physical Card Stage with dynamic reflections"
          >
            <Box className="w-3 h-3" />
            <span>3D View</span>
          </button>

          {/* Safe Zones Overlay Toggle */}
          <button
            onClick={() => {
              const modes: ('none' | 'print' | 'reels' | 'feed')[] = ['none', 'print', 'reels', 'feed'];
              const next = modes[(modes.indexOf(safeZoneMode) + 1) % modes.length];
              setSafeZoneMode(next);
              showToast(`Safe zone overlay: ${next.toUpperCase()}`);
            }}
            className={`px-2 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors ${
              safeZoneMode !== 'none'
                ? 'bg-[#0ecb81]/15 text-[#0ecb81] font-semibold'
                : 'text-[#707a8a] hover:text-white'
            }`}
            title="Cycle Safe-Zone Overlays (Print 3mm, 9:16 Reels, 4:5 Feed)"
          >
            <Maximize2 className="w-3 h-3" />
            <span className="capitalize">{safeZoneMode === 'none' ? 'Safe Zone' : safeZoneMode}</span>
          </button>

          <button
            onClick={() => setShowGuidelines(!showGuidelines)}
            className={`w-7 h-7 flex items-center justify-center rounded-md border text-xs cursor-pointer ${
              showGuidelines
                ? isLight ? 'bg-[#111417] text-white border-[#111417]' : 'bg-[#E2D9C8] text-[#111417] border-[#E2D9C8]'
                : isLight ? 'border-[#e2e8f0] text-[#707a8a]' : 'border-[#262c36] text-[#707a8a]'
            }`}
            title="Toggle print guidelines"
            aria-label="Toggle print guidelines"
          >
            <Grid className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* WORKSPACE: CANVAS + EDITING PALETTE */}
      <div className="flex-1 flex flex-col lg:flex-row w-full overflow-hidden">
        {/* DESKTOP SIDEBAR (Hidden on mobile < lg) */}
        <div
          className={`hidden lg:flex w-96 border-r flex-col h-[calc(100vh-104px)] overflow-y-auto transition-colors duration-200 shrink-0 ${
            isLight
              ? 'bg-[#ffffff] border-[#e2e8f0] text-[#0f172a]'
              : 'bg-[#111417] border-[#262c36] text-[#e1e2e7]'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {renderControlTabs(false)}
          {renderControlPanelContent(false)}
        </div>

        {/* CENTER / MAIN WORKSPACE CANVAS */}
        <div
          ref={stageRef}
          className={`flex-1 p-3 sm:p-6 md:p-12 flex flex-col items-center justify-center overflow-auto min-h-[300px] sm:min-h-[460px] pb-24 lg:pb-12 transition-colors duration-200 editor-ambient-stage ${
            isLight ? 'bg-[#f8fafc]' : 'bg-[#101114]'
          }`}
          onClick={(e) => {
            // Click on the empty workspace background to deselect
            if (e.target === e.currentTarget) {
              setSelectedElement(null);
            }
          }}
        >
          {/* Active Selection Breadcrumb / Quick Control Strip */}
          {selectedElement && !is3DMode && (
            <div
              className={`mb-3 flex items-center gap-2 px-3 py-1 rounded-full text-xs border shadow-sm animate-fade-in ${
                isLight ? 'bg-white border-[#e2e8f0] text-[#0f172a]' : 'bg-[#181d24] border-[#262c36] text-white'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#E2D9C8]"></span>
              <span>
                Selected: <strong className="capitalize">{selectedElement}</strong>
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedElement(null);
                }}
                className={`ml-1 cursor-pointer ${
                  isLight ? 'text-[#64748b] hover:text-[#0f172a]' : 'text-[#707a8a] hover:text-white'
                }`}
                title="Deselect element"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {is3DMode ? (
            /* 3D Physical Three.js Preview Stage */
            <div className="flex flex-col items-center gap-3">
              <div
                ref={threeMountRef}
                className="w-[340px] sm:w-[440px] md:w-[500px] h-[440px] sm:h-[500px] rounded-2xl flex items-center justify-center cursor-grab active:cursor-grabbing"
              />
              <span className="text-[11px] font-mono text-[#707a8a]">
                Drag to rotate card in 3D space • PBR surface reflections active
              </span>
            </div>
          ) : (
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
                  if (window.innerWidth < 1024) {
                    openMobileTab('palette');
                  }
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
                } ${selectedElement === 'card' ? 'ring-2 ring-[#E2D9C8]/80 ring-offset-2' : ''}`}
              >
                {/* Procedural Surface Texture Overlay (55+ Textures) */}
                {selectedTextureId !== 'none' && (
                  <div
                    style={getTextureStyle(selectedTextureId, textureIntensity, textureScale, textureBlendMode)}
                    className="absolute inset-0 pointer-events-none z-20"
                    aria-hidden="true"
                  />
                )}

                {/* Safe Guidelines Overlay */}
                {showGuidelines && (
                  <div
                    className="absolute inset-4 border border-dashed border-[#E2D9C8]/60 pointer-events-none z-30 flex items-center justify-center"
                    aria-hidden="true"
                  >
                    <span className="text-[10px] font-mono bg-[#E2D9C8] text-[#111417] px-1.5 py-0.5 rounded font-bold">
                      SAFE PRINT AREA
                    </span>
                  </div>
                )}

                {/* Social Safe Zones Overlay (Visual only, not exported) */}
                {safeZoneMode === 'print' && (
                  <div className="absolute inset-3 border-2 border-dashed border-[#0ecb81]/70 pointer-events-none z-30 flex items-center justify-center">
                    <span className="text-[9px] font-mono bg-[#0ecb81] text-black px-1.5 py-0.5 rounded font-bold">
                      3MM PRINT SAFE ZONE
                    </span>
                  </div>
                )}
                {safeZoneMode === 'reels' && (
                  <div className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-between">
                    <div className="h-[18%] bg-red-500/15 border-b border-red-500/40 flex items-center justify-center">
                      <span className="text-[9px] font-mono text-red-300 font-bold bg-black/60 px-1 rounded">
                        REELS TOP HUD (220PX)
                      </span>
                    </div>
                    <div className="h-[25%] bg-red-500/15 border-t border-red-500/40 flex items-center justify-center">
                      <span className="text-[9px] font-mono text-red-300 font-bold bg-black/60 px-1 rounded">
                        REELS CAPTION DANGER ZONE (340PX)
                      </span>
                    </div>
                  </div>
                )}
                {safeZoneMode === 'feed' && (
                  <div className="absolute inset-4 border border-dashed border-[#3b82f6]/70 pointer-events-none z-30 flex items-center justify-center">
                    <span className="text-[9px] font-mono bg-[#3b82f6] text-white px-1.5 py-0.5 rounded font-bold">
                      4:5 FEED SAFE CROPLINE
                    </span>
                  </div>
                )}

                {/* Header / Folio Ribbon */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedElement('tag');
                    openMobileTab('content');
                    tagInputRef.current?.focus();
                  }}
                  className={`relative z-10 flex items-center justify-between pb-3.5 border-b border-current/15 text-[11px] font-mono tracking-wider opacity-75 cursor-pointer rounded transition-all shrink-0 ${
                    selectedElement === 'tag' ? 'ring-1 ring-[#E2D9C8] bg-black/5 p-1' : ''
                  }`}
                  title="Click to edit folio header tag"
                >
                  <div className="flex items-center gap-1.5 min-w-0 max-w-[75%]">
                    {renderCardHeaderIcon()}
                    <span className="uppercase font-semibold truncate tracking-wider">{tag}</span>
                  </div>
                  {badge && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedElement('badge');
                        openMobileTab('content');
                      }}
                      className={`px-1.5 py-0.5 rounded text-[10px] shrink-0 whitespace-nowrap cursor-pointer ${
                        isHolographic
                          ? 'holographic-foil shadow-sm border border-transparent font-bold'
                          : 'border border-current/25 font-mono'
                      } ${selectedElement === 'badge' ? 'ring-1 ring-[#E2D9C8] bg-black/10' : ''}`}
                      title="Click to edit corner badge"
                    >
                      {badge}
                    </span>
                  )}
                </div>

                {/* Main Body Quote / Prose with Auto-Fit Safe Bounding Box Solver (Bug 7) */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedElement('quote');
                    openMobileTab('content');
                    quoteInputRef.current?.focus();
                  }}
                  className={`relative z-10 py-4 cursor-pointer rounded transition-all min-h-0 overflow-hidden ${
                    verticalAlign === 'top' ? 'my-0 mb-auto' : verticalAlign === 'bottom' ? 'my-0 mt-auto' : 'my-auto'
                  } ${selectedElement === 'quote' ? 'ring-1 ring-[#E2D9C8] bg-black/5 p-2' : ''}`}
                  title="Click to edit quote text and typography"
                >
                  <blockquote
                    style={{
                      fontSize: `${(() => {
                        const textLen = (quote || '').length;
                        if (textLen === 0) return fontSize;
                        let maxSafe = aspectRatio === '9:16' ? 240 : aspectRatio === '4:5' ? 180 : aspectRatio === '16:9' ? 110 : 140;
                        const sizeRatio = fontSize / 24;
                        const cap = maxSafe / Math.max(0.6, sizeRatio * 1.2);
                        if (textLen > cap) {
                          const scale = Math.min(0.7, Math.sqrt(cap / textLen));
                          return Math.max(13, Math.round(fontSize * scale));
                        }
                        return fontSize;
                      })()}px`,
                      textAlign: align,
                      lineHeight: lineHeight,
                      letterSpacing: `${letterSpacing}em`,
                      fontFamily: fontChoice.startsWith('custom-') ? fontChoice : undefined,
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word',
                    }}
                    className={`${getFontFamilyClass(fontChoice)} transition-all`}
                  >
                    “{parseRichText(quote, '#E2D9C8')}”
                  </blockquote>
                </div>

                {/* Footer Citation & Signature (shrink-0 to prevent clipping) */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedElement('author');
                    openMobileTab('content');
                    authorInputRef.current?.focus();
                  }}
                  className={`relative z-10 pt-3.5 border-t border-current/15 flex items-center justify-between cursor-pointer rounded transition-all shrink-0 ${
                    selectedElement === 'author' ? 'ring-1 ring-[#E2D9C8] bg-black/5 p-1' : ''
                  }`}
                  title="Click to edit author and citation"
                >
                  <cite className="not-italic text-xs font-medium opacity-80 truncate max-w-[90%]">
                    — {author}
                  </cite>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MOBILE BOTTOM DOCKED CATEGORY STRIP (Docked cleanly at bottom on mobile) */}
      <div
        className={`lg:hidden fixed bottom-0 left-0 right-0 z-30 border-t backdrop-blur-xl px-2 py-1.5 pb-[env(safe-area-inset-bottom,4px)] transition-colors shadow-2xl ${
          isLight ? 'bg-white/98 border-[#e2e8f0]' : 'bg-[#111417]/98 border-[#262c36]'
        }`}
      >
        <div className="grid grid-cols-4 gap-1 max-w-md mx-auto">
          <button
            onClick={() => openMobileTab('content')}
            className={`py-2 px-1 rounded-xl flex flex-col items-center gap-1 text-[11px] font-semibold transition-all cursor-pointer ${
              mobileSheetOpen && activeTab === 'content'
                ? isLight
                  ? 'bg-[#111417] text-white shadow-sm'
                  : 'bg-[#E2D9C8] text-[#111417] shadow-sm'
                : isLight
                ? 'text-[#475569] hover:bg-[#f1f5f9]'
                : 'text-[#c4c7c8] hover:bg-[#181d24]'
            }`}
          >
            <Type className="w-4 h-4" />
            <span>Words</span>
          </button>
          <button
            onClick={() => openMobileTab('type')}
            className={`py-2 px-1 rounded-xl flex flex-col items-center gap-1 text-[11px] font-semibold transition-all cursor-pointer ${
              mobileSheetOpen && activeTab === 'type'
                ? isLight
                  ? 'bg-[#111417] text-white shadow-sm'
                  : 'bg-[#E2D9C8] text-[#111417] shadow-sm'
                : isLight
                ? 'text-[#475569] hover:bg-[#f1f5f9]'
                : 'text-[#c4c7c8] hover:bg-[#181d24]'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Type</span>
          </button>
          <button
            onClick={() => openMobileTab('palette')}
            className={`py-2 px-1 rounded-xl flex flex-col items-center gap-1 text-[11px] font-semibold transition-all cursor-pointer ${
              mobileSheetOpen && activeTab === 'palette'
                ? isLight
                  ? 'bg-[#111417] text-white shadow-sm'
                  : 'bg-[#E2D9C8] text-[#111417] shadow-sm'
                : isLight
                ? 'text-[#475569] hover:bg-[#f1f5f9]'
                : 'text-[#c4c7c8] hover:bg-[#181d24]'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Palette</span>
          </button>
          <button
            onClick={() => openMobileTab('decor')}
            className={`py-2 px-1 rounded-xl flex flex-col items-center gap-1 text-[11px] font-semibold transition-all cursor-pointer ${
              mobileSheetOpen && activeTab === 'decor'
                ? isLight
                  ? 'bg-[#111417] text-white shadow-sm'
                  : 'bg-[#E2D9C8] text-[#111417] shadow-sm'
                : isLight
                ? 'text-[#475569] hover:bg-[#f1f5f9]'
                : 'text-[#c4c7c8] hover:bg-[#181d24]'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Details</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* MOBILE EDITING BOTTOM SHEET                                         */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {mobileSheetOpen && (
        <>
          {/* Backdrop */}
          <div
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in"
            onClick={() => setMobileSheetOpen(false)}
            aria-hidden="true"
          />
          {/* Slide-Up Sheet */}
          <div
            className={`lg:hidden fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border-t shadow-2xl flex flex-col max-h-[75vh] animate-slide-up transition-colors ${
              isLight ? 'bg-white border-[#e2e8f0] text-[#0f172a]' : 'bg-[#111417] border-[#262c36] text-[#e1e2e7]'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Handle & Header */}
            <div className={`p-3 border-b flex items-center justify-between shrink-0 ${isLight ? 'border-[#e2e8f0]' : 'border-[#262c36]'}`}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-1 bg-[#475569] rounded-full mr-1" />
                <h3 className="text-xs font-bold uppercase tracking-wider">
                  {activeTab === 'content' && 'Words / Text Content'}
                  {activeTab === 'type' && 'Typography & Layout'}
                  {activeTab === 'palette' && 'Color & Theme Palette'}
                  {activeTab === 'decor' && 'Canvas & Details'}
                </h3>
              </div>
              <button
                onClick={() => setMobileSheetOpen(false)}
                className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 cursor-pointer ${
                  isLight
                    ? 'bg-[#f1f5f9] border-[#e2e8f0] text-[#0f172a] hover:bg-[#e2e8f0]'
                    : 'bg-[#181d24] border-[#262c36] text-white hover:bg-[#222730]'
                }`}
                aria-label="Close editing sheet"
              >
                <X className="w-4 h-4" />
                <span className="text-[11px]">Done</span>
              </button>
            </div>

            {/* Internal Tabs Switcher */}
            {renderControlTabs(true)}

            {/* Sheet Scrollable Body */}
            <div className="overflow-y-auto overscroll-contain flex-1 pb-10">
              {renderControlPanelContent(true)}
            </div>
          </div>
        </>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* MOBILE CANVAS OPTIONS DRAWER                                        */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {mobileOptionsOpen && (
        <>
          <div
            className="sm:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in"
            onClick={() => setMobileOptionsOpen(false)}
            aria-hidden="true"
          />
          <div
            className={`sm:hidden fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border-t shadow-2xl p-5 flex flex-col gap-4 animate-slide-up transition-colors ${
              isLight ? 'bg-white border-[#e2e8f0] text-[#0f172a]' : 'bg-[#14171d] border-[#262c36] text-[#e1e2e7]'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-current/10">
              <h4 className="text-xs font-bold uppercase tracking-wider">Canvas Options</h4>
              <button
                onClick={() => setMobileOptionsOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10"
                aria-label="Close options"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-2.5 text-xs font-medium">
              {/* Guidelines Toggle */}
              <button
                onClick={() => setShowGuidelines(!showGuidelines)}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer ${
                  showGuidelines
                    ? isLight ? 'bg-[#f8fafc] border-[#111417] text-[#111417]' : 'bg-[#1f242c] border-[#E2D9C8] text-[#E2D9C8]'
                    : isLight ? 'bg-[#f8fafc] border-[#e2e8f0]' : 'bg-[#181d24] border-[#262c36]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Grid className="w-4 h-4" />
                  <span>Alignment Guidelines</span>
                </div>
                <span className="text-[10px] uppercase font-bold">{showGuidelines ? 'ON' : 'OFF'}</span>
              </button>

              {/* Copy Image 2x */}
              <button
                onClick={() => {
                  handleCopyImage();
                  setMobileOptionsOpen(false);
                }}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer ${
                  isLight ? 'bg-[#f8fafc] border-[#e2e8f0]' : 'bg-[#181d24] border-[#262c36]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Copy className="w-4 h-4" />
                  <span>Copy 2× Retina Image</span>
                </div>
                <span className="text-[10px] text-[#0ecb81] font-bold">2×</span>
              </button>

              {/* Zoom Controls */}
              <div
                className={`p-3 rounded-xl border flex items-center justify-between ${
                  isLight ? 'bg-[#f8fafc] border-[#e2e8f0]' : 'bg-[#181d24] border-[#262c36]'
                }`}
              >
                <span className="text-xs">Workspace Zoom</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(50, z - 10))}
                    className="p-1.5 rounded-lg border bg-current/5"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono text-xs w-10 text-center">{zoomLevel}%</span>
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(140, z + 10))}
                    className="p-1.5 rounded-lg border bg-current/5"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Reset */}
              <button
                onClick={() => {
                  handleReset();
                  setMobileOptionsOpen(false);
                }}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer ${
                  isLight ? 'bg-[#f8fafc] border-[#e2e8f0]' : 'bg-[#181d24] border-[#262c36]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset Card Defaults</span>
                </div>
              </button>

              {/* Clear Draft */}
              <button
                onClick={() => {
                  handleClearDraft();
                  setMobileOptionsOpen(false);
                }}
                className="p-3 rounded-xl border border-red-500/20 text-red-400 bg-red-500/5 flex items-center justify-between cursor-pointer"
              >
                <span>Clear Local Draft</span>
                <span className="text-[10px]">Delete</span>
              </button>
            </div>
          </div>
        </>
      )}

{/* Book & Music Metadata Auto-Fill Modal */}
      <MediaImportModal
        isOpen={mediaModalOpen}
        onClose={() => setMediaModalOpen(false)}
        onSelect={handleMediaSelect}
      />

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
                <LayoutTemplate className={`w-4 h-4 ${isLight ? 'text-[#111417]' : 'text-[#E2D9C8]'}`} />
                <h3 className={`text-sm font-semibold ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
                  Choose Preset Art Direction
                </h3>
              </div>
              <button
                onClick={() => setTemplateDrawerOpen(false)}
                className={`cursor-pointer ${
                  isLight ? 'text-[#64748b] hover:text-[#0f172a]' : 'text-[#707a8a] hover:text-white'
                }`}
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
                  className="accent-[#111417] dark:accent-[#E2D9C8] w-4 h-4 cursor-pointer"
                />
                <span className={isLight ? 'text-[#334155]' : 'text-[#c4c7c8]'}>
                  Preserve my current quote and author text (recommended)
                </span>
              </label>
              <span className="text-[11px] text-[#707a8a]">{PRESET_TEMPLATES.length} Styles</span>
            </div>

            {/* Template Selection Grid */}
            <div className="p-4 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
