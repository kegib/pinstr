import MiniSearch from 'minisearch';
import type { LocalBookmark } from './types';

export interface SearchDocument {
  id: string;
  title: string;
  description: string;
  notes: string;
  url: string;
  tags: string;
}

export function createSearchIndex(): MiniSearch<SearchDocument> {
  return new MiniSearch<SearchDocument>({
    fields: ['title', 'description', 'notes', 'url', 'tags'],
    storeFields: ['id'],
    searchOptions: {
      boost: { title: 3, description: 1.5, notes: 1, url: 0.5 },
      fuzzy: 0.2,
      prefix: true,
    },
  });
}

export function bookmarkToDocument(bookmark: LocalBookmark): SearchDocument {
  return {
    id: bookmark.id,
    title: bookmark.title,
    description: bookmark.description,
    notes: bookmark.notes,
    url: bookmark.url,
    tags: bookmark.tags.join(' '),
  };
}

export function buildSearchIndex(bookmarks: LocalBookmark[]): MiniSearch<SearchDocument> {
  const index = createSearchIndex();
  index.addAll(bookmarks.map(bookmarkToDocument));
  return index;
}

export function searchBookmarks(
  index: MiniSearch<SearchDocument>,
  query: string,
): string[] {
  if (!query.trim()) return [];
  const results = index.search(query);
  return results.map((r) => r.id as string);
}
