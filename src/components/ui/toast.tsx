import { createContext, useContext, useState } from 'react';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/icons';

type ToastTone = 'success' | 'error' | 'warn' | 'info';

interface Toast {
  id: string;
  title: string;
  desc?: string;
  tone?: ToastTone;
}

type PushFn = (t: Omit<Toast, 'id'>) => void;

const ToastCtx = createContext<PushFn | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push: PushFn = (t) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((ts) => [...ts, { id, ...t }]);
    setTimeout(() => setToasts((ts) => ts.filter((x) => x.id !== id)), 2800);
  };

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="fixed top-4 start-4 z-[60] space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="toast bg-white border border-[var(--border)] rounded-lg elev-shadow px-4 py-3 min-w-[260px] flex items-start gap-3"
          >
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                t.tone === 'success' ? 'tone-emerald' :
                t.tone === 'warn'    ? 'tone-amber'   :
                t.tone === 'error'   ? 'tone-rose'    : 'tone-sky',
              )}
            >
              <Icon name={t.tone === 'success' ? 'check' : t.tone === 'error' ? 'x' : 'info'} size={16} />
            </div>
            <div className="flex-1">
              <div className="text-[13.5px] font-medium">{t.title}</div>
              {t.desc && <div className="text-[12.5px] text-[var(--muted-foreground)] mt-0.5">{t.desc}</div>}
            </div>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
