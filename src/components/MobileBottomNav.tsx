import React from 'react';
import { Compass, LayoutTemplate, Plus, Layers } from 'lucide-react';

interface MobileBottomNavProps {
  currentPath: string;
  theme: 'dark' | 'light';
  onNavigate?: (path: string) => void;
  hideWhenTyping?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentPath,
  onNavigate,
  hideWhenTyping = false,
}) => {
  if (hideWhenTyping || currentPath.startsWith('/create') || currentPath.startsWith('/canvas')) return null;

  const navItems = [
    { label: 'Gallery', path: '/', icon: Compass, isActive: currentPath === '/' },
    { label: 'Create', path: '/create', icon: Plus, isActive: false, isCenter: true },
    { label: 'Canvas', path: '/canvas', icon: Layers, isActive: currentPath.startsWith('/canvas') },
    { label: 'Templates', path: '/templates', icon: LayoutTemplate, isActive: currentPath.startsWith('/templates') },
  ];

  const handleItemClick = (event: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    event.preventDefault();
    if (onNavigate) onNavigate(path);
    else window.location.assign(path);
  };

  return (
    <nav aria-label="Mobile Navigation" className="global-mobile-bottom-nav fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--app-border-subtle)] bg-[var(--app-bg)] pb-[env(safe-area-inset-bottom,0px)] text-[var(--app-text-primary)] md:hidden">
      <div className="grid h-14 grid-cols-4 items-center px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive || currentPath === item.path;
          return (
            <a
              key={item.path}
              href={item.path}
              onClick={(event) => handleItemClick(event, item.path)}
              aria-current={active ? 'page' : undefined}
              aria-label={item.label === 'Create' ? 'Create new card' : item.label}
              className={`relative flex min-h-11 flex-col items-center justify-center gap-0.5 px-1 py-1 text-[10px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--app-accent)] ${active ? 'text-[var(--app-text-primary)]' : 'text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)]'} ${item.isCenter ? '-mt-2 font-medium' : ''}`}
            >
              {active && !item.isCenter && <span className="absolute top-0 h-px w-8 bg-[var(--app-accent)]" />}
              <span className={item.isCenter ? 'flex h-9 w-9 items-center justify-center border border-[var(--app-border-strong)] bg-[var(--app-accent)] text-[var(--app-accent-ink)]' : ''}>
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <span>{item.label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
};
