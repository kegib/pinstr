import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { LocalCollection } from '@/lib/types';
import { COLLECTION_COLORS, COLLECTION_ICONS } from '@/lib/types';
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
import { Globe, Lock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CollectionModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    name: string;
    description: string;
    icon: string;
    color: string;
    isPublic: boolean;
  }) => Promise<void>;
  existing?: LocalCollection;
}

export function CollectionModal({
  open,
  onClose,
  onSave,
  existing,
}: CollectionModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState(COLLECTION_ICONS[0]);
  const [color, setColor] = useState(COLLECTION_COLORS[0]);
  const [isPublic, setIsPublic] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (existing) {
      setName(existing.name);
      setDescription(existing.description);
      setIcon(existing.icon);
      setColor(existing.color);
      setIsPublic(existing.isPublic);
    } else {
      setName('');
      setDescription('');
      setIcon(COLLECTION_ICONS[0]);
      setColor(COLLECTION_COLORS[0]);
      setIsPublic(false);
    }
  }, [existing, open]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Collection name is required');
      return;
    }
    setSaving(true);
    try {
      await onSave({ name: name.trim(), description: description.trim(), icon, color, isPublic });
      toast.success(existing ? 'Collection updated!' : 'Collection created!');
      onClose();
    } catch {
      toast.error('Failed to save collection');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{existing ? 'Edit Collection' : 'New Collection'}</DialogTitle>
          <DialogDescription>
            {existing
              ? 'Update the name, icon, and settings for this collection.'
              : 'Create a new collection to organize your bookmarks.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Preview */}
          <div
            className="flex items-center gap-3 p-3 rounded-xl border"
            style={{ borderColor: color }}
          >
            <span
              className="text-2xl w-12 h-12 flex items-center justify-center rounded-lg"
              style={{ backgroundColor: `${color}20` }}
            >
              {icon}
            </span>
            <div>
              <p className="font-semibold text-sm">{name || 'Collection Name'}</p>
              <p className="text-xs text-muted-foreground">{description || 'No description'}</p>
            </div>
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="col-name">Name *</Label>
            <Input
              id="col-name"
              placeholder="My Collection"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="col-desc">Description</Label>
            <Textarea
              id="col-desc"
              placeholder="What is this collection about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          {/* Icons */}
          <div className="space-y-1.5">
            <Label>Icon</Label>
            <div className="flex flex-wrap gap-2">
              {COLLECTION_ICONS.map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  className={cn(
                    'w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all',
                    icon === i
                      ? 'ring-2 ring-primary scale-110'
                      : 'hover:bg-muted',
                  )}
                  style={icon === i ? { backgroundColor: `${color}20` } : {}}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div className="space-y-1.5">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {COLLECTION_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    'w-7 h-7 rounded-full transition-all',
                    color === c ? 'scale-125 ring-2 ring-offset-2 ring-offset-background' : 'hover:scale-110',
                  )}
                  style={{ backgroundColor: c, ...(color === c ? { ringColor: c } : {}) }}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
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
                <p className="text-sm font-medium">{isPublic ? 'Public' : 'Private'}</p>
                <p className="text-xs text-muted-foreground">
                  {isPublic ? 'Visible on your profile' : 'Only you can see this'}
                </p>
              </div>
            </div>
            <Switch checked={isPublic} onCheckedChange={setIsPublic} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {existing ? 'Save Changes' : 'Create Collection'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
