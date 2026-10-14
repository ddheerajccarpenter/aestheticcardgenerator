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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-xl animate-bounce-in">
      <div
        className={`px-4 py-3 rounded-2xl border shadow-2xl flex items-center justify-between gap-4 backdrop-blur-xl ${
          isLight
            ? 'bg-white/95 border-[#cbd5e1] text-[#0f172a]'
            : 'bg-[#181d24]/95 border-[#262c36] text-[#f4f1ea]'
        }`}
      >
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-bold text-[#fcd535] uppercase tracking-wider shrink-0">
            Compare ({selectedTemplates.length}/4):
          </span>
          {selectedTemplates.map((tmpl) => (
            <div
              key={tmpl.id}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs font-semibold ${
                isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#12151b] border-[#323946]'
              }`}
            >
              <span
                style={{ backgroundColor: tmpl.theme.bg }}
                className="w-3 h-3 rounded-full border border-black/20"
              />
              <span className="truncate max-w-[80px]">{tmpl.title}</span>
              <button
                onClick={() => onRemoveTemplate(tmpl.id)}
                className="hover:text-red-400 cursor-pointer ml-1 text-xs"
                title="Remove from comparison"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onClear}
            className="text-[11px] text-[#707a8a] hover:underline cursor-pointer"
          >
            Clear
          </button>

          <button
            onClick={onOpenModal}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer ${
              isLight
                ? 'bg-[#0f172a] text-white hover:bg-[#1e293b]'
                : 'bg-[#fcd535] text-[#0b0e11] hover:bg-[#ffe270]'
            }`}
          >
            <SquareDuotoneIcon name="compare" size="sm" />
            <span>Compare Side-by-Side</span>
          </button>
        </div>
      </div>
    </div>
  );
};
