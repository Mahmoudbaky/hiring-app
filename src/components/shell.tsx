import { cn } from '@/lib/utils';
import { Icon } from '@/components/icons';
import { Avatar } from '@/components/ui/avatar';
import { useTheme } from '@/components/theme-provider';

type Page = string;

/* ── Brand logo ───────────────────────────────────────────────────── */
export function BrandLogo({ size = 32 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2">
      <div style={{ width: size, height: size }}>
        <svg viewBox="0 0 40 40" width={size} height={size}>
          <defs>
            <linearGradient id="lg-brand" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="oklch(0.68 0.19 30)" />
              <stop offset="1" stopColor="oklch(0.55 0.18 20)" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="36" height="36" rx="9" fill="url(#lg-brand)" />
          <path d="M12 14 L12 26 L20 26 A6 6 0 0 0 20 14 Z" fill="#fff" opacity="0.96" />
          <circle cx="27" cy="20" r="2.6" fill="#fff" opacity="0.9" />
        </svg>
      </div>
      <div className="leading-tight">
        <div className="text-[15px] font-bold tracking-tight text-[var(--foreground)]">ضم</div>
        <div className="text-[11px] text-[var(--muted-foreground)] -mt-0.5">نظام التوظيف</div>
      </div>
    </div>
  );
}

