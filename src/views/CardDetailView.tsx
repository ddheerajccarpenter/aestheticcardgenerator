import React, { useEffect, useMemo, useRef } from 'react';
import { ArrowRight, ChevronRight, Layers } from '../components/icons/faIcons';
import type { CardTemplate } from '../types/card';
import { PRESET_TEMPLATES } from '../data/templates';
import { UnifiedCardThumbnail } from '../components/UnifiedCardThumbnail';
import { LazyTemplateCard } from '../components/LazyTemplateCard';
import { getTemplateAspectRatio } from '../utils/templateAspectRatio';
import { PRODUCTION_DOMAIN, updatePageSEO } from '../utils/seo';
import { AdSlot } from '../components/AdSlot';
import {
  animateSpringPop,
  handleTiltPointerLeave,
  handleTiltPointerMove,
  observeScrollReveal,
  onStageReady,
  revealPressWords,
} from '../utils/motion';

interface CardDetailViewProps {
  template: CardTemplate;
  theme?: 'dark' | 'light';
}

export const CardDetailView: React.FC<CardDetailViewProps> = ({ template, theme = 'dark' }) => {
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const heroCardRef = useRef<HTMLDivElement | null>(null);
  const relatedRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    updatePageSEO({
      title: `${template.title} - Free Editable Template | ACG`,
      description:
        template.description ||
        `Customize "${template.title}" (${template.categoryLabel}) in your browser and export watermark-free PNG, JPEG, or WebP.`,
      canonicalPath: `/card/${template.id}`,
      ogType: 'website',
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${PRODUCTION_DOMAIN}/` },
            { '@type': 'ListItem', position: 2, name: 'Templates', item: `${PRODUCTION_DOMAIN}/templates` },
            { '@type': 'ListItem', position: 3, name: template.title, item: `${PRODUCTION_DOMAIN}/card/${template.id}` },
          ],
        },
        {
          '@context': 'https://schema.org',
          '@type': 'CreativeWork',
          name: template.title,
          description: template.description || `${template.categoryLabel} template`,
          url: `${PRODUCTION_DOMAIN}/card/${template.id}`,
          isAccessibleForFree: true,
        },
      ],
    });
    window.scrollTo({ top: 0, behavior: 'auto' });
    return onStageReady(() => {
      revealPressWords(titleRef.current, 20);
      if (heroCardRef.current) animateSpringPop(heroCardRef.current, 'settle');
    });
  }, [template]);

  const related = useMemo(() => {
    const sameCat = PRESET_TEMPLATES.filter((t) => t.id !== template.id && t.category === template.category);
    const pool = sameCat.length >= 4
      ? sameCat
      : [...sameCat, ...PRESET_TEMPLATES.filter((t) => t.id !== template.id && t.category !== template.category)];
    return pool.slice(0, 4);
  }, [template]);

  useEffect(() => {
    return observeScrollReveal(relatedRef.current, '[data-reveal-card]', { staggerMs: 45, yOffset: 16 });
  }, [template.id]);

  const width = template.canvasDoc?.canvasWidth ?? (template.layoutHint === 'square' ? 1080 : template.layoutHint === 'vertical' ? 640 : 960);
  const height = template.canvasDoc?.canvasHeight ?? (template.layoutHint === 'square' ? 1080 : template.layoutHint === 'vertical' ? 960 : 600);
  const canvasHref = `/canvas?template=${encodeURIComponent(template.id)}`;
  const quickHref = `/create?template=${encodeURIComponent(template.id)}`;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-28 pt-5 sm:px-6 sm:pt-10 md:pb-16 text-[var(--app-text-primary)]">
      <nav aria-label="Breadcrumb" className="studio-breadcrumb mb-5 flex-wrap">
        <a href="/">Gallery</a>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        <a href={template.isSignature ? '/premium' : '/templates'}>
          {template.isSignature ? 'Signature' : 'Templates'}
        </a>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="active truncate">{template.title}</span>
      </nav>

      <section className="grid grid-cols-1 items-start gap-7 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7 flex justify-center rounded-2xl border border-[var(--app-border-subtle)] bg-[var(--app-surface)] p-4 sm:p-8">
          <div
            ref={heroCardRef}
            onPointerMove={handleTiltPointerMove}
            onPointerLeave={handleTiltPointerLeave}
            className="card-tilt-surface w-full max-w-[440px]"
          >
            <LazyTemplateCard
              aspectRatio={getTemplateAspectRatio(template)}
              className="card-tilt-glint overflow-hidden rounded-xl border border-black/15 shadow-2xl"
            >
              <UnifiedCardThumbnail template={template} isLight={theme === 'light'} className="h-full w-full" />
            </LazyTemplateCard>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-5">
          <div>
            <span className="font-mono text-xs tabular-nums text-[var(--app-accent)]">
              {width} × {height} px
            </span>
            <h1 ref={titleRef} className="mt-2 text-3xl sm:text-4xl font-heading tracking-tight leading-tight">
              {template.title.split(' ').map((word, idx) => (
                <span key={idx} className="press-word-clip mr-[0.22em]">
                  <span data-press-word className="press-word">{word}</span>
                </span>
              ))}
            </h1>
          </div>

          <div className="flex flex-col gap-2.5">
            <a
              href={canvasHref}
              className="btn-editorial-primary btn-sheen interactive-tactile min-h-[48px] w-full justify-center text-sm"
            >
              <Layers className="h-4 w-4" aria-hidden="true" />
              <span>Open in Canvas</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>

            {!template.canvasDoc && (
              <a
                href={quickHref}
                className="btn-editorial-ghost interactive-tactile min-h-[44px] w-full justify-center text-[13px]"
              >
                <span>Open Quick Maker</span>
              </a>
            )}
          </div>
        </div>
      </section>

      <AdSlot slotId="card-detail-slot" format="horizontal" />

      <section aria-labelledby="related-cards-heading" className="mt-10 border-t border-[var(--app-border-subtle)] pt-8">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 id="related-cards-heading" className="text-xl sm:text-2xl font-heading">
            Related cards
          </h2>
          <a href="/templates" className="editorial-link-underline text-[13px] font-semibold text-[var(--app-accent)]">
            Browse templates
          </a>
        </div>
        <div ref={relatedRef} className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {related.map((item) => (
            <a
              key={item.id}
              data-reveal-card
              href={`/card/${item.id}`}
              onPointerMove={handleTiltPointerMove}
              onPointerLeave={handleTiltPointerLeave}
              className="card-tilt-surface card-editorial-hover group block min-w-0 rounded-xl"
            >
              <LazyTemplateCard
                aspectRatio={getTemplateAspectRatio(item)}
                stageRatio={1}
                stageClassName="rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface)] p-2.5 sm:p-3.5 transition-colors group-hover:border-[var(--app-border-strong)]"
                className="card-tilt-glint overflow-hidden rounded-lg border border-black/15 card-artwork-zoom"
              >
                <UnifiedCardThumbnail template={item} isLight={theme === 'light'} className="h-full w-full" />
              </LazyTemplateCard>
              <span className="mt-2 block truncate text-[13px] sm:text-sm font-medium group-hover:text-[var(--app-accent)] transition-colors">
                {item.title}
              </span>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
};
