/**
 * Hook to access the Keepstr IndexedDB database.
 * Returns the Dexie db instance plus reactive helpers.
 */
import { db } from '@/lib/db';
export { db };
export function useKeepstrDB() {
  return db;
}