/* ── Table helpers ────────────────────────────────────────────────── */
export function Th({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  return (
    <th className={cn('text-start text-[12px] font-medium text-[var(--muted-foreground)] px-4 py-3 bg-[var(--muted)]/40', className)}>
      {children}
    </th>
  );
}

export function Td({ children, className = '', colSpan }: { children?: React.ReactNode; className?: string; colSpan?: number }) {
  return (
    <td colSpan={colSpan} className={cn('px-4 py-3 text-[13.5px] text-[var(--foreground)] border-t border-[var(--border)]', className)}>
      {children}
    </td>
  );
}

/* ── Page header ──────────────────────────────────────────────────── */
interface PageHeaderProps {
  icon?: string;
  title: string;
  desc?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ icon, title, desc, actions }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-6 mb-6">
      <div className="flex items-start gap-3">
        {icon && (
          <div className="w-10 h-10 rounded-lg tone-rose flex items-center justify-center">
            <Icon name={icon} size={18} />
          </div>
        )}
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-[var(--foreground)]">{title}</h1>
          {desc && <p className="text-[13.5px] text-[var(--muted-foreground)] mt-1">{desc}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

/* ── Button ───────────────────────────────────────────────────────── */
type ButtonVariant = 'default' | 'outline' | 'ghost' | 'subtle' | 'destructive' | 'link';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon' | 'iconSm';

const btnVariants: Record<ButtonVariant, string> = {
  default:     'bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]',
  outline:     'border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--accent)] text-[var(--foreground)]',
  ghost:       'hover:bg-[var(--accent)] text-[var(--foreground)]',
  subtle:      'bg-[var(--secondary)] hover:bg-[var(--border)] text-[var(--secondary-foreground)]',
  destructive: 'bg-[var(--destructive)] text-white hover:opacity-90',
  link:        'text-[var(--primary)] underline-offset-4 hover:underline',
};

const btnSizes: Record<ButtonSize, string> = {
  sm:     'h-8 px-3 text-[13px]',
  md:     'h-9 px-4 text-[13.5px]',
  lg:     'h-10 px-5 text-sm',
  icon:   'h-9 w-9',
  iconSm: 'h-8 w-8',
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Btn({ variant = 'default', size = 'md', className = '', children, ...rest }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-ring disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap',
        btnVariants[variant],
        btnSizes[size],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

/* ── Input ────────────────────────────────────────────────────────── */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export function DInput({ icon, className = '', ...rest }: InputProps) {
  return (
    <div className="relative">
      {icon && (
        <span className="absolute inset-y-0 start-0 ps-3 flex items-center text-[var(--muted-foreground)] pointer-events-none">
          {icon}
        </span>
      )}
      <input
        className={cn(
          'w-full h-10 rounded-md border border-[var(--input)] bg-[var(--card)] text-[13.5px] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]',
          'px-3 focus-ring transition-shadow',
          icon ? 'ps-9' : '',
          className,
        )}
        {...rest}
      />
    </div>
  );
}

/* ── Textarea ─────────────────────────────────────────────────────── */
export function DTextarea({ className = '', ...rest }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'w-full min-h-[120px] rounded-md border border-[var(--input)] bg-[var(--card)] text-[13.5px] p-3 placeholder:text-[var(--muted-foreground)] focus-ring resize-y',
        className,
      )}
      {...rest}
    />
  );
}

/* ── Label ────────────────────────────────────────────────────────── */
interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function DLabel({ children, className = '', required, ...rest }: LabelProps) {
  return (
    <label className={cn('text-[13px] font-medium text-[var(--foreground)] flex items-center gap-1', className)} {...rest}>
      {children}
      {required && <span className="text-[var(--primary)]">*</span>}
    </label>
  );
}

/* ── Sidebar ──────────────────────────────────────────────────────── */
const navItems = [
  { key: 'dashboard',    label: 'الإحصائيات',       icon: 'chart' },
  { key: 'applications', label: 'طلبات التوظيف',    icon: 'users',     badge: 24 },
  { key: 'incoming',     label: 'الطلبات الواردة',  icon: 'briefcase' },
  { key: 'jobs',         label: 'الوظائف المتاحة',  icon: 'globe' },
  { key: 'settings',     label: 'الإعدادات',        icon: 'settings' },
];

interface SidebarProps {
  page: Page;
  setPage: (p: Page) => void;
}

export function Sidebar({ page, setPage }: SidebarProps) {
  return (
    <aside className="w-[240px] shrink-0 bg-[var(--card)] border-l border-[var(--border)] h-screen sticky top-0 flex flex-col">
      <div className="p-5 border-b border-[var(--border)]">
        <BrandLogo />
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((n) => {
          const active = page === n.key;
          return (
            <button
              key={n.key}
              onClick={() => setPage(n.key)}
              className={cn(
                'w-full flex items-center gap-3 px-3 h-10 rounded-md text-[13.5px] transition-colors focus-ring',
                active
                  ? 'bg-[oklch(0.97_0.03_30)] text-[var(--primary)] font-medium'
                  : 'text-[var(--foreground)] hover:bg-[var(--accent)]',
              )}
            >
              <Icon
                name={n.icon}
                size={17}
                className={active ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]'}
              />
              <span className="flex-1 text-start">{n.label}</span>
              {n.badge && (
                <span
                  className={cn(
                    'text-[11px] h-5 min-w-[20px] px-1.5 rounded-full flex items-center justify-center',
                    active ? 'bg-[var(--primary)] text-white' : 'bg-[var(--muted)] text-[var(--muted-foreground)]',
                  )}
                >
                  {n.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
      <div className="p-3 border-t border-[var(--border)] space-y-1">
        <button
          onClick={() => setPage('careers')}
          className="w-full flex items-center gap-3 px-3 h-10 rounded-md text-[13.5px] text-[var(--muted-foreground)] hover:bg-[var(--accent)] focus-ring"
        >
          <Icon name="globe" size={17} />
          <span className="flex-1 text-start">صفحة الوظائف (للمستخدم)</span>
          <Icon name="chevLeft" size={14} />
        </button>
        <button
          onClick={() => setPage('apply')}
          className="w-full flex items-center gap-3 px-3 h-10 rounded-md text-[13.5px] text-[var(--muted-foreground)] hover:bg-[var(--accent)] focus-ring"
        >
          <Icon name="send" size={17} />
          <span className="flex-1 text-start">بوابة التقديم العامة</span>
          <Icon name="chevLeft" size={14} />
        </button>
      </div>
    </aside>
  );
}

/* ── Topbar ───────────────────────────────────────────────────────── */
export function Topbar() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');

  return (
    <header className="h-16 bg-[var(--card)] border-b border-[var(--border)] sticky top-0 z-20 px-6 flex items-center gap-4">
      <div className="flex-1 max-w-[440px]">
        <DInput placeholder="ابحث عن متقدم، وظيفة، أو قسم…" icon={<Icon name="search" size={14} />} />
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-2">
        <Btn
          variant="ghost"
          size="icon"
          aria-label="تبديل المظهر"
          onClick={toggleTheme}
          title={isDark ? 'تفعيل المظهر الفاتح' : 'تفعيل المظهر الداكن'}
        >
          <Icon name={isDark ? 'sun' : 'moon'} size={18} />
        </Btn>
        <Btn variant="ghost" size="icon" aria-label="الإشعارات">
          <div className="relative">
            <Icon name="bell" size={18} />
            <span className="absolute -top-0.5 -end-0.5 w-2 h-2 bg-[var(--primary)] rounded-full ring-2 ring-[var(--card)]" />
          </div>
        </Btn>
        <div className="h-6 w-px bg-[var(--border)]" />
        <div className="flex items-center gap-3 pe-1">
          <div className="text-end leading-tight">
            <div className="text-[13px] font-medium">أحمد المدير</div>
            <div className="text-[11px] text-[var(--muted-foreground)]">مدير الموارد البشرية</div>
          </div>
          <Avatar name="أ" tone="slate" size={32} />
        </div>
      </div>
    </header>
  );
}

/* ── Attachment icon ──────────────────────────────────────────────── */
export function AttachIcon({ type }: { type: 'pdf' | 'image' | 'link' }) {
  return (
    <span
      className={cn(
        'w-7 h-7 rounded-md flex items-center justify-center',
        type === 'pdf' ? 'tone-rose' : type === 'image' ? 'tone-amber' : 'tone-sky',
      )}
    >
      <Icon name={type === 'pdf' ? 'pdf' : type === 'image' ? 'image' : 'link'} size={14} />
    </span>
  );
}

/* ── Pagination ───────────────────────────────────────────────────── */
interface PaginationProps {
  page: number;
  pages: number;
  total: number;
  perPage: number;
  onPage: (p: number) => void;
}

export function Pagination({ page, pages, total, perPage, onPage }: PaginationProps) {
  return (
    <div className="flex items-center justify-between p-4 border-t border-[var(--border)]">
      <div className="text-[12px] text-[var(--muted-foreground)] tabular">
        عرض{' '}
        <span className="font-medium text-[var(--foreground)]">{Math.min((page - 1) * perPage + 1, total)}</span>
        {' '}إلى{' '}
        <span className="font-medium text-[var(--foreground)]">{Math.min(page * perPage, total)}</span>
        {' '}من أصل {total} طلب
      </div>
      <div className="flex items-center gap-1">
        <Btn variant="outline" size="sm" disabled={page === 1} onClick={() => onPage(Math.max(1, page - 1))}>
          <Icon name="chevRight" size={13} /> السابق
        </Btn>
        {Array.from({ length: Math.min(pages, 5) }).map((_, i) => (
          <button
            key={i}
            onClick={() => onPage(i + 1)}
            className={cn(
              'h-8 min-w-8 px-2 rounded-md border text-[13px] tabular focus-ring',
              page === i + 1 ? 'page-active' : 'border-[var(--border)] bg-[var(--card)] hover:bg-[var(--accent)]',
            )}
          >
            {i + 1}
          </button>
        ))}
        {pages > 5 && <span className="px-2 text-[var(--muted-foreground)]">…</span>}
        <Btn variant="outline" size="sm" disabled={page === pages} onClick={() => onPage(Math.min(pages, page + 1))}>
          التالي <Icon name="chevLeft" size={13} />
        </Btn>
      </div>
    </div>
  );
}
