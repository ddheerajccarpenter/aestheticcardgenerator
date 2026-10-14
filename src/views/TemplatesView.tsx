import React, { useState, useMemo, useEffect } from 'react';
import type { CardTemplate } from '../types/card';
import { PRESET_TEMPLATES } from '../data/templates';
import { updatePageSEO } from '../utils/seo';
import { AdSlot } from '../components/AdSlot';
import {
  Search,
  X,
  ArrowRight,
  ChevronRight,
  FileQuestion,
  Sparkles,
  Layers,
  FilePlus,
} from 'lucide-react';

interface TemplatesViewProps {
  onNavigate?: (path: string) => void;
  onOpenEditorWithTemplate?: (template: CardTemplate) => void;
  theme?: 'dark' | 'light';
}

const CATEGORY_TABS = [
  { id: 'all', label: 'All Styles' },
  { id: 'id-card', label: 'Aesthetic ID Passes' },
  { id: 'pastel', label: 'Cute & Pastel' },
  { id: 'vintage', label: 'Vintage & Retro' },
  { id: 'fan', label: 'Fan & Character' },
  { id: 'minimal', label: 'Minimalist (No Stars)' },
  { id: 'school', label: 'School & Academy' },
  { id: 'quote', label: 'Editorial Quotes' },
];

