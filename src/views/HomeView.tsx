import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { CardTemplate } from '../types/card';
import { PRESET_TEMPLATES } from '../data/templates';
import { HOME_AEO_FAQ, PRODUCTION_DOMAIN, updatePageSEO } from '../utils/seo';
import { ArrowRight, Check, Copy, Search, X } from 'lucide-react';
import { UnifiedCardThumbnail } from '../components/UnifiedCardThumbnail';
import { LazyTemplateCard } from '../components/LazyTemplateCard';
import { getTemplateAspectRatio } from '../utils/templateAspectRatio';
import { AdSlot } from '../components/AdSlot';

export interface HomeViewProps {
  onOpenEditorWithTemplate?: (template: CardTemplate) => void;
  onNavigateToEditor?: () => void;
  onNavigate?: (path: string) => void;
  theme?: 'dark' | 'light';
  onOpenGuide?: () => void;
}

type CategoryFilterId = 'all' | 'quote' | 'id-card' | 'editorial' | 'minimal';

const FILTERS: Array<{ id: CategoryFilterId; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'quote', label: 'Quote Cards' },
  { id: 'id-card', label: 'ID Pass' },
  { id: 'editorial', label: 'Editorial' },
  { id: 'minimal', label: 'Minimal' },
];

const matchesCategory = (card: CardTemplate, filter: CategoryFilterId) => {
  const label = card.categoryLabel.toLowerCase();
  const tag = card.tag.toLowerCase();
  const id = card.id.toLowerCase();

  if (filter === 'all') return true;
  if (filter === 'quote') {
    return ['quote', 'reflection', 'poetry'].includes(card.category) || label.includes('quote');
  }
  if (filter === 'id-card') {
    return card.category === 'id-card' || Boolean(card.hasPhotoArea) || id.includes('pass') || id.includes('id-') ||
      ['id', 'badge', 'pass'].some((term) => label.includes(term));
  }
  if (filter === 'editorial') {
    return card.theme.category === 'editorial' || card.category === 'notes' ||
      ['editorial', 'field notes', 'essay'].some((term) => label.includes(term) || tag.includes(term));
  }
  return card.category === 'minimal' || card.theme.category === 'minimal' ||
    ['minimal', 'study'].some((term) => label.includes(term));
};

