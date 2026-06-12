import { useState } from 'react';
import { useSeoMeta } from '@unhead/react';
import { toast } from 'sonner';
import { useAppLayout } from './AppLayout';
import { BookmarkGrid } from '@/components/keepstr/BookmarkGrid';
import { ConfirmDialog } from '@/components/keepstr/ConfirmDialog';
import type { LocalBookmark } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { SortAsc, SortDesc, Grid, List } from 'lucide-react';

export default function AppDashboard() {
  useSeoMeta({ title: 'All Bookmarks — Keepstr' });

  const {
    bookmarks,
    collections,
    loadingBookmarks,
    openEditBookmark,
    deleteBookmarkAndSync,
  } = useAppLayout();

  const [sortDesc, setSortDesc] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<LocalBookmark | null>(null);

  const sorted = [...bookmarks].sort((a, b) =>
    sortDesc ? b.savedAt - a.savedAt : a.savedAt - b.savedAt,
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteBookmarkAndSync(deleteTarget.id, deleteTarget.eventId);
    toast.success('Bookmark deleted');
    setDeleteTarget(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">All Bookmarks</h1>
          {!loadingBookmarks && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {bookmarks.length} {bookmarks.length === 1 ? 'bookmark' : 'bookmarks'}
            </p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSortDesc((p) => !p)}
          className="gap-1.5"
        >
          {sortDesc ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />}
          {sortDesc ? 'Newest' : 'Oldest'}
        </Button>
      </div>

      <BookmarkGrid
        bookmarks={sorted}
        collections={collections}
        loading={loadingBookmarks}
        onEdit={openEditBookmark}
        onDelete={setDeleteTarget}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete bookmark?"
        description="This will permanently delete this bookmark and remove it from Nostr."
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </div>
  );
}
