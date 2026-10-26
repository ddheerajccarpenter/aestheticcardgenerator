import React, { useState, useMemo, useEffect } from 'react';
import type { CardTemplate } from '../types/card';
import { PRESET_TEMPLATES } from '../data/templates';
import { updatePageSEO } from '../utils/seo';
import {
  SlidersHorizontal,
  Search,
  X,
  Copy,
  Check,
  Maximize2,
  ArrowRight,
} from 'lucide-react';
import { UnifiedCardThumbnail } from '../components/UnifiedCardThumbnail';
import { LazyTemplateCard } from '../components/LazyTemplateCard';

export interface HomeViewProps {
  onOpenEditorWithTemplate?: (template: CardTemplate) => void;
  onNavigateToEditor?: () => void;
  onNavigate?: (path: string) => void;
  theme?: 'dark' | 'light';
  onOpenGuide?: () => void;
}

// Canonical showcase cards to guarantee the exact visual reference match
const REFERENCE_SHOWCASE_CARDS: CardTemplate[] = [
  {
    id: 'field-notes-001',
    title: 'Become Who You Needed',
    category: 'quote',
    categoryLabel: 'Field Notes',
    quote: 'Become who you needed.',
    author: 'A personal reminder.',
    tag: 'FIELD NOTES — 001',
    badge: 'ED. 01',
    theme: {
      id: 'field-linen',
      name: 'Field Linen',
      bg: '#f4ede4',
      ink: '#1c1b18',
      category: 'editorial',
    },
    font: 'sans',
    fontSize: 28,
    align: 'left',
    padding: 36,
    borderRadius: 16,
    showGrain: true,
    showBorder: false,
    showIcon: false,
    iconName: '',
  },
  {
    id: 'object-study-04',
    title: 'Less, But Better',
    category: 'minimal',
    categoryLabel: 'Object Study',
    quote: 'Less, but better.',
    author: 'FORM / FUNCTION',
    tag: 'OBJECT STUDY / 04',
    badge: 'STUDY',
    theme: {
      id: 'terracotta-orange',
      name: 'Terracotta',
      bg: '#d44727',
      ink: '#ffffff',
      category: 'minimal',
    },
    font: 'sans',
    fontSize: 32,
    align: 'left',
    padding: 36,
    borderRadius: 16,
    showGrain: true,
    showBorder: false,
    showIcon: false,
    iconName: '',
  },
  {
    id: 'archive-018',
    title: 'The Details Make the Design',
    category: 'quote',
    categoryLabel: 'Design Axiom',
    quote: 'The details are not the details. They make the design.',
    author: 'Charles Eames',
    tag: 'ARCHIVE — 018',
    badge: 'AESTHETIC',
    theme: {
      id: 'slate-archive',
      name: 'Slate Archive',
      bg: '#1c2533',
      ink: '#ffffff',
      category: 'editorial',
    },
    font: 'sans',
    fontSize: 26,
    align: 'left',
    padding: 36,
    borderRadius: 16,
    showGrain: true,
    showBorder: false,
    showIcon: false,
    iconName: '',
  },
  {
    id: 'identity-2026',
    title: 'Jennie Creative Pass',
    category: 'id-card',
    categoryLabel: 'Identity Pass',
    quote: 'CREATIVE ACCESS PASS • TIER 01',
    author: 'IDENTITY / 2026',
    tag: 'IDENTITY / 2026',
    badge: 'ALL-ACCESS',
    theme: {
      id: 'identity-cream',
      name: 'Identity Sand',
      bg: '#f1ede3',
      ink: '#23211e',
      category: 'badge',
    },
    font: 'sans',
    fontSize: 24,
    align: 'left',
    padding: 36,
    borderRadius: 16,
    showGrain: true,
    showBorder: false,
    showIcon: false,
    iconName: '',
    hasPhotoArea: true,
  },
];

type CategoryFilterId = 'all' | 'quote' | 'id-card' | 'editorial' | 'minimal';

