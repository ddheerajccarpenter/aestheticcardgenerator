import React, { useState, useMemo, useEffect } from 'react';
import type { CardTemplate } from '../types/card';
import { PRESET_TEMPLATES } from '../data/templates';
import { updatePageSEO } from '../utils/seo';
import {
  ArrowRight,
  Copy,
  Check,
  ChevronDown,
  Sparkles,
  Search,
  X,
  FileQuestion,
  BookOpen,
} from 'lucide-react';

interface HomeViewProps {
  onOpenEditorWithTemplate?: (template: CardTemplate) => void;
  onNavigateToEditor?: () => void;
  onNavigate?: (path: string) => void;
  theme?: 'dark' | 'light';
  onOpenGuide?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  theme = 'dark',
  onOpenGuide,
}) => {
  const isLight = theme === 'light';

  useEffect(() => {
    updatePageSEO({
      title: 'Aesthetic Text-to-Card Generator — Typesetting Studio',
      description:
        'Turn words into tactile editorial cards. Browser-native typesetting press with archival paper palettes, optical kerning, and instant 2x Retina download.',
      canonicalPath: '/',
      ogType: 'website',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Aesthetic Text-to-Card Studio',
        applicationCategory: 'DesignApplication',
        operatingSystem: 'All web browsers',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
      },
    });
  }, []);

  // Live hero card interactive state
  const [heroPaletteIndex, setHeroPaletteIndex] = useState(0);
  const [copiedHero, setCopiedHero] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const heroThemes = [
    {
      id: 'warm-linen',
      name: 'Kraft Book Page',
      bg: '#fce7cf',
      ink: '#451a03',
      tag: 'FAVORITE LINES • NO. 04',
      quote: '“In the depth of winter, I finally learned that within me there lay an invincible summer.”',
      author: 'Albert Camus',
    },
    {
      id: 'obsidian',
      name: 'Midnight Black',
      bg: '#18191c',
      ink: '#f5f5f7',
      tag: 'SONG LYRIC • BLONDE',
      quote: '“Mind over matter is that magic. I do it everyday.”',
      author: 'Frank Ocean — White Ferrari',
    },
    {
      id: 'pastel',
      name: 'Morning Sky',
      bg: '#e2ecf9',
      ink: '#1e293b',
      tag: 'LATE NIGHT THOUGHTS',
      quote: '“You don’t have to have everything figured out right now. You just have to take the next gentle step.”',
      author: 'Daily Note',
    },
    {
      id: 'st-germain',
      name: 'Vintage Cream',
      bg: '#f4ede4',
      ink: '#2c2825',
      tag: 'BOOK REFLECTION • NO. 12',
      quote: '“If you only read the books that everyone else is reading, you can only think what everyone else is thinking.”',
      author: 'Haruki Murakami',
    },
  ];

  const currentHeroTheme = heroThemes[heroPaletteIndex];

  const handleCopyHero = () => {
    navigator.clipboard.writeText(currentHeroTheme.quote);
    setCopiedHero(true);
    setTimeout(() => setCopiedHero(false), 2000);
  };

  const categories = [
    { id: 'all', label: 'All Curated Styles' },
    { id: 'id-card', label: '★ Aesthetic ID Cards' },
    { id: 'pastel', label: 'Cute & Pastel' },
    { id: 'vintage', label: 'Vintage & Retro' },
    { id: 'fan', label: 'Fan & Character' },
    { id: 'minimal', label: 'Minimalist' },
    { id: 'school', label: 'School & Club' },
    { id: 'quote', label: 'Editorial Quotes' },
  ];

  const filteredTemplates = useMemo(() => {
    return PRESET_TEMPLATES.filter((t) => {
      const matchesCategory = activeCategory === 'all' || t.category === activeCategory;
      if (!matchesCategory) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        t.title.toLowerCase().includes(q) ||
        t.quote.toLowerCase().includes(q) ||
        t.author.toLowerCase().includes(q) ||
        t.tag.toLowerCase().includes(q) ||
        t.categoryLabel.toLowerCase().includes(q) ||
        t.badge.toLowerCase().includes(q)
      );
    });
  }, [activeCategory, searchQuery]);

  const faqs = [
    {
      q: 'Is Aesthetic Card Studio really free?',
      a: 'Yes, 100% free forever. There are no subscriptions, no paywalls, and no watermarks on your exported cards.',
    },
    {
      q: 'Does this app save or track what I write?',
      a: 'Never. The studio runs entirely client-side inside your own web browser. Your text, photos, and drafts never touch any server or cloud database.',
    },
    {
      q: 'What resolution do the cards download in?',
      a: 'Cards export at crisp 2× Retina resolution (up to 2160×2700px), perfectly sharp for Instagram carousels, Stories, Pinterest, X/Twitter, or physical prints.',
    },
    {
      q: 'Can I change aspect ratios for Stories or Square posts?',
      a: 'Yes. You can switch between Square (1:1), Portrait (4:5), Story/Reel (9:16), and Landscape (16:9) anytime with a single click, and the layout reflows automatically.',
    },
  ];

  return (
    <div className={`w-full pt-16 transition-colors duration-200 ${isLight ? 'bg-[#f8fafc] text-[#0f172a]' : 'bg-[#0b0e11] text-[#e1e2e7]'}`}>
      {/* SECTION 1: HERO */}
      <section className="relative w-full px-4 md:px-8 py-12 md:py-20 flex flex-col items-center text-center overflow-hidden">
        {/* Subtle pill */}
        <div
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-medium mb-6 ${
            isLight
              ? 'bg-[#ffffff] border-[#e2e8f0] text-[#475569] shadow-sm'
              : 'bg-[#181d24] border-[#262c36] text-[#c4c7c8]'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#f5cf2e]"></span>
          <span>Free online card maker • No sign-up required</span>
        </div>

        <h1 className={`text-4xl md:text-6xl font-bold max-w-4xl tracking-tight mb-4 leading-tight ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
          Turn words into cards people actually want to save.
        </h1>
        
        <p className={`text-sm md:text-base max-w-2xl mx-auto mb-8 leading-relaxed ${isLight ? 'text-[#64748b]' : 'text-[#9ca3af]'}`}>
          Make beautiful quote cards, song lyrics, book notes, and aesthetic ID badges in seconds. Tweak fonts, choose archival paper palettes, and export 2× Retina images ready for Instagram, Pinterest, or your lockscreen.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          <a
            href="/canvas"
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm active:scale-[0.98] transition-all cursor-pointer shadow-lg ${
              isLight
                ? 'bg-[#0f172a] text-white hover:bg-[#1e293b]'
                : 'bg-[#fcd535] text-[#0b0e11] hover:bg-[#ffe270]'
            }`}
          >
            <span>Design on Canvas Studio</span>
            <ArrowRight className="w-4 h-4" />
          </a>

          <a
            href="/create"
            className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl border font-semibold text-sm transition-colors cursor-pointer ${
              isLight
                ? 'bg-white border-[#cbd5e1] text-[#0f172a] hover:bg-[#f1f5f9]'
                : 'bg-[#181d24] border-[#262c36] text-white hover:bg-[#222730]'
            }`}
          >
            <span>Quick Text Card</span>
          </a>

          <a
            href="/templates"
            className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl border font-medium text-sm transition-colors cursor-pointer ${
              isLight
                ? 'bg-white border-[#e2e8f0] text-[#0f172a] hover:bg-[#f1f5f9]'
                : 'bg-[#181d24] border-[#262c36] text-white hover:bg-[#222730]'
            }`}
          >
            <Sparkles className={`w-4 h-4 ${isLight ? 'text-[#d97706]' : 'text-[#fcd535]'}`} />
            <span>Browse 56 Templates</span>
          </a>

          {onOpenGuide && (
            <button
              onClick={onOpenGuide}
              className={`inline-flex items-center gap-2 px-4 py-3 rounded-lg border font-medium text-sm transition-colors cursor-pointer ${
                isLight
                  ? 'bg-white border-[#e2e8f0] text-[#475569] hover:text-[#0f172a]'
                  : 'bg-[#14171d] border-[#262c36] text-[#9ca3af] hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Typography Guide</span>
            </button>
          )}
        </div>

        {/* Studio Live Preview Frame */}
        <div
          className={`w-full max-w-4xl border p-3 md:p-6 rounded-2xl shadow-2xl flex flex-col gap-3 text-left ${
            isLight
              ? 'bg-[#ffffff] border-[#e2e8f0]'
              : 'bg-[#14171d] border-[#262c36]'
          }`}
        >
          {/* Toolbar strip */}
          <div
            className={`flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-lg border ${
              isLight
                ? 'bg-[#f8fafc] border-[#e2e8f0]'
                : 'bg-[#181d24] border-[#1f242c]'
            }`}
          >
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
              <span className={`text-xs px-1 font-medium ${isLight ? 'text-[#64748b]' : 'text-[#707a8a]'}`}>
                Palette:
              </span>
              {heroThemes.map((theme, idx) => (
                <button
                  key={theme.id}
                  onClick={() => setHeroPaletteIndex(idx)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    heroPaletteIndex === idx
                      ? isLight
                        ? 'bg-[#0f172a] text-white shadow-sm'
                        : 'bg-white text-[#0b0e11] shadow-sm'
                      : isLight
                      ? 'bg-white text-[#475569] hover:text-[#0f172a] border border-[#e2e8f0]'
                      : 'bg-[#14171d] text-[#c4c7c8] hover:text-white'
                  }`}
                >
                  {theme.name}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <span className={`text-xs px-1 ${isLight ? 'text-[#64748b]' : 'text-[#707a8a]'}`}>Ratio:</span>
              <span
                className={`px-2 py-0.5 rounded border text-xs font-medium ${
                  isLight
                    ? 'bg-white border-[#e2e8f0] text-[#0f172a]'
                    : 'bg-[#14171d] border-[#1f242c] text-white'
                }`}
              >
                4 : 5 Portrait
              </span>
              <button
                onClick={handleCopyHero}
                className={`p-1.5 rounded border transition-colors cursor-pointer ${
                  isLight
                    ? 'bg-white border-[#e2e8f0] text-[#475569] hover:text-[#0f172a]'
                    : 'bg-[#14171d] border-[#1f242c] text-[#c4c7c8] hover:text-white'
                }`}
                title="Copy quote to clipboard"
                aria-label="Copy hero quote text"
              >
                {copiedHero ? <Check className="w-3.5 h-3.5 text-[#0ecb81]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Live Card Canvas */}
          <div
            className={`relative w-full min-h-[340px] md:min-h-[440px] flex items-center justify-center p-3 sm:p-6 md:p-10 rounded-xl overflow-hidden border ${
              isLight
                ? 'bg-[#f1f5f9] border-[#e2e8f0]'
                : 'bg-[#0b0e11] border-[#1f242c]'
            }`}
          >
            <article
              style={{
                backgroundColor: currentHeroTheme.bg,
                color: currentHeroTheme.ink,
              }}
              className="relative w-full max-w-lg min-h-[280px] p-5 sm:p-8 md:p-10 rounded-xl transition-all duration-300 shadow-2xl flex flex-col justify-between border border-black/10"
            >
              {/* Top Folio Bar */}
              <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-current/15 text-[10px] sm:text-[11px] font-mono tracking-wider opacity-75">
                <span className="truncate max-w-[200px]">{currentHeroTheme.tag}</span>
                <span className="px-1.5 py-0.5 rounded border border-current/20 shrink-0">EST. 1997</span>
              </div>

              {/* Main Body Quote */}
              <div className="my-4 sm:my-6">
                <blockquote className="font-editorial text-xl sm:text-2xl md:text-3xl leading-relaxed tracking-tight">
                  {currentHeroTheme.quote}
                </blockquote>
              </div>

              {/* Footer Author & Action */}
              <div className="pt-4 border-t border-current/15 flex items-center justify-between">
                <cite className="not-italic text-xs font-medium opacity-80">
                  {currentHeroTheme.author}
                </cite>
                <button
                  onClick={() => {
                    const matchedTemplate =
                      PRESET_TEMPLATES.find((t) => t.theme.id === currentHeroTheme.id) || PRESET_TEMPLATES[0];
                    sessionStorage.setItem('aesthetic_card_studio_selected_template', matchedTemplate.id);
                    window.location.href = `/create?template=${matchedTemplate.id}`;
                  }}
                  className="text-xs font-semibold underline underline-offset-4 hover:opacity-75 transition-opacity cursor-pointer flex items-center gap-1"
                >
                  <span>Edit in Studio</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* SECTION 2: TEMPLATE DIRECTORY & LIVE SEARCH */}
      <section
        id="templates-section"
        className={`w-full px-4 md:px-8 py-16 border-t ${
          isLight ? 'border-[#e2e8f0]' : 'border-[#1f242c]'
        }`}
      >
        <div className="max-w-6xl mx-auto flex flex-col gap-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className={`text-xs uppercase font-semibold tracking-wider ${isLight ? 'text-[#d97706]' : 'text-[#fcd535]'}`}>
                Curated Styles
              </span>
              <h2 className={`text-2xl md:text-3xl font-bold tracking-tight mt-1 ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
                Pick a vibe for your card.
              </h2>
            </div>
            <p className={`text-xs max-w-md ${isLight ? 'text-[#64748b]' : 'text-[#9ca3af]'}`}>
              From vintage book pages and retro passport passes to minimal Swiss layouts and pastel photocards. Click any card to customize.
            </p>
          </div>

          {/* Search Bar & Result Stats */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isLight ? 'text-[#94a3b8]' : 'text-[#707a8a]'}`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates by quote, author, title, or vibe..."
                className={`w-full pl-10 pr-9 py-2 rounded-xl text-xs border transition-all focus:outline-none ${
                  isLight
                    ? 'bg-white border-[#cbd5e1] text-[#0f172a] placeholder-[#94a3b8] focus:border-[#d97706]'
                    : 'bg-[#181d24] border-[#262c36] text-white placeholder-[#707a8a] focus:border-[#fcd535]'
                }`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded cursor-pointer ${
                    isLight ? 'text-[#94a3b8] hover:text-[#0f172a]' : 'text-[#707a8a] hover:text-white'
                  }`}
                  title="Clear search"
                  aria-label="Clear template search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className={isLight ? 'text-[#64748b]' : 'text-[#707a8a]'}>
                Showing <strong className={isLight ? 'text-[#0f172a]' : 'text-white'}>{filteredTemplates.length}</strong> of{' '}
                {PRESET_TEMPLATES.length} styles
              </span>
              {(searchQuery || activeCategory !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('all');
                  }}
                  className={`text-[11px] underline cursor-pointer ml-1 ${isLight ? 'text-[#d97706]' : 'text-[#fcd535]'}`}
                >
                  Reset filters
                </button>
              )}
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  activeCategory === cat.id
                    ? isLight
                      ? 'bg-[#0f172a] text-white shadow-sm'
                      : 'bg-[#222730] text-white shadow-sm border border-[#444748]'
                    : isLight
                    ? 'bg-white text-[#64748b] hover:text-[#0f172a] border border-[#e2e8f0]'
                    : 'bg-[#181d24] text-[#9ca3af] hover:text-white border border-[#262c36]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Empty Search State */}
          {filteredTemplates.length === 0 ? (
            <div
              className={`p-12 rounded-2xl border text-center flex flex-col items-center gap-3 my-4 ${
                isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#14171d] border-[#262c36]'
              }`}
            >
              <FileQuestion className={`w-10 h-10 ${isLight ? 'text-[#94a3b8]' : 'text-[#707a8a]'}`} />
              <h3 className={`text-base font-semibold ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
                No styles match &ldquo;{searchQuery}&rdquo;
              </h3>
              <p className={`text-xs max-w-sm ${isLight ? 'text-[#64748b]' : 'text-[#9ca3af]'}`}>
                Try adjusting your search terms or selecting a different category from the filter pills above.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
                className={`mt-2 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  isLight
                    ? 'bg-[#0f172a] text-white hover:bg-[#1e293b]'
                    : 'bg-white text-[#0b0e11] hover:bg-[#e2e2e2]'
                }`}
              >
                Show All Styles
              </button>
            </div>
          ) : (
            /* Templates Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className={`group flex flex-col border rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-1 shadow-lg ${
                    isLight
                      ? 'bg-white border-[#e2e8f0] hover:border-[#cbd5e1]'
                      : 'bg-[#14171d] border-[#262c36] hover:border-[#444748]'
                  }`}
                >
                  {/* Visual Preview Box */}
                  <div
                    style={{ backgroundColor: template.theme.bg, color: template.theme.ink }}
                    className="relative p-6 min-h-[220px] flex flex-col justify-between border-b border-black/10"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono opacity-70">
                      <span>{template.tag}</span>
                      <span className="border border-current/30 px-1 rounded">{template.badge}</span>
                    </div>

                    <p
                      className={`my-3 text-base leading-snug line-clamp-3 ${
                        template.font === 'editorial'
                          ? 'font-editorial text-lg'
                          : template.font === 'serif'
                          ? 'font-display-serif'
                          : template.font === 'mono'
                          ? 'font-mono-code text-sm'
                          : 'font-sans'
                      }`}
                    >
                      “{template.quote}”
                    </p>

                    <div className="text-[11px] font-medium opacity-80 truncate">
                      — {template.author}
                    </div>
                  </div>

                  {/* Card Meta & Action */}
                  <div className={`p-4 flex items-center justify-between ${isLight ? 'bg-[#f8fafc]' : 'bg-[#181d24]'}`}>
                    <div>
                      <h3 className={`text-sm font-semibold ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
                        {template.title}
                      </h3>
                      <span className={`text-[11px] ${isLight ? 'text-[#64748b]' : 'text-[#707a8a]'}`}>
                        {template.categoryLabel}
                      </span>
                    </div>

                    <a
                      href={`/create?template=${template.id}`}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        isLight
                          ? 'bg-[#0f172a] text-white hover:bg-[#1e293b]'
                          : 'bg-white text-[#0b0e11] hover:bg-[#e2e2e2]'
                      }`}
                    >
                      <span>Use Style</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* SECTION 3: HOW IT WORKS PIPELINE */}
      <section
        className={`w-full px-4 md:px-8 py-16 border-t ${
          isLight ? 'bg-[#f1f5f9] border-[#e2e8f0]' : 'bg-[#111417] border-[#1f242c]'
        }`}
      >
        <div className="max-w-5xl mx-auto flex flex-col gap-10">
          <div className="text-center">
            <span className={`text-xs uppercase font-semibold tracking-wider ${isLight ? 'text-[#d97706]' : 'text-[#fcd535]'}`}>
              Effortless & Free
            </span>
            <h2 className={`text-2xl md:text-3xl font-bold tracking-tight mt-1 ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
              How it works.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div
              className={`p-5 rounded-xl border flex flex-col gap-2.5 ${
                isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#181d24] border-[#262c36]'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center font-semibold text-sm ${
                  isLight ? 'bg-[#f1f5f9] text-[#d97706]' : 'bg-[#222730] text-[#fcd535]'
                }`}
              >
                01
              </div>
              <h3 className={`text-sm font-semibold ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>Paste your words</h3>
              <p className={`text-xs leading-relaxed ${isLight ? 'text-[#64748b]' : 'text-[#9ca3af]'}`}>
                A favorite book excerpt, a song lyric, a late-night thought, or your personal bio.
              </p>
            </div>

            <div
              className={`p-5 rounded-xl border flex flex-col gap-2.5 ${
                isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#181d24] border-[#262c36]'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center font-semibold text-sm ${
                  isLight ? 'bg-[#f1f5f9] text-[#d97706]' : 'bg-[#222730] text-[#fcd535]'
                }`}
              >
                02
              </div>
              <h3 className={`text-sm font-semibold ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>Choose an aesthetic</h3>
              <p className={`text-xs leading-relaxed ${isLight ? 'text-[#64748b]' : 'text-[#9ca3af]'}`}>
                Pick from vintage paper, retro ID passes, darkroom midnight, or soft pastel themes.
              </p>
            </div>

            <div
              className={`p-5 rounded-xl border flex flex-col gap-2.5 ${
                isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#181d24] border-[#262c36]'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center font-semibold text-sm ${
                  isLight ? 'bg-[#f1f5f9] text-[#d97706]' : 'bg-[#222730] text-[#fcd535]'
                }`}
              >
                03
              </div>
              <h3 className={`text-sm font-semibold ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>Make it personal</h3>
              <p className={`text-xs leading-relaxed ${isLight ? 'text-[#64748b]' : 'text-[#9ca3af]'}`}>
                Tweak fonts, switch aspect ratios (1:1, 4:5, 9:16), upload a photo, or add stickers.
              </p>
            </div>

            <div
              className={`p-5 rounded-xl border flex flex-col gap-2.5 ${
                isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#181d24] border-[#262c36]'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center font-semibold text-sm ${
                  isLight ? 'bg-[#f1f5f9] text-[#0ecb81]' : 'bg-[#222730] text-[#0ecb81]'
                }`}
              >
                04
              </div>
              <h3 className={`text-sm font-semibold ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>Download 2× Retina</h3>
              <p className={`text-xs leading-relaxed ${isLight ? 'text-[#64748b]' : 'text-[#9ca3af]'}`}>
                Save a crisp high-res image directly to your phone or laptop. No watermarks, ever.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: FAQ ACCORDION */}
      <section
        className={`w-full px-4 md:px-8 py-16 border-t ${
          isLight ? 'border-[#e2e8f0]' : 'border-[#1f242c]'
        }`}
      >
        <div className="max-w-3xl mx-auto flex flex-col gap-8">
          <div className="text-center">
            <span className={`text-xs uppercase font-semibold tracking-wider ${isLight ? 'text-[#d97706]' : 'text-[#fcd535]'}`}>
              FAQ
            </span>
            <h2 className={`text-2xl md:text-3xl font-bold tracking-tight mt-1 ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
              Frequently Asked Questions
            </h2>
          </div>

          <div className="flex flex-col gap-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className={`rounded-xl border overflow-hidden transition-colors ${
                    isLight
                      ? 'bg-white border-[#e2e8f0]'
                      : 'bg-[#14171d] border-[#262c36]'
                  }`}
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className={`w-full p-4 text-left flex items-center justify-between font-medium text-sm transition-colors cursor-pointer ${
                      isLight
                        ? 'text-[#0f172a] hover:bg-[#f8fafc]'
                        : 'text-white hover:bg-[#181d24]'
                    }`}
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isOpen
                          ? 'rotate-180 ' + (isLight ? 'text-[#0f172a]' : 'text-white')
                          : isLight
                          ? 'text-[#94a3b8]'
                          : 'text-[#707a8a]'
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div
                      className={`px-4 pb-4 pt-1 text-xs leading-relaxed border-t ${
                        isLight
                          ? 'text-[#64748b] border-[#f1f5f9]'
                          : 'text-[#9ca3af] border-[#1f242c]/50'
                      }`}
                    >
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 5: BOTTOM CALLOUT BANNER */}
      <section
        className={`w-full px-4 md:px-8 py-16 border-t ${
          isLight ? 'border-[#e2e8f0]' : 'border-[#1f242c]'
        }`}
      >
        <div
          className={`max-w-4xl mx-auto p-8 md:p-12 rounded-2xl border text-center flex flex-col items-center gap-5 shadow-2xl ${
            isLight
              ? 'bg-gradient-to-b from-[#ffffff] to-[#f8fafc] border-[#e2e8f0]'
              : 'bg-gradient-to-b from-[#181d24] to-[#14171d] border-[#262c36]'
          }`}
        >
          <span className="text-xs text-[#0ecb81] font-mono tracking-wider uppercase">
            Start Creating
          </span>
          <h2 className={`text-3xl md:text-4xl font-bold tracking-tight ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
            Ready to make your card?
          </h2>
          <p className={`text-sm max-w-lg leading-relaxed ${isLight ? 'text-[#64748b]' : 'text-[#9ca3af]'}`}>
            No sign-up, no app install, and no waiting. Open the editor and create something beautiful right now.
          </p>
          <a
            href="/create"
            className={`inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm active:scale-[0.98] transition-all cursor-pointer shadow-xl mt-2 ${
              isLight
                ? 'bg-[#0f172a] text-white hover:bg-[#1e293b]'
                : 'bg-white text-[#0b0e11] hover:bg-[#e2e2e2]'
            }`}
          >
            <span>Open Card Creator</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>
    </div>
  );
};
export default HomeView;
