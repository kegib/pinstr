import { useCallback, useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSeoMeta } from '@unhead/react';
import { toast } from 'sonner';
import {
  ArrowLeft,
  ExternalLink,
  Globe,
  Lock,
  Pencil,
  Trash2,
  Clock,
  Tag,
  FolderOpen,
  StickyNote,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useAppLayout } from './AppLayout';
import { SaveBookmarkModal } from '@/components/pinstr/SaveBookmarkModal';
import { ConfirmDialog } from '@/components/pinstr/ConfirmDialog';
import { TagBadge } from '@/components/pinstr/TagBadge';
import type { LocalBookmark } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function AppBookmarkDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getBookmark, updateBookmark } = useBookmarks();
  const { collections, deleteBookmarkAndSync, publishBookmark } = useAppLayout();

  const [bookmark, setBookmark] = useState<LocalBookmark | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useSeoMeta({
    title: bookmark ? `${bookmark.title} — Pinstr` : 'Bookmark — Pinstr',
  });

  const reload = useCallback(async () => {
    if (!id) return;
    const bm = await getBookmark(id);
    setBookmark(bm ?? null);
    setLoading(false);
  }, [id, getBookmark]);

  useEffect(() => {
    setLoading(true);
    reload();
  }, [reload]);

  const handleSave = async (
    data: Omit<LocalBookmark, 'id' | 'savedAt' | 'eventId' | 'createdAt' | 'updatedAt' | 'syncedAt'>,
  ) => {
    if (!bookmark) return;
    await updateBookmark(bookmark.id, data);
    const updated = await getBookmark(bookmark.id);
    if (updated) {
      setBookmark(updated);
      try {
        await publishBookmark(updated);
      } catch {
        toast.error('Saved locally but failed to sync to Nostr');
      }
    }
  };

  const handleDelete = async () => {
    if (!bookmark) return;
    await deleteBookmarkAndSync(bookmark.id, bookmark.eventId);
    toast.success('Bookmark deleted');
    navigate('/app');
  };

  const bookmarkCollections = collections.filter((c) =>
    bookmark?.collections.includes(c.id),
  );

  if (loading) {
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-4">
        <div className="h-5 w-24 bg-muted rounded animate-pulse" />
        <div className="h-8 w-2/3 bg-muted rounded animate-pulse" />
        <div className="h-4 w-full bg-muted rounded animate-pulse" />
      </div>
    );
  }

  if (!bookmark) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <p className="text-muted-foreground">Bookmark not found.</p>
        <Button asChild variant="link" className="pl-0 mt-2">
          <Link to="/app">← Back</Link>
        </Button>
      </div>
    );
  }

  const hostname = (() => {
    try {
      return new URL(bookmark.url).hostname.replace(/^www\./, '');
    } catch {
      return bookmark.url;
    }
  })();

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Back */}
      <Link
        to="/app"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        All Bookmarks
      </Link>

      {/* Cover image */}
      {bookmark.image && (
        <div className="w-full aspect-video rounded-xl overflow-hidden mb-6 bg-muted">
          <img
            src={bookmark.image}
            alt={bookmark.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget.parentElement as HTMLElement).style.display = 'none';
            }}
          />
        </div>
      )}

      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            {bookmark.favicon ? (
              <img src={bookmark.favicon} alt="" className="w-5 h-5 rounded shrink-0" />
            ) : (
              <Globe className="w-5 h-5 text-muted-foreground shrink-0" />
            )}
            <span className="text-sm text-muted-foreground">{hostname}</span>
            {bookmark.isPublic ? (
              <Badge variant="secondary" className="ml-auto gap-1 text-primary border-primary/20">
                <Globe className="w-3 h-3" /> Public
              </Badge>
            ) : (
              <Badge variant="secondary" className="ml-auto gap-1">
                <Lock className="w-3 h-3" /> Private
              </Badge>
            )}
          </div>

          <h1 className="text-2xl font-bold mb-2">{bookmark.title || hostname}</h1>

          {bookmark.description && (
            <p className="text-muted-foreground leading-relaxed">{bookmark.description}</p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm" className="gap-1.5">
              <a href={bookmark.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-3.5 h-3.5" />
                Open URL
              </a>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setEditOpen(true)}
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </Button>
          </div>
        </div>

        <Separator />

        {/* Metadata grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Saved time */}
          <div className="flex items-start gap-3">
            <Clock className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">
                Saved
              </p>
              <p className="text-sm">
                {format(new Date(bookmark.savedAt), 'PPP')}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(bookmark.savedAt), { addSuffix: true })}
              </p>
            </div>
          </div>

          {/* Collections */}
          {bookmarkCollections.length > 0 && (
            <div className="flex items-start gap-3">
              <FolderOpen className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">
                  Collections
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {bookmarkCollections.map((col) => (
                    <Link
                      key={col.id}
                      to={`/app/collections/${col.id}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors hover:opacity-80"
                      style={{ backgroundColor: `${col.color}20`, color: col.color }}
                    >
                      {col.icon} {col.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tags */}
          {bookmark.tags.length > 0 && (
            <div className="flex items-start gap-3">
              <Tag className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">
                  Tags
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {bookmark.tags.map((tag) => (
                    <TagBadge key={tag} tag={tag} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Notes */}
        {bookmark.notes && (
          <>
            <Separator />
            <div className="flex items-start gap-3">
              <StickyNote className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-2">
                  Notes
                </p>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {bookmark.notes}
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      <SaveBookmarkModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={handleSave}
        existingBookmark={bookmark}
        collections={collections}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete bookmark?"
        description="This will permanently delete this bookmark and remove it from Nostr."
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </div>
  );
}
