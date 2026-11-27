import React from 'react';
import { Moon, Sun } from 'lucide-react';

interface FooterProps {
  onNavigate?: (path: string) => void;
  theme?: 'dark' | 'light';
}

export const Footer: React.FC<FooterProps> = ({ theme = 'dark' }) => {
  const isLight = theme === 'light';
  const linkClass = 'editorial-link-underline min-h-[44px] inline-flex items-center hover:text-[var(--app-accent)] transition-colors';

  return (
    <footer className="w-full border-t border-[var(--app-border-subtle)] bg-[var(--app-surface)] text-[var(--app-text)] transition-colors duration-200 mt-16 pb-28 md:pb-8">
      <div className="studio-container py-7 flex flex-col gap-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 pb-5 border-b border-[var(--app-border-subtle)]">
          <a href="/" className="font-brand text-base font-medium tracking-tight text-[var(--app-text)] hover:text-[var(--app-accent)] transition-colors min-h-[44px] inline-flex items-center">
            ACG
          </a>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[13px] font-medium text-[var(--app-text)]">
            <a href="/premium" className={linkClass}>Signature</a>
            <a href="/bingo" className={linkClass}>Bingo</a>
            <a href="/about" className={linkClass}>About</a>
            <a href="/guides" className={linkClass}>Guides</a>
            <a href="/blog" className={linkClass}>Blog</a>
            <a href="/faq" className={linkClass}>FAQ</a>
            <a href="/contact" className={linkClass}>Contact</a>
            <a href="/privacy" className={`${linkClass} font-normal text-[var(--app-text-muted)]`}>Privacy</a>
            <a href="/cookies" className={`${linkClass} font-normal text-[var(--app-text-muted)]`}>Cookies</a>
            <a href="/terms" className={`${linkClass} font-normal text-[var(--app-text-muted)]`}>Terms</a>
            <a href="/disclaimer" className={`${linkClass} font-normal text-[var(--app-text-muted)]`}>Disclaimer</a>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 text-[13px] text-[var(--app-text-muted)]">
          <span>© 2026 ACG</span>
          <div className="flex items-center gap-1.5">
            {isLight ? <Sun className="w-3.5 h-3.5 text-[var(--app-accent)]" aria-hidden="true" /> : <Moon className="w-3.5 h-3.5 text-[var(--app-accent)]" aria-hidden="true" />}
            <span>{isLight ? 'Light' : 'Dark'}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
