import { useSeoMeta } from '@unhead/react';
import { toast } from 'sonner';
import { useAppLayout } from './AppLayout';
import { ImportWizard } from '@/components/keepstr/ImportWizard';
import { useCollections } from '@/hooks/useCollections';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useKeepstrSync } from '@/hooks/useKeepstrSync';
import type { ImportedBookmark } from '@/lib/types';

export default function AppImport() {
  useSeoMeta({ title: 'Import Bookmarks — Keepstr' });

  const { collections } = useAppLayout();
  const collectionsHook = useCollections();
  const bookmarksHook = useBookmarks();
  const sync = useKeepstrSync();

  const handleCreateCollection = async (name: string) => {
    const col = await collectionsHook.createCollection({ name });
    try { await sync.publishCollection(col); } catch { /* silent */ }
    return col;
  };

  const handleSaveBookmarks = async (
    bookmarks: ImportedBookmark[],
    folderToCollection: Map<string, string>,
  ) => {
    let count = 0;
    for (const bm of bookmarks) {
      const folderKey = bm.folder.join('/');
      const collectionId = folderToCollection.get(folderKey);

      let faviconUrl: string | null = null;
      try {
        const { hostname } = new URL(bm.url);
        faviconUrl = `https://www.google.com/s2/favicons?sz=64&domain=${hostname}`;
      } catch { /* ignore */ }

      await bookmarksHook.saveBookmark({
        url: bm.url,
        title: bm.title,
        description: '',
        notes: '',
        image: null,
        favicon: faviconUrl,
        tags: [],
        collections: collectionId ? [collectionId] : [],
        isPublic: false,
        savedAt: bm.addDate ?? Date.now(),
      });

      count++;
    }

    toast.success(`Imported ${count} bookmarks`);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Import Bookmarks</h1>
        <p className="text-muted-foreground mt-1">
          Import your existing bookmarks from Chrome, Firefox, Safari, or any browser
          that supports the Netscape Bookmark Format.
        </p>
      </div>

      <ImportWizard
        collections={collections}
        onCreateCollection={handleCreateCollection}
        onSaveBookmarks={handleSaveBookmarks}
      />
    </div>
  );
}
