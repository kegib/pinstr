import { useState } from 'react';
import { useSeoMeta } from '@unhead/react';
import { toast } from 'sonner';
import { Plus, Trash2, Moon, Sun, Monitor, Download, Loader2, Wifi } from 'lucide-react';
import { usePinstrSettings } from '@/hooks/usePinstrSettings';
import { usePinstrSync } from '@/hooks/usePinstrSync';
import { useAppLayout } from './AppLayout';
import { useAppContext } from '@/hooks/useAppContext';
import { SUGGESTED_RELAYS } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/lib/db';

type ThemeOption = 'light' | 'dark' | 'system';

const THEME_OPTIONS: { value: ThemeOption; label: string; icon: React.ReactNode }[] = [
  { value: 'light', label: 'Light', icon: <Sun className="w-4 h-4" /> },
  { value: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4" /> },
  { value: 'system', label: 'System', icon: <Monitor className="w-4 h-4" /> },
];

export default function AppSettings() {
  useSeoMeta({ title: 'Settings — Pinstr' });

  const { settings, updateSettings } = usePinstrSettings();
  const sync = usePinstrSync();
  const { updateConfig } = useAppContext();
  const { bookmarks, collections } = useAppLayout();

  const [newRelay, setNewRelay] = useState('');
  const [exporting, setExporting] = useState(false);

  const addRelay = async () => {
    const url = newRelay.trim();
    if (!url) return;
    if (!url.startsWith('wss://') && !url.startsWith('ws://')) {
      toast.error('Relay URL must start with wss:// or ws://');
      return;
    }
    if (settings.relays.includes(url)) {
      toast.error('Relay already added');
      return;
    }
    const updated = { ...settings, relays: [...settings.relays, url] };
    await updateSettings(updated);
    // Update app relay config
    updateConfig((c) => ({
      ...c,
      relayMetadata: {
        relays: updated.relays.map((r) => ({ url: r, read: true, write: true })),
        updatedAt: Date.now(),
      },
    }));
    try {
      await sync.publishSettings(updated);
    } catch { /* silent */ }
    setNewRelay('');
    toast.success('Relay added');
  };

  const removeRelay = async (url: string) => {
    const updated = { ...settings, relays: settings.relays.filter((r) => r !== url) };
    await updateSettings(updated);
    updateConfig((c) => ({
      ...c,
      relayMetadata: {
        relays: updated.relays.map((r) => ({ url: r, read: true, write: true })),
        updatedAt: Date.now(),
      },
    }));
    try {
      await sync.publishSettings(updated);
    } catch { /* silent */ }
    toast.success('Relay removed');
  };

  const handleThemeChange = async (theme: ThemeOption) => {
    await updateSettings({ theme });
    updateConfig((c) => ({ ...c, theme }));
  };

  const handleDefaultVisibilityChange = async (isPublic: boolean) => {
    await updateSettings({ defaultVisibility: isPublic ? 'public' : 'private' });
  };

  const exportBookmarks = async () => {
    setExporting(true);
    try {
      const all = await db.bookmarks.toArray();
      const json = JSON.stringify(all, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pinstr-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Bookmarks exported');
    } catch {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize how Pinstr looks.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="mb-2 block">Theme</Label>
            <div className="flex gap-2">
              {THEME_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleThemeChange(opt.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                    settings.theme === opt.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {opt.icon}
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy defaults */}
      <Card>
        <CardHeader>
          <CardTitle>Privacy Defaults</CardTitle>
          <CardDescription>
            Control the default visibility for new bookmarks and collections.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">
                New bookmarks are public by default
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                When off, all new bookmarks are encrypted and private.
              </p>
            </div>
            <Switch
              checked={settings.defaultVisibility === 'public'}
              onCheckedChange={handleDefaultVisibilityChange}
            />
          </div>
          <div className="mt-4 p-3 bg-muted rounded-lg text-xs text-muted-foreground">
            <strong>What "public" means:</strong> Public bookmarks are stored as plaintext on
            Nostr relays and visible to anyone who queries your pubkey. They appear on your
            public profile page at /p/[npub]. Private bookmarks are NIP-44 encrypted and
            only readable by you.
          </div>
        </CardContent>
      </Card>

      {/* Relays */}
      <Card>
        <CardHeader>
          <CardTitle>Nostr Relays</CardTitle>
          <CardDescription>
            Relays are used to sync your bookmarks across devices.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {settings.relays.map((relay) => (
            <div
              key={relay}
              className="flex items-center gap-3 p-3 bg-muted rounded-lg"
            >
              <Wifi className="w-4 h-4 text-green-500 shrink-0" />
              <span className="text-sm flex-1 truncate font-mono">{relay}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive shrink-0"
                onClick={() => removeRelay(relay)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}

          <div className="flex gap-2">
            <Input
              placeholder="wss://relay.example.com"
              value={newRelay}
              onChange={(e) => setNewRelay(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addRelay()}
              className="font-mono text-sm"
            />
            <Button onClick={addRelay} className="shrink-0">
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Suggested relays */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Suggested relays:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_RELAYS.filter((r) => !settings.relays.includes(r)).map((r) => (
                <button
                  key={r}
                  onClick={() => setNewRelay(r)}
                  className="text-xs px-2 py-1 rounded-md bg-muted hover:bg-accent transition-colors font-mono"
                >
                  {r.replace('wss://', '')}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export */}
      <Card>
        <CardHeader>
          <CardTitle>Export Data</CardTitle>
          <CardDescription>
            Download all your bookmarks as a JSON file.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Export all bookmarks</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {bookmarks.length} bookmarks · {collections.length} collections
              </p>
            </div>
            <Button
              variant="outline"
              onClick={exportBookmarks}
              disabled={exporting}
              className="gap-1.5"
            >
              {exporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Export JSON
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <div className="text-center text-xs text-muted-foreground pb-8">
        <p>
          Pinstr — Decentralized Bookmark Manager
        </p>
        <p className="mt-1">
          Vibed with{' '}
          <a
            href="https://shakespeare.diy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Shakespeare
          </a>
        </p>
      </div>
    </div>
  );
}
