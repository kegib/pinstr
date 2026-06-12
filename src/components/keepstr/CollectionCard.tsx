import { Link } from 'react-router-dom';
import { MoreHorizontal, Trash2, Edit, Globe, Lock } from 'lucide-react';
import type { LocalCollection } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface CollectionCardProps {
  collection: LocalCollection;
  bookmarkCount?: number;
  onDelete?: (collection: LocalCollection) => void;
  onEdit?: (collection: LocalCollection) => void;
  className?: string;
}

export function CollectionCard({
  collection,
  bookmarkCount = 0,
  onDelete,
  onEdit,
  className,
}: CollectionCardProps) {
  return (
    <div
      className={cn(
        'group relative bg-card border border-border rounded-xl overflow-hidden',
        'shadow-sm hover:shadow-md transition-all duration-200 animate-fade-in',
        className,
      )}
    >
      {/* Color accent bar */}
      <div
        className="h-1.5 w-full"
        style={{ backgroundColor: collection.color }}
      />

      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <span
              className="text-2xl w-10 h-10 flex items-center justify-center rounded-lg shrink-0"
              style={{ backgroundColor: `${collection.color}20` }}
            >
              {collection.icon}
            </span>
            <div className="min-w-0">
              <Link
                to={`/app/collections/${collection.id}`}
                className="font-semibold text-sm hover:text-primary transition-colors line-clamp-1"
              >
                {collection.name}
              </Link>
              <p className="text-xs text-muted-foreground mt-0.5">
                {bookmarkCount} {bookmarkCount === 1 ? 'bookmark' : 'bookmarks'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {collection.isPublic ? (
              <Globe className="w-3 h-3 text-primary" />
            ) : (
              <Lock className="w-3 h-3 text-muted-foreground" />
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(collection)}>
                    <Edit className="w-3.5 h-3.5 mr-2" />
                    Edit
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => onDelete(collection)}
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {collection.description && (
          <p className="mt-3 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {collection.description}
          </p>
        )}
      </div>
    </div>
  );
}
