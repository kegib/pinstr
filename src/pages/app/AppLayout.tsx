import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useCollections } from '@/hooks/useCollections';
import { useKeepstrSync } from '@/hooks/useKeepstrSync';
import { AppNavBar } from '@/components/keepstr/AppNavBar';
import { AppSidebar } from '@/components/keepstr/AppSidebar';
import { SaveBookmarkModal } from '@/components/keepstr/SaveBookmarkModal';
import { CollectionModal } from '@/components/keepstr/CollectionModal';
import { CommandPalette } from '@/components/keepstr/CommandPalette';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import type { LocalBookmark } from '@/lib/types';

// Context for child pages to trigger modals
import { createContext, useContext } from 'react';

interface AppLayoutContextType {
  openNewBookmark: (url?: string) => void;
  openEditBookmark: (bookmark: LocalBookmark) => void;
  openNewCollection: () => void;
  bookmarks: ReturnType<typeof useBookmarks>['bookmarks'];
  collections: ReturnType<typeof useCollections>['collections'];
  bookmarkCounts: Record<string, number>;
  loadingBookmarks: boolean;
  loadingCollections: boolean;
  publishBookmark: ReturnType<typeof useKeepstrSync>['publishBookmark'];
  deleteBookmarkAndSync: (id: string, eventId: string | null) => Promise<void>;
}

export const AppLayoutContext = createContext<AppLayoutContextType | null>(null);

export function useAppLayout() {
  const ctx = useContext(AppLayoutContext);
  if (!ctx) throw new Error('useAppLayout must be used inside AppLayout');
  return ctx;
}

export function AppLayout() {
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const bookmarksHook = useBookmarks();
  const collectionsHook = useCollections();
  const sync = useKeepstrSync();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [newBookmarkOpen, setNewBookmarkOpen] = useState(false);
  const [newBookmarkUrl, setNewBookmarkUrl] = useState('');
  const [editBookmark, setEditBookmark] = useState<LocalBookmark | undefined>();
  const [newCollectionOpen, setNewCollectionOpen] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (user === undefined) return; // still loading
    // user is only undefined during initial render, null after loading
  }, [user]);

  useEffect(() => {
    // Run sync on mount if user is available
    if (user?.pubkey) {
      sync.startSync(user.pubkey).catch(() => {
        // silent
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.pubkey]);

  // Compute bookmark counts per collection
  const bookmarkCounts: Record<string, number> = {};
  for (const bm of bookmarksHook.bookmarks) {
    for (const colId of bm.collections) {
      bookmarkCounts[colId] = (bookmarkCounts[colId] ?? 0) + 1;
    }
  }

  const openNewBookmark = (url?: string) => {
    setEditBookmark(undefined);
    setNewBookmarkUrl(typeof url === 'string' ? url : '');
    setNewBookmarkOpen(true);
  };

  const openEditBookmark = (bookmark: LocalBookmark) => {
    setEditBookmark(bookmark);
    setNewBookmarkOpen(true);
  };

  const openNewCollection = () => {
    setNewCollectionOpen(true);
  };

  const handleSaveBookmark = async (data: Omit<LocalBookmark, 'id' | 'savedAt' | 'eventId' | 'createdAt' | 'updatedAt' | 'syncedAt'>) => {
    if (editBookmark) {
      await bookmarksHook.updateBookmark(editBookmark.id, data);
      const updated = await bookmarksHook.getBookmark(editBookmark.id);
      if (updated) {
        try {
          await sync.publishBookmark(updated);
        } catch {
          toast.error('Saved locally but failed to sync to Nostr');
        }
      }
    } else {
      const bookmark = await bookmarksHook.saveBookmark(data);
      try {
        await sync.publishBookmark(bookmark);
      } catch {
        toast.error('Saved locally but failed to sync to Nostr');
      }
    }
  };

  const handleSaveCollection = async (data: {
    name: string;
    description: string;
    icon: string;
    color: string;
    isPublic: boolean;
  }) => {
    const col = await collectionsHook.createCollection(data);
    try {
      await sync.publishCollection(col);
    } catch {
      toast.error('Saved locally but failed to sync to Nostr');
    }
  };

  const deleteBookmarkAndSync = async (id: string, eventId: string | null) => {
    await bookmarksHook.deleteBookmark(id);
    if (eventId) {
      try {
        await sync.deleteNostrEvent([eventId]);
      } catch {
        // silent
      }
    }
  };

  const contextValue: AppLayoutContextType = {
    openNewBookmark,
    openEditBookmark,
    openNewCollection,
    bookmarks: bookmarksHook.bookmarks,
    collections: collectionsHook.collections,
    bookmarkCounts,
    loadingBookmarks: bookmarksHook.loading,
    loadingCollections: collectionsHook.loading,
    publishBookmark: sync.publishBookmark,
    deleteBookmarkAndSync,
  };

  return (
    <AppLayoutContext.Provider value={contextValue}>
      <div className="h-screen flex flex-col overflow-hidden">
        <AppNavBar
          onMenuToggle={() => setSidebarOpen((p) => !p)}
          onNewBookmark={() => openNewBookmark()}
          onCommandPalette={() => setCommandOpen(true)}
        />

        <div className="flex flex-1 overflow-hidden">
          {/* Desktop sidebar */}
          <div className="hidden lg:flex shrink-0">
            <AppSidebar
              collections={collectionsHook.collections}
              bookmarkCounts={bookmarkCounts}
              onNewCollection={() => openNewCollection()}
              onNewBookmark={() => openNewBookmark()}
            />
          </div>

          {/* Mobile sidebar overlay */}
          {sidebarOpen && (
            <div className="lg:hidden fixed inset-0 z-50 flex">
              <div
                className="absolute inset-0 bg-black/50"
                onClick={() => setSidebarOpen(false)}
              />
              <div className="relative z-10 animate-fade-in">
                <AppSidebar
                  collections={collectionsHook.collections}
                  bookmarkCounts={bookmarkCounts}
                  onNewCollection={() => { openNewCollection(); setSidebarOpen(false); }}
                  onNewBookmark={() => { openNewBookmark(); setSidebarOpen(false); }}
                  onClose={() => setSidebarOpen(false)}
                />
              </div>
            </div>
          )}

          {/* Main content */}
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Floating action button on mobile */}
      <Button
        size="icon"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg lg:hidden z-30"
        onClick={() => openNewBookmark()}
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Modals */}
      <SaveBookmarkModal
        open={newBookmarkOpen}
        onClose={() => { setNewBookmarkOpen(false); setEditBookmark(undefined); }}
        onSave={handleSaveBookmark}
        initialUrl={newBookmarkUrl}
        existingBookmark={editBookmark}
        collections={collectionsHook.collections}
      />

      <CollectionModal
        open={newCollectionOpen}
        onClose={() => setNewCollectionOpen(false)}
        onSave={handleSaveCollection}
      />

      <CommandPalette
        open={commandOpen}
        onOpenChange={setCommandOpen}
        bookmarks={bookmarksHook.bookmarks}
        collections={collectionsHook.collections}
        onNewBookmark={openNewBookmark}
        onNewCollection={openNewCollection}
      />
    </AppLayoutContext.Provider>
  );
}
