import type { LocalBookmark, LocalCollection } from '@/lib/types';
import { BookmarkCard } from './BookmarkCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Bookmark } from 'lucide-react';

interface BookmarkGridProps {
  bookmarks: LocalBookmark[];
  collections?: LocalCollection[];
  loading?: boolean;
  onDelete?: (bookmark: LocalBookmark) => void;
  onEdit?: (bookmark: LocalBookmark) => void;
  emptyMessage?: string;
}

export function BookmarkGrid({
  bookmarks,
  collections = [],
  loading = false,
  onDelete,
  onEdit,
  emptyMessage = 'No bookmarks yet. Save your first one!',
}: BookmarkGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4 space-y-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-12 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-16 px-8 text-center flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <Bookmark className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground max-w-sm">{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {bookmarks.map((bookmark) => (
        <BookmarkCard
          key={bookmark.id}
          bookmark={bookmark}
          collections={collections}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}
