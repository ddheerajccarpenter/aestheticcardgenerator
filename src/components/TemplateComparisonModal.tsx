import React, { useEffect, useState } from 'react';
import type { CardTemplate } from '../types/card';
import { SquareDuotoneIcon } from './SquareDuotoneIcon';
import { UnifiedCardThumbnail } from './UnifiedCardThumbnail';

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
  theme = 'dark',
}) => {
  const [testQuote, setTestQuote] = useState('');
  const [testAuthor, setTestAuthor] = useState('');
  const [testTag, setTestTag] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || templates.length === 0) return null;

  const isQuad = templates.length === 4;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 flex flex-col p-3 sm:p-6 md:p-8 overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-panel-slide w-full max-w-6xl mx-auto my-auto rounded-3xl border border-[var(--app-border-subtle)] bg-[var(--app-surface)] text-[var(--app-text-primary)] shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="p-4 md:p-6 border-b border-[var(--app-border-subtle)] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <SquareDuotoneIcon name="compare" size="md" />
            <div>
              <h2 className="text-lg md:text-xl font-semibold tracking-tight font-heading">
                Compare ({templates.length})
              </h2>
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

        <div className="p-4 border-b border-[var(--app-border-subtle)] bg-[var(--app-surface-secondary)] flex flex-col md:flex-row items-stretch md:items-center gap-2.5 sm:gap-3 text-xs">
          <input
            type="text"
            aria-label="Test header tag"
            value={testTag}
            onChange={(e) => setTestTag(e.target.value)}
            placeholder="Tag"
            className="w-full md:w-36 px-2.5 py-1.5 rounded-lg border border-[var(--app-border-subtle)] bg-[var(--app-bg)] text-[var(--app-text-primary)] outline-none font-mono focus:border-[var(--app-accent)]"
          />
          <input
            type="text"
            aria-label="Test quote"
            value={testQuote}
            onChange={(e) => setTestQuote(e.target.value)}
            placeholder="Quote"
            className="flex-1 w-full px-3 py-1.5 rounded-lg border border-[var(--app-border-subtle)] bg-[var(--app-bg)] text-[var(--app-text-primary)] outline-none font-medium focus:border-[var(--app-accent)]"
          />
          <input
            type="text"
            aria-label="Test author"
            value={testAuthor}
            onChange={(e) => setTestAuthor(e.target.value)}
            placeholder="Author"
            className="w-full md:w-44 px-3 py-1.5 rounded-lg border border-[var(--app-border-subtle)] bg-[var(--app-bg)] text-[var(--app-text-primary)] outline-none font-medium focus:border-[var(--app-accent)]"
          />
        </div>

        <div className={`p-4 sm:p-6 grid gap-4 sm:gap-6 ${isQuad ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-2'}`}>
          {templates.map((tmpl) => {
            const previewTemplate: CardTemplate = tmpl.canvasDoc?.objects.length
              ? tmpl
              : {
                  ...tmpl,
                  quote: testQuote.trim() || tmpl.quote,
                  author: testAuthor.trim() || tmpl.author,
                  tag: testTag.trim() || tmpl.tag,
                };

            return (
              <div
                key={tmpl.id}
                className="flex flex-col rounded-2xl border border-[var(--app-border-subtle)] bg-[var(--app-bg)] overflow-hidden shadow-lg"
              >
                <div className="p-3 sm:p-4 bg-[var(--app-surface-secondary)] border-b border-[var(--app-border-subtle)] flex items-center justify-center">
                  <div className="w-full max-w-[260px] rounded-xl overflow-hidden border border-black/15 shadow-sm">
                    <UnifiedCardThumbnail
                      template={previewTemplate}
                      isLight={theme === 'light'}
                      className="w-full h-full"
                    />
                  </div>
                </div>

                <div className="p-4 flex flex-col gap-2.5 text-[13px]">
                  <div className="flex items-center justify-between border-b pb-1.5 border-current/10">
                    <strong className="font-semibold truncate">{tmpl.title}</strong>
                    <div className="flex items-center gap-1.5 shrink-0">
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
                  <div className="flex items-center justify-between text-[13px] text-[var(--app-text-muted)]">
                    <span>{tmpl.categoryLabel}</span>
                    <span className="font-mono">{tmpl.surfaceFinish || 'Cotton'}</span>
                  </div>

                  <button
                    onClick={() => {
                      onClose();
                      onOpenTemplate(tmpl);
                    }}
                    className="mt-1 w-full min-h-[44px] py-2.5 rounded-xl font-medium text-[13px] transition-colors cursor-pointer flex items-center justify-center gap-2 btn-editorial-primary btn-sheen interactive-tactile"
                  >
                    <span>Open card</span>
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
