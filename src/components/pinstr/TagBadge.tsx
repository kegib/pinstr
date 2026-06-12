import { cn } from '@/lib/utils';

interface TagBadgeProps {
  tag: string;
  onClick?: (tag: string) => void;
  className?: string;
  variant?: 'default' | 'removable';
  onRemove?: (tag: string) => void;
}

export function TagBadge({ tag, onClick, className, variant = 'default', onRemove }: TagBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
        'bg-accent text-accent-foreground',
        onClick && 'cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors',
        className,
      )}
      onClick={onClick ? () => onClick(tag) : undefined}
    >
      #{tag}
      {variant === 'removable' && onRemove && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onRemove(tag); }}
          className="ml-0.5 hover:text-destructive transition-colors"
          aria-label={`Remove tag ${tag}`}
        >
          ×
        </button>
      )}
    </span>
  );
}
