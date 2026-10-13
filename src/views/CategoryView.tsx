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
  theme = 'dark',
}) => {
  const isLight = theme === 'light';

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
    <div className={`w-full pt-20 pb-16 transition-colors duration-200 ${isLight ? 'bg-[#f8fafc] text-[#0f172a]' : 'bg-[#0b0e11] text-[#e1e2e7]'}`}>
      <div className="max-w-5xl mx-auto px-4 md:px-8 flex flex-col gap-12">
        {/* Semantic Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#707a8a]">
          <a href="/" className="hover:underline cursor-pointer">
            Home
          </a>
          <ChevronRight className="w-3.5 h-3.5" />
          <a href="/templates" className="hover:underline cursor-pointer">
            Templates
          </a>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className={`font-medium ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>{category.title}</span>
        </nav>

        {/* Hero Section */}
        <header className="flex flex-col gap-4 text-left border-b pb-8 border-[#262c36]/40">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#d97706] dark:text-[#fcd535]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated Style Directory</span>
          </div>
          <h1 className={`text-3xl md:text-5xl font-bold tracking-tight leading-tight ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
            {category.title}
          </h1>
          <p className={`text-base md:text-lg max-w-3xl leading-relaxed ${isLight ? 'text-[#475569]' : 'text-[#9ca3af]'}`}>
            {category.subtitle}
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onOpenEditorWithTemplate(displayTemplates[0])}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-md ${
                isLight ? 'bg-[#0f172a] text-white hover:bg-[#1e293b]' : 'bg-white text-[#0b0e11] hover:bg-[#e2e2e2]'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Create in Studio with this Style</span>
            </button>
            <button
              onClick={() => onNavigate('/templates')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                isLight ? 'bg-white border-[#e2e8f0] text-[#475569] hover:bg-[#f1f5f9]' : 'bg-[#181d24] border-[#262c36] text-[#c4c7c8] hover:text-white'
              }`}
            >
              <span>View All 8 Categories</span>
            </button>
          </div>
        </header>

        {/* Deep Narrative & Use Case Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 flex flex-col gap-4">
            <h2 className={`text-xl font-bold ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
              About This Art Direction
            </h2>
            <p className={`text-sm leading-relaxed ${isLight ? 'text-[#475569]' : 'text-[#9ca3af]'}`}>
              {category.longDescription}
            </p>
            <div className={`p-4 rounded-xl border mt-2 ${isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#14171d] border-[#262c36]'}`}>
              <h3 className={`text-xs font-semibold uppercase tracking-wider mb-1.5 ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
                Primary Use Case
              </h3>
              <p className={`text-xs leading-relaxed ${isLight ? 'text-[#64748b]' : 'text-[#9ca3af]'}`}>
                {category.useCase}
              </p>
            </div>
          </div>

          {/* Design Tips Card */}
          <div className={`p-5 rounded-2xl border flex flex-col gap-3 ${isLight ? 'bg-[#f1f5f9] border-[#e2e8f0]' : 'bg-[#181d24] border-[#262c36]'}`}>
            <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
              Typesetting Best Practices
            </h3>
            <ul className="flex flex-col gap-2.5 text-xs">
              {category.designTips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#0ecb81] shrink-0 mt-0.5" />
                  <span className={isLight ? 'text-[#475569]' : 'text-[#c4c7c8]'}>{tip}</span>
                </li>
              ))}
            </ul>
            <div className="pt-2 border-t border-current/10 text-[11px] text-[#707a8a]">
              Recommended Ratios: <strong className="text-current font-mono">{category.bestAspectRatios.join(', ')}</strong>
            </div>
          </div>
        </section>

        {/* Real Templates Grid */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-xl font-bold ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
                Tested Presets in this Style
              </h2>
              <p className={`text-xs ${isLight ? 'text-[#64748b]' : 'text-[#9ca3af]'}`}>
                Select any card to open the live editor and customize words, fonts, and paper textures.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayTemplates.map((template) => (
              <article
                key={template.id}
                className={`group flex flex-col border rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-1 shadow-lg ${
                  isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#14171d] border-[#262c36]'
                }`}
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
                <div className={`p-4 flex items-center justify-between ${isLight ? 'bg-[#f8fafc]' : 'bg-[#181d24]'}`}>
                  <div>
                    <h3 className={`text-sm font-semibold ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
                      {template.title}
                    </h3>
                    <span className="text-[11px] text-[#707a8a]">{template.categoryLabel}</span>
                  </div>

                  <a
                    href={`/create?template=${template.id}`}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isLight ? 'bg-[#0f172a] text-white hover:bg-[#1e293b]' : 'bg-white text-[#0b0e11] hover:bg-[#e2e2e2]'
                    }`}
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
          <section className="flex flex-col gap-4 border-t pt-8 border-[#262c36]/40">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#d97706] dark:text-[#fcd535]" />
              <h2 className={`text-lg font-bold ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
                Frequently Asked Questions about {category.title}
              </h2>
            </div>
            <div className="flex flex-col gap-3">
              {category.faq.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border ${isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#14171d] border-[#262c36]'}`}
                >
                  <h3 className={`text-xs font-semibold mb-1 ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
                    {item.q}
                  </h3>
                  <p className={`text-xs leading-relaxed ${isLight ? 'text-[#64748b]' : 'text-[#9ca3af]'}`}>
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Bottom Navigation Links to Guides */}
        <footer className={`p-6 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
          isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#181d24] border-[#262c36]'
        }`}>
          <div>
            <span className={`text-xs font-semibold block ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
              Want deeper typesetting advice?
            </span>
            <span className="text-[11px] text-[#707a8a]">
              Read our educational articles on optical kerning and social card sizing.
            </span>
          </div>
          <a
            href="/guides"
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer ${
              isLight ? 'bg-[#0f172a] text-white hover:bg-[#1e293b]' : 'bg-white text-[#0b0e11] hover:bg-[#e2e2e2]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Browse All Guides</span>
          </a>
        </footer>
      </div>
    </div>
  );
};
