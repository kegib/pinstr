import Dexie, { type EntityTable } from 'dexie';
import type { LocalBookmark, LocalCollection } from './types';

interface SyncMeta {
  key: string;
  value: string | number | null;
}

class PinstrDatabase extends Dexie {
  bookmarks!: EntityTable<LocalBookmark, 'id'>;
  collections!: EntityTable<LocalCollection, 'id'>;
  syncMeta!: EntityTable<SyncMeta, 'key'>;

  constructor() {
    super('pinstr');

    this.version(1).stores({
      bookmarks: 'id, url, *tags, *collections, createdAt, updatedAt',
      collections: 'id, name, sortOrder',
      syncMeta: 'key',
    });
  }
}

export const db = new PinstrDatabase();
