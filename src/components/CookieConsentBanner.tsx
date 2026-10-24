// src/components/CookieConsentBanner.tsx
import React, { useState, useEffect } from 'react';
import { Cookie, X } from 'lucide-react';

interface CookieConsentBannerProps {
  theme: 'dark' | 'light';
  onNavigate?: (path: string) => void;
}

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({ theme, onNavigate }) => {
  const [visible, setVisible] = useState(false);
  const isLight = theme === 'light';

  useEffect(() => {
    const consent = localStorage.getItem('aesthetic_cookie_consent');
    if (!consent) {
      // Gentle delayed reveal to prevent layout thrashing on load
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleConsent = (level: 'all' | 'essential') => {
    localStorage.setItem('aesthetic_cookie_consent', level);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <aside
      aria-label="Privacy and Storage Preferences"
      role="region"
      className={`fixed z-45 transition-all duration-300 animate-slide-up ${
        /* Positioned above mobile bottom nav on small viewports, docked bottom-right on desktop */
        'bottom-[calc(64px+env(safe-area-inset-bottom,8px))] md:bottom-5 md:right-5 left-3 right-3 md:left-auto md:max-w-md'
      } p-3 sm:p-3.5 rounded-xl border shadow-xl backdrop-blur-xl ${
        isLight
          ? 'bg-white/96 border-[#e2e8f0] text-[#111417]'
          : 'bg-[#181A1E]/96 border-[#34353A] text-[#F1F0EC]'
      }`}
    >
      <div className="flex items-start gap-2.5">
        <div className={`p-1.5 rounded-lg shrink-0 ${isLight ? 'bg-slate-100' : 'bg-white/[0.04]'}`}>
          <Cookie className={`w-4 h-4 ${isLight ? 'text-[#171717]' : 'text-[#E2D9C8]'}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="font-bold text-xs font-heading tracking-tight">
              Privacy &amp; Local Storage
            </span>
            <button
              onClick={() => handleConsent('essential')}
              className={`p-1 rounded-md transition-colors cursor-pointer ${
                isLight ? 'text-slate-400 hover:text-slate-700' : 'text-[#AAA9A4] hover:text-white'
              }`}
              aria-label="Dismiss privacy banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className={`text-[11px] leading-relaxed mb-2.5 ${isLight ? 'text-[#475569]' : 'text-[#AAA9A4]'}`}>
            Runs locally in browser. Fonts &amp; presets saved in IndexedDB. Non-essential cookies support analytics.
          </p>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleConsent('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isLight
                  ? 'bg-[#171717] text-white hover:bg-[#262626]'
                  : 'bg-[#E2D9C8] text-[#171717] hover:bg-[#ECE5D8]'
              }`}
            >
              Accept All
            </button>
            <button
              onClick={() => handleConsent('essential')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                isLight
                  ? 'border-[#cbd5e1] text-[#475569] hover:bg-slate-100'
                  : 'border-[#34353A] text-[#AAA9A4] hover:bg-[#202228]'
              }`}
            >
              Essential Only
            </button>
            <a
              href="/cookies"
              onClick={(e) => {
                if (onNavigate) {
                  e.preventDefault();
                  onNavigate('/cookies');
                }
              }}
              className="text-[11px] text-[#94a3b8] hover:underline cursor-pointer ml-auto"
            >
              Policy →
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
};
