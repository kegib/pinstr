import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSeoMeta } from '@unhead/react';
import { toast } from 'sonner';
import { ArrowLeft, Pencil } from 'lucide-react';
import { useAppLayout } from './AppLayout';
import { useCollections } from '@/hooks/useCollections';
import { useKeepstrSync } from '@/hooks/useKeepstrSync';
import { BookmarkGrid } from '@/components/keepstr/BookmarkGrid';
import { CollectionModal } from '@/components/keepstr/CollectionModal';
import { ConfirmDialog } from '@/components/keepstr/ConfirmDialog';
import type { LocalBookmark } from '@/lib/types';
import { Button } from '@/components/ui/button';

export default function AppCollectionDetail() {
  const { id } = useParams<{ id: string }>();
  const {
    bookmarks,
    collections,
    openEditBookmark,
    deleteBookmarkAndSync,
  } = useAppLayout();
  const collectionsHook = useCollections();
  const sync = useKeepstrSync();

  const collection = useMemo(
    () => collections.find((c) => c.id === id),
    [collections, id],
  );

  useSeoMeta({
    title: collection ? `${collection.name} — Keepstr` : 'Collection — Keepstr',
  });

  const collectionBookmarks = useMemo(
    () => bookmarks.filter((b) => b.collections.includes(id ?? '')),
    [bookmarks, id],
  );

  const [editOpen, setEditOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<LocalBookmark | null>(null);

  const handleSaveCollection = async (data: {
    name: string;
    description: string;
    icon: string;
    color: string;
    isPublic: boolean;
  }) => {
    if (!collection) return;
    await collectionsHook.updateCollection(collection.id, data);
    const updated = await collectionsHook.getCollection(collection.id);
    if (updated) {
      try { await sync.publishCollection(updated); } catch { /* silent */ }
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteBookmarkAndSync(deleteTarget.id, deleteTarget.eventId);
    toast.success('Bookmark deleted');
    setDeleteTarget(null);
  };

  if (!collection) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <p className="text-muted-foreground">Collection not found.</p>
        <Button asChild variant="link" className="mt-2 pl-0">
          <Link to="/app/collections">← Back to Collections</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <Link
          to="/app/collections"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Collections
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
              style={{ backgroundColor: `${collection.color}20` }}
            >
              {collection.icon}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{collection.name}</h1>
              {collection.description && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  {collection.description}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {collectionBookmarks.length}{' '}
                {collectionBookmarks.length === 1 ? 'bookmark' : 'bookmarks'}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 shrink-0"
            onClick={() => setEditOpen(true)}
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </Button>
        </div>
      </div>

      <BookmarkGrid
        bookmarks={collectionBookmarks}
        collections={collections}
        onEdit={openEditBookmark}
        onDelete={setDeleteTarget}
        emptyMessage={`No bookmarks in "${collection.name}" yet.`}
      />

      <CollectionModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={handleSaveCollection}
        existing={collection}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete bookmark?"
        description="This will permanently delete this bookmark."
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </div>
  );
}
