import React, { useState, useEffect, useRef } from 'react';
import type { CardTemplate } from '../types/card';
import { updatePageSEO } from '../utils/seo';
import { toPng } from 'html-to-image';
import {
  ArrowLeft,
  Copy,
  Check,
  Download,
  Box,
  Shuffle,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Upload,
  Crop,
  Sun,
  Moon,
  ChevronDown,
  Type,
  Palette,
  Sparkles,
  Pipette,
} from 'lucide-react';
import { ASSET_AVATARS } from '../data/canvasAssets';
import { createThreeCardPreviewScene, type ThreeCardPreviewController } from '../engines/threeCardStage';
import { ThreeDPreviewControls } from '../components/ThreeDPreviewControls';
import {
  buildSafeFontEmbedCSS,
  getBrandedExportFilename,
  triggerBrandedBlobDownload,
} from '../engines/brandedExportAndThreePng';
import {
  loadAllFontsFromIndexedDB,
  registerAndSaveCustomFont,
  type StoredCustomFont,
} from '../services/customFontManager';
import { MyFontsModal } from '../components/MyFontsModal';
import { pickColorWithEyedropper, extractPaletteFromImage } from '../utils/colorExtractor';
import { validateAndSanitizeImageFile, dataUrlToBlob } from '../services/imageSecurity';

export interface CreatorViewProps {
  initialTemplate?: CardTemplate;
  theme?: 'dark' | 'light';
  onNavigateHome?: () => void;
  onToggleTheme?: () => void;
}

interface PaletteOption {
  id: string;
  name: string;
  bg: string;
  ink: string;
  badge: string;
  surface: string;
}

const PALETTES: PaletteOption[] = [
  {
    id: 'archival-linen',
    name: 'Archival Linen',
    bg: '#fbf9f4',
    ink: '#1c1b18',
    badge: 'ARCHIVAL',
    surface: 'woven-canvas-linen',
  },
  {
    id: 'field-linen',
    name: 'Field Linen',
    bg: '#f4ede4',
    ink: '#1c1b18',
    badge: 'FIELD',
    surface: 'woven-canvas-linen',
  },
  {
    id: 'terracotta-orange',
    name: 'Terracotta',
    bg: '#d44727',
    ink: '#ffffff',
    badge: 'DESIGN',
    surface: 'warm-nano-texture-matte',
  },
  {
    id: 'obsidian',
    name: 'Obsidian Dark',
    bg: '#18191c',
    ink: '#f5f5f7',
    badge: 'MIDNIGHT',
    surface: 'warm-nano-texture-matte',
  },
  {
    id: 'slate-archive',
    name: 'Slate Archive',
    bg: '#1c2533',
    ink: '#ffffff',
    badge: 'ARCHIVE',
    surface: 'warm-nano-texture-matte',
  },
  {
    id: 'identity-cream',
    name: 'Identity Sand',
    bg: '#f1ede3',
    ink: '#23211e',
    badge: 'ALL-ACCESS',
    surface: 'pvc-security-id-sheen',
  },
  {
    id: 'soft-celadon',
    name: 'Soft Celadon',
    bg: '#e2ecf9',
    ink: '#1e293b',
    badge: 'CELADON',
    surface: 'cold-press-watercolor',
  },
  {
    id: 'warm-sand',
    name: 'Warm Sand',
    bg: '#f4ede4',
    ink: '#2c2825',
    badge: 'SAND',
    surface: 'cotton-rag-300gsm',
  },
  {
    id: 'crimson-seal',
    name: 'Crimson Seal',
    bg: '#251214',
    ink: '#fdeded',
    badge: 'CRIMSON',
    surface: 'pvc-security-id-sheen',
  },
  {
    id: 'y2k-acid',
    name: 'Acid Minimal',
    bg: '#e0e722',
    ink: '#111417',
    badge: 'ACID',
    surface: 'rainbow-hologram-foil',
  },
];

type AspectRatioOption = '4:5' | '1:1' | '2:3' | '9:16' | '8:5' | '16:9';

const findTemplatePalette = (template?: CardTemplate) => {
  if (!template?.theme) return -1;
  return PALETTES.findIndex((palette) => palette.bg.toLowerCase() === template.theme.bg.toLowerCase());
};

const getTemplatePalette = (template?: CardTemplate): PaletteOption | null => {
  if (!template?.theme) return null;
  const matchingPalette = PALETTES[findTemplatePalette(template)];
  return {
    id: template.theme.id,
    name: template.theme.name || matchingPalette?.name || template.title,
    bg: template.theme.bg,
    ink: template.theme.ink,
    badge: template.badge || matchingPalette?.badge || 'DESIGN',
    surface: matchingPalette?.surface || (template.surfaceFinish === 'grain' ? 'woven-canvas-linen' : 'warm-nano-texture-matte'),
  };
};

const getTemplateRatio = (template?: CardTemplate): AspectRatioOption => {
  if (!template) return '4:5';
  const width = template.canvasDoc?.canvasWidth ?? (template.layoutHint === 'vertical' ? 640 : template.layoutHint === 'square' ? 1080 : 960);
  const height = template.canvasDoc?.canvasHeight ?? (template.layoutHint === 'vertical' ? 960 : template.layoutHint === 'square' ? 1080 : 600);
  const ratio = width / height;
  if (ratio >= 1.68) return '16:9';
  if (ratio >= 1.4) return '8:5';
  if (ratio >= 0.9) return '1:1';
  if (ratio >= 0.72) return '4:5';
  if (ratio >= 0.61) return '2:3';
  return '9:16';
};

