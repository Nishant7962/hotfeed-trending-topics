import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useSearch } from '../../hooks/useSearch';

interface SearchBarProps {
  isMobile?: boolean;
  onClose?: () => void;
}

export function SearchBar({ isMobile = false, onClose }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const { results } = useSearch(query);

  useEffect(() => {
    if (query.trim().length >= 2) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [query, results]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const highlightMatch = (text: string, q: string) => {
    const parts = text.split(new RegExp(`(${q})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === q.toLowerCase() ? (
        <span key={i} className="text-[#FF5C35]">{part}</span>
      ) : (
        part
      )
    );
  };

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50 glass-card backdrop-blur-xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-[24px] text-[#E8F4F0]">Search</h2>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[rgba(255,255,255,0.06)] transition-colors"
            >
              <X className="w-6 h-6 text-[#7BADB0]" />
            </button>
          </div>
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search trending topics..."
              className="w-full bg-[rgba(8,28,44,0.55)] border border-[rgba(0,200,180,0.10)] rounded-2xl px-4 py-4 text-[18px] font-body text-[#E8F4F0] placeholder:text-[#7BADB0] focus:outline-none focus:border-[rgba(0,200,180,0.3)]"
              autoFocus
            />
          </div>
          {results.length > 0 && (
            <div className="mt-6 space-y-3">
              {results.slice(0, 5).map((result) => (
                <div
                  key={result.id}
                  className="glass-card p-4 cursor-pointer hover:border-[rgba(0,200,180,0.3)] transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="text-[11px] font-display uppercase text-[#7BADB0] mb-1">
                        {result.category}
                      </div>
                      <div className="text-[14px] font-body text-[#E8F4F0]">
                        {highlightMatch(result.title, query)}
                      </div>
                    </div>
                    <div className="font-mono text-[12px] text-[#7BADB0]">
                      {result.score.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {query && results.length === 0 && (
            <div className="mt-12 text-center">
              <p className="font-display text-[16px] text-[#7BADB0] mb-2">Nothing matched</p>
              <button
                onClick={() => setQuery('')}
                className="glass-pill px-4 py-2 text-[13px] font-body text-[#7BADB0] hover:text-[#E8F4F0] transition-colors"
              >
                Clear search
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div ref={searchRef} className="relative w-64">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7BADB0]" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search..."
          className="w-full bg-transparent border-b border-[rgba(0,200,180,0.10)] pl-10 pr-3 py-2 text-[14px] font-body text-[#E8F4F0] placeholder:text-[#7BADB0] focus:outline-none focus:border-[rgba(0,200,180,0.3)] transition-colors"
        />
      </div>
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 glass-card p-2 z-50 max-h-[400px] overflow-y-auto">
          {results.slice(0, 5).map((result) => (
            <div
              key={result.id}
              className="p-3 rounded-lg hover:bg-[rgba(0,200,180,0.08)] cursor-pointer transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="text-[10px] font-display uppercase text-[#7BADB0] mb-1">
                    {result.category}
                  </div>
                  <div className="text-[13px] font-body text-[#E8F4F0] line-clamp-2">
                    {highlightMatch(result.title, query)}
                  </div>
                </div>
                <div className="font-mono text-[11px] text-[#7BADB0] whitespace-nowrap">
                  {result.score.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {isOpen && query && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 glass-card p-4 z-50 text-center">
          <p className="text-[13px] font-body text-[#7BADB0]">Nothing matched</p>
        </div>
      )}
    </div>
  );
}
