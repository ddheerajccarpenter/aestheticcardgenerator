import React, { useState, useEffect } from 'react';
import type { CardTemplate } from './types/card';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { HomeView } from './views/HomeView';
import { EditorView } from './views/EditorView';
import { CanvasEditorView } from './views/CanvasEditorView';
import { TemplatesView } from './views/TemplatesView';
import { CategoryView } from './views/CategoryView';
import { GuideIndexView } from './views/GuideIndexView';
import { GuideDetailView } from './views/GuideDetailView';
import { BlogIndexView, BlogDetailView } from './views/BlogView';
import {
  AboutView,
  ContactView,
  FaqView,
  PrivacyView,
  TermsView,
  CookieView,
  AccessibilityView,
  CreditsView,
  NotFoundView,
} from './views/TrustViews';
import { TEMPLATE_CATEGORIES } from './data/categories';
import { GUIDE_ARTICLES } from './data/guides';
import { BLOG_POSTS } from './data/blog';
import { PRESET_TEMPLATES } from './data/templates';
import {
  X,
  Search,
  BookOpen,
  PenTool,
  LayoutTemplate,
  Newspaper,
  Sun,
  Moon,
} from 'lucide-react';

export const App: React.FC = () => {
  // Current route path
  const currentPath = window.location.pathname || '/';

  // Active template state with URL param / session restoration
  const activeTemplate: CardTemplate | undefined = (() => {
    const params = new URLSearchParams(window.location.search);
    const tmplId = params.get('template') || sessionStorage.getItem('aesthetic_card_studio_selected_template');
    if (tmplId) {
      sessionStorage.removeItem('aesthetic_card_studio_selected_template');
      return PRESET_TEMPLATES.find((t) => t.id === tmplId);
    }
    return undefined;
  })();
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');

  // Workspace theme state (persisted locally)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('aesthetic_card_studio_theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  // Apply theme class to <html>
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }
    localStorage.setItem('aesthetic_card_studio_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Full browser navigation: reloads on every navigation for multi-page behavior
  const navigate = (path: string) => {
    window.location.href = path;
  };

  // Global keyboard shortcuts (Cmd+K, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmd = e.metaKey || e.ctrlKey;
      if (isCmd && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShortcutsOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setShortcutsOpen(false);
        setGuideModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenEditorWithTemplate = (template: CardTemplate) => {
    sessionStorage.setItem('aesthetic_card_studio_selected_template', template.id);
    window.location.href = `/create?template=${template.id}`;
  };

  // Filter templates for ⌘K palette
  const matchingTemplatesInCommand = PRESET_TEMPLATES.filter((t) => {
    if (!commandQuery.trim()) return false;
    const q = commandQuery.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      t.categoryLabel.toLowerCase().includes(q) ||
      t.author.toLowerCase().includes(q)
    );
  });

  const isLight = theme === 'light';

  // Route Resolver
  const renderCurrentRoute = () => {
    const path = currentPath === '/' ? '/' : currentPath.replace(/\/$/, '');

    // 1. Homepage
    if (path === '/') {
      return (
        <HomeView
          theme={theme}
          onOpenEditorWithTemplate={handleOpenEditorWithTemplate}
          onNavigateToEditor={() => navigate('/create')}
          onNavigate={navigate}
          onOpenGuide={() => setGuideModalOpen(true)}
        />
      );
    }

    // 2. Card Creator
    if (path === '/create') {
      return (
        <EditorView
          theme={theme}
          initialTemplate={activeTemplate}
          onNavigateHome={() => navigate('/')}
        />
      );
    }

    // 2b. Freeform Canvas Studio
    if (path === '/canvas') {
      return (
        <CanvasEditorView
          theme={theme}
          onNavigateHome={() => navigate('/')}
        />
      );
    }

    // 3. Template Library Hub
    if (path === '/templates') {
      return (
        <TemplatesView
          theme={theme}
          onOpenEditorWithTemplate={handleOpenEditorWithTemplate}
          onNavigate={navigate}
        />
      );
    }

    // 4. Distinct Category Landing Pages (/templates/:slug)
    if (path.startsWith('/templates/')) {
      const slug = path.replace('/templates/', '');
      const matchedCategory = TEMPLATE_CATEGORIES.find(
        (c) => c.slug === slug || c.path === path
      );
      if (matchedCategory) {
        return (
          <CategoryView
            category={matchedCategory}
            theme={theme}
            onOpenEditorWithTemplate={handleOpenEditorWithTemplate}
            onNavigate={navigate}
          />
        );
      }
      return <NotFoundView theme={theme} onNavigate={navigate} />;
    }

    // 5. Guides Knowledge Hub
    if (path === '/guides') {
      return <GuideIndexView theme={theme} onNavigate={navigate} />;
    }

    // 6. Educational Guide Detail Pages (/guides/:slug)
    if (path.startsWith('/guides/')) {
      const slug = path.replace('/guides/', '');
      const matchedArticle = GUIDE_ARTICLES.find(
        (g) => g.slug === slug || g.path === path
      );
      if (matchedArticle) {
        return (
          <GuideDetailView
            guide={matchedArticle}
            theme={theme}
            onOpenEditorWithTemplate={handleOpenEditorWithTemplate}
            onNavigate={navigate}
          />
        );
      }
      return <NotFoundView theme={theme} onNavigate={navigate} />;
    }

    // 7. Studio Blog & Thought Pieces Hub (/blog)
    if (path === '/blog') {
      return <BlogIndexView theme={theme} onNavigate={navigate} />;
    }

    // 8. Individual Blog Article Pages (/blog/:slug)
    if (path.startsWith('/blog/')) {
      const slug = path.replace('/blog/', '');
      const matchedPost = BLOG_POSTS.find(
        (p) => p.slug === slug || p.path === path
      );
      if (matchedPost) {
        return (
          <BlogDetailView
            blog={matchedPost}
            theme={theme}
            onOpenEditorWithTemplate={handleOpenEditorWithTemplate}
            onNavigate={navigate}
          />
        );
      }
      return <NotFoundView theme={theme} onNavigate={navigate} />;
    }

    // 9. Trust & Information Pages
    if (path === '/about') {
      return <AboutView theme={theme} onNavigate={navigate} />;
    }
    if (path === '/contact') {
      return <ContactView theme={theme} onNavigate={navigate} />;
    }
    if (path === '/faq') {
      return <FaqView theme={theme} onNavigate={navigate} />;
    }
    if (path === '/privacy') {
      return <PrivacyView theme={theme} onNavigate={navigate} />;
    }
    if (path === '/terms') {
      return <TermsView theme={theme} onNavigate={navigate} />;
    }
    if (path === '/cookies') {
      return <CookieView theme={theme} onNavigate={navigate} />;
    }
    if (path === '/accessibility') {
      return <AccessibilityView theme={theme} onNavigate={navigate} />;
    }
    if (path === '/credits') {
      return <CreditsView theme={theme} onNavigate={navigate} />;
    }
    if (path === '/404') {
      return <NotFoundView theme={theme} onNavigate={navigate} />;
    }

    // Fallback: 404
    return <NotFoundView theme={theme} onNavigate={navigate} />;
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        isLight ? 'bg-[#f6f8fa] text-[#181a20]' : 'bg-[#0b0e11] text-[#e1e2e7]'
      }`}
    >
      {/* Global Header */}
      <Header
        currentPath={currentPath}
        theme={theme}
        onToggleTheme={toggleTheme}
        onNavigate={navigate}
        onOpenShortcuts={() => setShortcutsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {renderCurrentRoute()}
      </main>

      {/* Global Footer (shown on all public pages except fullscreen editors) */}
      {currentPath !== '/create' && currentPath !== '/canvas' && (
        <Footer
          theme={theme}
          onNavigate={navigate}
        />
      )}

      {/* Command Palette (⌘K) Modal */}
      {shortcutsOpen && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-start justify-center pt-20 p-4"
          onClick={() => setShortcutsOpen(false)}
        >
          <div
            className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden animate-scale-in ${
              isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#181d24] border-[#262c36]'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input Bar */}
            <div className={`p-4 border-b flex items-center gap-3 ${isLight ? 'border-[#e2e8f0]' : 'border-[#262c36]'}`}>
              <Search className={`w-4 h-4 ${isLight ? 'text-[#94a3b8]' : 'text-[#707a8a]'}`} />
              <input
                type="text"
                autoFocus
                value={commandQuery}
                onChange={(e) => setCommandQuery(e.target.value)}
                placeholder="Type a style, action, or command (e.g. 'St. Germain', 'Quote', 'Editor')..."
                className={`w-full text-sm bg-transparent focus:outline-none ${
                  isLight ? 'text-[#0f172a] placeholder-[#94a3b8]' : 'text-white placeholder-[#707a8a]'
                }`}
              />
              <button
                onClick={() => setShortcutsOpen(false)}
                className="text-[#707a8a] hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Actions List */}
            <div className="p-3 flex flex-col gap-1 max-h-96 overflow-y-auto text-xs">
              {/* Template search results if searching */}
              {matchingTemplatesInCommand.length > 0 && (
                <div className="mb-2">
                  <span className="px-2 py-1 text-[10px] font-semibold text-[#707a8a] uppercase block">
                    Matching Art Directions
                  </span>
                  {matchingTemplatesInCommand.map((tmpl) => (
                    <button
                      key={tmpl.id}
                      onClick={() => {
                        handleOpenEditorWithTemplate(tmpl);
                        setShortcutsOpen(false);
                      }}
                      className={`w-full p-2 rounded-lg text-left flex items-center justify-between transition-colors cursor-pointer ${
                        isLight ? 'hover:bg-[#f1f5f9]' : 'hover:bg-[#222730]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          style={{ backgroundColor: tmpl.theme.bg }}
                          className="w-3.5 h-3.5 rounded border border-black/20"
                        ></span>
                        <span className={isLight ? 'text-[#0f172a] font-medium' : 'text-white font-medium'}>
                          {tmpl.title}
                        </span>
                        <span className="text-[10px] text-[#707a8a]">({tmpl.categoryLabel})</span>
                      </div>
                      <span className="text-[10px] text-[#0ecb81]">Open Style →</span>
                    </button>
                  ))}
                </div>
              )}

              <span className="px-2 py-1 text-[10px] font-semibold text-[#707a8a] uppercase block">
                Quick Studio Navigation
              </span>

              <button
                onClick={() => {
                  navigate('/create');
                  setShortcutsOpen(false);
                }}
                className={`w-full p-2.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                  isLight ? 'hover:bg-[#f1f5f9]' : 'hover:bg-[#222730]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <PenTool className="w-4 h-4 text-[#0ecb81]" />
                  <span className={isLight ? 'text-[#0f172a]' : 'text-white'}>Open Studio Editor</span>
                </div>
                <span className={`px-2 py-0.5 rounded font-mono text-[10px] ${isLight ? 'bg-[#e2e8f0]' : 'bg-[#14171d]'}`}>
                  /create
                </span>
              </button>

              <button
                onClick={() => {
                  navigate('/templates');
                  setShortcutsOpen(false);
                }}
                className={`w-full p-2.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                  isLight ? 'hover:bg-[#f1f5f9]' : 'hover:bg-[#222730]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <LayoutTemplate className={`w-4 h-4 ${isLight ? 'text-[#d97706]' : 'text-[#fcd535]'}`} />
                  <span className={isLight ? 'text-[#0f172a]' : 'text-white'}>Browse Template Library</span>
                </div>
                <span className={`px-2 py-0.5 rounded font-mono text-[10px] ${isLight ? 'bg-[#e2e8f0]' : 'bg-[#14171d]'}`}>
                  /templates
                </span>
              </button>

              <button
                onClick={() => {
                  navigate('/guides');
                  setShortcutsOpen(false);
                }}
                className={`w-full p-2.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                  isLight ? 'hover:bg-[#f1f5f9]' : 'hover:bg-[#222730]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-[#3b82f6]" />
                  <span className={isLight ? 'text-[#0f172a]' : 'text-white'}>Explore Design & Typography Guides</span>
                </div>
                <span className={`px-2 py-0.5 rounded font-mono text-[10px] ${isLight ? 'bg-[#e2e8f0]' : 'bg-[#14171d]'}`}>
                  /guides
                </span>
              </button>

              <button
                onClick={() => {
                  navigate('/blog');
                  setShortcutsOpen(false);
                }}
                className={`w-full p-2.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                  isLight ? 'hover:bg-[#f1f5f9]' : 'hover:bg-[#222730]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Newspaper className="w-4 h-4 text-[#ec4899]" />
                  <span className={isLight ? 'text-[#0f172a]' : 'text-white'}>Studio Blog & Design Essays</span>
                </div>
                <span className={`px-2 py-0.5 rounded font-mono text-[10px] ${isLight ? 'bg-[#e2e8f0]' : 'bg-[#14171d]'}`}>
                  /blog
                </span>
              </button>

              <button
                onClick={() => {
                  toggleTheme();
                  setShortcutsOpen(false);
                }}
                className={`w-full p-2.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                  isLight ? 'hover:bg-[#f1f5f9]' : 'hover:bg-[#222730]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {isLight ? (
                    <Moon className="w-4 h-4 text-[#475569]" />
                  ) : (
                    <Sun className="w-4 h-4 text-[#fcd535]" />
                  )}
                  <span className={isLight ? 'text-[#0f172a]' : 'text-white'}>
                    Switch to {isLight ? 'Dark (Obsidian)' : 'Light (Daylight)'} Mode
                  </span>
                </div>
                <span className={`px-2 py-0.5 rounded font-mono text-[10px] ${isLight ? 'bg-[#e2e8f0]' : 'bg-[#14171d]'}`}>
                  Theme
                </span>
              </button>
            </div>

            <div className={`p-3 border-t text-[11px] text-[#707a8a] text-center ${isLight ? 'border-[#e2e8f0]' : 'border-[#262c36]'}`}>
              Press <kbd className="px-1.5 py-0.5 rounded border text-current">Esc</kbd> to close
            </div>
          </div>
        </div>
      )}

      {/* Typography & Typesetting Guide Modal */}
      {guideModalOpen && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setGuideModalOpen(false)}
        >
          <div
            className={`w-full max-w-2xl max-h-[85vh] rounded-2xl border shadow-2xl flex flex-col overflow-hidden animate-scale-in ${
              isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#181d24] border-[#262c36]'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`p-5 border-b flex items-center justify-between ${isLight ? 'border-[#e2e8f0]' : 'border-[#262c36]'}`}>
              <div className="flex items-center gap-2.5">
                <BookOpen className={`w-5 h-5 ${isLight ? 'text-[#d97706]' : 'text-[#fcd535]'}`} />
                <h3 className={`text-base font-bold ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
                  Typesetting & Design System Guide
                </h3>
              </div>
              <button
                onClick={() => setGuideModalOpen(false)}
                className="text-[#707a8a] hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex flex-col gap-6 text-xs leading-relaxed">
              <div className="flex flex-col gap-2">
                <h4 className={`text-sm font-semibold ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
                  1. Optical Hierarchy & Line Measure
                </h4>
                <p className={isLight ? 'text-[#64748b]' : 'text-[#9ca3af]'}>
                  Editorial cards shine when lines do not stretch past 45–65 characters. When rendering long quotes (over 200 characters), reduce font size to 20–22px to avoid clipping and preserve comfortable negative space around your margins.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <h4 className={`text-sm font-semibold ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
                  2. Font Pairings
                </h4>
                <p className={isLight ? 'text-[#64748b]' : 'text-[#9ca3af]'}>
                  • <strong>Newsreader (Editorial Serif)</strong>: Best for philosophical reflections, literature quotes, and classic essays.<br />
                  • <strong>Playfair Display</strong>: High-contrast drama, ideal for short 1–2 line poetic fragments.<br />
                  • <strong>Inter (Humanist Sans)</strong>: Clean, modern readability for software notes, critique, and product design axioms.<br />
                  • <strong>JetBrains Mono</strong>: Precise tabular monospaced style for technical quotes and code fragments.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <h4 className={`text-sm font-semibold ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
                  3. Export Resolutions & Social Specs
                </h4>
                <p className={isLight ? 'text-[#64748b]' : 'text-[#9ca3af]'}>
                  All PNG and WebP exports are rendered with a 2× device pixel ratio (Retina standard). Square cards export at 2160×2160 pixels, and 4:5 portrait cards export at 2160×2700 pixels, ensuring maximum sharpness on high-DPI smartphone displays.
                </p>
              </div>

              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                isLight ? 'bg-[#f8fafc] border-[#e2e8f0]' : 'bg-[#14171d] border-[#262c36]'
              }`}>
                <div>
                  <span className={`font-semibold block ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
                    Ready to craft your card?
                  </span>
                  <span className="text-[11px] text-[#707a8a]">Jump into the Studio Editor to start typesetting.</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setGuideModalOpen(false);
                      navigate('/guides');
                    }}
                    className={`px-3 py-2 rounded-lg font-medium text-xs transition-colors cursor-pointer border ${
                      isLight
                        ? 'border-[#e2e8f0] text-[#475569] hover:bg-[#f1f5f9]'
                        : 'border-[#262c36] text-[#c6c6c7] hover:bg-[#1f242c]'
                    }`}
                  >
                    View All Guides
                  </button>
                  <button
                    onClick={() => {
                      setGuideModalOpen(false);
                      navigate('/create');
                    }}
                    className={`px-4 py-2 rounded-lg font-semibold text-xs transition-colors cursor-pointer ${
                      isLight
                        ? 'bg-[#0f172a] text-white hover:bg-[#1e293b]'
                        : 'bg-white text-[#0b0e11] hover:bg-[#e2e2e2]'
                    }`}
                  >
                    Open Studio
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Wrap with Error Boundary so crashes render the 500 page
const AppWithBoundary: React.FC = () => {
  const [theme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('aesthetic_card_studio_theme');
    return saved === 'light' ? 'light' : 'dark';
  });
  return (
    <ErrorBoundary theme={theme}>
      <App />
    </ErrorBoundary>
  );
};

export default AppWithBoundary;
