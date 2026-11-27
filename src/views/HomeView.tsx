import React, { useEffect, useMemo, useRef, useState } from 'react';
import { animate, stagger } from 'animejs';
import type { CardTemplate } from '../types/card';
import { PALETTE_PRESETS, PRESET_TEMPLATES } from '../data/templates';
import { HOME_AEO_FAQ, PRODUCTION_DOMAIN, updatePageSEO } from '../utils/seo';
import { ArrowRight, ChevronLeft, ChevronRight, Search, Shuffle, X } from '../components/icons/faIcons';
import { UnifiedCardThumbnail } from '../components/UnifiedCardThumbnail';
import { LazyTemplateCard } from '../components/LazyTemplateCard';
import { getStageInnerWidth, getTemplateAspectRatio } from '../utils/templateAspectRatio';
import { AdSlot } from '../components/AdSlot';
import { getTemplateAmbientTones } from '../utils/templateAmbient';
import { setAmbientTones } from '../engines/ambientAtmosphere';
import {
  EDITORIAL_EASE,
  animateDeckAdvance,
  animateSpringPop,
  drawSvgPaths,
  handleMagneticPointerLeave,
  handleMagneticPointerMove,
  handleTiltPointerLeave,
  handleTiltPointerMove,
  isReducedMotion,
  observeScrollReveal,
  onStageReady,
  revealPressWords,
} from '../utils/motion';

export interface HomeViewProps {
  onOpenEditorWithTemplate?: (template: CardTemplate) => void;
  onNavigateToEditor?: () => void;
  onNavigate?: (path: string) => void;
  theme?: 'dark' | 'light';
  onOpenGuide?: () => void;
}

const CATEGORY_LINKS = [
  { label: 'All', href: '/', active: true },
  { label: 'Signature', href: '/premium', active: false },
  { label: 'Quotes', href: '/templates/quote-cards', active: false },
  { label: 'ID Pass', href: '/templates/aesthetic-id-cards', active: false },
  { label: 'Minimal', href: '/templates/minimal-cards', active: false },
  { label: 'Book Notes', href: '/templates/book-review-cards', active: false },
];

const HERO_SWATCHES = PALETTE_PRESETS.slice(0, 10);
const QUICK_SEARCH_TOPICS = ['all', 'quote', 'poster', 'id', 'minimal'] as const;

const getEditorHref = (template: CardTemplate) => {
  const base = template.canvasDoc?.objects?.length ? '/canvas' : '/create';
  return `${base}?template=${encodeURIComponent(template.id)}`;
};

