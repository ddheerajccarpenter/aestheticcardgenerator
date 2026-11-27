import React from 'react';
import type { CardTemplate } from '../types/card';
import { SquareDuotoneIcon } from './SquareDuotoneIcon';

interface TemplateComparisonDockProps {
  selectedTemplates: CardTemplate[];
  onRemoveTemplate: (id: string) => void;
  onClear: () => void;
  onOpenModal: () => void;
  theme?: 'dark' | 'light';
}

export const TemplateComparisonDock: React.FC<TemplateComparisonDockProps> = ({
  selectedTemplates,
  onRemoveTemplate,
  onClear,
  onOpenModal,
  theme = 'dark',
}) => {
  if (selectedTemplates.length === 0) return null;

  const isLight = theme === 'light';

  return (
    <div className="animate-panel-slide fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-1.5rem)] max-w-xl">
      <div
        className="px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl border shadow-xl flex items-center justify-between gap-3 sm:gap-4 glass-surface text-[var(--app-text-primary)]"
      >
        <div className="flex items-center gap-2 overflow-x-auto min-w-0">
          <span className="text-xs font-bold text-[var(--app-accent)] font-mono shrink-0">
            {selectedTemplates.length}/4
          </span>
          {selectedTemplates.map((tmpl) => (
            <div
              key={tmpl.id}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-[var(--app-border-subtle)] bg-[var(--app-surface-secondary)] text-xs font-medium"
            >
              <span
                style={{ backgroundColor: tmpl.theme.bg }}
                className="w-3 h-3 rounded-full border border-black/20 shrink-0"
              />
              <span className="truncate max-w-[70px] sm:max-w-[90px]">{tmpl.title}</span>
              <button
                onClick={() => onRemoveTemplate(tmpl.id)}
                className="hover:text-red-400 cursor-pointer ml-0.5 text-xs text-[var(--app-text-muted)]"
                title="Remove from comparison"
                aria-label={`Remove ${tmpl.title} from comparison`}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onClear}
            className="text-[11px] text-[var(--app-text-muted)] hover:text-[var(--app-text-primary)] hover:underline cursor-pointer"
          >
            Clear
          </button>

          <button
            onClick={onOpenModal}
            className="btn-editorial-primary !py-1.5 !px-3 !text-xs !rounded-xl"
          >
            <SquareDuotoneIcon name="compare" size="sm" variant={isLight ? 'light' : 'dark'} />
            <span className="hidden sm:inline">Compare</span>
            <span className="sm:hidden">View</span>
          </button>
        </div>
      </div>
    </div>
  );
};
