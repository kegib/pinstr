import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { buildSearchIndex, searchBookmarks } from '@/lib/search';
import type { LocalBookmark } from '@/lib/types';
import MiniSearch from 'minisearch';
import type { SearchDocument } from '@/lib/search';

export function usePinstrSearch(bookmarks: LocalBookmark[]) {
  const [query, setQuery] = useState('');
  const indexRef = useRef<MiniSearch<SearchDocument> | null>(null);

  // Rebuild the index whenever bookmarks change
  useEffect(() => {
    indexRef.current = buildSearchIndex(bookmarks);
  }, [bookmarks]);

  const search = useCallback((q: string): string[] => {
    if (!indexRef.current || !q.trim()) return [];
    return searchBookmarks(indexRef.current, q);
  }, []);

  const resultIds = useMemo(() => {
    if (!query.trim()) return null; // null = not searching
    return search(query);
  }, [query, search]);

  const results = useMemo(() => {
    if (resultIds === null) return bookmarks;
    return bookmarks.filter((b) => resultIds.includes(b.id));
  }, [bookmarks, resultIds]);

  return {
    query,
    setQuery,
    results,
    isSearching: Boolean(query.trim()),
  };
}
