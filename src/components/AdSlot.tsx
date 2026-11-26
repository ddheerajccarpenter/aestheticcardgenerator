import React, { useEffect } from 'react';

// Google AdSense Configuration Flag
// Set enabled: true and provide your real verified publisher ID (`ca-pub-...`) when ready to display live ads.
export const ADSENSE_CONFIG = {
  enabled: false,
  publisherId: 'ca-pub-XXXXXXXXXXXXXXXX',
};

export function hasConfiguredAdSense(): boolean {
  return ADSENSE_CONFIG.enabled && /^ca-pub-\d{10,}$/.test(ADSENSE_CONFIG.publisherId);
}

function ensureAdSenseScript(publisherId: string): void {
  if (typeof document === 'undefined') return;
  if (!document.querySelector('meta[name="google-adsense-account"]')) {
    const meta = document.createElement('meta');
    meta.name = 'google-adsense-account';
    meta.content = publisherId;
    document.head.appendChild(meta);
  }
  if (!document.querySelector('script[data-acg-adsense]')) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(publisherId)}`;
    script.crossOrigin = 'anonymous';
    script.dataset.acgAdsense = '1';
    document.head.appendChild(script);
  }
}

interface AdSlotProps {
  slotId?: string;
  format?: 'auto' | 'rectangle' | 'horizontal';
  className?: string;
}

export const AdSlot: React.FC<AdSlotProps> = ({
  slotId = '0000000000',
  format = 'auto',
  className = '',
}) => {
  const active = hasConfiguredAdSense();

  useEffect(() => {
    if (!active) return;
    ensureAdSenseScript(ADSENSE_CONFIG.publisherId);
    try {
      const win = window as Window & { adsbygoogle?: Array<Record<string, unknown>> };
      win.adsbygoogle = win.adsbygoogle || [];
      win.adsbygoogle.push({});
    } catch {
      // Ignore duplicate or blocked ad fills quietly
    }
  }, [active, slotId]);

  if (!active) {
    return null;
  }

  const minHeightClass = format === 'rectangle' ? 'min-h-[250px]' : 'min-h-[100px]';

  return (
    <aside
      aria-label="Advertisement"
      className={`my-6 w-full overflow-hidden rounded-2xl border border-[var(--app-border-subtle)] bg-[var(--app-surface)]/75 px-3 py-4 text-center sm:px-4 ${minHeightClass} flex flex-col items-center justify-center ${className}`}
    >
      <span className="mb-2 block text-[10px] font-mono uppercase tracking-wider text-[var(--app-text-muted)]">
        Advertisement
      </span>
      <ins
        className="adsbygoogle block w-full"
        style={{ display: 'block', minHeight: format === 'rectangle' ? '250px' : '90px' }}
        data-ad-client={ADSENSE_CONFIG.publisherId}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </aside>
  );
};