export const HomeView: React.FC<HomeViewProps> = ({
  theme = 'dark',
  onOpenEditorWithTemplate,
}) => {
  const isLight = theme === 'light';
  const [activeCategory, setActiveCategory] = useState<CategoryFilterId>('all');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState<CardTemplate | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    updatePageSEO({
      title: 'ACG — Aesthetic Card Generator | Design Gallery',
      description:
        'Explore aesthetic quote cards, editorial typography, and ID pass designs. Customize and export directly in the browser.',
      canonicalPath: '/',
      ogType: 'website',
    });
  }, []);

  // Combined master collection: reference cards first, then preset templates
  const allCards = useMemo(() => {
    const combined = [...REFERENCE_SHOWCASE_CARDS];
    PRESET_TEMPLATES.forEach((tmpl) => {
      if (!combined.some((c) => c.id === tmpl.id || c.title === tmpl.title)) {
        combined.push(tmpl);
      }
    });
    return combined;
  }, []);

  // Filtered cards based on active pill and search query
  const filteredCards = useMemo(() => {
    return allCards.filter((card) => {
      // Category match
      let matchesCategory = false;
      if (activeCategory === 'all') {
        matchesCategory = true;
      } else if (activeCategory === 'quote') {
        matchesCategory =
          card.category === 'quote' ||
          card.category === 'reflection' ||
          card.category === 'poetry';
      } else if (activeCategory === 'id-card') {
        matchesCategory =
          card.category === 'id-card' ||
          Boolean(card.hasPhotoArea) ||
          card.id.includes('pass') ||
          card.id.includes('id-');
      } else if (activeCategory === 'editorial') {
        matchesCategory =
          card.theme.category === 'editorial' ||
          card.categoryLabel.toLowerCase().includes('editorial') ||
          card.categoryLabel.toLowerCase().includes('field notes') ||
          card.tag.toLowerCase().includes('editorial');
      } else if (activeCategory === 'minimal') {
        matchesCategory =
          card.category === 'minimal' ||
          card.categoryLabel.toLowerCase().includes('minimal') ||
          card.categoryLabel.toLowerCase().includes('study');
      }

      if (!matchesCategory) return false;

      // Search match
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        card.title.toLowerCase().includes(q) ||
        card.quote.toLowerCase().includes(q) ||
        card.author.toLowerCase().includes(q) ||
        card.tag.toLowerCase().includes(q) ||
        card.categoryLabel.toLowerCase().includes(q)
      );
    });
  }, [allCards, activeCategory, searchQuery]);

  const handleUseTemplate = (template: CardTemplate, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (onOpenEditorWithTemplate) {
      onOpenEditorWithTemplate(template);
    } else {
      window.location.href = `/create?template=${template.id}`;
    }
  };

  const handleCopyText = (template: CardTemplate, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${template.quote}\n— ${template.author}`);
    setCopiedId(template.id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleOpenPreview = (template: CardTemplate, e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewTemplate(template);
  };

  return (
    <div className="w-full pt-20 pb-24 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto transition-colors duration-200 text-[#f4f1ea]">
      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* GALLERY HEADER: "Explore designs" + Filter icon                     */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-5 mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-sans text-inherit">
            Explore designs
          </h1>

          {/* Sliders / Filter trigger (matching Reference B) */}
          <button
            onClick={() => setSearchOpen((prev) => !prev)}
            className={`p-2 rounded-lg border transition-colors cursor-pointer ${
              searchOpen
                ? 'border-white bg-[#181a20] text-white'
                : 'border-[#23262d] bg-[#121418] text-[#8e939e] hover:text-white'
            }`}
            title="Toggle Filter & Search"
            aria-label="Filter designs"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Optional Search Bar dropdown */}
        {searchOpen && (
          <div className="relative w-full max-w-md animate-fade-in">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8e939e] pointer-events-none" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by quote, author, style..."
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-[#262a33] bg-[#121418] text-[#f4f1ea] focus:outline-none focus:border-white transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-[#8e939e] hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Category Filter Pills (matching Reference B) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-1.5 rounded-full font-medium transition-all cursor-pointer shrink-0 ${
              activeCategory === 'all'
                ? 'bg-white text-black font-semibold shadow-xs'
                : 'border border-[#262a33] bg-[#121418] text-[#8e939e] hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveCategory('quote')}
            className={`px-4 py-1.5 rounded-full font-medium transition-all cursor-pointer shrink-0 ${
              activeCategory === 'quote'
                ? 'bg-white text-black font-semibold shadow-xs'
                : 'border border-[#262a33] bg-[#121418] text-[#8e939e] hover:text-white'
            }`}
          >
            Quote cards
          </button>
          <button
            onClick={() => setActiveCategory('id-card')}
            className={`px-4 py-1.5 rounded-full font-medium transition-all cursor-pointer shrink-0 ${
              activeCategory === 'id-card'
                ? 'bg-white text-black font-semibold shadow-xs'
                : 'border border-[#262a33] bg-[#121418] text-[#8e939e] hover:text-white'
            }`}
          >
            ID Pass
          </button>
          <button
            onClick={() => setActiveCategory('editorial')}
            className={`px-4 py-1.5 rounded-full font-medium transition-all cursor-pointer shrink-0 ${
              activeCategory === 'editorial'
                ? 'bg-white text-black font-semibold shadow-xs'
                : 'border border-[#262a33] bg-[#121418] text-[#8e939e] hover:text-white'
            }`}
          >
            Editorial
          </button>
          <button
            onClick={() => setActiveCategory('minimal')}
            className={`px-4 py-1.5 rounded-full font-medium transition-all cursor-pointer shrink-0 ${
              activeCategory === 'minimal'
                ? 'bg-white text-black font-semibold shadow-xs'
                : 'border border-[#262a33] bg-[#121418] text-[#8e939e] hover:text-white'
            }`}
          >
            Minimal
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* ARTWORK GALLERY GRID (Dense, Reference B 2-col / Reference A dense) */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {filteredCards.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-3 border border-[#23262d] rounded-2xl bg-[#121418]">
          <span className="text-sm text-[#8e939e]">No designs match your criteria.</span>
          <button
            onClick={() => {
              setActiveCategory('all');
              setSearchQuery('');
            }}
            className="px-4 py-1.5 rounded-full text-xs font-semibold bg-white text-black hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Show All Designs
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6 w-full">
          {filteredCards.map((card) => {
            const isCopied = copiedId === card.id;

            return (
              <article
                key={card.id}
                onClick={() => handleUseTemplate(card)}
                className="group relative rounded-2xl overflow-hidden border border-[#1f2228] hover:border-white/40 transition-all duration-200 cursor-pointer shadow-lg flex flex-col bg-[#121418]"
              >
                {/* Visual Artwork Container */}
                <div className="w-full">
                  <LazyTemplateCard aspectRatioClass="w-full">
                    <UnifiedCardThumbnail
                      template={card}
                      isLight={isLight}
                      className="min-h-[360px] sm:min-h-[420px] p-7 sm:p-9 flex flex-col justify-between"
                    />
                  </LazyTemplateCard>
                </div>

                {/* Restrained Hover / Focus Overlay Bar */}
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/85 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-between z-20 pointer-events-none">
                  <div className="flex items-center gap-2 pointer-events-auto">
                    <button
                      onClick={(e) => handleUseTemplate(card, e)}
                      className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-white text-black hover:bg-slate-200 transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Use Template</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>

                    <button
                      onClick={(e) => handleOpenPreview(card, e)}
                      className="p-1.5 rounded-full border border-white/30 bg-black/50 hover:bg-black text-white transition-colors cursor-pointer"
                      title="Inspect full-resolution preview"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={(e) => handleCopyText(card, e)}
                    className="p-1.5 rounded-full border border-white/30 bg-black/50 hover:bg-black text-white transition-colors cursor-pointer pointer-events-auto"
                    title={isCopied ? 'Copied text!' : 'Copy text'}
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* FULL-RESOLUTION PREVIEW MODAL                                       */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {previewTemplate && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewTemplate(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-[#2a2e37] bg-[#121418] p-6 shadow-2xl flex flex-col gap-5 overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#23262d]">
              <div>
                <h3 className="font-bold text-sm text-white">{previewTemplate.title}</h3>
                <span className="text-[11px] text-[#8e939e]">{previewTemplate.categoryLabel}</span>
              </div>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="p-1 rounded-md text-[#8e939e] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Card Artwork */}
            <div className="w-full rounded-xl overflow-hidden border border-black/20 shadow-xl">
              <UnifiedCardThumbnail
                template={previewTemplate}
                isLight={isLight}
                className="min-h-[380px] p-8"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setPreviewTemplate(null)}
                className="px-4 py-2 rounded-lg text-xs font-medium border border-[#2e323b] hover:bg-[#1a1d24] text-[#8e939e] hover:text-white transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => handleUseTemplate(previewTemplate)}
                className="px-5 py-2 rounded-lg text-xs font-bold bg-white text-black hover:bg-slate-200 transition-colors shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <span>Open in Creator</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
