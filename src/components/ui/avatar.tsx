import { cn } from '@/lib/utils';

type AvatarTone = 'sky' | 'violet' | 'emerald' | 'amber' | 'rose' | 'slate';

const toneClasses: Record<AvatarTone, string> = {
  sky:     'bg-[oklch(0.62_0.13_230)] text-white',
  violet:  'bg-[oklch(0.6_0.17_295)] text-white',
  emerald: 'bg-[oklch(0.58_0.13_160)] text-white',
  amber:   'bg-[oklch(0.68_0.15_65)] text-white',
  rose:    'bg-[oklch(0.62_0.17_25)] text-white',
  slate:   'bg-[oklch(0.5_0.01_260)] text-white',
};

interface AvatarProps {
  name: string;
  tone?: AvatarTone;
  size?: number;
}

export function Avatar({ name, tone = 'sky', size = 36 }: AvatarProps) {
  return (
    <div
      className={cn('rounded-full font-semibold flex items-center justify-center shrink-0', toneClasses[tone])}
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {name.slice(0, 1)}
    </div>
  );
}
