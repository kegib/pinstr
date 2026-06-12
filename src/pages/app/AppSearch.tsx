import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSeoMeta } from '@unhead/react';
import { toast } from 'sonner';
import { useAppLayout } from './AppLayout';
import { usePinstrSearch } from '@/hooks/usePinstrSearch';
import { BookmarkGrid } from '@/components/pinstr/BookmarkGrid';
import { ConfirmDialog } from '@/components/pinstr/ConfirmDialog';
import type { LocalBookmark } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function AppSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';

  useSeoMeta({ title: `Search: ${initialQuery} — Pinstr` });

  const { bookmarks, collections, openEditBookmark, deleteBookmarkAndSync } = useAppLayout();
  const { query, setQuery, results, isSearching } = usePinstrSearch(bookmarks);
  const [deleteTarget, setDeleteTarget] = useState<LocalBookmark | null>(null);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery, setQuery]);

  const handleQueryChange = (q: string) => {
    setQuery(q);
    if (q.trim()) {
      setSearchParams({ q: q.trim() });
    } else {
      setSearchParams({});
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteBookmarkAndSync(deleteTarget.id, deleteTarget.eventId);
    toast.success('Bookmark deleted');
    setDeleteTarget(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Search</h1>
        <div className="relative max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            autoFocus
            placeholder="Search bookmarks…"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            className="pl-9"
          />
        </div>
        {isSearching && (
          <p className="text-sm text-muted-foreground mt-2">
            {results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
          </p>
        )}
      </div>

      <BookmarkGrid
        bookmarks={results}
        collections={collections}
        onEdit={openEditBookmark}
        onDelete={setDeleteTarget}
        emptyMessage={
          isSearching
            ? `No bookmarks matched "${query}"`
            : 'Start typing to search your bookmarks.'
        }
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
