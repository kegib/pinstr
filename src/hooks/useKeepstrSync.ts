/**
 * Keepstr sync engine.
 * Subscribes to Nostr relays for kind 30078 events tagged with the keepstr label,
 * decrypts private events, and upserts into IndexedDB.
 * Also handles publishing events when bookmarks/collections change.
 */

import { useCallback, useRef, useState } from 'react';
import { useNostr } from '@nostrify/react';
import { useCurrentUser } from './useCurrentUser';
import { db } from '@/lib/db';
import {
  nip44Encrypt,
  nip44Decrypt,
} from '@/lib/encryption';
import {
  getKeepstrEventType,
  isPublicEvent,
  getTagValue,
  parsePublicBookmarkTags,
  parsePublicCollectionTags,
  extractIdFromDTag,
  buildPrivateBookmarkEvent,
  buildPublicBookmarkEvent,
  buildPrivateCollectionEvent,
  buildPublicCollectionEvent,
  buildSettingsEvent,
  buildDeletionEvent,
  buildNip51BookmarkListEvent,
  buildNip51CollectionEvent,
  KEEPSTR_KIND,
  NIP51_BOOKMARKS_KIND,
  NIP51_COLLECTION_KIND,
} from '@/lib/events';
import type { LocalBookmark, LocalCollection, BookmarkData, CollectionData, UserSettings } from '@/lib/types';
import type { NostrEvent } from '@nostrify/nostrify';

export type SyncStatus = 'idle' | 'syncing' | 'error';

