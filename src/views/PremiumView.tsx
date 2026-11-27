import React, { useEffect, useMemo, useRef, useState } from 'react';
import { animate, stagger } from 'animejs';
import { ArrowRight, Layers } from 'lucide-react';
import { PREMIUM_SIGNATURE_TEMPLATES } from '../data/premiumTemplates';
import { UnifiedCardThumbnail } from '../components/UnifiedCardThumbnail';
import { LazyTemplateCard } from '../components/LazyTemplateCard';
import { getTemplateAspectRatio } from '../utils/templateAspectRatio';
import { PRODUCTION_DOMAIN, updatePageSEO } from '../utils/seo';
import { AdSlot } from '../components/AdSlot';
import type { CardTemplate } from '../types/card';
import {
  EDITORIAL_EASE,
  handleTiltPointerLeave,
  handleTiltPointerMove,
  isReducedMotion,
  observeScrollReveal,
  onStageReady,
  revealPressWords,
} from '../utils/motion';

export interface PremiumViewProps {
  theme?: 'dark' | 'light';
  onOpenEditorWithTemplate?: (template: CardTemplate) => void;
  onNavigate?: (path: string) => void;
}

type SignatureFilter = 'all' | 'light-leak' | 'typography' | 'editorial' | 'collage';

const SIGNATURE_FILTERS: Array<{ id: SignatureFilter; label: string }> = [
  { id: 'all', label: 'All (14)' },
  { id: 'light-leak', label: 'Aura' },
  { id: 'typography', label: 'Type' },
  { id: 'editorial', label: 'Swiss' },
  { id: 'collage', label: 'Collage' },
];

const matchesSignatureFilter = (tmpl: CardTemplate, filter: SignatureFilter): boolean => {
  if (filter === 'all') return true;
  const tags = tmpl.tags || [];
  if (filter === 'light-leak') {
    return tags.some((t) => ['aura', 'light-leak', 'chromatic', 'impressionist', 'painterly'].includes(t));
  }
  if (filter === 'typography') {
    return tags.some((t) => ['typography', 'devanagari', 'retro', 'condensed', 'gouache', 'handwritten'].includes(t));
  }
  if (filter === 'editorial') {
    return tags.some((t) => ['swiss', 'glass', 'cobalt', 'minimal', 'handwritten'].includes(t));
  }
  return tags.some((t) => ['collage', 'split', 'gold-foil', 'engraving', 'textile'].includes(t));
};