export const TemplatesView: React.FC<TemplatesViewProps> = ({
  theme = 'dark',
}) => {
  const isLight = theme === 'light';
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    updatePageSEO({
      title: 'Aesthetic Template Library — 56 Curated ID Passes, Pastel Cards & Minimal Folios',
      description:
        'Explore 56 editable aesthetic card templates: Jennie crimson passes, Portoko grunge badges, vintage Tyler travel licenses, kawaii lace frames, and Swiss minimalist credentials.',
      canonicalPath: '/templates',
      ogType: 'website',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://aestheticcardstudio.com/' },
          { '@type': 'ListItem', position: 2, name: 'Templates', item: 'https://aestheticcardstudio.com/templates' },
        ],
      },
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const filteredTemplates = useMemo(() => {
    return PRESET_TEMPLATES.filter((t) => {
      // Category match
      let matchesCat = false;
      if (activeCategory === 'all') {
        matchesCat = true;
      } else if (activeCategory === 'quote') {
        matchesCat = ['quote', 'reflection', 'notes', 'review', 'poetry'].includes(t.category);
      } else {
        matchesCat = t.category === activeCategory;
      }
      if (!matchesCat) return false;

      // Search query match
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const tagsMatch = t.tags ? t.tags.some((tag) => tag.toLowerCase().includes(q)) : false;

      return (
        t.title.toLowerCase().includes(q) ||
        t.quote.toLowerCase().includes(q) ||
        t.author.toLowerCase().includes(q) ||
        t.tag.toLowerCase().includes(q) ||
        t.categoryLabel.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        tagsMatch
      );
    });
  }, [activeCategory, searchQuery]);

  return (
    <div
      className={`w-full pt-20 pb-16 transition-colors duration-200 ${
        isLight ? 'bg-[#f8fafc] text-[#0f172a]' : 'bg-[#0b0e11] text-[#e1e2e7]'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 md:px-8 flex flex-col gap-10">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#707a8a]">
          <a href="/" className="hover:underline cursor-pointer">
            Home
          </a>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className={`font-medium ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>Templates</span>
        </nav>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* HERO BANNER: Create from Blank Canvas CTA                           */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <div
          className={`p-6 sm:p-8 rounded-3xl border relative overflow-hidden transition-all shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${
            isLight
              ? 'bg-gradient-to-r from-white via-[#f1f5f9] to-[#e2e8f0] border-[#cbd5e1]'
              : 'bg-gradient-to-r from-[#14171d] via-[#181d24] to-[#1c222b] border-[#2a303c]'
          }`}
        >
          <div className="flex flex-col gap-2 max-w-xl z-10">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#d97706] dark:text-[#fcd535]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Create from Scratch</span>
            </div>
            <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
              Start with a Blank Canvas
            </h2>
            <p className={`text-xs sm:text-sm leading-relaxed ${isLight ? 'text-[#475569]' : 'text-[#9ca3af]'}`}>
              Want to design your own layout? Choose your dimensions (ID card, vertical lanyard, or square post), upload photos, and arrange text and stickers freely.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 z-10">
            <a
              href="/canvas?blank=true"
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold transition-all transform active:scale-95 shadow-lg cursor-pointer ${
                isLight
                  ? 'bg-[#0f172a] text-white hover:bg-[#1e293b]'
                  : 'bg-[#fcd535] text-[#0b0e11] hover:bg-[#ffe270]'
              }`}
            >
              <FilePlus className="w-4 h-4" />
              <span>Open Blank Canvas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Header Title */}
        <header className="flex flex-col gap-3 text-left border-b pb-6 border-[#262c36]/40">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#d97706] dark:text-[#fcd535]">
            <Layers className="w-3.5 h-3.5" />
            <span>56 Curated Templates</span>
          </div>
          <h1 className={`text-3xl md:text-5xl font-bold tracking-tight leading-tight ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
            Explore Card Templates
          </h1>
          <p className={`text-sm md:text-base max-w-2xl leading-relaxed ${isLight ? 'text-[#475569]' : 'text-[#9ca3af]'}`}>
            Pick a style to jump into the editor. You can customize the words, swap fonts and paper colors, or open any design in Canvas Studio to move layers around.
          </p>
        </header>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* SEARCH & CATEGORY FILTER TABS                                       */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isLight ? 'text-[#94a3b8]' : 'text-[#707a8a]'}`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, vibe (e.g. 'Jennie', 'Y2K', 'Swiss', 'Lace')..."
                className={`w-full pl-10 pr-9 py-2.5 rounded-xl text-xs border transition-all focus:outline-none ${
                  isLight
                    ? 'bg-white border-[#cbd5e1] text-[#0f172a] placeholder-[#94a3b8] focus:border-[#d97706]'
                    : 'bg-[#181d24] border-[#262c36] text-white placeholder-[#707a8a] focus:border-[#fcd535]'
                }`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-[#707a8a] hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="text-xs text-[#707a8a]">
              Showing <strong className={isLight ? 'text-[#0f172a]' : 'text-white'}>{filteredTemplates.length}</strong> of{' '}
              {PRESET_TEMPLATES.length} templates
            </div>
          </div>

          {/* Primary Category Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORY_TABS.map((tab) => {
              const count =
                tab.id === 'all'
                  ? PRESET_TEMPLATES.length
                  : tab.id === 'quote'
                  ? PRESET_TEMPLATES.filter((t) => ['quote', 'reflection', 'notes', 'review', 'poetry'].includes(t.category)).length
                  : PRESET_TEMPLATES.filter((t) => t.category === tab.id).length;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activeCategory === tab.id
                      ? isLight
                        ? 'bg-[#0f172a] text-white shadow-md'
                        : 'bg-[#fcd535] text-[#0b0e11] shadow-md font-bold'
                      : isLight
                      ? 'bg-white text-[#64748b] hover:text-[#0f172a] border border-[#e2e8f0]'
                      : 'bg-[#181d24] text-[#9ca3af] hover:text-white border border-[#262c36]'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      activeCategory === tab.id
                        ? isLight
                          ? 'bg-white/20 text-white'
                          : 'bg-black/20 text-black'
                        : 'opacity-60'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* TEMPLATES GRID                                                      */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {filteredTemplates.length === 0 ? (
          <div
            className={`p-12 rounded-3xl border text-center flex flex-col items-center gap-3 ${
              isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#14171d] border-[#262c36]'
            }`}
          >
            <FileQuestion className="w-10 h-10 text-[#707a8a]" />
            <h3 className={`text-base font-semibold ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
              No templates match "{searchQuery}"
            </h3>
            <p className="text-xs text-[#707a8a] max-w-sm">
              Try searching for "ID", "Vintage", "Pastel", "Minimal", or reset the category filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                isLight ? 'bg-[#0f172a] text-white' : 'bg-white text-[#0b0e11]'
              }`}
            >
              Show All {PRESET_TEMPLATES.length} Styles
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => {
              const isIdStyle = template.hasPhotoArea || template.category === 'id-card';
              const isVertical = template.layoutHint === 'vertical';

              return (
                <article
                  key={template.id}
                  className={`group flex flex-col border rounded-3xl overflow-hidden transition-all duration-200 hover:-translate-y-1 shadow-lg ${
                    isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#14171d] border-[#262c36]'
                  }`}
                >
                  {/* Card Visual Artwork Preview */}
                  <div
                    style={{ backgroundColor: template.theme.bg, color: template.theme.ink }}
                    className={`relative p-5 flex flex-col justify-between border-b border-black/10 overflow-hidden ${
                      isVertical ? 'min-h-[280px]' : 'min-h-[220px]'
                    }`}
                  >
                    {/* Header Strip or Tag */}
                    <div className="flex items-center justify-between text-[10px] font-mono opacity-80 z-10">
                      <span className="font-semibold truncate max-w-[170px]">{template.tag}</span>
                      <span className="border border-current/40 px-1.5 py-0.5 rounded font-mono text-[9px]">
                        {template.badge}
                      </span>
                    </div>

                    {/* Content Preview: ID Pass vs Editorial Quote */}
                    {isIdStyle ? (
                      /* ID Card layout preview */
                      <div className="my-3 flex items-center gap-3 z-10">
                        {/* Avatar box representation */}
                        <div className="w-16 h-20 rounded-lg bg-black/10 border border-current/20 flex flex-col items-center justify-center text-[9px] font-mono opacity-70 shrink-0">
                          <span>PHOTO</span>
                        </div>
                        <div className="flex-1 flex flex-col gap-1 text-[11px] font-sans">
                          <span className="font-bold line-clamp-1 text-sm tracking-tight">{template.title}</span>
                          <span className="opacity-75 line-clamp-2 text-[10px] leading-snug">{template.quote}</span>
                        </div>
                      </div>
                    ) : (
                      /* Quote layout preview */
                      <blockquote className="my-3 text-sm leading-snug line-clamp-3 font-editorial z-10">
                        “{template.quote}”
                      </blockquote>
                    )}

                    {/* Bottom Metadata & Star / Barcode indication */}
                    <div className="flex items-center justify-between text-[10px] font-medium opacity-80 truncate z-10">
                      <cite className="not-italic truncate max-w-[180px]">— {template.author}</cite>
                      {template.layoutHint && (
                        <span className="font-mono text-[9px] uppercase opacity-70">
                          {template.layoutHint}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Footer Bar with dual actions */}
                  <div className={`p-4 flex flex-col gap-2.5 ${isLight ? 'bg-[#f8fafc]' : 'bg-[#181d24]'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className={`text-xs font-bold ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
                          {template.title}
                        </h3>
                        <span className="text-[10px] text-[#707a8a]">{template.categoryLabel}</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <a
                        href={`/canvas?template=${template.id}`}
                        className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
                          isLight
                            ? 'bg-[#0f172a] text-white hover:bg-[#1e293b]'
                            : 'bg-[#fcd535] text-[#0b0e11] hover:bg-[#ffe270]'
                        }`}
                        title="Open in Freeform Canvas Studio with separate editable layers"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Canvas</span>
                      </a>

                      <a
                        href={`/create?template=${template.id}`}
                        className={`inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          isLight
                            ? 'bg-white border-[#cbd5e1] text-[#0f172a] hover:bg-[#f1f5f9]'
                            : 'bg-[#181d24] border-[#262c36] text-[#e1e2e7] hover:bg-[#222730]'
                        }`}
                        title="Open in classic text typesetting editor"
                      >
                        <span>Text Edit</span>
                        <ArrowRight className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Optional Safe AdSense slot */}
        <AdSlot slotId="templates-bottom-slot" />

        {/* Deep Dive Section */}
        <section
          className={`p-8 rounded-3xl border flex flex-col gap-4 ${
            isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#181d24] border-[#262c36]'
          }`}
        >
          <h2 className={`text-xl font-bold ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
            How Our Freeform Canvas & ID Pass System Works
          </h2>
          <p className={`text-xs md:text-sm leading-relaxed ${isLight ? 'text-[#475569]' : 'text-[#9ca3af]'}`}>
            Every template in the Studio library is stored as an editable document object model rather than a flattened image. When you open any card in the Canvas Studio, every component—from the profile photo and typewriter citation to the star borders and barcode stickers—becomes an independent, selectable layer. You can drag elements across the canvas, resize them using handles, change fonts and palettes, or delete all decorations to create a pure Swiss minimal layout.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <a
              href="/canvas?blank=true"
              className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold cursor-pointer shadow-md ${
                isLight ? 'bg-[#0f172a] text-white hover:bg-[#1e293b]' : 'bg-[#fcd535] text-[#0b0e11] hover:bg-[#ffe270]'
              }`}
            >
              <FilePlus className="w-3.5 h-3.5" />
              <span>Launch Blank Canvas Studio</span>
            </a>
            <a
              href="/create"
              className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold border cursor-pointer ${
                isLight
                  ? 'bg-white border-[#cbd5e1] text-[#0f172a] hover:bg-[#f1f5f9]'
                  : 'bg-[#14171d] border-[#262c36] text-white hover:bg-[#222730]'
              }`}
            >
              <span>Classic Text Typesetter</span>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};
