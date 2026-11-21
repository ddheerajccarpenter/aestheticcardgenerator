import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  X,
  Shuffle,
  Smile,
  Minimize2,
  Maximize2,
  RotateCcw,
  Check,
  Stamp,
} from 'lucide-react';

export type CharacterMood = 'idle' | 'happy' | 'surprised' | 'winking' | 'thinking' | 'celebrating';
export type CharacterType = 'archie' | 'pip' | 'emulsion' | 'komorebi' | 'cosmo' | 'mochi';

export interface CompanionMeta {
  id: CharacterType;
  name: string;
  badge: string;
  role: string;
  greeting: string;
}

export const COMPANION_ROSTER: CompanionMeta[] = [
  {
    id: 'archie',
    name: 'Archie',
    badge: '🐻',
    role: 'Archival Bear',
    greeting: 'Hi! Ready to craft something timeless?',
  },
  {
    id: 'pip',
    name: 'Pip',
    badge: '🤖',
    role: 'Pixel Mascot',
    greeting: 'Beep boop! Let’s make a clean layout.',
  },
  {
    id: 'emulsion',
    name: 'Emulsion',
    badge: '🐱',
    role: 'Studio Cat',
    greeting: 'Purr... Let’s frame your words nicely.',
  },
  {
    id: 'komorebi',
    name: 'Komorebi',
    badge: '🐰',
    role: 'Forest Bunny',
    greeting: 'Take a calm breath — design at your pace.',
  },
  {
    id: 'cosmo',
    name: 'Cosmo',
    badge: '🚀',
    role: 'Star Astronaut',
    greeting: 'Greetings! Let’s make your card shine.',
  },
  {
    id: 'mochi',
    name: 'Mochi',
    badge: '☁️',
    role: 'Cozy Cloud',
    greeting: 'Soft colors make everything feel warmer.',
  },
];

const DESIGN_INSPIRATIONS = [
  { text: '“Less, but better.”', author: 'Dieter Rams', tip: 'Use generous negative space.' },
  { text: '“The details are not the details. They make the design.”', author: 'Charles Eames', tip: 'Hairline borders give quiet structure.' },
  { text: '“Simplicity is about subtracting the obvious and adding the meaningful.”', author: 'John Maeda', tip: 'Pick two contrasting weights from one family.' },
  { text: '“Typography is two-dimensional architecture.”', author: 'Hermann Zapf', tip: 'Try 1.5x line height for quotes.' },
];

const PALETTE_INSPIRATIONS = [
  { name: 'Projection Room', bg: '#191715', ink: '#efe6d8', accent: '#c69d78' },
  { name: 'Archival Paper', bg: '#f1ebdd', ink: '#292620', accent: '#6f4637' },
  { name: 'Tokyo Matcha', bg: '#1e2420', ink: '#e6ede8', accent: '#97ab9b' },
  { name: 'Warm Linen', bg: '#fcfaf6', ink: '#342f2b', accent: '#b08b68' },
  { name: 'Midnights Vinyl', bg: '#101216', ink: '#f3f4f6', accent: '#fbbf24' },
  { name: 'St. Germain', bg: '#231e1a', ink: '#f8f4ee', accent: '#d97706' },
];

interface Position {
  x: number;
  y: number;
}

