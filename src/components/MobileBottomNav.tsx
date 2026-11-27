import React from 'react';
import { Compass, LayoutTemplate, Plus, Layers, Sparkles } from 'lucide-react';

interface MobileBottomNavProps {
  currentPath: string;
  theme: 'dark' | 'light';
  onNavigate?: (path: string) => void;
  hideWhenTyping?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentPath,
  hideWhenTyping = false,
}) => {
  const normalized = currentPath === '/' ? '/' : currentPath.replace(/\/+$/, '') || '/';
  if (hideWhenTyping || normalized.startsWith('/create') || normalized.startsWith('/canvas')) return null;

  const navItems = [
    { label: 'Gallery', path: '/', icon: Compass, isActive: normalized === '/' },
    { label: 'Signature', path: '/premium', icon: Sparkles, isActive: normalized.startsWith('/premium') },
    { label: 'Templates', path: '/templates', icon: LayoutTemplate, isActive: normalized.startsWith('/templates') },
    { label: 'Canvas', path: '/canvas', icon: Layers, isActive: normalized.startsWith('/canvas') },
    { label: 'Create', path: '/create', icon: Plus, isActive: normalized.startsWith('/create') },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="global-mobile-bottom-nav fixed bottom-0 inset-x-0 z-40 border-t border-[var(--app-border-subtle)] bg-[var(--app-surface)] pb-[env(safe-area-inset-bottom,0px)] md:hidden text-[var(--app-text-primary)]"
    >
      <div className="grid h-14 grid-cols-5 items-center px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;
          return (
            <a
              key={item.path}
              href={item.path}
              aria-current={active ? 'page' : undefined}
              aria-label={item.label === 'Create' ? 'Create new card' : item.label}
              className={`relative flex min-h-[48px] flex-col items-center justify-center gap-0.5 px-1 py-1 text-[11px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--app-accent)] ${
                active
                  ? 'text-[var(--app-accent)] font-semibold'
                  : 'text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)]'
              }`}
            >
              {active && (
                <span className="absolute top-0 h-0.5 w-8 rounded-full bg-[var(--app-accent)]" />
              )}
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span className="leading-none">{item.label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
};
