import { useState, useEffect } from 'react';
import { apiFetch } from './useApi';
import { Post } from './useHotTopics';

export function useSearch(query: string, category?: string) {
  const [results, setResults] = useState<Post[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const params = new URLSearchParams({ q: query });
        if (category) params.set('category', category);
        const data = await apiFetch<Post[]>(`/api/posts/search?${params.toString()}`);
        setResults(data);
      } catch (err) {
        console.error('[useSearch] Error:', err);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, category]);

  return { results, isSearching };
}
