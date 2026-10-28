import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { CardTemplate } from '../types/card';
import { PRESET_TEMPLATES } from '../data/templates';
import { updatePageSEO } from '../utils/seo';
import { ArrowRight, Check, Copy, Plus, Search, X } from 'lucide-react';
import { UnifiedCardThumbnail } from '../components/UnifiedCardThumbnail';
import { LazyTemplateCard } from '../components/LazyTemplateCard';
import { getTemplateAspectRatio } from '../utils/templateAspectRatio';

export interface HomeViewProps {
  onOpenEditorWithTemplate?: (template: CardTemplate) => void;
  onNavigateToEditor?: () => void;
  onNavigate?: (path: string) => void;
  theme?: 'dark' | 'light';
  onOpenGuide?: () => void;
}

type CategoryFilterId = 'all' | 'quote' | 'id-card' | 'editorial' | 'minimal';

const FILTERS: Array<{ id: CategoryFilterId; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'quote', label: 'Quote Cards' },
  { id: 'id-card', label: 'ID Pass' },
  { id: 'editorial', label: 'Editorial' },
  { id: 'minimal', label: 'Minimal' },
];

const matchesCategory = (card: CardTemplate, filter: CategoryFilterId) => {
  const label = card.categoryLabel.toLowerCase();
  const tag = card.tag.toLowerCase();
  const id = card.id.toLowerCase();

  if (filter === 'all') return true;
  if (filter === 'quote') {
    return ['quote', 'reflection', 'poetry'].includes(card.category) || label.includes('quote');
  }
  if (filter === 'id-card') {
    return card.category === 'id-card' || Boolean(card.hasPhotoArea) || id.includes('pass') || id.includes('id-') ||
      ['id', 'badge', 'pass'].some((term) => label.includes(term));
  }
  if (filter === 'editorial') {
    return card.theme.category === 'editorial' || card.category === 'notes' ||
      ['editorial', 'field notes', 'essay'].some((term) => label.includes(term) || tag.includes(term));
  }
  return card.category === 'minimal' || card.theme.category === 'minimal' ||
    ['minimal', 'study'].some((term) => label.includes(term));
};

