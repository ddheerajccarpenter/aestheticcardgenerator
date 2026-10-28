import React, { useEffect, useState, useMemo } from 'react';
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
export const BlogIndexView: React.FC<BlogViewBaseProps> = () => {
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

  const featuredPost = BLOG_POSTS[0];

  const gridPosts = useMemo(() => {
    if (selectedCategory === 'all') {
      return BLOG_POSTS.filter((p) => p.slug !== featuredPost.slug);
    }
    return BLOG_POSTS.filter((p) => p.category === selectedCategory);
  }, [selectedCategory, featuredPost.slug]);

  return (
    <div className="w-full min-h-screen pt-24 pb-20 bg-[var(--app-bg)] text-[var(--app-text)] transition-colors duration-200">
      <div className="studio-container flex flex-col gap-10">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="studio-breadcrumb">
          <a href="/" className="hover:text-[var(--app-text)] transition-colors">
            Home
          </a>
          <ChevronRight className="w-3.5 h-3.5 opacity-50" />
          <span className="text-[var(--app-text)] font-semibold">
            Blog
          </span>
        </nav>

        {/* Hero Section */}
        <header className="flex flex-col gap-4 border-b pb-8 border-[var(--app-border-subtle)]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--app-accent)] animate-pulse"></span>
            <span className="text-xs font-subheading font-bold uppercase tracking-wider text-[var(--app-text-muted)]">
              Editorial Press &amp; Insights
            </span>
          </div>
          <h1 className="font-heading text-3xl md:text-5xl font-extrabold tracking-tight text-[var(--app-text)]">
            Studio Blog &amp; Typesetting Essays
          </h1>
          <p className="font-body text-base md:text-lg max-w-3xl leading-relaxed text-[var(--app-text-muted)]">
            Deep explorations of aesthetic ID cards, vintage passport passes, literary typesetting, paper texture psychology, and the future of client-side creative tools.
          </p>
        </header>

        {/* Featured Post Spotlight Banner */}
        {featuredPost && (
          <article className="studio-panel p-6 md:p-8 rounded-3xl relative overflow-hidden group">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1 flex flex-col gap-4">
                <div className="flex items-center gap-2.5 text-xs">
                  <span className="px-2.5 py-1 rounded-full font-subheading font-bold uppercase tracking-wider text-[10px] bg-[var(--app-surface-secondary)] text-[var(--app-accent)] border border-[var(--app-border-subtle)]">
                    Featured Article
                  </span>
                  <span className="text-[var(--app-text-muted)] opacity-50">•</span>
                  <span className="text-[var(--app-text-muted)] font-medium">{featuredPost.category}</span>
                </div>

                <a href={featuredPost.path} className="group-hover:text-[var(--app-accent)] transition-colors">
                  <h2 className="font-heading text-2xl md:text-3xl font-extrabold tracking-tight text-[var(--app-text)]">
                    {featuredPost.title}
                  </h2>
                </a>

                <p className="font-body text-sm md:text-base leading-relaxed line-clamp-3 text-[var(--app-text-muted)]">
                  {featuredPost.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--app-text-muted)] pt-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-subheading font-bold text-[11px] text-[var(--app-accent)] uppercase tracking-wider">
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
                  className="studio-btn-primary inline-flex items-center gap-2 px-6 py-3 cursor-pointer"
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
              className={`studio-pill ${selectedCategory === cat ? 'active' : ''}`}
            >
              {cat === 'all' ? 'All Articles' : cat}
            </button>
          ))}
        </div>

        {/* Articles Grid: Strict 2-Column Rule */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          {gridPosts.map((post: BlogPost) => (
            <article
              key={post.slug}
              className="studio-panel flex flex-col justify-between p-6 rounded-2xl group transition-all duration-200 hover:-translate-y-1"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-subheading font-bold text-[11px] tracking-wide text-[var(--app-text-muted)] uppercase">
                    {post.category}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-[var(--app-text-muted)]">
                    <Clock className="w-3 h-3" />
                    <span>{post.readTime}</span>
                  </div>
                </div>

                <a href={post.path} className="group-hover:text-[var(--app-accent)] transition-colors">
                  <h3 className="font-heading text-lg font-bold tracking-tight line-clamp-2 text-[var(--app-text)]">
                    {post.title}
                  </h3>
                </a>

                <p className="font-body text-xs leading-relaxed line-clamp-3 text-[var(--app-text-muted)]">
                  {post.description}
                </p>
              </div>

              <div className="pt-6 border-t mt-6 flex items-center justify-between border-[var(--app-border-subtle)] text-xs">
                <span className="text-[11px] text-[var(--app-text-muted)]">{post.publishedDate}</span>
                <a
                  href={post.path}
                  className="inline-flex items-center gap-1 font-semibold text-xs text-[var(--app-text)] hover:text-[var(--app-accent)] transition-colors cursor-pointer"
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
  onOpenEditorWithTemplate,
}) => {

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
    <div className="w-full min-h-screen pt-24 pb-20 bg-[var(--app-bg)] text-[var(--app-text)] transition-colors duration-200">
      <div className="studio-container-narrow flex flex-col gap-10">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="studio-breadcrumb">
          <a href="/" className="hover:text-[var(--app-text)] transition-colors">
            Home
          </a>
          <ChevronRight className="w-3.5 h-3.5 opacity-50" />
          <a href="/blog" className="hover:text-[var(--app-text)] transition-colors">
            Blog
          </a>
          <ChevronRight className="w-3.5 h-3.5 opacity-50" />
          <span className="text-[var(--app-text)] font-semibold line-clamp-1">
            {blog.title}
          </span>
        </nav>

        {/* Article Header */}
        <header className="flex flex-col gap-5 border-b pb-8 border-[var(--app-border-subtle)]">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-subheading font-bold uppercase tracking-wider bg-[var(--app-surface-secondary)] text-[var(--app-accent)] border border-[var(--app-border-subtle)]">
              {blog.category}
            </span>
          </div>

          <h1 className="font-heading text-3xl md:text-5xl font-extrabold tracking-tight leading-tight text-[var(--app-text)]">
            {blog.title}
          </h1>

          <p className="font-body text-base md:text-xl leading-relaxed text-[var(--app-text-muted)]">
            {blog.subtitle}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--app-text-muted)] pt-3 border-t border-[var(--app-border-subtle)]">
            <div className="flex items-center gap-1.5">
              <span className="font-subheading font-bold text-[11px] text-[var(--app-accent)] uppercase tracking-wider">
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
          <div className="studio-panel p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div
                style={{ backgroundColor: featuredTemplate.theme.bg }}
                className="w-14 h-14 rounded-xl border border-black/10 flex items-center justify-center shrink-0 shadow-inner"
              >
                <Sparkles style={{ color: featuredTemplate.theme.ink }} className="w-6 h-6" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-subheading font-bold tracking-wider text-[var(--app-text-muted)]">
                  Paired Art Direction
                </span>
                <h3 className="font-heading text-base font-bold text-[var(--app-text)]">
                  {featuredTemplate.title}
                </h3>
                <p className="font-body text-xs text-[var(--app-text-muted)]">
                  Test this style directly in the Studio Creator with your own words.
                </p>
              </div>
            </div>

            <div className="shrink-0">
              {onOpenEditorWithTemplate ? (
                <button
                  onClick={() => onOpenEditorWithTemplate(featuredTemplate)}
                  className="studio-btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs cursor-pointer"
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>Open Style in Studio</span>
                </button>
              ) : (
                <a
                  href={`/create?template=${featuredTemplate.id}`}
                  className="studio-btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs cursor-pointer"
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>Open Style in Studio</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Article Body Content */}
        <main className="flex flex-col gap-10 leading-relaxed text-sm md:text-base font-body">
          {blog.sections.map((section, idx) => (
            <section key={idx} className="flex flex-col gap-4">
              <h2 className="font-heading text-xl md:text-2xl font-bold tracking-tight text-[var(--app-text)]">
                {section.heading}
              </h2>

              <p className="leading-relaxed text-[var(--app-text)] opacity-90">
                {section.body}
              </p>

              {section.callout && (
                <div className="p-5 rounded-xl border-l-4 my-2 text-xs md:text-sm flex flex-col gap-1.5 bg-[var(--app-surface-secondary)] border-[var(--app-accent)] text-[var(--app-text)]">
                  <span className="font-subheading font-bold text-sm">{section.callout.title}</span>
                  <p className="leading-relaxed opacity-90">{section.callout.text}</p>
                </div>
              )}

              {section.bullets && (
                <ul className="flex flex-col gap-2 pl-4 list-disc text-xs md:text-sm text-[var(--app-text-muted)]">
                  {section.bullets.map((bullet, bIdx) => (
                    <li key={bIdx}>
                      {bullet}
                    </li>
                  ))}
                </ul>
              )}

              {section.templateId && (
                <div className="pt-2">
                  <a
                    href={`/create?template=${section.templateId}`}
                    className="studio-btn-primary inline-flex items-center gap-2 px-4 py-2.5 text-xs cursor-pointer"
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
        <section className="studio-panel p-6 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[var(--app-surface-secondary)] border border-[var(--app-border-subtle)] flex items-center justify-center text-[var(--app-accent)] font-bold text-lg shrink-0">
            {blog.author.charAt(0)}
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-heading text-sm font-bold text-[var(--app-text)]">
              {blog.author}
            </span>
            <p className="font-body text-xs text-[var(--app-text-muted)]">
              Contributing curator to Aesthetic Card Studio, researching digital ephemera, typography systems, and book arts.
            </p>
          </div>
        </section>

        {/* Related Articles */}
        {otherPosts.length > 0 && (
          <section className="flex flex-col gap-6 pt-10 border-t border-[var(--app-border-subtle)]">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-xl font-bold text-[var(--app-text)]">
                Explore More Stories
              </h3>
              <a href="/blog" className="text-xs font-semibold hover:underline flex items-center gap-1 text-[var(--app-text-muted)] hover:text-[var(--app-accent)]">
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {otherPosts.map((post) => (
                <a
                  key={post.slug}
                  href={post.path}
                  className="studio-panel p-4 rounded-xl flex flex-col justify-between gap-3 transition-all hover:-translate-y-0.5 group"
                >
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-subheading font-bold uppercase text-[var(--app-text-muted)]">
                      {post.category}
                    </span>
                    <h4 className="font-heading text-xs font-bold line-clamp-2 group-hover:text-[var(--app-accent)] transition-colors text-[var(--app-text)]">
                      {post.title}
                    </h4>
                  </div>
                  <span className="text-[11px] text-[var(--app-text-muted)]">{post.readTime}</span>
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
