import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { CardTemplate } from '../types/card';
import { PRESET_TEMPLATES } from '../data/templates';
import { updatePageSEO } from '../utils/seo';
import { toPng } from 'html-to-image';
import { ASSET_AVATARS } from '../data/canvasAssets';
import {
  ArrowRight,
  Copy,
  Check,
  ChevronDown,
  Search,
  X,
  FileQuestion,
  Download,
  Quote,
  BadgeAlert,
  ExternalLink,
} from 'lucide-react';

interface HomeViewProps {
  onOpenEditorWithTemplate?: (template: CardTemplate) => void;
  onNavigateToEditor?: () => void;
  onNavigate?: (path: string) => void;
  theme?: 'dark' | 'light';
  onOpenGuide?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  theme = 'dark',
}) => {
  const isLight = theme === 'light';

  useEffect(() => {
    updatePageSEO({
      title: 'Aesthetic Card Studio — Make tactile quote cards and aesthetic ID passes',
      description:
        'Format book excerpts on warm archival paper or build multi-layer Y2K credentials, club passes, and music cards—rendered locally in crisp 2x PNG, WebP, or SVG.',
      canonicalPath: '/',
      ogType: 'website',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Aesthetic Card Studio',
        applicationCategory: 'DesignApplication',
        operatingSystem: 'All web browsers',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
      },
    });
  }, []);

  // Live hero interactive mini-studio state
  const heroCardRef = useRef<HTMLDivElement>(null);
  const [heroMode, setHeroMode] = useState<'quote' | 'id'>('quote');
  const [heroPaletteIndex, setHeroPaletteIndex] = useState(0);
  const [copiedHero, setCopiedHero] = useState(false);
  const [isDownloadingHero, setIsDownloadingHero] = useState(false);

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

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const heroPalettes = [
    {
      id: 'st-germain',
      name: 'St. Germain',
      bg: '#f4ede4',
      ink: '#2c2825',
      badge: 'EST. 1997',
      accent: '#2c2825',
    },
    {
      id: 'warm-linen',
      name: 'Warm Linen',
      bg: '#fce7cf',
      ink: '#451a03',
      badge: 'ARCHIVAL',
      accent: '#451a03',
    },
    {
      id: 'obsidian',
      name: 'Obsidian Dark',
      bg: '#18191c',
      ink: '#f5f5f7',
      badge: 'MIDNIGHT',
      accent: '#f5f5f7',
    },
    {
      id: 'soft-celadon',
      name: 'Soft Celadon',
      bg: '#e2ecf9',
      ink: '#1e293b',
      badge: 'CELADON',
      accent: '#1e293b',
    },
    {
      id: 'y2k-cyber',
      name: 'Y2K Acid Studio',
      bg: '#e0e722',
      ink: '#111417',
      badge: 'ACID 90s',
      accent: '#ff007f',
    },
  ];

  const currentHeroPalette = heroPalettes[heroPaletteIndex];

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

  const handleOpenInFullStudio = () => {
    if (heroMode === 'quote') {
      sessionStorage.setItem(
        'aesthetic_card_studio_hero_quote',
        JSON.stringify({
          quote: heroQuote,
          author: heroAuthor,
          tag: heroTag,
          paletteId: currentHeroPalette.id,
          bg: currentHeroPalette.bg,
          ink: currentHeroPalette.ink,
        })
      );
      window.location.href = `/create?palette=${currentHeroPalette.id}`;
    } else {
      window.location.href = `/canvas?template=pass-creative-studio`;
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
      a: 'Cards export at crisp 2× Retina resolution (up to 2160×2700px), perfectly sharp for Instagram carousels, Stories, Pinterest, X/Twitter, or physical prints.',
    },
    {
      q: 'Can I change aspect ratios for Stories or Square posts?',
      a: 'Yes. You can switch between Square (1:1), Portrait (4:5), Story/Reel (9:16), and Landscape (16:9) anytime with a single click, and the layout reflows automatically.',
    },
  ];

  return (
    <div className={`w-full pt-16 transition-colors duration-200 ${isLight ? 'bg-[#f8fafc] text-[#0f172a]' : 'bg-[#0b0e11] text-[#e1e2e7]'}`}>
      {/* SECTION 1: HERO */}
      <section className="relative w-full px-4 md:px-8 py-12 md:py-20 flex flex-col items-center text-center overflow-hidden">
        {/* Anti-slop clean pill badge */}
        <div
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-medium mb-6 ${
            isLight
              ? 'bg-[#ffffff] border-[#e2e8f0] text-[#475569] shadow-sm'
              : 'bg-[#181d24] border-[#262c36] text-[#c4c7c8]'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#facc15]"></span>
          <span>Browser-Based Card &amp; ID Press — Free, Local, No Sign-Up</span>
        </div>

        <h1 className={`text-4xl md:text-6xl font-bold max-w-4xl tracking-tight mb-4 leading-tight ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
          Make tactile quote cards and aesthetic ID passes.
        </h1>
        
        <p className={`text-sm md:text-base max-w-2xl mx-auto mb-8 leading-relaxed ${isLight ? 'text-[#64748b]' : 'text-[#9ca3af]'}`}>
          Format book excerpts on warm archival paper or build multi-layer Y2K credentials, club passes, and music cards—rendered locally in crisp 2x PNG, WebP, or SVG.
        </p>

        {/* 2 Clear Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          <a
            href="/create"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm active:scale-[0.98] transition-all cursor-pointer shadow-lg bg-[#facc15] text-[#0b0e11] hover:bg-[#ffe270]"
          >
            <span>Open Card Creator</span>
            <ArrowRight className="w-4 h-4" />
          </a>

          <a
            href="/canvas"
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl border font-semibold text-sm transition-colors cursor-pointer ${
              isLight
                ? 'bg-white border-[#cbd5e1] text-[#0f172a] hover:bg-[#f1f5f9]'
                : 'bg-[#181d24] border-[#262c36] text-white hover:bg-[#222730]'
            }`}
          >
            <span>Launch Freeform Canvas →</span>
          </a>
        </div>

        {/* Interactive Mini-Studio Frame */}
        <div
          className={`w-full max-w-4xl border p-3 md:p-6 rounded-2xl shadow-2xl flex flex-col gap-3 text-left ${
            isLight
              ? 'bg-[#ffffff] border-[#e2e8f0]'
              : 'bg-[#14171d] border-[#262c36]'
          }`}
        >
          {/* Mini-Studio Toolbar: Mode Switcher + Palettes + Quick Actions */}
          <div
            className={`flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 rounded-xl border ${
              isLight
                ? 'bg-[#f8fafc] border-[#e2e8f0]'
                : 'bg-[#181d24] border-[#1f242c]'
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
                    : 'text-[#9ca3af] hover:text-white'
                }`}
              >
                <Quote className="w-3.5 h-3.5" />
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
                    : 'text-[#9ca3af] hover:text-white'
                }`}
              >
                <BadgeAlert className="w-3.5 h-3.5" />
                <span>ID Card Mode</span>
              </button>
            </div>

            {/* Palettes */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
              <span className={`text-[11px] px-1 font-medium ${isLight ? 'text-[#64748b]' : 'text-[#707a8a]'}`}>
                Palette:
              </span>
              {heroPalettes.map((p, idx) => (
                <button
                  key={p.id}
                  onClick={() => setHeroPaletteIndex(idx)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                    heroPaletteIndex === idx
                      ? isLight
                        ? 'bg-[#0f172a] text-white shadow-sm'
                        : 'bg-white text-[#0b0e11] shadow-sm font-semibold'
                      : isLight
                      ? 'bg-white text-[#475569] hover:text-[#0f172a] border border-[#e2e8f0]'
                      : 'bg-[#14171d] text-[#c4c7c8] hover:text-white border border-[#262c36]'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-black/20"
                    style={{ backgroundColor: p.bg }}
                  />
                  <span>{p.name}</span>
                </button>
              ))}
            </div>

            {/* Actions: Download PNG & Open Studio */}
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={handleCopyHero}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  isLight
                    ? 'bg-white border-[#e2e8f0] text-[#475569] hover:text-[#0f172a]'
                    : 'bg-[#14171d] border-[#1f242c] text-[#c4c7c8] hover:text-white'
                }`}
                title="Copy text to clipboard"
                aria-label="Copy text to clipboard"
              >
                {copiedHero ? <Check className="w-3.5 h-3.5 text-[#0ecb81]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={handleDownloadHeroPng}
                disabled={isDownloadingHero}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                  isLight
                    ? 'bg-white border-[#cbd5e1] text-[#0f172a] hover:bg-[#f1f5f9]'
                    : 'bg-[#222730] border-[#333a46] text-white hover:bg-[#2b323e]'
                }`}
                title="Download 2x PNG of this live preview"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isDownloadingHero ? 'Exporting...' : 'Download PNG'}</span>
              </button>

              <button
                onClick={handleOpenInFullStudio}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm bg-[#facc15] text-[#0b0e11] hover:bg-[#ffe270]"
                title="Open this card in the full studio with all controls"
              >
                <span>Open in Full Studio</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Interactive Editable Card Canvas */}
          <div
            className={`relative w-full min-h-[360px] md:min-h-[440px] flex items-center justify-center p-4 sm:p-6 md:p-10 rounded-xl overflow-hidden border ${
              isLight
                ? 'bg-[#f1f5f9] border-[#e2e8f0]'
                : 'bg-[#0b0e11] border-[#1f242c]'
            }`}
          >
            {/* The actual exportable card container */}
            <div
              ref={heroCardRef}
              style={{
                backgroundColor: currentHeroPalette.bg,
                color: currentHeroPalette.ink,
              }}
              className="relative w-full max-w-lg min-h-[300px] p-6 sm:p-8 md:p-10 rounded-2xl transition-colors duration-200 shadow-2xl flex flex-col justify-between border border-black/10 overflow-hidden"
            >
              {/* Subtle tactile grain overlay */}
              <div className="absolute inset-0 card-noise opacity-30 pointer-events-none" />

              {heroMode === 'quote' ? (
                /* ─────────────────────────────────────────────────────────────
                   QUOTE MODE: Click and type directly inline
                   ───────────────────────────────────────────────────────────── */
                <>
                  {/* Top Folio Bar */}
                  <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-current/15 text-[10px] sm:text-[11px] font-mono tracking-wider opacity-75 relative z-10">
                    <input
                      type="text"
                      value={heroTag}
                      onChange={(e) => setHeroTag(e.target.value)}
                      className="bg-transparent border-b border-transparent hover:border-current/30 focus:border-current/60 outline-none max-w-[200px] font-mono"
                      title="Click to edit folio tag"
                    />
                    <span className="px-1.5 py-0.5 rounded border border-current/25 shrink-0 font-mono text-[9px]">
                      {currentHeroPalette.badge}
                    </span>
                  </div>

                  {/* Main Body Quote: directly editable inline textarea */}
                  <div className="my-5 sm:my-7 relative z-10">
                    <textarea
                      value={heroQuote}
                      onChange={(e) => setHeroQuote(e.target.value)}
                      rows={3}
                      className="w-full bg-transparent resize-none border-b border-dashed border-transparent hover:border-current/25 focus:border-current/50 outline-none font-editorial text-xl sm:text-2xl md:text-3xl leading-relaxed tracking-tight text-inherit"
                      title="Click and type your words directly"
                    />
                    <span className="text-[10px] opacity-40 font-mono tracking-wide block mt-1">
                      ✎ Click text to edit inline
                    </span>
                  </div>

                  {/* Footer Author & Folio */}
                  <div className="pt-4 border-t border-current/15 flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-1.5">
                      <span className="opacity-60 text-xs">—</span>
                      <input
                        type="text"
                        value={heroAuthor}
                        onChange={(e) => setHeroAuthor(e.target.value)}
                        className="bg-transparent border-b border-transparent hover:border-current/30 focus:border-current/60 outline-none text-xs font-medium opacity-85 text-inherit max-w-[240px]"
                        title="Click to edit author attribution"
                      />
                    </div>
                    <span className="text-[10px] font-mono opacity-50">4:5 SOCIAL</span>
                  </div>
                </>
              ) : (
                /* ─────────────────────────────────────────────────────────────
                   ID CARD MODE: Tactical credential layout with photo
                   ───────────────────────────────────────────────────────────── */
                <>
                  {/* Lanyard Top Punch Hole & Badge Bar */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-10 h-2.5 rounded-full bg-black/30 border border-current/40 mb-3" />
                    <div className="w-full flex items-center justify-between pb-2.5 border-b border-current/15 text-[10px] font-mono tracking-wider opacity-85">
                      <span className="font-bold tracking-widest uppercase">★ OFFICIAL CREATIVE PASS ★</span>
                      <span className="px-1.5 py-0.5 rounded bg-black/10 border border-current/30 font-bold">
                        {currentHeroPalette.badge}
                      </span>
                    </div>
                  </div>

                  {/* Dual Column Content: Halftone Photo + Editable Attributes */}
                  <div className="my-4 flex items-center gap-4 relative z-10">
                    {/* Halftone / Duotone Portrait */}
                    <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-xl overflow-hidden border border-current/30 shadow-md shrink-0 relative bg-black/10">
                      <img
                        src={ASSET_AVATARS.grungeDan}
                        alt="Profile Portrait"
                        className="w-full h-full object-cover grayscale contrast-125"
                      />
                      <div className="absolute inset-0 bg-current/10 mix-blend-multiply pointer-events-none" />
                    </div>

                    {/* Metadata fields */}
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

                  {/* Bottom Barcode Strip & Document Serial */}
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
        <div className="max-w-6xl mx-auto flex flex-col gap-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className={`text-xs uppercase font-semibold tracking-wider ${isLight ? 'text-[#d97706]' : 'text-[#fcd535]'}`}>
                Curated Styles
              </span>
              <h2 className={`text-2xl md:text-3xl font-bold tracking-tight mt-1 ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
                Pick a vibe for your card.
              </h2>
            </div>
            <p className={`text-xs max-w-md ${isLight ? 'text-[#64748b]' : 'text-[#9ca3af]'}`}>
              From vintage book pages and retro passport passes to minimal Swiss layouts and pastel photocards. Click any card to customize.
            </p>
          </div>

          {/* Search Bar & Result Stats */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isLight ? 'text-[#94a3b8]' : 'text-[#707a8a]'}`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates by quote, author, title, or vibe..."
                className={`w-full pl-10 pr-9 py-2 rounded-xl text-xs border transition-all focus:outline-none ${
                  isLight
                    ? 'bg-white border-[#cbd5e1] text-[#0f172a] placeholder-[#94a3b8] focus:border-[#d97706]'
                    : 'bg-[#181d24] border-[#262c36] text-white placeholder-[#707a8a] focus:border-[#fcd535]'
                }`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded cursor-pointer ${
                    isLight ? 'text-[#94a3b8] hover:text-[#0f172a]' : 'text-[#707a8a] hover:text-white'
                  }`}
                  title="Clear search"
                  aria-label="Clear template search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className={isLight ? 'text-[#64748b]' : 'text-[#707a8a]'}>
                Showing <strong className={isLight ? 'text-[#0f172a]' : 'text-white'}>{filteredTemplates.length}</strong> of{' '}
                {PRESET_TEMPLATES.length} styles
              </span>
              {(searchQuery || activeCategory !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('all');
                  }}
                  className={`text-[11px] underline cursor-pointer ml-1 ${isLight ? 'text-[#d97706]' : 'text-[#fcd535]'}`}
                >
                  Reset filters
                </button>
              )}
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
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

          {/* Empty Search State */}
          {filteredTemplates.length === 0 ? (
            <div
              className={`p-12 rounded-2xl border text-center flex flex-col items-center gap-3 my-4 ${
                isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#14171d] border-[#262c36]'
              }`}
            >
              <FileQuestion className={`w-10 h-10 ${isLight ? 'text-[#94a3b8]' : 'text-[#707a8a]'}`} />
              <h3 className={`text-base font-semibold ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
                No styles match &ldquo;{searchQuery}&rdquo;
              </h3>
              <p className={`text-xs max-w-sm ${isLight ? 'text-[#64748b]' : 'text-[#9ca3af]'}`}>
                Try adjusting your search terms or selecting a different category from the filter pills above.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
                className={`mt-2 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  isLight
                    ? 'bg-[#0f172a] text-white hover:bg-[#1e293b]'
                    : 'bg-white text-[#0b0e11] hover:bg-[#e2e2e2]'
                }`}
              >
                Show All Styles
              </button>
            </div>
          ) : (
            /* Templates Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className={`group flex flex-col border rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-1 shadow-lg ${
                    isLight
                      ? 'bg-white border-[#e2e8f0] hover:border-[#cbd5e1]'
                      : 'bg-[#14171d] border-[#262c36] hover:border-[#444748]'
                  }`}
                >
                  {/* Visual Preview Box */}
                  <div
                    style={{ backgroundColor: template.theme.bg, color: template.theme.ink }}
                    className="relative p-6 min-h-[220px] flex flex-col justify-between border-b border-black/10"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono opacity-70">
                      <span>{template.tag}</span>
                      <span className="border border-current/30 px-1 rounded">{template.badge}</span>
                    </div>

                    {template.category === 'id-card' ? (
                      <div className="my-3 flex items-center gap-3">
                        <div className="w-14 h-18 rounded-lg overflow-hidden border border-current/30 shadow-sm shrink-0 relative bg-black/10">
                          <img
                            src={
                              (template.canvasDoc?.objects?.find((o) => o.type === 'image') as any)?.src ||
                              (template.id.includes('pretty') || template.id.includes('kawaii') || template.id.includes('soulmate')
                                ? ASSET_AVATARS.jenniePretty
                                : template.id.includes('dan') || template.id.includes('delulu') || template.id.includes('cyber') || template.id.includes('acid')
                                ? ASSET_AVATARS.grungeDan
                                : template.id.includes('anime') || template.id.includes('travel')
                                ? ASSET_AVATARS.animeTraveler
                                : ASSET_AVATARS.studentScholar)
                            }
                            alt={template.title}
                            className="w-full h-full object-cover grayscale contrast-125"
                          />
                          <div className="absolute inset-0 bg-current/15 mix-blend-multiply pointer-events-none" />
                        </div>
                        <div className="flex-1 flex flex-col gap-1 text-[11px] font-sans">
                          <span className="font-bold line-clamp-1 text-sm tracking-tight">{template.title}</span>
                          <span className="opacity-75 line-clamp-2 text-[10px] leading-snug">{template.quote}</span>
                        </div>
                      </div>
                    ) : (
                      <p
                        className={`my-3 text-base leading-snug line-clamp-3 ${
                          template.font === 'editorial'
                            ? 'font-editorial text-lg'
                            : template.font === 'serif'
                            ? 'font-display-serif'
                            : template.font === 'mono'
                            ? 'font-mono-code text-sm'
                            : 'font-sans'
                        }`}
                      >
                        “{template.quote}”
                      </p>
                    )}

                    <div className="text-[11px] font-medium opacity-80 truncate">
                      — {template.author}
                    </div>
                  </div>

                  {/* Card Meta & Action */}
                  <div className={`p-4 flex items-center justify-between ${isLight ? 'bg-[#f8fafc]' : 'bg-[#181d24]'}`}>
                    <div>
                      <h3 className={`text-sm font-semibold ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
                        {template.title}
                      </h3>
                      <span className={`text-[11px] ${isLight ? 'text-[#64748b]' : 'text-[#707a8a]'}`}>
                        {template.categoryLabel}
                      </span>
                    </div>

                    <a
                      href={`/create?template=${template.id}`}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        isLight
                          ? 'bg-[#0f172a] text-white hover:bg-[#1e293b]'
                          : 'bg-white text-[#0b0e11] hover:bg-[#e2e2e2]'
                      }`}
                    >
                      <span>Use Style</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* SECTION 3: HOW IT WORKS PIPELINE */}
      <section
        className={`w-full px-4 md:px-8 py-16 border-t ${
          isLight ? 'bg-[#f1f5f9] border-[#e2e8f0]' : 'bg-[#111417] border-[#1f242c]'
        }`}
      >
        <div className="max-w-5xl mx-auto flex flex-col gap-10">
          <div className="text-center">
            <span className={`text-xs uppercase font-semibold tracking-wider ${isLight ? 'text-[#d97706]' : 'text-[#fcd535]'}`}>
              Effortless & Free
            </span>
            <h2 className={`text-2xl md:text-3xl font-bold tracking-tight mt-1 ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
              How it works.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div
              className={`p-5 rounded-xl border flex flex-col gap-2.5 ${
                isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#181d24] border-[#262c36]'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center font-semibold text-sm ${
                  isLight ? 'bg-[#f1f5f9] text-[#d97706]' : 'bg-[#222730] text-[#fcd535]'
                }`}
              >
                01
              </div>
              <h3 className={`text-sm font-semibold ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>Paste your words</h3>
              <p className={`text-xs leading-relaxed ${isLight ? 'text-[#64748b]' : 'text-[#9ca3af]'}`}>
                A favorite book excerpt, a song lyric, a late-night thought, or your personal bio.
              </p>
            </div>

            <div
              className={`p-5 rounded-xl border flex flex-col gap-2.5 ${
                isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#181d24] border-[#262c36]'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center font-semibold text-sm ${
                  isLight ? 'bg-[#f1f5f9] text-[#d97706]' : 'bg-[#222730] text-[#fcd535]'
                }`}
              >
                02
              </div>
              <h3 className={`text-sm font-semibold ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>Choose an aesthetic</h3>
              <p className={`text-xs leading-relaxed ${isLight ? 'text-[#64748b]' : 'text-[#9ca3af]'}`}>
                Pick from vintage paper, retro ID passes, darkroom midnight, or soft pastel themes.
              </p>
            </div>

            <div
              className={`p-5 rounded-xl border flex flex-col gap-2.5 ${
                isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#181d24] border-[#262c36]'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center font-semibold text-sm ${
                  isLight ? 'bg-[#f1f5f9] text-[#d97706]' : 'bg-[#222730] text-[#fcd535]'
                }`}
              >
                03
              </div>
              <h3 className={`text-sm font-semibold ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>Make it personal</h3>
              <p className={`text-xs leading-relaxed ${isLight ? 'text-[#64748b]' : 'text-[#9ca3af]'}`}>
                Tweak fonts, switch aspect ratios (1:1, 4:5, 9:16), upload a photo, or add stickers.
              </p>
            </div>

            <div
              className={`p-5 rounded-xl border flex flex-col gap-2.5 ${
                isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#181d24] border-[#262c36]'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center font-semibold text-sm ${
                  isLight ? 'bg-[#f1f5f9] text-[#0ecb81]' : 'bg-[#222730] text-[#0ecb81]'
                }`}
              >
                04
              </div>
              <h3 className={`text-sm font-semibold ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>Download 2× Retina</h3>
              <p className={`text-xs leading-relaxed ${isLight ? 'text-[#64748b]' : 'text-[#9ca3af]'}`}>
                Save a crisp high-res image directly to your phone or laptop. No watermarks, ever.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: FAQ ACCORDION */}
      <section
        className={`w-full px-4 md:px-8 py-16 border-t ${
          isLight ? 'border-[#e2e8f0]' : 'border-[#1f242c]'
        }`}
      >
        <div className="max-w-3xl mx-auto flex flex-col gap-8">
          <div className="text-center">
            <span className={`text-xs uppercase font-semibold tracking-wider ${isLight ? 'text-[#d97706]' : 'text-[#fcd535]'}`}>
              FAQ
            </span>
            <h2 className={`text-2xl md:text-3xl font-bold tracking-tight mt-1 ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
              Frequently Asked Questions
            </h2>
          </div>

          <div className="flex flex-col gap-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className={`rounded-xl border overflow-hidden transition-colors ${
                    isLight
                      ? 'bg-white border-[#e2e8f0]'
                      : 'bg-[#14171d] border-[#262c36]'
                  }`}
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className={`w-full p-4 text-left flex items-center justify-between font-medium text-sm transition-colors cursor-pointer ${
                      isLight
                        ? 'text-[#0f172a] hover:bg-[#f8fafc]'
                        : 'text-white hover:bg-[#181d24]'
                    }`}
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isOpen
                          ? 'rotate-180 ' + (isLight ? 'text-[#0f172a]' : 'text-white')
                          : isLight
                          ? 'text-[#94a3b8]'
                          : 'text-[#707a8a]'
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div
                      className={`px-4 pb-4 pt-1 text-xs leading-relaxed border-t ${
                        isLight
                          ? 'text-[#64748b] border-[#f1f5f9]'
                          : 'text-[#9ca3af] border-[#1f242c]/50'
                      }`}
                    >
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 5: BOTTOM CALLOUT BANNER */}
      <section
        className={`w-full px-4 md:px-8 py-16 border-t ${
          isLight ? 'border-[#e2e8f0]' : 'border-[#1f242c]'
        }`}
      >
        <div
          className={`max-w-4xl mx-auto p-8 md:p-12 rounded-2xl border text-center flex flex-col items-center gap-5 shadow-2xl ${
            isLight
              ? 'bg-gradient-to-b from-[#ffffff] to-[#f8fafc] border-[#e2e8f0]'
              : 'bg-gradient-to-b from-[#181d24] to-[#14171d] border-[#262c36]'
          }`}
        >
          <span className="text-xs text-[#0ecb81] font-mono tracking-wider uppercase">
            Start Creating
          </span>
          <h2 className={`text-3xl md:text-4xl font-bold tracking-tight ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
            Ready to make your card?
          </h2>
          <p className={`text-sm max-w-lg leading-relaxed ${isLight ? 'text-[#64748b]' : 'text-[#9ca3af]'}`}>
            No sign-up, no app install, and no waiting. Open the editor and create something beautiful right now.
          </p>
          <a
            href="/create"
            className={`inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm active:scale-[0.98] transition-all cursor-pointer shadow-xl mt-2 ${
              isLight
                ? 'bg-[#0f172a] text-white hover:bg-[#1e293b]'
                : 'bg-white text-[#0b0e11] hover:bg-[#e2e2e2]'
            }`}
          >
            <span>Open Card Creator</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>
    </div>
  );
};
export default HomeView;