export const HomeView: React.FC<HomeViewProps> = ({ onOpenEditorWithTemplate }) => {
  const [activeCategory, setActiveCategory] = useState<CategoryFilterId>('all');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState<CardTemplate | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const previewDialogRef = useRef<HTMLDialogElement | null>(null);
  const previewTriggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    updatePageSEO({
      title: 'ACG — Aesthetic Card Generator | Design Gallery',
      description: 'Browse quote cards, editorial designs, and ID passes. Customize and export designs in your browser.',
      canonicalPath: '/',
      ogType: 'website',
    });
  }, []);

  const filteredCards = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return PRESET_TEMPLATES.filter((card) => {
      if (!matchesCategory(card, activeCategory)) return false;
      if (!query) return true;
      const searchText = [card.title, card.quote, card.author, card.tag, card.categoryLabel, card.description, ...(card.tags || [])]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return searchText.includes(query);
    });
  }, [activeCategory, searchQuery]);

  useEffect(() => {
    const dialog = previewDialogRef.current;
    if (!dialog) return;
    if (previewTemplate && !dialog.open) dialog.showModal();
    if (!previewTemplate && dialog.open) dialog.close();
  }, [previewTemplate]);

  const handleUseTemplate = (template: CardTemplate) => {
    if (onOpenEditorWithTemplate) {
      onOpenEditorWithTemplate(template);
      return;
    }
    sessionStorage.setItem('aesthetic_card_studio_selected_template', template.id);
    window.location.href = `/create?template=${encodeURIComponent(template.id)}`;
  };

  const handleCopyText = async (template: CardTemplate) => {
    try {
      await navigator.clipboard.writeText(`${template.quote}\n— ${template.author}`);
      setCopiedId(template.id);
      setFeedback(`Copied ${template.title}`);
      window.setTimeout(() => setCopiedId((current) => current === template.id ? null : current), 1800);
    } catch {
      setFeedback('Clipboard access is unavailable in this browser.');
    }
  };

  const openPreview = (template: CardTemplate, event: React.MouseEvent<HTMLButtonElement>) => {
    previewTriggerRef.current = event.currentTarget;
    setPreviewTemplate(template);
  };

  const closePreview = () => {
    if (previewDialogRef.current?.open) previewDialogRef.current.close();
    else setPreviewTemplate(null);
  };

  const handleDialogClose = () => {
    setPreviewTemplate(null);
    previewTriggerRef.current?.focus();
  };

  return (
    <div className="mx-auto w-full max-w-[1580px] px-4 pb-16 pt-16 text-[var(--app-text-primary)] sm:px-6 md:px-8 md:pb-10 md:pt-7">
      <section aria-label="Design gallery controls" className="mb-5 space-y-3">
        <div className="flex min-h-9 items-center justify-between gap-4">
          <div className="flex items-baseline gap-3">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Explore designs</h1>
            <span className="text-xs text-[var(--app-text-muted)]" aria-live="polite">
              {filteredCards.length} {filteredCards.length === 1 ? 'design' : 'designs'}
            </span>
          </div>
          <a href="/create" className="inline-flex h-9 items-center gap-2 border border-[var(--app-border-strong)] px-3 text-xs font-medium text-[var(--app-text-primary)] transition-colors hover:bg-[var(--app-surface-secondary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--app-accent)]">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Create
          </a>
        </div>

        <div className="flex items-center justify-between gap-4 border-b border-[var(--app-border-subtle)]">
          <div role="group" aria-label="Filter designs by category" className="flex min-w-0 flex-1 items-center gap-5 overflow-x-auto scrollbar-none">
            {FILTERS.map((filter) => (
              <button
                key={filter.id}
                type="button"
                aria-pressed={activeCategory === filter.id}
                onClick={() => setActiveCategory(filter.id)}
                className={`shrink-0 border-b py-2.5 text-xs transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-accent)] ${activeCategory === filter.id ? 'border-[var(--app-accent)] text-[var(--app-text-primary)]' : 'border-transparent text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)]'}`}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setSearchOpen((open) => !open)}
            aria-expanded={searchOpen}
            aria-label={searchOpen ? 'Close design search' : 'Search designs'}
            className="mb-1 inline-flex h-9 w-9 shrink-0 items-center justify-center text-[var(--app-text-secondary)] transition-colors hover:text-[var(--app-text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--app-accent)]"
          >
            {searchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
          </button>
        </div>

        {searchOpen && (
          <div className="relative max-w-md">
            <label htmlFor="gallery-search" className="sr-only">Search titles, quotes, authors, and tags</label>
            <input
              id="gallery-search"
              type="search"
              autoFocus
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search designs"
              className="h-10 w-full border-b border-[var(--app-border-strong)] bg-transparent pr-10 text-sm text-[var(--app-text-primary)] placeholder:text-[var(--app-text-muted)] focus:border-[var(--app-accent)] focus:outline-none"
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery('')} aria-label="Clear search" className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)]">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </section>

      {filteredCards.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-sm text-[var(--app-text-secondary)]">No designs match your search.</p>
          <button type="button" onClick={() => { setActiveCategory('all'); setSearchQuery(''); }} className="mt-3 text-xs underline underline-offset-4 hover:text-[var(--app-text-primary)]">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 items-start gap-x-5 gap-y-7 min-[520px]:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {filteredCards.map((card) => (
            <article key={card.id} className="group relative min-w-0">
              <button
                type="button"
                aria-label={`Preview ${card.title}`}
                onClick={(event) => openPreview(card, event)}
                className="block w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-accent)]"
              >
                <LazyTemplateCard aspectRatio={getTemplateAspectRatio(card)} className="border border-[var(--app-border-subtle)] bg-[var(--app-surface)]">
                  <UnifiedCardThumbnail template={card} className="h-full w-full" />
                </LazyTemplateCard>
                <div className="flex items-baseline justify-between gap-3 pt-2">
                  <span className="truncate text-xs font-medium text-[var(--app-text-primary)]">{card.title}</span>
                  <span className="shrink-0 truncate text-[9px] uppercase tracking-wider text-[var(--app-text-muted)]">{card.categoryLabel}</span>
                </div>
              </button>

              <div className="mt-2 flex items-center gap-2 md:absolute md:inset-x-2 md:top-2 md:mt-0 md:justify-end md:opacity-0 md:transition-opacity md:group-hover:opacity-100 md:group-focus-within:opacity-100">
                <button type="button" onClick={() => handleUseTemplate(card)} className="inline-flex min-h-10 items-center gap-1.5 border border-[var(--app-border-strong)] bg-[var(--app-surface)] px-3 text-xs font-medium text-[var(--app-text-primary)] transition-colors hover:bg-[var(--app-surface-secondary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--app-accent)]">
                  Use template <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <button type="button" onClick={() => void handleCopyText(card)} aria-label={copiedId === card.id ? 'Quote copied' : `Copy quote from ${card.title}`} title={copiedId === card.id ? 'Copied' : 'Copy quote'} className="inline-flex h-10 w-10 items-center justify-center border border-[var(--app-border-strong)] bg-[var(--app-surface)] text-[var(--app-text-primary)] transition-colors hover:bg-[var(--app-surface-secondary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--app-accent)]">
                  {copiedId === card.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <p role="status" aria-live="polite" className="sr-only">{feedback}</p>

      <dialog
        ref={previewDialogRef}
        aria-labelledby="design-preview-title"
        aria-modal="true"
        onClose={handleDialogClose}
        onCancel={() => setPreviewTemplate(null)}
        onClick={(event) => { if (event.target === event.currentTarget) closePreview(); }}
        className="acg-preview-dialog m-auto max-h-[90vh] w-[min(92vw,960px)] max-w-none overflow-auto border border-[var(--app-border-strong)] bg-[var(--app-bg)] p-4 text-[var(--app-text-primary)] sm:p-5"
      >
        {previewTemplate && (
          <div className="flex flex-col gap-4">
            <header className="flex items-start justify-between gap-4 border-b border-[var(--app-border-subtle)] pb-3">
              <div className="min-w-0">
                <h2 id="design-preview-title" className="truncate text-sm font-semibold">{previewTemplate.title}</h2>
                <p className="mt-1 text-xs text-[var(--app-text-secondary)]">{previewTemplate.categoryLabel}</p>
              </div>
              <button type="button" onClick={closePreview} aria-label="Close preview" className="inline-flex h-9 w-9 shrink-0 items-center justify-center text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--app-accent)]">
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="grid min-h-0 place-items-center overflow-auto">
              <div className="max-h-[68vh] w-full max-w-[760px]">
                <UnifiedCardThumbnail template={previewTemplate} className="max-h-[68vh] w-full" />
              </div>
            </div>

            <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--app-border-subtle)] pt-3">
              <span className="max-w-full truncate text-xs text-[var(--app-text-secondary)]">{previewTemplate.author}</span>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => void handleCopyText(previewTemplate)} className="inline-flex h-9 items-center gap-2 border border-[var(--app-border-strong)] px-3 text-xs hover:bg-[var(--app-surface-secondary)]">
                  {copiedId === previewTemplate.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedId === previewTemplate.id ? 'Copied' : 'Copy text'}
                </button>
                <button type="button" onClick={() => handleUseTemplate(previewTemplate)} className="inline-flex h-9 items-center gap-2 bg-[var(--app-accent)] px-3 text-xs font-medium text-[var(--app-accent-ink)] hover:bg-[var(--app-accent-hover)]">
                  Use template <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </footer>
          </div>
        )}
      </dialog>
    </div>
  );
};
