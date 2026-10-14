import React, { useEffect, useState } from 'react';
import type { BlogPost, CardTemplate } from '../types/card';
import { BLOG_POSTS } from '../data/blog';
import { PRESET_TEMPLATES } from '../data/templates';
import { updatePageSEO } from '../utils/seo';
import { AdSlot } from '../components/AdSlot';
import {
  Calendar,
  Clock,
  ChevronRight,
  ArrowRight,
  PenTool,
  Sparkles,
} from 'lucide-react';

interface BlogViewBaseProps {
  theme?: 'dark' | 'light';
  onNavigate?: (path: string) => void;
}

// --------------------------------------------------------------------------
// 1. BLOG INDEX VIEW (/blog)
// --------------------------------------------------------------------------
export const BlogIndexView: React.FC<BlogViewBaseProps> = ({
  theme = 'dark',
}) => {
  const isLight = theme === 'light';
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    updatePageSEO({
      title: 'Studio Blog — Editorial Typography, Aesthetic ID Cards & Design Systems',
      description:
        'Articles on aesthetic ID card templates, vintage travel passes, literary typography, archival color palettes, and client-side design privacy.',
      canonicalPath: '/blog',
      ogType: 'website',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const categories = ['all', 'Design Trends', 'Typography Craft', 'Color Theory', 'Social Formats', 'Philosophy & Tech'];

  const filteredPosts =
    selectedCategory === 'all'
      ? BLOG_POSTS
      : BLOG_POSTS.filter((p) => p.category === selectedCategory);

  const featuredPost = BLOG_POSTS[0];

  return (
    <div
      className={`w-full min-h-screen pt-20 pb-20 transition-colors duration-200 ${
        isLight ? 'bg-[#f8fafc] text-[#0f172a]' : 'bg-[#0b0e11] text-[#e1e2e7]'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 md:px-8 flex flex-col gap-12">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#707a8a]">
          <a href="/" className="hover:underline cursor-pointer">
            Home
          </a>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className={`font-medium ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
            Blog
          </span>
        </nav>

        {/* Hero Section */}
        <header className="flex flex-col gap-4 border-b pb-8 border-current/10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0ecb81]"></span>
            <span className="text-xs uppercase font-semibold tracking-wider text-[#d97706] dark:text-[#fcd535]">
              Editorial Press & Insights
            </span>
          </div>
          <h1 className={`text-3xl md:text-5xl font-bold tracking-tight ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
            Studio Blog & Typesetting Essays
          </h1>
          <p className={`text-base md:text-lg max-w-3xl leading-relaxed ${isLight ? 'text-[#475569]' : 'text-[#9ca3af]'}`}>
            Deep explorations of aesthetic ID cards, vintage passport passes, literary typesetting, paper texture psychology, and the future of client-side creative tools.
          </p>
        </header>

        {/* Featured Post Spotlight Banner */}
        {featuredPost && (
          <article
            className={`p-6 md:p-8 rounded-3xl border transition-all duration-300 relative overflow-hidden group shadow-xl ${
              isLight
                ? 'bg-white border-[#e2e8f0] hover:border-[#cbd5e1]'
                : 'bg-gradient-to-br from-[#181d24] to-[#12151b] border-[#262c36] hover:border-[#3a4250]'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1 flex flex-col gap-4">
                <div className="flex items-center gap-2.5 text-xs">
                  <span className="px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider text-[10px] bg-[#d97706]/10 text-[#d97706] dark:bg-[#fcd535]/15 dark:text-[#fcd535]">
                    Featured Article
                  </span>
                  <span className="text-[#707a8a]">•</span>
                  <span className="text-[#707a8a] font-medium">{featuredPost.category}</span>
                </div>

                <a href={featuredPost.path} className="group-hover:text-[#d97706] dark:group-hover:text-[#fcd535] transition-colors">
                  <h2 className={`text-2xl md:text-3xl font-bold tracking-tight ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
                    {featuredPost.title}
                  </h2>
                </a>

                <p className={`text-sm md:text-base leading-relaxed line-clamp-3 ${isLight ? 'text-[#475569]' : 'text-[#9ca3af]'}`}>
                  {featuredPost.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-[#707a8a] pt-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-[11px] text-[#fcd535] uppercase tracking-wider">
                      Studio Design Note
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{featuredPost.publishedDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{featuredPost.readTime}</span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 flex items-center">
                <a
                  href={featuredPost.path}
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-xs transition-all shadow-md ${
                    isLight
                      ? 'bg-[#0f172a] text-white hover:bg-[#1e293b]'
                      : 'bg-white text-[#0b0e11] hover:bg-[#e2e2e2]'
                  }`}
                >
                  <span>Read Article</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </article>
        )}

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer border ${
                selectedCategory === cat
                  ? isLight
                    ? 'bg-[#0f172a] text-white border-[#0f172a]'
                    : 'bg-white text-[#0b0e11] border-white font-semibold'
                  : isLight
                  ? 'bg-white border-[#e2e8f0] text-[#64748b] hover:text-[#0f172a]'
                  : 'bg-[#181d24] border-[#262c36] text-[#9ca3af] hover:text-white'
              }`}
            >
              {cat === 'all' ? 'All Articles' : cat}
            </button>
          ))}
        </div>

        {/* Articles Grid: Strict 2-Column Rule */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[1240px] w-full mx-auto">
          {filteredPosts.map((post) => (
            <article
              key={post.slug}
              className={`flex flex-col justify-between p-6 rounded-2xl border transition-all duration-200 group hover:-translate-y-1 shadow-sm ${
                isLight
                  ? 'bg-white border-[#e2e8f0] hover:border-[#cbd5e1]'
                  : 'bg-[#181d24] border-[#262c36] hover:border-[#3a4250]'
              }`}
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[11px] tracking-wide text-[#d97706] dark:text-[#fcd535] uppercase">
                    {post.category}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-[#707a8a]">
                    <Clock className="w-3 h-3" />
                    <span>{post.readTime}</span>
                  </div>
                </div>

                <a href={post.path} className="group-hover:text-[#d97706] dark:group-hover:text-[#fcd535] transition-colors">
                  <h3 className={`text-lg font-bold tracking-tight line-clamp-2 ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
                    {post.title}
                  </h3>
                </a>

                <p className={`text-xs leading-relaxed line-clamp-3 ${isLight ? 'text-[#475569]' : 'text-[#9ca3af]'}`}>
                  {post.description}
                </p>
              </div>

              <div className="pt-6 border-t mt-6 flex items-center justify-between border-current/10 text-xs">
                <span className="text-[11px] text-[#707a8a]">{post.publishedDate}</span>
                <a
                  href={post.path}
                  className={`inline-flex items-center gap-1 font-semibold text-xs cursor-pointer ${
                    isLight ? 'text-[#0f172a] hover:underline' : 'text-white hover:underline'
                  }`}
                >
                  <span>Read Story</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </article>
          ))}
        </div>

        {/* Studio Promotion Banner */}
        <AdSlot slotId="blog-index-bottom" />
      </div>
    </div>
  );
};

