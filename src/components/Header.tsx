import React from 'react';
import {
  Compass,
  LayoutTemplate,
  Layers,
  Search,
  BookOpen,
  Plus,
  Moon,
  Sun,
  Info,
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
  const isLight = theme === 'light';

  const isGallery = currentPath === '/';
  const isTemplates = currentPath.startsWith('/templates');
  const isCanvas = currentPath.startsWith('/canvas');
  const isGuides = currentPath.startsWith('/guides');

  return (
    <>
      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* DESKTOP NAVIGATION RAIL (Reference A: Left Icon Rail)                */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <aside
        aria-label="Desktop Navigation Rail"
        className="hidden md:flex fixed top-0 bottom-0 left-0 w-16 z-40 bg-[var(--app-bg)] border-r border-[var(--app-border-subtle)] flex-col items-center py-4 justify-between select-none transition-colors duration-200"
      >
        {/* Top: Brand Ring Glyph + Main Navigation Icons */}
        <div className="flex flex-col items-center gap-6 w-full">
          {/* Circular Geometric Ring Mark */}
          <a
            href="/"
            className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white/5 transition-all group relative cursor-pointer"
            title="ACG — Home Gallery"
            aria-label="ACG — Home Gallery"
          >
            <div className="w-6 h-6 rounded-full border-2 border-[var(--app-text-primary)] flex items-center justify-center transition-transform group-hover:scale-105">
              <div className="w-2 h-2 rounded-full bg-[var(--app-text-primary)] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </a>

          {/* Understated Nav Icon Stack */}
          <nav aria-label="Desktop Rail Navigation" className="flex flex-col items-center gap-2 w-full px-2">
            {/* Gallery */}
            <a
              href="/"
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative group ${
                isGallery
                  ? isLight ? 'bg-[var(--app-surface-secondary)] text-[var(--app-text-primary)]' : 'bg-white/10 text-white'
                  : isLight ? 'text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)] hover:bg-black/5' : 'text-[var(--app-text-secondary)] hover:text-white hover:bg-white/5'
              }`}
              title="Explore Gallery"
              aria-label="Explore Gallery"
            >
              <Compass className="w-5 h-5" />
              {isGallery && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-[var(--app-text-primary)] rounded-r" />
              )}
            </a>

            {/* Templates */}
            <a
              href="/templates"
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative group ${
                isTemplates
                  ? isLight ? 'bg-[var(--app-surface-secondary)] text-[var(--app-text-primary)]' : 'bg-white/10 text-white'
                  : isLight ? 'text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)] hover:bg-black/5' : 'text-[var(--app-text-secondary)] hover:text-white hover:bg-white/5'
              }`}
              title="Template Catalog"
              aria-label="Template Catalog"
            >
              <LayoutTemplate className="w-5 h-5" />
              {isTemplates && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-[var(--app-text-primary)] rounded-r" />
              )}
            </a>

            {/* Freeform Canvas Studio */}
            <a
              href="/canvas"
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative group ${
                isCanvas
                  ? isLight ? 'bg-[var(--app-surface-secondary)] text-[var(--app-text-primary)]' : 'bg-white/10 text-white'
                  : isLight ? 'text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)] hover:bg-black/5' : 'text-[var(--app-text-secondary)] hover:text-white hover:bg-white/5'
              }`}
              title="Freeform Studio Canvas"
              aria-label="Freeform Studio Canvas"
            >
              <Layers className="w-5 h-5" />
              {isCanvas && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-[var(--app-text-primary)] rounded-r" />
              )}
            </a>

            {/* Quick Search / Command Palette */}
            <button
              onClick={onOpenShortcuts}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-[var(--app-text-secondary)] hover:text-white hover:bg-white/5 transition-all cursor-pointer"
              title="Quick Search (⌘K)"
              aria-label="Quick Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Guides */}
            <a
              href="/guides"
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative group ${
                isGuides
                  ? 'bg-white/10 text-white shadow-xs'
                  : isLight ? 'text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)] hover:bg-black/5' : 'text-[var(--app-text-secondary)] hover:text-white hover:bg-white/5'
              }`}
              title="Design Guides"
              aria-label="Design Guides"
            >
              <BookOpen className="w-5 h-5" />
              {isGuides && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-[var(--app-text-primary)] rounded-r" />
              )}
            </a>

            {/* Divider */}
            <div className="w-6 h-px bg-[var(--app-border-subtle)] my-1" />

            {/* Create Action Button (Reference B prominent Create) */}
            <a
              href="/create"
              className="w-10 h-10 rounded-full bg-[var(--app-accent)] text-[var(--app-accent-ink)] hover:bg-[var(--app-accent-hover)] flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer"
              title="Create New Design"
              aria-label="Create New Design"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </a>
          </nav>
        </div>

        {/* Bottom Rail: Theme Switch & Info */}
        <div className="flex flex-col items-center gap-2 w-full px-2">
          <button
            onClick={onToggleTheme}
            className="w-10 h-10 rounded-xl text-[var(--app-text-secondary)] hover:text-white hover:bg-white/5 flex items-center justify-center transition-colors cursor-pointer"
            title={`Switch to ${isLight ? 'Dark' : 'Light'} Mode`}
            aria-label={`Switch to ${isLight ? 'Dark' : 'Light'} Mode`}
          >
            {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          <a
            href="/about"
            className="w-10 h-10 rounded-xl text-[var(--app-text-secondary)] hover:text-white hover:bg-white/5 flex items-center justify-center transition-colors cursor-pointer"
            title="About ACG"
            aria-label="About ACG"
          >
            <Info className="w-4 h-4" />
          </a>
        </div>
      </aside>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* MOBILE TOP HEADER (< md)                                            */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-13 z-40 bg-[#090a0d]/95 backdrop-blur-md border-b border-[#1a1d24] px-4 flex items-center justify-between text-[#f4f1ea] transition-colors duration-200">
        {/* Left: Brand ring + text */}
        <a href="/" className="flex items-center gap-2 group cursor-pointer" aria-label="ACG Home">
          <div className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center shrink-0 opacity-90 group-hover:opacity-100 transition-opacity" />
          <span className="font-bold tracking-tight text-sm font-sans">ACG</span>
        </a>

        {/* Right: Search, Create +, Theme */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenShortcuts}
            className="p-2 rounded-lg border border-[#23262d] bg-[#14161b] text-[#8e939e] hover:text-white transition-colors cursor-pointer"
            aria-label="Search"
          >
            <Search className="w-3.5 h-3.5" />
          </button>

          <a
            href="/create"
            className="px-3 py-1 rounded-full text-xs font-bold bg-white text-black hover:bg-slate-200 transition-colors shadow-xs cursor-pointer flex items-center gap-1"
          >
            <span>Create</span>
            <Plus className="w-3 h-3 stroke-[2.5]" />
          </a>

          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg border border-[#23262d] bg-[#14161b] text-[#8e939e] hover:text-white transition-colors cursor-pointer"
            aria-label="Toggle Theme"
          >
            {isLight ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
          </button>
        </div>
      </header>
    </>
  );
};
