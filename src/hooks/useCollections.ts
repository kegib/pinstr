import { useCallback, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { nanoid } from 'nanoid';
import { db } from '@/lib/db';
import type { CollectionData, LocalCollection } from '@/lib/types';
import { COLLECTION_COLORS, COLLECTION_ICONS } from '@/lib/types';

export function useCollections() {
  const [collections, setCollections] = useState<LocalCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  const refresh = useCallback(async () => {
    const all = await db.collections.orderBy('sortOrder').toArray();
    setCollections(all);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const handle = setInterval(refresh, 2000);
    return () => clearInterval(handle);
  }, [refresh]);

  const createCollection = useCallback(
    async (
      data: Partial<CollectionData> & { name: string },
    ): Promise<LocalCollection> => {
      const now = Date.now();
      const count = await db.collections.count();
      const collection: LocalCollection = {
        id: nanoid(),
        name: data.name,
        description: data.description ?? '',
        icon: data.icon ?? COLLECTION_ICONS[Math.floor(Math.random() * COLLECTION_ICONS.length)],
        color: data.color ?? COLLECTION_COLORS[Math.floor(Math.random() * COLLECTION_COLORS.length)],
        isPublic: data.isPublic ?? false,
        sortOrder: data.sortOrder ?? count,
        eventId: null,
        createdAt: now,
        updatedAt: now,
        syncedAt: null,
      };
      await db.collections.add(collection);
      await refresh();
      queryClient.invalidateQueries({ queryKey: ['pinstr', 'collections'] });
      return collection;
    },
    [refresh, queryClient],
  );

  const updateCollection = useCallback(
    async (id: string, changes: Partial<CollectionData>): Promise<void> => {
      await db.collections.update(id, { ...changes, updatedAt: Date.now() });
      await refresh();
      queryClient.invalidateQueries({ queryKey: ['pinstr', 'collections'] });
    },
    [refresh, queryClient],
  );

  const deleteCollection = useCallback(
    async (id: string): Promise<void> => {
      // Remove the collection from all bookmarks that reference it
      const affected = await db.bookmarks
        .where('collections')
        .equals(id)
        .toArray();

      for (const bm of affected) {
        await db.bookmarks.update(bm.id, {
          collections: bm.collections.filter((c) => c !== id),
          updatedAt: Date.now(),
        });
      }

      await db.collections.delete(id);
      await refresh();
      queryClient.invalidateQueries({ queryKey: ['pinstr', 'collections'] });
    },
    [refresh, queryClient],
  );

  const getCollection = useCallback(
    async (id: string): Promise<LocalCollection | undefined> => {
      return db.collections.get(id);
    },
    [],
  );

  return {
    collections,
    loading,
    refresh,
    createCollection,
    updateCollection,
    deleteCollection,
    getCollection,
  };
}
