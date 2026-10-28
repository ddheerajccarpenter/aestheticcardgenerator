import React, { useState, useMemo, useEffect } from 'react';
import type { CardTemplate } from '../types/card';
import { PRESET_TEMPLATES } from '../data/templates';
import { updatePageSEO } from '../utils/seo';
import {
  Search,
  X,
  ArrowRight,
  ChevronRight,
  FilePlus,
  FileQuestion,
  Layers,
} from 'lucide-react';
import { TemplateComparisonModal } from '../components/TemplateComparisonModal';
import { TemplateComparisonDock } from '../components/TemplateComparisonDock';
import { UnifiedCardThumbnail } from '../components/UnifiedCardThumbnail';
import { getTemplateAspectRatio } from '../utils/templateAspectRatio';
import { LazyTemplateCard } from '../components/LazyTemplateCard';

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
  onOpenEditorWithTemplate,
}) => {
  const isLight = theme === 'light';
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedForCompare, setSelectedForCompare] = useState<CardTemplate[]>([]);
  const [comparisonModalOpen, setComparisonModalOpen] = useState(false);

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

  useEffect(() => {
    updatePageSEO({
      title: 'Aesthetic Template Library — 70 Curated Card Designs',
      description:
        'Explore 70 editable card designs, including ID passes, pastel cards, vintage travel licenses, and minimalist credentials.',
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
    <div className="w-full pt-20 pb-20 transition-colors duration-200 text-[var(--app-text-primary)]">
      <div className="studio-container flex flex-col gap-10">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="studio-breadcrumb">
          <a href="/" className="cursor-pointer">
            Home
          </a>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="active">Templates</span>
        </nav>

        {/* Clean Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--app-border-subtle)]">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--app-text-muted)] font-subheading block mb-1">
              Curated Style Archive
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-heading">
              Card Templates
            </h1>
            <p className="text-xs text-[var(--app-text-muted)] mt-1 font-subheading">
              {PRESET_TEMPLATES.length} curated typographic and aesthetic styles ready to edit
            </p>
          </div>
          <a
            href="/canvas?blank=true"
            className="studio-btn-primary"
          >
            <FilePlus className="w-4 h-4" />
            <span>Blank Canvas</span>
          </a>
        </header>

        {/* SEARCH & CATEGORY FILTER TABS */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--app-text-muted)] pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search styles (e.g. 'Jennie', 'Y2K', 'Swiss', 'Minimal')..."
                className="studio-input w-full pl-10 pr-9"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-[var(--app-text-muted)] hover:text-[var(--app-text-primary)] cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="text-xs text-[var(--app-text-muted)] font-subheading">
              Showing <strong className="text-[var(--app-text-primary)]">{filteredTemplates.length}</strong> of{' '}
              {PRESET_TEMPLATES.length} styles
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
                  className={`studio-pill ${activeCategory === tab.id ? 'active' : ''}`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                      activeCategory === tab.id
                        ? 'bg-black/15 dark:bg-white/20'
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
          <div className="studio-panel p-12 text-center flex flex-col items-center gap-3">
            <FileQuestion className="w-10 h-10 text-[var(--app-text-muted)]" />
            <h3 className="text-base font-bold font-heading text-[var(--app-text-primary)]">
              No templates match "{searchQuery}"
            </h3>
            <p className="text-xs text-[var(--app-text-secondary)] max-w-sm">
              Try searching for "ID", "Vintage", "Pastel", "Minimal", or reset the category filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
              }}
              className="studio-btn-primary mt-2"
            >
              Show All {PRESET_TEMPLATES.length} Styles
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            {filteredTemplates.map((template) => {
              const isSelected = selectedForCompare.some((t) => t.id === template.id);

              return (
                <article
                  key={template.id}
                  className="studio-panel overflow-hidden transition-all duration-200 hover:-translate-y-1 flex flex-col"
                >
                  {/* Real Card Visual Artwork Preview (Unified with Archival Blueprint Lazy-Loading) */}
                  <LazyTemplateCard aspectRatio={getTemplateAspectRatio(template)} className="border border-[var(--app-border-subtle)]">
                    <UnifiedCardThumbnail
                      template={template}
                      isLight={isLight}
                      className="h-full w-full"
                    />
                  </LazyTemplateCard>

                  {/* Card Footer Bar with actions */}
                  <div className="p-4 flex flex-col gap-3 bg-[var(--app-surface-secondary)] border-t border-[var(--app-border-subtle)] mt-auto">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold font-heading text-[var(--app-text-primary)]">
                          {template.title}
                        </h3>
                        <span className="text-[10px] text-[var(--app-text-muted)] font-subheading">
                          {template.categoryLabel}
                        </span>
                      </div>
                      <button
                        onClick={() => toggleCompareTemplate(template)}
                        className={`text-xs px-2.5 py-1 rounded-lg border font-semibold cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-[var(--app-accent)] text-[var(--app-accent-ink)] border-[var(--app-accent)]'
                            : 'border-[var(--app-border-subtle)] text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)] hover:border-[var(--app-border-strong)]'
                        }`}
                      >
                        {isSelected ? 'Remove Compare' : '+ Compare'}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <a
                        href={`/canvas?template=${template.id}`}
                        className="studio-btn-primary !py-2 !text-xs !rounded-xl"
                        title="Open in Freeform Canvas Studio"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Canvas Studio</span>
                      </a>

                      <a
                        href={`/create?template=${template.id}`}
                        onClick={(e) => {
                          if (onOpenEditorWithTemplate) {
                            e.preventDefault();
                            onOpenEditorWithTemplate(template);
                          }
                        }}
                        className="studio-btn-secondary !py-2 !text-xs !rounded-xl"
                        title="Open in classic text typesetting editor"
                      >
                        <span>Card Creator</span>
                        <ArrowRight className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}


      </div>

      {/* Floating Comparison Dock */}
      <TemplateComparisonDock
        selectedTemplates={selectedForCompare}
        onRemoveTemplate={(id) => setSelectedForCompare((prev) => prev.filter((t) => t.id !== id))}
        onClear={() => setSelectedForCompare([])}
        onOpenModal={() => setComparisonModalOpen(true)}
        theme={theme}
      />

      {/* Side-by-Side Comparison Modal */}
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

