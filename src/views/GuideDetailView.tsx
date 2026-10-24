import React, { useEffect } from 'react';
import type { GuideArticle, CardTemplate } from '../types/card';
import { PRESET_TEMPLATES } from '../data/templates';
import { GUIDE_ARTICLES } from '../data/guides';
import { updatePageSEO } from '../utils/seo';
import { AdSlot } from '../components/AdSlot';
import {
  ChevronRight,
  Clock,
  Calendar,
  PenTool,
  ArrowRight,
  BookOpen,
  Info,
} from 'lucide-react';

interface GuideDetailViewProps {
  guide: GuideArticle;
  onNavigate?: (path: string) => void;
  onOpenEditorWithTemplate?: (template: CardTemplate) => void;
  theme?: 'dark' | 'light';
}

export const GuideDetailView: React.FC<GuideDetailViewProps> = ({
  guide,
}) => {

  // Recommended templates
  const recommendedTemplates = PRESET_TEMPLATES.filter((t) =>
    guide.recommendedTemplateIds.includes(t.id)
  );

  // Other related guides
  const otherGuides = GUIDE_ARTICLES.filter((g) => g.slug !== guide.slug).slice(0, 4);

  // Dynamic SEO & Article JSON-LD
  useEffect(() => {
    updatePageSEO({
      title: `${guide.metaTitle} — Aesthetic Card Studio`,
      description: guide.metaDescription,
      canonicalPath: guide.path,
      ogType: 'article',
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://aestheticcardstudio.com/' },
            { '@type': 'ListItem', position: 2, name: 'Guides', item: 'https://aestheticcardstudio.com/guides' },
            { '@type': 'ListItem', position: 3, name: guide.title, item: `https://aestheticcardstudio.com${guide.path}` },
          ],
        },
        {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: guide.title,
          description: guide.description,
          mainEntityOfPage: `https://aestheticcardstudio.com${guide.path}`,
          datePublished: '2026-10-01',
          publisher: {
            '@type': 'Organization',
            name: 'Aesthetic Card Studio',
            url: 'https://aestheticcardstudio.com/',
          },
        },
      ],
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [guide]);

  return (
    <article className="w-full pt-20 pb-20 transition-colors duration-200 text-[var(--app-text-primary)]">
      <div className="studio-container-narrow flex flex-col gap-10">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="studio-breadcrumb overflow-x-auto whitespace-nowrap">
          <a href="/" className="cursor-pointer">
            Home
          </a>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          <a href="/guides" className="cursor-pointer">
            Guides
          </a>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          <span className="active truncate">
            {guide.title}
          </span>
        </nav>

        {/* Article Header */}
        <header className="flex flex-col gap-4 border-b pb-8 border-[var(--app-border-subtle)]">
          <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--app-text-muted)] font-subheading">
            <span className="font-bold uppercase tracking-wider text-[var(--app-accent)]">
              {guide.category}
            </span>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{guide.readTime}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{guide.publishedDate}</span>
            </div>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight font-heading leading-tight">
            {guide.title}
          </h1>

          <p className="text-base md:text-lg leading-relaxed text-[var(--app-text-secondary)]">
            {guide.subtitle}
          </p>
        </header>

        {/* Main Guide Content Sections */}
        <div className="flex flex-col gap-10 leading-relaxed text-sm">
          {guide.sections.map((sec, idx) => (
            <section key={idx} className="flex flex-col gap-3.5">
              <h2 className="text-xl md:text-2xl font-bold font-heading tracking-tight text-[var(--app-text-primary)]">
                {sec.heading}
              </h2>
              <p className="text-[var(--app-text-secondary)]">
                {sec.body}
              </p>

              {sec.bullets && sec.bullets.length > 0 && (
                <ul className="flex flex-col gap-2 pl-4 list-disc text-xs md:text-sm text-[var(--app-text-secondary)]">
                  {sec.bullets.map((b, bIdx) => (
                    <li key={bIdx}>
                      {b}
                    </li>
                  ))}
                </ul>
              )}

              {sec.callout && (
                <aside className="my-3 p-4 rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-secondary)] flex items-start gap-3">
                  <Info className="w-4 h-4 text-[var(--app-accent)] shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-1 text-xs">
                    <strong className="font-bold font-heading text-[var(--app-text-primary)]">{sec.callout.title}</strong>
                    <p className="leading-relaxed text-[var(--app-text-secondary)]">{sec.callout.text}</p>
                  </div>
                </aside>
              )}

              {/* Safe advertising insertion after 2nd section */}
              {idx === 1 && <AdSlot slotId="guide-in-article-slot" />}
            </section>
          ))}
        </div>

        {/* Recommended Presets Box */}
        {recommendedTemplates.length > 0 && (
          <section className="studio-panel p-6 flex flex-col gap-4 bg-[var(--app-surface-secondary)]">
            <div>
              <span className="text-[10px] font-bold text-[var(--app-accent)] uppercase tracking-wider block font-subheading">
                Recommended Art Directions for this Workflow
              </span>
              <h3 className="text-base font-bold font-heading text-[var(--app-text-primary)]">
                Try These Curated Styles
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recommendedTemplates.map((t) => (
                <div
                  key={t.id}
                  style={{ backgroundColor: t.theme.bg, color: t.theme.ink }}
                  className="p-5 rounded-xl border border-black/15 flex flex-col justify-between shadow-sm"
                >
                  <div>
                    <span className="text-[10px] font-mono opacity-70 block mb-1">{t.tag}</span>
                    <blockquote className="text-xs font-editorial line-clamp-2">
                      “{t.quote}”
                    </blockquote>
                  </div>
                  <div className="pt-3 border-t border-current/15 mt-3 flex items-center justify-between">
                    <cite className="not-italic text-[10px] font-medium opacity-80 truncate">
                      — {t.author}
                    </cite>
                    <a
                      href={`/create?template=${t.id}`}
                      className="px-2.5 py-1 rounded bg-black/10 hover:bg-black/20 text-[10px] font-semibold cursor-pointer transition-colors"
                    >
                      Open in Studio →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Clear Next Action CTA Banner */}
        <section className="studio-panel p-8 text-center flex flex-col items-center gap-4">
          <PenTool className="w-6 h-6 text-[var(--app-accent)]" />
          <h2 className="text-xl font-bold font-heading text-[var(--app-text-primary)]">
            Ready to Create Your Card?
          </h2>
          <p className="text-xs max-w-md text-[var(--app-text-secondary)]">
            {guide.actionPrompt}
          </p>
          <a
            href="/create"
            className="studio-btn-primary"
          >
            <span>Launch Studio Creator</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </section>

        {/* Related Guides Links */}
        <footer className="flex flex-col gap-4 border-t pt-8 border-[var(--app-border-subtle)]">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[var(--app-text-muted)]" />
            <h3 className="text-xs font-bold uppercase tracking-wider font-subheading text-[var(--app-text-primary)]">
              Related Typography &amp; Design Guides
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {otherGuides.map((g) => (
              <a
                key={g.slug}
                href={g.path}
                className="studio-panel p-4 text-left flex flex-col justify-between hover:border-[var(--app-accent)] transition-colors cursor-pointer"
              >
                <span className="text-[10px] text-[var(--app-accent)] font-bold uppercase block mb-1 font-subheading">
                  {g.category}
                </span>
                <span className="text-xs font-semibold line-clamp-2 text-[var(--app-text-primary)]">
                  {g.title}
                </span>
                <span className="text-[10px] text-[var(--app-text-muted)] mt-2 block font-subheading">
                  {g.readTime}
                </span>
              </a>
            ))}
          </div>
        </footer>
      </div>
    </article>
  );
};
