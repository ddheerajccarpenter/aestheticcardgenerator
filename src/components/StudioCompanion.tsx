import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  X,
  Shuffle,
  Smile,
  Minimize2,
  RotateCcw,
  Check,
  Stamp,
  Cloud,
} from 'lucide-react';
import { isReducedMotion, useMotionPaused } from '../utils/motion';

export type CharacterMood = 'idle' | 'happy' | 'surprised' | 'winking' | 'thinking' | 'celebrating';
export type CharacterType = 'mochi';

export interface CompanionMeta {
  id: CharacterType;
  name: string;
  badge: string;
  role: string;
  greeting: string;
}

export const COMPANION_ROSTER: CompanionMeta[] = [
  {
    id: 'mochi',
    name: 'Mochi',
    badge: 'Mochi',
    role: 'Studio guide',
    greeting: 'Warm tones keep cards readable on paper and dark backgrounds.',
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
  const character: CharacterType = 'mochi';

  const [mood, setMood] = useState<CharacterMood>('idle');
  const [isOpen, setIsOpen] = useState(false);
  const [copiedPalette, setCopiedPalette] = useState(false);
  const [stampedCanvas, setStampedCanvas] = useState(false);
  const [isMinimized, setIsMinimized] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('acg_companion_minimized');
      // Default to compact corner pill so interactive cards, inputs, and inspectors remain unobstructed
      return saved !== 'false';
    }
    return true;
  });

  const currentMeta = COMPANION_ROSTER[0];
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
  const [stampAnim, setStampAnim] = useState(false);
  const [wiggleAnim, setWiggleAnim] = useState(false);
  const [emote, setEmote] = useState<string | null>(null);
  const motionPaused = useMotionPaused();

  // Measure companion size based on screen & minimized state
  const getCompanionSize = useCallback(() => {
    if (typeof window === 'undefined') return 64;
    if (isMinimized) return 44;
    return window.innerWidth >= 768 ? 96 : 64;
  }, [isMinimized]);

  // Strict boundary limit: cannot be dragged over top navbar or behind bottom nav / canvas tablet bottom bar
  const clampCoordinates = useCallback((x: number, y: number): Position => {
    if (typeof window === 'undefined') return { x, y };
    const size = getCompanionSize();
    // Top boundary constraint: never overlap the top header/navbar
    const minY = 72;
    // Bottom boundary constraint: stay above mobile bottom navigation bar and canvas <1024px bottom bar
    const bottomSafety = window.innerWidth < 768 ? 84 : 20;
    const effectiveBottomSafety = window.location.pathname.startsWith('/canvas') && window.innerWidth < 1024 ? 84 : bottomSafety;
    const maxY = Math.max(minY, window.innerHeight - size - effectiveBottomSafety);

    // Left and right boundary constraints
    const minX = 12;
    const maxX = Math.max(minX, window.innerWidth - size - 12);

    return {
      x: Math.min(Math.max(minX, x), maxX),
      y: Math.min(Math.max(minY, y), maxY),
    };
  }, [getCompanionSize]);

  // Load saved position on mount, or initialize non-occluding default corner
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

    // Dock bottom-left on Canvas Studio (and mobile Create Studio) so right-side tools/inspectors stay clear
    const path = window.location.pathname;
    const isDesktopCanvas = path.startsWith('/canvas') && window.innerWidth >= 1024;
    const isMobileStudio = (path.startsWith('/canvas') || path.startsWith('/create')) && window.innerWidth < 1024;
    const initBottomSafety = window.innerWidth < 768 || (path.startsWith('/canvas') && window.innerWidth < 1024) ? 84 : 16;
    const defaultX = isDesktopCanvas
      ? 10
      : isMobileStudio
        ? 12
        : window.innerWidth - size - (window.innerWidth >= 768 ? 20 : 12);
    const defaultY = window.innerHeight - size - initBottomSafety;
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

  // Pointer tracking with smooth eye interpolation (skipped while minimized or motion paused to avoid idle mousemove work)
  useEffect(() => {
    if (isMinimized || motionPaused || mood === 'happy' || mood === 'celebrating') {
      return;
    }

    let rafId: number | null = null;
    let cachedCenterX = window.innerWidth - 60;
    let cachedCenterY = window.innerHeight - 80;

    const refreshBounds = () => {
      if (!companionRef.current) return;
      const rect = companionRef.current.getBoundingClientRect();
      cachedCenterX = rect.left + rect.width / 2;
      cachedCenterY = rect.top + rect.height / 2;
    };
    refreshBounds();

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (document.visibilityState === 'hidden') return;
      if (rafId !== null) return;

      const touch = 'touches' in e ? e.touches[0] : null;
      const clientX = touch ? touch.clientX : (e as MouseEvent).clientX;
      const clientY = touch ? touch.clientY : (e as MouseEvent).clientY;

      rafId = requestAnimationFrame(() => {
        rafId = null;
        if (!companionRef.current) return;

        const dx = clientX - cachedCenterX;
        const dy = clientY - cachedCenterY;
        const dist = Math.hypot(dx, dy) || 1;
        const maxDist = 320;
        const clampDist = Math.min(dist, maxDist) / maxDist;
        const nextX = (dx / dist) * clampDist;
        const nextY = (dy / dist) * clampDist;

        setPointer((prev) =>
          Math.abs(prev.x - nextX) < 0.03 && Math.abs(prev.y - nextY) < 0.03
            ? prev
            : { x: nextX, y: nextY }
        );
      });
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('resize', refreshBounds, { passive: true });
    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('resize', refreshBounds);
    };
  }, [isMinimized, motionPaused, mood, position]);

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

  // Idle curiosity wiggle (paused when tab hidden, dragging, or motion paused)
  useEffect(() => {
    if (motionPaused) return;
    const wiggleInterval = setInterval(() => {
      if (document.visibilityState === 'hidden' || isReducedMotion()) return;
      if (mood === 'idle' && !isDragging) {
        setWiggleAnim(true);
        setTimeout(() => setWiggleAnim(false), 520);
      }
    }, 9000 + Math.random() * 4000);
    return () => clearInterval(wiggleInterval);
  }, [mood, isDragging, motionPaused]);

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
            setEmote('Ready');
            setSpeechText('You reached the bottom! Open Canvas or quick maker to start.');
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

  // Theme change confirmation
  useEffect(() => {
    const handleThemeSwitched = (e: any) => {
      const nextTheme = e?.detail?.theme;
      setMood('surprised');
      setEmote(nextTheme === 'light' ? 'Light' : 'Dark');
      setClickAnim(true);
      setSpeechText(
        nextTheme === 'light'
          ? 'Archival light mode active'
          : 'Projection dark mode active'
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
    const drag = dragRef.current;
    if (!drag) return;
    const wasMoved = drag.hasMoved;
    dragRef.current = null;
    setIsDragging(false);

    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}

    if (wasMoved) {
      const finalPos = clampCoordinates(
        drag.origX + (e.clientX - drag.startX),
        drag.origY + (e.clientY - drag.startY)
      );
      setPosition(finalPos);
      localStorage.setItem('acg_companion_pos', JSON.stringify(finalPos));
      return;
    }

    // Normal tap toggles options dialog, NEVER triggers cheering
    handleCharacterClick();
  };

  const EMOTE_LIST = ['Balanced', 'Crisp', 'Layered', 'Warm', 'Steady'];

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
    setSpeechText(`${insp.text} ${insp.tip}`);
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

  // Stamp character directly onto card canvas with tactile stamp animation
  const handleAddToCanvas = () => {
    window.dispatchEvent(
      new CustomEvent('acg:add-mascot-sticker', {
        detail: { character },
      })
    );
    localStorage.setItem('acg_staged_sticker', character);
    setStampedCanvas(true);
    setStampAnim(true);
    setEmote('Stamped');
    setSpeechText(`Added ${currentMeta.name} to card`);
    setMood('happy');
    setTimeout(() => setStampAnim(false), 440);
    setTimeout(() => {
      setStampedCanvas(false);
      setMood('idle');
      setEmote(null);
    }, 2000);
  };

  // Explicit Cheer: ONLY triggers when clicking this specific button
  const handleCheer = () => {
    setMood('celebrating');
    setSpeechText('Card updated');
    setSpeechAuthor('');
    setEmote('Done');
    setClickAnim(true);
    setTimeout(() => setClickAnim(false), 400);
    if (!isReducedMotion()) {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.8, x: 0.85 },
        colors: ['#c69d78', '#efe6d8', '#6f4637', '#ffffff'],
      });
    }
    setTimeout(() => {
      setMood('idle');
      setEmote(null);
    }, 2000);
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
        transition: isDragging ? 'none' : 'left 0.28s cubic-bezier(0.25, 1, 0.5, 1), top 0.28s cubic-bezier(0.25, 1, 0.5, 1)',
        willChange: isDragging ? 'left, top' : undefined,
      }}
      className={`fixed z-40 select-none font-sans transition-shadow ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
    >
      {/* Speech / Dialogue Bubble (Intelligently placed above or below with spring pop entrance) */}
      {isOpen && !isMinimized && (
        <div
          className={`absolute ${
            isNearTop ? 'top-full mt-2' : 'bottom-full mb-2'
          } ${
            isRightSide ? 'right-0' : 'left-0'
          } w-72 sm:w-80 rounded-2xl border border-[var(--app-border-subtle)] bg-[var(--app-surface)] shadow-2xl p-3 text-xs text-[var(--app-text)] animate-bubble-pop`}
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

          {/* Dialogue Message */}
          <p className="leading-snug mb-2 text-[var(--app-text)] font-normal">{speechText}</p>
          {speechAuthor && (
            <p className="text-[10px] font-mono text-[var(--app-accent)] -mt-1 mb-2">
              - {speechAuthor}
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
              title="Add Mochi Cloud as a sticker on your card"
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
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--app-border-subtle)] bg-[var(--app-surface)]/95 shadow-lg hover:border-[var(--app-accent)]/50 text-base text-[var(--app-text)] transition-transform hover:scale-105 cursor-pointer"
            title={`Expand ${currentMeta.name} companion`}
            aria-label={`Open ${currentMeta.name} companion`}
          >
            <span className="leading-none" aria-hidden="true">{currentMeta.badge}</span>
          </button>
        ) : (
          <div className="relative">
            {/* Floating Emote on Click, Scroll, or Theme Change (skip above-avatar emote when popover opens above it) */}
            {emote && (!isOpen || isNearTop) && (
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
                stampAnim
                  ? 'animate-companion-stamp'
                  : clickAnim
                  ? 'animate-companion-squash'
                  : wiggleAnim
                  ? 'animate-companion-wiggle'
                  : !isDragging && !motionPaused
                  ? 'animate-companion-breathe'
                  : ''
              }`}
              style={{
                transform: `rotate(${headTilt}rad)`,
              }}
            >
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
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