const getContrastInkForBg = (bg?: string): string => {
  const hex = bg?.match(/^#([\da-f]{3}|[\da-f]{6})$/i)?.[1];
  if (!hex) return '#1c1b18';
  const full = hex.length === 3 ? hex.split('').map((c) => `${c}${c}`).join('') : hex;
  const channels = [0, 2, 4].map((offset) => parseInt(full.slice(offset, offset + 2), 16) / 255);
  const [r, g, b] = channels.map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.45 ? '#1c1b18' : '#f4ede4';
};

const getTemplateTextField = (template: CardTemplate | undefined, fields: string[]) => {
  const textObjects = template?.canvasDoc?.objects.filter((object) => object.type === 'text') || [];
  const field = textObjects.find((object) => {
    const name = object.name.toLowerCase();
    return !name.includes('label') && fields.some((key) => name.includes(key));
  });
  return field?.type === 'text' ? field.text : undefined;
};

const getTemplateAvatar = (template?: CardTemplate) =>
  template?.canvasDoc?.objects.find((object) => object.type === 'image')?.src ||
  (template?.category === 'id-card' || template?.hasPhotoArea ? ASSET_AVATARS.studentScholar : ASSET_AVATARS.grungeDan);

export const CreatorView: React.FC<CreatorViewProps> = ({
  initialTemplate,
  theme = 'dark',
  onNavigateHome,
  onToggleTheme,
}) => {
  const isLight = theme === 'light';

  useEffect(() => {
    updatePageSEO({
      title: 'ACG Studio — Card Creator Workspace',
      description: 'Clean editorial workspace for designing quote cards and ID passes.',
      canonicalPath: '/create',
      ogType: 'website',
    });
  }, []);

  // Mode: Quote card or ID pass
  const [mode, setMode] = useState<'quote' | 'id'>(() => {
    if (initialTemplate?.category === 'id-card' || initialTemplate?.hasPhotoArea) return 'id';
    return 'quote';
  });

  // Mobile navigation tab inside drawer
  const [mobileTab, setMobileTab] = useState<'content' | 'palette' | 'type'>('content');
  const [aspectMenuOpen, setAspectMenuOpen] = useState(false);

  // Palette selection
  const [paletteIndex, setPaletteIndex] = useState(() => Math.max(0, findTemplatePalette(initialTemplate)));
  const [templatePalette, setTemplatePalette] = useState<PaletteOption | null>(() => getTemplatePalette(initialTemplate));
  const [sourceTemplatePalette] = useState<PaletteOption | null>(() => getTemplatePalette(initialTemplate));

  // Aspect ratio
  const [aspectRatio, setAspectRatio] = useState<AspectRatioOption>(() => getTemplateRatio(initialTemplate));

  // Typography & Appearance
  const [fontFamily, setFontFamily] = useState<string>(() => {
    if (['mono', 'space-mono', 'pixel'].includes(initialTemplate?.font || '')) return 'mono';
    if (['sans', 'syne', 'space-grotesk', 'unbounded'].includes(initialTemplate?.font || '')) return 'sans';
    return 'editorial';
  });
  const [customFonts, setCustomFonts] = useState<StoredCustomFont[]>([]);
  const [fontModalOpen, setFontModalOpen] = useState(false);
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const fontFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadAllFontsFromIndexedDB().then(setCustomFonts);
  }, [fontModalOpen]);

  const handleUploadFont = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const meta = await registerAndSaveCustomFont(file);
      setCustomFonts((prev) => [meta, ...prev.filter((f) => f.familyName !== meta.familyName)]);
      setFontFamily(meta.familyName);
      showToast(`Font "${meta.familyName.replace('Custom_', '').replace(/_/g, ' ')}" registered`);
    } catch (err: any) {
      showToast(err?.message || 'Failed to upload font');
    }
    e.target.value = '';
  };

  const handleExtractFromPhoto = async () => {
    if (!avatar) return;
    try {
      const { palette } = await extractPaletteFromImage(avatar, 6);
      setExtractedColors(palette);
      showToast('Extracted color swatches from photo');
    } catch {
      showToast('Could not extract colors');
    }
  };
  const [fontSize, setFontSize] = useState(initialTemplate?.fontSize || 26);
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>(() => initialTemplate?.align || 'left');

  // Quote mode content
  const [quote, setQuote] = useState(
    initialTemplate?.quote ||
      'In the depth of winter, I finally learned that within me there lay an invincible summer.'
  );
  const [author, setAuthor] = useState(
    initialTemplate?.author || 'Albert Camus — Return to Tipasa'
  );
  const [tag, setTag] = useState(initialTemplate?.tag || 'FIELD NOTES — 001');

  // ID mode content
  const templateQuoteLines = initialTemplate?.quote.split(/\r?\n/).map((line) => line.trim()).filter(Boolean) || [];
  const [idName, setIdName] = useState(
    () =>
      getTemplateTextField(initialTemplate, [
        'value name',
        'field name',
        'visitor name',
        'artist name',
        'speaker name',
        'streamer name',
        'bias name',
        'handle val',
        'v1',
        'field 1',
        'name',
      ]) ||
      initialTemplate?.title ||
      'Dan Valentini'
  );
  const [idRole, setIdRole] = useState(() => getTemplateTextField(initialTemplate, ['role', 'position', 'focus area']) || templateQuoteLines[1] || (initialTemplate ? '' : 'Vision Architect'));
  const [idClearance, setIdClearance] = useState(() => getTemplateTextField(initialTemplate, ['clearance', 'access level', 'status']) || initialTemplate?.tag || templateQuoteLines[0] || (initialTemplate ? '' : 'ALL-ACCESS • TIER 01'));
  const [avatar, setAvatar] = useState<string>(() => getTemplateAvatar(initialTemplate));

  // Canvas refs and export/preview state
  const cardRef = useRef<HTMLDivElement>(null);
  const threeMountRef = useRef<HTMLDivElement>(null);
  const threeStageRef = useRef<ThreeCardPreviewController | null>(null);
  const lastModeRef = useRef<string>(mode);

  const [is3DMode, setIs3DMode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const currentPalette = templatePalette || PALETTES[paletteIndex] || PALETTES[0];

  const handleModeChange = (newMode: 'quote' | 'id') => setMode(newMode);

  const showToast = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => {
      setFeedbackMessage((cur) => (cur === msg ? null : cur));
    }, 2400);
  };

  // 3D Scene setup
  useEffect(() => {
    if (!is3DMode || !threeMountRef.current || !cardRef.current) {
      if (threeStageRef.current) {
        threeStageRef.current();
        threeStageRef.current = null;
      }
      return;
    }

    let isMounted = true;
    const timer = setTimeout(async () => {
      if (!cardRef.current) return;
      const docText = `${quote}${author}${tag}${idName}${idRole}${idClearance}`;
      const fontEmbedCSS = await buildSafeFontEmbedCSS(customFonts, undefined, docText);
      toPng(cardRef.current, { pixelRatio: 1.5, fontEmbedCSS }).then((dataUrl) => {
        if (!isMounted) return;
        const img = new Image();
        img.onload = () => {
          if (!isMounted || !threeMountRef.current) return;
          const off = document.createElement('canvas');
          off.width = img.width;
          off.height = img.height;
          const ctx = off.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const [wRatio, hRatio] = aspectRatio.split(':').map(Number);

            if (threeStageRef.current && lastModeRef.current === mode) {
              threeStageRef.current.updateTexture(off, currentPalette.surface);
            } else {
              if (threeStageRef.current) threeStageRef.current();
              lastModeRef.current = mode;
              threeStageRef.current = createThreeCardPreviewScene(
                threeMountRef.current,
                off,
                wRatio,
                hRatio,
                currentPalette.surface
              );
            }
          }
        };
        img.src = dataUrl;
      }).catch((error) => {
        console.error('Failed to prepare the 3D card preview:', error);
        if (isMounted) setIs3DMode(false);
      });
    }, 150);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [
    is3DMode,
    mode,
    currentPalette,
    aspectRatio,
    quote,
    author,
    tag,
    idName,
    idRole,
    idClearance,
    avatar,
    fontFamily,
    fontSize,
    textAlign,
  ]);

  useEffect(() => {
    return () => {
      if (threeStageRef.current) {
        threeStageRef.current();
        threeStageRef.current = null;
      }
    };
  }, []);

  // Copy text or card
  const handleCopy = () => {
    const textToCopy =
      mode === 'quote'
        ? `${quote}\n— ${author}`
        : `${idName} • ${idRole} • ${idClearance}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    showToast('Copied text to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  // Export 2x Retina PNG
  const handleExport = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
      const docText = `${quote}${author}${tag}${idName}${idRole}${idClearance}`;
      const fontEmbedCSS = await buildSafeFontEmbedCSS(customFonts, undefined, docText);
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        cacheBust: true,
        fontEmbedCSS,
      });
      const blob = dataUrlToBlob(dataUrl);
      triggerBrandedBlobDownload(blob, getBrandedExportFilename('png'));
      showToast('Exported Retina PNG');
    } catch (err: any) {
      console.error('Failed to export card image:', err);
      const msg = err?.message || String(err);
      if (msg.includes('tainted') || msg.includes('CORS') || msg.includes('SecurityError')) {
        showToast('Export blocked by cross-origin image. Try replacing photo with an upload.');
      } else {
        showToast('Export failed. Please try again.');
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    try {
      const sanitized = await validateAndSanitizeImageFile(file);
      setAvatar(sanitized.safeDataUrl);
      showToast('Avatar updated!');
    } catch (err: any) {
      showToast(err?.message || 'Could not process avatar image.');
    }
  };

  const sampleQuotes = [
    {
      q: 'Become who you needed.',
      a: 'A personal reminder.',
      t: 'FIELD NOTES — 001',
    },
    {
      q: 'Less, but better.',
      a: 'FORM / FUNCTION',
      t: 'OBJECT STUDY / 04',
    },
    {
      q: 'The details are not the details. They make the design.',
      a: 'Charles Eames',
      t: 'ARCHIVE — 018',
    },
    {
      q: 'In the depth of winter, I finally learned that within me there lay an invincible summer.',
      a: 'Albert Camus',
      t: 'ESSAY NO. 04',
    },
  ];

  const handleShuffleQuote = () => {
    const next = sampleQuotes[Math.floor(Math.random() * sampleQuotes.length)];
    setQuote(next.q);
    setAuthor(next.a);
    setTag(next.t);
  };

  const getAspectDimensions = () => {
    switch (aspectRatio) {
      case '8:5':
        return 'aspect-[8/5] max-w-[560px] max-h-[38vh] md:max-h-[68vh]';
      case '16:9':
        return 'aspect-video max-w-[620px] max-h-[38vh] md:max-h-[68vh]';
      case '1:1':
        return 'aspect-square max-w-[420px] max-h-[38vh] md:max-h-[68vh]';
      case '2:3':
        return 'aspect-[2/3] max-w-[320px] max-h-[38vh] md:max-h-[72vh]';
      case '9:16':
        return 'aspect-[9/16] max-w-[280px] max-h-[38vh] md:max-h-[72vh]';
      case '4:5':
      default:
        return 'aspect-[4/5] max-w-[360px] max-h-[38vh] md:max-h-[70vh]';
    }
  };

  return (
    <div className="creator-workspace w-full h-[100dvh] max-h-[100dvh] flex flex-col overflow-hidden bg-[var(--app-bg)] text-[var(--app-text-primary)] transition-colors duration-200">
      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* WORKSPACE TOOLBAR                                                   */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <header className="h-13 sm:h-14 border-b border-[var(--app-border-subtle)] bg-[var(--app-surface)] px-3 sm:px-5 flex items-center justify-between gap-2 shrink-0 z-20">
        {/* Left: Back to Gallery + Quick Studio switch + Mode Switcher */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)] transition-colors cursor-pointer py-1"
            title="Return to Gallery"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline font-medium">Gallery</span>
          </a>

          <a
            href="/canvas"
            className="hidden md:inline-flex items-center gap-1 text-xs text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)] transition-colors cursor-pointer px-2 py-1 rounded-md hover:bg-[var(--app-surface-secondary)]"
            title="Switch to Canvas Studio"
          >
            <Sparkles className="w-3.5 h-3.5 text-[var(--app-accent)]" />
            <span>Canvas</span>
          </a>

          <div className="flex p-0.5 rounded-lg border border-[var(--app-border-subtle)] bg-[var(--app-bg)] text-xs">
            <button
              onClick={() => handleModeChange('quote')}
              className={`px-2.5 sm:px-3 py-1 rounded-md font-medium transition-colors cursor-pointer text-xs ${
                mode === 'quote'
                  ? 'bg-[var(--app-accent)] text-[var(--app-accent-ink)] font-semibold shadow-xs'
                  : 'text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)]'
              }`}
            >
              Quote
            </button>
            <button
              onClick={() => handleModeChange('id')}
              className={`px-2.5 sm:px-3 py-1 rounded-md font-medium transition-colors cursor-pointer text-xs ${
                mode === 'id'
                  ? 'bg-[var(--app-accent)] text-[var(--app-accent-ink)] font-semibold shadow-xs'
                  : 'text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)]'
              }`}
            >
              ID Pass
            </button>
          </div>
        </div>

        {/* Right: Format, 3D Preview, Copy, Theme, Export */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Format Selector: Desktop pill list */}
          <div className="hidden lg:flex items-center border border-[var(--app-border-subtle)] bg-[var(--app-bg)] rounded-lg p-0.5 text-xs">
            <span className="pl-2 pr-1 text-[11px] text-[var(--app-text-secondary)] flex items-center gap-1">
              <Crop className="w-3 h-3" />
              <span>Ratio:</span>
            </span>
            {(['8:5', '16:9', '4:5', '1:1', '2:3', '9:16'] as AspectRatioOption[]).map((r) => (
              <button
                key={r}
                onClick={() => setAspectRatio(r)}
                className={`px-2 py-1 rounded-md font-mono text-[11px] transition-colors cursor-pointer ${
                  aspectRatio === r
                    ? 'bg-[var(--app-accent)] text-[var(--app-accent-ink)] font-semibold shadow-xs'
                    : 'text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)]'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Format Selector: Mobile dropdown */}
          <div className="relative lg:hidden">
            <button
              onClick={() => setAspectMenuOpen(!aspectMenuOpen)}
              className="h-8 px-2 rounded-lg border border-[var(--app-border-subtle)] bg-[var(--app-bg)] text-xs font-mono flex items-center gap-1 cursor-pointer text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)]"
              title="Change Aspect Ratio"
            >
              <Crop className="w-3.5 h-3.5" />
              <span>{aspectRatio}</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>
            {aspectMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 z-50 w-32 rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface)] p-1.5 shadow-xl flex flex-col gap-0.5 animate-in fade-in zoom-in-95">
                {(['8:5', '16:9', '4:5', '1:1', '2:3', '9:16'] as AspectRatioOption[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setAspectRatio(r);
                      setAspectMenuOpen(false);
                    }}
                    className={`px-2.5 py-1.5 text-xs rounded-lg font-mono text-left flex items-center justify-between cursor-pointer transition-colors ${
                      aspectRatio === r
                        ? 'bg-[var(--app-accent)] text-[var(--app-accent-ink)] font-semibold'
                        : 'text-[var(--app-text-secondary)] hover:bg-[var(--app-surface-secondary)] hover:text-[var(--app-text-primary)]'
                    }`}
                  >
                    <span>{r}</span>
                    {aspectRatio === r && <Check className="w-3 h-3" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 3D Preview Control */}
          <button
            onClick={() => setIs3DMode(!is3DMode)}
            className={`h-8 px-2 sm:px-2.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              is3DMode
                ? 'bg-[var(--app-accent)] border-[var(--app-accent)] text-[var(--app-accent-ink)] font-semibold'
                : 'border-[var(--app-border-subtle)] bg-[var(--app-bg)] text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)]'
            }`}
            title="Toggle 3D Physical Preview"
          >
            <Box className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">3D</span>
          </button>

          {/* Copy Text Action */}
          <button
            onClick={handleCopy}
            className="hidden sm:flex h-8 px-2 sm:px-2.5 rounded-lg border border-[var(--app-border-subtle)] bg-[var(--app-bg)] hover:bg-[var(--app-surface-secondary)] text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)] text-xs font-medium items-center gap-1.5 transition-colors cursor-pointer"
            title="Copy Text to Clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[var(--app-accent)]" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {/* Theme Toggle Button */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="hidden sm:flex h-8 w-8 rounded-lg border border-[var(--app-border-subtle)] bg-[var(--app-bg)] hover:bg-[var(--app-surface-secondary)] text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)] items-center justify-center transition-colors cursor-pointer"
              title="Toggle theme"
            >
              {isLight ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
            </button>
          )}

          {/* Export Action */}
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="h-8 px-2.5 sm:px-4 rounded-lg bg-[var(--app-accent)] text-[var(--app-accent-ink)] hover:bg-[var(--app-accent-hover)] text-xs font-bold flex items-center gap-1 sm:gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50 shrink-0"
            title="Download Retina PNG"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Exporting...' : 'Export'}</span>
          </button>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* WORKSPACE BODY: RESPONSIVE SPLIT STAGE & CONTROLS                   */}
      {/* Mobile: Stage on top (order-1), Controls tabs below (order-2)       */}
      {/* Desktop: Controls on left (order-1), Stage on right (order-2)       */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Center Canvas Stage (Visual preview first on mobile!) */}
        <main
          className="order-1 md:order-2 h-[36vh] min-h-[210px] max-h-[320px] sm:h-[44vh] sm:max-h-[420px] md:h-auto md:max-h-none md:min-h-0 md:flex-1 p-3 sm:p-6 md:p-10 flex flex-col items-center justify-center overflow-auto relative bg-[var(--app-surface-secondary)] border-b md:border-b-0"
        >
          {/* Subtle feedback toast */}
          {feedbackMessage && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 px-3 py-1.5 rounded-md bg-[var(--app-surface)] border border-[var(--app-border-subtle)] text-xs text-[var(--app-text-primary)] shadow-md animate-fade-in flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--app-accent)]" />
              <span>{feedbackMessage}</span>
            </div>
          )}

          {is3DMode ? (
            <div className="w-full h-full min-h-[190px] sm:min-h-[260px] flex flex-col items-center justify-center">
              <div className="relative w-full max-w-md h-[210px] sm:h-[340px]">
                <div ref={threeMountRef} className="h-full w-full cursor-grab active:cursor-grabbing" />
                <ThreeDPreviewControls controllerRef={threeStageRef} />
              </div>
              <span className="text-[11px] font-mono text-[var(--app-text-secondary)] mt-1">
                Drag to rotate · Scroll to zoom
              </span>
            </div>
          ) : (
            <div
              className="w-full h-full flex items-center justify-center p-2"
            >
              <div
                ref={cardRef}
                style={{
                  backgroundColor: currentPalette.bg,
                  color: currentPalette.ink,
                }}
                className={`w-full ${getAspectDimensions()} p-5 sm:p-8 rounded-xl shadow-md transition-colors duration-200 flex flex-col justify-between border border-black/15 overflow-hidden relative select-text`}
              >
                {/* Subtle paper grain texture */}
                <div className="absolute inset-0 card-noise opacity-25 pointer-events-none" />

                {mode === 'quote' ? (
                  <>
                    {/* Header Tag Bar */}
                    <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-current/15 text-[10px] font-mono tracking-wider opacity-75 relative z-10 shrink-0">
                      <span className="font-semibold tracking-wider uppercase truncate max-w-[70%]">{tag}</span>
                      <span className="px-1.5 py-0.5 rounded border border-current/25 font-mono text-[9px] font-bold shrink-0">
                        {currentPalette.badge}
                      </span>
                    </div>

                    {/* Central Quote Body */}
                    <div className="my-auto py-3 sm:py-4 relative z-10 overflow-hidden">
                      <p
                        className={`leading-relaxed tracking-tight ${
                          fontFamily === 'editorial'
                            ? 'font-editorial'
                            : fontFamily === 'mono'
                            ? 'font-mono'
                            : fontFamily.startsWith('Custom_')
                            ? ''
                            : 'font-sans font-medium'
                        }`}
                        style={{
                          textAlign,
                          fontFamily: fontFamily.startsWith('Custom_') ? fontFamily : undefined,
                          fontSize: `${quote.length > 180 ? Math.max(13, Math.floor(fontSize * Math.sqrt(180 / quote.length))) : fontSize}px`,
                        }}
                      >
                        {quote}
                      </p>
                    </div>

                    {/* Footer Attribution */}
                    <div className="pt-2 sm:pt-2.5 border-t border-current/15 flex items-center justify-between gap-2 relative z-10 shrink-0">
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <span className="opacity-50 text-xs shrink-0">—</span>
                        <span className="text-[11px] sm:text-xs font-semibold opacity-90 leading-tight break-words">{author}</span>
                      </div>
                      <span className="text-[9px] font-mono opacity-50 uppercase tracking-widest shrink-0 whitespace-nowrap">
                        {currentPalette.badge || currentPalette.name}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    {/* ID Pass Header */}
                    <div className="relative z-10 flex flex-col items-center shrink-0">
                      <div className="w-10 h-1.5 rounded-full bg-black/25 border border-current/30 mb-2" />
                      <div className="w-full flex items-center justify-between pb-2 border-b border-current/15 text-[9px] font-mono tracking-widest opacity-85">
                        <span className="font-bold uppercase tracking-wider">CREATIVE ID PASS</span>
                        <span className="px-1.5 py-0.5 rounded border border-current/25 font-bold text-[9px]">
                          {currentPalette.badge}
                        </span>
                      </div>
                    </div>

                    {/* ID Pass Body */}
                    <div className="my-auto py-3 flex items-center gap-3 sm:gap-4 relative z-10">
                      <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-lg overflow-hidden border border-current/30 shadow-md shrink-0 bg-black/10">
                        <img
                          src={avatar}
                          alt="ID Portrait"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 flex flex-col gap-1 sm:gap-1.5 font-mono text-xs overflow-hidden">
                        <div>
                          <span className="text-[8px] uppercase tracking-wider opacity-60 block">NAME</span>
                          <span className="font-bold text-xs sm:text-sm block leading-tight break-words">{idName}</span>
                        </div>
                        <div>
                          <span className="text-[8px] uppercase tracking-wider opacity-60 block">ROLE</span>
                          <span className="text-[11px] sm:text-xs opacity-90 block break-words">{idRole}</span>
                        </div>
                        <div>
                          <span className="text-[8px] uppercase tracking-wider opacity-60 block">STATUS</span>
                          <span className="text-[9px] sm:text-[10px] font-semibold opacity-80 block tracking-wide break-words">
                            {idClearance}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* ID Pass Barcode Footer */}
                    <div className="pt-2 border-t border-current/15 flex items-center justify-between text-[9px] font-mono opacity-75 relative z-10 shrink-0">
                      <span className="tracking-tight font-bold">||||| | |||| ||| |||||||</span>
                      <span className="uppercase font-bold tracking-widest text-[8px]">VERIFIED PASS</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </main>

        {/* Controls Panel (Order-2 on mobile, Order-1 on desktop) */}
        <aside className="order-2 md:order-1 flex-1 md:flex-none md:w-80 lg:w-88 border-r-0 md:border-r border-[var(--app-border-subtle)] bg-[var(--app-surface)] flex flex-col overflow-hidden">
          {/* Mobile segment tabs for phone view */}
          <div className="md:hidden flex items-center border-b border-[var(--app-border-subtle)] bg-[var(--app-surface)] shrink-0 px-2 py-1.5 gap-1">
            <button
              onClick={() => setMobileTab('content')}
              className={`flex-1 min-h-[44px] py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                mobileTab === 'content'
                  ? 'bg-[var(--app-accent)] text-[var(--app-accent-ink)] shadow-xs'
                  : 'text-[var(--app-text-secondary)] hover:bg-[var(--app-surface-secondary)]'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>Words</span>
            </button>
            <button
              onClick={() => setMobileTab('palette')}
              className={`flex-1 min-h-[44px] py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                mobileTab === 'palette'
                  ? 'bg-[var(--app-accent)] text-[var(--app-accent-ink)] shadow-xs'
                  : 'text-[var(--app-text-secondary)] hover:bg-[var(--app-surface-secondary)]'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Palette</span>
            </button>
            <button
              onClick={() => setMobileTab('type')}
              className={`flex-1 min-h-[44px] py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                mobileTab === 'type'
                  ? 'bg-[var(--app-accent)] text-[var(--app-accent-ink)] shadow-xs'
                  : 'text-[var(--app-text-secondary)] hover:bg-[var(--app-surface-secondary)]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Style</span>
            </button>
          </div>

          {/* Controls Body: Scrollable area */}
          <div className="flex-1 p-4 sm:p-5 pb-24 md:pb-6 flex flex-col gap-5 overflow-y-auto">
            {/* Palette Preset Group */}
            <div className={mobileTab === 'palette' ? 'block' : 'hidden md:block'}>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-mono uppercase tracking-wider text-[var(--app-text-secondary)] font-semibold">
                  Color Palette
                </label>
                <span className="text-[11px] text-[var(--app-text-secondary)] font-medium">
                  {currentPalette.name}
                </span>
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {sourceTemplatePalette && !templatePalette && (
                  <button
                    type="button"
                    onClick={() => setTemplatePalette(sourceTemplatePalette)}
                    className="h-8 rounded-lg border border-[var(--app-border-subtle)] ring-2 ring-[var(--app-accent)] relative flex items-center justify-center cursor-pointer"
                    style={{ backgroundColor: sourceTemplatePalette.bg }}
                    title={`Original: ${sourceTemplatePalette.name}`}
                    aria-label={`Use original ${sourceTemplatePalette.name} palette`}
                  >
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: sourceTemplatePalette.ink }} />
                  </button>
                )}
                {PALETTES.map((p, idx) => (
                  <button
                    key={p.id}
                    onClick={() => { setPaletteIndex(idx); setTemplatePalette(null); }}
                    className={`h-8 rounded-lg border transition-all cursor-pointer relative flex items-center justify-center ${
                      !templatePalette && paletteIndex === idx
                        ? 'ring-2 ring-[var(--app-accent)] scale-105 border-transparent shadow-xs'
                        : 'border-[var(--app-border-subtle)] hover:opacity-85'
                    }`}
                    style={{ backgroundColor: p.bg }}
                    title={p.name}
                    aria-label={p.name}
                  >
                    {!templatePalette && paletteIndex === idx && (
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: p.ink }}
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Custom Tone & Eyedropper Controls */}
              <div className="mt-3 pt-2.5 border-t border-[var(--app-border-subtle)] flex flex-col gap-2">
                <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-[var(--app-text-muted)]">
                  <span>Custom Swatches</span>
                  <div className="flex items-center gap-1.5">
                    {avatar && (
                      <button
                        type="button"
                        onClick={handleExtractFromPhoto}
                        className="text-[10px] font-mono text-[var(--app-accent)] hover:underline flex items-center gap-1 cursor-pointer"
                        title="Extract 5 colors from photo"
                      >
                        Extract from Photo
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={async () => {
                        const picked = await pickColorWithEyedropper();
                        if (picked) {
                          setTemplatePalette({
                            id: 'eyedropper-bg',
                            name: 'Eyedropper Tone',
                            bg: picked,
                            ink: getContrastInkForBg(picked),
                            badge: 'PICKED',
                            surface: 'warm-nano-texture-matte',
                          });
                          showToast(`Applied ${picked}`);
                        }
                      }}
                      className="px-1.5 py-0.5 rounded border border-[var(--app-border-subtle)] hover:bg-[var(--app-surface-secondary)] flex items-center gap-1 text-[10px] cursor-pointer"
                      title="Sample any color from screen"
                    >
                      <Pipette className="w-2.5 h-2.5" /> Eyedropper
                    </button>
                  </div>
                </div>

                {extractedColors.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    {extractedColors.map((color, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setTemplatePalette({
                            id: `extracted-${idx}`,
                            name: `Photo Tone ${idx + 1}`,
                            bg: color,
                            ink: getContrastInkForBg(color),
                            badge: 'PHOTO',
                            surface: 'warm-nano-texture-matte',
                          });
                        }}
                        className="h-6 flex-1 rounded border border-current/20 hover:scale-105 transition-transform cursor-pointer"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Content Group based on mode */}
            <div className={mobileTab === 'content' ? 'block' : 'hidden md:block'}>
              {mode === 'quote' ? (
                <div className="flex flex-col gap-4">
                  {/* Quote Text */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-mono uppercase tracking-wider text-[var(--app-text-secondary)] font-semibold">
                        Quote Body
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleCopy}
                          className="text-[11px] text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)] flex items-center gap-1 cursor-pointer transition-colors"
                          title="Copy quote text"
                        >
                          {copied ? <Check className="w-3 h-3 text-[var(--app-accent)]" /> : <Copy className="w-3 h-3" />}
                          <span>{copied ? 'Copied' : 'Copy'}</span>
                        </button>
                        <button
                          onClick={handleShuffleQuote}
                          className="text-[11px] text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)] flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Shuffle className="w-3 h-3" />
                          <span>Inspire</span>
                        </button>
                      </div>
                    </div>
                    <textarea
                      value={quote}
                      onChange={(e) => setQuote(e.target.value)}
                      rows={3}
                      className="w-full text-xs leading-relaxed p-2.5 rounded-lg border border-[var(--app-border-subtle)] bg-[var(--app-bg)] text-[var(--app-text-primary)] focus:outline-none focus:border-[var(--app-accent)] transition-colors resize-none"
                      placeholder="Enter quote or text..."
                    />
                  </div>

                  {/* Author */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-[var(--app-text-secondary)] font-semibold">
                      Author / Source
                    </label>
                    <input
                      type="text"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      className="w-full text-xs px-2.5 py-2 rounded-lg border border-[var(--app-border-subtle)] bg-[var(--app-bg)] text-[var(--app-text-primary)] focus:outline-none focus:border-[var(--app-accent)] transition-colors"
                      placeholder="e.g. Albert Camus"
                    />
                  </div>

                  {/* Header Tag */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-[var(--app-text-secondary)] font-semibold">
                      Header Tag
                    </label>
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) => setTag(e.target.value)}
                      className="w-full text-xs px-2.5 py-2 rounded-lg border border-[var(--app-border-subtle)] bg-[var(--app-bg)] text-[var(--app-text-primary)] focus:outline-none focus:border-[var(--app-accent)] transition-colors"
                      placeholder="e.g. FIELD NOTES — 001"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {/* ID Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-[var(--app-text-secondary)] font-semibold">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={idName}
                      onChange={(e) => setIdName(e.target.value)}
                      className="w-full text-xs px-2.5 py-2 rounded-lg border border-[var(--app-border-subtle)] bg-[var(--app-bg)] text-[var(--app-text-primary)] focus:outline-none focus:border-[var(--app-accent)] transition-colors"
                      placeholder="e.g. Dan Valentini"
                    />
                  </div>

                  {/* ID Role */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-[var(--app-text-secondary)] font-semibold">
                      Role / Title
                    </label>
                    <input
                      type="text"
                      value={idRole}
                      onChange={(e) => setIdRole(e.target.value)}
                      className="w-full text-xs px-2.5 py-2 rounded-lg border border-[var(--app-border-subtle)] bg-[var(--app-bg)] text-[var(--app-text-primary)] focus:outline-none focus:border-[var(--app-accent)] transition-colors"
                      placeholder="e.g. Vision Architect"
                    />
                  </div>

                  {/* Clearance / Status */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-[var(--app-text-secondary)] font-semibold">
                      Clearance / Access
                    </label>
                    <input
                      type="text"
                      value={idClearance}
                      onChange={(e) => setIdClearance(e.target.value)}
                      className="w-full text-xs px-2.5 py-2 rounded-lg border border-[var(--app-border-subtle)] bg-[var(--app-bg)] text-[var(--app-text-primary)] focus:outline-none focus:border-[var(--app-accent)] transition-colors"
                      placeholder="e.g. ALL-ACCESS • TIER 01"
                    />
                  </div>

                  {/* Avatar Selection */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-[var(--app-text-secondary)] font-semibold">
                      Portrait / Avatar
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setAvatar(ASSET_AVATARS.grungeDan)}
                        className={`w-9 h-11 rounded border overflow-hidden cursor-pointer transition-all ${
                          avatar === ASSET_AVATARS.grungeDan
                            ? 'ring-2 ring-[var(--app-accent)] border-transparent'
                            : 'border-[var(--app-border-subtle)] opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={ASSET_AVATARS.grungeDan} alt="Dan" className="w-full h-full object-cover grayscale" />
                      </button>
                      <button
                        onClick={() => setAvatar(ASSET_AVATARS.jenniePretty)}
                        className={`w-9 h-11 rounded border overflow-hidden cursor-pointer transition-all ${
                          avatar === ASSET_AVATARS.jenniePretty
                            ? 'ring-2 ring-[var(--app-accent)] border-transparent'
                            : 'border-[var(--app-border-subtle)] opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={ASSET_AVATARS.jenniePretty} alt="Jennie" className="w-full h-full object-cover" />
                      </button>
                      <label className="h-11 px-2.5 rounded border border-dashed border-[var(--app-border-subtle)] hover:border-[var(--app-accent)] bg-[var(--app-bg)] text-[10px] text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)] flex items-center justify-center gap-1 cursor-pointer transition-colors">
                        <Upload className="w-3 h-3" />
                        <span>Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Typography & Alignment Group */}
            <div className={`pt-2 border-t border-[var(--app-border-subtle)] flex flex-col gap-3.5 ${mobileTab === 'type' ? 'block' : 'hidden md:block'}`}>
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-mono uppercase tracking-wider text-[var(--app-text-secondary)] font-semibold">
                  Typography &amp; Layout
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFontModalOpen(true)}
                    className="text-[11px] font-mono text-[var(--app-accent)] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Type className="w-3 h-3" /> Library
                  </button>
                  <button
                    type="button"
                    onClick={() => fontFileInputRef.current?.click()}
                    className="text-[11px] font-mono text-[var(--app-accent)] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Upload className="w-3 h-3" /> + Upload
                  </button>
                  <input
                    ref={fontFileInputRef}
                    type="file"
                    accept=".woff2,.woff,.ttf,.otf"
                    onChange={handleUploadFont}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Standard Fonts */}
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                <button
                  onClick={() => setFontFamily('editorial')}
                  className={`py-1.5 rounded-lg border text-center transition-colors cursor-pointer ${
                    fontFamily === 'editorial'
                      ? 'bg-[var(--app-accent)] border-[var(--app-accent)] text-[var(--app-accent-ink)] font-semibold'
                      : 'border-[var(--app-border-subtle)] text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)]'
                  }`}
                >
                  Serif
                </button>
                <button
                  onClick={() => setFontFamily('sans')}
                  className={`py-1.5 rounded-lg border text-center transition-colors cursor-pointer ${
                    fontFamily === 'sans'
                      ? 'bg-[var(--app-accent)] border-[var(--app-accent)] text-[var(--app-accent-ink)] font-semibold'
                      : 'border-[var(--app-border-subtle)] text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)]'
                  }`}
                >
                  Sans
                </button>
                <button
                  onClick={() => setFontFamily('mono')}
                  className={`py-1.5 rounded-lg border text-center transition-colors cursor-pointer ${
                    fontFamily === 'mono'
                      ? 'bg-[var(--app-accent)] border-[var(--app-accent)] text-[var(--app-accent-ink)] font-semibold'
                      : 'border-[var(--app-border-subtle)] text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)]'
                  }`}
                >
                  Mono
                </button>
              </div>

              {/* Custom Uploaded Fonts */}
              {customFonts.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--app-text-muted)]">
                    My Uploaded Fonts ({customFonts.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {customFonts.map((font) => (
                      <button
                        key={font.familyName}
                        type="button"
                        onClick={() => setFontFamily(font.familyName)}
                        style={{ fontFamily: font.familyName }}
                        className={`px-2 py-1 text-xs rounded-md border truncate max-w-[140px] cursor-pointer transition-colors ${
                          fontFamily === font.familyName
                            ? 'bg-[var(--app-accent)] border-[var(--app-accent)] text-[var(--app-accent-ink)] font-medium'
                            : 'border-[var(--app-border-subtle)] text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)]'
                        }`}
                        title={font.familyName}
                      >
                        {font.familyName.replace('Custom_', '').replace(/_/g, ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Text Presets */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--app-text-muted)]">
                  Presets
                </span>
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { label: 'Editorial', font: 'editorial', size: 26, align: 'left' as const },
                    { label: 'Minimal', font: 'sans', size: 20, align: 'left' as const },
                    { label: 'Technical', font: 'mono', size: 18, align: 'left' as const },
                    { label: 'Poetic', font: 'editorial', size: 24, align: 'center' as const },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setFontFamily(preset.font);
                        setFontSize(preset.size);
                        setTextAlign(preset.align);
                      }}
                      className="py-1 text-[10px] font-mono uppercase rounded border border-[var(--app-border-subtle)] text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)] hover:border-[var(--app-border-strong)] transition-colors cursor-pointer text-center"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {mode === 'quote' && (
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="creator-font-size" className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-[var(--app-text-secondary)]">
                    <span>Quote size</span><span>{fontSize}px</span>
                  </label>
                  <input id="creator-font-size" type="range" min="14" max="48" step="1" value={fontSize} onChange={(event) => setFontSize(Number(event.target.value))} className="w-full accent-[var(--app-accent)]" />
                </div>
              )}

              {/* Alignment Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setTextAlign('left')}
                  className={`flex-1 py-1.5 rounded-lg border flex items-center justify-center cursor-pointer transition-colors ${
                    textAlign === 'left'
                      ? 'bg-[var(--app-accent)] border-[var(--app-accent)] text-[var(--app-accent-ink)]'
                      : 'border-[var(--app-border-subtle)] text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)]'
                  }`}
                  title="Left Align"
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setTextAlign('center')}
                  className={`flex-1 py-1.5 rounded-lg border flex items-center justify-center cursor-pointer transition-colors ${
                    textAlign === 'center'
                      ? 'bg-[var(--app-accent)] border-[var(--app-accent)] text-[var(--app-accent-ink)]'
                      : 'border-[var(--app-border-subtle)] text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)]'
                  }`}
                  title="Center Align"
                >
                  <AlignCenter className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setTextAlign('right')}
                  className={`flex-1 py-1.5 rounded-lg border flex items-center justify-center cursor-pointer transition-colors ${
                    textAlign === 'right'
                      ? 'bg-[var(--app-accent)] border-[var(--app-accent)] text-[var(--app-accent-ink)]'
                      : 'border-[var(--app-border-subtle)] text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)]'
                  }`}
                  title="Right Align"
                >
                  <AlignRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <MyFontsModal
        isOpen={fontModalOpen}
        onClose={() => setFontModalOpen(false)}
        onSelectFont={(fam) => {
          setFontFamily(fam);
          showToast(`Applied custom font`);
        }}
        selectedFontFamily={fontFamily}
        theme={theme}
      />
    </div>
  );
};
