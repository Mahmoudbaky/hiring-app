import { useEffect } from 'react';
import { cn } from '@/lib/utils';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function DDialog({ open, onClose, children, size = 'md' }: DialogProps) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', h);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const w = size === 'lg' ? 'max-w-[720px]' : size === 'sm' ? 'max-w-[420px]' : 'max-w-[560px]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 anim-fade">
      <div className="absolute inset-0 bg-[oklch(0.2_0.01_260/0.45)]" onClick={onClose} />
      <div className={cn('relative w-full bg-[var(--card)] rounded-xl border border-[var(--border)] elev-shadow anim-pop', w)}>
        {children}
      </div>
    </div>
  );
}
