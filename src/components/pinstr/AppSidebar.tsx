import { Link, useLocation } from 'react-router-dom';
import {
  Bookmark,
  FolderOpen,
  Settings,
  Upload,
  Plus,
  ChevronRight,
  Home,
} from 'lucide-react';
import type { LocalCollection } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface AppSidebarProps {
  collections?: LocalCollection[];
  bookmarkCounts?: Record<string, number>;
  onNewCollection?: () => void;
  onNewBookmark?: () => void;
  className?: string;
  onClose?: () => void;
}

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  count?: number;
  exact?: boolean;
  onClick?: () => void;
}

function NavItem({ to, icon, label, count, exact = false, onClick }: NavItemProps) {
  const location = useLocation();
  const isActive = exact
    ? location.pathname === to
    : location.pathname.startsWith(to);

  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all',
        isActive
          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
          : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground',
      )}
    >
      <span className="shrink-0">{icon}</span>
      <span className="flex-1 truncate">{label}</span>
      {count !== undefined && (
        <span className="text-xs text-muted-foreground tabular-nums">{count}</span>
      )}
    </Link>
  );
}

export function AppSidebar({
  collections = [],
  bookmarkCounts = {},
  onNewCollection,
  onNewBookmark,
  className,
  onClose,
}: AppSidebarProps) {
  return (
    <aside
      className={cn(
        'flex flex-col w-64 bg-sidebar border-r border-sidebar-border h-full',
        className,
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Bookmark className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="font-bold text-lg tracking-tight">Pinstr</span>
      </div>

      <ScrollArea className="flex-1 px-3 py-3">
        <nav className="space-y-1">
          <NavItem
            to="/app"
            exact
            icon={<Home className="w-4 h-4" />}
            label="All Bookmarks"
            onClick={onClose}
          />
          <NavItem
            to="/app/collections"
            icon={<FolderOpen className="w-4 h-4" />}
            label="Collections"
            onClick={onClose}
          />
          <NavItem
            to="/app/import"
            icon={<Upload className="w-4 h-4" />}
            label="Import"
            onClick={onClose}
          />
          <NavItem
            to="/app/settings"
            icon={<Settings className="w-4 h-4" />}
            label="Settings"
            onClick={onClose}
          />
        </nav>

        {collections.length > 0 && (
          <>
            <div className="flex items-center justify-between px-3 py-3 mt-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Collections
              </span>
              {onNewCollection && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={onNewCollection}
                  title="New collection"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              )}
            </div>
            <nav className="space-y-0.5">
              {collections.map((col) => (
                <Link
                  key={col.id}
                  to={`/app/collections/${col.id}`}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm transition-all',
                    'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground',
                  )}
                >
                  <span className="text-base leading-none">{col.icon}</span>
                  <span className="flex-1 truncate">{col.name}</span>
                  {bookmarkCounts[col.id] !== undefined && (
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {bookmarkCounts[col.id]}
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          </>
        )}
      </ScrollArea>

      {/* New bookmark */}
      {onNewBookmark && (
        <div className="p-3 border-t border-sidebar-border">
          <Button
            className="w-full gap-2"
            onClick={() => { onNewBookmark(); onClose?.(); }}
          >
            <Plus className="w-4 h-4" />
            New Bookmark
          </Button>
        </div>
      )}
    </aside>
  );
}
