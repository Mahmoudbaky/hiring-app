import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/icons';

export interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps {
  value: string | number;
  onChange: (v: string | number) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function DSelect({ value, onChange, options, placeholder, className = '', disabled = false }: SelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => !disabled && setOpen((v) => !v)}
        disabled={disabled}
        className="h-10 w-full rounded-md border border-[var(--input)] bg-[var(--card)] px-3 text-[13.5px] flex items-center justify-between focus-ring disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className={selected ? '' : 'text-[var(--muted-foreground)]'}>
          {selected ? selected.label : placeholder ?? 'اختر…'}
        </span>
        <Icon name="chevDown" size={14} className="text-[var(--muted-foreground)]" />
      </button>
      {open && (
        <div className="absolute z-30 mt-1 right-0 left-0 bg-[var(--card)] border border-[var(--border)] rounded-md elev-shadow py-1 anim-pop max-h-60 overflow-y-auto">
          {options.map((o) => (
            <button
              key={String(o.value)}
              type="button"
              onClick={() => { onChange(o.value); setOpen(false); }}
              className={cn(
                'w-full text-start px-3 py-2 text-[13.5px] hover:bg-[var(--accent)] flex items-center justify-between',
                o.value === value && 'bg-[var(--accent)]',
              )}
            >
              <span>{o.label}</span>
              {o.value === value && <Icon name="check" size={14} className="text-[var(--primary)]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
