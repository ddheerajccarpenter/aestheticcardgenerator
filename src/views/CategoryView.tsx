import React, { useEffect, useRef } from 'react';
import type { CategoryMeta, CardTemplate } from '../types/card';
import { PRESET_TEMPLATES } from '../data/templates';
import { PRODUCTION_DOMAIN, updatePageSEO } from '../utils/seo';
import { AdSlot } from '../components/AdSlot';
import { LazyTemplateCard } from '../components/LazyTemplateCard';
import { UnifiedCardThumbnail } from '../components/UnifiedCardThumbnail';
import { getTemplateAspectRatio } from '../utils/templateAspectRatio';
import { ArrowRight, ChevronRight, PenTool, Sparkles } from 'lucide-react';
import {
  handleTiltPointerLeave,
  handleTiltPointerMove,
  observeScrollReveal,
  onStageReady,
  revealPressWords,
} from '../utils/motion';

interface CategoryViewProps {
  category: CategoryMeta;
  onNavigate: (path: string) => void;
  onOpenEditorWithTemplate: (template: CardTemplate) => void;
  theme?: 'dark' | 'light';
}

export const CategoryView: React.FC<CategoryViewProps> = ({
  category,
  theme = 'dark',
}) => {
  const headerRef = useRef<HTMLElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);

  const matchingTemplates = PRESET_TEMPLATES.filter((t) =>
    category.matchedTemplateIds.includes(t.id)
  );
  const displayTemplates = matchingTemplates.length > 0 ? matchingTemplates : PRESET_TEMPLATES.slice(0, 3);

  useEffect(() => {
    updatePageSEO({
      title: `${category.metaTitle} - Aesthetic Card Studio`,
      description: category.metaDescription,
      canonicalPath: category.path,
      ogType: 'website',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${PRODUCTION_DOMAIN}/` },
          { '@type': 'ListItem', position: 2, name: 'Templates', item: `${PRODUCTION_DOMAIN}/templates` },
          { '@type': 'ListItem', position: 3, name: category.title, item: `${PRODUCTION_DOMAIN}${category.path}` },
        ],
      },
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return onStageReady(() => revealPressWords(headerRef.current, 20));
  }, [category]);

  useEffect(() => {
    return observeScrollReveal(gridRef.current, '[data-reveal-card]', { staggerMs: 45, yOffset: 18 });
  }, [category.slug]);

  return (
    <div className="w-full pt-8 sm:pt-12 pb-28 md:pb-20 transition-colors duration-200 text-[var(--app-text-primary)]">
      <div className="studio-container flex flex-col gap-8">
        <nav aria-label="Breadcrumb" className="studio-breadcrumb">
          <a href="/" className="cursor-pointer">Home</a>
          <ChevronRight className="w-3.5 h-3.5" />
          <a href="/templates" className="cursor-pointer">Templates</a>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="active">{category.title}</span>
        </nav>

        <header ref={headerRef} className="flex flex-col gap-4 border-b pb-6 border-[var(--app-border-subtle)] sm:flex-row sm:items-end sm:justify-between">
          <h1 className="text-3xl md:text-5xl font-medium tracking-tight font-heading leading-tight">
            {category.title.split(' ').map((word, idx) => (
              <span key={idx} className="press-word-clip mr-[0.22em]">
                <span data-press-word className="press-word">{word}</span>
              </span>
            ))}
          </h1>
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {displayTemplates[0] && (
              <a
                href={`/canvas?template=${encodeURIComponent(displayTemplates[0].id)}`}
                className="studio-btn-primary btn-sheen interactive-tactile min-h-[44px]"
              >
                <PenTool className="w-4 h-4" />
                <span>Create card</span>
              </a>
            )}
            <a
              href="/templates"
              className="studio-btn-secondary interactive-tactile min-h-[44px]"
            >
              <span>Browse templates</span>
            </a>
          </div>
        </header>

        <section aria-label={category.title}>
          <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayTemplates.map((template) => (
              <article
                key={template.id}
                data-reveal-card
                className="studio-panel card-editorial-hover group flex flex-col overflow-hidden"
              >
                <div className="p-3 pb-0">
                  <a
                    href={`/card/${template.id}`}
                    aria-label={`View ${template.title}`}
                    onPointerMove={handleTiltPointerMove}
                    onPointerLeave={handleTiltPointerLeave}
                    className="card-tilt-surface block"
                  >
                    <LazyTemplateCard
                      aspectRatio={getTemplateAspectRatio(template)}
                      className="card-tilt-glint rounded-lg border border-black/15 card-artwork-zoom"
                    >
                      <UnifiedCardThumbnail
                        template={template}
                        isLight={theme === 'light'}
                        className="h-full w-full"
                      />
                    </LazyTemplateCard>
                  </a>
                </div>

                <div className="p-4 flex flex-col gap-3 bg-[var(--app-surface-secondary)] border-t border-[var(--app-border-subtle)] mt-3">
                  <a href={`/card/${template.id}`} className="flex items-center justify-between gap-2">
                    <h2 className="text-[15px] font-semibold font-heading text-[var(--app-text-primary)] group-hover:text-[var(--app-accent)] transition-colors truncate">
                      {template.title}
                    </h2>
                  </a>

                  <div className={`grid gap-2 pt-1 ${template.canvasDoc ? 'grid-cols-1' : 'grid-cols-2'}`}>
                    <a
                      href={`/canvas?template=${template.id}`}
                      className="studio-btn-primary btn-sheen interactive-tactile min-h-[44px] !py-1.5 !px-2.5 !text-[13px] !rounded-xl"
                      title="Open in Canvas Studio"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Open Canvas</span>
                    </a>
                    {!template.canvasDoc && (
                      <a
                        href={`/create?template=${template.id}`}
                        className="studio-btn-secondary interactive-tactile min-h-[44px] !py-1.5 !px-2.5 !text-[13px] !rounded-xl"
                        title="Open in Card Creator"
                      >
                        <span>Quick maker</span>
                        <ArrowRight className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <AdSlot slotId="category-bottom-slot" />
      </div>
    </div>
  );
};
