import React, { useState, useEffect } from 'react';
import { Search, Moon, Sun, Menu, X, PenTool, BookOpen, Layers, Newspaper, LayoutTemplate, Info, Mail } from 'lucide-react';

interface HeaderProps {
  currentPath?: string;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onNavigate?: (path: string) => void;
  onOpenShortcuts?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPath = '/',
  theme,
  onToggleTheme,
  onOpenShortcuts,
}) => {
  const isLight = theme === 'light';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Templates', path: '/templates' },
    { label: 'Card Creator', path: '/create' },
    { label: 'Canvas Studio', path: '/canvas' },
  ];

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b border-[var(--app-border-subtle)] bg-[var(--app-bg)]/95 text-[var(--app-text)] transition-colors duration-200 pt-[env(safe-area-inset-top,0px)]"
    >
      <div className="h-14 sm:h-15 w-full max-w-7xl mx-auto px-3 sm:px-6 md:px-8 flex items-center justify-between gap-3">
        {/* Left: Brand Identity + Primary Nav */}
        <div className="flex items-center gap-5 sm:gap-7 min-w-0">
          <a
            href="/"
            className="flex items-center gap-2.5 group cursor-pointer shrink-0 focus-visible:outline-2 focus-visible:outline-[var(--app-accent)]"
            aria-label="Aesthetic Card Generator — Home"
          >
            {/* Normalized geometric brand mark */}
            <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-all border border-[var(--app-border-subtle)] bg-[var(--app-surface)] group-hover:border-[var(--app-accent)]/50 group-hover:bg-[var(--app-surface-secondary)]">
              <div className="grid grid-cols-2 gap-1 w-4 h-4">
                <div className="w-1.5 h-1.5 rounded-xs bg-[var(--app-accent)]" />
                <div className="w-1.5 h-1.5 rounded-xs bg-[var(--app-accent)]/60" />
                <div className="w-1.5 h-1.5 rounded-xs bg-[var(--app-accent)]/40" />
                <div className="w-1.5 h-1.5 rounded-xs bg-[var(--app-accent)]/80" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-extrabold tracking-tight text-base font-heading leading-tight text-[var(--app-text)]">
                ACG
              </span>
              <span className="hidden xl:inline text-xs font-medium text-[var(--app-text-muted)]">
                Aesthetic Card Generator
              </span>
            </div>
          </a>

          {/* Desktop Core Navigation (visible from md breakpoint up) */}
          <nav
            aria-label="Primary Navigation"
            className="hidden md:flex items-center gap-1 text-xs font-semibold"
          >
            {navItems.map((item) => {
              const isActive = item.path === '/' ? currentPath === '/' : currentPath.startsWith(item.path);

              return (
                <a
                  key={item.path}
                  href={item.path}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-[var(--app-accent)] ${
                    isActive
                      ? 'bg-[var(--app-accent)] text-[var(--app-ink)] font-bold shadow-xs'
                      : 'text-[var(--app-text-muted)] hover:bg-[var(--app-surface)] hover:text-[var(--app-text)]'
                  }`}
                >
                  <span>{item.label}</span>
                </a>
              );
            })}
          </nav>
        </div>

        {/* Right Utility Group */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Create CTA on desktop */}
          <a
            href="/create"
            className="hidden lg:inline-flex items-center gap-1.5 studio-btn-primary px-3.5 py-1.5 text-xs font-bold cursor-pointer"
          >
            <span>Start Creating</span>
            <span className="text-xs">→</span>
          </a>

          {/* Command Palette / Search Trigger */}
          <button
            onClick={onOpenShortcuts}
            className="inline-flex items-center gap-2 h-8.5 px-2.5 sm:px-3 rounded-lg border border-[var(--app-border-subtle)] bg-[var(--app-surface)] hover:bg-[var(--app-surface-secondary)] text-[var(--app-text-muted)] hover:text-[var(--app-text)] text-xs font-medium transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--app-accent)]"
            title="Search styles and commands (⌘K)"
            aria-label="Open command palette and template search"
          >
            <Search className="w-3.5 h-3.5 opacity-80" />
            <span className="hidden sm:inline text-xs">Search</span>
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono border border-[var(--app-border-subtle)] bg-[var(--app-surface-secondary)] text-[var(--app-text-muted)]">
              ⌘K
            </kbd>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="h-8.5 w-8.5 inline-flex items-center justify-center rounded-lg border border-[var(--app-border-subtle)] bg-[var(--app-surface)] hover:bg-[var(--app-surface-secondary)] text-[var(--app-text)] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--app-accent)]"
            title={`Switch to ${isLight ? 'Dark' : 'Light'} Mode`}
            aria-label={`Switch to ${isLight ? 'Dark' : 'Light'} Mode`}
          >
            {isLight ? <Sun className="w-4 h-4 text-[var(--app-accent)]" /> : <Moon className="w-4 h-4 text-[var(--app-accent)]" />}
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation-sheet"
            className="md:hidden h-8.5 w-8.5 inline-flex items-center justify-center rounded-lg border border-[var(--app-border-subtle)] bg-[var(--app-surface)] hover:bg-[var(--app-surface-secondary)] text-[var(--app-text)] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--app-accent)]"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Editorial Sheet */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation-sheet"
          className="md:hidden border-t border-[var(--app-border-subtle)] p-4 backdrop-blur-2xl transition-all shadow-2xl max-h-[calc(100dvh-60px)] overflow-y-auto animate-fade-in bg-[var(--app-surface)]/98 text-[var(--app-text)]"
        >
          <div className="flex flex-col gap-4 max-w-md mx-auto">
            {/* Section 1: Studio Creation Tools */}
            <div>
              <span className="text-[10px] font-subheading font-bold uppercase tracking-wider text-[var(--app-text-muted)] px-1 mb-2 block">
                Creation Studios
              </span>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href="/create"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`p-3 rounded-xl border flex flex-col justify-between transition-all cursor-pointer ${
                    currentPath === '/create'
                      ? 'bg-[var(--app-surface-secondary)] border-[var(--app-accent)] shadow-xs'
                      : 'studio-panel hover:bg-[var(--app-surface-secondary)]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <PenTool className="w-4 h-4 text-[var(--app-accent)]" />
                    <span className="text-[9px] font-mono opacity-50 uppercase">→</span>
                  </div>
                  <h4 className="font-heading font-bold text-xs tracking-tight text-[var(--app-text)]">Card Creator</h4>
                  <p className="text-[10px] text-[var(--app-text-muted)] mt-0.5">Typeset quotes &amp; IDs</p>
                </a>

                <a
                  href="/canvas"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`p-3 rounded-xl border flex flex-col justify-between transition-all cursor-pointer ${
                    currentPath === '/canvas'
                      ? 'bg-[var(--app-surface-secondary)] border-[var(--app-accent)] shadow-xs'
                      : 'studio-panel hover:bg-[var(--app-surface-secondary)]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <Layers className="w-4 h-4 text-emerald-500" />
                    <span className="text-[9px] font-mono opacity-50 uppercase">→</span>
                  </div>
                  <h4 className="font-heading font-bold text-xs tracking-tight text-[var(--app-text)]">Canvas Studio</h4>
                  <p className="text-[10px] text-[var(--app-text-muted)] mt-0.5">Freeform layers &amp; stickers</p>
                </a>
              </div>
            </div>

            {/* Section 2: Explore & Read */}
            <div>
              <span className="text-[10px] font-subheading font-bold uppercase tracking-wider text-[var(--app-text-muted)] px-1 mb-2 block">
                Explore &amp; Guides
              </span>
              <div className="grid grid-cols-3 gap-2">
                <a
                  href="/templates"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1 transition-all ${
                    currentPath.startsWith('/templates')
                      ? 'bg-[var(--app-surface-secondary)] border-[var(--app-accent)]'
                      : 'studio-panel'
                  }`}
                >
                  <LayoutTemplate className="w-4 h-4 text-[var(--app-accent)]" />
                  <span className="text-xs font-bold mt-1 text-[var(--app-text)]">Templates</span>
                  <span className="text-[9px] text-[var(--app-text-muted)]">56 styles</span>
                </a>

                <a
                  href="/guides"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1 transition-all ${
                    currentPath.startsWith('/guides')
                      ? 'bg-[var(--app-surface-secondary)] border-[var(--app-accent)]'
                      : 'studio-panel'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-bold mt-1 text-[var(--app-text)]">Guides</span>
                  <span className="text-[9px] text-[var(--app-text-muted)]">Rules &amp; fonts</span>
                </a>

                <a
                  href="/blog"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1 transition-all ${
                    currentPath.startsWith('/blog')
                      ? 'bg-[var(--app-surface-secondary)] border-[var(--app-accent)]'
                      : 'studio-panel'
                  }`}
                >
                  <Newspaper className="w-4 h-4 text-pink-400" />
                  <span className="text-xs font-bold mt-1 text-[var(--app-text)]">Blog</span>
                  <span className="text-[9px] text-[var(--app-text-muted)]">Design essays</span>
                </a>
              </div>
            </div>

            {/* Section 3: Colophon & Links */}
            <div className="pt-2 border-t border-[var(--app-border-subtle)] flex items-center justify-between text-xs text-[var(--app-text-muted)]">
              <div className="flex items-center gap-4">
                <a href="/about" onClick={() => setMobileMenuOpen(false)} className="hover:text-[var(--app-text)] flex items-center gap-1 transition-colors">
                  <Info className="w-3 h-3" />
                  <span>About</span>
                </a>
                <a href="/contact" onClick={() => setMobileMenuOpen(false)} className="hover:text-[var(--app-text)] flex items-center gap-1 transition-colors">
                  <Mail className="w-3 h-3" />
                  <span>Contact</span>
                </a>
                <a href="/faq" onClick={() => setMobileMenuOpen(false)} className="hover:text-[var(--app-text)] transition-colors">
                  FAQ
                </a>
              </div>
              <span className="text-[10px] font-mono opacity-60">100% Client-Side</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
