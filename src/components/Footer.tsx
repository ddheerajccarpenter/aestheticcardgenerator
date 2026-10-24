import React from 'react';
import { Moon, Sun } from 'lucide-react';

interface FooterProps {
  onNavigate?: (path: string) => void;
  theme?: 'dark' | 'light';
}

export const Footer: React.FC<FooterProps> = ({ theme = 'dark' }) => {
  const isLight = theme === 'light';

  return (
    <footer className="w-full border-t border-[var(--app-border-subtle)] bg-[var(--app-surface)] text-[var(--app-text)] transition-colors duration-200 mt-16 pb-20 md:pb-8">
      <div className="studio-container py-8 flex flex-col gap-6">
        {/* Wireframe Primary Row: ACG brand on left, About / How to Use / FAQ / Contact on right */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-[var(--app-border-subtle)]">
          <div className="flex items-center gap-3">
            <span className="font-extrabold tracking-tight text-lg font-heading text-[var(--app-text)]">ACG</span>
            <span className="text-xs text-[var(--app-text-muted)]">
              Aesthetic Card Generator
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-[var(--app-text)]">
            <a href="/about" className="hover:text-[var(--app-accent)] transition-colors">About</a>
            <a href="/guides" className="hover:text-[var(--app-accent)] transition-colors">How to Use</a>
            <a href="/faq" className="hover:text-[var(--app-accent)] transition-colors">FAQ</a>
            <a href="/contact" className="hover:text-[var(--app-accent)] transition-colors">Contact</a>
            <a href="/privacy" className="hover:text-[var(--app-accent)] transition-colors text-[11px] font-normal text-[var(--app-text-muted)]">Privacy</a>
            <a href="/terms" className="hover:text-[var(--app-accent)] transition-colors text-[11px] font-normal text-[var(--app-text-muted)]">Terms</a>
          </div>
        </div>

        {/* Bottom bar: Copyright & theme status */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--app-text-muted)]">
          <div>
            © 2026 Aesthetic Card Generator. 100% Client-Side.
          </div>
          <div className="flex items-center gap-1.5">
            {isLight ? <Sun className="w-3.5 h-3.5 text-[var(--app-accent)]" /> : <Moon className="w-3.5 h-3.5 text-[var(--app-accent)]" />}
            <span>Workspace: {isLight ? 'Light' : 'Dark'}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
