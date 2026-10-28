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
} from 'lucide-react';
import { ASSET_AVATARS } from '../data/canvasAssets';
import { createThreeCardPreviewScene, type ThreeCardPreviewController } from '../engines/threeCardStage';
import { ThreeDPreviewControls } from '../components/ThreeDPreviewControls';
import { getBrandedExportFilename, triggerBrandedBlobDownload } from '../engines/brandedExportAndThreePng';

export interface CreatorViewProps {
  initialTemplate?: CardTemplate;
  theme?: 'dark' | 'light';
  onNavigateHome?: () => void;
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
}) => {

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

  // Palette selection
  const [paletteIndex, setPaletteIndex] = useState(() => Math.max(0, findTemplatePalette(initialTemplate)));
  const [templatePalette, setTemplatePalette] = useState<PaletteOption | null>(() => getTemplatePalette(initialTemplate));
  const [sourceTemplatePalette] = useState<PaletteOption | null>(() => getTemplatePalette(initialTemplate));

  // Aspect ratio
  const [aspectRatio, setAspectRatio] = useState<AspectRatioOption>(() => getTemplateRatio(initialTemplate));

  // Typography & Appearance
  const [fontFamily, setFontFamily] = useState<'editorial' | 'sans' | 'mono'>(() => {
    if (['mono', 'space-mono', 'pixel'].includes(initialTemplate?.font || '')) return 'mono';
    if (['sans', 'syne', 'space-grotesk', 'unbounded'].includes(initialTemplate?.font || '')) return 'sans';
    return 'editorial';
  });
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
  const [idName, setIdName] = useState(() => getTemplateTextField(initialTemplate, ['value name', 'field name', 'name']) || initialTemplate?.title || 'Dan Valentini');
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
    const timer = setTimeout(() => {
      if (!cardRef.current) return;
      toPng(cardRef.current, { pixelRatio: 1.5, skipFonts: true }).then((dataUrl) => {
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
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        cacheBust: true,
        skipFonts: true,
      });
      const blob = await (await fetch(dataUrl)).blob();
      triggerBrandedBlobDownload(blob, getBrandedExportFilename('png'));
      showToast('Exported Retina PNG');
    } catch (err) {
      console.error('Failed to export card image:', err);
      showToast('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatar(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
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
        return 'aspect-[8/5] max-w-[560px]';
      case '16:9':
        return 'aspect-video max-w-[640px]';
      case '1:1':
        return 'aspect-square max-w-[440px]';
      case '2:3':
        return 'aspect-[2/3] max-w-[340px]';
      case '9:16':
        return 'aspect-[9/16] max-w-[300px]';
      case '4:5':
      default:
        return 'aspect-[4/5] max-w-[390px]';
    }
  };

  return (
    <div className="creator-workspace w-full flex-1 flex flex-col pt-14 min-h-[calc(100vh-56px)] bg-[var(--app-bg)] text-[var(--app-text-primary)] transition-colors duration-200">
      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* WORKSPACE TOOLBAR                                                   */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="h-12 border-b border-[var(--app-border-subtle)] bg-[var(--app-bg)] px-4 sm:px-6 flex items-center justify-between gap-3 shrink-0">
        {/* Left: Back to Gallery + Mode Switcher */}
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)] transition-colors cursor-pointer mr-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Gallery</span>
          </a>

          <div className="flex p-0.5 rounded-lg border border-[var(--app-border-subtle)] bg-[var(--app-surface)] text-xs">
            <button
              onClick={() => handleModeChange('quote')}
              className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                mode === 'quote'
                  ? 'bg-[var(--app-accent)] text-[var(--app-accent-ink)] font-semibold shadow-xs'
                  : 'text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)]'
              }`}
            >
              Quote Card
            </button>
            <button
              onClick={() => handleModeChange('id')}
              className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                mode === 'id'
                  ? 'bg-[var(--app-accent)] text-[var(--app-accent-ink)] font-semibold shadow-xs'
                  : 'text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)]'
              }`}
            >
              ID Pass
            </button>
          </div>
        </div>

        {/* Right: Format, 3D Preview, Duplicate, Export */}
        <div className="flex items-center gap-2">
          {/* Format Selector */}
          <div className="flex items-center border border-[var(--app-border-subtle)] bg-[var(--app-surface)] rounded-lg p-0.5 text-xs">
            <span className="hidden sm:inline pl-2 pr-1 text-[11px] text-[var(--app-text-secondary)] flex items-center gap-1">
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

          {/* 3D Preview Control */}
          <button
            onClick={() => setIs3DMode(!is3DMode)}
            className={`h-8 px-2.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              is3DMode
                ? 'bg-[var(--app-accent)] border-[var(--app-accent)] text-[var(--app-accent-ink)] font-semibold'
                : 'border-[var(--app-border-subtle)] bg-[var(--app-surface)] text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)]'
            }`}
            title="Toggle 3D Physical Preview"
          >
            <Box className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">3D</span>
          </button>

          {/* Duplicate / Copy Action */}
          <button
            onClick={handleCopy}
            className="h-8 px-2.5 rounded-lg border border-[var(--app-border-subtle)] bg-[var(--app-surface)] hover:bg-[var(--app-surface-secondary)] text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Copy Text to Clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[var(--app-accent)]" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {/* Export Action */}
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="h-8 px-4 rounded-lg bg-[var(--app-accent)] text-[var(--app-accent-ink)] hover:bg-[var(--app-accent-hover)] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50"
            title="Download Retina PNG"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Exporting...' : 'Export PNG'}</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* WORKSPACE BODY: LEFT EDITING PANEL + PROMINENT CANVAS STAGE         */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left-side Compact Editing Panel */}
        <aside className="w-full md:w-80 lg:w-88 border-b md:border-b-0 md:border-r border-[var(--app-border-subtle)] bg-[var(--app-surface)] p-4 sm:p-5 flex flex-col gap-5 overflow-y-auto shrink-0 max-h-[48vh] md:max-h-[calc(100vh-104px)]">
          {/* Palette Preset Group */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-mono uppercase tracking-wider text-[var(--app-text-secondary)] font-semibold">
                Palette
              </label>
              <span className="text-[11px] text-[var(--app-text-secondary)]">
                {currentPalette.name}
              </span>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {sourceTemplatePalette && !templatePalette && (
                <button
                  type="button"
                  onClick={() => setTemplatePalette(sourceTemplatePalette)}
                  className="h-7 rounded border border-[var(--app-border-subtle)] ring-2 ring-[var(--app-accent)] relative flex items-center justify-center"
                  style={{ backgroundColor: sourceTemplatePalette.bg }}
                  title={`Original: ${sourceTemplatePalette.name}`}
                  aria-label={`Use original ${sourceTemplatePalette.name} palette`}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: sourceTemplatePalette.ink }} />
                </button>
              )}
              {PALETTES.map((p, idx) => (
                <button
                  key={p.id}
                  onClick={() => { setPaletteIndex(idx); setTemplatePalette(null); }}
                  className={`h-7 rounded border transition-all cursor-pointer relative flex items-center justify-center ${
                    !templatePalette && paletteIndex === idx
                      ? 'ring-2 ring-[var(--app-accent)] scale-105 border-transparent shadow-xs'
                      : 'border-[var(--app-border-subtle)] hover:opacity-80'
                  }`}
                  style={{ backgroundColor: p.bg }}
                  title={p.name}
                  aria-label={p.name}
                >
                  {!templatePalette && paletteIndex === idx && (
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: p.ink }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Content Group based on mode */}
          {mode === 'quote' ? (
            <div className="flex flex-col gap-4">
              {/* Quote Text */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-[var(--app-text-secondary)] font-semibold">
                    Quote Body
                  </label>
                  <button
                    onClick={handleShuffleQuote}
                    className="text-[11px] text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)] flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Shuffle className="w-3 h-3" />
                    <span>Inspire</span>
                  </button>
                </div>
                <textarea
                  value={quote}
                  onChange={(e) => setQuote(e.target.value)}
                  rows={4}
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
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-[var(--app-border-subtle)] bg-[var(--app-bg)] text-[var(--app-text-primary)] focus:outline-none focus:border-[var(--app-accent)] transition-colors"
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
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-[var(--app-border-subtle)] bg-[var(--app-bg)] text-[var(--app-text-primary)] focus:outline-none focus:border-[var(--app-accent)] transition-colors"
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
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-[var(--app-border-subtle)] bg-[var(--app-bg)] text-[var(--app-text-primary)] focus:outline-none focus:border-[var(--app-accent)] transition-colors"
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
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-[var(--app-border-subtle)] bg-[var(--app-bg)] text-[var(--app-text-primary)] focus:outline-none focus:border-[var(--app-accent)] transition-colors"
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
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-[var(--app-border-subtle)] bg-[var(--app-bg)] text-[var(--app-text-primary)] focus:outline-none focus:border-[var(--app-accent)] transition-colors"
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

          {/* Typography & Alignment Group */}
          <div className="pt-2 border-t border-[var(--app-border-subtle)] flex flex-col gap-3">
            <label className="text-[11px] font-mono uppercase tracking-wider text-[var(--app-text-secondary)] font-semibold">
              Typography &amp; Layout
            </label>
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              <button
                onClick={() => setFontFamily('editorial')}
                className={`py-1.5 rounded-md border text-center transition-colors cursor-pointer ${
                  fontFamily === 'editorial'
                    ? 'bg-[var(--app-accent)] border-[var(--app-accent)] text-[var(--app-accent-ink)] font-semibold'
                    : 'border-[var(--app-border-subtle)] text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)]'
                }`}
              >
                Serif
              </button>
              <button
                onClick={() => setFontFamily('sans')}
                className={`py-1.5 rounded-md border text-center transition-colors cursor-pointer ${
                  fontFamily === 'sans'
                    ? 'bg-[var(--app-accent)] border-[var(--app-accent)] text-[var(--app-accent-ink)] font-semibold'
                    : 'border-[var(--app-border-subtle)] text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)]'
                }`}
              >
                Sans
              </button>
              <button
                onClick={() => setFontFamily('mono')}
                className={`py-1.5 rounded-md border text-center transition-colors cursor-pointer ${
                  fontFamily === 'mono'
                    ? 'bg-[var(--app-accent)] border-[var(--app-accent)] text-[var(--app-accent-ink)] font-semibold'
                    : 'border-[var(--app-border-subtle)] text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)]'
                }`}
              >
                Mono
              </button>
            </div>

            {mode === 'quote' && (
              <div className="flex flex-col gap-1">
                <label htmlFor="creator-font-size" className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-[var(--app-text-secondary)]">
                  <span>Quote size</span><span>{fontSize}px</span>
                </label>
                <input id="creator-font-size" type="range" min="14" max="48" step="1" value={fontSize} onChange={(event) => setFontSize(Number(event.target.value))} className="w-full accent-[var(--app-accent)]" />
              </div>
            )}

            {/* Alignment Buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setTextAlign('left')}
                className={`flex-1 py-1 rounded border flex items-center justify-center cursor-pointer transition-colors ${
                  textAlign === 'left'
                    ? 'bg-[var(--app-accent)] border-[var(--app-accent)] text-[var(--app-accent-ink)]'
                    : 'border-[var(--app-border-subtle)] text-[var(--app-text-secondary)]'
                }`}
                title="Left Align"
              >
                <AlignLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTextAlign('center')}
                className={`flex-1 py-1 rounded border flex items-center justify-center cursor-pointer transition-colors ${
                  textAlign === 'center'
                    ? 'bg-[var(--app-accent)] border-[var(--app-accent)] text-[var(--app-accent-ink)]'
                    : 'border-[var(--app-border-subtle)] text-[var(--app-text-secondary)]'
                }`}
                title="Center Align"
              >
                <AlignCenter className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTextAlign('right')}
                className={`flex-1 py-1 rounded border flex items-center justify-center cursor-pointer transition-colors ${
                  textAlign === 'right'
                    ? 'bg-[var(--app-accent)] border-[var(--app-accent)] text-[var(--app-accent-ink)]'
                    : 'border-[var(--app-border-subtle)] text-[var(--app-text-secondary)]'
                }`}
                title="Right Align"
              >
                <AlignRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </aside>

        {/* Center Canvas Stage */}
        <main
          className="flex-1 p-4 sm:p-8 md:p-12 flex flex-col items-center justify-center overflow-auto relative bg-[var(--app-surface-secondary)]"
        >
          {/* Subtle feedback toast */}
          {feedbackMessage && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-3 py-1.5 rounded-md bg-[var(--app-surface)] border border-[var(--app-border-subtle)] text-xs text-[var(--app-text-primary)] shadow-md animate-fade-in flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--app-accent)]" />
              <span>{feedbackMessage}</span>
            </div>
          )}

          {is3DMode && (
            <div className="w-full h-full min-h-[380px] flex flex-col items-center justify-center">
              <div
                className="relative w-full max-w-md h-[420px]"
              >
                <div ref={threeMountRef} className="h-full w-full cursor-grab active:cursor-grabbing" />
                <ThreeDPreviewControls controllerRef={threeStageRef} />
              </div>
              <span className="text-[11px] font-mono text-[var(--app-text-secondary)] mt-2">
                Drag to rotate · Scroll or pinch to zoom
              </span>
            </div>
          )}
          <div
            aria-hidden={is3DMode}
            className={`w-full flex items-center justify-center p-2 ${is3DMode ? 'pointer-events-none absolute -left-[10000px] top-0' : ''}`}
          >
              <div
                ref={cardRef}
                style={{
                  backgroundColor: currentPalette.bg,
                  color: currentPalette.ink,
                }}
                className={`w-full ${getAspectDimensions()} p-6 sm:p-8 rounded-xl shadow-md transition-colors duration-200 flex flex-col justify-between border border-black/15 overflow-hidden relative select-text`}
              >
                {/* Subtle paper grain texture */}
                <div className="absolute inset-0 card-noise opacity-25 pointer-events-none" />

                {mode === 'quote' ? (
                  <>
                    {/* Header Tag Bar */}
                    <div className="flex items-center justify-between pb-3 border-b border-current/15 text-[10px] font-mono tracking-wider opacity-75 relative z-10">
                      <span className="font-semibold tracking-wider uppercase">{tag}</span>
                      <span className="px-1.5 py-0.5 rounded border border-current/25 font-mono text-[9px] font-bold">
                        {currentPalette.badge}
                      </span>
                    </div>

                    {/* Central Quote Body */}
                    <div className="my-auto py-4 relative z-10">
                      <p
                        className={`text-xl sm:text-2xl leading-relaxed tracking-tight ${
                          fontFamily === 'editorial'
                            ? 'font-editorial'
                            : fontFamily === 'mono'
                            ? 'font-mono text-base'
                            : 'font-sans font-medium'
                        }`}
                      style={{ textAlign, fontSize: `${quote.length > 180 ? Math.max(14, Math.floor(fontSize * Math.sqrt(180 / quote.length))) : fontSize}px` }}
                      >
                        {quote}
                      </p>
                    </div>

                    {/* Footer Attribution */}
                    <div className="pt-3 border-t border-current/15 flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-1.5">
                        <span className="opacity-50 text-xs">—</span>
                        <span className="text-xs font-semibold opacity-90">{author}</span>
                      </div>
                      <span className="text-[9px] font-mono opacity-50 uppercase tracking-widest">
                        {currentPalette.name}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    {/* ID Pass Header */}
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="w-10 h-1.5 rounded-full bg-black/25 border border-current/30 mb-2" />
                      <div className="w-full flex items-center justify-between pb-2 border-b border-current/15 text-[9px] font-mono tracking-widest opacity-85">
                        <span className="font-bold uppercase tracking-wider">CREATIVE ID PASS</span>
                        <span className="px-1.5 py-0.5 rounded border border-current/25 font-bold text-[9px]">
                          {currentPalette.badge}
                        </span>
                      </div>
                    </div>

                    {/* ID Pass Body */}
                    <div className="my-auto py-3 flex items-center gap-4 relative z-10">
                      <div className="w-20 h-24 rounded-lg overflow-hidden border border-current/30 shadow-md shrink-0 bg-black/10">
                        <img
                          src={avatar}
                          alt="ID Portrait"
                          className="w-full h-full object-cover grayscale contrast-125"
                        />
                      </div>

                      <div className="flex-1 flex flex-col gap-1.5 font-mono text-xs">
                        <div>
                          <span className="text-[8px] uppercase tracking-wider opacity-60 block">NAME</span>
                          <span className="font-bold text-sm block leading-tight">{idName}</span>
                        </div>
                        <div>
                          <span className="text-[8px] uppercase tracking-wider opacity-60 block">ROLE</span>
                          <span className="text-xs opacity-90 block">{idRole}</span>
                        </div>
                        <div>
                          <span className="text-[8px] uppercase tracking-wider opacity-60 block">STATUS</span>
                          <span className="text-[10px] font-semibold opacity-80 block tracking-wide">
                            {idClearance}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* ID Pass Barcode Footer */}
                    <div className="pt-2 border-t border-current/15 flex items-center justify-between text-[9px] font-mono opacity-75 relative z-10">
                      <span className="tracking-tight font-bold">||||| | |||| ||| |||||||</span>
                      <span className="uppercase font-bold tracking-widest text-[8px]">VERIFIED PASS</span>
                    </div>
                  </>
                )}
              </div>
          </div>
        </main>
      </div>
    </div>
  );
};
