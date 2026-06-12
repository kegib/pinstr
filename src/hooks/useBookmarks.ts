import { useCallback, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { nanoid } from 'nanoid';
import { db } from '@/lib/db';
import type { BookmarkData, LocalBookmark } from '@/lib/types';

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<LocalBookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  const refresh = useCallback(async () => {
    const all = await db.bookmarks.orderBy('createdAt').reverse().toArray();
    setBookmarks(all);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    // Subscribe to DB changes
    const handle = setInterval(refresh, 2000);
    return () => clearInterval(handle);
  }, [refresh]);

  const saveBookmark = useCallback(
    async (data: Omit<BookmarkData, 'id' | 'savedAt'>): Promise<LocalBookmark> => {
      const now = Date.now();
      const bookmark: LocalBookmark = {
        id: nanoid(),
        savedAt: now,
        eventId: null,
        createdAt: now,
        updatedAt: now,
        syncedAt: null,
        ...data,
      };
      await db.bookmarks.add(bookmark);
      await refresh();
      queryClient.invalidateQueries({ queryKey: ['keepstr', 'bookmarks'] });
      return bookmark;
    },
    [refresh, queryClient],
  );

  const updateBookmark = useCallback(
    async (id: string, changes: Partial<BookmarkData>): Promise<void> => {
      await db.bookmarks.update(id, { ...changes, updatedAt: Date.now() });
      await refresh();
      queryClient.invalidateQueries({ queryKey: ['keepstr', 'bookmarks'] });
    },
    [refresh, queryClient],
  );

  const deleteBookmark = useCallback(
    async (id: string): Promise<void> => {
      await db.bookmarks.delete(id);
      await refresh();
      queryClient.invalidateQueries({ queryKey: ['keepstr', 'bookmarks'] });
    },
    [refresh, queryClient],
  );

  const getBookmark = useCallback(
    async (id: string): Promise<LocalBookmark | undefined> => {
      return db.bookmarks.get(id);
    },
    [],
  );

  const getBookmarksByCollection = useCallback(
    async (collectionId: string): Promise<LocalBookmark[]> => {
      return db.bookmarks.where('collections').equals(collectionId).toArray();
    },
    [],
  );

  const getBookmarksByTag = useCallback(
    async (tag: string): Promise<LocalBookmark[]> => {
      return db.bookmarks.where('tags').equals(tag).toArray();
    },
    [],
  );

  return {
    bookmarks,
    loading,
    refresh,
    saveBookmark,
    updateBookmark,
    deleteBookmark,
    getBookmark,
    getBookmarksByCollection,
    getBookmarksByTag,
  };
}
