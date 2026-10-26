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
  LayoutGrid,
  Grid3X3,
  Quote,
  ShieldCheck,
  BookOpen,
  Sparkles,
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
  const [gridColumns, setGridColumns] = useState<'dense' | 'comfortable'>('dense');

  useEffect(() => {
    updatePageSEO({
      title: 'ACG — Aesthetic Card Generator | Design Gallery',
      description:
        'Curated design gallery of aesthetic quote cards, editorial typography, and tactical ID passes. Preview, customize, and export high-resolution designs directly in your browser.',
      canonicalPath: '/',
      ogType: 'website',
    });
  }, []);

  // Filtered cards based on active category pill and live search query
  const filteredCards = useMemo(() => {
    return PRESET_TEMPLATES.filter((card) => {
      // 1. Category filter
      let matchesCategory = false;
      if (activeCategory === 'all') {
        matchesCategory = true;
      } else if (activeCategory === 'quote') {
        matchesCategory =
          card.category === 'quote' ||
          card.category === 'reflection' ||
          card.category === 'poetry' ||
          card.categoryLabel.toLowerCase().includes('quote');
      } else if (activeCategory === 'id-card') {
        matchesCategory =
          card.category === 'id-card' ||
          Boolean(card.hasPhotoArea) ||
          card.id.includes('pass') ||
          card.id.includes('id-') ||
          card.categoryLabel.toLowerCase().includes('id') ||
          card.categoryLabel.toLowerCase().includes('badge') ||
          card.categoryLabel.toLowerCase().includes('pass');
      } else if (activeCategory === 'editorial') {
        matchesCategory =
          card.theme.category === 'editorial' ||
          card.categoryLabel.toLowerCase().includes('editorial') ||
          card.categoryLabel.toLowerCase().includes('field notes') ||
          card.tag.toLowerCase().includes('editorial') ||
          card.tag.toLowerCase().includes('essay') ||
          card.category === 'notes';
      } else if (activeCategory === 'minimal') {
        matchesCategory =
          card.category === 'minimal' ||
          card.categoryLabel.toLowerCase().includes('minimal') ||
          card.categoryLabel.toLowerCase().includes('study') ||
          card.theme.category === 'minimal';
      }

      if (!matchesCategory) return false;

      // 2. Search query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const tagsMatch = card.tags ? card.tags.some((tag) => tag.toLowerCase().includes(q)) : false;

      return (
        card.title.toLowerCase().includes(q) ||
        card.quote.toLowerCase().includes(q) ||
        card.author.toLowerCase().includes(q) ||
        card.tag.toLowerCase().includes(q) ||
        card.categoryLabel.toLowerCase().includes(q) ||
        tagsMatch
      );
    });
  }, [activeCategory, searchQuery]);

  const handleUseTemplate = (template: CardTemplate, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (onOpenEditorWithTemplate) {
      onOpenEditorWithTemplate(template);
    } else {
      sessionStorage.setItem('aesthetic_card_studio_selected_template', template.id);
      window.location.href = `/create?template=${template.id}`;
    }
  };

  const handleCopyText = (template: CardTemplate, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${template.quote}\n— ${template.author}`);
    setCopiedId(template.id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleOpenPreview = (template: CardTemplate, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setPreviewTemplate(template);
  };

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPreviewTemplate(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Helper icon for card category in metadata strip
  const getCategoryIcon = (category: string) => {
    if (category === 'id-card' || category.includes('pass') || category.includes('badge')) {
      return <ShieldCheck className="w-3.5 h-3.5 text-inherit opacity-75" />;
    }
    if (category === 'editorial' || category === 'notes') {
      return <BookOpen className="w-3.5 h-3.5 text-inherit opacity-75" />;
    }
    if (category === 'minimal') {
      return <Sparkles className="w-3.5 h-3.5 text-inherit opacity-75" />;
    }
    return <Quote className="w-3.5 h-3.5 text-inherit opacity-75" />;
  };

  return (
    <div className="w-full pt-6 md:pt-8 pb-20 px-4 sm:px-6 md:px-8 max-w-[1500px] mx-auto text-[var(--app-text-primary)] transition-colors duration-200">
      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* COMPACT GALLERY CONTROLS (Reference A Layout + Reference B Headings)*/}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <section aria-label="Gallery Controls" className="flex flex-col gap-4 mb-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Left: Compact "Explore designs" Heading */}
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight font-sans text-inherit">
              Explore designs
            </h1>
            <span className="text-xs font-mono text-[var(--app-text-secondary)] px-2 py-0.5 rounded border border-[var(--app-border-subtle)] bg-[var(--app-surface-secondary)]">
              {filteredCards.length}
            </span>
          </div>

          {/* Center / Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-medium">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer shrink-0 ${
                activeCategory === 'all'
                  ? 'bg-[var(--app-accent)] text-[var(--app-accent-ink)] font-semibold'
                  : 'border border-[var(--app-border-subtle)] bg-[var(--app-surface)] text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)] hover:border-[var(--app-border-strong)]'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveCategory('quote')}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer shrink-0 ${
                activeCategory === 'quote'
                  ? 'bg-[var(--app-accent)] text-[var(--app-accent-ink)] font-semibold'
                  : 'border border-[var(--app-border-subtle)] bg-[var(--app-surface)] text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)] hover:border-[var(--app-border-strong)]'
              }`}
            >
              Quote Cards
            </button>
            <button
              onClick={() => setActiveCategory('id-card')}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer shrink-0 ${
                activeCategory === 'id-card'
                  ? 'bg-[var(--app-accent)] text-[var(--app-accent-ink)] font-semibold'
                  : 'border border-[var(--app-border-subtle)] bg-[var(--app-surface)] text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)] hover:border-[var(--app-border-strong)]'
              }`}
            >
              ID Pass
            </button>
            <button
              onClick={() => setActiveCategory('editorial')}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer shrink-0 ${
                activeCategory === 'editorial'
                  ? 'bg-[var(--app-accent)] text-[var(--app-accent-ink)] font-semibold'
                  : 'border border-[var(--app-border-subtle)] bg-[var(--app-surface)] text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)] hover:border-[var(--app-border-strong)]'
              }`}
            >
              Editorial
            </button>
            <button
              onClick={() => setActiveCategory('minimal')}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer shrink-0 ${
                activeCategory === 'minimal'
                  ? 'bg-[var(--app-accent)] text-[var(--app-accent-ink)] font-semibold'
                  : 'border border-[var(--app-border-subtle)] bg-[var(--app-surface)] text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)] hover:border-[var(--app-border-strong)]'
              }`}
            >
              Minimal
            </button>
          </div>

          {/* Right: Search Toggle, Grid Density Toggle */}
          <div className="flex items-center gap-2">
            {/* Search Trigger */}
            <button
              onClick={() => setSearchOpen((prev) => !prev)}
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                searchOpen || searchQuery
                  ? 'border-[var(--app-accent)] bg-[var(--app-surface-secondary)] text-[var(--app-text-primary)]'
                  : 'border-[var(--app-border-subtle)] bg-[var(--app-surface)] text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)] hover:border-[var(--app-border-strong)]'
              }`}
              title="Toggle search filter"
              aria-label="Toggle search filter"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            {/* Grid Density Toggle (Reference A top right icon) */}
            <div className="hidden sm:flex items-center border border-[var(--app-border-subtle)] bg-[var(--app-surface)] rounded-md p-0.5">
              <button
                onClick={() => setGridColumns('dense')}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  gridColumns === 'dense'
                    ? 'bg-[var(--app-accent)] text-[var(--app-accent-ink)]'
                    : 'text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)]'
                }`}
                title="Dense Grid (Reference A)"
                aria-label="Dense Grid"
              >
                <Grid3X3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setGridColumns('comfortable')}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  gridColumns === 'comfortable'
                    ? 'bg-[var(--app-accent)] text-[var(--app-accent-ink)]'
                    : 'text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)]'
                }`}
                title="Showcase Grid (Reference B)"
                aria-label="Showcase Grid"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Expandable Instant Search Bar */}
        {searchOpen && (
          <div className="relative w-full max-w-md animate-fade-in pt-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8e939e] pointer-events-none" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Instant search by title, quote, author, tag..."
              className="w-full pl-9 pr-9 py-2 text-xs rounded border border-[var(--app-border-subtle)] bg-[var(--app-surface)] text-[var(--app-text-primary)] placeholder-[var(--app-text-muted)] focus:outline-none focus:border-[var(--app-accent)] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-[#8e939e] hover:text-white cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </section>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* ARTWORK GALLERY GRID (Reference A Visual Density + Immediate Focus)  */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {filteredCards.length === 0 ? (
        <div className="py-24 text-center flex flex-col items-center justify-center gap-3 border border-[var(--app-border-subtle)] rounded-lg bg-[var(--app-surface)]">
          <span className="text-sm text-[var(--app-text-secondary)]">No designs match your criteria.</span>
          <button
            onClick={() => {
              setActiveCategory('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded text-xs font-semibold bg-[var(--app-accent)] text-[var(--app-accent-ink)] hover:bg-[var(--app-accent-hover)] transition-colors cursor-pointer mt-2"
          >
            Show All Designs
          </button>
        </div>
      ) : (
        <div
          className={`grid gap-6 w-full ${
            gridColumns === 'dense'
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3'
              : 'grid-cols-1 md:grid-cols-2'
          }`}
        >
          {filteredCards.map((card) => {
            const isCopied = copiedId === card.id;

            return (
              <article
                key={card.id}
                onClick={() => handleOpenPreview(card)}
                className="group relative rounded-lg overflow-hidden border border-[var(--app-border-subtle)] hover:border-[var(--app-border-strong)] transition-colors duration-200 cursor-pointer flex flex-col bg-[var(--app-surface)]"
              >
                {/* Visual Card Artwork Viewport */}
                <div className="w-full overflow-hidden">
                  <LazyTemplateCard aspectRatioClass="w-full">
                    <UnifiedCardThumbnail
                      template={card}
                      isLight={isLight}
                      className="min-h-[340px] sm:min-h-[380px] p-7 flex flex-col justify-between"
                    />
                  </LazyTemplateCard>
                </div>

                {/* Restrained Metadata Strip Under Card (Reference A Pattern) */}
                <div className="p-3.5 px-4 bg-[var(--app-surface)] border-t border-[var(--app-border-subtle)] flex items-center justify-between text-xs select-none">
                  {/* Left: Icon glyph + Title */}
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="p-1 rounded bg-[var(--app-surface-secondary)] text-[var(--app-text-secondary)] shrink-0">
                      {getCategoryIcon(card.category)}
                    </div>
                    <span className="font-semibold text-xs tracking-tight text-[var(--app-text-primary)] truncate max-w-[170px] sm:max-w-[210px]">
                      {card.title}
                    </span>
                    <span className="hidden sm:inline-block text-[10px] font-mono text-[var(--app-text-secondary)] border border-[var(--app-border-subtle)] px-1.5 py-0.5 rounded uppercase">
                      {card.categoryLabel}
                    </span>
                  </div>

                  {/* Right: Author / Aspect Format */}
                  <div className="text-[11px] text-[var(--app-text-secondary)] font-sans truncate shrink-0 max-w-[120px] text-right">
                    {card.author}
                  </div>
                </div>

                {/* Restrained Hover / Focus Overlay Action Dock */}
                <div className="absolute inset-x-0 bottom-12 p-3 bg-[var(--app-surface)] border-t border-[var(--app-border-subtle)] opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150 flex items-center justify-between z-20 pointer-events-none">
                  <div className="flex items-center gap-2 pointer-events-auto">
                    <button
                      onClick={(e) => handleUseTemplate(card, e)}
                      className="px-3 py-1.5 rounded text-xs font-semibold bg-[var(--app-accent)] text-[var(--app-accent-ink)] hover:bg-[var(--app-accent-hover)] transition-colors flex items-center gap-1.5 cursor-pointer"
                      title="Open in Creator"
                    >
                      <span>Use Template</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>

                    <button
                      onClick={(e) => handleOpenPreview(card, e)}
                      className="p-1.5 rounded border border-[var(--app-border-subtle)] bg-[var(--app-surface-secondary)] text-[var(--app-text-primary)] transition-colors cursor-pointer"
                      title="Inspect full-resolution preview"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={(e) => handleCopyText(card, e)}
                    className="p-1.5 rounded border border-[var(--app-border-subtle)] bg-[var(--app-surface-secondary)] text-[var(--app-text-primary)] transition-colors cursor-pointer pointer-events-auto"
                    title={isCopied ? 'Copied quote!' : 'Copy formatted quote'}
                  >
                    {isCopied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
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
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setPreviewTemplate(null)}
        >
          <div
            className="w-full max-w-lg rounded-lg border border-[var(--app-border-subtle)] bg-[var(--app-surface)] p-6 flex flex-col gap-5 overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[var(--app-border-subtle)]">
              <div>
                <h3 className="font-bold text-sm text-[var(--app-text-primary)]">{previewTemplate.title}</h3>
                <span className="text-[11px] text-[var(--app-text-secondary)]">{previewTemplate.categoryLabel}</span>
              </div>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="p-1.5 rounded text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)] hover:bg-[var(--app-surface-secondary)] transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Card Artwork */}
            <div className="w-full rounded-xl overflow-hidden border border-black/30 shadow-xl">
              <UnifiedCardThumbnail
                template={previewTemplate}
                isLight={isLight}
                className="min-h-[400px] p-8"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={(e) => handleCopyText(previewTemplate, e)}
                className="px-3 py-1.5 rounded text-xs font-medium border border-[var(--app-border-subtle)] bg-[var(--app-surface-secondary)] hover:bg-[var(--app-surface)] text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)] transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {copiedId === previewTemplate.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="px-4 py-2 rounded text-xs font-medium border border-[var(--app-border-subtle)] hover:bg-[var(--app-surface-secondary)] text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)] transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => handleUseTemplate(previewTemplate)}
                  className="px-5 py-2 rounded text-xs font-semibold bg-[var(--app-accent)] text-[var(--app-accent-ink)] hover:bg-[var(--app-accent-hover)] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Open in Creator</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
