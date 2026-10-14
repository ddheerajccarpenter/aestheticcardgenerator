import React, { useState, useEffect } from 'react';
import { updatePageSEO } from '../utils/seo';
import { SquareDuotoneIcon } from '../components/SquareDuotoneIcon';

interface GuideIndexViewProps {
  onNavigate?: (path: string) => void;
  theme?: 'dark' | 'light';
}

interface BookSpread {
  chapter: string;
  title: string;
  subtitle: string;
  leftPage: {
    rule: string;
    description: string;
    doText: string;
    dontText: string;
  };
  rightPage: {
    rule: string;
    description: string;
    sampleCard: {
      tag: string;
      quote: string;
      author: string;
      bg: string;
      ink: string;
    };
    actionUrl: string;
    actionLabel: string;
  };
}

const BOOK_SPREADS: BookSpread[] = [
  {
    chapter: 'CHAPTER I — PROPORTION & MEASURE',
    title: 'The Law of Negative Space',
    subtitle: 'Why whitespace elevates editorial dignity and reduces cognitive strain.',
    leftPage: {
      rule: 'Rule 1: Give Words Breathing Room',
      description:
        'Maintain at least 36px to 48px of internal canvas margin. Words pushed directly to the container edge feel cramped and claustrophobic.',
      doText: 'Maintain 40px padding with 45–65 characters per line measure.',
      dontText: 'Crowding text to the canvas boundary or stretching lines past 80 characters.',
    },
    rightPage: {
      rule: 'Rule 2: Optical Anchor Hierarchy',
      description:
        'The quote is the dominant focal point. Sizing author citations above 50% of the quote scale fractures reading rhythm.',
      sampleCard: {
        tag: 'PROPORTION • NO. 01',
        quote: '“Whitespace is not empty space; it is the silent architecture that lets ideas resonate.”',
        author: 'Robert Bringhurst — The Elements of Typographic Style',
        bg: '#f4ede4',
        ink: '#2c2825',
      },
      actionUrl: '/create?template=st-germain-editorial',
      actionLabel: 'Try This Rule in Studio →',
    },
  },
  {
    chapter: 'CHAPTER II — ARCHIVAL PALETTES',
    title: 'Tactile Paper Over Glaring OLED',
    subtitle: 'Replacing sterile hex white (#FFF) with French cream, linen, and celadon.',
    leftPage: {
      rule: 'Rule 3: Avoid Raw OLED Contrast',
      description:
        'Pure #FFFFFF on #000000 causes optical halation on high-density screens. Ground your cards in organic print paper tones.',
      doText: 'Warm French cream (#F4EDE4) or pressed oat linen (#FCE7CF) with rich obsidian ink (#18191C).',
      dontText: 'Pure RGB #FFFFFF text on pitch #000000 with harsh neon glow effects.',
    },
    rightPage: {
      rule: 'Rule 4: Multi-Tonal Harmony',
      description:
        'Use secondary ink shades for folio tags and timestamps to create depth between primary words and metadata.',
      sampleCard: {
        tag: 'ARCHIVAL TONES • NO. 02',
        quote: '“To read a book on tactile paper is to experience time moving at a human pace.”',
        author: 'Joan Didion — The White Album',
        bg: '#fce7cf',
        ink: '#451a03',
      },
      actionUrl: '/create?palette=warm-linen',
      actionLabel: 'Load Archival Palette in Studio →',
    },
  },
  {
    chapter: 'CHAPTER III — TYPOGRAPHIC VOICE',
    title: 'Serif Pairing & Hanging Punctuation',
    subtitle: 'Choosing between scholarly Newsreader, opulent Garamond, and razor-sharp Instrument Serif.',
    leftPage: {
      rule: 'Rule 5: Align Mood to Letterform',
      description:
        'Newsreader conveys quiet scholarly introspection; Cormorant Garamond breathes historical grandeur; Syne brings bold avant-garde punch.',
      doText: 'Curled quotation marks (“ ”) with line-height calibrated between 1.45x and 1.65x.',
      dontText: 'Straight typewriter quotes (\' \') with tight, suffocating line measures.',
    },
    rightPage: {
      rule: 'Rule 6: Left-Align Over Center',
      description:
        'Center alignment causes jagged scanning paths on long quotes. Reserve center alignment exclusively for 1–2 line aphorisms.',
      sampleCard: {
        tag: 'TYPOGRAPHY • NO. 03',
        quote: '“In the depth of winter, I finally learned that within me there lay an invincible summer.”',
        author: 'Albert Camus — Return to Tipasa',
        bg: '#18191c',
        ink: '#f5f5f7',
      },
      actionUrl: '/create?template=camus-summer',
      actionLabel: 'Test Newsreader Serif in Studio →',
    },
  },
  {
    chapter: 'CHAPTER IV — ID PASSES & ARTIFACTS',
    title: 'Constructing Authentic 90s Credentials',
    subtitle: 'From lanyard punch-holes and barcode strips to 1-bit dithered portraits.',
    leftPage: {
      rule: 'Rule 7: Vertical Proportion & Hole Slots',
      description:
        'Authentic event credentials use tall vertical aspect ratios (4:5 or 2:3) to hang naturally without twisting on lanyard clips.',
      doText: 'Centered punch-hole slot with 60px header breathing room and monospaced clearance tags.',
      dontText: 'Wide horizontal shapes for neck passes or random generic stock badges.',
    },
    rightPage: {
      rule: 'Rule 8: Tactile Dither Treatments',
      description:
        'High-contrast photocopy and 1-bit Atkinson dithering emulate the vintage thermal ID printers used by 90s music venues.',
      sampleCard: {
        tag: '★ OFFICIAL PASS ★',
        quote: 'ALL-ACCESS PRODUCTION CREW • TIER 01\nVERIFIED BADGE NO. TTC-6253021',
        author: 'Aesthetic Card Studio Credentials',
        bg: '#e0e722',
        ink: '#111417',
      },
      actionUrl: '/canvas?template=pass-creative-studio',
      actionLabel: 'Build 90s Press Pass in Studio →',
    },
  },
];