// --------------------------------------------------------------------------
// 2. BLOG DETAIL VIEW (/blog/:slug)
// --------------------------------------------------------------------------
interface BlogDetailViewProps extends BlogViewBaseProps {
  blog: BlogPost;
  onOpenEditorWithTemplate?: (template: CardTemplate) => void;
}

export const BlogDetailView: React.FC<BlogDetailViewProps> = ({
  blog,
  theme = 'dark',
  onOpenEditorWithTemplate,
}) => {
  const isLight = theme === 'light';

  useEffect(() => {
    updatePageSEO({
      title: blog.metaTitle,
      description: blog.metaDescription,
      canonicalPath: blog.path,
      ogType: 'article',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: blog.title,
        description: blog.description,
        author: {
          '@type': 'Person',
          name: blog.author,
        },
        datePublished: blog.publishedDate,
        publisher: {
          '@type': 'Organization',
          name: 'Aesthetic Card Studio',
        },
      },
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [blog]);

  const featuredTemplate = blog.featuredTemplateId
    ? PRESET_TEMPLATES.find((t) => t.id === blog.featuredTemplateId)
    : undefined;

  const otherPosts = BLOG_POSTS.filter((p) => p.slug !== blog.slug).slice(0, 4);

  return (
    <div
      className={`w-full min-h-screen pt-20 pb-20 transition-colors duration-200 ${
        isLight ? 'bg-[#f8fafc] text-[#0f172a]' : 'bg-[#0b0e11] text-[#e1e2e7]'
      }`}
    >
      <div className="max-w-4xl mx-auto px-4 md:px-8 flex flex-col gap-10">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#707a8a]">
          <a href="/" className="hover:underline cursor-pointer">
            Home
          </a>
          <ChevronRight className="w-3.5 h-3.5" />
          <a href="/blog" className="hover:underline cursor-pointer">
            Blog
          </a>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className={`font-medium line-clamp-1 ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
            {blog.title}
          </span>
        </nav>

        {/* Article Header */}
        <header className="flex flex-col gap-5 border-b pb-8 border-current/10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-[#d97706]/10 text-[#d97706] dark:bg-[#fcd535]/15 dark:text-[#fcd535]">
              {blog.category}
            </span>
          </div>

          <h1 className={`text-3xl md:text-5xl font-bold tracking-tight leading-tight ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
            {blog.title}
          </h1>

          <p className={`text-base md:text-xl leading-relaxed ${isLight ? 'text-[#475569]' : 'text-[#9ca3af]'}`}>
            {blog.subtitle}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-[#707a8a] pt-2 border-t border-current/10">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-[11px] text-[#fcd535] uppercase tracking-wider">
                Studio Design Note
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{blog.publishedDate}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{blog.readTime}</span>
            </div>
          </div>
        </header>

        {/* Featured Template Interactive Callout (if paired with template) */}
        {featuredTemplate && (
          <div
            className={`p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-lg ${
              isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#181d24] border-[#262c36]'
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                style={{ backgroundColor: featuredTemplate.theme.bg }}
                className="w-14 h-14 rounded-xl border border-black/10 flex items-center justify-center shrink-0 shadow-inner"
              >
                <Sparkles style={{ color: featuredTemplate.theme.ink }} className="w-6 h-6" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#d97706] dark:text-[#fcd535]">
                  Paired Art Direction
                </span>
                <h3 className={`text-base font-bold ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
                  {featuredTemplate.title}
                </h3>
                <p className="text-xs text-[#707a8a]">
                  Test this style directly in the Studio Creator with your own words.
                </p>
              </div>
            </div>

            <div className="shrink-0">
              {onOpenEditorWithTemplate ? (
                <button
                  onClick={() => onOpenEditorWithTemplate(featuredTemplate)}
                  className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs cursor-pointer shadow-md ${
                    isLight
                      ? 'bg-[#0f172a] text-white hover:bg-[#1e293b]'
                      : 'bg-white text-[#0b0e11] hover:bg-[#e2e2e2]'
                  }`}
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>Open Style in Studio</span>
                </button>
              ) : (
                <a
                  href={`/create?template=${featuredTemplate.id}`}
                  className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs cursor-pointer shadow-md ${
                    isLight
                      ? 'bg-[#0f172a] text-white hover:bg-[#1e293b]'
                      : 'bg-white text-[#0b0e11] hover:bg-[#e2e2e2]'
                  }`}
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>Open Style in Studio</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Article Body Content */}
        <main className="flex flex-col gap-10 leading-relaxed text-sm md:text-base">
          {blog.sections.map((section, idx) => (
            <section key={idx} className="flex flex-col gap-4">
              <h2 className={`text-xl md:text-2xl font-bold tracking-tight ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
                {section.heading}
              </h2>

              <p className={`leading-relaxed ${isLight ? 'text-[#334155]' : 'text-[#cbd5e1]'}`}>
                {section.body}
              </p>

              {section.callout && (
                <div
                  className={`p-5 rounded-xl border-l-4 my-2 text-xs md:text-sm flex flex-col gap-1.5 ${
                    isLight
                      ? 'bg-[#f1f5f9] border-[#0f172a] text-[#1e293b]'
                      : 'bg-[#181d24] border-[#fcd535] text-[#e2e8f0]'
                  }`}
                >
                  <span className="font-bold">{section.callout.title}</span>
                  <p className="leading-relaxed opacity-90">{section.callout.text}</p>
                </div>
              )}

              {section.bullets && (
                <ul className="flex flex-col gap-2 pl-4 list-disc text-xs md:text-sm">
                  {section.bullets.map((bullet, bIdx) => (
                    <li key={bIdx} className={isLight ? 'text-[#475569]' : 'text-[#9ca3af]'}>
                      {bullet}
                    </li>
                  ))}
                </ul>
              )}

              {section.templateId && (
                <div className="pt-2">
                  <a
                    href={`/create?template=${section.templateId}`}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-sm cursor-pointer ${
                      isLight
                        ? 'bg-[#0f172a] text-white hover:bg-[#1e293b]'
                        : 'bg-[#fcd535] text-[#0b0e11] hover:bg-[#ffe270]'
                    }`}
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>{section.actionPrompt || 'Load This Preset in Studio →'}</span>
                  </a>
                </div>
              )}
            </section>
          ))}
        </main>

        {/* Author Bio Box */}
        <section
          className={`p-6 rounded-2xl border flex items-center gap-4 ${
            isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#181d24] border-[#262c36]'
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#d97706] to-[#fcd535] flex items-center justify-center text-[#181a20] font-bold text-lg shrink-0">
            {blog.author.charAt(0)}
          </div>
          <div className="flex flex-col gap-0.5">
            <span className={`text-sm font-bold ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
              {blog.author}
            </span>
            <p className="text-xs text-[#707a8a]">
              Contributing curator to Aesthetic Card Studio, researching digital ephemera, typography systems, and book arts.
            </p>
          </div>
        </section>

        {/* Related Articles */}
        {otherPosts.length > 0 && (
          <section className="flex flex-col gap-6 pt-10 border-t border-current/10">
            <div className="flex items-center justify-between">
              <h3 className={`text-xl font-bold ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
                Explore More Stories
              </h3>
              <a href="/blog" className="text-xs font-semibold hover:underline flex items-center gap-1 text-[#d97706] dark:text-[#fcd535]">
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {otherPosts.map((post) => (
                <a
                  key={post.slug}
                  href={post.path}
                  className={`p-4 rounded-xl border flex flex-col justify-between gap-3 transition-all hover:-translate-y-0.5 group ${
                    isLight
                      ? 'bg-white border-[#e2e8f0] hover:border-[#cbd5e1]'
                      : 'bg-[#181d24] border-[#262c36] hover:border-[#3a4250]'
                  }`}
                >
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-semibold uppercase text-[#707a8a]">
                      {post.category}
                    </span>
                    <h4 className={`text-xs font-bold line-clamp-2 group-hover:text-[#d97706] dark:group-hover:text-[#fcd535] transition-colors ${
                      isLight ? 'text-[#0f172a]' : 'text-white'
                    }`}>
                      {post.title}
                    </h4>
                  </div>
                  <span className="text-[11px] text-[#707a8a]">{post.readTime}</span>
                </a>
              ))}
            </div>
          </section>
        )}

        <AdSlot slotId="blog-detail-bottom" />
      </div>
    </div>
  );
};
