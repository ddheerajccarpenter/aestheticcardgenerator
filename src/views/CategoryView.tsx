import React, { useEffect } from 'react';
import type { CategoryMeta, CardTemplate } from '../types/card';
import { PRESET_TEMPLATES } from '../data/templates';
import { updatePageSEO } from '../utils/seo';
import { AdSlot } from '../components/AdSlot';
import {
  ArrowRight,
  Sparkles,
  ChevronRight,
  BookOpen,
  CheckCircle2,
  PenTool,
  HelpCircle,
} from 'lucide-react';

interface CategoryViewProps {
  category: CategoryMeta;
  onNavigate: (path: string) => void;
  onOpenEditorWithTemplate: (template: CardTemplate) => void;
  theme?: 'dark' | 'light';
}

export const CategoryView: React.FC<CategoryViewProps> = ({
  category,
  onNavigate,
  onOpenEditorWithTemplate,
}) => {

  // Find matching templates for this category
  const matchingTemplates = PRESET_TEMPLATES.filter((t) =>
    category.matchedTemplateIds.includes(t.id)
  );
  // Fallback to all if category has fewer
  const displayTemplates = matchingTemplates.length > 0 ? matchingTemplates : PRESET_TEMPLATES.slice(0, 3);

  // Dynamic SEO & Structured Data (BreadcrumbList + SoftwareApplication)
  useEffect(() => {
    updatePageSEO({
      title: `${category.metaTitle} — Aesthetic Card Studio`,
      description: category.metaDescription,
      canonicalPath: category.path,
      ogType: 'website',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://aestheticcardstudio.com/',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Templates',
            item: 'https://aestheticcardstudio.com/templates',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: category.title,
            item: `https://aestheticcardstudio.com${category.path}`,
          },
        ],
      },
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [category]);

  return (
    <div className="w-full pt-20 pb-20 transition-colors duration-200 text-[var(--app-text-primary)]">
      <div className="studio-container flex flex-col gap-12">
        {/* Semantic Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="studio-breadcrumb">
          <a href="/" className="cursor-pointer">
            Home
          </a>
          <ChevronRight className="w-3.5 h-3.5" />
          <a href="/templates" className="cursor-pointer">
            Templates
          </a>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="active">{category.title}</span>
        </nav>

        {/* Hero Section */}
        <header className="flex flex-col gap-4 text-left border-b pb-8 border-[var(--app-border-subtle)]">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--app-text-muted)] font-subheading">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated Style Directory</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight font-heading leading-tight">
            {category.title}
          </h1>
          <p className="text-base md:text-lg max-w-3xl leading-relaxed text-[var(--app-text-secondary)]">
            {category.subtitle}
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onOpenEditorWithTemplate(displayTemplates[0])}
              className="studio-btn-primary"
            >
              <PenTool className="w-4 h-4" />
              <span>Create with this Style</span>
            </button>
            <button
              onClick={() => onNavigate('/templates')}
              className="studio-btn-secondary"
            >
              <span>View All 8 Categories</span>
            </button>
          </div>
        </header>

        {/* Deep Narrative & Use Case Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 flex flex-col gap-4">
            <h2 className="text-xl font-bold font-heading">
              About This Art Direction
            </h2>
            <p className="text-sm leading-relaxed text-[var(--app-text-secondary)]">
              {category.longDescription}
            </p>
            <div className="studio-panel p-5 mt-2 bg-[var(--app-surface-secondary)]">
              <h3 className="text-xs font-bold uppercase tracking-wider mb-1.5 font-subheading text-[var(--app-text-primary)]">
                Primary Use Case
              </h3>
              <p className="text-xs leading-relaxed text-[var(--app-text-secondary)]">
                {category.useCase}
              </p>
            </div>
          </div>

          {/* Design Tips Card */}
          <div className="lg:col-span-4 studio-panel p-6 flex flex-col gap-3">
            <h3 className="text-xs font-bold uppercase tracking-wider font-subheading text-[var(--app-text-primary)]">
              Typesetting Best Practices
            </h3>
            <ul className="flex flex-col gap-2.5 text-xs">
              {category.designTips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--app-accent)] shrink-0 mt-0.5" />
                  <span className="text-[var(--app-text-secondary)]">{tip}</span>
                </li>
              ))}
            </ul>
            <div className="pt-3 border-t border-[var(--app-border-subtle)] text-[11px] text-[var(--app-text-muted)] font-subheading">
              Recommended Ratios: <strong className="text-[var(--app-text-primary)] font-mono">{category.bestAspectRatios.join(', ')}</strong>
            </div>
          </div>
        </section>

        {/* Real Templates Grid */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold font-heading">
                Tested Presets in this Style
              </h2>
              <p className="text-xs text-[var(--app-text-muted)] mt-0.5">
                Select any card to open the live editor and customize words, fonts, and paper textures.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayTemplates.map((template) => (
              <article
                key={template.id}
                className="studio-panel flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-1 shadow-md"
              >
                {/* Visual Preview */}
                <div
                  style={{ backgroundColor: template.theme.bg, color: template.theme.ink }}
                  className="relative p-6 min-h-[220px] flex flex-col justify-between border-b border-black/10"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono opacity-70">
                    <span>{template.tag}</span>
                    <span className="border border-current/30 px-1 rounded">{template.badge}</span>
                  </div>

                  <blockquote className="my-3 text-base leading-snug line-clamp-3 font-editorial">
                    “{template.quote}”
                  </blockquote>

                  <cite className="not-italic text-[11px] font-medium opacity-80 truncate">
                    — {template.author}
                  </cite>
                </div>

                {/* Action Bar */}
                <div className="p-4 flex items-center justify-between bg-[var(--app-surface-secondary)] border-t border-[var(--app-border-subtle)] mt-auto">
                  <div>
                    <h3 className="text-sm font-bold font-heading text-[var(--app-text-primary)]">
                      {template.title}
                    </h3>
                    <span className="text-[11px] text-[var(--app-text-muted)] font-subheading">{template.categoryLabel}</span>
                  </div>

                  <a
                    href={`/create?template=${template.id}`}
                    className="studio-btn-primary !py-1.5 !px-3 !text-xs !rounded-lg"
                  >
                    <span>Use Style</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Safe Advertising Placement */}
        <AdSlot slotId="category-bottom-slot" />

        {/* Category FAQs */}
        {category.faq.length > 0 && (
          <section className="flex flex-col gap-4 border-t pt-8 border-[var(--app-border-subtle)]">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[var(--app-text-muted)]" />
              <h2 className="text-lg font-bold font-heading">
                Frequently Asked Questions about {category.title}
              </h2>
            </div>
            <div className="flex flex-col gap-3">
              {category.faq.map((item, idx) => (
                <div
                  key={idx}
                  className="studio-panel p-5"
                >
                  <h3 className="text-sm font-bold font-heading mb-1 text-[var(--app-text-primary)]">
                    {item.q}
                  </h3>
                  <p className="text-xs leading-relaxed text-[var(--app-text-secondary)]">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Bottom Navigation Links to Guides */}
        <footer className="studio-panel p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-sm font-bold font-heading block text-[var(--app-text-primary)]">
              Want deeper typesetting advice?
            </span>
            <span className="text-xs text-[var(--app-text-secondary)]">
              Read our educational articles on typography, letter spacing, and card layout.
            </span>
          </div>
          <a
            href="/guides"
            className="studio-btn-primary"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Browse All Guides</span>
          </a>
        </footer>
      </div>
    </div>
  );
};
