import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSeoMeta } from '@unhead/react';
import { useNostr } from '@nostrify/react';
import { nip19 } from 'nostr-tools';
import { Globe, Lock, Bookmark, ExternalLink } from 'lucide-react';
import type { NostrMetadata, NostrEvent } from '@nostrify/nostrify';
import { NSchema as n } from '@nostrify/nostrify';
import {
  getKeepstrEventType,
  isPublicEvent,
  getTagValue,
  parsePublicBookmarkTags,
  parsePublicCollectionTags,
  extractIdFromDTag,
  KEEPSTR_KIND,
} from '@/lib/events';
import type { BookmarkData, CollectionData } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { TagBadge } from '@/components/keepstr/TagBadge';

interface PublicBookmark extends BookmarkData {
  notes: string;
}

interface PublicCollection extends CollectionData {
  bookmarkIds: string[];
}

export default function PublicProfile() {
  const { npub } = useParams<{ npub: string }>();
  const { nostr } = useNostr();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<NostrMetadata | null>(null);
  const [pubkey, setPubkey] = useState<string | null>(null);
  const [collections, setCollections] = useState<PublicCollection[]>([]);
  const [bookmarks, setBookmarks] = useState<PublicBookmark[]>([]);

  useSeoMeta({
    title: profile?.name
      ? `${profile.name}'s bookmarks — Keepstr`
      : 'Public Profile — Keepstr',
    description: profile?.about ?? 'View this user\'s public bookmarks on Keepstr.',
  });

  useEffect(() => {
    if (!npub) return;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        // Decode npub
        let pk: string;
        try {
          const decoded = nip19.decode(npub);
          if (decoded.type === 'npub') {
            pk = decoded.data as string;
          } else if (decoded.type === 'nprofile') {
            pk = decoded.data.pubkey;
          } else {
            throw new Error('Invalid npub');
          }
        } catch {
          setError('Invalid Nostr public key');
          setLoading(false);
          return;
        }

        setPubkey(pk);

        // Fetch profile
        const [profileEvent] = await nostr.query(
          [{ kinds: [0], authors: [pk], limit: 1 }],
          { signal: AbortSignal.timeout(5000) },
        );

        if (profileEvent) {
          try {
            const meta = n.json().pipe(n.metadata()).parse(profileEvent.content);
            setProfile(meta);
          } catch { /* ignore */ }
        }

        // Fetch public keepstr events
        const events = await nostr.query(
          [
            {
              kinds: [KEEPSTR_KIND],
              authors: [pk],
              '#L': ['keepstr'],
              '#public': ['true'],
            },
          ],
          { signal: AbortSignal.timeout(8000) },
        );

        const publicBookmarks: PublicBookmark[] = [];
        const publicCollections: PublicCollection[] = [];

        for (const event of events) {
          if (!isPublicEvent(event.tags)) continue;

          const type = getKeepstrEventType(event.tags);
          const dTag = getTagValue(event.tags, 'd') ?? '';

          if (type === 'bookmark') {
            const id = extractIdFromDTag(dTag, 'keepstr/b/');
            const data = parsePublicBookmarkTags(event.tags);
            publicBookmarks.push({
              id,
              url: data.url ?? '',
              title: data.title ?? '',
              description: data.description ?? '',
              image: data.image ?? null,
              favicon: null,
              tags: data.tags ?? [],
              collections: data.collections ?? [],
              notes: event.content,
              isPublic: true,
              savedAt: event.created_at * 1000,
            });
          } else if (type === 'collection') {
            const id = extractIdFromDTag(dTag, 'keepstr/c/');
            const data = parsePublicCollectionTags(event.tags);
            publicCollections.push({
              id,
              name: data.name ?? '',
              description: data.description ?? '',
              icon: '📚',
              color: '#6366f1',
              isPublic: true,
              sortOrder: 0,
              bookmarkIds: [],
            });
          }
        }

        // Assign bookmarks to collections
        for (const col of publicCollections) {
          col.bookmarkIds = publicBookmarks
            .filter((b) => b.collections.includes(col.id))
            .map((b) => b.id);
        }

        setCollections(publicCollections);
        setBookmarks(publicBookmarks);
      } catch (err) {
        setError('Failed to load profile');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [npub, nostr]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
          <div className="flex items-center gap-4">
            <Skeleton className="w-20 h-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-7 w-40" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-semibold mb-2">{error}</p>
          <Link to="/" className="text-primary hover:underline text-sm">
            Go home
          </Link>
        </div>
      </div>
    );
  }

  const displayName = profile?.name ?? profile?.display_name ?? npub?.slice(0, 12) + '…';
  const avatarUrl = profile?.picture;
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Bookmark className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-bold text-base">Keepstr</span>
          </Link>
          <Link
            to="/app"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Open app →
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Profile header */}
        <div className="flex items-start gap-5 mb-10">
          <Avatar className="w-20 h-20 shrink-0">
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{displayName}</h1>
            {profile?.about && (
              <p className="text-muted-foreground mt-1 max-w-lg leading-relaxed">
                {profile.about}
              </p>
            )}
            {profile?.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
              >
                <Globe className="w-3.5 h-3.5" />
                {profile.website.replace(/^https?:\/\//, '')}
              </a>
            )}
            <div className="flex items-center gap-4 mt-3">
              <Badge variant="secondary">
                {bookmarks.length} public bookmarks
              </Badge>
              {collections.length > 0 && (
                <Badge variant="secondary">
                  {collections.length} collections
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Collections */}
        {collections.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-semibold mb-4">Collections</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {collections.map((col) => (
                <div
                  key={col.id}
                  className="bg-card border border-border rounded-xl overflow-hidden"
                >
                  <div className="h-1 w-full" style={{ backgroundColor: col.color }} />
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{col.icon}</span>
                      <span className="font-semibold">{col.name}</span>
                    </div>
                    {col.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {col.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {col.bookmarkIds.length} bookmarks
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Bookmarks */}
        {bookmarks.length > 0 ? (
          <section>
            <h2 className="text-lg font-semibold mb-4">Bookmarks</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {bookmarks.map((bm) => {
                const hostname = (() => {
                  try { return new URL(bm.url).hostname.replace(/^www\./, ''); } catch { return bm.url; }
                })();

                return (
                  <a
                    key={bm.id}
                    href={bm.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-card border border-border rounded-xl p-4 hover:shadow-md transition-all block"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <img
                        src={`https://www.google.com/s2/favicons?sz=32&domain=${hostname}`}
                        alt=""
                        className="w-4 h-4 rounded-sm shrink-0"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                      <span className="text-xs text-muted-foreground truncate">{hostname}</span>
                      <ExternalLink className="w-3 h-3 text-muted-foreground ml-auto shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                      {bm.title || hostname}
                    </p>
                    {bm.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {bm.description}
                      </p>
                    )}
                    {bm.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {bm.tags.slice(0, 3).map((tag) => (
                          <TagBadge key={tag} tag={tag} />
                        ))}
                      </div>
                    )}
                  </a>
                );
              })}
            </div>
          </section>
        ) : (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center">
              <p className="text-muted-foreground">
                This user hasn't shared any public bookmarks yet.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
