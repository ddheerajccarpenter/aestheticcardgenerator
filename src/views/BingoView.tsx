import React, { useEffect, useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { Check, Download, Edit3, RotateCcw, Shuffle } from '../components/icons/faIcons';
import {
  BINGO_KINDS,
  BINGO_PALETTES,
  generateBingoCells,
  type BingoKindId,
} from '../data/bingoPresets';
import {
  buildSafeFontEmbedCSS,
  getBrandedExportFilename,
  triggerBrandedBlobDownload,
} from '../engines/brandedExportAndThreePng';
import { dataUrlToBlob } from '../services/imageSecurity';
import { PRODUCTION_DOMAIN, updatePageSEO } from '../utils/seo';
import { AdSlot } from '../components/AdSlot';
import { animateGridWave, animateSpringPop, onStageReady, revealPressWords } from '../utils/motion';

interface BingoViewProps {
  theme?: 'dark' | 'light';
}

const HEADERS = ['B', 'I', 'N', 'G', 'O'];

export const BingoView: React.FC<BingoViewProps> = () => {
  const [kindId, setKindId] = useState<BingoKindId>('classic');
  const [paletteId, setPaletteId] = useState<string>('archival-cream');
  const [title, setTitle] = useState<string>(BINGO_KINDS[0].defaultTitle);
  const [subtitle, setSubtitle] = useState<string>(BINGO_KINDS[0].defaultSubtitle);
  const [cells, setCells] = useState<string[]>(() => generateBingoCells('classic'));
  const [marked, setMarked] = useState<boolean[]>(() =>
    Array.from({ length: 25 }, (_, i) => i === 12)
  );
  const [editMode, setEditMode] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    updatePageSEO({
      title: 'Free Aesthetic Bingo Card Generator (5x5 Printable & PNG) - ACG',
      description: 'Generate, customize, stamp, and export 4 different kinds of aesthetic bingo cards in your browser.',
      canonicalPath: '/bingo',
      ogType: 'website',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Aesthetic Bingo Card Generator',
        url: `${PRODUCTION_DOMAIN}/bingo`,
        applicationCategory: 'DesignApplication',
        isAccessibleForFree: true,
      },
    });
    return onStageReady(() => {
      revealPressWords(titleRef.current, 20);
      animateGridWave(gridRef.current, '[data-bingo-cell]', 5, 5);
    });
  }, []);

  const activeKind = BINGO_KINDS.find((k) => k.id === kindId) ?? BINGO_KINDS[0];
  const palette = BINGO_PALETTES.find((p) => p.id === paletteId) ?? BINGO_PALETTES[0];

  const handleSelectKind = (nextKindId: BingoKindId) => {
    const nextConfig = BINGO_KINDS.find((k) => k.id === nextKindId) ?? BINGO_KINDS[0];
    setKindId(nextKindId);
    setPaletteId(nextConfig.defaultPaletteId);
    setTitle(nextConfig.defaultTitle);
    setSubtitle(nextConfig.defaultSubtitle);
    setCells(generateBingoCells(nextKindId));
    setMarked(Array.from({ length: 25 }, (_, i) => i === 12));
    setStatusMsg(`${nextConfig.label}`);
    window.requestAnimationFrame(() => animateGridWave(gridRef.current, '[data-bingo-cell]', 5, 5));
  };

  const handleShuffle = () => {
    setCells(generateBingoCells(kindId));
    setMarked(Array.from({ length: 25 }, (_, i) => i === 12));
    setStatusMsg('Shuffled');
    window.requestAnimationFrame(() => animateGridWave(gridRef.current, '[data-bingo-cell]', 5, 5));
  };

  const handleClearStamps = () => {
    setMarked(Array.from({ length: 25 }, (_, i) => i === 12));
    setStatusMsg('Reset');
    animateGridWave(gridRef.current, '[data-bingo-cell]', 5, 5);
  };

  const toggleCellMark = (idx: number, btnEl: HTMLButtonElement | null) => {
    animateSpringPop(btnEl, 'stamp');
    setMarked((prev) => prev.map((val, i) => (i === idx ? !val : val)));
  };

  const updateCellText = (idx: number, value: string) => {
    setCells((prev) => prev.map((val, i) => (i === idx ? value : val)));
  };

  const handleExportPng = async () => {
    if (!cardRef.current || exporting) return;
    setExporting(true);
    setStatusMsg('Exporting...');
    try {
      if (typeof document !== 'undefined' && document.fonts?.ready) {
        await document.fonts.ready;
      }
      const fontEmbedCSS = await buildSafeFontEmbedCSS([], undefined, `${title}${subtitle}${cells.join('')}`);
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2, cacheBust: true, fontEmbedCSS });
      const blob = dataUrlToBlob(dataUrl);
      triggerBrandedBlobDownload(blob, getBrandedExportFilename('png', '2d'));
      setStatusMsg('Exported PNG');
    } catch {
      setStatusMsg('Export failed.');
    } finally {
      setExporting(false);
    }
  };

  const stampedCount = marked.filter(Boolean).length;

  return (
    <div className="mx-auto w-full max-w-[1380px] px-3 pb-32 pt-6 sm:px-6 md:px-8 md:pb-16 text-[var(--app-text-primary)]">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <h1 ref={titleRef} className="text-3xl font-heading leading-tight sm:text-5xl">
          <span className="press-word-clip">
            <span data-press-word className="press-word">Bingo</span>
          </span>
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[340px_1fr] lg:items-start">
        {/* Controls Panel */}
        <section
          aria-label="Bingo card controls"
          className="rounded-2xl border border-[var(--app-border-subtle)] bg-[var(--app-surface)] p-4 sm:p-5 flex flex-col gap-4"
        >
          <div className="grid grid-cols-2 gap-2">
            {BINGO_KINDS.map((kind) => {
              const selected = kind.id === kindId;
              return (
                <button
                  key={kind.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => handleSelectKind(kind.id)}
                  className={`interactive-tactile min-h-[44px] w-full rounded-xl border px-3 py-2 text-left transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--app-accent)] ${
                    selected
                      ? 'border-[var(--app-accent)] bg-[var(--app-accent)] text-[var(--app-accent-ink)]'
                      : 'border-[var(--app-border-subtle)] bg-[var(--app-surface-secondary)] text-[var(--app-text-primary)] hover:border-[var(--app-border-strong)]'
                  }`}
                >
                  <span className="block text-xs font-bold">{kind.label}</span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div>
              <label
                htmlFor="bingo-title-input"
                className="block text-xs font-medium text-[var(--app-text-secondary)] mb-1.5"
              >
                Title
              </label>
              <input
                id="bingo-title-input"
                type="text"
                maxLength={32}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="studio-input w-full rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-secondary)] text-xs text-[var(--app-text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--app-accent)]"
              />
            </div>
            <div>
              <label
                htmlFor="bingo-subtitle-input"
                className="block text-xs font-medium text-[var(--app-text-secondary)] mb-1.5"
              >
                Subtitle
              </label>
              <input
                id="bingo-subtitle-input"
                type="text"
                maxLength={36}
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="studio-input w-full rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-secondary)] text-xs text-[var(--app-text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--app-accent)]"
              />
            </div>
          </div>

          <div>
            <span className="block text-xs font-medium text-[var(--app-text-secondary)] mb-2">
              Palette
            </span>
            <div className="grid grid-cols-4 gap-2">
              {BINGO_PALETTES.map((pal) => {
                const active = pal.id === paletteId;
                return (
                  <button
                    key={pal.id}
                    type="button"
                    aria-label={`Select ${pal.name} palette`}
                    aria-pressed={active}
                    onClick={() => {
                      setPaletteId(pal.id);
                      animateSpringPop(cardRef.current, 'swap');
                    }}
                    style={{ backgroundColor: pal.bg, color: pal.ink, borderColor: pal.border }}
                    className={`interactive-tactile min-h-[44px] rounded-xl border-2 flex items-center justify-center text-xs font-medium transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--app-accent)] ${
                      active ? 'ring-2 ring-[var(--app-accent)]' : ''
                    }`}
                  >
                    {active ? <Check className="h-4 w-4" aria-hidden="true" /> : pal.name.split(' ')[0]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-1 border-t border-[var(--app-border-subtle)]">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleShuffle}
                className="interactive-tactile min-h-[44px] inline-flex items-center justify-center gap-1.5 rounded-xl border border-[var(--app-border-strong)] bg-[var(--app-surface-secondary)] px-3 text-[13px] font-medium text-[var(--app-text-primary)] hover:bg-[var(--app-border-subtle)] transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--app-accent)]"
              >
                <Shuffle className="h-3.5 w-3.5" aria-hidden="true" />
                Shuffle
              </button>
              <button
                type="button"
                aria-pressed={editMode}
                onClick={() => setEditMode((prev) => !prev)}
                className={`interactive-tactile min-h-[44px] inline-flex items-center justify-center gap-1.5 rounded-xl border px-3 text-[13px] font-medium transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--app-accent)] ${
                  editMode
                    ? 'border-[var(--app-accent)] bg-[var(--app-accent)] text-[var(--app-accent-ink)]'
                    : 'border-[var(--app-border-strong)] bg-[var(--app-surface-secondary)] text-[var(--app-text-primary)] hover:bg-[var(--app-border-subtle)]'
                }`}
              >
                <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                {editMode ? 'Done editing' : 'Edit squares'}
              </button>
            </div>

            <button
              type="button"
              onClick={handleClearStamps}
              className="interactive-tactile min-h-[44px] inline-flex items-center justify-center gap-1.5 rounded-xl border border-[var(--app-border-subtle)] px-3 text-[13px] font-medium text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)] hover:bg-[var(--app-surface-secondary)] transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--app-accent)]"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Reset ({stampedCount}/25)
            </button>

            <button
              type="button"
              onClick={handleExportPng}
              disabled={exporting}
              className="btn-sheen interactive-tactile min-h-[44px] mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--app-accent)] px-4 text-[13px] font-semibold text-[var(--app-accent-ink)] hover:bg-[var(--app-accent-hover)] disabled:opacity-60 transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--app-accent)]"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              {exporting ? 'Exporting...' : 'Download PNG'}
            </button>
          </div>

          <p role="status" aria-live="polite" className="min-h-[18px] text-[13px] text-[var(--app-text-muted)]">
            {statusMsg}
          </p>
        </section>

        {/* Bingo Card Stage */}
        <section
          aria-label="Bingo card preview"
          className="flex flex-col items-center justify-center rounded-2xl border border-[var(--app-border-subtle)] bg-[var(--app-surface)] p-4 sm:p-8"
        >
          <div
            ref={cardRef}
            style={{
              backgroundColor: palette.bg,
              color: palette.ink,
              borderColor: palette.border,
            }}
            className="w-full max-w-[560px] rounded-2xl border-2 p-4 sm:p-6 shadow-xl transition-colors duration-300"
          >
            <div className="flex items-baseline justify-between gap-2 pb-3 border-b" style={{ borderColor: palette.border }}>
              <div>
                <h2 className="font-heading text-xl sm:text-2xl font-medium tracking-tight leading-none">
                  {title || 'Bingo'}
                </h2>
                <p className="mt-1 font-mono text-[11px] opacity-75">
                  {subtitle || activeKind.label}
                </p>
              </div>
              <span
                style={{ backgroundColor: palette.stampBg, color: palette.stampInk }}
                className="rounded-md px-2 py-1 font-mono text-[11px] font-medium shrink-0"
              >
                {activeKind.label}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-1.5 sm:gap-2 mt-3 mb-2">
              {HEADERS.map((letter) => (
                <div
                  key={letter}
                  className="text-center font-heading text-base sm:text-xl font-semibold tracking-widest py-1"
                >
                  {letter}
                </div>
              ))}
            </div>

            <div ref={gridRef} className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {cells.map((cellText, idx) => {
                const isCenter = idx === 12;
                const isStamped = marked[idx];

                if (editMode) {
                  return (
                    <textarea
                      key={idx}
                      data-bingo-cell
                      aria-label={`Square ${idx + 1}`}
                      value={cellText}
                      onChange={(e) => updateCellText(idx, e.target.value)}
                      rows={2}
                      style={{
                        backgroundColor: palette.cellBg,
                        color: palette.ink,
                        borderColor: palette.border,
                      }}
                      className="aspect-square w-full resize-none rounded-lg border p-1 sm:p-1.5 text-center text-[10px] sm:text-xs font-semibold leading-tight focus-visible:outline focus-visible:outline-2 focus-visible:outline-current flex items-center justify-center"
                    />
                  );
                }

                return (
                  <button
                    key={idx}
                    data-bingo-cell
                    type="button"
                    aria-pressed={isStamped}
                    aria-label={`${cellText}${isStamped ? ', stamped' : ''}`}
                    onClick={(e) => toggleCellMark(idx, e.currentTarget)}
                    style={{
                      backgroundColor: isStamped ? palette.stampBg : palette.cellBg,
                      color: isStamped ? palette.stampInk : palette.ink,
                      borderColor: isStamped ? palette.stampBg : palette.border,
                    }}
                    className={`aspect-square w-full rounded-lg border p-1 sm:p-1.5 flex items-center justify-center text-center transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-current tabular-nums ${
                      kindId === 'classic'
                        ? 'text-sm sm:text-lg font-semibold font-mono'
                        : 'text-[10px] sm:text-xs font-medium leading-tight'
                    } ${isCenter ? 'font-semibold' : ''}`}
                  >
                    <span className="break-words overflow-hidden line-clamp-3">
                      {cellText}
                    </span>
                  </button>
                );
              })}
            </div>

            <div
              className="mt-3 pt-2.5 border-t flex items-center justify-between text-[11px] font-mono tabular-nums opacity-70"
              style={{ borderColor: palette.border }}
            >
              <span>ACG</span>
              <span>5 × 5</span>
            </div>
          </div>
        </section>
      </div>
      <div className="mx-auto max-w-6xl px-3 sm:px-6">
        <AdSlot slotId="bingo-bottom-slot" format="horizontal" />
      </div>
    </div>
  );
};
