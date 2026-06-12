/**
 * Nostr event builders for Keepstr.
 * All custom events use kind 30078 (NIP-78 application-specific data).
 */

import type { BookmarkData, CollectionData, UserSettings } from './types';

export const KEEPSTR_KIND = 30078;
export const NIP51_BOOKMARKS_KIND = 10003;
export const NIP51_COLLECTION_KIND = 30003;
export const DELETION_KIND = 5;

// ─── Event tag helpers ───────────────────────────────────────────────────────

export function keepstrBookmarkDTag(id: string) {
  return `keepstr/b/${id}`;
}

export function keepstrCollectionDTag(id: string) {
  return `keepstr/c/${id}`;
}

export const KEEPSTR_SETTINGS_DTAG = 'keepstr/settings';

function labelTags(type: 'bookmark' | 'collection' | 'settings'): string[][] {
  return [
    ['L', 'keepstr'],
    ['l', type, 'keepstr'],
  ];
}

// ─── Bookmark event builders ─────────────────────────────────────────────────

export interface PrivateBookmarkEventTemplate {
  kind: typeof KEEPSTR_KIND;
  tags: string[][];
  content: string; // NIP-44 encrypted JSON
}

export interface PublicBookmarkEventTemplate {
  kind: typeof KEEPSTR_KIND;
  tags: string[][];
  content: string; // user notes (plaintext)
}

export function buildPrivateBookmarkEvent(
  bookmark: BookmarkData,
  encryptedContent: string,
): PrivateBookmarkEventTemplate {
  return {
    kind: KEEPSTR_KIND,
    tags: [
      ['d', keepstrBookmarkDTag(bookmark.id)],
      ...labelTags('bookmark'),
    ],
    content: encryptedContent,
  };
}

export function buildPublicBookmarkEvent(
  bookmark: BookmarkData,
): PublicBookmarkEventTemplate {
  const tags: string[][] = [
    ['d', keepstrBookmarkDTag(bookmark.id)],
    ...labelTags('bookmark'),
    ['r', bookmark.url],
    ['title', bookmark.title],
    ['public', 'true'],
  ];

  if (bookmark.description) {
    tags.push(['description', bookmark.description]);
  }
  if (bookmark.image) {
    tags.push(['image', bookmark.image]);
  }
  for (const tag of bookmark.tags) {
    tags.push(['t', tag]);
  }
  for (const col of bookmark.collections) {
    tags.push(['collection', col]);
  }

  return {
    kind: KEEPSTR_KIND,
    tags,
    content: bookmark.notes,
  };
}

// ─── Collection event builders ───────────────────────────────────────────────

export function buildPrivateCollectionEvent(
  collection: CollectionData,
  encryptedContent: string,
): { kind: typeof KEEPSTR_KIND; tags: string[][]; content: string } {
  return {
    kind: KEEPSTR_KIND,
    tags: [
      ['d', keepstrCollectionDTag(collection.id)],
      ...labelTags('collection'),
    ],
    content: encryptedContent,
  };
}

export function buildPublicCollectionEvent(
  collection: CollectionData,
): { kind: typeof KEEPSTR_KIND; tags: string[][]; content: string } {
  const tags: string[][] = [
    ['d', keepstrCollectionDTag(collection.id)],
    ...labelTags('collection'),
    ['title', collection.name],
    ['public', 'true'],
  ];

  if (collection.description) {
    tags.push(['description', collection.description]);
  }
  if (collection.icon) {
    tags.push(['image', collection.icon]);
  }

  return {
    kind: KEEPSTR_KIND,
    tags,
    content: '',
  };
}

// ─── Settings event builder ───────────────────────────────────────────────────

export function buildSettingsEvent(
  encryptedContent: string,
): { kind: typeof KEEPSTR_KIND; tags: string[][]; content: string } {
  return {
    kind: KEEPSTR_KIND,
    tags: [
      ['d', KEEPSTR_SETTINGS_DTAG],
      ...labelTags('settings'),
    ],
    content: encryptedContent,
  };
}

// ─── NIP-51 event builders ───────────────────────────────────────────────────

export function buildNip51BookmarkListEvent(
  publicUrls: string[],
): { kind: typeof NIP51_BOOKMARKS_KIND; tags: string[][]; content: string } {
  return {
    kind: NIP51_BOOKMARKS_KIND,
    tags: publicUrls.map((url) => ['r', url]),
    content: '',
  };
}

export function buildNip51CollectionEvent(
  collection: CollectionData,
  bookmarkUrls: string[],
): { kind: typeof NIP51_COLLECTION_KIND; tags: string[][]; content: string } {
  const slug = collection.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  return {
    kind: NIP51_COLLECTION_KIND,
    tags: [
      ['d', slug || collection.id],
      ['name', collection.name],
      ['description', collection.description],
      ...bookmarkUrls.map((url) => ['r', url]),
    ],
    content: '',
  };
}

// ─── Deletion event builder ──────────────────────────────────────────────────

export function buildDeletionEvent(
  eventIds: string[],
  reason?: string,
): { kind: typeof DELETION_KIND; tags: string[][]; content: string } {
  return {
    kind: DELETION_KIND,
    tags: eventIds.map((id) => ['e', id]),
    content: reason ?? '',
  };
}

// ─── Parsers ─────────────────────────────────────────────────────────────────

export function getTagValue(tags: string[][], name: string): string | null {
  return tags.find(([t]) => t === name)?.[1] ?? null;
}

export function getTagValues(tags: string[][], name: string): string[] {
  return tags.filter(([t]) => t === name).map(([, v]) => v ?? '');
}

export function isPublicEvent(tags: string[][]): boolean {
  return tags.some(([t, v]) => t === 'public' && v === 'true');
}

export function getKeepstrEventType(
  tags: string[][],
): 'bookmark' | 'collection' | 'settings' | null {
  const dTag = getTagValue(tags, 'd') ?? '';
  if (dTag.startsWith('keepstr/b/')) return 'bookmark';
  if (dTag.startsWith('keepstr/c/')) return 'collection';
  if (dTag === 'keepstr/settings') return 'settings';
  return null;
}

export function parsePublicBookmarkTags(tags: string[][]): Partial<BookmarkData> {
  return {
    url: getTagValue(tags, 'r') ?? '',
    title: getTagValue(tags, 'title') ?? '',
    description: getTagValue(tags, 'description') ?? '',
    image: getTagValue(tags, 'image'),
    tags: getTagValues(tags, 't'),
    collections: getTagValues(tags, 'collection'),
    isPublic: true,
  };
}

export function parsePublicCollectionTags(tags: string[][]): Partial<CollectionData> {
  return {
    name: getTagValue(tags, 'title') ?? '',
    description: getTagValue(tags, 'description') ?? '',
    isPublic: true,
  };
}

export function extractIdFromDTag(dTag: string, prefix: string): string {
  return dTag.startsWith(prefix) ? dTag.slice(prefix.length) : dTag;
}

export function parseUserSettings(json: string): UserSettings | null {
  try {
    return JSON.parse(json) as UserSettings;
  } catch {
    return null;
  }
}
