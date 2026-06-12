import { useState } from 'react';
import { useSeoMeta } from '@unhead/react';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { useAppLayout } from './AppLayout';
import { useCollections } from '@/hooks/useCollections';
import { usePinstrSync } from '@/hooks/usePinstrSync';
import { CollectionGrid } from '@/components/pinstr/CollectionGrid';
import { CollectionModal } from '@/components/pinstr/CollectionModal';
import { ConfirmDialog } from '@/components/pinstr/ConfirmDialog';
import type { LocalCollection } from '@/lib/types';
import { Button } from '@/components/ui/button';

export default function AppCollections() {
  useSeoMeta({ title: 'Collections — Pinstr' });

  const { collections, bookmarkCounts, loadingCollections } = useAppLayout();
  const collectionsHook = useCollections();
  const sync = usePinstrSync();

  const [editTarget, setEditTarget] = useState<LocalCollection | undefined>();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<LocalCollection | null>(null);

  const handleSaveCollection = async (data: {
    name: string;
    description: string;
    icon: string;
    color: string;
    isPublic: boolean;
  }) => {
    if (editTarget) {
      await collectionsHook.updateCollection(editTarget.id, data);
      const updated = await collectionsHook.getCollection(editTarget.id);
      if (updated) {
        try { await sync.publishCollection(updated); } catch { /* silent */ }
      }
    } else {
      const col = await collectionsHook.createCollection(data);
      try { await sync.publishCollection(col); } catch { /* silent */ }
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await collectionsHook.deleteCollection(deleteTarget.id);
    if (deleteTarget.eventId) {
      try { await sync.deleteNostrEvent([deleteTarget.eventId]); } catch { /* silent */ }
    }
    toast.success('Collection deleted');
    setDeleteTarget(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Collections</h1>
          {!loadingCollections && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {collections.length} {collections.length === 1 ? 'collection' : 'collections'}
            </p>
          )}
        </div>
        <Button
          onClick={() => { setEditTarget(undefined); setEditOpen(true); }}
          className="gap-1.5"
        >
          <Plus className="w-4 h-4" />
          New Collection
        </Button>
      </div>

      <CollectionGrid
        collections={collections}
        bookmarkCounts={bookmarkCounts}
        loading={loadingCollections}
        onEdit={(col) => { setEditTarget(col); setEditOpen(true); }}
        onDelete={setDeleteTarget}
      />

      <CollectionModal
        open={editOpen}
        onClose={() => { setEditOpen(false); setEditTarget(undefined); }}
        onSave={handleSaveCollection}
        existing={editTarget}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete collection?"
        description="This will delete the collection. Your bookmarks will not be deleted but will be removed from this collection."
        confirmLabel="Delete Collection"
        onConfirm={handleDelete}
      />
    </div>
  );
}
