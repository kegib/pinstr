import type { LocalCollection } from '@/lib/types';
import { CollectionCard } from './CollectionCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { FolderOpen } from 'lucide-react';

interface CollectionGridProps {
  collections: LocalCollection[];
  bookmarkCounts?: Record<string, number>;
  loading?: boolean;
  onDelete?: (collection: LocalCollection) => void;
  onEdit?: (collection: LocalCollection) => void;
}

export function CollectionGrid({
  collections,
  bookmarkCounts = {},
  loading = false,
  onDelete,
  onEdit,
}: CollectionGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-xl overflow-hidden">
            <Skeleton className="h-1.5 w-full" />
            <div className="p-5 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (collections.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-16 px-8 text-center flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <FolderOpen className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground max-w-sm">
            No collections yet. Create one to organize your bookmarks.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {collections.map((collection) => (
        <CollectionCard
          key={collection.id}
          collection={collection}
          bookmarkCount={bookmarkCounts[collection.id] ?? 0}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}
