import React from 'react';
import { Compass, LayoutTemplate, Layers, Search, BookOpen, Plus, Moon, Sun, Info } from 'lucide-react';

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
  const links = [
    { label: 'Gallery', path: '/', icon: Compass, active: currentPath === '/' },
    { label: 'Templates', path: '/templates', icon: LayoutTemplate, active: currentPath.startsWith('/templates') },
    { label: 'Canvas', path: '/canvas', icon: Layers, active: currentPath.startsWith('/canvas') },
    { label: 'Guides', path: '/guides', icon: BookOpen, active: currentPath.startsWith('/guides') },
  ];

  const toolClass = 'relative flex h-10 w-10 items-center justify-center text-[var(--app-text-secondary)] transition-colors hover:bg-[var(--app-surface-secondary)] hover:text-[var(--app-text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--app-accent)]';
  const activeClass = 'bg-[var(--app-surface-secondary)] text-[var(--app-text-primary)]';

  return (
    <>
      <aside aria-label="Desktop navigation" className="fixed inset-y-0 left-0 z-40 hidden w-16 flex-col items-center justify-between border-r border-[var(--app-border-subtle)] bg-[var(--app-bg)] py-4 md:flex">
        <div className="flex w-full flex-col items-center gap-5">
          <a href="/" aria-label="ACG home" title="ACG" className="flex h-10 w-10 items-center justify-center text-[var(--app-text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--app-accent)]">
            <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-current" aria-hidden="true">
              <span className="h-2 w-2 rounded-full bg-current" />
            </span>
          </a>

          <nav aria-label="Primary" className="flex w-full flex-col items-center gap-1 px-2">
            {links.map(({ label, path, icon: Icon, active }) => (
              <a key={path} href={path} title={label} aria-label={label} aria-current={active ? 'page' : undefined} data-rail-label={label} className={`${toolClass} ${active ? activeClass : ''}`}>
                <Icon className="h-5 w-5" aria-hidden="true" />
                {active && <span className="absolute left-0 h-4 w-px bg-[var(--app-accent)]" aria-hidden="true" />}
              </a>
            ))}
            <button type="button" onClick={onOpenShortcuts} title="Quick search (⌘K)" aria-label="Open quick search" data-rail-label="Quick search" className={toolClass}>
              <Search className="h-5 w-5" aria-hidden="true" />
            </button>
            <span className="my-1 h-px w-6 bg-[var(--app-border-subtle)]" aria-hidden="true" />
            <a href="/create" title="Create" aria-label="Create a design" data-rail-label="Create" className="relative flex h-10 w-10 items-center justify-center bg-[var(--app-accent)] text-[var(--app-accent-ink)] transition-colors hover:bg-[var(--app-accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-accent)]">
              <Plus className="h-5 w-5" aria-hidden="true" />
            </a>
          </nav>
        </div>

        <div className="flex flex-col items-center gap-1">
          <button type="button" onClick={onToggleTheme} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} data-rail-label="Theme" className={toolClass}>
            {theme === 'light' ? <Moon className="h-4 w-4" aria-hidden="true" /> : <Sun className="h-4 w-4" aria-hidden="true" />}
          </button>
          <a href="/about" title="About ACG" aria-label="About ACG" data-rail-label="About ACG" className={toolClass}>
            <Info className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </aside>

      <header className="fixed left-0 right-0 top-0 z-40 flex h-13 items-center justify-between border-b border-[var(--app-border-subtle)] bg-[var(--app-bg)] px-4 text-[var(--app-text-primary)] md:hidden">
        <a href="/" aria-label="ACG home" className="flex items-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--app-accent)]">
          <span className="h-5 w-5 rounded-full border-2 border-current" aria-hidden="true" />
          <span className="text-sm font-semibold tracking-tight">ACG</span>
        </a>
        <div className="flex items-center gap-1">
          <button type="button" onClick={onOpenShortcuts} aria-label="Open quick search" className={`${toolClass} h-9 w-9`}>
            <Search className="h-4 w-4" aria-hidden="true" />
          </button>
          <a href="/create" className="inline-flex h-9 items-center gap-1.5 bg-[var(--app-accent)] px-3 text-xs font-medium text-[var(--app-accent-ink)] transition-colors hover:bg-[var(--app-accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--app-accent)]">
            Create <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
          <button type="button" onClick={onToggleTheme} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} className={`${toolClass} h-9 w-9`}>
            {theme === 'light' ? <Moon className="h-4 w-4" aria-hidden="true" /> : <Sun className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>
      </header>
    </>
  );
};