export const GuideIndexView: React.FC<GuideIndexViewProps> = ({
  theme = 'dark',
}) => {
  const isLight = theme === 'light';
  const [currentSpreadIndex, setCurrentSpreadIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    updatePageSEO({
      title: 'Aesthetic Typesetting & Card Design Book — Interactive Spreads',
      description:
        'Turn through our interactive editorial book on typography proportions, archival paper palettes, serif pairings, and tactile ID pass geometry.',
      canonicalPath: '/guides',
      ogType: 'website',
    });
  }, []);

  const totalSpreads = BOOK_SPREADS.length;
  const spread = BOOK_SPREADS[currentSpreadIndex];

  const handleNext = () => {
    if (currentSpreadIndex < totalSpreads - 1) {
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentSpreadIndex((prev) => prev + 1);
        setIsFlipping(false);
      }, 260);
    }
  };

  const handlePrev = () => {
    if (currentSpreadIndex > 0) {
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentSpreadIndex((prev) => prev - 1);
        setIsFlipping(false);
      }, 260);
    }
  };

  // Keyboard arrow turning
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSpreadIndex]);

  return (
    <div className={`w-full min-h-screen pt-20 pb-20 transition-colors duration-200 ${isLight ? 'text-[#18191e]' : 'text-[#f4f1ea]'}`}>
      <div className="max-w-6xl mx-auto px-4 md:px-8 flex flex-col items-center gap-8">
        {/* Book Header Bar */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 border-b pb-4 border-current/10">
          <div className="flex items-center gap-2">
            <SquareDuotoneIcon name="book" size="md" />
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#fcd535] font-subheading">
                Editorial Field Guide • Book Edition
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight font-heading">
                The Anatomy of Aesthetic Cards
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono opacity-70">
              Spread {currentSpreadIndex + 1} of {totalSpreads}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrev}
                disabled={currentSpreadIndex === 0}
                className="disabled:opacity-30 cursor-pointer"
                title="Previous Spread (ArrowLeft)"
              >
                <SquareDuotoneIcon name="arrow-left" size="sm" />
              </button>
              <button
                onClick={handleNext}
                disabled={currentSpreadIndex === totalSpreads - 1}
                className="disabled:opacity-30 cursor-pointer"
                title="Next Spread (ArrowRight)"
              >
                <SquareDuotoneIcon name="arrow-right" size="sm" />
              </button>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* PHYSICAL TWO-PAGE OPEN BOOK SPREAD                                 */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <div
          className={`w-full max-w-5xl rounded-3xl border shadow-2xl overflow-hidden relative transition-all duration-300 ${
            isFlipping ? 'scale-[0.985] opacity-80' : 'scale-100 opacity-100'
          } ${
            isLight
              ? 'bg-[#f7f2e7] border-[#d8cfbe] text-[#1c1815]'
              : 'bg-[#161412] border-[#2e2822] text-[#ede4d3]'
          }`}
          style={{
            boxShadow: isLight
              ? '0 25px 50px -12px rgba(90, 70, 50, 0.25), inset 0 0 100px rgba(0,0,0,0.03)'
              : '0 25px 50px -12px rgba(0, 0, 0, 0.7), inset 0 0 100px rgba(0,0,0,0.3)',
          }}
        >
          {/* Subtle tactile paper micro-grain texture */}
          <div className="absolute inset-0 card-noise opacity-25 pointer-events-none" />

          {/* Center Spine Crease Shadow */}
          <div
            className="hidden md:block absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-12 z-20 pointer-events-none"
            style={{
              background:
                'linear-gradient(90deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.22) 50%, rgba(255,255,255,0.08) 52%, rgba(0,0,0,0.06) 100%)',
            }}
          />

          {/* Book Content Spread Grid (Strict 2-Column: Left Page + Right Page) */}
          <div className="grid grid-cols-1 md:grid-cols-2 relative z-10">
            {/* ─────────────────────────────────────────────────────────────
                LEFT PAGE: Theoretical Principles & Do / Don't Mini-Cards
                ───────────────────────────────────────────────────────────── */}
            <div className="p-6 sm:p-10 flex flex-col justify-between border-b md:border-b-0 md:border-r border-current/10 min-h-[460px]">
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono opacity-70 mb-4">
                  <span>✦ ✧ ✦</span>
                  <span className="uppercase tracking-widest">{spread.chapter}</span>
                  <span>PAGE {currentSpreadIndex * 2 + 1}</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading mb-2">
                  {spread.title}
                </h2>
                <p className="text-xs sm:text-sm opacity-80 mb-6 italic leading-relaxed">
                  {spread.subtitle}
                </p>

                <div className="p-4 rounded-xl border border-current/15 mb-6 bg-black/5 dark:bg-white/5">
                  <h3 className="text-xs uppercase font-bold tracking-wider text-[#d97706] dark:text-[#fcd535] mb-1.5 font-subheading">
                    {spread.leftPage.rule}
                  </h3>
                  <p className="text-xs leading-relaxed font-body">
                    {spread.leftPage.description}
                  </p>
                </div>

                {/* Side-by-Side Do / Don't Mini-Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider block mb-1">
                      ✓ DO THIS
                    </span>
                    <p className="text-[11px] leading-snug">{spread.leftPage.doText}</p>
                  </div>

                  <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/5">
                    <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block mb-1">
                      ✗ AVOID THIS
                    </span>
                    <p className="text-[11px] leading-snug">{spread.leftPage.dontText}</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-current/10 mt-6 flex items-center justify-between text-[10px] font-mono opacity-60">
                <span>AESTHETIC CARD STUDIO PRESS</span>
                <span>OCTOBER 2026 EDITION</span>
              </div>
            </div>

            {/* ─────────────────────────────────────────────────────────────
                RIGHT PAGE: Tactile Live Specimen Card & Try In Studio CTA
                ───────────────────────────────────────────────────────────── */}
            <div className="p-6 sm:p-10 flex flex-col justify-between min-h-[460px]">
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono opacity-70 mb-4">
                  <span>SPECIMEN ARTIFACT</span>
                  <span>PAGE {currentSpreadIndex * 2 + 2}</span>
                  <span>✦ ✧ ✦</span>
                </div>

                <div className="mb-4">
                  <h3 className="text-xs uppercase font-bold tracking-wider text-[#d97706] dark:text-[#fcd535] mb-1 font-subheading">
                    {spread.rightPage.rule}
                  </h3>
                  <p className="text-xs opacity-85 leading-relaxed font-body">
                    {spread.rightPage.description}
                  </p>
                </div>

                {/* Tactile Mini-Card Specimen */}
                <div
                  style={{
                    backgroundColor: spread.rightPage.sampleCard.bg,
                    color: spread.rightPage.sampleCard.ink,
                  }}
                  className="p-6 rounded-2xl border border-black/15 shadow-xl my-4 relative overflow-hidden flex flex-col justify-between min-h-[220px]"
                >
                  <div className="absolute inset-0 card-noise opacity-30 pointer-events-none" />

                  <div className="flex items-center justify-between text-[10px] font-mono opacity-75 relative z-10">
                    <span>{spread.rightPage.sampleCard.tag}</span>
                    <span className="border border-current/30 px-1 rounded">CURATED</span>
                  </div>

                  <blockquote className="my-4 font-editorial text-lg sm:text-xl leading-snug tracking-tight relative z-10">
                    {spread.rightPage.sampleCard.quote}
                  </blockquote>

                  <div className="pt-2 border-t border-current/15 flex items-center justify-between text-[11px] font-medium opacity-80 relative z-10">
                    <span>— {spread.rightPage.sampleCard.author}</span>
                    <span className="font-mono text-[9px]">4:5 RATIO</span>
                  </div>
                </div>
              </div>

              {/* Direct Studio Launcher Button */}
              <div className="pt-4 border-t border-current/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-[11px] font-mono opacity-70">
                  Ready to apply to your words?
                </span>

                <a
                  href={spread.rightPage.actionUrl}
                  className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                    isLight
                      ? 'bg-[#1c1815] text-[#f7f2e7] hover:bg-black'
                      : 'bg-[#fcd535] text-[#0b0e11] hover:bg-[#ffe270]'
                  }`}
                >
                  <span>{spread.rightPage.actionLabel}</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Spread Navigation Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={handlePrev}
            disabled={currentSpreadIndex === 0}
            className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-30 ${
              isLight ? 'bg-white border-slate-300' : 'bg-[#181d24] border-[#262c36]'
            }`}
          >
            <SquareDuotoneIcon name="arrow-left" size="sm" />
            <span>← Previous Spread</span>
          </button>

          <span className="text-xs font-mono font-bold text-[#fcd535]">
            {currentSpreadIndex + 1} / {totalSpreads}
          </span>

          <button
            onClick={handleNext}
            disabled={currentSpreadIndex === totalSpreads - 1}
            className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-30 ${
              isLight ? 'bg-white border-slate-300' : 'bg-[#181d24] border-[#262c36]'
            }`}
          >
            <span>Next Spread →</span>
            <SquareDuotoneIcon name="arrow-right" size="sm" />
          </button>
        </div>
      </div>
    </div>
  );
};
