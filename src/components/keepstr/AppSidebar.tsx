import { Link, useLocation } from 'react-router-dom';
import {
  Bookmark,
  FolderOpen,
  Settings,
  Upload,
  Plus,
  Home,
} from 'lucide-react';
import type { LocalCollection } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

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
      className="flex items-center gap-2.5 px-2.5 py-2 text-xs transition-all duration-100"
      style={{
        borderRadius: '3px',
        color: isActive ? '#9B8FFF' : '#c8c8d0',
        background: isActive ? 'rgba(123,104,238,0.12)' : 'transparent',
        textDecoration: 'none',
        fontFamily: 'inherit',
      }}
      onMouseEnter={e => {
        if (!isActive) {
          (e.currentTarget as HTMLAnchorElement).style.background = '#1a1a20';
          (e.currentTarget as HTMLAnchorElement).style.color = '#ececf0';
        }
      }}
      onMouseLeave={e => {
        if (!isActive) {
          (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
          (e.currentTarget as HTMLAnchorElement).style.color = '#c8c8d0';
        }
      }}
    >
      <span className="w-4 h-4 flex items-center justify-center shrink-0" style={{ color: isActive ? '#7B68EE' : '#8a8a98' }}>
        {icon}
      </span>
      <span className="flex-1 truncate">{label}</span>
      {count !== undefined && (
        <span className="text-[10px] tabular-nums" style={{ color: '#5a5a6a' }}>{count}</span>
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
      className={cn('flex flex-col w-56 h-full', className)}
      style={{ background: '#111113', borderRight: '1px solid #1f1f25' }}
    >
      {/* Brand */}
      <div
        className="flex items-center gap-2.5 px-4 py-3.5"
        style={{ borderBottom: '1px solid #1f1f25' }}
      >
        <div
          className="w-7 h-7 rounded flex items-center justify-center shrink-0"
          style={{ background: '#7B68EE' }}
        >
          <Bookmark className="w-3.5 h-3.5" style={{ color: '#0a0a0a' }} />
        </div>
        <div>
          <div className="text-sm font-bold tracking-wide" style={{ color: '#9B8FFF', letterSpacing: '0.6px' }}>
            keepstr
          </div>
          <div className="text-[10px]" style={{ color: '#5a5a6a', letterSpacing: '0.3px' }}>
            nostr bookmarks
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 px-3 py-3">
        {/* Section label */}
        <div
          className="px-2.5 pb-2 text-[10px] uppercase tracking-widest"
          style={{ color: '#5a5a6a', letterSpacing: '1.8px' }}
        >
          Navigation
        </div>

        <nav className="flex flex-col gap-0.5">
          <NavItem
            to="/app"
            exact
            icon={<Home className="w-4 h-4" />}
            label="all bookmarks"
            onClick={onClose}
          />
          <NavItem
            to="/app/collections"
            icon={<FolderOpen className="w-4 h-4" />}
            label="collections"
            onClick={onClose}
          />
          <NavItem
            to="/app/import"
            icon={<Upload className="w-4 h-4" />}
            label="import"
            onClick={onClose}
          />
          <NavItem
            to="/app/settings"
            icon={<Settings className="w-4 h-4" />}
            label="settings"
            onClick={onClose}
          />
        </nav>

        {/* Collections section */}
        {collections.length > 0 && (
          <>
            <div
              className="flex items-center justify-between px-2.5 pt-4 pb-2"
            >
              <span
                className="text-[10px] uppercase tracking-widest"
                style={{ color: '#5a5a6a', letterSpacing: '1.8px' }}
              >
                Collections
              </span>
              {onNewCollection && (
                <button
                  onClick={() => onNewCollection()}
                  className="flex items-center justify-center w-4 h-4 transition-colors"
                  style={{ background: 'transparent', border: 'none', color: '#5a5a6a', cursor: 'pointer', padding: 0 }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#9B8FFF'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#5a5a6a'; }}
                  title="New collection"
                >
                  <Plus className="w-3 h-3" />
                </button>
              )}
            </div>
            <nav className="flex flex-col gap-0.5">
              {collections.map((col) => (
                <Link
                  key={col.id}
                  to={`/app/collections/${col.id}`}
                  onClick={onClose}
                  className="flex items-center gap-2 px-2.5 py-1.5 text-xs transition-all duration-100"
                  style={{
                    borderRadius: '3px',
                    color: '#c8c8d0',
                    textDecoration: 'none',
                    fontFamily: 'inherit',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLAnchorElement).style.background = '#1a1a20';
                    (e.currentTarget as HTMLAnchorElement).style.color = '#ececf0';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                    (e.currentTarget as HTMLAnchorElement).style.color = '#c8c8d0';
                  }}
                >
                  <span className="text-sm leading-none">{col.icon}</span>
                  <span className="flex-1 truncate">{col.name}</span>
                  {bookmarkCounts[col.id] !== undefined && (
                    <span className="text-[10px] tabular-nums" style={{ color: '#5a5a6a' }}>
                      {bookmarkCounts[col.id]}
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          </>
        )}
      </ScrollArea>

      {/* Add bookmark CTA */}
      {onNewBookmark && (
        <div className="p-3" style={{ borderTop: '1px solid #1f1f25' }}>
          <button
            className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-all duration-120"
            onClick={() => { onNewBookmark(); onClose?.(); }}
            style={{
              borderRadius: '3px',
              border: '1px solid #7B68EE',
              color: '#9B8FFF',
              background: 'transparent',
              fontFamily: 'inherit',
              cursor: 'pointer',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = '#7B68EE';
              (e.currentTarget as HTMLButtonElement).style.color = '#0a0a0a';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
              (e.currentTarget as HTMLButtonElement).style.color = '#9B8FFF';
            }}
          >
            <Plus className="w-3.5 h-3.5" />
            new bookmark
          </button>
        </div>
      )}
    </aside>
  );
}