export const HomeView: React.FC<HomeViewProps> = ({ theme = 'dark' }) => {
  const [galleryLayout, setGalleryLayout] = useState<'roomy' | 'compact'>(() => {
    try {
      return window.localStorage.getItem('acg-gallery-layout') === 'compact' ? 'compact' : 'roomy';
    } catch {
      return 'roomy';
    }
  });
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [quickTopic, setQuickTopic] = useState<(typeof QUICK_SEARCH_TOPICS)[number]>('all');
  const [activeHeroIdx, setActiveHeroIdx] = useState(0);
  const [activeSwatchId, setActiveSwatchId] = useState<string | null>(null);
  const [dragOffsetX, setDragOffsetX] = useState(0);
  const [catGlider, setCatGlider] = useState<{ x: number; w: number; visible: boolean }>({ x: 0, w: 0, visible: false });

  const heroSectionRef = useRef<HTMLElement | null>(null);
  const heroStageRef = useRef<HTMLDivElement | null>(null);
  const heroCropRef = useRef<SVGSVGElement | null>(null);
  const swatchStripRef = useRef<HTMLDivElement | null>(null);
  const galleryGridRef = useRef<HTMLDivElement | null>(null);
  const catNavRef = useRef<HTMLElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const dragStartXRef = useRef<number | null>(null);
  const didSwipeRef = useRef(false);

  const heroTemplates = useMemo(() => PRESET_TEMPLATES.slice(0, 4), []);

  // Initial editorial press entrance choreography synced to SkeletonLoader lift
  useEffect(() => {
    const runEntrance = () => {
      revealPressWords(heroSectionRef.current, 20);
      drawSvgPaths(heroCropRef.current, '[data-draw-path]', 680, 65);

      if (!isReducedMotion()) {
        const ctas = heroSectionRef.current?.querySelectorAll<HTMLElement>('[data-hero-cta]');
        if (ctas?.length) {
          animate(ctas, {
            opacity: [0, 1],
            y: [14, 0],
            duration: 460,
            delay: stagger(50, { start: 140 }),
            ease: EDITORIAL_EASE,
          });
        }

        const deckCards = heroStageRef.current?.querySelectorAll<HTMLElement>('[data-deck-card]');
        if (deckCards?.length) {
          animate(deckCards, {
            opacity: [0, 1],
            scale: [0.92, 1],
            duration: 580,
            delay: stagger(75, { start: 90 }),
            ease: EDITORIAL_EASE,
          });
        }

        const swatches = swatchStripRef.current?.querySelectorAll<HTMLElement>('[data-swatch]');
        if (swatches?.length) {
          animate(swatches, {
            opacity: [0, 1],
            y: [12, 0],
            duration: 420,
            delay: stagger(32, { start: 180 }),
            ease: EDITORIAL_EASE,
          });
        }
      }
    };

    return onStageReady(
      runEntrance,
      () => heroSectionRef.current?.querySelectorAll<HTMLElement>('[data-press-word], [data-hero-cta], [data-deck-card]')
    );
  }, []);

  // SEO + JSON-LD (kept intact for crawlers & AEO)
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
      if (quickTopic !== 'all') {
        const hay = `${card.categoryLabel || ''} ${card.tag || ''} ${card.title} ${(card.tags || []).join(' ')}`.toLowerCase();
        if (!hay.includes(quickTopic)) return false;
      }
      if (!query) return true;
      const searchText = [card.title, card.quote, card.author, card.tag, card.categoryLabel, card.description, ...(card.tags || [])]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return searchText.includes(query);
    });
  }, [searchQuery, quickTopic]);

  // Batched IntersectionObserver scroll reveal across the gallery grid
  useEffect(() => {
    return observeScrollReveal(galleryGridRef.current, '[data-reveal-card]', {
      staggerMs: 36,
      yOffset: 20,
    });
  }, [filteredCards, galleryLayout]);

  useEffect(() => {
    if (searchOpen) {
      const id = window.requestAnimationFrame(() => searchInputRef.current?.focus());
      return () => window.cancelAnimationFrame(id);
    }
  }, [searchOpen]);

  const cycleHeroCard = (nextIdx: number, direction?: 1 | -1) => {
    const normalized = ((nextIdx % heroTemplates.length) + heroTemplates.length) % heroTemplates.length;
    const resolvedDir: 1 | -1 = direction ?? (nextIdx < activeHeroIdx ? -1 : 1);
    setActiveHeroIdx(normalized);
    animateDeckAdvance(heroStageRef.current, resolvedDir);
    const chosen = heroTemplates[normalized];
    if (chosen) {
      setAmbientTones(getTemplateAmbientTones(chosen, theme));
    }
  };

  const shuffleHeroCard = () => {
    const step = heroTemplates.length > 1 ? 1 + (activeHeroIdx % (heroTemplates.length - 1)) : 0;
    cycleHeroCard(activeHeroIdx + step, 1);
  };

  const moveCategoryGlider = (el: HTMLElement | null) => {
    const nav = catNavRef.current;
    if (!nav || !el) return;
    setCatGlider({ x: el.offsetLeft, w: el.offsetWidth, visible: true });
  };

  const frontTemplate = heroTemplates[activeHeroIdx];
  const leftTemplate = heroTemplates[(activeHeroIdx + 1) % heroTemplates.length];
  const rightTemplate = heroTemplates[(activeHeroIdx + 2) % heroTemplates.length];
  const activeSwatchPreset = HERO_SWATCHES.find((pal) => pal.id === activeSwatchId);

  return (
    <div className="mx-auto w-full max-w-[1580px] px-4 pb-28 pt-4 sm:px-6 sm:pt-8 md:px-8 md:pb-16 text-[var(--app-text-primary)]">
      <section
        ref={heroSectionRef}
        aria-labelledby="home-title"
        className="home-hero grid min-h-[min(64vh,660px)] items-center gap-6 overflow-hidden rounded-2xl border border-[var(--app-border-subtle)] bg-[var(--app-surface)] px-5 py-8 sm:px-8 sm:py-10 md:px-12 lg:grid-cols-[0.86fr_1.14fr] lg:px-14 lg:py-12"
      >
        <div className="relative z-10 max-w-xl py-1 sm:py-2 lg:py-4">
          <h1 id="home-title" className="max-w-[14ch] text-[clamp(2.35rem,5.5vw,4.75rem)] font-heading leading-[0.98] tracking-tight">
            {['Card', 'and', 'poster'].map((word) => (
              <span key={word} className="press-word-clip mr-[0.22em]">
                <span data-press-word className="press-word">{word}</span>
              </span>
            ))}
            <span className="press-word-clip">
              <span data-press-word className="press-word text-[var(--app-accent)]">
                studio
              </span>
            </span>
          </h1>
          <p className="mt-4 max-w-[44ch] text-sm font-medium tabular-nums text-[var(--app-text-secondary)]">
            {PRESET_TEMPLATES.length} editable templates · Free PNG, JPEG, and WebP export
          </p>

          <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-3">
            <a
              href="/canvas?blank=true"
              data-hero-cta
              onPointerMove={handleMagneticPointerMove}
              onPointerLeave={handleMagneticPointerLeave}
              className="btn-editorial-primary btn-magnetic btn-sheen interactive-tactile min-h-[44px] px-5"
            >
              <span>Open Canvas</span> <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <a
              href="/templates"
              data-hero-cta
              onPointerMove={handleMagneticPointerMove}
              onPointerLeave={handleMagneticPointerLeave}
              className="btn-editorial-ghost btn-magnetic interactive-tactile min-h-[44px] px-4"
            >
              Browse templates
            </a>
          </div>
        </div>

        <div
          ref={heroStageRef}
          tabIndex={0}
          aria-label="Featured card designs. Use left and right arrows to switch cards."
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') {
              e.preventDefault();
              cycleHeroCard(activeHeroIdx - 1, -1);
            } else if (e.key === 'ArrowRight') {
              e.preventDefault();
              cycleHeroCard(activeHeroIdx + 1, 1);
            }
          }}
          className="relative mx-auto min-h-[280px] pb-14 sm:pb-0 w-full max-w-[760px] sm:min-h-[420px] lg:min-h-[520px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--app-accent)] rounded-xl"
        >
          {/* Press Registration Crop Marks drawn via Anime.js */}
          <svg
            ref={heroCropRef}
            viewBox="0 0 600 440"
            aria-hidden="true"
            className="pointer-events-none absolute inset-[3%] h-[94%] w-[94%] text-[var(--app-border-strong)] opacity-60"
          >
            <path data-draw-path d="M 24 6 L 6 6 L 6 24" fill="none" stroke="currentColor" strokeWidth="1.2" />
            <path data-draw-path d="M 576 6 L 594 6 L 594 24" fill="none" stroke="currentColor" strokeWidth="1.2" />
            <path data-draw-path d="M 6 416 L 6 434 L 24 434" fill="none" stroke="currentColor" strokeWidth="1.2" />
            <path data-draw-path d="M 594 416 L 594 434 L 576 434" fill="none" stroke="currentColor" strokeWidth="1.2" />
          </svg>

          <div
            style={activeSwatchPreset ? { borderColor: activeSwatchPreset.ink } : undefined}
            className="absolute inset-x-[4%] sm:inset-x-[8%] bottom-[7%] top-[7%] rounded-lg border border-[var(--app-border-subtle)] bg-[var(--app-bg)] transition-colors duration-200"
            aria-hidden="true"
          />

          {leftTemplate && (
            <div data-deck-wing className="pointer-events-none hidden sm:flex aspect-square items-center justify-center absolute left-[1%] top-[12%] z-10 w-[38%]">
              <button
                type="button"
                data-deck-card
                onClick={() => cycleHeroCard(activeHeroIdx + 1, -1)}
                aria-label={`Focus ${leftTemplate.title}`}
                style={{
                  width: getStageInnerWidth(getTemplateAspectRatio(leftTemplate)),
                  transform: 'rotate(-6deg)',
                }}
                className="pointer-events-auto cursor-pointer overflow-hidden rounded-xl border border-[var(--app-border-subtle)] transition-[border-color,transform] duration-200 hover:border-[var(--app-accent)] hover:scale-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--app-accent)]"
              >
                <LazyTemplateCard aspectRatio={getTemplateAspectRatio(leftTemplate)}>
                  <UnifiedCardThumbnail template={leftTemplate} isLight={theme === 'light'} className="h-full w-full pointer-events-none" />
                </LazyTemplateCard>
              </button>
            </div>
          )}

          {rightTemplate && (
            <div data-deck-wing className="pointer-events-none hidden sm:flex aspect-square items-center justify-center absolute right-[2%] bottom-[8%] z-20 w-[36%]">
              <button
                type="button"
                data-deck-card
                onClick={() => cycleHeroCard(activeHeroIdx + 2, 1)}
                aria-label={`Focus ${rightTemplate.title}`}
                style={{
                  width: getStageInnerWidth(getTemplateAspectRatio(rightTemplate)),
                  transform: 'rotate(5deg)',
                }}
                className="pointer-events-auto cursor-pointer overflow-hidden rounded-xl border border-[var(--app-border-subtle)] transition-[border-color,transform] duration-200 hover:border-[var(--app-accent)] hover:scale-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--app-accent)]"
              >
                <LazyTemplateCard aspectRatio={getTemplateAspectRatio(rightTemplate)}>
                  <UnifiedCardThumbnail template={rightTemplate} isLight={theme === 'light'} className="h-full w-full pointer-events-none" />
                </LazyTemplateCard>
              </button>
            </div>
          )}

          {frontTemplate && (
            <div className="pointer-events-none relative sm:absolute mx-auto sm:left-[22%] sm:top-1/2 sm:-translate-y-1/2 z-20 flex aspect-square w-[86%] sm:w-[58%] items-center justify-center">
              <div
                data-deck-card
                data-deck-front
                onPointerDown={(e) => {
                  if (e.button !== 0) return;
                  dragStartXRef.current = e.clientX;
                  didSwipeRef.current = false;
                }}
                onPointerMove={(e) => {
                  if (dragStartXRef.current === null || isReducedMotion()) return;
                  const delta = Math.max(-64, Math.min(64, e.clientX - dragStartXRef.current));
                  if (Math.abs(delta) > 8) didSwipeRef.current = true;
                  setDragOffsetX(delta);
                }}
                onPointerUp={() => {
                  if (dragStartXRef.current === null) return;
                  const delta = dragOffsetX;
                  dragStartXRef.current = null;
                  setDragOffsetX(0);
                  if (delta < -38) cycleHeroCard(activeHeroIdx + 1, 1);
                  else if (delta > 38) cycleHeroCard(activeHeroIdx - 1, -1);
                }}
                onPointerCancel={() => {
                  dragStartXRef.current = null;
                  setDragOffsetX(0);
                }}
                style={{
                  width: getStageInnerWidth(getTemplateAspectRatio(frontTemplate)),
                  transform: dragOffsetX !== 0
                    ? `translate3d(${dragOffsetX}px, 0, 0) rotate(${(dragOffsetX * 0.06).toFixed(2)}deg)`
                    : undefined,
                }}
                className="pointer-events-auto touch-pan-y transition-transform duration-150 ease-out"
              >
                <a
                  href={`/card/${frontTemplate.id}`}
                  aria-label={`View ${frontTemplate.title}`}
                  onClick={(e) => {
                    if (didSwipeRef.current) {
                      e.preventDefault();
                      didSwipeRef.current = false;
                    }
                  }}
                  onPointerMove={handleTiltPointerMove}
                  onPointerLeave={handleTiltPointerLeave}
                  className="card-tilt-surface block overflow-hidden rounded-xl border border-[var(--app-border-strong)] shadow-[0_14px_32px_rgba(0,0,0,0.24)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--app-accent)]"
                >
                  <LazyTemplateCard aspectRatio={getTemplateAspectRatio(frontTemplate)} className="card-tilt-glint">
                    <UnifiedCardThumbnail template={frontTemplate} isLight={theme === 'light'} className="h-full w-full" />
                  </LazyTemplateCard>
                </a>
              </div>
            </div>
          )}

          {/* Interactive deck switcher */}
          <div className="glass-surface absolute bottom-[3%] sm:bottom-[5%] left-1/2 sm:left-[6%] -translate-x-1/2 sm:translate-x-0 z-30 flex items-center gap-1 rounded-full px-2 py-1">
            <button
              type="button"
              onClick={() => cycleHeroCard(activeHeroIdx - 1, -1)}
              onPointerMove={handleMagneticPointerMove}
              onPointerLeave={handleMagneticPointerLeave}
              aria-label="Previous featured card"
              className="btn-magnetic inline-flex h-8 w-8 items-center justify-center rounded-full text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)] hover:bg-[var(--app-surface-secondary)] cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <div className="flex items-center gap-1.5 px-1" role="tablist" aria-label="Featured card selector">
              {heroTemplates.map((tmpl, i) => (
                <button
                  key={tmpl.id}
                  type="button"
                  role="tab"
                  aria-selected={i === activeHeroIdx}
                  aria-label={`Show ${tmpl.title}`}
                  onClick={() => cycleHeroCard(i)}
                  className={`h-2 rounded-full transition-[width,background-color] duration-200 cursor-pointer ${
                    i === activeHeroIdx
                      ? 'w-6 bg-[var(--app-accent)]'
                      : 'w-2 bg-[var(--app-border-strong)] hover:bg-[var(--app-text-secondary)]'
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => cycleHeroCard(activeHeroIdx + 1, 1)}
              onPointerMove={handleMagneticPointerMove}
              onPointerLeave={handleMagneticPointerLeave}
              aria-label="Next featured card"
              className="btn-magnetic inline-flex h-8 w-8 items-center justify-center rounded-full text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)] hover:bg-[var(--app-surface-secondary)] cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={shuffleHeroCard}
              onPointerMove={handleMagneticPointerMove}
              onPointerLeave={handleMagneticPointerLeave}
              aria-label="Cycle featured card"
              title="Next preview card"
              className="btn-magnetic inline-flex h-8 w-8 items-center justify-center rounded-full text-[var(--app-text-secondary)] hover:text-[var(--app-accent)] hover:bg-[var(--app-surface-secondary)] cursor-pointer"
            >
              <Shuffle className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      {/* Interactive Paper Palette Strip */}
      <section aria-label="Paper palettes" className="border-b border-[var(--app-border-subtle)] py-4 sm:py-5">
        <div
          ref={swatchStripRef}
          onMouseLeave={() => setActiveSwatchId(null)}
          className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none"
        >
          {HERO_SWATCHES.map((pal) => (
            <a
              key={pal.id}
              data-swatch
              href={`/create?palette=${encodeURIComponent(pal.id)}`}
              onMouseEnter={() => {
                setActiveSwatchId(pal.id);
                setAmbientTones({
                  primary: pal.bg,
                  secondary: pal.ink,
                  neutral: pal.bg,
                });
              }}
              onFocus={() => {
                setActiveSwatchId(pal.id);
                setAmbientTones({
                  primary: pal.bg,
                  secondary: pal.ink,
                  neutral: pal.bg,
                });
              }}
              className={`group interactive-tactile inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-lg border px-3 py-1.5 text-[13px] font-medium transition-[transform,border-color,background-color,color] duration-150 ${
                activeSwatchId === pal.id
                  ? '-translate-y-0.5 border-[var(--app-accent)] bg-[var(--app-surface-secondary)] text-[var(--app-text-primary)]'
                  : 'border-[var(--app-border-subtle)] bg-[var(--app-surface)] text-[var(--app-text-secondary)] hover:-translate-y-0.5 hover:border-[var(--app-accent)] hover:text-[var(--app-text-primary)]'
              }`}
            >
              <span
                aria-hidden="true"
                className="h-4 w-4 rounded border border-black/20 transition-transform duration-150 group-hover:scale-110"
                style={{ backgroundColor: pal.bg }}
              />
              <span className="whitespace-nowrap">{pal.name}</span>
            </a>
          ))}
        </div>
      </section>

      <section aria-labelledby="gallery-heading" className="pt-8 sm:pt-12">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <h2 id="gallery-heading" className="text-3xl font-heading font-medium leading-none sm:text-5xl">
            Gallery
          </h2>
          <a href="/templates" className="editorial-link-underline inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-[var(--app-border-strong)] px-4 text-[13px] font-medium text-[var(--app-text-primary)] transition-colors hover:bg-[var(--app-surface-secondary)] interactive-tactile">
            <span>Browse all</span> <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>

        <section aria-label="Design gallery controls" className="mb-6 rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface)] p-3.5 sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <nav
              ref={catNavRef}
              aria-label="Category pages"
              onMouseLeave={() => setCatGlider((prev) => ({ ...prev, visible: false }))}
              className="relative flex min-w-0 flex-wrap items-center gap-2"
            >
              <span
                aria-hidden="true"
                style={{
                  width: `${catGlider.w}px`,
                  transform: `translate3d(${catGlider.x}px, 0, 0)`,
                  opacity: catGlider.visible ? 1 : 0,
                }}
                className="nav-pill-glider top-0 bottom-0 left-0 z-0 border border-[var(--app-border-strong)]"
              />
              {CATEGORY_LINKS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onMouseEnter={(e) => moveCategoryGlider(e.currentTarget)}
                  onFocus={(e) => moveCategoryGlider(e.currentTarget)}
                  onBlur={() => setCatGlider((prev) => ({ ...prev, visible: false }))}
                  className={`relative z-10 min-h-[44px] inline-flex items-center shrink-0 rounded-lg px-3.5 py-2 text-[13px] font-medium transition-colors interactive-tactile focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--app-accent)] ${
                    item.active
                      ? 'bg-[var(--app-accent)] text-[var(--app-accent-ink)]'
                      : 'border border-[var(--app-border-subtle)] bg-[var(--app-bg)]/80 text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)]'
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--app-border-subtle)]">
              <div className="relative grid grid-cols-2 items-center rounded-lg border border-[var(--app-border-subtle)] bg-[var(--app-bg)] p-1" role="group" aria-label="Gallery density">
                <span
                  aria-hidden="true"
                  style={{
                    transform: galleryLayout === 'compact' ? 'translate3d(100%, 0, 0)' : 'translate3d(0%, 0, 0)',
                  }}
                  className="segmented-thumb pointer-events-none absolute top-1 bottom-1 left-1 w-[calc(50%-0.25rem)] rounded-md bg-[var(--app-surface-secondary)]"
                />
                {(['roomy', 'compact'] as const).map((layout) => (
                  <button
                    key={layout}
                    type="button"
                    aria-pressed={galleryLayout === layout}
                    onClick={() => {
                      setGalleryLayout(layout);
                      try { window.localStorage.setItem('acg-gallery-layout', layout); } catch { /* Storage optional. */ }
                      if (galleryGridRef.current) animateSpringPop(galleryGridRef.current, 'settle');
                    }}
                    className={`relative z-10 min-h-[38px] rounded-md px-3 py-1 text-[13px] font-medium capitalize transition-colors cursor-pointer ${
                      galleryLayout === layout
                        ? 'text-[var(--app-text-primary)]'
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
                className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--app-accent)] cursor-pointer ${
                  searchOpen
                    ? 'border-[var(--app-accent)] bg-[var(--app-surface-secondary)] text-[var(--app-accent)]'
                    : 'border-[var(--app-border-subtle)] bg-[var(--app-bg)] text-[var(--app-text-secondary)] hover:bg-[var(--app-surface-secondary)] hover:text-[var(--app-text-primary)]'
                }`}
              >
                {searchOpen ? <X className="h-4 w-4" aria-hidden="true" /> : <Search className="h-4 w-4" aria-hidden="true" />}
              </button>
            </div>
          </div>

          <div className="search-drawer-grid" data-open={searchOpen ? 'true' : 'false'}>
            <div className="search-drawer-inner">
              <div className="mt-3 flex flex-col gap-3 border-t border-[var(--app-border-subtle)] pt-3">
                <div className="relative max-w-lg">
                  <label htmlFor="gallery-search" className="sr-only">Search designs</label>
                  <input
                    ref={searchInputRef}
                    id="gallery-search"
                    type="search"
                    tabIndex={searchOpen ? 0 : -1}
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search"
                    className="h-11 w-full rounded-lg border border-[var(--app-border-subtle)] bg-[var(--app-bg)] px-4 pr-10 text-sm text-[var(--app-text-primary)] placeholder:text-[var(--app-text-muted)] focus:border-[var(--app-accent)] focus:outline-none"
                  />
                  {searchQuery && (
                    <button type="button" onClick={() => setSearchQuery('')} aria-label="Clear search" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)] cursor-pointer">
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Quick topic filter">
                    {QUICK_SEARCH_TOPICS.map((topic) => (
                      <button
                        key={topic}
                        type="button"
                        tabIndex={searchOpen ? 0 : -1}
                        aria-pressed={quickTopic === topic}
                        onClick={() => {
                          setQuickTopic(topic);
                          if (galleryGridRef.current) animateSpringPop(galleryGridRef.current, 'settle');
                        }}
                        className={`min-h-[36px] rounded-lg border px-3 py-1 text-xs font-medium capitalize transition-colors cursor-pointer ${
                          quickTopic === topic
                            ? 'border-[var(--app-accent)] bg-[var(--app-accent)] text-[var(--app-accent-ink)]'
                            : 'border-[var(--app-border-subtle)] bg-[var(--app-bg)] text-[var(--app-text-secondary)] hover:border-[var(--app-border-strong)] hover:text-[var(--app-text-primary)]'
                        }`}
                      >
                        {topic === 'id' ? 'ID Pass' : topic}
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-medium tabular-nums text-[var(--app-text-muted)]">
                    {filteredCards.length} designs
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {filteredCards.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-[var(--app-text-secondary)]">No matches</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setQuickTopic('all');
              }}
              className="mt-3 rounded-lg px-3 py-2 text-xs underline underline-offset-4 hover:text-[var(--app-text-primary)] cursor-pointer"
            >
              Reset
            </button>
          </div>
        ) : (
          <div
            ref={galleryGridRef}
            className={`grid items-stretch ${galleryLayout === 'compact' ? 'grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1 gap-x-6 gap-y-8 min-[520px]:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'}`}
          >
            {filteredCards.map((card) => (
              <article
                key={card.id}
                data-reveal-card
                className="gpu-gallery-item card-editorial-hover group relative flex min-w-0 flex-col rounded-xl"
              >
                <a
                  href={`/card/${card.id}`}
                  aria-label={`View ${card.title}`}
                  onPointerMove={handleTiltPointerMove}
                  onPointerLeave={handleTiltPointerLeave}
                  className="card-tilt-surface relative block w-full rounded-xl text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-accent)]"
                >
                  <LazyTemplateCard
                    aspectRatio={getTemplateAspectRatio(card)}
                    stageRatio={1}
                    stageClassName={`rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface)] transition-colors group-hover:border-[var(--app-border-strong)] ${galleryLayout === 'compact' ? 'p-3 sm:p-4' : 'p-4 sm:p-5'}`}
                    className="card-tilt-glint overflow-hidden rounded-lg border border-black/15 card-artwork-zoom"
                  >
                    <UnifiedCardThumbnail template={card} isLight={theme === 'light'} className="h-full w-full" />
                  </LazyTemplateCard>
                  <span className="pointer-events-none absolute right-2.5 bottom-2.5 z-30 rounded-md border border-[var(--app-border-subtle)] bg-[var(--app-bg)]/90 px-2 py-0.5 text-[11px] font-medium text-[var(--app-text-secondary)] opacity-0 translate-y-1 transition-[opacity,transform] duration-150 group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0">
                    {card.categoryLabel || card.tag || 'Template'}
                  </span>
                </a>

                <a
                  href={`/card/${card.id}`}
                  className="mt-3 block truncate text-[15px] font-medium text-[var(--app-text-primary)] group-hover:text-[var(--app-accent)] transition-colors"
                >
                  {card.title}
                </a>

                <div className="mt-2.5 flex items-center gap-2">
                  <a
                    href={getEditorHref(card)}
                    className="btn-sheen inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-lg border border-[var(--app-border-strong)] bg-[var(--app-surface)] px-3 text-[13px] font-medium text-[var(--app-text-primary)] transition-colors hover:bg-[var(--app-surface-secondary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--app-accent)] interactive-tactile"
                  >
                    <span>Edit card</span> <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <AdSlot slotId="home-bottom-slot" format="horizontal" className="mt-10" />
    </div>
  );
};
