import React from 'react';
import { Compass, LayoutTemplate, Layers, Search, BookOpen, Plus, Moon, Sun } from 'lucide-react';

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
  const toolClass = 'inline-flex h-10 w-10 items-center justify-center rounded-xl text-[var(--app-text-secondary)] transition-colors hover:bg-[var(--app-surface-secondary)] hover:text-[var(--app-text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--app-accent)]';

  return (
    <header className="glass-surface fixed inset-x-3 top-3 z-50 mx-auto flex h-14 max-w-[1540px] items-center justify-between gap-2 rounded-2xl px-3 text-[var(--app-text-primary)] sm:px-4">
      <a href="/" aria-label="ACG home" className="flex min-w-0 items-center gap-2.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--app-accent)]">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--app-accent)] text-[var(--app-accent)]" aria-hidden="true">
          <span className="h-2 w-2 rounded-full bg-current" />
        </span>
        <span className="font-brand text-base leading-none tracking-wide">ACG</span>
        <span className="hidden border-l border-[var(--app-border-subtle)] pl-2.5 text-[10px] uppercase tracking-[0.12em] text-[var(--app-text-muted)] lg:inline">Aesthetic Card Generator</span>
      </a>

      <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
        {links.map(({ label, path, icon: Icon, active }) => (
          <a
            key={path}
            href={path}
            aria-current={active ? 'page' : undefined}
            className={`inline-flex h-10 items-center gap-2 rounded-xl px-2.5 text-xs transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--app-accent)] lg:px-3 ${active ? 'bg-[var(--app-surface-secondary)] text-[var(--app-text-primary)]' : 'text-[var(--app-text-secondary)] hover:bg-[var(--app-surface-secondary)] hover:text-[var(--app-text-primary)]'}`}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            <span>{label}</span>
          </a>
        ))}
      </nav>

      <div className="flex shrink-0 items-center gap-1">
        <button type="button" onClick={onOpenShortcuts} title="Quick search (⌘K)" aria-label="Open quick search" className={toolClass}>
          <Search className="h-4 w-4" aria-hidden="true" />
        </button>
        <button type="button" onClick={onToggleTheme} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} className={`${toolClass} hidden sm:inline-flex`}>
          {theme === 'light' ? <Moon className="h-4 w-4" aria-hidden="true" /> : <Sun className="h-4 w-4" aria-hidden="true" />}
        </button>
        <a href="/create" className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-[var(--app-accent)] px-3 text-xs font-semibold text-[var(--app-accent-ink)] transition-colors hover:bg-[var(--app-accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--app-accent)] sm:ml-1 sm:px-3.5">
          <span>Create</span>
          <Plus className="h-4 w-4" aria-hidden="true" />
        </a>
        <button type="button" onClick={onToggleTheme} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} className={`${toolClass} sm:hidden`}>
          {theme === 'light' ? <Moon className="h-4 w-4" aria-hidden="true" /> : <Sun className="h-4 w-4" aria-hidden="true" />}
        </button>
      </div>
    </header>
  );
};
