import { cn } from '@/lib/utils';

type BadgeTone = 'neutral' | 'sky' | 'amber' | 'emerald' | 'rose' | 'violet' | 'success';

const toneClasses: Record<BadgeTone, string> = {
  neutral: 'bg-[var(--secondary)] text-[var(--secondary-foreground)] border-[var(--border)]',
  sky:     'bg-[oklch(0.97_0.03_230)] text-[oklch(0.42_0.13_230)] border-[oklch(0.9_0.04_230)]',
  amber:   'bg-[oklch(0.975_0.04_80)] text-[oklch(0.48_0.12_70)] border-[oklch(0.9_0.06_80)]',
  emerald: 'bg-[oklch(0.97_0.04_155)] text-[oklch(0.4_0.11_155)] border-[oklch(0.88_0.06_155)]',
  rose:    'bg-[oklch(0.97_0.03_25)] text-[oklch(0.5_0.15_25)] border-[oklch(0.9_0.05_25)]',
  violet:  'bg-[oklch(0.97_0.03_295)] text-[oklch(0.48_0.13_295)] border-[oklch(0.9_0.05_295)]',
  success: 'bg-[oklch(0.97_0.04_155)] text-[oklch(0.4_0.11_155)] border-[oklch(0.88_0.06_155)]',
};

interface BadgeProps {
  tone?: BadgeTone;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ tone = 'neutral', children, className = '' }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[12px] rounded-full border font-medium',
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
