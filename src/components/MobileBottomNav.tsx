import React from 'react';
import { Home, LayoutTemplate, PenTool, BookOpen } from 'lucide-react';

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

  // Unmount completely on editor routes to prevent double-stacked bars (Mobile Screenshot 2 Fix)
  if (hideWhenTyping || currentPath.startsWith('/create') || currentPath.startsWith('/canvas')) {
    return null;
  }

  const navItems = [
    {
      label: 'Home',
      path: '/',
      icon: Home,
      isActive: currentPath === '/',
    },
    {
      label: 'Templates',
      path: '/templates',
      icon: LayoutTemplate,
      isActive: currentPath.startsWith('/templates'),
    },
    {
      label: 'Create',
      path: '/create',
      icon: PenTool,
      isActive: currentPath === '/create' || currentPath === '/canvas',
    },
    {
      label: 'Guides',
      path: '/guides',
      icon: BookOpen,
      isActive: currentPath.startsWith('/guides'),
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
      className={`global-mobile-bottom-nav fixed bottom-0 left-0 right-0 z-40 md:hidden border-t backdrop-blur-xl transition-all duration-200 ${
        isLight
          ? 'bg-white/95 border-[#e2e8f0] text-[#181a20]'
          : 'bg-[#111417]/95 border-[#262c36] text-[#e1e2e7]'
      } pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-4px_20px_rgba(0,0,0,0.15)]`}
    >
      <div className="grid grid-cols-4 h-14 items-center px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.path}
              href={item.path}
              onClick={(e) => handleItemClick(e, item.path)}
              className={`flex flex-col items-center justify-center h-full min-h-[44px] py-1 px-1 rounded-lg transition-colors cursor-pointer relative ${
                item.isActive
                  ? isLight
                    ? 'text-[#0f172a] font-semibold'
                    : 'text-[#fcd535] font-semibold'
                  : isLight
                  ? 'text-[#64748b] hover:text-[#0f172a]'
                  : 'text-[#9ca3af] hover:text-white'
              }`}
              aria-current={item.isActive ? 'page' : undefined}
            >
              {/* Active Indicator Top Glow */}
              {item.isActive && (
                <span
                  className={`absolute top-0 w-8 h-0.5 rounded-full ${
                    isLight ? 'bg-[#0f172a]' : 'bg-[#fcd535]'
                  }`}
                />
              )}
              <Icon
                className={`w-4 h-4 mb-0.5 transition-transform ${
                  item.isActive ? 'scale-110' : 'opacity-80'
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
