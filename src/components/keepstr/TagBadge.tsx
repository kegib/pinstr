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
      className={cn('inline-flex items-center gap-0.5 text-[10px] font-medium', className)}
      style={{
        padding: '1px 6px',
        borderRadius: '3px',
        background: 'rgba(123,104,238,0.10)',
        color: '#8a8a98',
        border: '1px solid #2a2a32',
        cursor: onClick ? 'pointer' : 'default',
        fontFamily: 'inherit',
      }}
      onClick={onClick ? () => onClick(tag) : undefined}
      onMouseEnter={onClick ? e => {
        (e.currentTarget as HTMLSpanElement).style.color = '#9B8FFF';
        (e.currentTarget as HTMLSpanElement).style.borderColor = '#7B68EE';
      } : undefined}
      onMouseLeave={onClick ? e => {
        (e.currentTarget as HTMLSpanElement).style.color = '#8a8a98';
        (e.currentTarget as HTMLSpanElement).style.borderColor = '#2a2a32';
      } : undefined}
    >
      <span style={{ color: '#5a5a6a' }}>#</span>{tag}
      {variant === 'removable' && onRemove && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onRemove(tag); }}
          className="ml-0.5 leading-none"
          style={{ background: 'none', border: 'none', color: '#5a5a6a', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#FF5A5A'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#5a5a6a'; }}
          aria-label={`Remove tag ${tag}`}
        >
          ×
        </button>
      )}
    </span>
  );
}