export const StudioCompanion: React.FC = () => {
  const [character, setCharacter] = useState<CharacterType>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('acg_companion_char') as CharacterType;
      if (saved && COMPANION_ROSTER.some((c) => c.id === saved)) return saved;
    }
    return 'archie';
  });

  const [mood, setMood] = useState<CharacterMood>('idle');
  const [isOpen, setIsOpen] = useState(false);
  const [copiedPalette, setCopiedPalette] = useState(false);
  const [stampedCanvas, setStampedCanvas] = useState(false);
  const [isMinimized, setIsMinimized] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('acg_companion_minimized') === 'true';
    }
    return false;
  });

  const currentMeta = COMPANION_ROSTER.find((c) => c.id === character) || COMPANION_ROSTER[0];
  const [speechText, setSpeechText] = useState(currentMeta.greeting);
  const [speechAuthor, setSpeechAuthor] = useState('');

  // Position state (persisted across reloads and tab closures)
  const [position, setPosition] = useState<Position | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Pointer tracking coordinates (-1 to 1 normalized)
  const [pointer, setPointer] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const companionRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    hasMoved: boolean;
  } | null>(null);
  const lastInteractionTime = useRef(0);
  const hasTriggeredEndScroll = useRef(false);
  const [clickAnim, setClickAnim] = useState(false);
  const [emote, setEmote] = useState<string | null>(null);

  // Measure companion size based on screen
  const getCompanionSize = useCallback(() => {
    if (typeof window === 'undefined') return 64;
    return window.innerWidth >= 768 ? 96 : 64;
  }, []);

  // Strict boundary limit: cannot be dragged over top navbar or behind bottom nav
  const clampCoordinates = useCallback((x: number, y: number): Position => {
    if (typeof window === 'undefined') return { x, y };
    const size = getCompanionSize();
    // Top boundary constraint: never overlap the top header/navbar
    const minY = 72;
    // Bottom boundary constraint: on mobile, stay above bottom navigation bar
    const bottomSafety = window.innerWidth < 768 ? 84 : 20;
    const maxY = Math.max(minY, window.innerHeight - size - bottomSafety);

    // Left and right boundary constraints
    const minX = 12;
    const maxX = Math.max(minX, window.innerWidth - size - 12);

    return {
      x: Math.min(Math.max(minX, x), maxX),
      y: Math.min(Math.max(minY, y), maxY),
    };
  }, [getCompanionSize]);

  // Load saved position on mount, or initialize default bottom-right
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const size = getCompanionSize();
    const saved = localStorage.getItem('acg_companion_pos');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          setPosition(clampCoordinates(parsed.x, parsed.y));
          return;
        }
      } catch {}
    }

    // Default position: bottom-right
    const defaultX = window.innerWidth - size - (window.innerWidth >= 768 ? 24 : 16);
    const defaultY = window.innerHeight - size - (window.innerWidth >= 768 ? 24 : 96);
    setPosition(clampCoordinates(defaultX, defaultY));
  }, [clampCoordinates, getCompanionSize]);

  // Keep within bounds on window resize or orientation change
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => (prev ? clampCoordinates(prev.x, prev.y) : null));
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, [clampCoordinates]);

  // Pointer tracking with smooth eye interpolation (paused when tab hidden)
  useEffect(() => {
    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (document.visibilityState === 'hidden') return;
      if (!companionRef.current) return;
      const rect = companionRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const dx = clientX - centerX;
      const dy = clientY - centerY;
      const dist = Math.hypot(dx, dy) || 1;
      const maxDist = 320;
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

  // Natural idle blinking loop (paused when tab hidden)
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      if (document.visibilityState === 'hidden') return;
      if (mood === 'idle') {
        setMood('winking');
        setTimeout(() => setMood('idle'), 220);
      }
    }, 4500 + Math.random() * 2000);
    return () => clearInterval(blinkInterval);
  }, [mood]);

  // Scroll to bottom reaction: celebrated once per visit to page end
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (ticking || document.visibilityState === 'hidden') return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const scrollBottom = window.innerHeight + window.scrollY;
        const totalHeight = document.documentElement.scrollHeight;
        if (totalHeight > window.innerHeight + 100 && scrollBottom >= totalHeight - 90) {
          if (!hasTriggeredEndScroll.current) {
            hasTriggeredEndScroll.current = true;
            setMood('celebrating');
            setEmote('🎉');
            setSpeechText('You reached the bottom! Ready to craft your card? ✨');
            setSpeechAuthor('');
            setClickAnim(true);
            setTimeout(() => {
              setClickAnim(false);
              setEmote(null);
              setMood('idle');
            }, 2500);
          }
        } else if (scrollBottom < totalHeight - 240) {
          hasTriggeredEndScroll.current = false;
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Theme change celebration: react delightfully when lighting changes
  useEffect(() => {
    const handleThemeSwitched = (e: any) => {
      const nextTheme = e?.detail?.theme;
      setMood('surprised');
      setEmote(nextTheme === 'light' ? '☀️' : '🌙');
      setClickAnim(true);
      setSpeechText(
        nextTheme === 'light'
          ? 'Switched to clean daytime editorial tone! ☀️'
          : 'Switched to cinematic projection dark mode! 🌙'
      );
      setSpeechAuthor('');
      setTimeout(() => {
        setClickAnim(false);
        setEmote(null);
        setMood('happy');
        setTimeout(() => setMood('idle'), 1200);
      }, 1600);
    };

    window.addEventListener('acg:theme-switched', handleThemeSwitched);
    return () => window.removeEventListener('acg:theme-switched', handleThemeSwitched);
  }, []);

  // Handle character switch
  const handleSelectCharacter = (newChar: CharacterType) => {
    setCharacter(newChar);
    const meta = COMPANION_ROSTER.find((c) => c.id === newChar) || COMPANION_ROSTER[0];
    setSpeechText(meta.greeting);
    setSpeechAuthor('');
    setMood('happy');
    localStorage.setItem('acg_companion_char', newChar);
    setTimeout(() => setMood('idle'), 1200);
  };

  // Reset companion to default bottom-right position
  const handleResetPosition = () => {
    const size = getCompanionSize();
    const defaultX = window.innerWidth - size - (window.innerWidth >= 768 ? 24 : 16);
    const defaultY = window.innerHeight - size - (window.innerWidth >= 768 ? 24 : 96);
    const clamped = clampCoordinates(defaultX, defaultY);
    setPosition(clamped);
    localStorage.setItem('acg_companion_pos', JSON.stringify(clamped));
  };

  // Drag interaction handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Ignore drags triggered on interactive bubble inputs/buttons
    if ((e.target as HTMLElement).closest('button, input, textarea, a')) return;

    const currentPos = position || {
      x: window.innerWidth - 100,
      y: window.innerHeight - 100,
    };

    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: currentPos.x,
      origY: currentPos.y,
      hasMoved: false,
    };

    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;

    if (Math.hypot(dx, dy) > 4) {
      dragRef.current.hasMoved = true;
    }

    const next = clampCoordinates(dragRef.current.origX + dx, dragRef.current.origY + dy);
    setPosition(next);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    const wasMoved = dragRef.current.hasMoved;
    dragRef.current = null;
    setIsDragging(false);

    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}

    if (position) {
      localStorage.setItem('acg_companion_pos', JSON.stringify(position));
    }

    // Normal tap toggles options dialog, NEVER triggers cheering
    if (!wasMoved) {
      handleCharacterClick();
    }
  };

  const EMOTE_LIST = ['✨', '💖', '🎨', '💡', '🌟', '🎉'];

  // Handle character click / tap: Debounced against double-fire pointerup+click events, cycles expressions, triggers squash-and-stretch
  const handleCharacterClick = () => {
    const now = Date.now();
    if (now - lastInteractionTime.current < 280) return;
    lastInteractionTime.current = now;

    // Trigger squash & stretch bounce animation
    setClickAnim(true);
    setTimeout(() => setClickAnim(false), 400);

    // Pick a floating emote
    const nextEmote = EMOTE_LIST[Math.floor(Math.random() * EMOTE_LIST.length)];
    setEmote(nextEmote);
    setTimeout(() => setEmote(null), 900);

    // Playfully cycle expression mood
    setMood((prev) => {
      if (prev === 'idle') return 'happy';
      if (prev === 'happy') return 'winking';
      if (prev === 'winking') return 'surprised';
      if (prev === 'surprised') return 'thinking';
      return 'happy';
    });

    setIsOpen((prev) => !prev);
    setTimeout(() => {
      setMood('idle');
    }, 1400);
  };

  const handleInspireQuote = () => {
    const insp = DESIGN_INSPIRATIONS[Math.floor(Math.random() * DESIGN_INSPIRATIONS.length)];
    setSpeechText(`${insp.text} — ${insp.tip}`);
    setSpeechAuthor(insp.author);
    setMood('happy');
    setTimeout(() => setMood('idle'), 1500);
  };

  const handleRandomPalette = async () => {
    const pal = PALETTE_INSPIRATIONS[Math.floor(Math.random() * PALETTE_INSPIRATIONS.length)];
    setSpeechText(`Try "${pal.name}": Foundation ${pal.bg}, Ink ${pal.ink}, Accent ${pal.accent}.`);
    setSpeechAuthor('Palette');
    setMood('thinking');

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(`${pal.bg}, ${pal.ink}, ${pal.accent}`);
        setCopiedPalette(true);
        setTimeout(() => setCopiedPalette(false), 2000);
      }
    } catch {}

    setTimeout(() => setMood('idle'), 1500);
  };

  // Stamp character directly onto card canvas
  const handleAddToCanvas = () => {
    window.dispatchEvent(
      new CustomEvent('acg:add-mascot-sticker', {
        detail: { character },
      })
    );
    localStorage.setItem('acg_staged_sticker', character);
    setStampedCanvas(true);
    setSpeechText(`Added ${currentMeta.name} to card!`);
    setMood('happy');
    setTimeout(() => {
      setStampedCanvas(false);
      setMood('idle');
    }, 2000);
  };

  // Explicit Cheer: ONLY triggers when clicking this specific button
  const handleCheer = () => {
    setMood('celebrating');
    setSpeechText('You’re making something worth keeping!');
    setSpeechAuthor('');
    confetti({
      particleCount: 45,
      spread: 60,
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

  // Determine speech bubble placement so it never runs off-screen
  const isNearTop = (position?.y ?? 600) < 220;
  const isRightSide = typeof window !== 'undefined' ? (position?.x ?? 300) > window.innerWidth / 2 : true;

  return (
    <aside
      ref={companionRef}
      aria-label="Interactive Studio Companion"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        position: 'fixed',
        left: position ? `${position.x}px` : undefined,
        top: position ? `${position.y}px` : undefined,
        bottom: position ? undefined : '5rem',
        right: position ? undefined : '1rem',
        touchAction: 'none',
      }}
      className={`fixed z-40 select-none font-sans transition-shadow ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
    >
      {/* Speech / Dialogue Bubble (Intelligently placed above or below) */}
      {isOpen && !isMinimized && (
        <div
          className={`absolute ${
            isNearTop ? 'top-full mt-2' : 'bottom-full mb-2'
          } ${
            isRightSide ? 'right-0' : 'left-0'
          } w-72 sm:w-80 rounded-2xl border border-[var(--app-border-subtle)] bg-[var(--app-surface)]/95 backdrop-blur-md shadow-2xl p-3 text-xs text-[var(--app-text)] animate-in fade-in slide-in-from-bottom-2`}
        >
          {/* Header with Close, Reset, and Minimize */}
          <div className="flex items-center justify-between border-b border-[var(--app-border-subtle)] pb-2 mb-2">
            <div className="flex items-center gap-1.5 font-semibold text-[11px] uppercase tracking-wider text-[var(--app-text-secondary)]">
              <Sparkles className="w-3.5 h-3.5 text-[var(--app-accent)]" />
              <span>Studio Companion</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleResetPosition}
                className="p-1 rounded hover:bg-[var(--app-surface-secondary)] text-[var(--app-text-muted)] hover:text-[var(--app-text)] cursor-pointer"
                title="Reset position"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => toggleMinimize(true)}
                className="p-1 rounded hover:bg-[var(--app-surface-secondary)] text-[var(--app-text-muted)] hover:text-[var(--app-text)] cursor-pointer"
                title="Minimize"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded hover:bg-[var(--app-surface-secondary)] text-[var(--app-text-muted)] hover:text-[var(--app-text)] cursor-pointer"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Character Switcher Roster (6 Joyful companions) */}
          <div className="flex items-center justify-between gap-1 mb-2 p-1 rounded-xl bg-[var(--app-surface-secondary)]/50 border border-[var(--app-border-subtle)]">
            {COMPANION_ROSTER.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectCharacter(item.id)}
                className={`flex-1 py-1 px-1 rounded-lg text-[10px] font-medium flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                  character === item.id
                    ? 'bg-[var(--app-surface)] text-[var(--app-accent)] shadow-xs border border-[var(--app-accent)]/30 scale-105'
                    : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
                }`}
                title={`${item.name} (${item.role})`}
              >
                <span className="text-xs leading-none">{item.badge}</span>
                <span className="truncate max-w-full text-[9px]">{item.name}</span>
              </button>
            ))}
          </div>

          {/* Dialogue Message */}
          <p className="leading-snug mb-2 text-[var(--app-text)] font-normal">{speechText}</p>
          {speechAuthor && (
            <p className="text-[10px] font-mono text-[var(--app-accent)] -mt-1 mb-2">
              — {speechAuthor}
            </p>
          )}

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-4 gap-1 pt-1.5 border-t border-[var(--app-border-subtle)] text-[10px]">
            <button
              type="button"
              onClick={handleAddToCanvas}
              className={`py-1 px-1 rounded-lg border flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-colors ${
                stampedCanvas
                  ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/40'
                  : 'bg-[var(--app-surface-secondary)] text-[var(--app-text)] border-[var(--app-border-subtle)] hover:bg-[var(--app-surface-secondary)]/80'
              }`}
              title="Add this character as a sticker on your card"
            >
              {stampedCanvas ? <Check className="w-3 h-3 text-emerald-500" /> : <Stamp className="w-3 h-3 text-[var(--app-accent)]" />}
              <span>{stampedCanvas ? 'Added!' : 'Add to Card'}</span>
            </button>

            <button
              type="button"
              onClick={handleInspireQuote}
              className="py-1 px-1 rounded-lg bg-[var(--app-surface-secondary)] hover:bg-[var(--app-surface-secondary)]/80 text-[var(--app-text)] border border-[var(--app-border-subtle)] flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-colors"
              title="Get a design quote"
            >
              <Sparkles className="w-3 h-3 text-[var(--app-accent)]" />
              <span>Inspire</span>
            </button>

            <button
              type="button"
              onClick={handleRandomPalette}
              className="py-1 px-1 rounded-lg bg-[var(--app-surface-secondary)] hover:bg-[var(--app-surface-secondary)]/80 text-[var(--app-text)] border border-[var(--app-border-subtle)] flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-colors"
              title="Copy color palette"
            >
              {copiedPalette ? (
                <>
                  <Check className="w-3 h-3 text-emerald-500" />
                  <span className="text-emerald-500">Copied!</span>
                </>
              ) : (
                <>
                  <Shuffle className="w-3 h-3 text-[var(--app-accent)]" />
                  <span>Palette</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleCheer}
              className="py-1 px-1 rounded-lg bg-[var(--app-accent)]/15 hover:bg-[var(--app-accent)]/25 text-[var(--app-accent)] border border-[var(--app-accent)]/30 flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-colors font-medium"
              title="Celebrate with confetti"
            >
              <Smile className="w-3 h-3" />
              <span>Cheer!</span>
            </button>
          </div>
        </div>
      )}

      {/* Mascot Container - Clean Avatar with NO overlying buttons on the character */}
      <div className="flex items-end justify-end gap-2">
        {/* Minimized Pill Toggle */}
        {isMinimized ? (
          <button
            type="button"
            onClick={() => toggleMinimize(false)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--app-border-subtle)] bg-[var(--app-surface)] shadow-lg hover:border-[var(--app-accent)]/50 text-xs text-[var(--app-text)] transition-transform hover:scale-105 cursor-pointer"
            title="Expand Studio Companion"
          >
            <span className="text-xs">{currentMeta.badge}</span>
            <span className="font-medium text-[11px]">{currentMeta.name}</span>
            <Maximize2 className="w-3 h-3 text-[var(--app-text-muted)]" />
          </button>
        ) : (
          <div className="relative">
            {/* Floating Emote on Click, Scroll, or Theme Change */}
            {emote && (
              <div
                aria-hidden="true"
                className="absolute -top-7 left-1/2 -translate-x-1/2 text-xl pointer-events-none animate-float-emote z-30"
              >
                {emote}
              </div>
            )}

            {/* Clean Interactive Character Avatar (NO floating buttons sitting on it) */}
            <div
              onClick={handleCharacterClick}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCharacterClick();
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={`Interactive ${currentMeta.name} companion. Click to open options.`}
              aria-expanded={isOpen}
              className={`relative w-16 h-16 md:w-24 md:h-24 rounded-2xl md:rounded-3xl border-2 border-[var(--app-border-subtle)] bg-[var(--app-surface)] shadow-xl hover:shadow-2xl hover:border-[var(--app-accent)]/60 overflow-hidden transition-all duration-200 flex items-center justify-center cursor-pointer select-none ${
                clickAnim ? 'animate-companion-squash' : !isDragging ? 'animate-companion-breathe' : ''
              }`}
              style={{
                transform: `rotate(${headTilt}rad)`,
              }}
            >
              {character === 'archie' && (
                <svg viewBox="0 0 100 100" className="w-full h-full" aria-hidden="true">
                  <rect width="100" height="100" fill="var(--app-surface-secondary, #24211e)" />
                  <ellipse cx="50" cy="24" rx="30" ry="10" fill="#c69d78" />
                  <circle cx="50" cy="18" r="4" fill="#efe6d8" />
                  <polygon points="26,30 36,16 42,32" fill="#c69d78" stroke="#312c27" strokeWidth="1" />
                  <polygon points="74,30 64,16 58,32" fill="#c69d78" stroke="#312c27" strokeWidth="1" />
                  <rect x="20" y="28" width="60" height="52" rx="26" fill="#efe6d8" stroke="#312c27" strokeWidth="1.5" />
                  <ellipse cx="28" cy="56" rx="6" ry="3.5" fill="#c69d78" opacity="0.6" />
                  <ellipse cx="72" cy="56" rx="6" ry="3.5" fill="#c69d78" opacity="0.6" />
                  {mood === 'happy' || mood === 'celebrating' ? (
                    <>
                      <path d="M 32 50 Q 38 43 44 50" fill="none" stroke="#191715" strokeWidth="2.5" strokeLinecap="round" />
                      <path d="M 56 50 Q 62 43 68 50" fill="none" stroke="#191715" strokeWidth="2.5" strokeLinecap="round" />
                    </>
                  ) : mood === 'winking' ? (
                    <>
                      <path d="M 32 50 Q 38 43 44 50" fill="none" stroke="#191715" strokeWidth="2.5" strokeLinecap="round" />
                      <circle cx={62 + pupilOffsetX} cy={48 + pupilOffsetY} r="6" fill="#191715" />
                      <circle cx={64 + pupilOffsetX} cy={46 + pupilOffsetY} r="2" fill="#ffffff" />
                    </>
                  ) : (
                    <>
                      <circle cx="38" cy="48" r="7.5" fill="#ffffff" stroke="#191715" strokeWidth="1" />
                      <circle cx="62" cy="48" r="7.5" fill="#ffffff" stroke="#191715" strokeWidth="1" />
                      <circle cx={38 + pupilOffsetX} cy={48 + pupilOffsetY} r="4.5" fill="#191715" />
                      <circle cx={62 + pupilOffsetX} cy={48 + pupilOffsetY} r="4.5" fill="#191715" />
                      <circle cx={39 + pupilOffsetX} cy={46 + pupilOffsetY} r="1.5" fill="#ffffff" />
                      <circle cx={63 + pupilOffsetX} cy={46 + pupilOffsetY} r="1.5" fill="#ffffff" />
                    </>
                  )}
                  <ellipse cx="50" cy="54" rx="3.5" ry="2.5" fill="#6f4637" />
                  {mood === 'surprised' ? (
                    <circle cx="50" cy="62" r="3.5" fill="#6f4637" />
                  ) : (
                    <path d="M 46 58 Q 50 63 54 58" fill="none" stroke="#6f4637" strokeWidth="1.5" strokeLinecap="round" />
                  )}
                  <rect x="44" y="74" width="12" height="10" rx="2" fill="#c69d78" />
                </svg>
              )}

              {character === 'pip' && (
                <svg viewBox="0 0 100 100" className="w-full h-full" aria-hidden="true">
                  <rect width="100" height="100" fill="var(--app-surface-secondary, #24211e)" />
                  <line x1="50" y1="20" x2="50" y2="30" stroke="#c69d78" strokeWidth="2.5" />
                  <circle cx="50" cy="18" r="3.5" fill="#fbbf24" className="animate-pulse" />
                  <rect x="22" y="30" width="56" height="48" rx="8" fill="#312c27" stroke="#48413a" strokeWidth="2" />
                  <rect x="28" y="36" width="44" height="28" rx="4" fill="#191715" />
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
                  <rect x="42" y="70" width="16" height="3" fill="#c69d78" />
                </svg>
              )}

              {character === 'emulsion' && (
                <svg viewBox="0 0 100 100" className="w-full h-full" aria-hidden="true">
                  <rect width="100" height="100" fill="var(--app-surface-secondary, #24211e)" />
                  <polygon points="22,40 32,18 48,32" fill="#191715" stroke="#48413a" strokeWidth="1" />
                  <polygon points="74,38 66,18 52,32" fill="#191715" stroke="#48413a" strokeWidth="1" />
                  <polygon points="26,36 34,24 44,32" fill="#c69d78" opacity="0.6" />
                  <polygon points="70,34 64,24 56,32" fill="#c69d78" opacity="0.6" />
                  <ellipse cx="50" cy="52" rx="34" ry="28" fill="#191715" stroke="#312c27" strokeWidth="1.5" />
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
                  <line x1="18" y1="56" x2="32" y2="58" stroke="#48413a" strokeWidth="1" />
                  <line x1="18" y1="62" x2="32" y2="61" stroke="#48413a" strokeWidth="1" />
                  <line x1="82" y1="56" x2="68" y2="58" stroke="#48413a" strokeWidth="1" />
                  <line x1="82" y1="62" x2="68" y2="61" stroke="#48413a" strokeWidth="1" />
                  <polygon points="48,58 52,58 50,61" fill="#c69d78" />
                  <path d="M 46 62 Q 50 65 54 62" fill="none" stroke="#c69d78" strokeWidth="1" />
                </svg>
              )}

              {character === 'komorebi' && (
                <svg viewBox="0 0 100 100" className="w-full h-full" aria-hidden="true">
                  <rect width="100" height="100" fill="var(--app-surface-secondary, #1e2621)" />
                  <ellipse cx="36" cy="24" rx="8" ry="18" fill="#e8ede9" stroke="#303d35" strokeWidth="1.5" />
                  <ellipse cx="64" cy="24" rx="8" ry="18" fill="#e8ede9" stroke="#303d35" strokeWidth="1.5" />
                  <ellipse cx="36" cy="25" rx="4.5" ry="12" fill="#f4b8b8" opacity="0.6" />
                  <ellipse cx="64" cy="25" rx="4.5" ry="12" fill="#f4b8b8" opacity="0.6" />
                  <path d="M 48 30 Q 42 22 47 16 Q 52 22 48 30 Z" fill="#97ab9b" />
                  <path d="M 50 30 Q 56 20 52 14 Q 48 20 50 30 Z" fill="#84a98c" />
                  <ellipse cx="50" cy="56" rx="30" ry="24" fill="#e8ede9" stroke="#303d35" strokeWidth="1.5" />
                  {mood === 'happy' || mood === 'celebrating' ? (
                    <>
                      <path d="M 33 54 Q 38 48 43 54" fill="none" stroke="#1a201c" strokeWidth="2.5" strokeLinecap="round" />
                      <path d="M 57 54 Q 62 48 67 54" fill="none" stroke="#1a201c" strokeWidth="2.5" strokeLinecap="round" />
                    </>
                  ) : (
                    <>
                      <ellipse cx={38 + pupilOffsetX * 0.6} cy={54 + pupilOffsetY * 0.6} rx="4" ry="5.5" fill="#1a201c" />
                      <ellipse cx={62 + pupilOffsetX * 0.6} cy={54 + pupilOffsetY * 0.6} rx="4" ry="5.5" fill="#1a201c" />
                      <circle cx={39.5 + pupilOffsetX * 0.6} cy={52 + pupilOffsetY * 0.6} r="1.5" fill="#ffffff" />
                      <circle cx={63.5 + pupilOffsetX * 0.6} cy={52 + pupilOffsetY * 0.6} r="1.5" fill="#ffffff" />
                    </>
                  )}
                  <circle cx="31" cy="61" r="5" fill="#f4b8b8" opacity="0.7" />
                  <circle cx="69" cy="61" r="5" fill="#f4b8b8" opacity="0.7" />
                  <polygon points="48,59 52,59 50,62" fill="#e07a7a" />
                  <path d="M 46 64 Q 50 67 54 64" fill="none" stroke="#303d35" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              )}

              {character === 'cosmo' && (
                <svg viewBox="0 0 100 100" className="w-full h-full" aria-hidden="true">
                  <rect width="100" height="100" fill="var(--app-surface-secondary, #131722)" />
                  <line x1="50" y1="12" x2="50" y2="24" stroke="#fbbf24" strokeWidth="2" />
                  <polygon points="50,6 52,11 57,11 53,14 55,19 50,16 45,19 47,14 43,11 48,11" fill="#fbbf24" />
                  <rect x="20" y="24" width="60" height="54" rx="20" fill="#242c40" stroke="#3d4b6c" strokeWidth="1.5" />
                  <rect x="26" y="30" width="48" height="34" rx="14" fill="#1a2030" stroke="#fbbf24" strokeWidth="1.2" />
                  <path d="M 32 34 Q 50 32 64 38" fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.4" strokeLinecap="round" />
                  {mood === 'happy' || mood === 'celebrating' ? (
                    <>
                      <path d="M 35 47 Q 40 41 45 47" fill="none" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" />
                      <path d="M 55 47 Q 60 41 65 47" fill="none" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" />
                    </>
                  ) : (
                    <>
                      <circle cx={40 + pupilOffsetX * 0.6} cy={46 + pupilOffsetY * 0.6} r="4.5" fill="#60a5fa" />
                      <circle cx={60 + pupilOffsetX * 0.6} cy={46 + pupilOffsetY * 0.6} r="4.5" fill="#60a5fa" />
                      <circle cx={41.5 + pupilOffsetX * 0.6} cy={44.5 + pupilOffsetY * 0.6} r="1.5" fill="#ffffff" />
                      <circle cx={61.5 + pupilOffsetX * 0.6} cy={44.5 + pupilOffsetY * 0.6} r="1.5" fill="#ffffff" />
                    </>
                  )}
                  <path d="M 46 54 Q 50 58 54 54" fill="none" stroke="#fbbf24" strokeWidth="1.6" strokeLinecap="round" />
                  <circle cx="50" cy="70" r="3" fill="#ef4444" />
                </svg>
              )}

              {character === 'mochi' && (
                <svg viewBox="0 0 100 100" className="w-full h-full" aria-hidden="true">
                  <rect width="100" height="100" fill="var(--app-surface-secondary, #241b22)" />
                  <circle cx="34" cy="54" r="18" fill="#fdfaf6" />
                  <circle cx="66" cy="54" r="18" fill="#fdfaf6" />
                  <circle cx="44" cy="40" r="18" fill="#fdfaf6" />
                  <circle cx="58" cy="40" r="16" fill="#fdfaf6" />
                  <rect x="34" y="48" width="32" height="24" fill="#fdfaf6" />
                  {mood === 'happy' || mood === 'celebrating' ? (
                    <>
                      <path d="M 35 48 Q 40 42 45 48" fill="none" stroke="#382732" strokeWidth="2.5" strokeLinecap="round" />
                      <path d="M 55 48 Q 60 42 65 48" fill="none" stroke="#382732" strokeWidth="2.5" strokeLinecap="round" />
                    </>
                  ) : (
                    <>
                      <circle cx={38 + pupilOffsetX * 0.6} cy={48 + pupilOffsetY * 0.6} r="3.5" fill="#382732" />
                      <circle cx={62 + pupilOffsetX * 0.6} cy={48 + pupilOffsetY * 0.6} r="3.5" fill="#382732" />
                      <circle cx={39 + pupilOffsetX * 0.6} cy={47 + pupilOffsetY * 0.6} r="1.2" fill="#ffffff" />
                      <circle cx={63 + pupilOffsetX * 0.6} cy={47 + pupilOffsetY * 0.6} r="1.2" fill="#ffffff" />
                    </>
                  )}
                  <circle cx="33" cy="57" r="5" fill="#f472b6" opacity="0.6" />
                  <circle cx="67" cy="57" r="5" fill="#f472b6" opacity="0.6" />
                  <path d="M 46 57 Q 50 63 54 57" fill="none" stroke="#e11d48" strokeWidth="2" strokeLinecap="round" />
                  <polygon points="50,22 52,27 57,27 53,30 55,35 50,32 45,35 47,30 43,27 48,27" fill="#fbbf24" />
                </svg>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
