import React, { useEffect, useState } from 'react';
import { subscribeAmbient, type AmbientTones } from '../engines/ambientAtmosphere';

interface AmbientAtmosphereLayerProps {
  theme: 'dark' | 'light';
}

export const AmbientAtmosphereLayer: React.FC<AmbientAtmosphereLayerProps> = ({ theme }) => {
  const [ambientState, setAmbientState] = useState<{ tones: AmbientTones; enabled: boolean }>(() => ({
    tones: {
      primary: theme === 'dark' ? '#c69d78' : '#6f4637',
      secondary: theme === 'dark' ? '#938677' : '#c9beaf',
      neutral: theme === 'dark' ? '#24211e' : '#faf5eb',
    },
    enabled: true,
  }));

  useEffect(() => {
    return subscribeAmbient((tones, enabled) => {
      setAmbientState({ tones, enabled });
    });
  }, []);

  if (!ambientState.enabled) return null;

  const isLight = theme === 'light';
  const c1 = ambientState.tones.primary;
  const c2 = ambientState.tones.secondary;
  const opacity = isLight ? 0.02 : 0.03;

  return (
    <div
      aria-hidden="true"
      className="acg-ambient-atmosphere pointer-events-none fixed inset-0 z-0 overflow-hidden transition-opacity duration-300 ease-out"
      style={{
        opacity,
        background: `
          radial-gradient(ellipse 70% 60% at 50% 30%, ${c1} 0%, transparent 70%),
          radial-gradient(ellipse 60% 50% at 80% 80%, ${c2} 0%, transparent 75%)
        `,
      }}
    />
  );
};
