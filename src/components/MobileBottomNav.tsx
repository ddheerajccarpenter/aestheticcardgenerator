import React from 'react';
import { Home, LayoutTemplate, Plus, Layers } from 'lucide-react';

interface MobileBottomNavProps {
  currentPath: string;
  theme: 'dark' | 'light';
  onNavigate?: (path: string) => void;
  /** Whether the virtual keyboard or full text editing modal is currently active */
  hideWhenTyping?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentPath,
  theme,
  onNavigate,
  hideWhenTyping = false,
}) => {
  const isLight = theme === 'light';

  // Unmount completely on editor routes to prevent double-stacked bars
  if (hideWhenTyping || currentPath.startsWith('/create') || currentPath.startsWith('/canvas')) {
    return null;
  }

  const navItems = [
    {
      label: 'Home',
      path: '/',
      icon: Home,
      isActive: currentPath === '/',
      isCenter: false,
    },
    {
      label: 'Templates',
      path: '/templates',
      icon: LayoutTemplate,
      isActive: currentPath.startsWith('/templates'),
      isCenter: false,
    },
    {
      label: 'Create',
      path: '/create',
      icon: Plus,
      isActive: currentPath === '/create',
      isCenter: true,
    },
    {
      label: 'Studio',
      path: '/canvas',
      icon: Layers,
      isActive: currentPath.startsWith('/canvas'),
      isCenter: false,
    },
  ];

  const handleItemClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.location.href = path;
    }
  };

  return (
    <nav
      aria-label="Mobile Navigation"
      className="global-mobile-bottom-nav fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-[var(--app-border-subtle)] backdrop-blur-xl transition-all duration-200 bg-[var(--app-bg)]/95 text-[var(--app-text)] pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-4px_20px_rgba(0,0,0,0.25)]"
    >
      <div className="grid grid-cols-4 h-14 items-center px-2">
        {navItems.map((item) => {
          const Icon = item.icon;

          if (item.isCenter) {
            return (
              <a
                key={item.path}
                href={item.path}
                onClick={(e) => handleItemClick(e, item.path)}
                className="flex flex-col items-center justify-center -mt-3 cursor-pointer group"
                aria-label="Create new card"
              >
                <div className="w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-transform group-active:scale-95 border border-[var(--app-border-subtle)] bg-[var(--app-accent)] text-[var(--app-ink)]">
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                </div>
                <span className="text-[9px] font-semibold mt-0.5 text-[var(--app-accent)]">
                  Create
                </span>
              </a>
            );
          }

          return (
            <a
              key={item.path}
              href={item.path}
              onClick={(e) => handleItemClick(e, item.path)}
              className={`flex flex-col items-center justify-center h-full min-h-[44px] py-1 px-1 rounded-lg transition-colors cursor-pointer relative ${
                item.isActive
                  ? isLight
                    ? 'text-[#171717] font-bold'
                    : 'text-[#E2D9C8] font-bold'
                  : isLight
                  ? 'text-[#64748b] hover:text-[#111417]'
                  : 'text-[#AAA9A4] hover:text-[#F1F0EC]'
              }`}
              aria-current={item.isActive ? 'page' : undefined}
            >
              {item.isActive && (
                <span
                  className={`absolute top-0 w-8 h-0.5 rounded-full ${
                    isLight ? 'bg-[#111417]' : 'bg-[#E2D9C8]'
                  }`}
                />
              )}
              <Icon
                className={`w-4 h-4 mb-0.5 transition-transform ${
                  item.isActive ? 'scale-105' : 'opacity-70'
                }`}
              />
              <span className="text-[10px] tracking-tight truncate max-w-full">
                {item.label}
              </span>
            </a>
          );
        })}
      </div>
    </nav>
  );
};
