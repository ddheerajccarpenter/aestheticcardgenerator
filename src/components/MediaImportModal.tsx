import React, { useState } from 'react';
import { Search, Book, Music, X, Loader2, ArrowRight } from 'lucide-react';

export interface BookResult {
  type: 'book';
  title: string;
  author: string;
  year?: string;
  coverUrl?: string;
  firstSentence?: string;
}

export interface SongResult {
  type: 'song';
  title: string;
  artist: string;
  album?: string;
  year?: string;
  artworkUrl?: string;
}

export type MediaResult = BookResult | SongResult;

interface MediaImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: MediaResult) => void;
  theme?: 'dark' | 'light';
}

export const MediaImportModal: React.FC<MediaImportModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';
  const [activeTab, setActiveTab] = useState<'book' | 'music'>('book');
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<MediaResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setResults([]);

    try {
      if (activeTab === 'book') {
        const res = await fetch(
          `https://openlibrary.org/search.json?q=${encodeURIComponent(query.trim())}&limit=8`
        );
        if (!res.ok) throw new Error('Failed to query Open Library API');
        const data = await res.json();
        const mapped: BookResult[] = (data.docs || []).slice(0, 8).map((doc: any) => ({
          type: 'book',
          title: doc.title || 'Untitled Book',
          author: doc.author_name?.[0] || 'Unknown Author',
          year: doc.first_publish_year ? String(doc.first_publish_year) : undefined,
          coverUrl: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : undefined,
          firstSentence: Array.isArray(doc.first_sentence) ? doc.first_sentence[0] : doc.first_sentence,
        }));
        setResults(mapped);
      } else {
        const res = await fetch(
          `https://itunes.apple.com/search?term=${encodeURIComponent(query.trim())}&entity=song&limit=8`
        );
        if (!res.ok) throw new Error('Failed to query iTunes Search API');
        const data = await res.json();
        const mapped: SongResult[] = (data.results || []).slice(0, 8).map((track: any) => ({
          type: 'song',
          title: track.trackName || 'Untitled Track',
          artist: track.artistName || 'Unknown Artist',
          album: track.collectionName,
          year: track.releaseDate ? track.releaseDate.substring(0, 4) : undefined,
          artworkUrl: track.artworkUrl100 ? track.artworkUrl100.replace('100x100bb', '600x600bb') : undefined,
        }));
        setResults(mapped);
      }
    } catch (err: any) {
      console.error('Search error:', err);
      setError('Could not connect to metadata service. Please check connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-lg rounded-2xl border shadow-2xl flex flex-col overflow-hidden transition-all ${
          isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#14171d] border-[#262c36]'
        }`}
      >
        {/* Header */}
        <div className={`p-4 border-b flex items-center justify-between ${isLight ? 'border-[#e2e8f0]' : 'border-[#262c36]'}`}>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#fcd535]" />
            <h2 className={`text-sm font-bold tracking-tight ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
              Import Book / Song Metadata
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#707a8a] hover:text-current hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher: Books vs Songs */}
        <div className={`p-3 border-b flex items-center gap-2 ${isLight ? 'bg-[#f8fafc] border-[#e2e8f0]' : 'bg-[#181d24] border-[#262c36]'}`}>
          <button
            onClick={() => {
              setActiveTab('book');
              setResults([]);
            }}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'book'
                ? isLight
                  ? 'bg-white text-[#0f172a] shadow-sm'
                  : 'bg-[#222730] text-white shadow-sm'
                : 'text-[#707a8a] hover:text-current'
            }`}
          >
            <Book className="w-3.5 h-3.5 text-[#d97706] dark:text-[#fcd535]" />
            <span>Open Library Books</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('music');
              setResults([]);
            }}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'music'
                ? isLight
                  ? 'bg-white text-[#0f172a] shadow-sm'
                  : 'bg-[#222730] text-white shadow-sm'
                : 'text-[#707a8a] hover:text-current'
            }`}
          >
            <Music className="w-3.5 h-3.5 text-[#d97706] dark:text-[#fcd535]" />
            <span>iTunes Songs &amp; Albums</span>
          </button>
        </div>

        {/* Search input bar */}
        <form onSubmit={handleSearch} className="p-3">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-3 text-[#707a8a] pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={activeTab === 'book' ? 'Search title or author (e.g. Albert Camus, Dune)...' : 'Search song or artist (e.g. Frank Ocean, Blonde)...'}
              className={`w-full pl-9 pr-20 py-2 rounded-xl text-xs border outline-none transition-all ${
                isLight
                  ? 'bg-white border-[#cbd5e1] text-[#0f172a] focus:border-[#d97706]'
                  : 'bg-[#181d24] border-[#262c36] text-white focus:border-[#fcd535]'
              }`}
              autoFocus
            />
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="absolute right-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-[#fcd535] text-[#0b0e11] hover:bg-[#ffe270] disabled:opacity-40 transition-all cursor-pointer"
            >
              {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Search'}
            </button>
          </div>
        </form>

        {/* Results Area */}
        <div className="flex-1 max-h-72 overflow-y-auto px-3 pb-3 flex flex-col gap-2">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs">
              {error}
            </div>
          )}

          {results.length === 0 && !isLoading && !error && (
            <div className="p-6 text-center text-xs text-[#707a8a] flex flex-col items-center gap-1">
              <span>Type a title, author, or track name above and press Search.</span>
              <span className="text-[10px] opacity-75">Data is loaded directly in your browser without tracking.</span>
            </div>
          )}

          {results.map((item, idx) => (
            <div
              key={idx}
              onClick={() => {
                onSelect(item);
                onClose();
              }}
              className={`p-2.5 rounded-xl border flex items-center gap-3 transition-all cursor-pointer group ${
                isLight
                  ? 'bg-white border-[#e2e8f0] hover:border-[#cbd5e1] hover:bg-[#f8fafc]'
                  : 'bg-[#181d24] border-[#262c36] hover:border-[#3a4250] hover:bg-[#1f252e]'
              }`}
            >
              {item.type === 'book' ? (
                item.coverUrl ? (
                  <img
                    src={item.coverUrl}
                    alt={item.title}
                    className="w-10 h-14 object-cover rounded shadow-sm shrink-0 border border-black/10"
                  />
                ) : (
                  <div className="w-10 h-14 rounded bg-black/10 dark:bg-white/5 border border-current/10 flex items-center justify-center shrink-0">
                    <Book className="w-4 h-4 text-[#707a8a]" />
                  </div>
                )
              ) : item.artworkUrl ? (
                <img
                  src={item.artworkUrl}
                  alt={item.title}
                  className="w-12 h-12 object-cover rounded-lg shadow-sm shrink-0 border border-black/10"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-black/10 dark:bg-white/5 border border-current/10 flex items-center justify-center shrink-0">
                  <Music className="w-4 h-4 text-[#707a8a]" />
                </div>
              )}

              <div className="flex-1 min-w-0 flex flex-col">
                <span className={`text-xs font-bold truncate ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
                  {item.title}
                </span>
                <span className="text-[11px] text-[#707a8a] truncate">
                  {item.type === 'book' ? item.author : `${item.artist} ${item.album ? `• ${item.album}` : ''}`}
                </span>
                {item.year && (
                  <span className="text-[10px] font-mono text-[#d97706] dark:text-[#fcd535] mt-0.5">
                    {item.year}
                  </span>
                )}
              </div>

              <button
                type="button"
                className="opacity-0 group-hover:opacity-100 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[#fcd535] text-[#0b0e11] shrink-0 transition-opacity flex items-center gap-1"
              >
                <span>Apply</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
