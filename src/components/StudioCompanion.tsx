import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  X,
  Shuffle,
  Smile,
  Minimize2,
  Maximize2,
} from 'lucide-react';

export type CharacterMood = 'idle' | 'happy' | 'surprised' | 'winking' | 'thinking' | 'celebrating';
export type CharacterType = 'archie' | 'pip' | 'emulsion';

const DESIGN_INSPIRATIONS = [
  { text: '“Less, but better.”', author: 'Dieter Rams', tip: 'Try reducing font sizes to give negative space room to breathe.' },
  { text: '“The details are not the details. They make the design.”', author: 'Charles Eames', tip: 'Hairline borders (1px) create refined editorial frames.' },
  { text: '“In the depth of winter, I finally learned that within me lay an invincible summer.”', author: 'Albert Camus', tip: 'Pair an archival serif headline with warm muted paper tones.' },
  { text: '“Simplicity is about subtracting the obvious and adding the meaningful.”', author: 'John Maeda', tip: 'Pick two contrasting weights from the same type family.' },
  { text: '“Good design is as little design as possible.”', author: 'Dieter Rams', tip: 'Try the Projection Room dark mode for high-contrast focus.' },
  { text: '“Typography is two-dimensional architecture.”', author: 'Hermann Zapf', tip: 'Increase line-height to 1.5x on longer reflective quotes.' },
];

const PALETTE_INSPIRATIONS = [
  { name: 'Projection Room', bg: '#191715', ink: '#efe6d8', accent: '#c69d78' },
  { name: 'Archival Paper', bg: '#f1ebdd', ink: '#292620', accent: '#6f4637' },
  { name: 'Tokyo Matcha', bg: '#1e2420', ink: '#e6ede8', accent: '#97ab9b' },
  { name: 'Warm Linen', bg: '#fcfaf6', ink: '#342f2b', accent: '#b08b68' },
  { name: 'Midnights Vinyl', bg: '#101216', ink: '#f3f4f6', accent: '#fbbf24' },
  { name: 'St. Germain', bg: '#231e1a', ink: '#f8f4ee', accent: '#d97706' },
];

