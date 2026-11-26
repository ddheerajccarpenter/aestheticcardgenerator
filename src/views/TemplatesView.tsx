import React, { useState, useMemo, useEffect } from 'react';
import type { CardTemplate } from '../types/card';
import { PRESET_TEMPLATES } from '../data/templates';
import { PRODUCTION_DOMAIN, updatePageSEO } from '../utils/seo';
import {
  Search,
  X,
  ArrowRight,
  ChevronRight,
  FilePlus,
  FileQuestion,
  Layers,
  Sparkles,
} from 'lucide-react';
import { TemplateComparisonModal } from '../components/TemplateComparisonModal';
import { TemplateComparisonDock } from '../components/TemplateComparisonDock';
import { UnifiedCardThumbnail } from '../components/UnifiedCardThumbnail';
import { AdSlot } from '../components/AdSlot';
import { getTemplateAspectRatio } from '../utils/templateAspectRatio';
import { LazyTemplateCard } from '../components/LazyTemplateCard';
import { getTemplateAmbientTones } from '../utils/templateAmbient';
import { setAmbientTones, setAmbientEnabled, getAmbientState } from '../engines/ambientAtmosphere';

interface TemplatesViewProps {
  onNavigate?: (path: string) => void;
  onOpenEditorWithTemplate?: (template: CardTemplate) => void;
  theme?: 'dark' | 'light';
}

const CATEGORY_TABS = [
  { id: 'all', label: 'All designs', href: '/templates' },
  { id: 'poster', label: 'Posters', href: '/templates?cat=poster' },
  { id: 'id-card', label: 'ID & passes', href: '/templates/aesthetic-id-cards' },
  { id: 'pastel', label: 'Cute & Pastel', href: '/templates?cat=pastel' },
  { id: 'vintage', label: 'Vintage & Retro', href: '/templates/scrapbook-cards' },
  { id: 'fan', label: 'Fan & Character', href: '/templates/social-text-cards' },
  { id: 'minimal', label: 'Minimal', href: '/templates/minimal-cards' },
  { id: 'school', label: 'Study Notes', href: '/templates/study-note-cards' },
  { id: 'quote', label: 'Quote Cards', href: '/templates/quote-cards' },
];

