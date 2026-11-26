import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, Layers, Sparkles } from 'lucide-react';
import { PREMIUM_SIGNATURE_TEMPLATES } from '../data/premiumTemplates';
import { UnifiedCardThumbnail } from '../components/UnifiedCardThumbnail';
import { LazyTemplateCard } from '../components/LazyTemplateCard';
import { getTemplateAspectRatio } from '../utils/templateAspectRatio';
import { PRODUCTION_DOMAIN, updatePageSEO } from '../utils/seo';
import { AdSlot } from '../components/AdSlot';
import type { CardTemplate } from '../types/card';

export interface PremiumViewProps {
  theme?: 'dark' | 'light';
  onOpenEditorWithTemplate?: (template: CardTemplate) => void;
  onNavigate?: (path: string) => void;
}

type SignatureFilter = 'all' | 'light-leak' | 'typography' | 'editorial' | 'collage';

const SIGNATURE_FILTERS: Array<{ id: SignatureFilter; label: string }> = [
  { id: 'all', label: 'All Signature (14)' },
  { id: 'light-leak', label: 'Light-Leaks & Aura' },
  { id: 'typography', label: 'Display Typography' },
  { id: 'editorial', label: 'Swiss & Minimal' },
  { id: 'collage', label: 'Collage & Foil' },
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
  }, []);

  const visibleTemplates = useMemo(
    () => PREMIUM_SIGNATURE_TEMPLATES.filter((t) => matchesSignatureFilter(t, activeFilter)),
    [activeFilter]
  );

  return (
    <div className="studio-container py-6 sm:py-10 pb-28 md:pb-16" data-theme={theme}>
      <header className="mb-6 sm:mb-8 border-b border-[var(--app-border-subtle)] pb-6 animate-card-entrance">
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--app-border-strong)] bg-[var(--app-surface)] px-3 py-1 text-[10px] font-mono uppercase tracking-[0.14em] text-[var(--app-accent)]">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Signature Editions · 100% Free</span>
        </div>

        <h1 className="mt-3 max-w-[18ch] font-heading text-[clamp(2rem,4.5vw,3.4rem)] leading-[0.96] tracking-tight text-[var(--app-text-primary)]">
          Flagship designs, <span className="font-editorial font-normal italic text-[var(--app-accent)]">free to customize.</span>
        </h1>

        <p className="mt-3 max-w-xl text-sm text-[var(--app-text-secondary)]">
          14 prism light-leak, Swiss refraction, and gold-foil cards. Export 4K PNG, WebP, or 3D PNG free.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-[var(--app-text-muted)]">
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-[var(--app-accent)]" aria-hidden="true" />
            Editable layers
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-[var(--app-accent)]" aria-hidden="true" />
            4K &amp; 3D PNG free
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-[var(--app-accent)]" aria-hidden="true" />
            No watermarks
          </span>
        </div>
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
          <span>Full Directory</span>
        </a>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visibleTemplates.map((tmpl, idx) => {
          const w = tmpl.canvasDoc?.canvasWidth ?? 640;
          const h = tmpl.canvasDoc?.canvasHeight ?? 960;
          return (
            <article
              key={tmpl.id}
              style={{ '--stagger-i': idx % 10 } as React.CSSProperties}
              className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-[var(--app-border-subtle)] bg-[var(--app-surface)] p-4 card-editorial-hover animate-card-entrance"
            >
              <div>
                <a
                  href={`/card/${encodeURIComponent(tmpl.id)}`}
                  aria-label={`View ${tmpl.title}`}
                  className="block overflow-hidden rounded-xl border border-black/15 bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--app-accent)]"
                >
                  <LazyTemplateCard aspectRatio={getTemplateAspectRatio(tmpl)} className="card-artwork-zoom">
                    <UnifiedCardThumbnail template={tmpl} isLight={theme === 'light'} className="h-full w-full" />
                  </LazyTemplateCard>
                </a>

                <div className="mt-3.5 flex items-start justify-between gap-2">
                  <a href={`/card/${encodeURIComponent(tmpl.id)}`} className="min-w-0">
                    <span className="inline-block font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--app-accent)]">
                      {tmpl.categoryLabel} · Free
                    </span>
                    <h2 className="mt-1 text-base font-bold text-[var(--app-text-primary)] group-hover:text-[var(--app-accent)] transition-colors">
                      {tmpl.title}
                    </h2>
                  </a>
                  <span className="shrink-0 rounded-md border border-[var(--app-border-subtle)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--app-text-muted)]">
                    {w}×{h}
                  </span>
                </div>
              </div>

              <div className="mt-3.5 pt-3 border-t border-[var(--app-border-subtle)] flex items-center gap-2">
                <a
                  href={`/canvas?template=${encodeURIComponent(tmpl.id)}`}
                  className="btn-sheen interactive-tactile inline-flex flex-1 min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[var(--app-accent)] px-4 py-2 text-xs font-bold text-[var(--app-accent-ink)] transition-colors hover:bg-[var(--app-accent-hover)]"
                >
                  <span>Edit Free in Studio</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </div>
            </article>
          );
        })}
      </div>

      <AdSlot slotId="premium-bottom-slot" format="horizontal" className="mt-10" />
    </div>
  );
};