export const StudioCompanion: React.FC = () => {
  const [character, setCharacter] = useState<CharacterType>('archie');
  const [mood, setMood] = useState<CharacterMood>('idle');
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('acg_companion_minimized') === 'true';
    }
    return false;
  });
  const [speechText, setSpeechText] = useState('Hi! I’m Archie, your studio companion. Move your cursor to see me look around!');
  const [speechAuthor, setSpeechAuthor] = useState('');

  // Pointer tracking coordinates (-1 to 1 normalized)
  const [pointer, setPointer] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const companionRef = useRef<HTMLDivElement>(null);

  // Mouse / Pointer tracking with smooth interpolation
  useEffect(() => {
    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!companionRef.current) return;
      const rect = companionRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const dx = clientX - centerX;
      const dy = clientY - centerY;
      const dist = Math.hypot(dx, dy) || 1;
      const maxDist = 300;
      const clampDist = Math.min(dist, maxDist) / maxDist;

      setPointer({
        x: (dx / dist) * clampDist,
        y: (dy / dist) * clampDist,
      });
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
    };
  }, []);

  // Natural idle blinking loop
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      if (mood === 'idle') {
        setMood('winking');
        setTimeout(() => setMood('idle'), 220);
      }
    }, 4500 + Math.random() * 2000);
    return () => clearInterval(blinkInterval);
  }, [mood]);

  // Handle companion click / tap
  const handleCharacterClick = () => {
    const moods: CharacterMood[] = ['happy', 'surprised', 'winking', 'celebrating'];
    const nextMood = moods[Math.floor(Math.random() * moods.length)];
    setMood(nextMood);

    if (nextMood === 'celebrating') {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.85, x: 0.88 },
        colors: ['#c69d78', '#efe6d8', '#312c27', '#faf5eb'],
      });
    }

    if (!isOpen && !isMinimized) {
      setIsOpen(true);
    }

    setTimeout(() => {
      setMood('idle');
    }, 1800);
  };

  const handleInspireQuote = () => {
    const insp = DESIGN_INSPIRATIONS[Math.floor(Math.random() * DESIGN_INSPIRATIONS.length)];
    setSpeechText(`${insp.text} — ${insp.tip}`);
    setSpeechAuthor(insp.author);
    setMood('happy');
    setTimeout(() => setMood('idle'), 1500);
  };

  const handleRandomPalette = () => {
    const pal = PALETTE_INSPIRATIONS[Math.floor(Math.random() * PALETTE_INSPIRATIONS.length)];
    setSpeechText(`Try "${pal.name}": Foundation ${pal.bg}, Ink ${pal.ink}, Accent ${pal.accent}. Click to copy!`);
    setSpeechAuthor('Palette Preset');
    setMood('thinking');
    setTimeout(() => setMood('idle'), 1500);
  };

  const handleCheer = () => {
    setMood('celebrating');
    setSpeechText('You’re making something worth keeping! Keep designing!');
    setSpeechAuthor('ACG Cheer');
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.8, x: 0.85 },
      colors: ['#c69d78', '#efe6d8', '#6f4637', '#ffffff'],
    });
    setTimeout(() => setMood('idle'), 2000);
  };

  const toggleMinimize = (min: boolean) => {
    setIsMinimized(min);
    localStorage.setItem('acg_companion_minimized', String(min));
    if (min) setIsOpen(false);
  };

  // Pupil displacement based on pointer
  const pupilOffsetX = pointer.x * 7;
  const pupilOffsetY = pointer.y * 6;
  const headTilt = pointer.x * 0.08;

  return (
    <aside
      aria-label="Interactive Studio Mascot"
      className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40 select-none transition-all duration-300 font-sans"
    >
      {/* Speech / Dialogue Bubble */}
      {isOpen && !isMinimized && (
        <div className="mb-3 w-72 sm:w-80 rounded-2xl border border-[var(--app-border-subtle)] bg-[var(--app-surface)]/95 backdrop-blur-md shadow-2xl p-3.5 text-xs text-[var(--app-text)] animate-in fade-in slide-in-from-bottom-2">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--app-border-subtle)] pb-2 mb-2">
            <div className="flex items-center gap-1.5 font-semibold text-[11px] uppercase tracking-wider text-[var(--app-text-secondary)]">
              <Sparkles className="w-3.5 h-3.5 text-[var(--app-accent)]" />
              <span>Studio Assistant</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCharacter(character === 'archie' ? 'pip' : character === 'pip' ? 'emulsion' : 'archie')}
                className="p-1 rounded hover:bg-[var(--app-surface-secondary)] text-[var(--app-text-secondary)] text-[10px] font-mono cursor-pointer"
                title="Switch Mascot"
              >
                Switch: {character === 'archie' ? 'Archie' : character === 'pip' ? 'Pip' : 'Emulsion'}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded hover:bg-[var(--app-surface-secondary)] text-[var(--app-text-muted)] cursor-pointer"
                title="Close Bubble"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Dialogue Message */}
          <p className="leading-relaxed mb-3 text-[var(--app-text)] font-normal">{speechText}</p>
          {speechAuthor && (
            <p className="text-[10px] font-mono text-[var(--app-accent)] -mt-2 mb-3">
              — {speechAuthor}
            </p>
          )}

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-[var(--app-border-subtle)] text-[11px]">
            <button
              type="button"
              onClick={handleInspireQuote}
              className="py-1 px-1.5 rounded-lg bg-[var(--app-surface-secondary)] hover:bg-[var(--app-surface-secondary)]/80 text-[var(--app-text)] border border-[var(--app-border-subtle)] flex items-center justify-center gap-1 cursor-pointer transition-colors"
              title="Get a design quote"
            >
              <Sparkles className="w-3 h-3 text-[var(--app-accent)]" />
              <span>Inspire</span>
            </button>
            <button
              type="button"
              onClick={handleRandomPalette}
              className="py-1 px-1.5 rounded-lg bg-[var(--app-surface-secondary)] hover:bg-[var(--app-surface-secondary)]/80 text-[var(--app-text)] border border-[var(--app-border-subtle)] flex items-center justify-center gap-1 cursor-pointer transition-colors"
              title="Get color suggestion"
            >
              <Shuffle className="w-3 h-3 text-[var(--app-accent)]" />
              <span>Palette</span>
            </button>
            <button
              type="button"
              onClick={handleCheer}
              className="py-1 px-1.5 rounded-lg bg-[var(--app-accent)]/15 hover:bg-[var(--app-accent)]/25 text-[var(--app-accent)] border border-[var(--app-accent)]/30 flex items-center justify-center gap-1 cursor-pointer transition-colors font-medium"
              title="Celebrate"
            >
              <Smile className="w-3 h-3" />
              <span>Cheer!</span>
            </button>
          </div>
        </div>
      )}

      {/* Mascot Trigger Container */}
      <div
        ref={companionRef}
        className="flex items-end justify-end gap-2"
      >
        {/* Minimized Pill Toggle */}
        {isMinimized ? (
          <button
            type="button"
            onClick={() => toggleMinimize(false)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--app-border-subtle)] bg-[var(--app-surface)] shadow-lg hover:border-[var(--app-accent)]/50 text-xs text-[var(--app-text)] transition-transform hover:scale-105 cursor-pointer"
            title="Expand Studio Companion"
          >
            <span className="w-2 h-2 rounded-full bg-[var(--app-accent)] animate-pulse" />
            <span className="font-medium text-[11px]">Mascot</span>
            <Maximize2 className="w-3 h-3 text-[var(--app-text-muted)]" />
          </button>
        ) : (
          <div className="relative group">
            {/* Interactive Character Avatar */}
            <button
              type="button"
              onClick={handleCharacterClick}
              onDoubleClick={() => setIsOpen((prev) => !prev)}
              aria-label={`Interactive ${character} mascot`}
              className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl border-2 border-[var(--app-border-subtle)] bg-[var(--app-surface)] shadow-xl hover:shadow-2xl hover:border-[var(--app-accent)]/60 cursor-pointer overflow-hidden transition-all duration-200 active:scale-95 flex items-center justify-center"
              style={{
                transform: `rotate(${headTilt}rad)`,
              }}
            >
              {character === 'archie' && (
                <svg
                  viewBox="0 0 100 100"
                  className="w-full h-full"
                  aria-hidden="true"
                >
                  {/* Background Ambient */}
                  <rect width="100" height="100" fill="var(--app-surface-secondary, #24211e)" />

                  {/* Beret / Cap */}
                  <ellipse cx="50" cy="24" rx="30" ry="10" fill="#c69d78" />
                  <circle cx="50" cy="18" r="4" fill="#efe6d8" />

                  {/* Ears */}
                  <polygon points="26,30 36,16 42,32" fill="#c69d78" stroke="#312c27" strokeWidth="1" />
                  <polygon points="74,30 64,16 58,32" fill="#c69d78" stroke="#312c27" strokeWidth="1" />

                  {/* Head */}
                  <rect x="20" y="28" width="60" height="52" rx="26" fill="#efe6d8" stroke="#312c27" strokeWidth="1.5" />

                  {/* Rosy Cheeks */}
                  <ellipse cx="28" cy="56" rx="6" ry="3.5" fill="#c69d78" opacity="0.6" />
                  <ellipse cx="72" cy="56" rx="6" ry="3.5" fill="#c69d78" opacity="0.6" />

                  {/* Eyes / Pupils with dynamic tracking */}
                  {mood === 'happy' || mood === 'celebrating' ? (
                    // Happy Crescent Eyes
                    <>
                      <path d="M 32 50 Q 38 43 44 50" fill="none" stroke="#191715" strokeWidth="2.5" strokeLinecap="round" />
                      <path d="M 56 50 Q 62 43 68 50" fill="none" stroke="#191715" strokeWidth="2.5" strokeLinecap="round" />
                    </>
                  ) : mood === 'winking' ? (
                    // Winking Eye
                    <>
                      <path d="M 32 50 Q 38 43 44 50" fill="none" stroke="#191715" strokeWidth="2.5" strokeLinecap="round" />
                      <circle cx={62 + pupilOffsetX} cy={48 + pupilOffsetY} r="6" fill="#191715" />
                      <circle cx={64 + pupilOffsetX} cy={46 + pupilOffsetY} r="2" fill="#ffffff" />
                    </>
                  ) : (
                    // Normal Round Eyes with Tracking Pupils
                    <>
                      <circle cx="38" cy="48" r="7.5" fill="#ffffff" stroke="#191715" strokeWidth="1" />
                      <circle cx="62" cy="48" r="7.5" fill="#ffffff" stroke="#191715" strokeWidth="1" />
                      <circle cx={38 + pupilOffsetX} cy={48 + pupilOffsetY} r="4.5" fill="#191715" />
                      <circle cx={62 + pupilOffsetX} cy={48 + pupilOffsetY} r="4.5" fill="#191715" />
                      <circle cx={39 + pupilOffsetX} cy={46 + pupilOffsetY} r="1.5" fill="#ffffff" />
                      <circle cx={63 + pupilOffsetX} cy={46 + pupilOffsetY} r="1.5" fill="#ffffff" />
                    </>
                  )}

                  {/* Nose & Mouth */}
                  <ellipse cx="50" cy="54" rx="3.5" ry="2.5" fill="#6f4637" />
                  {mood === 'surprised' ? (
                    <circle cx="50" cy="62" r="3.5" fill="#6f4637" />
                  ) : (
                    <path d="M 46 58 Q 50 63 54 58" fill="none" stroke="#6f4637" strokeWidth="1.5" strokeLinecap="round" />
                  )}

                  {/* Archival Badge Tie */}
                  <rect x="44" y="74" width="12" height="10" rx="2" fill="#c69d78" />
                </svg>
              )}

              {character === 'pip' && (
                <svg
                  viewBox="0 0 100 100"
                  className="w-full h-full"
                  aria-hidden="true"
                >
                  <rect width="100" height="100" fill="var(--app-surface-secondary, #24211e)" />
                  {/* Antenna */}
                  <line x1="50" y1="20" x2="50" y2="30" stroke="#c69d78" strokeWidth="2.5" />
                  <circle cx="50" cy="18" r="3.5" fill="#fbbf24" className="animate-pulse" />

                  {/* Robot Head */}
                  <rect x="22" y="30" width="56" height="48" rx="8" fill="#312c27" stroke="#48413a" strokeWidth="2" />
                  <rect x="28" y="36" width="44" height="28" rx="4" fill="#191715" />

                  {/* Pixel Eyes */}
                  {mood === 'happy' || mood === 'celebrating' ? (
                    <>
                      <path d="M 33 50 L 38 44 L 43 50" fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="square" />
                      <path d="M 57 50 L 62 44 L 67 50" fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="square" />
                    </>
                  ) : (
                    <>
                      <rect x={34 + pupilOffsetX * 0.8} y={44 + pupilOffsetY * 0.8} width="8" height="8" rx="1" fill="#fbbf24" />
                      <rect x={58 + pupilOffsetX * 0.8} y={44 + pupilOffsetY * 0.8} width="8" height="8" rx="1" fill="#fbbf24" />
                    </>
                  )}

                  {/* Pixel Mouth */}
                  <rect x="42" y="70" width="16" height="3" fill="#c69d78" />
                </svg>
              )}

              {character === 'emulsion' && (
                <svg
                  viewBox="0 0 100 100"
                  className="w-full h-full"
                  aria-hidden="true"
                >
                  <rect width="100" height="100" fill="var(--app-surface-secondary, #24211e)" />
                  {/* Cat Ears */}
                  <polygon points="22,40 32,18 48,34" fill="#191715" stroke="#48413a" strokeWidth="1" />
                  <polygon points="78,40 68,18 52,34" fill="#191715" stroke="#48413a" strokeWidth="1" />
                  <polygon points="26,36 34,24 44,34" fill="#c69d78" opacity="0.6" />
                  <polygon points="74,36 66,24 56,34" fill="#c69d78" opacity="0.6" />

                  {/* Head */}
                  <ellipse cx="50" cy="52" rx="34" ry="28" fill="#191715" stroke="#312c27" strokeWidth="1.5" />

                  {/* Cat Eyes */}
                  {mood === 'happy' || mood === 'celebrating' ? (
                    <>
                      <path d="M 32 50 Q 40 44 46 50" fill="none" stroke="#c69d78" strokeWidth="2.5" strokeLinecap="round" />
                      <path d="M 54 50 Q 60 44 68 50" fill="none" stroke="#c69d78" strokeWidth="2.5" strokeLinecap="round" />
                    </>
                  ) : (
                    <>
                      <ellipse cx="38" cy="48" rx="7" ry="8" fill="#c69d78" />
                      <ellipse cx="62" cy="48" rx="7" ry="8" fill="#c69d78" />
                      <ellipse cx={38 + pupilOffsetX} cy={48 + pupilOffsetY} rx="2.5" ry="6" fill="#191715" />
                      <ellipse cx={62 + pupilOffsetX} cy={48 + pupilOffsetY} rx="2.5" ry="6" fill="#191715" />
                    </>
                  )}

                  {/* Whiskers */}
                  <line x1="18" y1="56" x2="32" y2="58" stroke="#48413a" strokeWidth="1" />
                  <line x1="18" y1="62" x2="32" y2="61" stroke="#48413a" strokeWidth="1" />
                  <line x1="82" y1="56" x2="68" y2="58" stroke="#48413a" strokeWidth="1" />
                  <line x1="82" y1="62" x2="68" y2="61" stroke="#48413a" strokeWidth="1" />

                  {/* Nose & Mouth */}
                  <polygon points="48,58 52,58 50,61" fill="#c69d78" />
                  <path d="M 46 62 Q 50 65 54 62" fill="none" stroke="#c69d78" strokeWidth="1" />
                </svg>
              )}
            </button>

            {/* Quick Toggle Controls Overlay */}
            <div className="absolute -top-2 -right-2 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="w-5 h-5 rounded-full bg-[var(--app-surface)] border border-[var(--app-border-subtle)] text-[var(--app-text)] shadow-sm hover:scale-110 flex items-center justify-center text-[10px] cursor-pointer"
                title={isOpen ? 'Hide Speech' : 'Show Speech Bubble'}
              >
                💬
              </button>
              <button
                type="button"
                onClick={() => toggleMinimize(true)}
                className="w-5 h-5 rounded-full bg-[var(--app-surface)] border border-[var(--app-border-subtle)] text-[var(--app-text-muted)] shadow-sm hover:scale-110 flex items-center justify-center cursor-pointer"
                title="Minimize Companion"
              >
                <Minimize2 className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
