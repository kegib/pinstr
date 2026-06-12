import { formatDistanceToNow } from 'date-fns';
import { Globe, Lock, ExternalLink, MoreHorizontal, Trash2, Edit, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { LocalBookmark, LocalCollection } from '@/lib/types';
import { TagBadge } from './TagBadge';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface BookmarkCardProps {
  bookmark: LocalBookmark;
  collections?: LocalCollection[];
  onDelete?: (bookmark: LocalBookmark) => void;
  onEdit?: (bookmark: LocalBookmark) => void;
  className?: string;
}

export function BookmarkCard({
  bookmark,
  collections = [],
  onDelete,
  onEdit,
  className,
}: BookmarkCardProps) {
  const bookmarkCollections = collections.filter((c) =>
    bookmark.collections.includes(c.id),
  );

  const timeAgo = formatDistanceToNow(new Date(bookmark.savedAt), { addSuffix: true });

  const hostname = (() => {
    try {
      return new URL(bookmark.url).hostname.replace(/^www\./, '');
    } catch {
      return bookmark.url;
    }
  })();

  return (
    <div
      className={cn(
        'group relative flex flex-col bg-card border border-border rounded-xl overflow-hidden',
        'shadow-sm hover:shadow-md transition-all duration-200 animate-fade-in',
        className,
      )}
    >
      {/* Image */}
      {bookmark.image && (
        <div className="aspect-video overflow-hidden bg-muted">
          <img
            src={bookmark.image}
            alt={bookmark.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}

      <div className="flex flex-col gap-2 p-4 flex-1">
        {/* Site info */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {bookmark.favicon ? (
              <img
                src={bookmark.favicon}
                alt=""
                className="w-4 h-4 rounded-sm shrink-0"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
            )}
            <span className="text-xs text-muted-foreground truncate">{hostname}</span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {bookmark.isPublic ? (
              <Globe className="w-3 h-3 text-primary" />
            ) : (
              <Lock className="w-3 h-3 text-muted-foreground" />
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to={`/app/bookmark/${bookmark.id}`}>
                    <Eye className="w-3.5 h-3.5 mr-2" />
                    View
                  </Link>
                </DropdownMenuItem>
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(bookmark)}>
                    <Edit className="w-3.5 h-3.5 mr-2" />
                    Edit
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <a href={bookmark.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3.5 h-3.5 mr-2" />
                    Open URL
                  </a>
                </DropdownMenuItem>
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => onDelete(bookmark)}
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

        {/* Title */}
        <Link
          to={`/app/bookmark/${bookmark.id}`}
          className="font-semibold text-sm leading-tight line-clamp-2 hover:text-primary transition-colors"
        >
          {bookmark.title || hostname}
        </Link>

        {/* Description */}
        {bookmark.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {bookmark.description}
          </p>
        )}

        {/* Footer */}
        <div className="mt-auto pt-2 flex flex-col gap-2">
          {/* Collections */}
          {bookmarkCollections.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {bookmarkCollections.map((col) => (
                <Link
                  key={col.id}
                  to={`/app/collections/${col.id}`}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-colors"
                  style={{
                    backgroundColor: `${col.color}20`,
                    color: col.color,
                  }}
                >
                  <span>{col.icon}</span>
                  <span>{col.name}</span>
                </Link>
              ))}
            </div>
          )}

          {/* Tags */}
          {bookmark.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {bookmark.tags.slice(0, 4).map((tag) => (
                <TagBadge key={tag} tag={tag} />
              ))}
              {bookmark.tags.length > 4 && (
                <span className="text-xs text-muted-foreground">
                  +{bookmark.tags.length - 4}
                </span>
              )}
            </div>
          )}

          <span className="text-xs text-muted-foreground">{timeAgo}</span>
        </div>
      </div>
    </div>
  );
}
