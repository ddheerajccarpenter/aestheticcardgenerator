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
  theme = 'dark',
}) => {
  const isLight = theme === 'light';

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
    <article className={`w-full pt-20 pb-16 transition-colors duration-200 ${isLight ? 'bg-[#f8fafc] text-[#0f172a]' : 'bg-[#0b0e11] text-[#e1e2e7]'}`}>
      <div className="max-w-4xl mx-auto px-4 md:px-8 flex flex-col gap-10">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#707a8a] overflow-x-auto whitespace-nowrap">
          <a href="/" className="hover:underline cursor-pointer">
            Home
          </a>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          <a href="/guides" className="hover:underline cursor-pointer">
            Guides
          </a>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          <span className={`font-medium truncate ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
            {guide.title}
          </span>
        </nav>

        {/* Article Header */}
        <header className="flex flex-col gap-4 border-b pb-8 border-[#262c36]/40">
          <div className="flex flex-wrap items-center gap-3 text-xs text-[#707a8a]">
            <span className="font-semibold uppercase tracking-wider text-[#d97706] dark:text-[#fcd535]">
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

          <h1 className={`text-3xl md:text-5xl font-bold tracking-tight leading-tight ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
            {guide.title}
          </h1>

          <p className={`text-base md:text-lg leading-relaxed ${isLight ? 'text-[#475569]' : 'text-[#9ca3af]'}`}>
            {guide.subtitle}
          </p>
        </header>

        {/* Main Guide Content Sections */}
        <div className="flex flex-col gap-10 leading-relaxed text-sm">
          {guide.sections.map((sec, idx) => (
            <section key={idx} className="flex flex-col gap-3.5">
              <h2 className={`text-xl md:text-2xl font-bold tracking-tight ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
                {sec.heading}
              </h2>
              <p className={isLight ? 'text-[#334155]' : 'text-[#c4c7c8]'}>
                {sec.body}
              </p>

              {sec.bullets && sec.bullets.length > 0 && (
                <ul className="flex flex-col gap-2 pl-4 list-disc text-xs md:text-sm">
                  {sec.bullets.map((b, bIdx) => (
                    <li key={bIdx} className={isLight ? 'text-[#475569]' : 'text-[#9ca3af]'}>
                      {b}
                    </li>
                  ))}
                </ul>
              )}

              {sec.callout && (
                <aside className={`my-3 p-4 rounded-xl border flex items-start gap-3 ${
                  isLight ? 'bg-[#fffbeb] border-[#fde68a] text-[#92400e]' : 'bg-[#181d24] border-[#384252] text-[#e2e8f0]'
                }`}>
                  <Info className="w-4 h-4 text-[#d97706] dark:text-[#fcd535] shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-1 text-xs">
                    <strong className="font-semibold">{sec.callout.title}</strong>
                    <p className="leading-relaxed opacity-90">{sec.callout.text}</p>
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
          <section className={`p-6 rounded-2xl border flex flex-col gap-4 ${
            isLight ? 'bg-[#f1f5f9] border-[#e2e8f0]' : 'bg-[#14171d] border-[#262c36]'
          }`}>
            <div>
              <span className="text-[11px] font-semibold text-[#d97706] dark:text-[#fcd535] uppercase tracking-wider block">
                Recommended Art Directions for this Workflow
              </span>
              <h3 className={`text-base font-bold ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
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
        <section className={`p-8 rounded-2xl border text-center flex flex-col items-center gap-4 ${
          isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#181d24] border-[#262c36]'
        }`}>
          <PenTool className="w-6 h-6 text-[#d97706] dark:text-[#fcd535]" />
          <h2 className={`text-xl font-bold ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
            Ready to Create Your Card?
          </h2>
          <p className={`text-xs max-w-md ${isLight ? 'text-[#64748b]' : 'text-[#9ca3af]'}`}>
            {guide.actionPrompt}
          </p>
          <a
            href="/create"
            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold cursor-pointer shadow-lg ${
              isLight ? 'bg-[#0f172a] text-white hover:bg-[#1e293b]' : 'bg-white text-[#0b0e11] hover:bg-[#e2e2e2]'
            }`}
          >
            <span>Launch Studio Creator</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </section>

        {/* Related Guides Links */}
        <footer className="flex flex-col gap-4 border-t pt-8 border-[#262c36]/40">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#707a8a]" />
            <h3 className={`text-sm font-bold uppercase tracking-wider ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
              Related Typography & Design Guides
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {otherGuides.map((g) => (
              <a
                key={g.slug}
                href={g.path}
                className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-colors cursor-pointer ${
                  isLight ? 'bg-white border-[#e2e8f0] hover:bg-[#f8fafc]' : 'bg-[#14171d] border-[#262c36] hover:bg-[#181d24]'
                }`}
              >
                <span className="text-[10px] text-[#d97706] dark:text-[#fcd535] font-semibold uppercase block mb-1">
                  {g.category}
                </span>
                <span className={`text-xs font-semibold line-clamp-2 ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
                  {g.title}
                </span>
                <span className="text-[10px] text-[#707a8a] mt-2 block">
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
