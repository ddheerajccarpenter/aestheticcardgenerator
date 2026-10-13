import React from 'react';

// Google AdSense Configuration Flag
// Disabled by default until the site owner registers a verified Google AdSense account
// and supplies their real publisher ID.
export const ADSENSE_CONFIG = {
  enabled: false, // Set to true once verified
  publisherId: 'ca-pub-XXXXXXXXXXXXXXXX', // Site owner must replace with their official publisher ID
};

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
  // If advertising is disabled or no valid publisher ID is present,
  // collapse the slot completely to prevent empty boxes or layout shift.
  if (!ADSENSE_CONFIG.enabled || ADSENSE_CONFIG.publisherId.includes('XXXX')) {
    return null;
  }

  return (
    <aside
      aria-label="Advertisement"
      className={`my-8 p-4 rounded-xl border border-dashed border-[#262c36] bg-[#14171d]/50 flex flex-col items-center justify-center text-center ${className}`}
    >
      <span className="text-[10px] uppercase font-mono tracking-wider text-[#707a8a] mb-2">
        Advertisement
      </span>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={ADSENSE_CONFIG.publisherId}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive="true"
      ></ins>
    </aside>
  );
};
