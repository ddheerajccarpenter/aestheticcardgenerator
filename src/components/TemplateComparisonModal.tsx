import React, { useState } from 'react';
import type { CardTemplate } from '../types/card';
import { SquareDuotoneIcon } from './SquareDuotoneIcon';
import { ASSET_AVATARS } from '../data/canvasAssets';
import { sanitizeQuote } from '../utils/richText';

interface TemplateComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: CardTemplate[];
  onOpenTemplate: (template: CardTemplate) => void;
  theme?: 'dark' | 'light';
}

export const TemplateComparisonModal: React.FC<TemplateComparisonModalProps> = ({
  isOpen,
  onClose,
  templates,
  onOpenTemplate,
}) => {

  // Live test input state that injects into all compared templates simultaneously
  const [testQuote, setTestQuote] = useState(
    '“We have to be continually jumping off cliffs and developing our wings on the way down.”'
  );
  const [testAuthor, setTestAuthor] = useState('Kurt Vonnegut');
  const [testTag, setTestTag] = useState('STUDIO TEST • NO. 01');

  if (!isOpen || templates.length === 0) return null;

  // Enforce 2-column or 4-column layout strictly
  const isQuad = templates.length === 4;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col p-3 sm:p-6 md:p-8 overflow-y-auto">
      <div
        className="w-full max-w-6xl mx-auto my-auto rounded-3xl border border-[var(--app-border-subtle)] bg-[var(--app-surface)] text-[var(--app-text-primary)] shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Top Header Bar */}
        <div className="p-4 md:p-6 border-b border-[var(--app-border-subtle)] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <SquareDuotoneIcon name="compare" size="md" />
            <div>
              <h2 className="text-lg md:text-xl font-bold tracking-tight font-heading">
                Side-by-Side Template Comparison
              </h2>
              <p className="text-xs text-[var(--app-text-muted)]">
                Comparing {templates.length} curated styles with live synchronized test copy
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl border border-[var(--app-border-subtle)] hover:bg-[var(--app-surface-secondary)] text-[var(--app-text-primary)] transition-colors cursor-pointer"
            title="Close Comparison"
            aria-label="Close Comparison"
          >
            <SquareDuotoneIcon name="close" size="sm" />
          </button>
        </div>

        {/* Live Synchronized Test Quote & Photo Bar */}
        <div className="p-4 border-b border-[var(--app-border-subtle)] bg-[var(--app-surface-secondary)] flex flex-col md:flex-row items-stretch md:items-center gap-2.5 sm:gap-3 text-xs">
          <span className="font-bold text-[var(--app-accent)] shrink-0 uppercase tracking-wider font-subheading">
            Test Content:
          </span>
          <input
            type="text"
            value={testTag}
            onChange={(e) => setTestTag(e.target.value)}
            placeholder="Header tag..."
            className="w-full md:w-36 px-2.5 py-1.5 rounded-lg border border-[var(--app-border-subtle)] bg-[var(--app-bg)] text-[var(--app-text-primary)] outline-none font-mono focus:border-[var(--app-accent)]"
          />
          <input
            type="text"
            value={testQuote}
            onChange={(e) => setTestQuote(e.target.value)}
            placeholder="Type your quote to test in both styles..."
            className="flex-1 w-full px-3 py-1.5 rounded-lg border border-[var(--app-border-subtle)] bg-[var(--app-bg)] text-[var(--app-text-primary)] outline-none font-medium focus:border-[var(--app-accent)]"
          />
          <input
            type="text"
            value={testAuthor}
            onChange={(e) => setTestAuthor(e.target.value)}
            placeholder="Author attribution..."
            className="w-full md:w-44 px-3 py-1.5 rounded-lg border border-[var(--app-border-subtle)] bg-[var(--app-bg)] text-[var(--app-text-primary)] outline-none font-medium focus:border-[var(--app-accent)]"
          />
        </div>

        {/* Comparison Grid: Strict 2-Column or 4-Column Layout */}
        <div className={`p-4 sm:p-6 grid gap-4 sm:gap-6 ${isQuad ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-2'}`}>
          {templates.map((tmpl) => {
            const isIdStyle = tmpl.hasPhotoArea || tmpl.category === 'id-card';

            return (
              <div
                key={tmpl.id}
                className="flex flex-col rounded-2xl border border-[var(--app-border-subtle)] bg-[var(--app-bg)] overflow-hidden shadow-lg"
              >
                {/* Live Card Render Preview */}
                <div
                  style={{ backgroundColor: tmpl.theme.bg, color: tmpl.theme.ink }}
                  className="p-5 sm:p-6 min-h-[260px] sm:min-h-[280px] flex flex-col justify-between border-b border-black/10 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between text-[11px] font-mono opacity-75">
                    <span>{testTag || tmpl.tag || tmpl.categoryLabel}</span>
                    <span className="border border-current/30 px-1.5 py-0.5 rounded text-[9px] font-bold">
                      {tmpl.badge}
                    </span>
                  </div>

                  {isIdStyle ? (
                    <div className="my-4 flex items-center gap-3">
                      <div className="w-16 h-20 rounded-lg overflow-hidden border border-current/30 shrink-0 bg-black/10">
                        <img
                          src={ASSET_AVATARS.grungeDan}
                          alt="ID Photo"
                          className="w-full h-full object-cover grayscale contrast-125"
                        />
                      </div>
                      <div className="flex-1 flex flex-col gap-1 text-xs">
                        <span className="font-bold text-sm tracking-tight">{tmpl.title}</span>
                        <span className="opacity-80 text-[11px] line-clamp-2">
                          {sanitizeQuote(testQuote || tmpl.quote)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="my-6">
                      <blockquote className="text-xl sm:text-2xl font-editorial leading-snug tracking-tight">
                        “{sanitizeQuote(testQuote || tmpl.quote)}”
                      </blockquote>
                    </div>
                  )}

                  <div className="pt-3 border-t border-current/15 flex items-center justify-between text-xs">
                    <span className="font-medium opacity-85">— {testAuthor || tmpl.author}</span>
                    <span className="text-[10px] font-mono opacity-50 uppercase">{tmpl.badge}</span>
                  </div>
                </div>

                {/* Specs Breakdown Table */}
                <div className="p-4 flex flex-col gap-2.5 text-xs">
                  <div className="flex items-center justify-between border-b pb-1.5 border-current/10">
                    <span className="text-[#707a8a]">Style Name:</span>
                    <strong className="font-bold">{tmpl.title}</strong>
                  </div>
                  <div className="flex items-center justify-between border-b pb-1.5 border-current/10">
                    <span className="text-[var(--app-text-muted)]">Vibe / Category:</span>
                    <span className="font-medium">{tmpl.categoryLabel}</span>
                  </div>
                  <div className="flex items-center justify-between border-b pb-1.5 border-current/10">
                    <span className="text-[var(--app-text-muted)]">Palette Swatch:</span>
                    <div className="flex items-center gap-1.5">
                      <span
                        style={{ backgroundColor: tmpl.theme.bg }}
                        className="w-4 h-4 rounded-full border border-black/20"
                        title={`Background: ${tmpl.theme.bg}`}
                      />
                      <span
                        style={{ backgroundColor: tmpl.theme.ink }}
                        className="w-4 h-4 rounded-full border border-black/20"
                        title={`Ink: ${tmpl.theme.ink}`}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-b pb-1.5 border-current/10">
                    <span className="text-[var(--app-text-muted)]">Surface Tooth:</span>
                    <span className="font-mono text-[11px]">{tmpl.surfaceFinish || 'Archival Cotton'}</span>
                  </div>

                  <button
                    onClick={() => {
                      onClose();
                      onOpenTemplate(tmpl);
                    }}
                    className="mt-2 w-full py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 btn-editorial-primary"
                  >
                    <span>Open This Style in Studio →</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
