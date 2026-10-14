import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { CardTemplate } from '../types/card';
import { PRESET_TEMPLATES } from '../data/templates';
import { updatePageSEO } from '../utils/seo';
import { toPng } from 'html-to-image';
import { ASSET_AVATARS } from '../data/canvasAssets';
import { SquareDuotoneIcon } from '../components/SquareDuotoneIcon';
import { TemplateComparisonModal } from '../components/TemplateComparisonModal';
import { TemplateComparisonDock } from '../components/TemplateComparisonDock';
import { createThreeCardPreviewScene } from '../engines/threeCardStage';
import { UnifiedCardThumbnail } from '../components/UnifiedCardThumbnail';

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
      title: 'Aesthetic Card Studio — Design Quote Cards, Posters, and Aesthetic IDs',
      description:
        'Set crisp typography on 50+ tactile paper and holographic surfaces, or build multi-layer cards in the studio. Runs 100% in your browser.',
      canonicalPath: '/',
      ogType: 'website',
    });
  }, []);

  // Live hero interactive mini-studio state
  const heroCardRef = useRef<HTMLDivElement>(null);
  const threeMountRef = useRef<HTMLDivElement>(null);
  const [heroMode, setHeroMode] = useState<'quote' | 'id'>('quote');
  const [heroPaletteIndex, setHeroPaletteIndex] = useState(0);
  const [copiedHero, setCopiedHero] = useState(false);
  const [isDownloadingHero, setIsDownloadingHero] = useState(false);
  const [is3DMode, setIs3DMode] = useState(false);

  // Directly editable hero content
  const [heroQuote, setHeroQuote] = useState(
    '“In the depth of winter, I finally learned that within me there lay an invincible summer.”'
  );
  const [heroAuthor, setHeroAuthor] = useState('Albert Camus — Return to Tipasa');
  const [heroTag, setHeroTag] = useState('FAVORITE LINES • NO. 04');

  // ID Mode editable fields
  const [heroIdName, setHeroIdName] = useState('Dan Valentini');
  const [heroIdRole, setHeroIdRole] = useState('Vision Architect & Producer');
  const [heroIdClearance, setHeroIdClearance] = useState('ALL-ACCESS CREW • TIER 01');

  // Templates showcase pagination (Top 4 initially, increment by +4)
  const [visibleCount, setVisibleCount] = useState(4);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Template comparison state
  const [selectedForCompare, setSelectedForCompare] = useState<CardTemplate[]>([]);
  const [comparisonModalOpen, setComparisonModalOpen] = useState(false);

  const heroPalettes = [
    {
      id: 'st-germain',
      name: 'St. Germain',
      bg: '#f4ede4',
      ink: '#2c2825',
      badge: 'EST. 1997',
      accent: '#2c2825',
      surface: 'cotton-rag-300gsm',
    },
    {
      id: 'warm-linen',
      name: 'Warm Linen',
      bg: '#fce7cf',
      ink: '#451a03',
      badge: 'ARCHIVAL',
      accent: '#451a03',
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
    if (!is3DMode || !threeMountRef.current || !heroCardRef.current) return;

    let cleanup: (() => void) | undefined;
    toPng(heroCardRef.current, { pixelRatio: 2 }).then((dataUrl) => {
      const img = new Image();
      img.onload = () => {
        const off = document.createElement('canvas');
        off.width = img.width;
        off.height = img.height;
        const ctx = off.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          if (threeMountRef.current) {
            cleanup = createThreeCardPreviewScene(
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

    return () => {
      if (cleanup) cleanup();
    };
  }, [is3DMode, heroMode, currentHeroPalette, heroQuote, heroAuthor, heroTag, heroIdName, heroIdRole]);

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
      link.download = heroMode === 'quote' ? 'quote-card-preview.png' : 'aesthetic-id-pass.png';
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export hero preview card', err);
    } finally {
      setIsDownloadingHero(false);
    }
  };

  const categories = [
    { id: 'all', label: 'All Curated Styles' },
    { id: 'id-card', label: '★ Aesthetic ID Cards' },
    { id: 'pastel', label: 'Cute & Pastel' },
    { id: 'vintage', label: 'Vintage & Retro' },
    { id: 'fan', label: 'Fan & Character' },
    { id: 'minimal', label: 'Minimalist' },
    { id: 'school', label: 'School & Club' },
    { id: 'quote', label: 'Editorial Quotes' },
  ];

  const filteredTemplates = useMemo(() => {
    return PRESET_TEMPLATES.filter((t) => {
      const matchesCategory = activeCategory === 'all' || t.category === activeCategory;
      if (!matchesCategory) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        t.title.toLowerCase().includes(q) ||
        t.quote.toLowerCase().includes(q) ||
        t.author.toLowerCase().includes(q) ||
        t.tag.toLowerCase().includes(q) ||
        t.categoryLabel.toLowerCase().includes(q) ||
        t.badge.toLowerCase().includes(q)
      );
    });
  }, [activeCategory, searchQuery]);

  // Sliced to display 2-per-row pairs on homepage
  const displayedTemplates = useMemo(() => {
    return filteredTemplates.slice(0, visibleCount);
  }, [filteredTemplates, visibleCount]);

  const toggleCompareTemplate = (tmpl: CardTemplate) => {
    setSelectedForCompare((prev) => {
      const exists = prev.some((t) => t.id === tmpl.id);
      if (exists) {
        return prev.filter((t) => t.id !== tmpl.id);
      }
      if (prev.length >= 4) {
        return [prev[1], prev[2], prev[3], tmpl];
      }
      return [...prev, tmpl];
    });
  };

  const faqs = [
    {
      q: 'Is Aesthetic Card Studio really free?',
      a: 'Yes, 100% free. There are no subscriptions, paywalls, or watermarks on your exported cards.',
    },
    {
      q: 'Does this app save or track what I write?',
      a: 'Never. The studio runs entirely client-side inside your own web browser. Your text, photos, and drafts never touch any server or cloud database.',
    },
    {
      q: 'What resolution do the cards download in?',
      a: 'Cards export from true 4K Ultra HD up to 16K Studio Extreme, perfectly sharp for prints and high-density screens.',
    },
    {
      q: 'Can I change aspect ratios for Stories or Square posts?',
      a: 'Yes. Switch between Square, 4:5 Portrait, 9:16 Story, and 16:9 Landscape anytime with proportional auto-reflow.',
    },
  ];

  return (
    <div className={`w-full pt-16 transition-colors duration-200 ${isLight ? 'text-[#0f172a]' : 'text-[#f4f1ea]'}`}>
      {/* SECTION 1: HERO */}
      <section className="relative w-full px-4 md:px-8 py-12 md:py-20 flex flex-col items-center text-center overflow-hidden">
        {/* Exact Hero Badge Replacement */}
        <div
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold mb-6 ${
            isLight
              ? 'bg-white border-[#e2e8f0] text-[#475569] shadow-sm'
              : 'bg-[#181d24] border-[#262c36] text-[#c4c7c8]'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#facc15]" />
          <span>Local-First Card &amp; ID Studio • Up to 16K Export</span>
        </div>

        {/* Exact Hero Title Replacement */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold max-w-4xl tracking-tight mb-4 leading-tight font-heading">
          Design quote cards, posters, and aesthetic IDs.
        </h1>

        {/* Exact Hero Subtitle Replacement */}
        <p className={`text-sm md:text-base max-w-2xl mx-auto mb-8 leading-relaxed font-body ${isLight ? 'text-[#475569]' : 'text-[#9ca3af]'}`}>
          Set crisp typography on 50+ tactile paper and holographic surfaces, or build multi-layer cards in the studio. Runs 100% in your browser.
        </p>

        {/* 2 Clear Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          <a
            href="/create"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm active:scale-[0.98] transition-all cursor-pointer shadow-lg bg-[#facc15] text-[#0b0e11] hover:bg-[#ffe270]"
          >
            <span>Open Card Creator</span>
            <SquareDuotoneIcon name="arrow-right" size="sm" />
          </a>

          <a
            href="/canvas"
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl border font-semibold text-sm transition-colors cursor-pointer ${
              isLight
                ? 'bg-white border-[#cbd5e1] text-[#0f172a] hover:bg-slate-50'
                : 'bg-[#181d24] border-[#262c36] text-white hover:bg-[#222730]'
            }`}
          >
            <span>Launch Freeform Canvas →</span>
          </a>
        </div>

        {/* Interactive Mini-Studio Frame */}
        <div
          className={`w-full max-w-4xl border p-3 md:p-6 rounded-2xl shadow-2xl flex flex-col gap-3 text-left ${
            isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#14171d] border-[#262c36]'
          }`}
        >
          {/* Mini-Studio Toolbar: Mode Switcher + Palettes + 3D View + Quick Actions */}
          <div
            className={`flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 rounded-xl border ${
              isLight ? 'bg-slate-50 border-[#e2e8f0]' : 'bg-[#181d24] border-[#1f242c]'
            }`}
          >
            {/* Mode Toggle Buttons */}
            <div className="flex items-center gap-1 bg-black/10 dark:bg-black/30 p-1 rounded-lg">
              <button
                onClick={() => setHeroMode('quote')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  heroMode === 'quote'
                    ? isLight
                      ? 'bg-white text-[#0f172a] shadow-sm'
                      : 'bg-[#facc15] text-[#0b0e11] shadow-sm'
                    : isLight
                    ? 'text-[#64748b] hover:text-[#0f172a]'
                    : 'text-[#707a8a] hover:text-white'
                }`}
              >
                <span>Quote Mode</span>
              </button>

              <button
                onClick={() => setHeroMode('id')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  heroMode === 'id'
                    ? isLight
                      ? 'bg-white text-[#0f172a] shadow-sm'
                      : 'bg-[#facc15] text-[#0b0e11] shadow-sm'
                    : isLight
                    ? 'text-[#64748b] hover:text-[#0f172a]'
                    : 'text-[#707a8a] hover:text-white'
                }`}
              >
                <span>ID Card Mode</span>
              </button>
            </div>

            {/* Palettes */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
              <span className={`text-[11px] px-1 font-medium ${isLight ? 'text-[#64748b]' : 'text-[#707a8a]'}`}>
                Palette:
              </span>
              {heroPalettes.map((pal, idx) => (
                <button
                  key={pal.id}
                  onClick={() => setHeroPaletteIndex(idx)}
                  className={`w-6 h-6 rounded-md border transition-all cursor-pointer relative shrink-0 ${
                    heroPaletteIndex === idx ? 'ring-2 ring-[#facc15] scale-110' : 'opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: pal.bg }}
                  title={pal.name}
                >
                  <span
                    className="absolute inset-0 m-auto w-2 h-2 rounded-full border border-black/20"
                    style={{ backgroundColor: pal.ink }}
                  />
                </button>
              ))}
            </div>

            {/* 3D View Toggle + Quick Actions */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIs3DMode((prev) => !prev)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                  is3DMode
                    ? 'bg-[#fcd535] text-[#0b0e11] border-[#fcd535]'
                    : isLight
                    ? 'border-slate-200 text-[#475569] hover:bg-slate-100'
                    : 'border-[#262c36] text-[#c4c7c8] hover:bg-[#222730]'
                }`}
                title="Toggle interactive Three.js 3D tilt view"
              >
                <SquareDuotoneIcon name="cube" size="sm" />
                <span>3D View</span>
              </button>

              <button
                onClick={handleCopyHero}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  isLight ? 'border-slate-200 hover:bg-slate-100' : 'border-[#262c36] hover:bg-[#222730]'
                }`}
                title="Copy Card Text"
              >
                <SquareDuotoneIcon name={copiedHero ? 'check' : 'copy'} size="sm" />
              </button>

              <button
                onClick={handleDownloadHeroPng}
                disabled={isDownloadingHero}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold text-xs bg-[#facc15] text-[#0b0e11] hover:bg-[#ffe270] transition-all cursor-pointer"
                title="Download 2x Preview"
              >
                <SquareDuotoneIcon name="download" size="sm" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Card Canvas or Three.js 3D View */}
          <div
            className={`relative w-full min-h-[360px] md:min-h-[440px] flex items-center justify-center p-4 sm:p-6 md:p-10 rounded-xl overflow-hidden border ${
              isLight ? 'bg-slate-100 border-[#e2e8f0]' : 'bg-[#0b0e11] border-[#1f242c]'
            }`}
          >
            {is3DMode ? (
              <div ref={threeMountRef} className="w-full h-[400px] flex items-center justify-center" />
            ) : (
              /* Pure Card Render Node (Zero Aspect Ratio Badge, Zero Bleed) */
              <div
                ref={heroCardRef}
                style={{
                  backgroundColor: currentHeroPalette.bg,
                  color: currentHeroPalette.ink,
                }}
                className="relative w-full max-w-lg min-h-[300px] p-6 sm:p-8 md:p-10 rounded-2xl transition-colors duration-200 shadow-2xl flex flex-col justify-between border border-black/10 overflow-hidden"
              >
                <div className="absolute inset-0 card-noise opacity-30 pointer-events-none" />

                {heroMode === 'quote' ? (
                  <>
                    <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-current/15 text-[10px] sm:text-[11px] font-mono tracking-wider opacity-75 relative z-10">
                      <input
                        type="text"
                        value={heroTag}
                        onChange={(e) => setHeroTag(e.target.value)}
                        className="bg-transparent border-b border-transparent hover:border-current/30 focus:border-current/60 outline-none max-w-[200px] font-mono"
                        title="Click to edit folio tag"
                      />
                      <span className="px-1.5 py-0.5 rounded border border-current/25 shrink-0 font-mono text-[9px] font-bold">
                        {currentHeroPalette.badge}
                      </span>
                    </div>

                    <div className="my-5 sm:my-7 relative z-10">
                      <textarea
                        value={heroQuote}
                        onChange={(e) => setHeroQuote(e.target.value)}
                        rows={3}
                        className="w-full bg-transparent resize-none border-b border-dashed border-transparent hover:border-current/25 focus:border-current/50 outline-none font-editorial text-xl sm:text-2xl md:text-3xl leading-relaxed tracking-tight text-inherit"
                        title="Click and type your words directly"
                      />
                    </div>

                    <div className="pt-4 border-t border-current/15 flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-1.5">
                        <span className="opacity-60 text-xs">—</span>
                        <input
                          type="text"
                          value={heroAuthor}
                          onChange={(e) => setHeroAuthor(e.target.value)}
                          className="bg-transparent border-b border-transparent hover:border-current/30 focus:border-current/60 outline-none text-xs font-semibold opacity-85 text-inherit max-w-[240px]"
                          title="Click to edit author attribution"
                        />
                      </div>
                      {/* Bug Fix B: Ratio label strictly removed from exported card */}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="w-10 h-2.5 rounded-full bg-black/30 border border-current/40 mb-3" />
                      <div className="w-full flex items-center justify-between pb-2.5 border-b border-current/15 text-[10px] font-mono tracking-wider opacity-85">
                        <span className="font-bold tracking-widest uppercase">★ OFFICIAL CREATIVE PASS ★</span>
                        <span className="px-1.5 py-0.5 rounded bg-black/10 border border-current/30 font-bold">
                          {currentHeroPalette.badge}
                        </span>
                      </div>
                    </div>

                    <div className="my-4 flex items-center gap-4 relative z-10">
                      <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-xl overflow-hidden border border-current/30 shadow-md shrink-0 relative bg-black/10">
                        <img
                          src={ASSET_AVATARS.grungeDan}
                          alt="Profile Portrait"
                          className="w-full h-full object-cover grayscale contrast-125"
                        />
                      </div>

                      <div className="flex-1 flex flex-col gap-2 font-mono text-xs">
                        <div>
                          <span className="text-[9px] uppercase tracking-wider opacity-60 block">HOLDER NAME</span>
                          <input
                            type="text"
                            value={heroIdName}
                            onChange={(e) => setHeroIdName(e.target.value)}
                            className="w-full bg-transparent font-bold text-sm border-b border-transparent hover:border-current/30 focus:border-current/60 outline-none text-inherit"
                          />
                        </div>
                        <div>
                          <span className="text-[9px] uppercase tracking-wider opacity-60 block">ROLE / SPECIALTY</span>
                          <input
                            type="text"
                            value={heroIdRole}
                            onChange={(e) => setHeroIdRole(e.target.value)}
                            className="w-full bg-transparent text-xs border-b border-transparent hover:border-current/30 focus:border-current/60 outline-none opacity-85 text-inherit"
                          />
                        </div>
                        <div>
                          <span className="text-[9px] uppercase tracking-wider opacity-60 block">CLEARANCE STATUS</span>
                          <input
                            type="text"
                            value={heroIdClearance}
                            onChange={(e) => setHeroIdClearance(e.target.value)}
                            className="w-full bg-transparent font-semibold text-[11px] border-b border-transparent hover:border-current/30 focus:border-current/60 outline-none text-inherit"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-current/15 flex items-center justify-between text-[10px] font-mono opacity-80 relative z-10">
                      <div className="flex items-center gap-1.5">
                        <span className="tracking-tight text-[11px] font-bold">||||| | |||| ||| |||||||</span>
                        <span>NO. TTC6253021</span>
                      </div>
                      <span className="text-[9px] uppercase font-bold tracking-wider">VERIFIED ACCESS</span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 2: TEMPLATE DIRECTORY & LIVE SEARCH */}
      <section
        id="templates-section"
        className={`w-full px-4 md:px-8 py-16 border-t ${
          isLight ? 'border-[#e2e8f0]' : 'border-[#1f242c]'
        }`}
      >
        <div className="max-w-[1240px] mx-auto flex flex-col gap-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-[#d97706] dark:text-[#fcd535]">
                Curated Styles
              </span>
              {/* Part 1.2 exact replacement header */}
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1 font-heading">
                Featured Templates
              </h2>
            </div>
            <p className={`text-xs max-w-md ${isLight ? 'text-[#64748b]' : 'text-[#9ca3af]'}`}>
              Showing {displayedTemplates.length} of {PRESET_TEMPLATES.length} templates. Select styles to compare side-by-side or customize in the studio.
            </p>
          </div>

          {/* Search Bar & Result Stats */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <SquareDuotoneIcon name="search" size="sm" className="absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates by quote, author, title, or vibe..."
                className={`w-full pl-11 pr-8 py-2 rounded-xl text-xs border transition-all focus:outline-none ${
                  isLight
                    ? 'bg-white border-[#cbd5e1] text-[#0f172a] placeholder-[#94a3b8] focus:border-[#d97706]'
                    : 'bg-[#181d24] border-[#262c36] text-white placeholder-[#707a8a] focus:border-[#fcd535]'
                }`}
              />
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className={isLight ? 'text-[#64748b]' : 'text-[#707a8a]'}>
                Showing <strong className={isLight ? 'text-[#0f172a]' : 'text-white'}>{displayedTemplates.length}</strong> of{' '}
                {PRESET_TEMPLATES.length} templates
              </span>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setVisibleCount(4);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeCategory === cat.id
                    ? isLight
                      ? 'bg-[#0f172a] text-white shadow-sm'
                      : 'bg-[#222730] text-white shadow-sm border border-[#444748]'
                    : isLight
                    ? 'bg-white text-[#64748b] hover:text-[#0f172a] border border-[#e2e8f0]'
                    : 'bg-[#181d24] text-[#9ca3af] hover:text-white border border-[#262c36]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* TEMPLATE SHOWCASE GRID: STRICT 2-PER-ROW LAYOUT (Part 4.2) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[1240px] w-full">
            {displayedTemplates.map((template) => {
              const isSelected = selectedForCompare.some((t) => t.id === template.id);

              return (
                <div
                  key={template.id}
                  className={`template-card-kinetic group flex flex-col border rounded-3xl overflow-hidden transition-all duration-200 hover:-translate-y-1 shadow-xl ${
                    isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#14171d] border-[#262c36]'
                  }`}
                >
                  {/* Real Card Visual Artwork Preview (Unified across studio & templates) */}
                  <UnifiedCardThumbnail
                    template={template}
                    isLight={isLight}
                  />

                  {/* Actions Bar */}
                  <div className={`p-4 flex items-center justify-between gap-3 ${isLight ? 'bg-slate-50' : 'bg-[#181d24]'}`}>
                    <span className="text-xs text-[#707a8a] font-medium">
                      {template.categoryLabel}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleCompareTemplate(template)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#fcd535] text-[#0b0e11] border-[#fcd535]'
                            : isLight
                            ? 'border-slate-300 hover:bg-slate-100 text-[#475569]'
                            : 'border-[#323946] hover:bg-[#20252e] text-[#c4c7c8]'
                        }`}
                      >
                        {isSelected ? 'Remove' : 'Compare'}
                      </button>

                      <a
                        href={`/create?template=${template.id}`}
                        onClick={(e) => {
                          if (onOpenEditorWithTemplate) {
                            e.preventDefault();
                            onOpenEditorWithTemplate(template);
                          }
                        }}
                        className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer shadow-md ${
                          isLight
                            ? 'bg-[#0f172a] text-white hover:bg-[#1e293b]'
                            : 'bg-[#fcd535] text-[#0b0e11] hover:bg-[#ffe270]'
                        }`}
                      >
                        <span>Open in Studio →</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Part 4.3 Footer Status Bar & View More Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 border-t border-current/10">
            <span className="text-xs font-semibold text-[#707a8a] font-subheading">
              Showing {displayedTemplates.length} of {PRESET_TEMPLATES.length} Templates
            </span>

            <div className="flex items-center gap-3">
              {displayedTemplates.length < filteredTemplates.length && (
                <button
                  onClick={() => setVisibleCount((prev) => prev + 4)}
                  className={`px-5 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    isLight
                      ? 'bg-white border-[#cbd5e1] hover:bg-slate-50 text-[#0f172a]'
                      : 'bg-[#181d24] border-[#262c36] hover:bg-[#222730] text-white'
                  }`}
                >
                  Load 4 More
                </button>
              )}

              <a
                href="/templates"
                className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                  isLight
                    ? 'bg-[#0f172a] text-white hover:bg-[#1e293b]'
                    : 'bg-[#fcd535] text-[#0b0e11] hover:bg-[#ffe270]'
                }`}
              >
                <span>Browse All {PRESET_TEMPLATES.length} Templates →</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: FAQ */}
      <section className="w-full px-4 md:px-8 py-16 border-t border-current/10">
        <div className="max-w-3xl mx-auto flex flex-col gap-6">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight font-heading">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-[#707a8a] mt-1">
              Everything you need to know about the local-first card engine.
            </p>
          </div>

          <div className="flex flex-col gap-3 mt-4">
            {faqs.map((faq, idx) => (
              <div
                key={faq.q}
                className={`border rounded-2xl overflow-hidden transition-all ${
                  isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#14171d] border-[#262c36]'
                }`}
              >
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                  className="w-full p-4 text-left font-bold text-sm flex items-center justify-between cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <span className="text-xs opacity-60">{openFaqIndex === idx ? '−' : '+'}</span>
                </button>
                {openFaqIndex === idx && (
                  <div className={`px-4 pb-4 text-xs leading-relaxed ${isLight ? 'text-[#475569]' : 'text-[#9ca3af]'}`}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Floating Comparison Dock (Part 4.4) */}
      <TemplateComparisonDock
        selectedTemplates={selectedForCompare}
        onRemoveTemplate={(id) => setSelectedForCompare((prev) => prev.filter((t) => t.id !== id))}
        onClear={() => setSelectedForCompare([])}
        onOpenModal={() => setComparisonModalOpen(true)}
        theme={theme}
      />

      {/* Side-by-Side Comparison Modal (Part 4.4) */}
      <TemplateComparisonModal
        isOpen={comparisonModalOpen}
        onClose={() => setComparisonModalOpen(false)}
        templates={selectedForCompare}
        onOpenTemplate={(tmpl) => {
          if (onOpenEditorWithTemplate) {
            onOpenEditorWithTemplate(tmpl);
          } else {
            window.location.href = `/create?template=${tmpl.id}`;
          }
        }}
        theme={theme}
      />
    </div>
  );
};
