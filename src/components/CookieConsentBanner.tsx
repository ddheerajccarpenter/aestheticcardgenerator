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
      // Small timeout so it slides in smoothly after page hydration
      const timer = setTimeout(() => setVisible(true), 1200);
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
      aria-label="Cookie and Privacy Preferences"
      className={`fixed bottom-4 right-4 z-50 max-w-sm w-[calc(100vw-32px)] p-4 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all duration-300 animate-slide-up ${
        isLight
          ? 'bg-white/95 border-[#e2e8f0] text-[#0f172a]'
          : 'bg-[#181d24]/95 border-[#262c36] text-[#e1e2e7]'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-xl shrink-0 ${isLight ? 'bg-[#f1f5f9]' : 'bg-[#222730]'}`}>
          <Cookie className={`w-5 h-5 ${isLight ? 'text-[#d97706]' : 'text-[#fcd535]'}`} />
        </div>
        <div className="flex-1 flex flex-col gap-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm font-heading">
              Privacy &amp; Local Storage
            </span>
            <button
              onClick={() => handleConsent('essential')}
              className="text-[#707a8a] hover:text-current cursor-pointer p-1"
              aria-label="Close cookie banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className={`text-[11px] leading-relaxed ${isLight ? 'text-[#64748b]' : 'text-[#9ca3af]'}`}>
            Aesthetic Card Studio runs 100% locally in your browser. We store your custom fonts and card presets in IndexedDB. Non-essential cookies may be used for Google AdSense partner analytics.
          </p>

          <div className="flex items-center gap-2 pt-2 flex-wrap">
            <button
              onClick={() => handleConsent('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-transform active:scale-95 ${
                isLight
                  ? 'bg-[#0f172a] text-white hover:bg-[#1e293b]'
                  : 'bg-[#fcd535] text-[#0b0e11] hover:bg-[#fde047]'
              }`}
            >
              Accept All
            </button>
            <button
              onClick={() => handleConsent('essential')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border cursor-pointer transition-colors ${
                isLight
                  ? 'border-[#e2e8f0] text-[#475569] hover:bg-[#f1f5f9]'
                  : 'border-[#262c36] text-[#c6c6c7] hover:bg-[#222730]'
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
              className="text-[11px] text-[#707a8a] hover:underline cursor-pointer ml-auto"
            >
              Policy →
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
};
