import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Check, ChevronRight, Copy, Layers, Sparkles } from 'lucide-react';
import type { CardTemplate } from '../types/card';
import { PRESET_TEMPLATES } from '../data/templates';
import { UnifiedCardThumbnail } from '../components/UnifiedCardThumbnail';
import { LazyTemplateCard } from '../components/LazyTemplateCard';
import { getTemplateAspectRatio } from '../utils/templateAspectRatio';
import { PRODUCTION_DOMAIN, updatePageSEO } from '../utils/seo';
import { AdSlot } from '../components/AdSlot';

interface CardDetailViewProps {
  template: CardTemplate;
  theme?: 'dark' | 'light';
}

export const CardDetailView: React.FC<CardDetailViewProps> = ({ template, theme = 'dark' }) => {
  const [copied, setCopied] = useState(false);

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
  }, [template]);

  const related = useMemo(() => {
    const sameCat = PRESET_TEMPLATES.filter((t) => t.id !== template.id && t.category === template.category);
    const pool = sameCat.length >= 4
      ? sameCat
      : [...sameCat, ...PRESET_TEMPLATES.filter((t) => t.id !== template.id && t.category !== template.category)];
    return pool.slice(0, 4);
  }, [template]);

  const width = template.canvasDoc?.canvasWidth ?? (template.layoutHint === 'square' ? 1080 : template.layoutHint === 'vertical' ? 640 : 960);
  const height = template.canvasDoc?.canvasHeight ?? (template.layoutHint === 'square' ? 1080 : template.layoutHint === 'vertical' ? 960 : 600);
  const canvasHref = `/canvas?template=${encodeURIComponent(template.id)}`;
  const quickHref = `/create?template=${encodeURIComponent(template.id)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${template.quote}\n- ${template.author}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard optional
    }
  };

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
        <div className="lg:col-span-7 flex justify-center rounded-2xl border border-[var(--app-border-subtle)] bg-[var(--app-surface)] p-4 sm:p-8 animate-card-entrance">
          <div className="w-full max-w-[440px]">
            <LazyTemplateCard
              aspectRatio={getTemplateAspectRatio(template)}
              className="overflow-hidden rounded-xl border border-black/15 shadow-2xl card-editorial-hover"
            >
              <UnifiedCardThumbnail template={template} isLight={theme === 'light'} className="h-full w-full" />
            </LazyTemplateCard>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-5">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--app-border-strong)] bg-[var(--app-surface)] px-3 py-1 text-[10px] font-mono uppercase tracking-[0.14em] text-[var(--app-accent)]">
              <Sparkles className="h-3 w-3" aria-hidden="true" />
              {template.categoryLabel} · Free
            </span>
            <h1 className="mt-3 text-3xl sm:text-4xl font-heading tracking-tight leading-tight">
              {template.title}
            </h1>
            {template.description && (
              <p className="mt-2.5 text-sm leading-relaxed text-[var(--app-text-secondary)]">
                {template.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2.5 rounded-2xl border border-[var(--app-border-subtle)] bg-[var(--app-surface)] p-3.5 text-xs">
            <div>
              <span className="block text-[10px] font-mono uppercase tracking-wider text-[var(--app-text-muted)]">Canvas</span>
              <span className="mt-0.5 block font-mono font-semibold">{width} × {height}px</span>
            </div>
            <div>
              <span className="block text-[10px] font-mono uppercase tracking-wider text-[var(--app-text-muted)]">Export</span>
              <span className="mt-0.5 block font-semibold">PNG · JPEG · WebP</span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <a
              href={canvasHref}
              className="btn-editorial-primary btn-sheen interactive-tactile min-h-[48px] w-full justify-center text-sm"
            >
              <Layers className="h-4 w-4" aria-hidden="true" />
              <span>Customize in Canvas Studio</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>

            <div className={`grid gap-2.5 ${template.canvasDoc ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {!template.canvasDoc && (
                <a
                  href={quickHref}
                  className="btn-editorial-ghost interactive-tactile min-h-[44px] w-full justify-center text-xs"
                >
                  <span>Quick Maker</span>
                </a>
              )}
              <button
                type="button"
                onClick={() => void handleCopy()}
                className="btn-editorial-ghost interactive-tactile min-h-[44px] w-full justify-center text-xs cursor-pointer"
              >
                {copied ? <Check className="h-4 w-4 text-[var(--app-accent)]" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <AdSlot slotId="card-detail-slot" format="horizontal" />

      <section aria-labelledby="related-cards-heading" className="mt-10 border-t border-[var(--app-border-subtle)] pt-8">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 id="related-cards-heading" className="text-xl sm:text-2xl font-heading">
            More Cards to Customize
          </h2>
          <a href="/templates" className="text-xs font-semibold text-[var(--app-accent)] hover:underline">
            All designs
          </a>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {related.map((item, idx) => (
            <a
              key={item.id}
              href={`/card/${item.id}`}
              style={{ '--stagger-i': idx } as React.CSSProperties}
              className="group block min-w-0 animate-card-entrance"
            >
              <LazyTemplateCard
                aspectRatio={getTemplateAspectRatio(item)}
                className="overflow-hidden rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface)] card-editorial-hover card-artwork-zoom"
              >
                <UnifiedCardThumbnail template={item} isLight={theme === 'light'} className="h-full w-full" />
              </LazyTemplateCard>
              <span className="mt-2 block truncate text-xs sm:text-sm font-semibold group-hover:text-[var(--app-accent)] transition-colors">
                {item.title}
              </span>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
};
