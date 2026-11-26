import React, { useEffect, useState } from 'react';
import {
  Compass,
  LayoutTemplate,
  Layers,
  Search,
  BookOpen,
  Plus,
  Moon,
  Sun,
  Grid3X3,
  Sparkles,
  Menu,
  X,
  Newspaper,
  HelpCircle,
} from 'lucide-react';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const links = [
    { label: 'Gallery', path: '/', icon: Compass, active: currentPath === '/' },
    { label: 'Premium', path: '/premium', icon: Sparkles, active: currentPath.startsWith('/premium') },
    { label: 'Templates', path: '/templates', icon: LayoutTemplate, active: currentPath.startsWith('/templates') },
    { label: 'Canvas', path: '/canvas', icon: Layers, active: currentPath.startsWith('/canvas') },
    { label: 'Bingo', path: '/bingo', icon: Grid3X3, active: currentPath.startsWith('/bingo') },
    { label: 'Guides', path: '/guides', icon: BookOpen, active: currentPath.startsWith('/guides') },
  ];
  const mobileLinks = [
    ...links,
    { label: 'Journal', path: '/blog', icon: Newspaper, active: currentPath.startsWith('/blog') },
    { label: 'FAQ', path: '/faq', icon: HelpCircle, active: currentPath === '/faq' },
  ];
  const toolClass = 'inline-flex h-11 w-11 md:h-10 md:w-10 items-center justify-center rounded-xl text-[var(--app-text-secondary)] transition-colors hover:bg-[var(--app-surface-secondary)] hover:text-[var(--app-text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--app-accent)] cursor-pointer';

  return (
    <header className="sticky top-0 z-50 w-full overflow-x-clip border-b border-[var(--app-border-subtle)] bg-[var(--app-bg)]/95">
      <div className="mx-auto flex h-14 max-w-[1540px] items-center justify-between gap-2 px-3 text-[var(--app-text-primary)] sm:px-5 lg:px-6">
        <a href="/" aria-label="ACG home" className="flex shrink-0 items-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--app-accent)] sm:gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--app-accent)] text-[var(--app-accent)]" aria-hidden="true">
            <span className="h-2 w-2 rounded-full bg-current" />
          </span>
          <span className="font-brand text-base leading-none tracking-wide">ACG</span>
          <span className="hidden border-l border-[var(--app-border-subtle)] pl-2.5 text-[10px] uppercase tracking-[0.12em] text-[var(--app-text-muted)] lg:inline">Aesthetic Card Generator</span>
        </a>

        <nav aria-label="Primary" className="hidden min-w-0 items-center gap-0.5 md:flex lg:gap-1">
          {links.map(({ label, path, icon: Icon, active }) => (
            <a
              key={path}
              href={path}
              aria-current={active ? 'page' : undefined}
              className={`inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl px-2 text-[11px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--app-accent)] lg:gap-2 lg:px-3 lg:text-xs ${active ? 'bg-[var(--app-surface-secondary)] text-[var(--app-text-primary)]' : 'text-[var(--app-text-secondary)] hover:bg-[var(--app-surface-secondary)] hover:text-[var(--app-text-primary)]'}`}
            >
              <Icon className="hidden h-4 w-4 lg:block" aria-hidden="true" />
              <span>{label}</span>
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1">
          <button type="button" onClick={onOpenShortcuts} title="Quick search (⌘K)" aria-label="Open quick search" className={toolClass}>
            <Search className="h-4 w-4" aria-hidden="true" />
          </button>
          <button type="button" onClick={onToggleTheme} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} className={toolClass}>
            {theme === 'light' ? <Moon className="h-4 w-4" aria-hidden="true" /> : <Sun className="h-4 w-4" aria-hidden="true" />}
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-drawer"
            className={`${toolClass} md:hidden`}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
          <a href="/create" className="hidden sm:inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl bg-[var(--app-accent)] px-2.5 text-xs font-semibold text-[var(--app-accent-ink)] transition-colors hover:bg-[var(--app-accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--app-accent)] sm:ml-1 md:px-3">
            <span>Create</span>
            <Plus className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </div>

      {mobileMenuOpen && (
        <>
          <button
            type="button"
            aria-label="Close navigation menu backdrop"
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-x-0 bottom-0 top-[57px] z-40 bg-black/50 md:hidden"
          />
          <nav
            id="mobile-nav-drawer"
            aria-label="Mobile navigation"
            className="relative z-50 border-t border-[var(--app-border-subtle)] bg-[var(--app-bg)] px-3 pb-4 pt-3 shadow-2xl md:hidden max-h-[calc(100dvh-57px)] overflow-y-auto"
          >
            <div className="grid grid-cols-2 gap-2">
              {mobileLinks.map(({ label, path, icon: Icon, active }) => (
                <a
                  key={path}
                  href={path}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex min-h-[44px] items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
                    active
                      ? 'border-[var(--app-accent)]/60 bg-[var(--app-surface-secondary)] text-[var(--app-text-primary)]'
                      : 'border-[var(--app-border-subtle)] bg-[var(--app-surface)]/70 text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)]'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0 text-[var(--app-accent)]" aria-hidden="true" />
                  <span className="truncate">{label}</span>
                </a>
              ))}
            </div>
            <a
              href="/create"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-2.5 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[var(--app-accent)] px-4 py-2.5 text-xs font-bold text-[var(--app-accent-ink)] transition-colors hover:bg-[var(--app-accent-hover)] sm:hidden"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>Create Free Card</span>
            </a>
          </nav>
        </>
      )}
    </header>
  );
};