export const PremiumView: React.FC<PremiumViewProps> = ({
  theme = 'dark',
}) => {
  const [activeFilter, setActiveFilter] = useState<SignatureFilter>('all');
  const headerRef = useRef<HTMLElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    updatePageSEO({
      title: 'Signature Studio Collection (100% Free) - Aesthetic Card Generator',
      description:
        'Explore our 14 flagship layered card designs: chromatic light-leaks, Swiss refraction posters, gold-foil engravings, and tactile lettering. Free to customize and export.',
      canonicalPath: '/premium',
      ogType: 'website',
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Signature Free Editions',
          url: `${PRODUCTION_DOMAIN}/premium`,
          isAccessibleForFree: true,
        },
        {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: 'Are Signature Edition cards really free to download?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Yes. Every card in the Signature collection is 100% free to open in Canvas Studio, edit across every layer, and download without watermarks.',
              },
            },
          ],
        },
      ],
    });
    return onStageReady(() => revealPressWords(headerRef.current, 20));
  }, []);

  const visibleTemplates = useMemo(
    () => PREMIUM_SIGNATURE_TEMPLATES.filter((t) => matchesSignatureFilter(t, activeFilter)),
    [activeFilter]
  );

  useEffect(() => {
    const cleanup = observeScrollReveal(gridRef.current, '[data-reveal-card]', {
      staggerMs: 40,
      yOffset: 18,
    });
    if (gridRef.current && !isReducedMotion()) {
      const cards = gridRef.current.querySelectorAll<HTMLElement>('[data-reveal-card]');
      if (cards.length) {
        animate(cards, {
          opacity: [0, 1],
          y: [14, 0],
          duration: 380,
          delay: stagger(35),
          ease: EDITORIAL_EASE,
        });
      }
    }
    return cleanup;
  }, [activeFilter]);

  return (
    <div className="studio-container py-6 sm:py-10 pb-28 md:pb-16" data-theme={theme}>
      <header ref={headerRef} className="mb-6 border-b border-[var(--app-border-subtle)] pb-5">
        <h1 className="max-w-[16ch] font-heading text-[clamp(2.2rem,5vw,3.8rem)] leading-[0.95] tracking-tight text-[var(--app-text-primary)]">
          <span className="press-word-clip mr-[0.22em]">
            <span data-press-word className="press-word">Signature</span>
          </span>
          <span className="press-word-clip">
            <span data-press-word className="press-word font-editorial font-normal italic text-[var(--app-accent)]">
              Editions
            </span>
          </span>
        </h1>
      </header>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter signature cards">
          {SIGNATURE_FILTERS.map((f) => {
            const active = activeFilter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                aria-pressed={active}
                onClick={() => setActiveFilter(f.id)}
                className={`min-h-[44px] rounded-xl px-4 py-2 text-xs font-semibold transition-all interactive-tactile cursor-pointer ${
                  active
                    ? 'bg-[var(--app-accent)] text-[var(--app-accent-ink)] shadow-sm'
                    : 'border border-[var(--app-border-subtle)] bg-[var(--app-surface)] text-[var(--app-text-secondary)] hover:bg-[var(--app-surface-secondary)] hover:text-[var(--app-text-primary)]'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        <a
          href="/templates"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface)] px-4 py-2 text-xs font-semibold text-[var(--app-text-secondary)] hover:bg-[var(--app-surface-secondary)] hover:text-[var(--app-text-primary)] interactive-tactile"
        >
          <Layers className="h-4 w-4" aria-hidden="true" />
          <span>All</span>
        </a>
      </div>

      <div ref={gridRef} className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visibleTemplates.map((tmpl) => (
          <article
            key={tmpl.id}
            data-reveal-card
            className="gpu-gallery-item group flex flex-col justify-between overflow-hidden rounded-2xl border border-[var(--app-border-subtle)] bg-[var(--app-surface)] p-4 transition-colors"
          >
            <div>
              <a
                href={`/card/${encodeURIComponent(tmpl.id)}`}
                aria-label={`View ${tmpl.title}`}
                onPointerMove={handleTiltPointerMove}
                onPointerLeave={handleTiltPointerLeave}
                className="card-tilt-surface block focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--app-accent)] rounded-xl"
              >
                <LazyTemplateCard
                  aspectRatio={getTemplateAspectRatio(tmpl)}
                  stageRatio={1}
                  stageClassName="rounded-xl bg-[var(--app-bg)]/55 p-3 sm:p-4"
                  className="card-tilt-glint overflow-hidden rounded-lg ring-1 ring-[var(--app-border-subtle)] shadow-[0_10px_24px_rgba(0,0,0,0.22)] card-artwork-zoom"
                >
                  <UnifiedCardThumbnail template={tmpl} isLight={theme === 'light'} className="h-full w-full" />
                </LazyTemplateCard>
              </a>

              <a href={`/card/${encodeURIComponent(tmpl.id)}`} className="mt-3 block min-w-0">
                <h2 className="truncate text-base font-bold text-[var(--app-text-primary)] group-hover:text-[var(--app-accent)] transition-colors">
                  {tmpl.title}
                </h2>
              </a>
            </div>

            <div className="mt-3 pt-3 border-t border-[var(--app-border-subtle)] flex items-center gap-2">
              <a
                href={`/canvas?template=${encodeURIComponent(tmpl.id)}`}
                className="btn-sheen interactive-tactile inline-flex flex-1 min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[var(--app-accent)] px-4 py-2 text-xs font-bold text-[var(--app-accent-ink)] transition-colors hover:bg-[var(--app-accent-hover)]"
              >
                <span>Edit</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>
          </article>
        ))}
      </div>

      <AdSlot slotId="premium-bottom-slot" format="horizontal" className="mt-10" />
    </div>
  );
};
