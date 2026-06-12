import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Bookmark,
  FolderOpen,
  Settings,
  Plus,
  Upload,
  Search,
} from 'lucide-react';
import type { LocalBookmark, LocalCollection } from '@/lib/types';
import { useKeepstrSearch } from '@/hooks/useKeepstrSearch';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookmarks: LocalBookmark[];
  collections: LocalCollection[];
  onNewBookmark?: () => void;
  onNewCollection?: () => void;
}

export function CommandPalette({
  open,
  onOpenChange,
  bookmarks,
  collections,
  onNewBookmark,
  onNewCollection,
}: CommandPaletteProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const { results } = useKeepstrSearch(bookmarks);

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onOpenChange]);

  const close = useCallback(() => {
    onOpenChange(false);
    setQuery('');
  }, [onOpenChange]);

  const navigate_ = useCallback((to: string) => {
    navigate(to);
    close();
  }, [navigate, close]);

  // Filter bookmarks by query
  const filteredBookmarks = query.trim()
    ? bookmarks.filter((b) =>
        b.title.toLowerCase().includes(query.toLowerCase()) ||
        b.url.toLowerCase().includes(query.toLowerCase()),
      ).slice(0, 5)
    : bookmarks.slice(0, 5);

  const filteredCollections = query.trim()
    ? collections.filter((c) =>
        c.name.toLowerCase().includes(query.toLowerCase()),
      ).slice(0, 3)
    : collections.slice(0, 3);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search bookmarks, collections, or actions..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {/* Actions */}
        <CommandGroup heading="Actions">
          <CommandItem
            onSelect={() => {
              onNewBookmark?.();
              close();
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Bookmark
          </CommandItem>
          <CommandItem
            onSelect={() => {
              onNewCollection?.();
              close();
            }}
          >
            <FolderOpen className="w-4 h-4 mr-2" />
            New Collection
          </CommandItem>
          <CommandItem onSelect={() => navigate_('/app')}>
            <Bookmark className="w-4 h-4 mr-2" />
            All Bookmarks
          </CommandItem>
          <CommandItem onSelect={() => navigate_('/app/import')}>
            <Upload className="w-4 h-4 mr-2" />
            Import Bookmarks
          </CommandItem>
          <CommandItem onSelect={() => navigate_('/app/settings')}>
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </CommandItem>
        </CommandGroup>

        {filteredBookmarks.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Bookmarks">
              {filteredBookmarks.map((bm) => (
                <CommandItem
                  key={bm.id}
                  onSelect={() => navigate_(`/app/bookmark/${bm.id}`)}
                >
                  {bm.favicon ? (
                    <img
                      src={bm.favicon}
                      alt=""
                      className="w-4 h-4 rounded-sm mr-2 shrink-0"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  ) : (
                    <Bookmark className="w-4 h-4 mr-2 shrink-0" />
                  )}
                  <span className="truncate">{bm.title || bm.url}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {filteredCollections.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Collections">
              {filteredCollections.map((col) => (
                <CommandItem
                  key={col.id}
                  onSelect={() => navigate_(`/app/collections/${col.id}`)}
                >
                  <span className="mr-2">{col.icon}</span>
                  <span className="truncate">{col.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
