import React, { useState } from 'react';
import { Search, Sun, Moon, PenTool, LayoutTemplate, BookOpen, Menu, X } from 'lucide-react';

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

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b transition-colors duration-200 ${
        isLight
          ? 'bg-white/90 border-[#e2e8f0] text-[#181a20]'
          : 'bg-[#111417]/90 border-[#262c36] text-[#e1e2e7]'
      } pt-[env(safe-area-inset-top,0px)]`}
    >
      <div className="h-13 sm:h-16 w-full px-3 sm:px-6 md:px-8 flex items-center justify-between">
        {/* Left: Brand Logo & Desktop Navigation */}
        <div className="flex items-center gap-3 sm:gap-6">
          <a
            href="/"
            className={`flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg border transition-colors group cursor-pointer shrink-0 ${
              isLight
                ? 'bg-[#f1f3f5] border-[#e2e8f0] hover:border-[#cbd5e1]'
                : 'bg-[#181d24] border-[#262c36] hover:border-[#444748]'
            }`}
            aria-label="Aesthetic Card Studio Home"
            title="Go to Home"
          >
            <div className="grid grid-cols-2 gap-1 p-1 sm:p-1.5">
              <span className={`w-1.5 h-1.5 rounded-full transition-colors ${isLight ? 'bg-[#181a20] group-hover:bg-[#d97706]' : 'bg-white group-hover:bg-[#fcd535]'}`}></span>
              <span className={`w-1.5 h-1.5 rounded-full ${isLight ? 'bg-[#94a3b8]' : 'bg-[#c6c6c7]'}`}></span>
              <span className={`w-1.5 h-1.5 rounded-full ${isLight ? 'bg-[#94a3b8]' : 'bg-[#c6c6c7]'}`}></span>
              <span className={`w-1.5 h-1.5 rounded-full transition-colors ${isLight ? 'bg-[#181a20] group-hover:bg-[#d97706]' : 'bg-white group-hover:bg-[#fcd535]'}`}></span>
            </div>
          </a>

          <a
            href="/"
            className={`font-semibold tracking-tight text-xs sm:text-sm text-left cursor-pointer truncate max-w-[150px] sm:max-w-none ${isLight ? 'text-[#181a20]' : 'text-white'}`}
          >
            <span className="inline sm:hidden">Card Studio</span>
            <span className="hidden sm:inline">Aesthetic Card Studio</span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <a
              href="/"
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                currentPath === '/'
                  ? isLight
                    ? 'bg-[#e2e8f0] text-[#181a20] font-semibold'
                    : 'bg-[#222730] text-white shadow-sm'
                  : isLight
                  ? 'text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0f172a]'
                  : 'text-[#9ca3af] hover:bg-[#181d24] hover:text-[#e1e2e7]'
              }`}
            >
              Home
            </a>
            <a
              href="/templates"
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                currentPath.startsWith('/templates')
                  ? isLight
                    ? 'bg-[#e2e8f0] text-[#181a20] font-semibold'
                    : 'bg-[#222730] text-white shadow-sm'
                  : isLight
                  ? 'text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0f172a]'
                  : 'text-[#9ca3af] hover:bg-[#181d24] hover:text-[#e1e2e7]'
              }`}
            >
              Templates
            </a>
            <a
              href="/blog"
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                currentPath.startsWith('/blog')
                  ? isLight
                    ? 'bg-[#e2e8f0] text-[#181a20] font-semibold'
                    : 'bg-[#222730] text-white shadow-sm'
                  : isLight
                  ? 'text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0f172a]'
                  : 'text-[#9ca3af] hover:bg-[#181d24] hover:text-[#e1e2e7]'
              }`}
            >
              Blog
            </a>
            <a
              href="/guides"
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                currentPath.startsWith('/guides')
                  ? isLight
                    ? 'bg-[#e2e8f0] text-[#181a20] font-semibold'
                    : 'bg-[#222730] text-white shadow-sm'
                  : isLight
                  ? 'text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0f172a]'
                  : 'text-[#9ca3af] hover:bg-[#181d24] hover:text-[#e1e2e7]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Guides</span>
            </a>
            <a
              href="/about"
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                currentPath === '/about'
                  ? isLight
                    ? 'bg-[#e2e8f0] text-[#181a20] font-semibold'
                    : 'bg-[#222730] text-white shadow-sm'
                  : isLight
                  ? 'text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0f172a]'
                  : 'text-[#9ca3af] hover:bg-[#181d24] hover:text-[#e1e2e7]'
              }`}
            >
              About
            </a>
            <a
              href="/contact"
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                currentPath === '/contact'
                  ? isLight
                    ? 'bg-[#e2e8f0] text-[#181a20] font-semibold'
                    : 'bg-[#222730] text-white shadow-sm'
                  : isLight
                  ? 'text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0f172a]'
                  : 'text-[#9ca3af] hover:bg-[#181d24] hover:text-[#e1e2e7]'
              }`}
            >
              Contact
            </a>
            <a
              href="/create"
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                currentPath === '/create'
                  ? isLight
                    ? 'bg-[#e2e8f0] text-[#181a20] font-semibold'
                    : 'bg-[#222730] text-white shadow-sm'
                  : isLight
                  ? 'text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0f172a]'
                  : 'text-[#9ca3af] hover:bg-[#181d24] hover:text-[#e1e2e7]'
              }`}
            >
              Card Creator
            </a>
            <a
              href="/canvas"
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                currentPath === '/canvas'
                  ? isLight
                    ? 'bg-[#e2e8f0] text-[#181a20] font-semibold'
                    : 'bg-[#222730] text-white shadow-sm'
                  : isLight
                  ? 'text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0f172a]'
                  : 'text-[#9ca3af] hover:bg-[#181d24] hover:text-[#e1e2e7]'
              }`}
            >
              <span>Canvas Studio</span>
            </a>
          </nav>
        </div>

        {/* Right: Actions, Theme Switcher & Mobile Menu Trigger */}
        <div className="flex items-center gap-2.5">
          {onOpenShortcuts && (
            <button
              onClick={onOpenShortcuts}
              type="button"
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer text-xs ${
                isLight
                  ? 'bg-[#f8fafc] border-[#e2e8f0] text-[#475569] hover:border-[#cbd5e1] hover:text-[#0f172a]'
                  : 'bg-[#181d24] border-[#262c36] text-[#c4c7c8] hover:border-[#444748] hover:text-white'
              }`}
              title="Quick Search & Shortcuts (⌘K)"
              aria-label="Open command palette"
            >
              <Search className="w-3.5 h-3.5" />
              <span className={`font-mono text-[11px] ${isLight ? 'text-[#94a3b8]' : 'text-[#6b7280]'}`}>⌘K</span>
            </button>
          )}

          {/* Theme Switcher Button */}
          <button
            type="button"
            onClick={onToggleTheme}
            className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-all cursor-pointer ${
              isLight
                ? 'bg-[#f8fafc] border-[#e2e8f0] text-[#0f172a] hover:bg-[#f1f5f9]'
                : 'bg-[#181d24] border-[#262c36] text-[#fcd535] hover:border-[#444748]'
            }`}
            title={`Switch to ${isLight ? 'Dark (Obsidian)' : 'Light (Daylight)'} Mode`}
            aria-label="Toggle workspace theme"
          >
            {isLight ? (
              <Moon className="w-4 h-4 text-[#475569] hover:text-[#0f172a]" />
            ) : (
              <Sun className="w-4 h-4 text-[#fcd535]" />
            )}
          </button>

          {/* Primary CTA button */}
          {currentPath === '/create' ? (
            <a
              href="/templates"
              className={`hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border font-medium text-xs transition-colors cursor-pointer ${
                isLight
                  ? 'bg-white border-[#e2e8f0] text-[#0f172a] hover:bg-[#f8fafc]'
                  : 'bg-[#181d24] border-[#262c36] text-white hover:bg-[#222730]'
              }`}
            >
              <LayoutTemplate className={`w-3.5 h-3.5 ${isLight ? 'text-[#d97706]' : 'text-[#fcd535]'}`} />
              <span>Browse Styles</span>
            </a>
          ) : (
            <a
              href="/create"
              className={`hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-xs active:scale-[0.98] transition-all cursor-pointer shadow-md ${
                isLight
                  ? 'bg-[#0f172a] text-white hover:bg-[#1e293b]'
                  : 'bg-white text-[#0b0e11] hover:bg-[#e2e2e2]'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Open Studio</span>
            </a>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden w-9 h-9 flex items-center justify-center rounded-lg border transition-colors cursor-pointer ${
              isLight
                ? 'bg-white border-[#e2e8f0] text-[#0f172a]'
                : 'bg-[#181d24] border-[#262c36] text-white'
            }`}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown & Backdrop */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 top-13 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div
            className={`fixed top-13 left-0 right-0 z-50 md:hidden border-b p-4 flex flex-col gap-1.5 transition-colors shadow-2xl max-h-[calc(100vh-60px)] overflow-y-auto animate-in slide-in-from-top-2 ${
              isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#111417] border-[#262c36]'
            }`}
          >
            <a
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`p-3 rounded-xl text-left text-xs font-semibold cursor-pointer block min-h-[44px] flex items-center ${
                currentPath === '/' ? (isLight ? 'bg-[#f1f5f9] text-[#0f172a]' : 'bg-[#181d24] text-white') : isLight ? 'text-[#475569]' : 'text-[#c6c6c7]'
              }`}
            >
              Home
            </a>
            <a
              href="/templates"
              onClick={() => setMobileMenuOpen(false)}
              className={`p-3 rounded-xl text-left text-xs font-semibold cursor-pointer block min-h-[44px] flex items-center ${
                currentPath.startsWith('/templates') ? (isLight ? 'bg-[#f1f5f9] text-[#0f172a]' : 'bg-[#181d24] text-white') : isLight ? 'text-[#475569]' : 'text-[#c6c6c7]'
              }`}
            >
              Templates & Categories
            </a>
            <a
              href="/create"
              onClick={() => setMobileMenuOpen(false)}
              className={`p-3 rounded-xl text-left text-xs font-semibold cursor-pointer flex items-center justify-between min-h-[44px] ${
                currentPath === '/create'
                  ? isLight
                    ? 'bg-[#0f172a] text-white'
                    : 'bg-[#fcd535] text-black'
                  : isLight
                  ? 'bg-[#f8fafc] text-[#0f172a] border border-[#e2e8f0]'
                  : 'bg-[#181d24] text-white border border-[#262c36]'
              }`}
            >
              <div className="flex items-center gap-2">
                <PenTool className="w-4 h-4" />
                <span>Typesetting Studio (/create)</span>
              </div>
              <span className="text-[10px] font-mono opacity-70">Editor</span>
            </a>
            <a
              href="/canvas"
              onClick={() => setMobileMenuOpen(false)}
              className={`p-3 rounded-xl text-left text-xs font-semibold cursor-pointer flex items-center justify-between min-h-[44px] ${
                currentPath === '/canvas'
                  ? isLight
                    ? 'bg-[#0f172a] text-white'
                    : 'bg-[#fcd535] text-black'
                  : isLight
                  ? 'bg-[#f8fafc] text-[#0f172a] border border-[#e2e8f0]'
                  : 'bg-[#181d24] text-white border border-[#262c36]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-[#fcd535]">layers</span>
                <span>Freeform Canvas Studio (/canvas)</span>
              </div>
              <span className="text-[10px] font-mono text-[#0ecb81] font-bold">New</span>
            </a>
            <a
              href="/guides"
              onClick={() => setMobileMenuOpen(false)}
              className={`p-3 rounded-xl text-left text-xs font-semibold cursor-pointer block min-h-[44px] flex items-center ${
                currentPath.startsWith('/guides') ? (isLight ? 'bg-[#f1f5f9] text-[#0f172a]' : 'bg-[#181d24] text-white') : isLight ? 'text-[#475569]' : 'text-[#c6c6c7]'
              }`}
            >
              Typesetting Guides
            </a>
            <a
              href="/blog"
              onClick={() => setMobileMenuOpen(false)}
              className={`p-3 rounded-xl text-left text-xs font-semibold cursor-pointer block min-h-[44px] flex items-center ${
                currentPath.startsWith('/blog') ? (isLight ? 'bg-[#f1f5f9] text-[#0f172a]' : 'bg-[#181d24] text-white') : isLight ? 'text-[#475569]' : 'text-[#c6c6c7]'
              }`}
            >
              Studio Blog
            </a>

            <div className="pt-3 mt-1 border-t border-current/10 flex flex-wrap items-center justify-between gap-2 text-xs text-[#707a8a] px-1">
              <a href="/about" onClick={() => setMobileMenuOpen(false)} className="hover:underline py-1">About</a>
              <a href="/contact" onClick={() => setMobileMenuOpen(false)} className="hover:underline py-1">Contact</a>
              <a href="/privacy" onClick={() => setMobileMenuOpen(false)} className="hover:underline py-1">Privacy</a>
              <a href="/terms" onClick={() => setMobileMenuOpen(false)} className="hover:underline py-1">Terms</a>
              <a href="/faq" onClick={() => setMobileMenuOpen(false)} className="hover:underline py-1">FAQ</a>
            </div>
          </div>
        </>
      )}
    </header>
  );
};
