import React, { useEffect, useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { Check, Download, Edit3, RotateCcw, Shuffle } from 'lucide-react';
import {
  BINGO_KINDS,
  BINGO_PALETTES,
  generateBingoCells,
  type BingoKindId,
} from '../data/bingoPresets';
import { getBrandedExportFilename, triggerBrandedBlobDownload } from '../engines/brandedExportAndThreePng';
import { dataUrlToBlob } from '../services/imageSecurity';
import { updatePageSEO } from '../utils/seo';

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
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    updatePageSEO({
      title: 'Bingo Card Generator — ACG',
      description: 'Generate, customize, stamp, and export 4 different kinds of aesthetic bingo cards in your browser.',
      canonicalPath: '/bingo',
      ogType: 'website',
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
    setStatusMsg(`Switched to ${nextConfig.label} bingo card.`);
  };

  const handleShuffle = () => {
    setCells(generateBingoCells(kindId));
    setMarked(Array.from({ length: 25 }, (_, i) => i === 12));
    setStatusMsg(`Generated a new ${activeKind.label} card.`);
  };

  const handleClearStamps = () => {
    setMarked(Array.from({ length: 25 }, (_, i) => i === 12));
    setStatusMsg('Cleared all stamps.');
  };

  const toggleCellMark = (idx: number) => {
    setMarked((prev) => prev.map((val, i) => (i === idx ? !val : val)));
  };

  const updateCellText = (idx: number, value: string) => {
    setCells((prev) => prev.map((val, i) => (i === idx ? value : val)));
  };

  const handleExportPng = async () => {
    if (!cardRef.current || exporting) return;
    setExporting(true);
    setStatusMsg('Rendering PNG...');
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2, cacheBust: true });
      const blob = dataUrlToBlob(dataUrl);
      triggerBrandedBlobDownload(blob, getBrandedExportFilename('png', '2d'));
      setStatusMsg('Bingo card exported as PNG.');
    } catch {
      setStatusMsg('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const stampedCount = marked.filter(Boolean).length;

  return (
    <div className="mx-auto w-full max-w-[1380px] px-3 pb-24 pt-6 sm:px-6 md:px-8 md:pb-16 text-[var(--app-text-primary)]">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="editorial-kicker">4 Card Editions · Local Export</p>
          <h1 className="mt-2 text-3xl font-heading leading-tight sm:text-4xl">
            Bingo Card Generator
          </h1>
        </div>
        <p className="text-xs text-[var(--app-text-secondary)]">
          Pick a kind, shuffle or edit squares, stamp as you play, and export PNG.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr] lg:items-start">
        {/* Controls Panel */}
        <section
          aria-label="Bingo card controls"
          className="rounded-2xl border border-[var(--app-border-subtle)] bg-[var(--app-surface)] p-4 sm:p-5 flex flex-col gap-5"
        >
          <div>
            <span className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--app-text-muted)] mb-2.5">
              1. Bingo Kind
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
              {BINGO_KINDS.map((kind) => {
                const selected = kind.id === kindId;
                return (
                  <button
                    key={kind.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => handleSelectKind(kind.id)}
                    className={`min-h-[44px] w-full rounded-xl border px-3.5 py-2.5 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--app-accent)] ${
                      selected
                        ? 'border-[var(--app-accent)] bg-[var(--app-accent)] text-[var(--app-accent-ink)]'
                        : 'border-[var(--app-border-subtle)] bg-[var(--app-surface-secondary)] text-[var(--app-text-primary)] hover:border-[var(--app-border-strong)]'
                    }`}
                  >
                    <span className="block text-xs font-bold">{kind.label}</span>
                    <span
                      className={`block text-[11px] mt-0.5 ${
                        selected ? 'opacity-80' : 'text-[var(--app-text-secondary)]'
                      }`}
                    >
                      {kind.shortDesc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div>
              <label
                htmlFor="bingo-title-input"
                className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--app-text-muted)] mb-1.5"
              >
                Card Title
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
                className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--app-text-muted)] mb-1.5"
              >
                Edition / Subtitle
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
            <span className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--app-text-muted)] mb-2">
              Paper Palette
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
                    onClick={() => setPaletteId(pal.id)}
                    style={{ backgroundColor: pal.bg, color: pal.ink, borderColor: pal.border }}
                    className={`min-h-[44px] rounded-xl border-2 flex items-center justify-center text-[10px] font-bold transition-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--app-accent)] ${
                      active ? 'ring-2 ring-[var(--app-accent)] scale-[1.03]' : ''
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
                className="min-h-[44px] inline-flex items-center justify-center gap-1.5 rounded-xl border border-[var(--app-border-strong)] bg-[var(--app-surface-secondary)] px-3 text-xs font-semibold text-[var(--app-text-primary)] hover:bg-[var(--app-border-subtle)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--app-accent)]"
              >
                <Shuffle className="h-3.5 w-3.5" aria-hidden="true" />
                Shuffle
              </button>
              <button
                type="button"
                aria-pressed={editMode}
                onClick={() => setEditMode((prev) => !prev)}
                className={`min-h-[44px] inline-flex items-center justify-center gap-1.5 rounded-xl border px-3 text-xs font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--app-accent)] ${
                  editMode
                    ? 'border-[var(--app-accent)] bg-[var(--app-accent)] text-[var(--app-accent-ink)]'
                    : 'border-[var(--app-border-strong)] bg-[var(--app-surface-secondary)] text-[var(--app-text-primary)] hover:bg-[var(--app-border-subtle)]'
                }`}
              >
                <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                {editMode ? 'Done Editing' : 'Edit Squares'}
              </button>
            </div>

            <button
              type="button"
              onClick={handleClearStamps}
              className="min-h-[44px] inline-flex items-center justify-center gap-1.5 rounded-xl border border-[var(--app-border-subtle)] px-3 text-xs font-medium text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)] hover:bg-[var(--app-surface-secondary)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--app-accent)]"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Reset Stamps ({stampedCount}/25)
            </button>

            <button
              type="button"
              onClick={handleExportPng}
              disabled={exporting}
              className="min-h-[44px] mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--app-accent)] px-4 text-xs font-bold text-[var(--app-accent-ink)] hover:bg-[var(--app-accent-hover)] disabled:opacity-60 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--app-accent)]"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              {exporting ? 'Exporting PNG...' : 'Download PNG'}
            </button>
          </div>

          <p role="status" aria-live="polite" className="min-h-[18px] text-[11px] text-[var(--app-text-muted)]">
            {statusMsg || (editMode ? 'Edit mode: type directly into any square.' : 'Play mode: tap any square to stamp it.')}
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
            className="w-full max-w-[560px] rounded-2xl border-2 p-4 sm:p-6 shadow-xl"
          >
            <div className="flex items-baseline justify-between gap-2 pb-3 border-b" style={{ borderColor: palette.border }}>
              <div>
                <h2 className="font-heading text-xl sm:text-2xl font-extrabold tracking-tight leading-none">
                  {title || 'BINGO'}
                </h2>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] opacity-75">
                  {subtitle || activeKind.label}
                </p>
              </div>
              <span
                style={{ backgroundColor: palette.stampBg, color: palette.stampInk }}
                className="rounded-md px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wider shrink-0"
              >
                {activeKind.label}
              </span>
            </div>

            {/* B I N G O Header Row */}
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2 mt-3 mb-2">
              {HEADERS.map((letter) => (
                <div
                  key={letter}
                  className="text-center font-heading text-base sm:text-xl font-black tracking-widest py-1"
                >
                  {letter}
                </div>
              ))}
            </div>

            {/* 5x5 Grid */}
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {cells.map((cellText, idx) => {
                const isCenter = idx === 12;
                const isStamped = marked[idx];

                if (editMode) {
                  return (
                    <textarea
                      key={idx}
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
                    type="button"
                    aria-pressed={isStamped}
                    aria-label={`${cellText}${isStamped ? ', stamped' : ''}`}
                    onClick={() => toggleCellMark(idx)}
                    style={{
                      backgroundColor: isStamped ? palette.stampBg : palette.cellBg,
                      color: isStamped ? palette.stampInk : palette.ink,
                      borderColor: isStamped ? palette.stampBg : palette.border,
                    }}
                    className={`aspect-square w-full rounded-lg border p-1 sm:p-1.5 flex items-center justify-center text-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-current ${
                      kindId === 'classic'
                        ? 'text-sm sm:text-lg font-extrabold font-mono'
                        : 'text-[10px] sm:text-xs font-semibold leading-tight'
                    } ${isCenter ? 'tracking-wider font-extrabold uppercase' : ''}`}
                  >
                    <span className="break-words overflow-hidden line-clamp-3">
                      {cellText}
                    </span>
                  </button>
                );
              })}
            </div>

            <div
              className="mt-3 pt-2.5 border-t flex items-center justify-between text-[9px] font-mono uppercase tracking-[0.12em] opacity-70"
              style={{ borderColor: palette.border }}
            >
              <span>ACG BINGO STUDIO</span>
              <span>5 × 5 EDITION</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
