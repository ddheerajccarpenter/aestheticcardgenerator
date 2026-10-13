import React, { useEffect } from 'react';
import { GUIDE_ARTICLES } from '../data/guides';
import { updatePageSEO } from '../utils/seo';
import { AdSlot } from '../components/AdSlot';
import {
  BookOpen,
  ArrowRight,
  ChevronRight,
  Clock,
  Sparkles,
  PenTool,
} from 'lucide-react';

interface GuideIndexViewProps {
  onNavigate?: (path: string) => void;
  theme?: 'dark' | 'light';
}

export const GuideIndexView: React.FC<GuideIndexViewProps> = ({ theme = 'dark' }) => {
  const isLight = theme === 'light';

  useEffect(() => {
    updatePageSEO({
      title: 'Typesetting & Design Guides — Aesthetic Card Studio',
      description:
        'Educational guides on optical typesetting, quote attribution, social media aspect ratios, and paper grain design. Free, practical, and human-written.',
      canonicalPath: '/guides',
      ogType: 'website',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://aestheticcardstudio.com/' },
          { '@type': 'ListItem', position: 2, name: 'Guides', item: 'https://aestheticcardstudio.com/guides' },
        ],
      },
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className={`w-full pt-20 pb-16 transition-colors duration-200 ${isLight ? 'bg-[#f8fafc] text-[#0f172a]' : 'bg-[#0b0e11] text-[#e1e2e7]'}`}>
      <div className="max-w-5xl mx-auto px-4 md:px-8 flex flex-col gap-10">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#707a8a]">
          <a href="/" className="hover:underline cursor-pointer">
            Home
          </a>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className={`font-medium ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>Guides</span>
        </nav>

        {/* Header */}
        <header className="flex flex-col gap-3 text-left border-b pb-6 border-[#262c36]/40">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#d97706] dark:text-[#fcd535]">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Editorial Knowledge Base</span>
          </div>
          <h1 className={`text-3xl md:text-5xl font-bold tracking-tight leading-tight ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
            Typesetting & Card Design Guides
          </h1>
          <p className={`text-sm md:text-base max-w-2xl leading-relaxed ${isLight ? 'text-[#475569]' : 'text-[#9ca3af]'}`}>
            Clear, step-by-step design essays on line measures, optical kerning, social aspect ratios, and tactile digital cards. Written for writers, readers, and visual curators.
          </p>
        </header>

        {/* Guides List Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {GUIDE_ARTICLES.map((guide) => (
            <article
              key={guide.slug}
              className={`p-6 rounded-2xl border flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 shadow-md ${
                isLight ? 'bg-white border-[#e2e8f0] hover:border-[#cbd5e1]' : 'bg-[#14171d] border-[#262c36] hover:border-[#444748]'
              }`}
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between text-[11px] text-[#707a8a]">
                  <span className="font-semibold uppercase tracking-wider text-[#d97706] dark:text-[#fcd535]">
                    {guide.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{guide.readTime}</span>
                  </div>
                </div>

                <h2 className={`text-lg font-bold tracking-tight leading-snug ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
                  {guide.title}
                </h2>

                <p className={`text-xs leading-relaxed line-clamp-3 ${isLight ? 'text-[#475569]' : 'text-[#9ca3af]'}`}>
                  {guide.description}
                </p>
              </div>

              <div className="pt-5 border-t border-current/10 mt-5 flex items-center justify-between">
                <span className="text-[11px] font-mono opacity-60">Published {guide.publishedDate}</span>
                <a
                  href={guide.path}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isLight ? 'bg-[#0f172a] text-white hover:bg-[#1e293b]' : 'bg-white text-[#0b0e11] hover:bg-[#e2e2e2]'
                  }`}
                >
                  <span>Read Guide</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </article>
          ))}
        </section>

        {/* Optional Safe AdSense slot */}
        <AdSlot slotId="guides-index-slot" />

        {/* Launch Creator CTA Banner */}
        <section className={`p-8 rounded-2xl border text-center flex flex-col items-center gap-4 ${
          isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#181d24] border-[#262c36]'
        }`}>
          <Sparkles className="w-6 h-6 text-[#d97706] dark:text-[#fcd535]" />
          <h2 className={`text-xl font-bold ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
            Ready to Put Theory into Practice?
          </h2>
          <p className={`text-xs max-w-md ${isLight ? 'text-[#64748b]' : 'text-[#9ca3af]'}`}>
            Apply these principles immediately inside the Studio Editor with live typography controls and instant 2x Retina download.
          </p>
          <a
            href="/create"
            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold cursor-pointer shadow-lg ${
              isLight ? 'bg-[#0f172a] text-white hover:bg-[#1e293b]' : 'bg-white text-[#0b0e11] hover:bg-[#e2e2e2]'
            }`}
          >
            <PenTool className="w-4 h-4" />
            <span>Launch Studio Creator</span>
          </a>
        </section>
      </div>
    </div>
  );
};