export const HomeView: React.FC<HomeViewProps> = ({ onOpenEditorWithTemplate }) => {
  const [activeCategory, setActiveCategory] = useState<CategoryFilterId>('all');
  const [galleryLayout, setGalleryLayout] = useState<'roomy' | 'compact'>(() => {
    try {
      return window.localStorage.getItem('acg-gallery-layout') === 'compact' ? 'compact' : 'roomy';
    } catch {
      return 'roomy';
    }
  });
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState<CardTemplate | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const previewDialogRef = useRef<HTMLDialogElement | null>(null);
  const previewTriggerRef = useRef<HTMLButtonElement | null>(null);
  const heroStageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let rafId: number | null = null;
    const update = () => {
      rafId = null;
      const el = heroStageRef.current;
      if (!el) return;
      const progress = Math.min(1, Math.max(0, window.scrollY / Math.max(360, window.innerHeight * 0.75)));
      el.style.setProperty('--scroll-p', progress.toFixed(4));
    };
    const onScroll = () => {
      if (rafId === null) rafId = window.requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    updatePageSEO({
      title: 'Aesthetic Card Generator - Free Quote Cards, ID Passes & Posters',
      description: 'Browse quote cards, editorial designs, and ID passes. Customize and export watermark-free designs locally in your browser.',
      canonicalPath: '/',
      ogType: 'website',
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'Aesthetic Card Generator',
          url: PRODUCTION_DOMAIN,
        },
        {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: HOME_AEO_FAQ.map((item) => ({
            '@type': 'Question',
            name: item.q,
            acceptedAnswer: { '@type': 'Answer', text: item.a },
          })),
        },
      ],
    });
  }, []);

  const filteredCards = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return PRESET_TEMPLATES.filter((card) => {
      if (!matchesCategory(card, activeCategory)) return false;
      if (!query) return true;
      const searchText = [card.title, card.quote, card.author, card.tag, card.categoryLabel, card.description, ...(card.tags || [])]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return searchText.includes(query);
    });
  }, [activeCategory, searchQuery]);

  const heroTemplates = PRESET_TEMPLATES.slice(0, 4);

  useEffect(() => {
    const dialog = previewDialogRef.current;
    if (!dialog) return;
    if (previewTemplate && !dialog.open) dialog.showModal();
    if (!previewTemplate && dialog.open) dialog.close();
  }, [previewTemplate]);

  const handleUseTemplate = (template: CardTemplate) => {
    if (onOpenEditorWithTemplate) {
      onOpenEditorWithTemplate(template);
      return;
    }
    sessionStorage.setItem('aesthetic_card_studio_selected_template', template.id);
    const targetPath = template.canvasDoc?.objects?.length ? '/canvas' : '/create';
    window.location.href = `${targetPath}?template=${encodeURIComponent(template.id)}`;
  };

  const handleCopyText = async (template: CardTemplate) => {
    try {
      await navigator.clipboard.writeText(`${template.quote}\n— ${template.author}`);
      setCopiedId(template.id);
      setFeedback(`Copied ${template.title}`);
      window.setTimeout(() => setCopiedId((current) => current === template.id ? null : current), 1800);
    } catch {
      setFeedback('Clipboard access is unavailable in this browser.');
    }
  };

  const openPreview = (template: CardTemplate, event: React.MouseEvent<HTMLButtonElement>) => {
    previewTriggerRef.current = event.currentTarget;
    setPreviewTemplate(template);
  };

  const closePreview = () => {
    if (previewDialogRef.current?.open) previewDialogRef.current.close();
    else setPreviewTemplate(null);
  };

  const handleDialogClose = () => {
    setPreviewTemplate(null);
    previewTriggerRef.current?.focus();
  };

  return (
    <div className="mx-auto w-full max-w-[1580px] px-3 pb-24 pt-4 sm:px-6 sm:pt-8 md:px-8 md:pb-16 text-[var(--app-text-primary)]">
      <section aria-labelledby="home-title" className="home-hero grid min-h-[min(76vh,760px)] items-center gap-4 sm:gap-6 overflow-hidden rounded-2xl sm:rounded-[2rem] border border-[var(--app-border-subtle)] bg-[var(--app-surface)] px-4 py-5 sm:px-8 sm:py-8 md:px-12 lg:grid-cols-[0.88fr_1.12fr] lg:px-14 lg:py-12">
        <div className="relative z-10 max-w-2xl py-1 sm:py-2 lg:py-8">
          <p className="editorial-kicker">A small studio for card design</p>
          <h1 id="home-title" className="mt-3 sm:mt-5 max-w-[14ch] text-[clamp(2.25rem,6vw,5.5rem)] font-heading leading-[0.95] tracking-tight">
            Make something <span className="font-editorial font-normal italic text-[var(--app-accent)]">worth keeping.</span>
          </h1>
          <p className="mt-3 sm:mt-6 max-w-lg text-sm leading-6 sm:leading-7 text-[var(--app-text-secondary)] sm:text-base">
            Start with a card style or an empty canvas. Shape the type, images, and details, then export directly from your browser.
          </p>
          <div className="mt-4 sm:mt-7 flex flex-wrap items-center gap-2.5 sm:gap-3">
            <a href="/canvas?blank=true" className="btn-editorial-primary min-h-11 px-5">
              Open the canvas <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <a href="/templates" className="btn-editorial-ghost min-h-11 px-5">
              Browse templates
            </a>
            <a href="/premium" className="btn-editorial-ghost min-h-11 px-5">
              Signature Free
            </a>
            <a href="/bingo" className="btn-editorial-ghost min-h-11 px-5">
              Bingo cards
            </a>
          </div>
          <div className="mt-5 sm:mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[var(--app-border-subtle)] pt-3 sm:pt-4 text-[10px] uppercase tracking-[0.1em] text-[var(--app-text-muted)]">
            <span>{PRESET_TEMPLATES.length} editable designs</span>
            <span aria-hidden="true" className="h-1 w-1 rounded-full bg-[var(--app-accent)]" />
            <span>Work stays in this browser</span>
          </div>
        </div>

        <div ref={heroStageRef} aria-label="Featured card designs" className="relative mx-auto min-h-[250px] w-full max-w-[760px] sm:min-h-[430px] lg:min-h-[560px]">
          <div className="absolute inset-x-[4%] sm:inset-x-[8%] bottom-[7%] top-[7%] rounded-[2rem] border border-[var(--app-border-subtle)] bg-[var(--app-bg)]" aria-hidden="true" />
          {heroTemplates[1] && (
            <button
              type="button"
              aria-label={`Preview ${heroTemplates[1].title}`}
              onClick={(event) => openPreview(heroTemplates[1], event)}
              style={{ transform: 'translate3d(calc(var(--scroll-p, 0) * -28px), calc(var(--scroll-p, 0) * -22px), 0) rotate(calc(-8deg - var(--scroll-p, 0) * 4deg))' }}
              className="hidden sm:block absolute left-[1%] top-[18%] z-10 w-[39%] overflow-hidden rounded-2xl border border-[var(--app-border-subtle)] shadow-2xl transition-shadow duration-300 hover:shadow-[0_24px_60px_rgba(0,0,0,0.45)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--app-accent)]"
            >
              <LazyTemplateCard aspectRatio={getTemplateAspectRatio(heroTemplates[1])}>
                <UnifiedCardThumbnail template={heroTemplates[1]} className="h-full w-full" />
              </LazyTemplateCard>
            </button>
          )}
          {heroTemplates[3] && (
            <button
              type="button"
              aria-label={`Preview ${heroTemplates[3].title}`}
              onClick={(event) => openPreview(heroTemplates[3], event)}
              style={{ transform: 'translate3d(calc(var(--scroll-p, 0) * 28px), calc(var(--scroll-p, 0) * 18px), 0) rotate(calc(6deg + var(--scroll-p, 0) * 4deg))' }}
              className="hidden sm:block absolute bottom-[8%] right-[2%] z-20 w-[35%] overflow-hidden rounded-2xl border border-[var(--app-border-subtle)] shadow-2xl transition-shadow duration-300 hover:shadow-[0_24px_60px_rgba(0,0,0,0.45)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--app-accent)]"
            >
              <LazyTemplateCard aspectRatio={getTemplateAspectRatio(heroTemplates[3])}>
                <UnifiedCardThumbnail template={heroTemplates[3]} className="h-full w-full" />
              </LazyTemplateCard>
            </button>
          )}
          {heroTemplates[0] && (
            <button
              type="button"
              aria-label={`Preview ${heroTemplates[0].title}`}
              onClick={(event) => openPreview(heroTemplates[0], event)}
              style={{ transform: 'translate3d(0, calc(var(--scroll-p, 0) * -14px), 0) scale(calc(1 + var(--scroll-p, 0) * 0.03)) rotate(calc(-1.5deg + var(--scroll-p, 0) * 1.5deg))' }}
              className="relative sm:absolute mx-auto sm:left-[23%] sm:top-[10%] z-10 w-[86%] sm:w-[66%] overflow-hidden rounded-2xl border border-[var(--app-border-strong)] shadow-[0_32px_80px_rgba(0,0,0,0.38)] transition-shadow duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--app-accent)]"
            >
              <LazyTemplateCard aspectRatio={getTemplateAspectRatio(heroTemplates[0])}>
                <UnifiedCardThumbnail template={heroTemplates[0]} className="h-full w-full" />
              </LazyTemplateCard>
            </button>
          )}
          <div className="glass-surface absolute bottom-[3%] sm:bottom-[5%] left-[3%] sm:left-[5%] z-30 rounded-xl px-3 py-1.5 sm:py-2 text-[9px] uppercase tracking-[0.12em] text-[var(--app-text-primary)]">
            <span className="block text-[var(--app-accent)] font-semibold">From the archive</span>
            <span className="mt-0.5 block">01 / {String(PRESET_TEMPLATES.length).padStart(2, '0')} designs</span>
          </div>
          <span className="absolute right-[6%] sm:right-[9%] top-[4%] sm:top-[6%] font-mono text-[10px] tracking-[0.14em] text-[var(--app-text-muted)]">ACG — 2026</span>
        </div>
      </section>

      <section aria-label="How the studio works" className="grid grid-cols-1 border-b border-[var(--app-border-subtle)] py-7 sm:grid-cols-3 sm:py-9">
        {[
          ['01', 'Choose a starting point', 'Pick a template or open a blank canvas.'],
          ['02', 'Edit every layer', 'Adjust text, photos, shapes, and layout.'],
          ['03', 'Export locally', 'Save your finished design from the browser.'],
        ].map(([number, title, description]) => (
          <div key={number} className="flex gap-4 border-t border-[var(--app-border-subtle)] py-4 first:border-0 sm:border-l sm:border-t-0 sm:px-5 sm:first:border-l-0 sm:first:pl-0">
            <span className="editorial-kicker shrink-0 pt-1">{number}</span>
            <div>
              <h2 className="text-sm font-semibold text-[var(--app-text-primary)]">{title}</h2>
              <p className="mt-1 text-xs leading-5 text-[var(--app-text-secondary)]">{description}</p>
            </div>
          </div>
        ))}
      </section>

      <section aria-labelledby="gallery-heading" className="pt-12 sm:pt-16">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="editorial-kicker">The collection · {filteredCards.length} designs</p>
            <h2 id="gallery-heading" className="mt-2 text-3xl font-heading leading-none sm:text-5xl">Find your starting point</h2>
          </div>
          <a href="/templates" className="inline-flex h-10 items-center gap-2 rounded-xl border border-[var(--app-border-strong)] px-4 text-xs font-medium text-[var(--app-text-primary)] transition-colors hover:bg-[var(--app-surface-secondary)]">
            All templates <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>

        <section aria-label="Design gallery controls" className="mb-6 rounded-2xl border border-[var(--app-border-subtle)] bg-[var(--app-surface)] p-3 sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div role="group" aria-label="Filter designs by category" className="flex min-w-0 flex-wrap items-center gap-1.5">
              {FILTERS.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  aria-pressed={activeCategory === filter.id}
                  onClick={() => setActiveCategory(filter.id)}
                  className={`shrink-0 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--app-accent)] ${
                    activeCategory === filter.id
                      ? 'bg-[var(--app-accent)] text-[var(--app-accent-ink)] shadow-xs'
                      : 'text-[var(--app-text-secondary)] hover:bg-[var(--app-surface-secondary)] hover:text-[var(--app-text-primary)]'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--app-border-subtle)]">
              <div className="flex items-center gap-1 rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-bg)] p-1" role="group" aria-label="Gallery density">
                {(['roomy', 'compact'] as const).map((layout) => (
                  <button
                    key={layout}
                    type="button"
                    aria-pressed={galleryLayout === layout}
                    onClick={() => {
                      setGalleryLayout(layout);
                      try { window.localStorage.setItem('acg-gallery-layout', layout); } catch { /* Storage is optional. */ }
                    }}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-medium capitalize transition-colors ${
                      galleryLayout === layout
                        ? 'bg-[var(--app-surface-secondary)] text-[var(--app-text-primary)] shadow-xs'
                        : 'text-[var(--app-text-muted)] hover:text-[var(--app-text-primary)]'
                    }`}
                  >
                    {layout}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setSearchOpen((open) => !open)}
                aria-expanded={searchOpen}
                aria-label={searchOpen ? 'Close design search' : 'Search designs'}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-bg)] text-[var(--app-text-secondary)] transition-colors hover:bg-[var(--app-surface-secondary)] hover:text-[var(--app-text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--app-accent)]"
              >
                {searchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {searchOpen && (
            <div className="relative max-w-lg border-t border-[var(--app-border-subtle)] pt-3">
              <label htmlFor="gallery-search" className="sr-only">Search titles, quotes, authors, and tags</label>
              <input
                id="gallery-search"
                type="search"
                autoFocus
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search designs, authors, or themes"
                className="h-11 w-full rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-bg)] px-4 pr-10 text-sm text-[var(--app-text-primary)] placeholder:text-[var(--app-text-muted)] focus:border-[var(--app-accent)] focus:outline-none"
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery('')} aria-label="Clear search" className="absolute right-2 top-[calc(50%+0.35rem)] -translate-y-1/2 rounded-lg p-2 text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)]">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </section>

        {filteredCards.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-sm text-[var(--app-text-secondary)]">No designs match your search.</p>
            <button type="button" onClick={() => { setActiveCategory('all'); setSearchQuery(''); }} className="mt-3 rounded-lg px-2 py-1 text-xs underline underline-offset-4 hover:text-[var(--app-text-primary)]">
              Clear filters
            </button>
          </div>
        ) : (
          <div className={`grid items-start ${galleryLayout === 'compact' ? 'grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1 gap-x-6 gap-y-9 min-[520px]:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'}`}>
            {filteredCards.map((card) => (
              <article key={card.id} className="group relative min-w-0 animate-card-entrance">
                <button
                  type="button"
                  aria-label={`Preview ${card.title}`}
                  onClick={(event) => openPreview(card, event)}
                  className="block w-full rounded-2xl text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-accent)]"
                >
                  <LazyTemplateCard aspectRatio={getTemplateAspectRatio(card)} className="overflow-hidden rounded-2xl border border-[var(--app-border-subtle)] bg-[var(--app-surface)] card-editorial-hover">
                    <UnifiedCardThumbnail template={card} className="h-full w-full" />
                  </LazyTemplateCard>
                  <div className="flex items-baseline justify-between gap-3 pt-3">
                    <span className="truncate text-sm font-medium text-[var(--app-text-primary)]">{card.title}</span>
                    <span className="shrink-0 truncate text-[9px] uppercase tracking-wider text-[var(--app-text-muted)]">{card.categoryLabel}</span>
                  </div>
                  <p className="mt-1 truncate text-xs text-[var(--app-text-secondary)]">{card.author || card.description}</p>
                </button>

                <div className="mt-3 flex items-center gap-2">
                  <button type="button" onClick={() => handleUseTemplate(card)} className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-[var(--app-border-strong)] bg-[var(--app-surface)] px-3 text-xs font-medium text-[var(--app-text-primary)] transition-colors hover:bg-[var(--app-surface-secondary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--app-accent)] interactive-tactile">
                    Use template <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  <button type="button" onClick={() => void handleCopyText(card)} aria-label={copiedId === card.id ? 'Quote copied' : `Copy quote from ${card.title}`} title={copiedId === card.id ? 'Copied' : 'Copy quote'} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--app-border-strong)] bg-[var(--app-surface)] text-[var(--app-text-primary)] transition-colors hover:bg-[var(--app-surface-secondary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--app-accent)] interactive-tactile">
                    {copiedId === card.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="home-faq-heading" className="mt-12 border-t border-[var(--app-border-subtle)] pt-10">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--app-text-muted)]">
              Quick Answers
            </p>
            <h2 id="home-faq-heading" className="mt-1 text-xl sm:text-2xl font-heading tracking-tight">
              Free Editing &amp; Export Guide
            </h2>
          </div>
          <a href="/faq" className="text-xs font-semibold text-[var(--app-accent)] hover:underline">
            Read all FAQs
          </a>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
          {HOME_AEO_FAQ.map((item) => (
            <article
              key={item.q}
              className="rounded-2xl border border-[var(--app-border-subtle)] bg-[var(--app-surface)] p-4 sm:p-5"
            >
              <h3 className="text-xs sm:text-sm font-bold text-[var(--app-text-primary)]">{item.q}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-[var(--app-text-secondary)]">{item.a}</p>
            </article>
          ))}
        </div>
        <AdSlot slotId="home-bottom-slot" format="horizontal" />
      </section>

      <p role="status" aria-live="polite" className="sr-only">{feedback}</p>

      <dialog
        ref={previewDialogRef}
        aria-labelledby="design-preview-title"
        aria-modal="true"
        onClose={handleDialogClose}
        onCancel={() => setPreviewTemplate(null)}
        onClick={(event) => { if (event.target === event.currentTarget) closePreview(); }}
        className="acg-preview-dialog m-auto max-h-[90vh] w-[min(92vw,960px)] max-w-none overflow-auto border border-[var(--app-border-strong)] bg-[var(--app-bg)] p-4 text-[var(--app-text-primary)] sm:p-5"
      >
        {previewTemplate && (
          <div className="flex flex-col gap-4">
            <header className="flex items-start justify-between gap-4 border-b border-[var(--app-border-subtle)] pb-3">
              <div className="min-w-0">
                <h2 id="design-preview-title" className="truncate text-sm font-semibold">{previewTemplate.title}</h2>
                <p className="mt-1 text-xs text-[var(--app-text-secondary)]">{previewTemplate.categoryLabel}</p>
              </div>
              <button type="button" onClick={closePreview} aria-label="Close preview" className="inline-flex h-9 w-9 shrink-0 items-center justify-center text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--app-accent)]">
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="grid min-h-0 place-items-center overflow-auto">
              <div className="max-h-[68vh] w-full max-w-[760px]">
                <UnifiedCardThumbnail template={previewTemplate} className="max-h-[68vh] w-full" />
              </div>
            </div>

            <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--app-border-subtle)] pt-3">
              <span className="max-w-full truncate text-xs text-[var(--app-text-secondary)]">{previewTemplate.author}</span>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => void handleCopyText(previewTemplate)} className="inline-flex h-9 items-center gap-2 border border-[var(--app-border-strong)] px-3 text-xs hover:bg-[var(--app-surface-secondary)]">
                  {copiedId === previewTemplate.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedId === previewTemplate.id ? 'Copied' : 'Copy text'}
                </button>
                <button type="button" onClick={() => handleUseTemplate(previewTemplate)} className="inline-flex h-9 items-center gap-2 bg-[var(--app-accent)] px-3 text-xs font-medium text-[var(--app-accent-ink)] hover:bg-[var(--app-accent-hover)]">
                  Use template <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </footer>
          </div>
        )}
      </dialog>
    </div>
  );
};
