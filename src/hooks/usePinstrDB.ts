/**
 * Hook to access the Pinstr IndexedDB database.
 * Returns the Dexie db instance plus reactive helpers.
 */
import { db } from '@/lib/db';
export { db };
export function usePinstrDB() {
  return db;
}