export function useKeepstrSync() {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();
  const [status, setStatus] = useState<SyncStatus>('idle');
  const abortRef = useRef<AbortController | null>(null);

  const processEvent = useCallback(
    async (event: NostrEvent) => {
      if (event.kind !== KEEPSTR_KIND) return;
      if (!user) return;

      const type = getKeepstrEventType(event.tags);
      if (!type) return;

      const isPublic = isPublicEvent(event.tags);
      const dTag = getTagValue(event.tags, 'd') ?? '';

      try {
        if (type === 'bookmark') {
          const id = extractIdFromDTag(dTag, 'keepstr/b/');

          let data: Partial<BookmarkData>;
          if (isPublic) {
            data = {
              ...parsePublicBookmarkTags(event.tags),
              notes: event.content,
            };
          } else {
            const decrypted = await nip44Decrypt(user.signer, event.content);
            data = JSON.parse(decrypted) as Partial<BookmarkData>;
          }

          const existing = await db.bookmarks.get(id);
          const eventCreatedAt = event.created_at * 1000;

          if (existing && existing.updatedAt > eventCreatedAt) {
            // Local version is newer — keep it
            return;
          }

          const now = Date.now();
          const bookmark: LocalBookmark = {
            id,
            url: data.url ?? '',
            title: data.title ?? '',
            description: data.description ?? '',
            image: data.image ?? null,
            favicon: data.favicon ?? null,
            tags: data.tags ?? [],
            collections: data.collections ?? [],
            notes: data.notes ?? '',
            isPublic: data.isPublic ?? false,
            savedAt: data.savedAt ?? eventCreatedAt,
            eventId: event.id,
            createdAt: existing?.createdAt ?? eventCreatedAt,
            updatedAt: eventCreatedAt,
            syncedAt: now,
          };

          await db.bookmarks.put(bookmark);
        } else if (type === 'collection') {
          const id = extractIdFromDTag(dTag, 'keepstr/c/');

          let data: Partial<CollectionData>;
          if (isPublic) {
            data = parsePublicCollectionTags(event.tags);
          } else {
            const decrypted = await nip44Decrypt(user.signer, event.content);
            data = JSON.parse(decrypted) as Partial<CollectionData>;
          }

          const existing = await db.collections.get(id);
          const eventCreatedAt = event.created_at * 1000;

          if (existing && existing.updatedAt > eventCreatedAt) {
            return;
          }

          const collection: LocalCollection = {
            id,
            name: data.name ?? '',
            description: data.description ?? '',
            icon: data.icon ?? '📚',
            color: data.color ?? '#6366f1',
            isPublic: data.isPublic ?? false,
            sortOrder: data.sortOrder ?? 0,
            eventId: event.id,
            createdAt: existing?.createdAt ?? eventCreatedAt,
            updatedAt: eventCreatedAt,
            syncedAt: Date.now(),
          };

          await db.collections.put(collection);
        } else if (type === 'settings') {
          // Settings are handled separately
        }
      } catch (err) {
        console.warn('Failed to process Keepstr event', event.id, err);
      }
    },
    [user],
  );

  const startSync = useCallback(
    async (pubkey: string) => {
      if (abortRef.current) {
        abortRef.current.abort();
      }

      const controller = new AbortController();
      abortRef.current = controller;
      setStatus('syncing');

      try {
        const events = await nostr.query(
          [
            {
              kinds: [KEEPSTR_KIND],
              authors: [pubkey],
              '#L': ['keepstr'],
            },
          ],
          { signal: AbortSignal.timeout(10000) },
        );

        for (const event of events) {
          await processEvent(event);
        }

        setStatus('idle');
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error('Keepstr sync error:', err);
          setStatus('error');
        }
      }
    },
    [nostr, processEvent],
  );

  const stopSync = useCallback(() => {
    abortRef.current?.abort();
    setStatus('idle');
  }, []);

  const publishBookmark = useCallback(
    async (bookmark: LocalBookmark): Promise<string | null> => {
      if (!user) return null;

      let eventTemplate: { kind: number; tags: string[][]; content: string };

      if (bookmark.isPublic) {
        eventTemplate = buildPublicBookmarkEvent(bookmark);
      } else {
        const json = JSON.stringify({
          id: bookmark.id,
          url: bookmark.url,
          title: bookmark.title,
          description: bookmark.description,
          image: bookmark.image,
          favicon: bookmark.favicon,
          tags: bookmark.tags,
          collections: bookmark.collections,
          notes: bookmark.notes,
          isPublic: bookmark.isPublic,
          savedAt: bookmark.savedAt,
        } satisfies BookmarkData);
        const encrypted = await nip44Encrypt(user.signer, json);
        eventTemplate = buildPrivateBookmarkEvent(bookmark, encrypted);
      }

      const event = await user.signer.signEvent({
        ...eventTemplate,
        created_at: Math.floor(Date.now() / 1000),
      });

      await nostr.event(event, { signal: AbortSignal.timeout(5000) });

      // Update syncedAt in DB
      await db.bookmarks.update(bookmark.id, {
        eventId: event.id,
        syncedAt: Date.now(),
      });

      // If public, also update NIP-51 kind 10003
      if (bookmark.isPublic) {
        await publishNip51BookmarkList();
      }

      return event.id;
    },
    [user, nostr],
  );

  const publishCollection = useCallback(
    async (collection: LocalCollection): Promise<string | null> => {
      if (!user) return null;

      let eventTemplate: { kind: number; tags: string[][]; content: string };

      if (collection.isPublic) {
        eventTemplate = buildPublicCollectionEvent(collection);
      } else {
        const json = JSON.stringify({
          id: collection.id,
          name: collection.name,
          description: collection.description,
          icon: collection.icon,
          color: collection.color,
          isPublic: collection.isPublic,
          sortOrder: collection.sortOrder,
        } satisfies CollectionData);
        const encrypted = await nip44Encrypt(user.signer, json);
        eventTemplate = buildPrivateCollectionEvent(collection, encrypted);
      }

      const event = await user.signer.signEvent({
        ...eventTemplate,
        created_at: Math.floor(Date.now() / 1000),
      });

      await nostr.event(event, { signal: AbortSignal.timeout(5000) });

      await db.collections.update(collection.id, {
        eventId: event.id,
        syncedAt: Date.now(),
      });

      // If public, also update NIP-51 kind 30003
      if (collection.isPublic) {
        const collectionBookmarks = await db.bookmarks
          .where('collections')
          .equals(collection.id)
          .toArray();
        const publicUrls = collectionBookmarks
          .filter((b) => b.isPublic)
          .map((b) => b.url);
        const nip51Template = buildNip51CollectionEvent(collection, publicUrls);
        const nip51Event = await user.signer.signEvent({
          ...nip51Template,
          created_at: Math.floor(Date.now() / 1000),
        });
        await nostr.event(nip51Event, { signal: AbortSignal.timeout(5000) });
      }

      return event.id;
    },
    [user, nostr],
  );

  const publishNip51BookmarkList = useCallback(async () => {
    if (!user) return;
    const publicBookmarks = await db.bookmarks
      .filter((b) => b.isPublic)
      .toArray();
    const urls = publicBookmarks.map((b) => b.url);
    const template = buildNip51BookmarkListEvent(urls);
    const event = await user.signer.signEvent({
      ...template,
      created_at: Math.floor(Date.now() / 1000),
    });
    await nostr.event(event, { signal: AbortSignal.timeout(5000) });
  }, [user, nostr]);

  const publishSettings = useCallback(
    async (settings: UserSettings): Promise<void> => {
      if (!user) return;
      const json = JSON.stringify(settings);
      const encrypted = await nip44Encrypt(user.signer, json);
      const template = buildSettingsEvent(encrypted);
      const event = await user.signer.signEvent({
        ...template,
        created_at: Math.floor(Date.now() / 1000),
      });
      await nostr.event(event, { signal: AbortSignal.timeout(5000) });
    },
    [user, nostr],
  );

  const deleteNostrEvent = useCallback(
    async (eventIds: string[]): Promise<void> => {
      if (!user || eventIds.length === 0) return;
      const template = buildDeletionEvent(eventIds);
      const event = await user.signer.signEvent({
        ...template,
        created_at: Math.floor(Date.now() / 1000),
      });
      await nostr.event(event, { signal: AbortSignal.timeout(5000) });
    },
    [user, nostr],
  );

  return {
    status,
    startSync,
    stopSync,
    publishBookmark,
    publishCollection,
    publishSettings,
    deleteNostrEvent,
  };
}
