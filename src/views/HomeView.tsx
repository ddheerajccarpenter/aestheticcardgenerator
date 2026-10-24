import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { CardTemplate } from '../types/card';
import { PRESET_TEMPLATES } from '../data/templates';
import { updatePageSEO } from '../utils/seo';
import { toPng } from 'html-to-image';
import {
  ArrowRight,
  Check,
  ChevronDown,
  Layers,
  LayoutTemplate,
  PenTool,
  Plus,
  ShieldCheck,
  Sliders,
  Download,
  Copy,
} from 'lucide-react';
import { ASSET_AVATARS } from '../data/canvasAssets';
import { SquareDuotoneIcon } from '../components/SquareDuotoneIcon';
import { createThreeCardPreviewScene } from '../engines/threeCardStage';
import { UnifiedCardThumbnail } from '../components/UnifiedCardThumbnail';
import { getBrandedExportFilename } from '../engines/brandedExportAndThreePng';

interface HomeViewProps {
  onOpenEditorWithTemplate?: (template: CardTemplate) => void;
  onNavigateToEditor?: () => void;
  onNavigate?: (path: string) => void;
  theme?: 'dark' | 'light';
  onOpenGuide?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  theme = 'dark',
  onOpenEditorWithTemplate,
}) => {
  const isLight = theme === 'light';

  useEffect(() => {
    updatePageSEO({
      title: 'ACG — Aesthetic Card Generator | Generate without Internet',
      description:
        'Create beautiful cards, posters, and passes fully in your browser. 100% offline, local-first canvas, zero cloud tracking, up to 16K export.',
      canonicalPath: '/',
      ogType: 'website',
    });
  }, []);

  // Mobile accordion disclosure states (matching wireframe)
  const [aboutCanvasOpen, setAboutCanvasOpen] = useState(false);
  const [howToUseOpen, setHowToUseOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);

  // Live interactive canvas preview state
  const heroCardRef = useRef<HTMLDivElement>(null);
  const threeMountRef = useRef<HTMLDivElement>(null);
  const threeStageRef = useRef<any>(null);
  const lastHeroModeRef = useRef<string>('quote');
  const [heroMode, setHeroMode] = useState<'quote' | 'id'>('quote');
  const [heroPaletteIndex, setHeroPaletteIndex] = useState(0);
  const [copiedHero, setCopiedHero] = useState(false);
  const [isDownloadingHero, setIsDownloadingHero] = useState(false);
  const [is3DMode, setIs3DMode] = useState(false);

  // Directly editable quote fields
  const [heroQuote, setHeroQuote] = useState(
    '“In the depth of winter, I finally learned that within me there lay an invincible summer.”'
  );
  const [heroAuthor, setHeroAuthor] = useState('Albert Camus — Return to Tipasa');
  const [heroTag, setHeroTag] = useState('EDITORIAL NO. 04');

  // ID Mode editable fields
  const [heroIdName, setHeroIdName] = useState('Dan Valentini');
  const [heroIdRole, setHeroIdRole] = useState('Vision Architect');
  const [heroIdClearance, setHeroIdClearance] = useState('ALL-ACCESS • TIER 01');

  // Palette presets for the canvas preview
  const heroPalettes = [
    {
      id: 'albert-cream',
      name: 'Archival Linen',
      bg: '#fbf9f4',
      ink: '#1c1b18',
      badge: 'ARCHIVAL',
      accent: '#2a2825',
      surface: 'woven-canvas-linen',
    },
    {
      id: 'obsidian',
      name: 'Obsidian Dark',
      bg: '#18191c',
      ink: '#f5f5f7',
      badge: 'MIDNIGHT',
      accent: '#f5f5f7',
      surface: 'warm-nano-texture-matte',
    },
    {
      id: 'soft-celadon',
      name: 'Soft Celadon',
      bg: '#e2ecf9',
      ink: '#1e293b',
      badge: 'CELADON',
      accent: '#1e293b',
      surface: 'cold-press-watercolor',
    },
    {
      id: 'y2k-cyber',
      name: 'Y2K Acid Studio',
      bg: '#e0e722',
      ink: '#111417',
      badge: 'ACID 90s',
      accent: '#ff007f',
      surface: 'rainbow-hologram-foil',
    },
  ];

  const currentHeroPalette = heroPalettes[heroPaletteIndex];

  // Three.js 3D View mounting
  useEffect(() => {
    if (!is3DMode || !threeMountRef.current || !heroCardRef.current) {
      if (threeStageRef.current) {
        threeStageRef.current();
        threeStageRef.current = null;
      }
      return;
    }

    let isMounted = true;
    const timer = setTimeout(() => {
      if (!heroCardRef.current) return;
      toPng(heroCardRef.current, { pixelRatio: 1.5 }).then((dataUrl) => {
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
            if (threeStageRef.current && lastHeroModeRef.current === heroMode) {
              threeStageRef.current.updateTexture(off, currentHeroPalette.surface);
            } else {
              if (threeStageRef.current) threeStageRef.current();
              lastHeroModeRef.current = heroMode;
              threeStageRef.current = createThreeCardPreviewScene(
                threeMountRef.current,
                off,
                heroMode === 'quote' ? 4 : 2,
                heroMode === 'quote' ? 5 : 3,
                currentHeroPalette.surface
              );
            }
          }
        };
        img.src = dataUrl;
      });
    }, 180);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [is3DMode, heroMode, currentHeroPalette, heroQuote, heroAuthor, heroTag, heroIdName, heroIdRole, heroIdClearance]);

  useEffect(() => {
    return () => {
      if (threeStageRef.current) {
        threeStageRef.current();
        threeStageRef.current = null;
      }
    };
  }, []);

  const handleCopyHero = () => {
    const textToCopy =
      heroMode === 'quote'
        ? `${heroQuote}\n— ${heroAuthor}`
        : `${heroIdName} • ${heroIdRole} • ${heroIdClearance}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedHero(true);
    setTimeout(() => setCopiedHero(false), 2000);
  };

  const handleDownloadHeroPng = async () => {
    if (!heroCardRef.current) return;
    setIsDownloadingHero(true);
    try {
      const dataUrl = await toPng(heroCardRef.current, {
        pixelRatio: 2,
        cacheBust: true,
      });
      const link = document.createElement('a');
      link.download = getBrandedExportFilename('png');
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export hero preview card', err);
    } finally {
      setIsDownloadingHero(false);
    }
  };

  // Wireframe's 8 Curated Categories
  const wireframeCategoryCards = useMemo(() => {
    const findTemplate = (id: string) => PRESET_TEMPLATES.find((t) => t.id === id);

    return [
      {
        id: 'blank',
        label: 'Blank Card',
        tag: 'CREATE',
        isBlank: true,
        link: '/canvas?blank=true',
        description: 'Start from scratch with custom dimensions',
      },
      {
        id: 'quote',
        label: 'Quote',
        tag: 'EDITORIAL',
        template: findTemplate('camus-summer') || PRESET_TEMPLATES[0],
      },
      {
        id: 'minimal',
        label: 'Minimal',
        tag: 'SWISS',
        template: findTemplate('dieter-rams-minimal') || PRESET_TEMPLATES[1],
      },
      {
        id: 'aesthetic',
        label: 'Aesthetic',
        tag: 'ID PASS',
        template: findTemplate('id-jennie-crimson') || PRESET_TEMPLATES[2],
      },
      {
        id: 'nature',
        label: 'Nature',
        tag: 'BOTANICAL',
        template: findTemplate('emily-dickinson-mint') || PRESET_TEMPLATES[3],
      },
      {
        id: 'dark',
        label: 'Dark',
        tag: 'OBSIDIAN',
        template: findTemplate('obsidian-monochrome') || PRESET_TEMPLATES[4],
      },
      {
        id: 'collage',
        label: 'Collage',
        tag: 'CANVAS',
        template: findTemplate('id-darkwave-sound') || PRESET_TEMPLATES[5],
      },
      {
        id: 'poster',
        label: 'Poster',
        tag: 'SOCIAL 4:5',
        template: findTemplate('travel-license-pass') || PRESET_TEMPLATES[6],
      },
    ];
  }, []);

  return (
    <div className={`w-full pt-14 sm:pt-16 transition-colors duration-200 ${isLight ? 'text-[#101114]' : 'text-[#f4f1ea]'}`}>
      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 1. HERO SECTION (Wireframe: Panoramic Landscape + Headline + CTA)   */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <section className="relative w-full px-4 md:px-8 pt-8 md:pt-14 pb-10 flex flex-col items-center text-center overflow-hidden">
        {/* Subtle Architectural Landscape Contour Background (Honoring wireframe mountain motif) */}
        <div className="absolute inset-0 pointer-events-none opacity-25 overflow-hidden -z-10 flex items-center justify-center">
          <svg
            className="w-full max-w-5xl h-auto transition-opacity"
            viewBox="0 0 1000 320"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,280 C200,240 320,160 500,200 C680,240 800,120 1000,180 L1000,320 L0,320 Z"
              fill={isLight ? '#e2e8f0' : '#1e232b'}
              fillOpacity="0.4"
            />
            <path
              d="M0,220 C250,140 400,260 620,170 C780,100 880,190 1000,130 L1000,320 L0,320 Z"
              fill={isLight ? '#cbd5e1' : '#161920'}
              fillOpacity="0.3"
            />
            <circle cx="500" cy="80" r="36" fill={isLight ? '#e2e8f0' : '#262c36'} fillOpacity="0.4" />
          </svg>
        </div>

        {/* Top Feature Pill */}
        <div
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold mb-4 transition-all ${
            isLight
              ? 'bg-white/80 border-[#cbd5e1] text-[#334155] shadow-xs'
              : 'bg-[#181d24]/80 border-[#262c36] text-[#AAA9A4] shadow-xs'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-[#0ecb81]" />
          <span className="font-subheading">100% Offline • Zero Cloud Tracking</span>
        </div>

        {/* Wireframe Headline: Generate without Internet */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold max-w-4xl tracking-tight mb-3 leading-[1.12] font-heading">
          Generate without Internet
        </h1>

        {/* Wireframe Subtitle: Create beautiful cards, posters and more. Fully in your browser. */}
        <p className={`text-sm sm:text-base max-w-xl mx-auto mb-6 leading-relaxed font-body ${
          isLight ? 'text-[#475569]' : 'text-[#8e95a5]'
        }`}>
          Create beautiful cards, posters and more. Fully in your browser.
        </p>

        {/* Wireframe Primary Action: Start Creating → */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href="/create"
            className="studio-btn-primary group shadow-lg px-6 py-3 rounded-xl text-sm font-bold inline-flex items-center gap-2"
          >
            <span>Start Creating</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </a>

          <a
            href="/canvas"
            className="studio-btn-secondary px-5 py-3 rounded-xl text-sm font-semibold inline-flex items-center gap-2"
          >
            <Layers className="w-4 h-4 opacity-75" />
            <span>Canvas Studio</span>
          </a>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 2. CENTRAL WORKSPACE: ABOUT CANVAS | CANVAS / PREVIEW | HOW TO USE  */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <section className={`w-full px-4 md:px-8 py-8 border-t ${isLight ? 'border-[#e2e8f0]' : 'border-[#1f242c]'}`}>
        <div className="max-w-7xl mx-auto">
          {/* DESKTOP LAYOUT (3-Column Wireframe Grid) */}
          <div className="hidden lg:grid grid-cols-12 gap-6 items-stretch">
            {/* Left Column: About Canvas */}
            <div
              className={`col-span-3 p-6 rounded-2xl border flex flex-col justify-between transition-all shadow-sm ${
                isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#14171d] border-[#262c36]'
              }`}
            >
              <div className="flex flex-col gap-3">
                <h2 className="text-lg font-bold font-heading">
                  About Canvas
                </h2>
                <p className={`text-xs leading-relaxed ${isLight ? 'text-[#475569]' : 'text-[#8e95a5]'}`}>
                  A simple and powerful canvas to create aesthetic cards, posters, social media graphics and more.
                </p>

                <ul className="flex flex-col gap-2.5 mt-3 text-xs">
                  <li className="flex items-center gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-[#0ecb81]/15 text-[#0ecb81] flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 stroke-[2.5]" />
                    </span>
                    <span>Works offline</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-[#0ecb81]/15 text-[#0ecb81] flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 stroke-[2.5]" />
                    </span>
                    <span>Easy to use</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-[#0ecb81]/15 text-[#0ecb81] flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 stroke-[2.5]" />
                    </span>
                    <span>Multiple templates</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-[#0ecb81]/15 text-[#0ecb81] flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 stroke-[2.5]" />
                    </span>
                    <span>Export in high quality</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-current/10 mt-6">
                <a
                  href="/create"
                  className="text-xs font-bold text-[#e2d9c8] hover:underline inline-flex items-center gap-1"
                >
                  <span>Open Creator</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Center Column: Canvas / Preview Area (DOMINANT 6 COLS) */}
            <div
              className={`col-span-6 p-5 rounded-2xl border flex flex-col gap-3 shadow-xl ${
                isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#14171d] border-[#262c36]'
              }`}
            >
              {/* Header row of the preview area */}
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-current/10">
                <div>
                  <h2 className="text-sm font-bold font-heading">
                    Canvas / Preview Area
                  </h2>
                  <span className={`text-[11px] ${isLight ? 'text-[#64748b]' : 'text-[#8e95a5]'}`}>
                    Your design will appear here
                  </span>
                </div>

                {/* Interactive Mode Toggle */}
                <div className="flex items-center gap-1 bg-black/10 dark:bg-black/30 p-1 rounded-lg">
                  <button
                    onClick={() => setHeroMode('quote')}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                      heroMode === 'quote'
                        ? isLight
                          ? 'bg-white text-[#111417] shadow-xs font-bold'
                          : 'bg-[#E2D9C8] text-[#111417] shadow-xs font-bold'
                        : isLight
                        ? 'text-[#64748b] hover:text-[#111417]'
                        : 'text-[#94a3b8] hover:text-[#f4f1ea]'
                    }`}
                  >
                    Quote
                  </button>

                  <button
                    onClick={() => setHeroMode('id')}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                      heroMode === 'id'
                        ? isLight
                          ? 'bg-white text-[#111417] shadow-xs font-bold'
                          : 'bg-[#E2D9C8] text-[#111417] shadow-xs font-bold'
                        : isLight
                        ? 'text-[#64748b] hover:text-[#111417]'
                        : 'text-[#94a3b8] hover:text-[#f4f1ea]'
                    }`}
                  >
                    ID Pass
                  </button>
                </div>
              </div>

              {/* Sub-toolbar: Palettes + 3D + Actions */}
              <div className="flex items-center justify-between gap-2 py-1">
                {/* Palette dots */}
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${isLight ? 'text-[#64748b]' : 'text-[#8e95a5]'}`}>
                    Palette:
                  </span>
                  {heroPalettes.map((pal, idx) => (
                    <button
                      key={pal.id}
                      onClick={() => setHeroPaletteIndex(idx)}
                      className={`w-4.5 h-4.5 rounded-md border border-black/20 dark:border-white/20 shadow-xs transition-all cursor-pointer relative ${
                        heroPaletteIndex === idx
                          ? 'ring-2 ring-[#E2D9C8] scale-110'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: pal.bg }}
                      title={pal.name}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setIs3DMode((prev) => !prev)}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                      is3DMode
                        ? isLight
                          ? 'bg-[#111417] text-white border-[#111417]'
                          : 'bg-[#E2D9C8] text-[#111417] border-[#E2D9C8]'
                        : isLight
                        ? 'border-slate-200 text-[#475569] hover:bg-slate-100'
                        : 'border-[#2e3543] text-[#cbd5e1] bg-[#1a1e27] hover:bg-[#222733]'
                    }`}
                    title="Toggle 3D"
                  >
                    <SquareDuotoneIcon name="cube" size="sm" variant={is3DMode ? 'dark' : isLight ? 'default' : 'light'} />
                    <span>3D</span>
                  </button>

                  <button
                    onClick={handleCopyHero}
                    className={`p-1 rounded-lg border transition-colors cursor-pointer ${
                      copiedHero
                        ? 'border-[#0ecb81] bg-[#0ecb81]/20 text-[#0ecb81]'
                        : isLight
                        ? 'border-slate-200 hover:bg-slate-100 text-[#475569]'
                        : 'border-[#2e3543] hover:bg-[#222733] text-[#cbd5e1] bg-[#1a1e27]'
                    }`}
                    title={copiedHero ? 'Copied to clipboard!' : 'Copy Text'}
                  >
                    {copiedHero ? <Check className="w-3.5 h-3.5 text-[#0ecb81]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={handleDownloadHeroPng}
                    disabled={isDownloadingHero}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                      isLight
                        ? 'bg-[#111417] text-white hover:bg-[#222730]'
                        : 'bg-[#E2D9C8] text-[#111417] hover:bg-[#ECE5D8]'
                    }`}
                    title="Download Card"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export</span>
                  </button>
                </div>
              </div>

              {/* Central Canvas Preview Surface */}
              <div
                className={`relative w-full min-h-[300px] flex-1 flex items-center justify-center p-4 rounded-xl overflow-hidden border ${
                  isLight ? 'bg-slate-100 border-[#e2e8f0]' : 'bg-[#0f1116] border-[#222731]'
                }`}
              >
                {is3DMode ? (
                  <div ref={threeMountRef} className="w-full h-[320px] flex items-center justify-center" />
                ) : (
                  <div
                    ref={heroCardRef}
                    style={{
                      backgroundColor: currentHeroPalette.bg,
                      color: currentHeroPalette.ink,
                    }}
                    className="relative w-full max-w-sm min-h-[250px] p-5 rounded-xl transition-colors duration-200 shadow-xl flex flex-col justify-between border border-black/10 overflow-hidden"
                  >
                    <div className="absolute inset-0 card-noise opacity-25 pointer-events-none" />

                    {heroMode === 'quote' ? (
                      <>
                        <div className="flex items-center justify-between pb-2 border-b border-current/15 text-[10px] font-mono tracking-wider opacity-75 relative z-10">
                          <input
                            type="text"
                            value={heroTag}
                            onChange={(e) => setHeroTag(e.target.value)}
                            className="bg-transparent border-b border-transparent hover:border-current/30 focus:border-current/60 outline-none max-w-[160px] font-mono"
                          />
                          <span className="px-1.5 py-0.5 rounded border border-current/25 shrink-0 font-mono text-[9px] font-bold">
                            {currentHeroPalette.badge}
                          </span>
                        </div>

                        <div className="my-3 relative z-10">
                          <textarea
                            value={heroQuote}
                            onChange={(e) => setHeroQuote(e.target.value)}
                            rows={3}
                            className="w-full bg-transparent resize-none border-b border-dashed border-transparent hover:border-current/25 focus:border-current/50 outline-none font-editorial text-lg leading-relaxed tracking-tight text-inherit"
                          />
                        </div>

                        <div className="pt-2 border-t border-current/15 flex items-center justify-between relative z-10">
                          <div className="flex items-center gap-1">
                            <span className="opacity-60 text-xs">—</span>
                            <input
                              type="text"
                              value={heroAuthor}
                              onChange={(e) => setHeroAuthor(e.target.value)}
                              className="bg-transparent border-b border-transparent hover:border-current/30 focus:border-current/60 outline-none text-xs font-semibold opacity-85 text-inherit max-w-[180px]"
                            />
                          </div>
                          <span className="text-[9px] font-mono opacity-50 uppercase tracking-wider">
                            {currentHeroPalette.name}
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="relative z-10 flex flex-col items-center">
                          <div className="w-8 h-1.5 rounded-full bg-black/30 border border-current/40 mb-1.5" />
                          <div className="w-full flex items-center justify-between pb-1.5 border-b border-current/15 text-[9px] font-mono tracking-wider opacity-85">
                            <span className="font-bold tracking-widest uppercase">CREATIVE PASS</span>
                            <span className="px-1 py-0.2 rounded bg-black/10 border border-current/30 font-bold">
                              {currentHeroPalette.badge}
                            </span>
                          </div>
                        </div>

                        <div className="my-2.5 flex items-center gap-3 relative z-10">
                          <div className="w-16 h-20 rounded-lg overflow-hidden border border-current/30 shadow-md shrink-0 relative bg-black/10">
                            <img
                              src={ASSET_AVATARS.grungeDan}
                              alt="Portrait"
                              className="w-full h-full object-cover grayscale contrast-125"
                            />
                          </div>

                          <div className="flex-1 flex flex-col gap-1 font-mono text-xs">
                            <div>
                              <span className="text-[8px] uppercase tracking-wider opacity-60 block">NAME</span>
                              <input
                                type="text"
                                value={heroIdName}
                                onChange={(e) => setHeroIdName(e.target.value)}
                                className="w-full bg-transparent font-bold text-xs border-b border-transparent hover:border-current/30 focus:border-current/60 outline-none text-inherit"
                              />
                            </div>
                            <div>
                              <span className="text-[8px] uppercase tracking-wider opacity-60 block">ROLE</span>
                              <input
                                type="text"
                                value={heroIdRole}
                                onChange={(e) => setHeroIdRole(e.target.value)}
                                className="w-full bg-transparent text-[11px] border-b border-transparent hover:border-current/30 focus:border-current/60 outline-none opacity-85 text-inherit"
                              />
                            </div>
                            <div>
                              <span className="text-[8px] uppercase tracking-wider opacity-60 block">STATUS</span>
                              <input
                                type="text"
                                value={heroIdClearance}
                                onChange={(e) => setHeroIdClearance(e.target.value)}
                                className="w-full bg-transparent font-semibold text-[10px] border-b border-transparent hover:border-current/30 focus:border-current/60 outline-none text-inherit"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-current/15 flex items-center justify-between text-[9px] font-mono opacity-80 relative z-10">
                          <span className="font-bold tracking-tight">||||| | |||| ||| |||||||</span>
                          <span className="uppercase font-bold tracking-wider">VERIFIED</span>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: How and why to use */}
            <div
              className={`col-span-3 p-6 rounded-2xl border flex flex-col justify-between transition-all shadow-sm ${
                isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#14171d] border-[#262c36]'
              }`}
            >
              <div className="flex flex-col gap-3">
                <h2 className="text-lg font-bold font-heading">
                  How and why to use
                </h2>
                <p className={`text-xs leading-relaxed ${isLight ? 'text-[#475569]' : 'text-[#8e95a5]'}`}>
                  Use templates or start from scratch. Customize text, images, colors and more. Perfect for social media, personal use or creative projects.
                </p>

                <ol className="flex flex-col gap-3 mt-3 text-xs">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full border border-current/20 flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">
                      1
                    </span>
                    <span>Choose a template or start blank</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full border border-current/20 flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">
                      2
                    </span>
                    <span>Customize your design</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full border border-current/20 flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">
                      3
                    </span>
                    <span>Export and share</span>
                  </li>
                </ol>
              </div>

              <div className="pt-4 border-t border-current/10 mt-6">
                <a
                  href="/templates"
                  className="text-xs font-bold text-[#e2d9c8] hover:underline inline-flex items-center gap-1"
                >
                  <span>Browse Templates</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* MOBILE LAYOUT (Canvas First, then Collapsible Accordions) */}
          <div className="lg:hidden flex flex-col gap-4">
            {/* 1. Mobile Canvas / Preview Area (PLACED FIRST AT FULL WIDTH!) */}
            <div
              className={`p-4 rounded-2xl border flex flex-col gap-3 shadow-md ${
                isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#14171d] border-[#262c36]'
              }`}
            >
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-current/10">
                <div>
                  <h2 className="text-sm font-bold font-heading">
                    Canvas / Preview Area
                  </h2>
                  <span className={`text-[10px] ${isLight ? 'text-[#64748b]' : 'text-[#8e95a5]'}`}>
                    Your design will appear here
                  </span>
                </div>

                <div className="flex items-center gap-1 bg-black/10 dark:bg-black/30 p-1 rounded-lg">
                  <button
                    onClick={() => setHeroMode('quote')}
                    className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      heroMode === 'quote'
                        ? isLight
                          ? 'bg-white text-[#111417] font-bold shadow-xs'
                          : 'bg-[#E2D9C8] text-[#111417] font-bold shadow-xs'
                        : 'opacity-70'
                    }`}
                  >
                    Quote
                  </button>
                  <button
                    onClick={() => setHeroMode('id')}
                    className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      heroMode === 'id'
                        ? isLight
                          ? 'bg-white text-[#111417] font-bold shadow-xs'
                          : 'bg-[#E2D9C8] text-[#111417] font-bold shadow-xs'
                        : 'opacity-70'
                    }`}
                  >
                    ID Pass
                  </button>
                </div>
              </div>

              {/* Render Canvas */}
              <div
                className={`relative w-full min-h-[260px] flex items-center justify-center p-3 rounded-xl overflow-hidden border ${
                  isLight ? 'bg-slate-100 border-[#e2e8f0]' : 'bg-[#0f1116] border-[#222731]'
                }`}
              >
                <div
                  ref={heroCardRef}
                  style={{
                    backgroundColor: currentHeroPalette.bg,
                    color: currentHeroPalette.ink,
                  }}
                  className="relative w-full max-w-xs min-h-[230px] p-4 rounded-xl shadow-lg flex flex-col justify-between border border-black/10 overflow-hidden"
                >
                  <div className="absolute inset-0 card-noise opacity-25 pointer-events-none" />

                  {heroMode === 'quote' ? (
                    <>
                      <div className="flex items-center justify-between pb-1.5 border-b border-current/15 text-[9px] font-mono opacity-75 relative z-10">
                        <span>{heroTag}</span>
                        <span className="px-1 rounded border border-current/25 font-bold">
                          {currentHeroPalette.badge}
                        </span>
                      </div>
                      <div className="my-2 relative z-10">
                        <p className="font-editorial text-base leading-snug">
                          {heroQuote}
                        </p>
                      </div>
                      <div className="pt-1.5 border-t border-current/15 flex items-center justify-between text-[10px] relative z-10">
                        <span className="opacity-80 font-semibold">— {heroAuthor}</span>
                        <span className="opacity-50 text-[9px] font-mono">{currentHeroPalette.name}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between pb-1 border-b border-current/15 text-[8px] font-mono opacity-80 relative z-10">
                        <span className="font-bold uppercase">CREATIVE PASS</span>
                        <span className="px-1 rounded bg-black/10 font-bold">{currentHeroPalette.badge}</span>
                      </div>
                      <div className="my-2 flex items-center gap-2.5 relative z-10 font-mono text-[10px]">
                        <img
                          src={ASSET_AVATARS.grungeDan}
                          alt="Avatar"
                          className="w-14 h-16 rounded object-cover grayscale shrink-0 border border-current/30"
                        />
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-xs">{heroIdName}</span>
                          <span className="opacity-80">{heroIdRole}</span>
                          <span className="text-[9px] opacity-70">{heroIdClearance}</span>
                        </div>
                      </div>
                      <div className="pt-1 border-t border-current/15 flex items-center justify-between text-[8px] font-mono opacity-80 relative z-10">
                        <span>||||| |||| ||</span>
                        <span className="font-bold">VERIFIED</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-1">
                  {heroPalettes.map((pal, idx) => (
                    <button
                      key={pal.id}
                      onClick={() => setHeroPaletteIndex(idx)}
                      className={`w-4 h-4 rounded-md border border-black/20 ${heroPaletteIndex === idx ? 'ring-2 ring-[#e2d9c8]' : 'opacity-70'}`}
                      style={{ backgroundColor: pal.bg }}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href="/create"
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#e2d9c8] text-[#111417] inline-flex items-center gap-1 shadow-xs"
                  >
                    <PenTool className="w-3 h-3" />
                    <span>Open Editor</span>
                  </a>
                </div>
              </div>
            </div>

            {/* 2. Mobile Collapsible: About Canvas */}
            <div
              className={`rounded-xl border overflow-hidden transition-all ${
                isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#14171d] border-[#262c36]'
              }`}
            >
              <button
                onClick={() => setAboutCanvasOpen((prev) => !prev)}
                className="w-full p-4 text-left font-bold text-sm flex items-center justify-between cursor-pointer"
                aria-expanded={aboutCanvasOpen}
              >
                <span className="font-heading">About Canvas</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${aboutCanvasOpen ? 'rotate-180' : ''}`} />
              </button>

              {aboutCanvasOpen && (
                <div className={`px-4 pb-4 text-xs leading-relaxed border-t pt-3 ${
                  isLight ? 'text-[#475569] border-[#e2e8f0]' : 'text-[#8e95a5] border-[#222731]'
                }`}>
                  <p className="mb-3">
                    A simple and powerful canvas to create aesthetic cards, posters, social media graphics and more.
                  </p>
                  <ul className="flex flex-col gap-2">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#0ecb81]" />
                      <span>Works offline</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#0ecb81]" />
                      <span>Easy to use</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#0ecb81]" />
                      <span>Multiple templates</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#0ecb81]" />
                      <span>Export in high quality</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* 3. Mobile Collapsible: How and why to use */}
            <div
              className={`rounded-xl border overflow-hidden transition-all ${
                isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#14171d] border-[#262c36]'
              }`}
            >
              <button
                onClick={() => setHowToUseOpen((prev) => !prev)}
                className="w-full p-4 text-left font-bold text-sm flex items-center justify-between cursor-pointer"
                aria-expanded={howToUseOpen}
              >
                <span className="font-heading">How and why to use</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${howToUseOpen ? 'rotate-180' : ''}`} />
              </button>

              {howToUseOpen && (
                <div className={`px-4 pb-4 text-xs leading-relaxed border-t pt-3 ${
                  isLight ? 'text-[#475569] border-[#e2e8f0]' : 'text-[#8e95a5] border-[#222731]'
                }`}>
                  <p className="mb-3">
                    Use templates or start from scratch. Customize text, images, colors and more. Perfect for social media, personal use or creative projects.
                  </p>
                  <ol className="flex flex-col gap-2">
                    <li className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full border border-current/30 flex items-center justify-center font-mono text-[9px] font-bold">1</span>
                      <span>Choose a template or start blank</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full border border-current/30 flex items-center justify-center font-mono text-[9px] font-bold">2</span>
                      <span>Customize your design</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full border border-current/30 flex items-center justify-center font-mono text-[9px] font-bold">3</span>
                      <span>Export and share</span>
                    </li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 3. TEMPLATES SECTION (Wireframe: Header + View All + 8 Categories)  */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <section className={`w-full px-4 md:px-8 py-10 border-t ${isLight ? 'border-[#e2e8f0]' : 'border-[#1f242c]'}`}>
        <div className="max-w-7xl mx-auto flex flex-col gap-6">
          {/* Wireframe Header Row: "Templates" on left, "View All →" on right */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl md:text-2xl font-bold font-heading">
                Templates
              </h2>
            </div>
            <a
              href="/templates"
              className={`text-xs font-bold inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border transition-all ${
                isLight
                  ? 'bg-slate-50 border-[#cbd5e1] text-[#111417] hover:bg-slate-100'
                  : 'bg-[#181d24] border-[#2e3543] text-[#e2d9c8] hover:bg-[#202732]'
              }`}
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Wireframe 8-Category Grid: Blank, Quote, Minimal, Aesthetic, Nature, Dark, Collage, Poster */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
            {wireframeCategoryCards.map((item) => {
              if (item.isBlank) {
                return (
                  <a
                    key={item.id}
                    href={item.link}
                    className={`group rounded-xl border border-dashed p-3 sm:p-4 flex flex-col items-center justify-center text-center transition-all duration-200 hover:-translate-y-0.5 cursor-pointer min-h-[140px] sm:min-h-[160px] ${
                      isLight
                        ? 'border-[#94a3b8] hover:border-[#111417] bg-white hover:bg-slate-50'
                        : 'border-[#384152] hover:border-[#e2d9c8] bg-[#14171d] hover:bg-[#181d24]'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <Plus className="w-4 h-4 text-[#e2d9c8]" />
                    </div>
                    <span className="text-xs font-bold font-heading block">{item.label}</span>
                    <span className="text-[10px] text-[#94a3b8] font-mono mt-0.5 uppercase tracking-wider">{item.tag}</span>
                  </a>
                );
              }

              const tmpl = item.template;
              if (!tmpl) return null;

              return (
                <a
                  key={item.id}
                  href={`/create?template=${tmpl.id}`}
                  onClick={(e) => {
                    if (onOpenEditorWithTemplate) {
                      e.preventDefault();
                      onOpenEditorWithTemplate(tmpl);
                    }
                  }}
                  className={`group rounded-xl border p-2 sm:p-2.5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 shadow-xs cursor-pointer min-h-[140px] sm:min-h-[160px] ${
                    isLight
                      ? 'bg-white border-[#e2e8f0] hover:border-[#94a3b8]'
                      : 'bg-[#14171d] border-[#262c36] hover:border-[#e2d9c8]/50'
                  }`}
                >
                  <div className="w-full aspect-square rounded-lg overflow-hidden border border-black/10 relative bg-black/10 mb-2">
                    <UnifiedCardThumbnail template={tmpl} isLight={isLight} />
                  </div>
                  <div className="text-center pb-1">
                    <span className="text-xs font-bold font-heading truncate block group-hover:text-[#e2d9c8] transition-colors">
                      {item.label}
                    </span>
                    <span className="text-[9px] text-[#94a3b8] font-mono uppercase tracking-wider block truncate">
                      {tmpl.title}
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 4. FEATURES SECTION (Wireframe: 4 Cards on Desktop / Mobile Box)    */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <section className={`w-full px-4 md:px-8 py-10 border-t ${isLight ? 'border-[#e2e8f0]' : 'border-[#1f242c]'}`}>
        <div className="max-w-7xl mx-auto flex flex-col gap-5">
          {/* Mobile Accordion Toggle for Features */}
          <div className="flex md:hidden items-center justify-between">
            <button
              onClick={() => setFeaturesOpen((prev) => !prev)}
              className="w-full flex items-center justify-between text-base font-bold font-heading cursor-pointer py-1"
            >
              <span>Features</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${featuresOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <div className="hidden md:block">
            <h2 className="text-xl md:text-2xl font-bold font-heading">
              Features
            </h2>
          </div>

          {/* 4 Feature Cards (Visible on Desktop, Collapsible or 2x2 on Mobile) */}
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${featuresOpen ? 'block' : 'hidden md:grid'}`}>
            {/* Feature 1: 100% Offline */}
            <div
              className={`p-5 rounded-2xl border flex items-start gap-3.5 transition-all ${
                isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#14171d] border-[#262c36]'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-[#0ecb81]/15 text-[#0ecb81] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold font-heading">
                  100% Offline
                </h3>
                <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-[#475569]' : 'text-[#8e95a5]'}`}>
                  Works directly in your browser. Zero cloud tracking.
                </p>
              </div>
            </div>

            {/* Feature 2: Multiple Templates */}
            <div
              className={`p-5 rounded-2xl border flex items-start gap-3.5 transition-all ${
                isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#14171d] border-[#262c36]'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-[#38bdf8]/15 text-[#38bdf8] flex items-center justify-center shrink-0">
                <LayoutTemplate className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold font-heading">
                  Multiple Templates
                </h3>
                <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-[#475569]' : 'text-[#8e95a5]'}`}>
                  Wide range of designs for quotes, passes &amp; posters.
                </p>
              </div>
            </div>

            {/* Feature 3: Easy Customization */}
            <div
              className={`p-5 rounded-2xl border flex items-start gap-3.5 transition-all ${
                isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#14171d] border-[#262c36]'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-[#e2d9c8]/15 text-[#e2d9c8] flex items-center justify-center shrink-0">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold font-heading">
                  Easy Customization
                </h3>
                <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-[#475569]' : 'text-[#8e95a5]'}`}>
                  Text, images, colors and 50+ procedural finishes.
                </p>
              </div>
            </div>

            {/* Feature 4: High Quality Export */}
            <div
              className={`p-5 rounded-2xl border flex items-start gap-3.5 transition-all ${
                isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#14171d] border-[#262c36]'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-[#ec4899]/15 text-[#ec4899] flex items-center justify-center shrink-0">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold font-heading">
                  High Quality Export
                </h3>
                <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-[#475569]' : 'text-[#8e95a5]'}`}>
                  Download in Retina, 4K Ultra-HD &amp; 16K extreme PNG.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
