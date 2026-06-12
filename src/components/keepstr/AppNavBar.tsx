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

  const displayName = metadata?.name ?? metadata?.display_name ?? 'Anon';
  const avatarUrl = metadata?.picture;
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <header className="h-14 border-b border-border bg-background/80 backdrop-blur-sm flex items-center gap-3 px-4 sticky top-0 z-40">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden shrink-0"
        onClick={onMenuToggle}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Logo (visible on mobile) */}
      <Link
        to="/app"
        className="lg:hidden font-bold text-lg tracking-tight text-primary shrink-0"
      >
        Keepstr
      </Link>

      {/* Search bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search bookmarks… (Cmd+K)"
            value={localSearch}
            onChange={(e) => handleSearch(e.target.value)}
            onClick={onCommandPalette}
            readOnly={Boolean(onCommandPalette)}
            className="pl-9 pr-4 h-9 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:bg-background cursor-pointer"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 ml-auto shrink-0">
        {onNewBookmark && (
          <Button
            size="sm"
            className="hidden sm:flex gap-1.5"
            onClick={() => onNewBookmark()}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden md:inline">Add</span>
          </Button>
        )}

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={avatarUrl} alt={displayName} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-3 py-2">
                <p className="text-sm font-medium truncate">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.pubkey.slice(0, 8)}…
                </p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/app/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={logout}
              >
                Sign out
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
