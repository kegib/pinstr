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
      className={cn('group relative overflow-hidden animate-fade-in transition-all duration-150', className)}
      style={{
        background: '#141418',
        border: '1px solid #1f1f25',
        borderRadius: '5px',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#2a2a32'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#1f1f25'; }}
    >
      {/* Accent top bar */}
      <div className="h-px w-full" style={{ background: collection.color, opacity: 0.7 }} />

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 flex items-center justify-center text-lg rounded shrink-0"
              style={{ background: `${collection.color}1a`, borderRadius: '3px' }}
            >
              {collection.icon}
            </div>
            <div className="min-w-0">
              <Link
                to={`/app/collections/${collection.id}`}
                className="text-xs font-semibold line-clamp-1 transition-colors"
                style={{ color: '#ececf0', textDecoration: 'none' }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#9B8FFF'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#ececf0'; }}
              >
                {collection.name}
              </Link>
              <p className="text-[10px] mt-0.5" style={{ color: '#5a5a6a' }}>
                {bookmarkCount} {bookmarkCount === 1 ? 'bookmark' : 'bookmarks'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {collection.isPublic ? (
              <Globe className="w-3 h-3" style={{ color: '#7B68EE' }} />
            ) : (
              <Lock className="w-3 h-3" style={{ color: '#5a5a6a' }} />
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="h-6 w-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'transparent', border: 'none', color: '#8a8a98', cursor: 'pointer', borderRadius: '3px' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#1a1a20'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="text-xs border"
                style={{ background: '#111113', borderColor: '#2a2a32', fontFamily: 'inherit', minWidth: '130px' }}
              >
                {onEdit && (
                  <DropdownMenuItem
                    className="text-xs cursor-pointer"
                    style={{ color: '#c8c8d0' }}
                    onClick={() => onEdit(collection)}
                  >
                    <Edit className="w-3 h-3 mr-2" /> edit
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <>
                    <DropdownMenuSeparator style={{ background: '#1f1f25' }} />
                    <DropdownMenuItem
                      className="text-xs cursor-pointer"
                      style={{ color: '#FF5A5A' }}
                      onClick={() => onDelete(collection)}
                    >
                      <Trash2 className="w-3 h-3 mr-2" /> delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {collection.description && (
          <p className="mt-2.5 text-[11px] line-clamp-2 leading-relaxed" style={{ color: '#8a8a98' }}>
            {collection.description}
          </p>
        )}
      </div>
    </div>
  );
}
