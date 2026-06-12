import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Upload, FileText, Check, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { parseNetscapeBookmarkHtml, getUniqueFolders } from '@/lib/importParser';
import type { ImportedBookmark, LocalCollection } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

type Step = 'upload' | 'map' | 'import' | 'done';

interface FolderMapping {
  folder: string[];
  collectionId: string | null; // null = create new, '' = skip
  newName?: string;
}

interface ImportWizardProps {
  collections: LocalCollection[];
  onCreateCollection: (name: string) => Promise<LocalCollection>;
  onSaveBookmarks: (
    bookmarks: ImportedBookmark[],
    folderToCollection: Map<string, string>,
  ) => Promise<void>;
}

export function ImportWizard({
  collections,
  onCreateCollection,
  onSaveBookmarks,
}: ImportWizardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>('upload');
  const [bookmarks, setBookmarks] = useState<ImportedBookmark[]>([]);
  const [folders, setFolders] = useState<string[][]>([]);
  const [mappings, setMappings] = useState<FolderMapping[]>([]);
  const [progress, setProgress] = useState(0);
  const [importedCount, setImportedCount] = useState(0);
  const [importing, setImporting] = useState(false);

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const html = e.target?.result as string;
      try {
        const parsed = parseNetscapeBookmarkHtml(html);
        if (parsed.length === 0) {
          toast.error('No bookmarks found in this file');
          return;
        }
        const uniqueFolders = getUniqueFolders(parsed);
        setBookmarks(parsed);
        setFolders(uniqueFolders);
        setMappings(
          uniqueFolders.map((folder) => ({
            folder,
            collectionId: null,
            newName: folder[folder.length - 1],
          })),
        );
        setStep('map');
      } catch {
        toast.error('Failed to parse bookmark file');
      }
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleImport = async () => {
    setImporting(true);
    setStep('import');

    try {
      // Create new collections for unmapped folders
      const folderToCollection = new Map<string, string>();
      const total = mappings.length;

      for (let i = 0; i < mappings.length; i++) {
        const m = mappings[i];
        const key = m.folder.join('/');

        if (m.collectionId === '') {
          // Skip
        } else if (m.collectionId === null) {
          // Create new collection
          const col = await onCreateCollection(m.newName || m.folder[m.folder.length - 1]);
          folderToCollection.set(key, col.id);
        } else {
          folderToCollection.set(key, m.collectionId);
        }

        setProgress(Math.round(((i + 1) / (total + bookmarks.length)) * 100));
      }

      // Save bookmarks
      await onSaveBookmarks(bookmarks, folderToCollection);
      setImportedCount(bookmarks.length);
      setProgress(100);
      setStep('done');
    } catch (err) {
      toast.error('Import failed');
      setStep('map');
    } finally {
      setImporting(false);
    }
  };

  const updateMapping = (index: number, collectionId: string) => {
    setMappings((prev) =>
      prev.map((m, i) => (i === index ? { ...m, collectionId } : m)),
    );
  };

  if (step === 'upload') {
    return (
      <div className="max-w-lg mx-auto">
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-border rounded-xl p-12 flex flex-col items-center gap-4 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Upload className="w-8 h-8 text-primary" />
          </div>
          <div className="text-center">
            <p className="font-semibold">Drop your bookmarks file here</p>
            <p className="text-sm text-muted-foreground mt-1">
              Supports Netscape Bookmark Format (.html) exported from Chrome, Firefox, Safari
            </p>
          </div>
          <Button variant="outline">Browse files</Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".html,.htm"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </div>

        <div className="mt-6 bg-muted rounded-lg p-4">
          <p className="text-sm font-medium mb-2">How to export bookmarks:</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li><strong>Chrome:</strong> Bookmarks → Bookmark manager → ⋮ → Export</li>
            <li><strong>Firefox:</strong> Bookmarks → Manage → Import/Export → Export as HTML</li>
            <li><strong>Safari:</strong> File → Export Bookmarks</li>
          </ul>
        </div>
      </div>
    );
  }

  if (step === 'map') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
          <FileText className="w-5 h-5 text-primary shrink-0" />
          <div>
            <p className="font-medium text-sm">{bookmarks.length} bookmarks found</p>
            <p className="text-xs text-muted-foreground">{folders.length} folders detected</p>
          </div>
        </div>

        {folders.length > 0 ? (
          <>
            <div>
              <h3 className="font-semibold mb-3">Map folders to collections</h3>
              <div className="space-y-3">
                {mappings.map((mapping, i) => (
                  <div
                    key={mapping.folder.join('/')}
                    className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        📁 {mapping.folder.join(' › ')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {bookmarks.filter((b) => b.folder.join('/') === mapping.folder.join('/')).length} bookmarks
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                    <Select
                      value={mapping.collectionId === null ? 'new' : (mapping.collectionId || 'skip')}
                      onValueChange={(val) => updateMapping(i, val === 'new' ? null! : (val === 'skip' ? '' : val))}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">Create new</SelectItem>
                        <SelectItem value="skip">Skip folder</SelectItem>
                        {collections.map((col) => (
                          <SelectItem key={col.id} value={col.id}>
                            {col.icon} {col.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('upload')}>
                Back
              </Button>
              <Button onClick={handleImport} className="flex-1">
                Import {bookmarks.length} bookmarks
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              No folders detected. All bookmarks will be imported without collections.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('upload')}>Back</Button>
              <Button onClick={handleImport}>Import {bookmarks.length} bookmarks</Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (step === 'import') {
    return (
      <div className="max-w-md mx-auto text-center space-y-6 py-12">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
        <div>
          <p className="font-semibold">Importing bookmarks…</p>
          <p className="text-sm text-muted-foreground mt-1">Please wait</p>
        </div>
        <Progress value={progress} className="w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto text-center space-y-6 py-12">
      <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto">
        <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
      </div>
      <div>
        <p className="font-semibold text-lg">Import complete!</p>
        <p className="text-sm text-muted-foreground mt-1">
          {importedCount} bookmarks imported successfully.
        </p>
      </div>
      <Button asChild>
        <a href="/app">View my bookmarks</a>
      </Button>
    </div>
  );
}
