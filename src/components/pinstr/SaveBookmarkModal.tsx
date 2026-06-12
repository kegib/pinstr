import { useEffect, useState, useCallback, useRef } from 'react';
import { Loader2, Globe, X, Lock, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { scrapeMetadata } from '@/lib/scraper';
import type { LocalBookmark, LocalCollection, PageMetadata } from '@/lib/types';
import { TagBadge } from './TagBadge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SaveBookmarkModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<LocalBookmark, 'id' | 'savedAt' | 'eventId' | 'createdAt' | 'updatedAt' | 'syncedAt'>) => Promise<void>;
  initialUrl?: string;
  existingBookmark?: LocalBookmark;
  collections?: LocalCollection[];
}

export function SaveBookmarkModal({
  open,
  onClose,
  onSave,
  initialUrl = '',
  existingBookmark,
  collections = [],
}: SaveBookmarkModalProps) {
  const [url, setUrl] = useState(initialUrl);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [favicon, setFavicon] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [saving, setSaving] = useState(false);

  const scrapeDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Populate from existing bookmark
  useEffect(() => {
    if (existingBookmark) {
      setUrl(existingBookmark.url);
      setTitle(existingBookmark.title);
      setDescription(existingBookmark.description);
      setNotes(existingBookmark.notes);
      setImage(existingBookmark.image);
      setFavicon(existingBookmark.favicon);
      setTags(existingBookmark.tags);
      setSelectedCollections(existingBookmark.collections);
      setIsPublic(existingBookmark.isPublic);
    } else {
      setUrl(initialUrl);
      setTitle('');
      setDescription('');
      setNotes('');
      setImage(null);
      setFavicon(null);
      setTags([]);
      setSelectedCollections([]);
      setIsPublic(false);
    }
  }, [existingBookmark, initialUrl, open]);

  const scrape = useCallback(async (targetUrl: unknown) => {
    const urlStr = typeof targetUrl === 'string' ? targetUrl.trim() : '';
    if (!urlStr) return;
    try {
      new URL(urlStr); // validate
    } catch {
      return;
    }

    setScraping(true);
    try {
      const meta: PageMetadata = await scrapeMetadata(urlStr);
      if (!existingBookmark) {
        setTitle((t) => t || meta.title);
        setDescription((d) => d || meta.description);
        setImage((img) => img || meta.image);
        setFavicon((f) => f || meta.favicon);
      }
    } catch {
      // Scraping failed silently
    } finally {
      setScraping(false);
    }
  }, [existingBookmark]);

  const handleUrlChange = useCallback((value: unknown) => {
    const str = typeof value === 'string' ? value : '';
    setUrl(str);
    if (scrapeDebounceRef.current) clearTimeout(scrapeDebounceRef.current);
    scrapeDebounceRef.current = setTimeout(() => scrape(str), 800);
  }, [scrape]);

  useEffect(() => {
    if (open && initialUrl && !existingBookmark) {
      scrape(initialUrl);
    }
  }, [open, initialUrl, existingBookmark, scrape]);

  const addTag = useCallback(() => {
    const t = tagInput.trim().toLowerCase().replace(/^#/, '');
    if (t && !tags.includes(t)) {
      setTags((prev) => [...prev, t]);
    }
    setTagInput('');
  }, [tagInput, tags]);

  const removeTag = useCallback((tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  }, []);

  const toggleCollection = useCallback((id: string) => {
    setSelectedCollections((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  }, []);

  const handleSave = async () => {
    if (!url.trim()) {
      toast.error('URL is required');
      return;
    }
    try {
      new URL(url);
    } catch {
      toast.error('Please enter a valid URL');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        url: url.trim(),
        title: title.trim() || url,
        description: description.trim(),
        notes: notes.trim(),
        image,
        favicon,
        tags,
        collections: selectedCollections,
        isPublic,
      });
      toast.success(existingBookmark ? 'Bookmark updated!' : 'Bookmark saved!');
      onClose();
    } catch (err) {
      toast.error('Failed to save bookmark');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {existingBookmark ? 'Edit Bookmark' : 'Save Bookmark'}
          </DialogTitle>
          <DialogDescription>
            {existingBookmark
              ? 'Update the details for this bookmark.'
              : 'Save a URL to your personal bookmark collection.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* URL */}
          <div className="space-y-1.5">
            <Label htmlFor="bm-url">URL *</Label>
            <div className="relative">
              <Input
                id="bm-url"
                placeholder="https://example.com"
                value={url}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleUrlChange(e.target.value)}
                className="pr-8"
              />
              {scraping && (
                <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="bm-title">Title</Label>
            {scraping && !title ? (
              <Skeleton className="h-9 w-full" />
            ) : (
              <Input
                id="bm-title"
                placeholder="Page title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="bm-desc">Description</Label>
            {scraping && !description ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <Textarea
                id="bm-desc"
                placeholder="A short description of this page"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            )}
          </div>

          {/* Preview image */}
          {image && (
            <div className="relative">
              <img
                src={image}
                alt="Preview"
                className="w-full h-32 object-cover rounded-lg border border-border"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).parentElement!.style.display = 'none';
                }}
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="absolute top-1 right-1 h-6 w-6 bg-background/80"
                onClick={() => setImage(null)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}

          {/* Tags */}
          <div className="space-y-1.5">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <Button type="button" variant="outline" size="sm" onClick={addTag}>
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map((tag) => (
                  <TagBadge
                    key={tag}
                    tag={tag}
                    variant="removable"
                    onRemove={removeTag}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Collections */}
          {collections.length > 0 && (
            <div className="space-y-1.5">
              <Label>Collections</Label>
              <div className="flex flex-wrap gap-2">
                {collections.map((col) => {
                  const selected = selectedCollections.includes(col.id);
                  return (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => toggleCollection(col.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                        selected
                          ? 'border-transparent text-white'
                          : 'border-border text-muted-foreground hover:border-primary hover:text-primary'
                      }`}
                      style={selected ? { backgroundColor: col.color } : {}}
                    >
                      <span>{col.icon}</span>
                      <span>{col.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="bm-notes">Personal Notes</Label>
            <Textarea
              id="bm-notes"
              placeholder="Your private notes about this bookmark..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Visibility */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              {isPublic ? (
                <Globe className="w-4 h-4 text-primary" />
              ) : (
                <Lock className="w-4 h-4 text-muted-foreground" />
              )}
              <div>
                <p className="text-sm font-medium">
                  {isPublic ? 'Public' : 'Private'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isPublic
                    ? 'Visible to anyone on Nostr'
                    : 'Only you can see this'}
                </p>
              </div>
            </div>
            <Switch
              checked={isPublic}
              onCheckedChange={setIsPublic}
              aria-label="Toggle public visibility"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {existingBookmark ? 'Save Changes' : 'Save Bookmark'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
