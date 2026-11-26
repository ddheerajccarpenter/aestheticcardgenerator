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

const CATEGORY_LINKS = [
  { label: 'All (90)', href: '/', active: true },
  { label: 'Signature Free', href: '/premium', active: false },
  { label: 'Quotes', href: '/templates/quote-cards', active: false },
  { label: 'ID Pass', href: '/templates/aesthetic-id-cards', active: false },
  { label: 'Minimal', href: '/templates/minimal-cards', active: false },
  { label: 'Book Notes', href: '/templates/book-review-cards', active: false },
];

const getEditorHref = (template: CardTemplate) => {
  const base = template.canvasDoc?.objects?.length ? '/canvas' : '/create';
  return `${base}?template=${encodeURIComponent(template.id)}`;
};

export const HomeView: React.FC<HomeViewProps> = () => {
  const [galleryLayout, setGalleryLayout] = useState<'roomy' | 'compact'>(() => {
    try {
      return window.localStorage.getItem('acg-gallery-layout') === 'compact' ? 'compact' : 'roomy';
    } catch {
      return 'roomy';
    }
  });
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
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
      if (!query) return true;
      const searchText = [card.title, card.quote, card.author, card.tag, card.categoryLabel, card.description, ...(card.tags || [])]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return searchText.includes(query);
    });
  }, [searchQuery]);

  const heroTemplates = PRESET_TEMPLATES.slice(0, 4);

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

  return (
    <div className="mx-auto w-full max-w-[1580px] px-4 pb-28 pt-4 sm:px-6 sm:pt-8 md:px-8 md:pb-16 text-[var(--app-text-primary)]">
      <section aria-labelledby="home-title" className="home-hero grid min-h-[min(68vh,700px)] items-center gap-6 overflow-hidden rounded-2xl sm:rounded-[2rem] border border-[var(--app-border-subtle)] bg-[var(--app-surface)] px-5 py-6 sm:px-8 sm:py-8 md:px-12 lg:grid-cols-[0.88fr_1.12fr] lg:px-14 lg:py-12 animate-card-entrance">
        <div className="relative z-10 max-w-2xl py-1 sm:py-2 lg:py-6">
          <p className="editorial-kicker">Free Browser Card Studio</p>
          <h1 id="home-title" className="mt-3 sm:mt-4 max-w-[14ch] text-[clamp(2.2rem,6vw,5.2rem)] font-heading leading-[0.95] tracking-tight">
            Make something <span className="font-editorial font-normal italic text-[var(--app-accent)]">worth keeping.</span>
          </h1>
          <p className="mt-3 sm:mt-5 max-w-md text-sm leading-6 text-[var(--app-text-secondary)]">
            Customize templates or build on canvas. Download free, no watermark.
          </p>
          <div className="mt-5 sm:mt-7 flex flex-wrap items-center gap-2.5 sm:gap-3">
            <a href="/canvas?blank=true" className="btn-editorial-primary btn-sheen interactive-tactile min-h-11 px-5">
              Open Canvas <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <a href="/templates" className="btn-editorial-ghost interactive-tactile min-h-11 px-4">
              Templates
            </a>
            <a href="/premium" className="btn-editorial-ghost interactive-tactile min-h-11 px-4">
              Signature Free
            </a>
            <a href="/bingo" className="btn-editorial-ghost interactive-tactile min-h-11 px-4">
              Bingo
            </a>
          </div>
          <div className="mt-5 sm:mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[var(--app-border-subtle)] pt-3.5 text-[10px] uppercase tracking-[0.12em] text-[var(--app-text-muted)]">
            <span>{PRESET_TEMPLATES.length} Free Designs</span>
            <span aria-hidden="true" className="h-1 w-1 rounded-full bg-[var(--app-accent)]" />
            <span>Zero Watermarks</span>
          </div>
        </div>

        <div ref={heroStageRef} aria-label="Featured card designs" className="relative mx-auto min-h-[240px] w-full max-w-[760px] sm:min-h-[420px] lg:min-h-[540px]">
          <div className="absolute inset-x-[4%] sm:inset-x-[8%] bottom-[7%] top-[7%] rounded-[2rem] border border-[var(--app-border-subtle)] bg-[var(--app-bg)]" aria-hidden="true" />
          {heroTemplates[1] && (
            <a
              href={`/card/${heroTemplates[1].id}`}
              aria-label={`View ${heroTemplates[1].title}`}
              style={{ transform: 'translate3d(calc(var(--scroll-p, 0) * -28px), calc(var(--scroll-p, 0) * -22px), 0) rotate(calc(-8deg - var(--scroll-p, 0) * 4deg))' }}
              className="hidden sm:block animate-hero-bob-reverse absolute left-[1%] top-[18%] z-10 w-[39%] overflow-hidden rounded-2xl border border-[var(--app-border-subtle)] shadow-2xl transition-shadow duration-300 hover:shadow-[0_24px_60px_rgba(0,0,0,0.45)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--app-accent)]"
            >
              <LazyTemplateCard aspectRatio={getTemplateAspectRatio(heroTemplates[1])}>
                <UnifiedCardThumbnail template={heroTemplates[1]} className="h-full w-full" />
              </LazyTemplateCard>
            </a>
          )}
          {heroTemplates[3] && (
            <a
              href={`/card/${heroTemplates[3].id}`}
              aria-label={`View ${heroTemplates[3].title}`}
              style={{ transform: 'translate3d(calc(var(--scroll-p, 0) * 28px), calc(var(--scroll-p, 0) * 18px), 0) rotate(calc(6deg + var(--scroll-p, 0) * 4deg))' }}
              className="hidden sm:block animate-hero-bob absolute bottom-[8%] right-[2%] z-20 w-[35%] overflow-hidden rounded-2xl border border-[var(--app-border-subtle)] shadow-2xl transition-shadow duration-300 hover:shadow-[0_24px_60px_rgba(0,0,0,0.45)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--app-accent)]"
            >
              <LazyTemplateCard aspectRatio={getTemplateAspectRatio(heroTemplates[3])}>
                <UnifiedCardThumbnail template={heroTemplates[3]} className="h-full w-full" />
              </LazyTemplateCard>
            </a>
          )}
          {heroTemplates[0] && (
            <a
              href={`/card/${heroTemplates[0].id}`}
              aria-label={`View ${heroTemplates[0].title}`}
              style={{ transform: 'translate3d(0, calc(var(--scroll-p, 0) * -14px), 0) scale(calc(1 + var(--scroll-p, 0) * 0.03)) rotate(calc(-1.5deg + var(--scroll-p, 0) * 1.5deg))' }}
              className="block relative sm:absolute mx-auto sm:left-[23%] sm:top-[10%] z-10 w-[86%] sm:w-[66%] overflow-hidden rounded-2xl border border-[var(--app-border-strong)] shadow-[0_32px_80px_rgba(0,0,0,0.38)] transition-shadow duration-300 animate-hero-bob focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--app-accent)]"
            >
              <LazyTemplateCard aspectRatio={getTemplateAspectRatio(heroTemplates[0])}>
                <UnifiedCardThumbnail template={heroTemplates[0]} className="h-full w-full" />
              </LazyTemplateCard>
            </a>
          )}
          <div className="glass-surface absolute bottom-[3%] sm:bottom-[5%] left-[3%] sm:left-[5%] z-30 rounded-xl px-3 py-1.5 sm:py-2 text-[9px] uppercase tracking-[0.12em] text-[var(--app-text-primary)]">
            <span className="block text-[var(--app-accent)] font-semibold">Studio Archive</span>
            <span className="mt-0.5 block">01 / {String(PRESET_TEMPLATES.length).padStart(2, '0')} cards</span>
          </div>
          <span className="absolute right-[6%] sm:right-[9%] top-[4%] sm:top-[6%] font-mono text-[10px] tracking-[0.14em] text-[var(--app-text-muted)]">ACG — 2026</span>
        </div>
      </section>

      <section aria-label="How the studio works" className="grid grid-cols-1 border-b border-[var(--app-border-subtle)] py-6 sm:grid-cols-3 sm:py-8">
        {[
          ['01', 'Pick a design', '90 cards or blank canvas.'],
          ['02', 'Edit layers', 'Type, fonts, crops & colors.'],
          ['03', 'Export free', 'PNG, JPEG, or WebP.'],
        ].map(([number, title, description]) => (
          <div key={number} className="flex gap-4 border-t border-[var(--app-border-subtle)] py-3.5 first:border-0 sm:border-l sm:border-t-0 sm:px-5 sm:first:border-l-0 sm:first:pl-0">
            <span className="editorial-kicker shrink-0 pt-1">{number}</span>
            <div>
              <h2 className="text-sm font-semibold text-[var(--app-text-primary)]">{title}</h2>
              <p className="mt-0.5 text-xs text-[var(--app-text-secondary)]">{description}</p>
            </div>
          </div>
        ))}
      </section>

      <section aria-labelledby="gallery-heading" className="pt-10 sm:pt-14">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="editorial-kicker">{filteredCards.length} designs</p>
            <h2 id="gallery-heading" className="mt-1.5 text-3xl font-heading leading-none sm:text-5xl">Pick &amp; Customize</h2>
          </div>
          <a href="/templates" className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[var(--app-border-strong)] px-4 text-xs font-medium text-[var(--app-text-primary)] transition-colors hover:bg-[var(--app-surface-secondary)] interactive-tactile">
            All templates <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>

        <section aria-label="Design gallery controls" className="mb-6 rounded-2xl border border-[var(--app-border-subtle)] bg-[var(--app-surface)] p-3.5 sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <nav aria-label="Category pages" className="flex min-w-0 flex-wrap items-center gap-2">
              {CATEGORY_LINKS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={`min-h-[44px] inline-flex items-center shrink-0 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all interactive-tactile focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--app-accent)] ${
                    item.active
                      ? 'bg-[var(--app-accent)] text-[var(--app-accent-ink)] shadow-xs'
                      : 'border border-[var(--app-border-subtle)] bg-[var(--app-bg)] text-[var(--app-text-secondary)] hover:bg-[var(--app-surface-secondary)] hover:text-[var(--app-text-primary)]'
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </nav>

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
                    className={`min-h-[36px] rounded-lg px-2.5 py-1 text-[11px] font-medium capitalize transition-colors cursor-pointer ${
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
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-bg)] text-[var(--app-text-secondary)] transition-colors hover:bg-[var(--app-surface-secondary)] hover:text-[var(--app-text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--app-accent)] cursor-pointer"
              >
                {searchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {searchOpen && (
            <div className="relative mt-3 max-w-lg border-t border-[var(--app-border-subtle)] pt-3">
              <label htmlFor="gallery-search" className="sr-only">Search titles, quotes, authors, and tags</label>
              <input
                id="gallery-search"
                type="search"
                autoFocus
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search designs, authors, or styles"
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
          <div className="py-16 text-center">
            <p className="text-sm text-[var(--app-text-secondary)]">No designs match your search.</p>
            <button type="button" onClick={() => setSearchQuery('')} className="mt-3 rounded-lg px-3 py-2 text-xs underline underline-offset-4 hover:text-[var(--app-text-primary)] cursor-pointer">
              Clear search
            </button>
          </div>
        ) : (
          <div className={`grid items-start ${galleryLayout === 'compact' ? 'grid-cols-2 gap-x-3.5 gap-y-6 sm:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1 gap-x-6 gap-y-8 min-[520px]:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'}`}>
            {filteredCards.map((card, idx) => (
              <article
                key={card.id}
                style={{ '--stagger-i': idx % 12 } as React.CSSProperties}
                className="group relative min-w-0 animate-card-entrance"
              >
                <a
                  href={`/card/${card.id}`}
                  aria-label={`View ${card.title}`}
                  className="block w-full rounded-2xl text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-accent)]"
                >
                  <LazyTemplateCard aspectRatio={getTemplateAspectRatio(card)} className="overflow-hidden rounded-2xl border border-[var(--app-border-subtle)] bg-[var(--app-surface)] card-editorial-hover card-artwork-zoom">
                    <UnifiedCardThumbnail template={card} className="h-full w-full" />
                  </LazyTemplateCard>
                  <div className="flex items-baseline justify-between gap-2 pt-3">
                    <span className="truncate text-sm font-semibold text-[var(--app-text-primary)] group-hover:text-[var(--app-accent)] transition-colors">{card.title}</span>
                    <span className="shrink-0 truncate text-[9px] uppercase tracking-wider text-[var(--app-text-muted)]">{card.categoryLabel}</span>
                  </div>
                </a>

                <div className="mt-2.5 flex items-center gap-2">
                  <a
                    href={getEditorHref(card)}
                    className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-xl border border-[var(--app-border-strong)] bg-[var(--app-surface)] px-3 text-xs font-semibold text-[var(--app-text-primary)] transition-colors hover:bg-[var(--app-surface-secondary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--app-accent)] interactive-tactile"
                  >
                    Use template <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                  <button type="button" onClick={() => void handleCopyText(card)} aria-label={copiedId === card.id ? 'Quote copied' : `Copy quote from ${card.title}`} title={copiedId === card.id ? 'Copied' : 'Copy quote'} className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--app-border-strong)] bg-[var(--app-surface)] text-[var(--app-text-primary)] transition-colors hover:bg-[var(--app-surface-secondary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--app-accent)] interactive-tactile cursor-pointer">
                    {copiedId === card.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="home-faq-heading" className="mt-10 border-t border-[var(--app-border-subtle)] pt-8">
        <div className="flex items-center justify-between gap-4">
          <h2 id="home-faq-heading" className="text-lg sm:text-xl font-heading tracking-tight">
            Quick Answers
          </h2>
          <a href="/faq" className="text-xs font-semibold text-[var(--app-accent)] hover:underline">
            Full FAQ
          </a>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-2.5 md:grid-cols-2">
          {HOME_AEO_FAQ.map((item) => (
            <details
              key={item.q}
              className="group rounded-2xl border border-[var(--app-border-subtle)] bg-[var(--app-surface)] px-4 py-3 transition-colors open:border-[var(--app-border-strong)]"
            >
              <summary className="cursor-pointer list-none text-xs sm:text-sm font-semibold text-[var(--app-text-primary)] flex items-center justify-between gap-2 min-h-[32px]">
                <span>{item.q}</span>
                <span className="shrink-0 font-mono text-xs text-[var(--app-accent)] group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="mt-2 border-t border-[var(--app-border-subtle)] pt-2 text-xs leading-relaxed text-[var(--app-text-secondary)]">
                {item.a}
              </p>
            </details>
          ))}
        </div>
        <AdSlot slotId="home-bottom-slot" format="horizontal" />
      </section>

      <p role="status" aria-live="polite" className="sr-only">{feedback}</p>
    </div>
  );
};
