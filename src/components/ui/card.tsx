import { cn } from '@/lib/utils';

export function Card({ className = '', children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('bg-[var(--card)] border border-[var(--border)] rounded-xl card-shadow', className)}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = '', children }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-5 border-b border-[var(--border)] flex items-start justify-between gap-4', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ className = '', children }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('text-[15px] font-semibold text-[var(--foreground)]', className)}>
      {children}
    </h3>
  );
}

export function CardDesc({ className = '', children }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-[13px] text-[var(--muted-foreground)] mt-0.5', className)}>
      {children}
    </p>
  );
}

export function CardBody({ className = '', children }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-5', className)}>
      {children}
    </div>
  );
}