export const TemplatesView: React.FC<TemplatesViewProps> = ({
  theme = 'dark',
}) => {
  const isLight = theme === 'light';
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('cat') || 'all';
    }
    return 'all';
  });
  const [selectedForCompare, setSelectedForCompare] = useState<CardTemplate[]>([]);
  const [comparisonModalOpen, setComparisonModalOpen] = useState(false);
  const [ambientEnabled, setAmbientEnabledState] = useState<boolean>(() => getAmbientState().enabled);

  const toggleAmbient = () => {
    const next = !ambientEnabled;
    setAmbientEnabledState(next);
    setAmbientEnabled(next);
  };

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
      title: 'Aesthetic Template Library — Editable Card Designs',
      description:
        'Explore editable card designs, including ID passes, pastel cards, vintage travel licenses, and minimalist credentials.',
      canonicalPath: '/templates',
      ogType: 'website',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${PRODUCTION_DOMAIN}/` },
          { '@type': 'ListItem', position: 2, name: 'Templates', item: `${PRODUCTION_DOMAIN}/templates` },
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

  useEffect(() => {
    if (typeof window === 'undefined' || !ambientEnabled) return;

    let timer: ReturnType<typeof setTimeout> | null = null;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;

        const viewportCenter = window.innerHeight / 2;
        let closest = visible[0];
        let minDiff = Infinity;

        for (const entry of visible) {
          const rect = entry.boundingClientRect;
          const cardCenter = rect.top + rect.height / 2;
          const diff = Math.abs(cardCenter - viewportCenter);
          if (diff < minDiff) {
            minDiff = diff;
            closest = entry;
          }
        }

        const templateId = closest.target.getAttribute('data-template-id');
        if (!templateId) return;

        const matched = filteredTemplates.find((t) => t.id === templateId);
        if (!matched) return;

        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          const tones = getTemplateAmbientTones(matched, isLight ? 'light' : 'dark');
          setAmbientTones(tones);
        }, 120);
      },
      {
        rootMargin: '-20% 0px -20% 0px',
        threshold: [0.15, 0.45, 0.75],
      }
    );

    const cards = document.querySelectorAll('.template-ambient-card');
    cards.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, [filteredTemplates, isLight, ambientEnabled]);

  return (
    <div className="w-full pt-8 sm:pt-12 pb-28 md:pb-20 text-[var(--app-text-primary)] transition-colors duration-200">
      <div className="studio-container flex flex-col gap-8 sm:gap-10">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="studio-breadcrumb glass-surface w-fit rounded-full px-3 py-2">
          <a href="/" className="cursor-pointer">
            Home
          </a>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="active">Templates</span>
        </nav>

        <header className="grid gap-5 border-b border-[var(--app-border-subtle)] pb-6 lg:grid-cols-[1fr_auto] lg:items-end animate-card-entrance">
          <div className="max-w-2xl">
            <span className="editorial-kicker mb-2 block">{PRESET_TEMPLATES.length} Free Templates</span>
            <h1 className="font-heading text-4xl leading-[0.94] tracking-tight sm:text-6xl">
              Make it your own.
            </h1>
            <p className="mt-3 text-sm text-[var(--app-text-secondary)]">
              Pick a layout and customize every layer free.
            </p>
          </div>
          <a
            href="/canvas?blank=true"
            className="studio-btn-primary btn-sheen interactive-tactile min-h-11 w-fit px-5"
          >
            <FilePlus className="w-4 h-4" />
            <span>Blank canvas</span>
          </a>
        </header>

        {/* SEARCH & CATEGORY FILTER TABS */}
        <div className="studio-panel flex flex-col gap-4 p-3 sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Search Input */}
            <div className="relative w-full max-w-xl">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--app-text-muted)] pointer-events-none" />
              <input
                aria-label="Search templates by title, quote, author, or tag"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, quote, or style"
                className="studio-input w-full !pl-10 !pr-9"
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

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={toggleAmbient}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-colors cursor-pointer ${
                  ambientEnabled
                    ? 'border-[var(--app-accent)] bg-[var(--app-accent)]/10 text-[var(--app-accent)] font-semibold'
                    : 'border-[var(--app-border-subtle)] bg-[var(--app-surface-secondary)] text-[var(--app-text-muted)] hover:text-[var(--app-text-primary)]'
                }`}
                title="Toggle scroll-reactive ambient lighting atmosphere"
                aria-pressed={ambientEnabled}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Atmosphere: {ambientEnabled ? 'On' : 'Off'}</span>
              </button>
              <div className="shrink-0 text-xs text-[var(--app-text-secondary)] font-subheading" aria-live="polite">
                <strong className="text-[var(--app-text-primary)]">{filteredTemplates.length}</strong> of {PRESET_TEMPLATES.length} designs
              </div>
            </div>
          </div>

          {/* Primary Category Filter Tabs */}
          <nav aria-label="Filter templates by category" className="flex flex-wrap items-center gap-2 pb-1">
            {CATEGORY_TABS.map((tab) => {
              const count =
                tab.id === 'all'
                  ? PRESET_TEMPLATES.length
                  : tab.id === 'quote'
                  ? PRESET_TEMPLATES.filter((t) => ['quote', 'reflection', 'notes', 'review', 'poetry'].includes(t.category)).length
                  : PRESET_TEMPLATES.filter((t) => t.category === tab.id).length;

              return (
                <a
                  key={tab.id}
                  href={tab.href}
                  aria-current={activeCategory === tab.id ? 'page' : undefined}
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
                </a>
              );
            })}
          </nav>
        </div>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* TEMPLATES GRID                                                      */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {filteredTemplates.length === 0 ? (
          <div className="studio-panel flex flex-col items-center gap-3 p-10 text-center">
            <FileQuestion className="w-10 h-10 text-[var(--app-text-muted)]" />
            <h3 className="font-heading text-2xl text-[var(--app-text-primary)]">
              No matches for "{searchQuery}"
            </h3>
            <a
              href="/templates"
              className="studio-btn-primary mt-2"
            >
              Show All {PRESET_TEMPLATES.length}
            </a>
          </div>
        ) : (
          <div className="columns-1 md:columns-2 xl:columns-3 gap-5 [column-fill:_balance]">
            {filteredTemplates.map((template, idx) => {
              const isSelected = selectedForCompare.some((t) => t.id === template.id);

              return (
                <article
                  key={template.id}
                  data-template-id={template.id}
                  style={{ '--stagger-i': idx % 10 } as React.CSSProperties}
                  className="break-inside-avoid mb-5 template-ambient-card group flex flex-col overflow-hidden rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface)] transition-all card-editorial-hover animate-card-entrance"
                >
                  {/* Real Card Visual Artwork Preview (Safely container-padded to prevent right edge clipping) */}
                  <a href={`/card/${template.id}`} aria-label={`View ${template.title}`} className="block">
                    <div className="p-3 pb-0">
                      <LazyTemplateCard aspectRatio={getTemplateAspectRatio(template)} className="w-full overflow-hidden rounded-sm border border-[var(--app-border-subtle)] card-artwork-zoom">
                        <UnifiedCardThumbnail
                          template={template}
                          isLight={isLight}
                          className="h-full w-full"
                        />
                      </LazyTemplateCard>
                    </div>
                  </a>

                  {/* Card Footer Bar with actions */}
                  <div className="flex flex-col gap-3 border-t border-[var(--app-border-subtle)] p-4 mt-3">
                    <div className="flex items-start justify-between gap-3">
                      <a href={`/card/${template.id}`} className="min-w-0">
                        <h3 className="truncate text-base font-semibold text-[var(--app-text-primary)] group-hover:text-[var(--app-accent)] transition-colors">
                          {template.title}
                        </h3>
                        <span className="mt-1 block text-[10px] uppercase tracking-[0.08em] text-[var(--app-text-muted)] font-subheading">
                          {template.categoryLabel}
                        </span>
                      </a>
                      <button
                        onClick={() => toggleCompareTemplate(template)}
                        type="button"
                        aria-pressed={isSelected}
                        className={`min-h-[38px] shrink-0 rounded-xl border px-3 py-1.5 text-[10px] font-semibold transition-colors interactive-tactile cursor-pointer ${
                          isSelected
                            ? 'bg-[var(--app-accent)] text-[var(--app-accent-ink)] border-[var(--app-accent)]'
                            : 'border-[var(--app-border-subtle)] text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)] hover:border-[var(--app-border-strong)]'
                        }`}
                      >
                        {isSelected ? 'Compared' : '+ Compare'}
                      </button>
                    </div>

                    <div className={`grid ${template.canvasDoc ? 'grid-cols-1' : 'grid-cols-2'} gap-2 pt-1`}>
                      <a
                        href={`/canvas?template=${template.id}`}
                        className="studio-btn-primary min-h-[44px] !py-2 !text-xs !rounded-xl interactive-tactile"
                        title="Open in Freeform Canvas Studio"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Customize</span>
                      </a>

                      {!template.canvasDoc && <a
                        href={`/create?template=${template.id}`}
                        className="studio-btn-secondary min-h-[44px] !py-2 !text-xs !rounded-xl interactive-tactile"
                        title="Open in classic text typesetting editor"
                      >
                        <span>Quick card</span>
                        <ArrowRight className="w-3 h-3" />
                      </a>}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <AdSlot slotId="templates-bottom-slot" format="horizontal" />
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
          window.location.href = `/card/${encodeURIComponent(tmpl.id)}`;
        }}
        theme={theme}
      />
    </div>
  );
};

