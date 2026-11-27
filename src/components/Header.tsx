import React, { useEffect, useRef, useState } from 'react';
import { animate, stagger } from 'animejs';
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
  Pause,
  Play,
} from 'lucide-react';
import { EDITORIAL_EASE, isReducedMotion, setMotionPaused, useMotionPaused } from '../utils/motion';

interface HeaderProps {
  currentPath?: string;
  theme: 'dark' | 'light';
  onToggleTheme: (e?: React.MouseEvent) => void;
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
  const motionPaused = useMotionPaused();
  const scrollBarRef = useRef<HTMLDivElement | null>(null);
  const drawerRef = useRef<HTMLElement | null>(null);
  const themeIconRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const bar = scrollBarRef.current;
    if (!bar) return;
    let rafId: number | null = null;
    const update = () => {
      rafId = null;
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const p = document.documentElement.scrollHeight <= window.innerHeight + 24
        ? 0
        : Math.min(1, Math.max(0, window.scrollY / max));
      bar.style.setProperty('--page-scroll', p.toFixed(4));
    };
    const onScroll = () => {
      if (rafId === null) rafId = window.requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, [currentPath]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    if (drawerRef.current && !isReducedMotion()) {
      const items = drawerRef.current.querySelectorAll<HTMLElement>('a');
      if (items.length) {
        animate(items, {
          opacity: [0, 1],
          y: [10, 0],
          duration: 320,
          delay: stagger(28),
          ease: EDITORIAL_EASE,
        });
      }
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const handleThemeClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (themeIconRef.current && !isReducedMotion()) {
      animate(themeIconRef.current, {
        rotate: [0, 180],
        scale: [0.85, 1],
        duration: 380,
        ease: EDITORIAL_EASE,
      });
    }
    onToggleTheme(e);
  };

  const links = [
    { label: 'Gallery', path: '/', icon: Compass, active: currentPath === '/' },
    { label: 'Signature', path: '/premium', icon: Sparkles, active: currentPath.startsWith('/premium') },
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
    <header className="sticky top-0 z-50 w-full overflow-x-clip border-b border-[var(--app-border-subtle)] bg-[var(--app-bg)]">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <div className="mx-auto flex h-14 max-w-[1540px] items-center justify-between gap-2 px-3 text-[var(--app-text-primary)] sm:px-5 lg:px-6">
        <a href="/" aria-label="ACG home" className="group flex shrink-0 items-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--app-accent)] sm:gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[var(--app-border-strong)] text-[var(--app-accent)] transition-colors group-hover:border-[var(--app-accent)]" aria-hidden="true">
            <span className="h-2 w-2 rounded-xs bg-current" />
          </span>
          <span className="font-brand text-base leading-none tracking-normal">ACG</span>
        </a>

        <nav aria-label="Primary" className="hidden min-w-0 items-center gap-1 md:flex">
          {links.map(({ label, path, icon: Icon, active }) => (
            <a
              key={path}
              href={path}
              aria-current={active ? 'page' : undefined}
              className={`editorial-link-underline inline-flex h-10 shrink-0 items-center gap-1.5 border-b-2 px-2.5 text-[13px] font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--app-accent)] lg:gap-2 lg:px-3 ${active ? 'border-[var(--app-accent)] text-[var(--app-text-primary)]' : 'border-transparent text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)]'}`}
            >
              <Icon className="hidden h-4 w-4 lg:block stroke-[1.5]" aria-hidden="true" />
              <span>{label}</span>
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onOpenShortcuts}
            title="Quick search"
            aria-label="Open quick search"
            className="inline-flex h-11 sm:h-10 w-11 sm:w-auto items-center justify-center gap-1.5 rounded-lg sm:border sm:border-[var(--app-border-subtle)] sm:bg-[var(--app-surface)] sm:px-2.5 text-[var(--app-text-secondary)] transition-colors hover:bg-[var(--app-surface-secondary)] hover:text-[var(--app-text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--app-accent)] cursor-pointer"
          >
            <Search className="h-4 w-4 stroke-[1.5]" aria-hidden="true" />
            <kbd className="hidden lg:inline-block rounded border border-[var(--app-border-subtle)] bg-[var(--app-bg)] px-1.5 py-0.5 font-mono text-xs text-[var(--app-text-muted)]">
              ⌘K
            </kbd>
          </button>
          <button
            type="button"
            onClick={() => setMotionPaused(!motionPaused)}
            aria-pressed={motionPaused}
            title={motionPaused ? 'Resume animations' : 'Pause animations'}
            aria-label={motionPaused ? 'Resume animations' : 'Pause animations'}
            className={`${toolClass} ${motionPaused ? 'text-[var(--app-accent)] bg-[var(--app-surface-secondary)]' : ''}`}
          >
            {motionPaused ? <Play className="h-4 w-4" aria-hidden="true" /> : <Pause className="h-4 w-4" aria-hidden="true" />}
          </button>
          <button type="button" onClick={handleThemeClick} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} className={toolClass}>
            <span ref={themeIconRef} className="inline-flex items-center justify-center">
              {theme === 'light' ? <Moon className="h-4 w-4" aria-hidden="true" /> : <Sun className="h-4 w-4" aria-hidden="true" />}
            </span>
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
          <a href="/create" className="btn-sheen interactive-tactile hidden sm:inline-flex min-h-[44px] h-11 shrink-0 items-center gap-1.5 rounded-xl bg-[var(--app-accent)] px-3 text-[13px] font-semibold text-[var(--app-accent-ink)] transition-colors hover:bg-[var(--app-accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--app-accent)] sm:ml-1 md:px-3.5">
            <span>Create card</span>
            <Plus className="h-4 w-4 stroke-[1.5]" aria-hidden="true" />
          </a>
        </div>
      </div>
      <div
        ref={scrollBarRef}
        aria-hidden="true"
        className="header-scroll-bar pointer-events-none absolute inset-x-0 bottom-0 h-[2px] bg-[var(--app-accent)]/75"
      />

      {mobileMenuOpen && (
        <>
          <button
            type="button"
            aria-label="Close navigation menu backdrop"
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-x-0 bottom-0 top-[57px] z-40 bg-black/50 md:hidden"
          />
          <nav
            ref={drawerRef}
            id="mobile-nav-drawer"
            aria-label="Mobile navigation"
            className="animate-drawer-unroll relative z-50 border-t border-[var(--app-border-subtle)] bg-[var(--app-bg)] px-3 pb-4 pt-3 shadow-2xl md:hidden max-h-[calc(100dvh-57px)] overflow-y-auto"
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
              <span>Create</span>
            </a>
          </nav>
        </>
      )}
    </header>
  );
};
