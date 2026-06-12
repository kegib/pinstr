// ─── Core data types ────────────────────────────────────────────────────────

export interface BookmarkData {
  id: string;
  url: string;
  title: string;
  description: string;
  image: string | null;
  favicon: string | null;
  tags: string[];
  collections: string[];
  notes: string;
  isPublic: boolean;
  savedAt: number;
}

export interface CollectionData {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  isPublic: boolean;
  sortOrder: number;
}

export interface UserSettings {
  relays: string[];
  defaultVisibility: 'private' | 'public';
  theme: 'light' | 'dark' | 'system';
  defaultCollection: string | null;
}

export interface PageMetadata {
  url: string;
  title: string;
  description: string;
  image: string | null;
  favicon: string | null;
  siteName: string | null;
}

export interface ImportedBookmark {
  url: string;
  title: string;
  addDate: number | null;
  folder: string[];
}

export interface LocalBookmark extends BookmarkData {
  eventId: string | null;
  createdAt: number;
  updatedAt: number;
  syncedAt: number | null;
}

export interface LocalCollection extends CollectionData {
  eventId: string | null;
  createdAt: number;
  updatedAt: number;
  syncedAt: number | null;
}

// ─── Default values ──────────────────────────────────────────────────────────

export const DEFAULT_USER_SETTINGS: UserSettings = {
  relays: ['wss://relay.primal.net'],
  defaultVisibility: 'private',
  theme: 'system',
  defaultCollection: null,
};

export const SUGGESTED_RELAYS = [
  'wss://relay.primal.net',
  'wss://relay.damus.io',
  'wss://nos.lol',
  'wss://relay.nostr.band',
  'wss://purplepag.es',
] as const;

export const COLLECTION_COLORS = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#64748b', // slate
] as const;

export const COLLECTION_ICONS = [
  '📚', '🔖', '⭐', '🎯', '🚀', '💡', '🔍', '🎨',
  '🛠️', '📊', '🌐', '🎵', '🎬', '📰', '🏠', '💼',
  '🌱', '🔬', '🏋️', '✈️',
] as const;
