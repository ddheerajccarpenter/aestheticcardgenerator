import React, { useState } from 'react';
import { SquareDuotoneIcon } from './SquareDuotoneIcon';

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

  const bentoNavItems = [
    { label: 'Home', path: '/', icon: 'bxs-home', desc: 'Main studio' },
    { label: 'Templates', path: '/templates', icon: 'bxs-grid-alt', desc: '56 styles' },
    { label: 'Card Creator', path: '/create', icon: 'bxs-pen', desc: 'Typography press' },
    { label: 'Canvas Studio', path: '/canvas', icon: 'bxs-palette', desc: 'Freeform layers' },
    { label: 'Guides', path: '/guides', icon: 'bxs-book-open', desc: 'Tactile book' },
    { label: 'Blog', path: '/blog', icon: 'bxs-news', desc: 'Design notes' },
    { label: 'About', path: '/about', icon: 'bxs-info-circle', desc: 'Local-first colophon' },
    { label: 'Contact', path: '/contact', icon: 'bxs-envelope', desc: 'Direct owner mail' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b transition-colors duration-200 ${
        isLight
          ? 'bg-white/92 border-[#e2e8f0] text-[#181a20]'
          : 'bg-[#111216]/92 border-[#262c36] text-[#f4f1ea]'
      } pt-[env(safe-area-inset-top,0px)]`}
    >
      <div className="h-14 sm:h-16 w-full max-w-7xl mx-auto px-3 sm:px-6 md:px-8 flex items-center justify-between">
        {/* Left: Brand Logo + Core Links */}
        <div className="flex items-center gap-3 sm:gap-6">
          <a
            href="/"
            className="flex items-center gap-2.5 group cursor-pointer"
            aria-label="Aesthetic Card Studio Home"
          >
            <SquareDuotoneIcon name="logo" size="md" />
            <span className="font-extrabold tracking-tight text-sm sm:text-base font-heading">
              Aesthetic Card Studio
            </span>
          </a>

          {/* Desktop Core Links (Funnel Sans) */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold">
            <a
              href="/"
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                currentPath === '/'
                  ? isLight
                    ? 'bg-[#e2e8f0] text-[#181a20]'
                    : 'bg-[#222730] text-white'
                  : isLight
                  ? 'text-[#64748b] hover:bg-slate-100'
                  : 'text-[#9ca3af] hover:bg-[#181d24]'
              }`}
            >
              Home
            </a>
            <a
              href="/templates"
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                currentPath.startsWith('/templates')
                  ? isLight
                    ? 'bg-[#e2e8f0] text-[#181a20]'
                    : 'bg-[#222730] text-white'
                  : isLight
                  ? 'text-[#64748b] hover:bg-slate-100'
                  : 'text-[#9ca3af] hover:bg-[#181d24]'
              }`}
            >
              Templates
            </a>
            <a
              href="/blog"
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                currentPath.startsWith('/blog')
                  ? isLight
                    ? 'bg-[#e2e8f0] text-[#181a20]'
                    : 'bg-[#222730] text-white'
                  : isLight
                  ? 'text-[#64748b] hover:bg-slate-100'
                  : 'text-[#9ca3af] hover:bg-[#181d24]'
              }`}
            >
              Blog
            </a>
            <a
              href="/create"
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                currentPath === '/create'
                  ? isLight
                    ? 'bg-[#e2e8f0] text-[#181a20]'
                    : 'bg-[#222730] text-white'
                  : isLight
                  ? 'text-[#64748b] hover:bg-slate-100'
                  : 'text-[#9ca3af] hover:bg-[#181d24]'
              }`}
            >
              Card Creator
            </a>
            <a
              href="/canvas"
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                currentPath === '/canvas'
                  ? isLight
                    ? 'bg-[#e2e8f0] text-[#181a20]'
                    : 'bg-[#222730] text-white'
                  : isLight
                  ? 'text-[#64748b] hover:bg-slate-100'
                  : 'text-[#9ca3af] hover:bg-[#181d24]'
              }`}
            >
              Canvas Studio
            </a>
          </nav>
        </div>

        {/* Right Group: Guides Link + Command Palette + Theme Toggle */}
        <div className="flex items-center gap-2">
          {/* Guides link (moved to right nav with square duotone book icon) */}
          <a
            href="/guides"
            className={`hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
              currentPath.startsWith('/guides')
                ? isLight
                  ? 'bg-slate-100 border-slate-300 text-[#0f172a]'
                  : 'bg-[#222730] border-[#384152] text-white'
                : isLight
                ? 'border-slate-200 hover:bg-slate-50 text-[#475569]'
                : 'border-[#262c36] hover:bg-[#181d24] text-[#c4c7c8]'
            }`}
          >
            <SquareDuotoneIcon name="book" size="sm" />
            <span>Guides</span>
          </a>

          {/* Command Palette Trigger (Square Duotone Search + ⌘K) */}
          <button
            onClick={onOpenShortcuts}
            className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
              isLight
                ? 'border-slate-200 hover:bg-slate-50 text-[#64748b]'
                : 'border-[#262c36] hover:bg-[#181d24] text-[#9ca3af]'
            }`}
            title="Search styles and commands (⌘K)"
          >
            <SquareDuotoneIcon name="search" size="sm" />
            <kbd className={`hidden md:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono border ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-black/30 border-white/10'}`}>
              ⌘K
            </kbd>
          </button>

          {/* Theme Toggle (Dark / Light) */}
          <button
            onClick={onToggleTheme}
            className="cursor-pointer"
            title={`Switch to ${isLight ? 'Dark' : 'Light'} Mode`}
            aria-label="Toggle theme"
          >
            <SquareDuotoneIcon name={isLight ? 'sun' : 'moon'} size="md" />
          </button>

          {/* Mobile Menu Button (Square toggle) */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="lg:hidden cursor-pointer ml-1"
            aria-label="Open Mobile Menu"
          >
            <SquareDuotoneIcon name={mobileMenuOpen ? 'close' : 'menu'} size="md" />
          </button>
        </div>
      </div>

      {/* Mobile 2x2 Square Bento Grid Navigation Sheet */}
      {mobileMenuOpen && (
        <div
          className={`lg:hidden border-t p-4 backdrop-blur-2xl transition-all shadow-2xl ${
            isLight ? 'bg-white/98 border-[#e2e8f0]' : 'bg-[#111216]/98 border-[#262c36]'
          }`}
        >
          <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
            {bentoNavItems.map((item) => (
              <a
                key={item.path}
                href={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all cursor-pointer ${
                  currentPath === item.path
                    ? isLight
                      ? 'bg-slate-100 border-slate-300 shadow-sm'
                      : 'bg-[#222730] border-[#384152] text-white shadow-sm'
                    : isLight
                    ? 'bg-slate-50/80 border-slate-200 hover:bg-slate-100'
                    : 'bg-[#181d24]/80 border-[#262c36] hover:bg-[#20252e]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <i className={`bx ${item.icon} text-lg text-[#fcd535]`} />
                  <span className="text-[10px] font-mono opacity-50 uppercase">→</span>
                </div>
                <div>
                  <h4 className="font-bold text-xs tracking-tight">{item.label}</h4>
                  <p className="text-[10px] text-[#707a8a] mt-0.5">{item.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
