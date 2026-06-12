import { useCallback, useEffect, useState } from 'react';
import { db } from '@/lib/db';
import type { UserSettings } from '@/lib/types';
import { DEFAULT_USER_SETTINGS } from '@/lib/types';

export function usePinstrSettings() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_USER_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const stored = await db.syncMeta.get('settings');
      if (stored?.value) {
        try {
          const parsed = JSON.parse(stored.value as string) as UserSettings;
          setSettings({ ...DEFAULT_USER_SETTINGS, ...parsed });
        } catch {
          // ignore parse errors
        }
      }
      setLoading(false);
    };
    load();
  }, []);

  const updateSettings = useCallback(async (changes: Partial<UserSettings>) => {
    const updated = { ...settings, ...changes };
    setSettings(updated);
    await db.syncMeta.put({ key: 'settings', value: JSON.stringify(updated) });
  }, [settings]);

  return { settings, loading, updateSettings };
}
