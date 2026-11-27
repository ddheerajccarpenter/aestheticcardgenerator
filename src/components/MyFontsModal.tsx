// src/components/MyFontsModal.tsx
// Compact, full-featured My Fonts Manager modal
import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Trash2, Search, Check, Type, AlertCircle } from 'lucide-react';
import {
  loadAllFontsFromIndexedDB,
  registerAndSaveCustomFont,
  removeCustomFont,
  type StoredCustomFont,
} from '../services/customFontManager';

export interface MyFontsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFont?: (familyName: string) => void;
  selectedFontFamily?: string;
  theme?: 'dark' | 'light';
}

export const MyFontsModal: React.FC<MyFontsModalProps> = ({
  isOpen,
  onClose,
  onSelectFont,
  selectedFontFamily,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';
  const [fonts, setFonts] = useState<StoredCustomFont[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sampleText, setSampleText] = useState('The quick brown fox jumps over the lazy dog');
  const [previewSize, setPreviewSize] = useState(24);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshFonts = async () => {
    try {
      const list = await loadAllFontsFromIndexedDB();
      setFonts(list);
    } catch {
      setFonts([]);
    }
  };

  useEffect(() => {
    if (isOpen) {
      refreshFonts();
      setErrorMessage(null);
      setStatusMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setErrorMessage(null);
    try {
      const meta = await registerAndSaveCustomFont(file);
      await refreshFonts();
      setStatusMessage(`"${meta.familyName.replace('Custom_', '').replace(/_/g, ' ')}" installed`);
      if (onSelectFont) {
        onSelectFont(meta.familyName);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to upload font');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (font: StoredCustomFont) => {
    try {
      await removeCustomFont(font.id, font.familyName);
      await refreshFonts();
      setStatusMessage(`Font removed`);
    } catch (err: any) {
      setErrorMessage('Failed to delete font');
    }
  };

  const filteredFonts = fonts.filter((f) => {
    const q = searchQuery.toLowerCase();
    const clean = f.familyName.replace('Custom_', '').replace(/_/g, ' ').toLowerCase();
    return clean.includes(q) || f.fileName.toLowerCase().includes(q);
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`w-full max-w-2xl max-h-[88vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden transition-colors ${
          isLight
            ? 'bg-[#FAF5EB] border-[#C9BEAF] text-[#292620]'
            : 'bg-[#24211E] border-[#48413A] text-[#EFE6D8]'
        }`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-current/15">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--app-accent)]/15 text-[var(--app-accent)] flex items-center justify-center">
              <Type className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold tracking-tight">My Fonts Library</h2>
              <p className="text-[13px] font-mono tabular-nums opacity-70">
                {fonts.length} custom {fonts.length === 1 ? 'font' : 'fonts'} installed in this browser
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="min-h-[44px] px-3.5 py-2 rounded-lg text-[13px] font-semibold bg-[var(--app-accent)] text-[var(--app-accent-ink)] flex items-center gap-1.5 cursor-pointer hover:opacity-90 active:scale-95 transition-transform"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isUploading ? 'Validating...' : 'Upload font'}</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".woff2,.woff,.ttf,.otf"
              onChange={handleUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg opacity-70 hover:opacity-100 hover:bg-current/10 cursor-pointer transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications */}
        {errorMessage && (
          <div className="px-5 py-2.5 bg-red-500/10 border-b border-red-500/20 text-red-500 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
        {statusMessage && (
          <div className="px-5 py-2.5 bg-emerald-500/10 border-b border-emerald-500/20 text-emerald-500 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Controls Toolbar */}
        <div className="px-5 py-3 border-b border-current/10 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none" />
            <input
              type="text"
              placeholder="Search uploaded fonts…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs bg-current/5 border border-current/15 focus:outline-none focus:border-[var(--app-accent)]"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={sampleText}
              onChange={(e) => setSampleText(e.target.value)}
              placeholder="Type preview text…"
              className="w-full sm:w-56 px-3 py-1.5 rounded-lg text-xs bg-current/5 border border-current/15 focus:outline-none focus:border-[var(--app-accent)]"
            />
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono tabular-nums opacity-70">
              <span>{previewSize}px</span>
              <input
                type="range"
                min="14"
                max="42"
                value={previewSize}
                onChange={(e) => setPreviewSize(Number(e.target.value))}
                className="w-20 accent-[var(--app-accent)]"
              />
            </div>
          </div>
        </div>

        {/* Font List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-3 min-h-[220px]">
          {fonts.length === 0 ? (
            <div className="my-auto py-12 flex flex-col items-center justify-center text-center opacity-70">
              <Type className="w-10 h-10 mb-3 opacity-40 stroke-[1.5]" />
              <p className="text-sm font-semibold">No custom fonts installed yet</p>
              <p className="text-xs mt-1 max-w-sm opacity-80">
                Upload your own <span className="font-mono">.woff2</span>, <span className="font-mono">.woff</span>, <span className="font-mono">.ttf</span>, or <span className="font-mono">.otf</span> files to use across quote cards and canvas designs.
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 px-4 py-2 rounded-lg text-xs font-semibold bg-[var(--app-accent)] text-[var(--app-accent-ink)] cursor-pointer hover:opacity-90 active:scale-95 transition-transform"
              >
                Upload Your First Font
              </button>
            </div>
          ) : filteredFonts.length === 0 ? (
            <div className="py-8 text-center opacity-60 text-xs">
              No custom fonts match &quot;{searchQuery}&quot;
            </div>
          ) : (
            filteredFonts.map((font) => {
              const displayName = font.familyName.replace('Custom_', '').replace(/_/g, ' ');
              const isSelected = selectedFontFamily === font.familyName;
              const ext = font.fileName.split('.').pop()?.toUpperCase() || 'FONT';

              return (
                <div
                  key={font.id}
                  className={`p-3.5 rounded-xl border transition-colors flex flex-col gap-2 ${
                    isSelected
                      ? 'border-[var(--app-accent)] bg-[var(--app-accent)]/8'
                      : 'border-current/15 hover:border-current/30 bg-current/[0.02]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-semibold text-[13px] tracking-tight truncate">{displayName}</span>
                      <span className="px-1.5 py-0.5 rounded text-xs font-mono font-medium bg-current/10 border border-current/15">
                        {ext}
                      </span>
                      <span className="text-xs font-mono opacity-50 truncate hidden sm:inline">
                        {font.fileName}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {onSelectFont && (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectFont(font.familyName);
                            onClose();
                          }}
                          className={`min-h-[36px] px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-[var(--app-accent)] text-[var(--app-accent-ink)]'
                              : 'bg-current/10 hover:bg-current/20 text-current'
                          }`}
                        >
                          {isSelected ? 'Active' : 'Apply'}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDelete(font)}
                        className="p-1 rounded-md text-red-500/70 hover:text-red-500 hover:bg-red-500/10 cursor-pointer transition-colors"
                        title="Delete font"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Rendered Live Preview in Custom Font */}
                  <div
                    style={{ fontFamily: font.familyName, fontSize: `${previewSize}px` }}
                    className="py-2 px-3 rounded-lg bg-current/5 border border-current/10 truncate leading-snug"
                  >
                    {sampleText || displayName}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer Note */}
        <div className="px-5 py-3 border-t border-current/10 text-[10px] font-mono opacity-60 flex items-center justify-between">
          <span>Supported: .woff2, .woff, .ttf, .otf (Max 15MB)</span>
          <span>Stored locally in browser IndexedDB</span>
        </div>
      </div>
    </div>
  );
};
