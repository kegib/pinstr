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
    try { return new URL(bookmark.url).hostname.replace(/^www\./, ''); }
    catch { return bookmark.url; }
  })();

  return (
    <div
      className={cn(
        'group relative flex flex-col overflow-hidden animate-fade-in transition-all duration-150',
        className,
      )}
      style={{
        background: '#141418',
        border: '1px solid #1f1f25',
        borderRadius: '5px',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = '#2a2a32';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = '#1f1f25';
      }}
    >
      {/* Cover image */}
      {bookmark.image && (
        <div className="aspect-video overflow-hidden" style={{ background: '#111113' }}>
          <img
            src={bookmark.image}
            alt={bookmark.title}
            className="w-full h-full object-cover opacity-80"
            onError={(e) => {
              (e.currentTarget.parentElement as HTMLElement).style.display = 'none';
            }}
          />
        </div>
      )}

      <div className="flex flex-col gap-2 p-3.5 flex-1">
        {/* Site row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            {bookmark.favicon ? (
              <img
                src={bookmark.favicon}
                alt=""
                className="w-3.5 h-3.5 rounded-sm shrink-0 opacity-80"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              />
            ) : (
              <Globe className="w-3.5 h-3.5 shrink-0" style={{ color: '#5a5a6a' }} />
            )}
            <span className="text-[11px] truncate" style={{ color: '#8a8a98' }}>{hostname}</span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {bookmark.isPublic ? (
              <Globe className="w-3 h-3" style={{ color: '#7B68EE' }} />
            ) : (
              <Lock className="w-3 h-3" style={{ color: '#5a5a6a' }} />
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="h-5 w-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'transparent', border: 'none', color: '#8a8a98', cursor: 'pointer', borderRadius: '3px' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#1a1a20'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                >
                  <MoreHorizontal className="h-3 w-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="text-xs border"
                style={{ background: '#111113', borderColor: '#2a2a32', fontFamily: 'inherit', minWidth: '140px' }}
              >
                <DropdownMenuItem asChild className="text-xs cursor-pointer" style={{ color: '#c8c8d0' }}>
                  <Link to={`/app/bookmark/${bookmark.id}`}>
                    <Eye className="w-3 h-3 mr-2" /> view
                  </Link>
                </DropdownMenuItem>
                {onEdit && (
                  <DropdownMenuItem
                    className="text-xs cursor-pointer"
                    style={{ color: '#c8c8d0' }}
                    onClick={() => onEdit(bookmark)}
                  >
                    <Edit className="w-3 h-3 mr-2" /> edit
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild className="text-xs cursor-pointer" style={{ color: '#c8c8d0' }}>
                  <a href={bookmark.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3 h-3 mr-2" /> open url
                  </a>
                </DropdownMenuItem>
                {onDelete && (
                  <>
                    <DropdownMenuSeparator style={{ background: '#1f1f25' }} />
                    <DropdownMenuItem
                      className="text-xs cursor-pointer"
                      style={{ color: '#FF5A5A' }}
                      onClick={() => onDelete(bookmark)}
                    >
                      <Trash2 className="w-3 h-3 mr-2" /> delete
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
          className="text-xs font-semibold leading-snug line-clamp-2 transition-colors"
          style={{ color: '#ececf0', textDecoration: 'none' }}
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#9B8FFF'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#ececf0'; }}
        >
          {bookmark.title || hostname}
        </Link>

        {/* Description */}
        {bookmark.description && (
          <p className="text-[11px] line-clamp-2 leading-relaxed" style={{ color: '#8a8a98' }}>
            {bookmark.description}
          </p>
        )}

        {/* Footer */}
        <div className="mt-auto pt-2 flex flex-col gap-1.5">
          {bookmarkCollections.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {bookmarkCollections.map((col) => (
                <Link
                  key={col.id}
                  to={`/app/collections/${col.id}`}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium transition-opacity hover:opacity-80"
                  style={{
                    borderRadius: '3px',
                    background: `${col.color}1a`,
                    color: col.color,
                    textDecoration: 'none',
                    border: `1px solid ${col.color}30`,
                  }}
                >
                  <span>{col.icon}</span>
                  <span>{col.name}</span>
                </Link>
              ))}
            </div>
          )}

          {bookmark.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {bookmark.tags.slice(0, 4).map((tag) => (
                <TagBadge key={tag} tag={tag} />
              ))}
              {bookmark.tags.length > 4 && (
                <span className="text-[10px]" style={{ color: '#5a5a6a' }}>+{bookmark.tags.length - 4}</span>
              )}
            </div>
          )}

          <span className="text-[10px]" style={{ color: '#5a5a6a' }}>{timeAgo}</span>
        </div>
      </div>
    </div>
  );
}
