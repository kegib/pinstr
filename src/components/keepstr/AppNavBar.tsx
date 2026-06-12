import { useState, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, Plus } from 'lucide-react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { LoginArea } from '@/components/auth/LoginArea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLoginActions } from '@/hooks/useLoginActions';

interface AppNavBarProps {
  onMenuToggle?: () => void;
  onNewBookmark?: () => void;
  onCommandPalette?: () => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
}

export function AppNavBar({
  onMenuToggle,
  onNewBookmark,
  onCommandPalette,
  searchQuery = '',
  onSearchChange,
}: AppNavBarProps) {
  const navigate = useNavigate();
  const { user, metadata } = useCurrentUser();
  const { logout } = useLoginActions();
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback((value: string) => {
    setLocalSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (onSearchChange) {
        onSearchChange(value);
      } else if (value.trim()) {
        navigate(`/app/search?q=${encodeURIComponent(value.trim())}`);
      }
    }, 200);
  }, [onSearchChange, navigate]);

  const displayName = metadata?.name ?? metadata?.display_name ?? 'anon';
  const avatarUrl = metadata?.picture;
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <header
      className="h-14 border-b flex items-center gap-3 px-4 sticky top-0 z-40"
      style={{
        borderColor: '#1f1f25',
        background: 'linear-gradient(180deg, #0d0d10 0%, #0a0a0a 100%)',
      }}
    >
      {/* Mobile menu */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden shrink-0 text-[#8a8a98] hover:text-[#9B8FFF] hover:bg-transparent"
        onClick={onMenuToggle}
      >
        <Menu className="h-4 w-4" />
      </Button>

      {/* Wordmark (mobile) */}
      <Link
        to="/app"
        className="lg:hidden font-bold tracking-wide text-sm shrink-0"
        style={{ color: '#9B8FFF', letterSpacing: '0.6px' }}
      >
        keepstr
      </Link>

      {/* Search */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: '#5a5a6a' }} />
          <Input
            placeholder="search bookmarks… (⌘K)"
            value={localSearch}
            onChange={(e) => handleSearch(e.target.value)}
            onClick={onCommandPalette}
            readOnly={Boolean(onCommandPalette)}
            className="pl-8 h-8 text-xs border cursor-pointer focus-visible:ring-1"
            style={{
              background: '#111113',
              borderColor: '#2a2a32',
              color: '#c8c8d0',
              fontFamily: 'inherit',
            }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 ml-auto shrink-0">
        {onNewBookmark && (
          <button
            onClick={() => onNewBookmark()}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs border transition-all duration-120"
            style={{
              borderColor: '#7B68EE',
              color: '#9B8FFF',
              background: 'transparent',
              borderRadius: '3px',
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
            <Plus className="h-3 w-3" />
            <span className="hidden md:inline">add</span>
          </button>
        )}

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
              >
                <Avatar className="h-7 w-7">
                  <AvatarImage src={avatarUrl} alt={displayName} />
                  <AvatarFallback
                    className="text-xs font-bold"
                    style={{ background: '#2a2a32', color: '#9B8FFF' }}
                  >
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:block text-xs truncate max-w-28" style={{ color: '#8a8a98' }}>
                  {displayName}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-44 text-xs border"
              style={{ background: '#111113', borderColor: '#2a2a32', fontFamily: 'inherit' }}
            >
              <div className="px-3 py-2 border-b" style={{ borderColor: '#1f1f25' }}>
                <p className="font-medium truncate" style={{ color: '#ececf0' }}>{displayName}</p>
                <p className="truncate mt-0.5" style={{ color: '#5a5a6a' }}>
                  {user.pubkey.slice(0, 8)}…
                </p>
              </div>
              <DropdownMenuItem asChild className="text-xs cursor-pointer">
                <Link to="/app/settings" style={{ color: '#c8c8d0' }}>settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator style={{ background: '#1f1f25' }} />
              <DropdownMenuItem
                className="text-xs cursor-pointer"
                style={{ color: '#FF5A5A' }}
                onClick={logout}
              >
                sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <LoginArea className="max-w-32" />
        )}
      </div>
    </header>
  );
}
