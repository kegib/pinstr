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
    <div className="p-5 max-w-7xl mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-sm font-bold uppercase tracking-widest" style={{ color: '#ececf0', letterSpacing: '1.8px' }}>
            all bookmarks
          </h1>
          {!loadingBookmarks && (
            <p className="text-[11px] mt-0.5" style={{ color: '#5a5a6a' }}>
              {bookmarks.length} {bookmarks.length === 1 ? 'bookmark' : 'bookmarks'}
            </p>
          )}
        </div>
        <button
          onClick={() => setSortDesc((p) => !p)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] transition-all"
          style={{
            border: '1px solid #2a2a32',
            borderRadius: '3px',
            color: '#8a8a98',
            background: 'transparent',
            fontFamily: 'inherit',
            cursor: 'pointer',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#7B68EE'; (e.currentTarget as HTMLButtonElement).style.color = '#9B8FFF'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#2a2a32'; (e.currentTarget as HTMLButtonElement).style.color = '#8a8a98'; }}
        >
          {sortDesc ? <SortDesc className="w-3 h-3" /> : <SortAsc className="w-3 h-3" />}
          {sortDesc ? 'newest' : 'oldest'}
        </button>
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
