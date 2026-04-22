import { cn } from '@/lib/utils';
import { Icon } from '@/components/icons';
import { UserAvatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Pagination as ShadPagination, PaginationContent, PaginationEllipsis,
  PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Sidebar as ShadSidebar, SidebarContent, SidebarFooter, SidebarGroup,
  SidebarGroupContent, SidebarHeader, SidebarMenu,
  SidebarMenuButton, SidebarMenuItem, SidebarTrigger, useSidebar,
} from '@/components/ui/sidebar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  TableHead, TableCell,
} from '@/components/ui/table';
import { useTheme } from '@/components/theme-provider';

/* ── Brand logo ───────────────────────────────────────────────────── */
export function BrandLogo({ size = 32 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2">
      <div style={{ width: size, height: size }}>
        <svg viewBox="0 0 40 40" width={size} height={size}>
          <defs>
            <linearGradient id="lg-brand" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="oklch(0.65 0.18 260)" />
              <stop offset="1" stopColor="oklch(0.50 0.22 255)" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="36" height="36" rx="9" fill="url(#lg-brand)" />
          <path d="M12 14 L12 26 L20 26 A6 6 0 0 0 20 14 Z" fill="#fff" opacity="0.96" />
          <circle cx="27" cy="20" r="2.6" fill="#fff" opacity="0.9" />
        </svg>
      </div>
      <div className="leading-tight">
        <div className="text-[16px] font-bold tracking-tight">ضم</div>
        <div className="text-[13px] text-muted-foreground -mt-0.5">نظام التوظيف</div>
      </div>
    </div>
  );
}

/* ── Button wrapper (backward-compat size/variant mapping) ─────────── */
type OldSize = 'sm' | 'md' | 'lg' | 'icon' | 'iconSm';
type OldVariant = 'default' | 'outline' | 'ghost' | 'subtle' | 'destructive' | 'link';

const sizeMap: Record<OldSize, any> = {
  sm: 'sm', md: 'default', lg: 'lg', icon: 'icon', iconSm: 'icon-sm',
};
const variantMap: Record<OldVariant, any> = {
  default: 'default', outline: 'outline', ghost: 'ghost',
  subtle: 'secondary', destructive: 'destructive', link: 'link',
};

interface BtnProps extends Omit<React.ComponentProps<typeof Button>, 'size' | 'variant'> {
  size?: OldSize;
  variant?: OldVariant;
}
export function Btn({ size, variant, ...props }: BtnProps) {
  return (
    <Button
      size={size ? (sizeMap[size] ?? size) : undefined}
      variant={variant ? (variantMap[variant] ?? variant) : undefined}
      {...props}
    />
  );
}

/* ── Input with optional icon ─────────────────────────────────────── */
interface DInputProps extends React.ComponentProps<typeof Input> {
  icon?: React.ReactNode;
}
export function DInput({ icon, className, ...rest }: DInputProps) {
  if (!icon) return <Input className={className} {...rest} />;
  return (
    <div className="relative">
      <span className="absolute inset-y-0 start-0 ps-3 flex items-center text-muted-foreground pointer-events-none">
        {icon}
      </span>
      <Input className={cn('ps-9', className)} {...rest} />
    </div>
  );
}

/* ── Label with optional required ─────────────────────────────────── */
interface DLabelProps extends React.ComponentProps<typeof Label> {
  required?: boolean;
}
export function DLabel({ children, required, className, ...props }: DLabelProps) {
  return (
    <Label className={cn('flex items-center gap-1', className)} {...props}>
      {children}
      {required && <span className="text-destructive">*</span>}
    </Label>
  );
}

/* ── Textarea re-export ───────────────────────────────────────────── */
export { Textarea as DTextarea } from '@/components/ui/textarea';

/* ── Select wrapper (old options-array API) ───────────────────────── */
interface DSelectProps {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}
export function DSelect({ value, onChange, options, className }: DSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/* ── Table helpers (thin shadcn wrappers) ─────────────────────────── */
export function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <TableHead className={cn('text-xs font-medium text-muted-foreground bg-muted/40 px-4 py-3', className)}>
      {children}
    </TableHead>
  );
}
export function Td({ children, className, colSpan }: { children?: React.ReactNode; className?: string; colSpan?: number }) {
  return (
    <TableCell colSpan={colSpan} className={cn('px-4 py-3 text-[13.5px]', className)}>
      {children}
    </TableCell>
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
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
      <div className="flex items-start gap-3">
        {icon && (
          <div className="w-10 h-10 rounded-lg tone-primary flex items-center justify-center shrink-0">
            <Icon name={icon} size={18} />
          </div>
        )}
        <div>
          <h1 className="text-[20px] sm:text-[22px] font-bold tracking-tight">{title}</h1>
          {desc && <p className="text-sm text-muted-foreground mt-1">{desc}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

/* ── Attachment icon ──────────────────────────────────────────────── */
export function AttachIcon({ type }: { type: 'pdf' | 'image' | 'link' }) {
  return (
    <span
      className={cn(
        'w-7 h-7 rounded-md flex items-center justify-center shrink-0',
        type === 'pdf' ? 'tone-rose' : type === 'image' ? 'tone-amber' : 'tone-sky',
      )}
    >
      <Icon name={type === 'pdf' ? 'pdf' : type === 'image' ? 'image' : 'link'} size={14} />
    </span>
  );
}

/* ── Pagination wrapper (old API → shadcn Pagination) ─────────────── */
interface PaginationProps {
  page: number;
  pages: number;
  total: number;
  perPage: number;
  onPage: (p: number) => void;
}
export function Pagination({ page, pages, total, perPage, onPage }: PaginationProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t">
      <div className="text-xs text-muted-foreground tabular-nums">
        عرض{' '}
        <span className="font-medium text-foreground">{Math.min((page - 1) * perPage + 1, total)}</span>
        {' '}إلى{' '}
        <span className="font-medium text-foreground">{Math.min(page * perPage, total)}</span>
        {' '}من أصل {total} طلب
      </div>
      <ShadPagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              text="السابق"
              href="#"
              onClick={(e) => { e.preventDefault(); if (page > 1) onPage(page - 1); }}
              aria-disabled={page === 1}
              className={page === 1 ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
          {Array.from({ length: Math.min(pages, 5) }).map((_, i) => (
            <PaginationItem key={i}>
              <PaginationLink
                href="#"
                isActive={page === i + 1}
                onClick={(e) => { e.preventDefault(); onPage(i + 1); }}
              >
                {i + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          {pages > 5 && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}
          <PaginationItem>
            <PaginationNext
              text="التالي"
              href="#"
              onClick={(e) => { e.preventDefault(); if (page < pages) onPage(page + 1); }}
              aria-disabled={page === pages}
              className={page === pages ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
        </PaginationContent>
      </ShadPagination>
    </div>
  );
}

/* ── Sidebar nav items ────────────────────────────────────────────── */
const navItems = [
  { key: 'applications', label: 'طلبات التوظيف',   icon: 'users',     badge: 24 },
  // { key: 'incoming',     label: 'الطلبات الواردة', icon: 'briefcase' },
  { key: 'jobs',         label: 'الوظائف المتاحة', icon: 'globe' },
  { key: 'dashboard',    label: 'الإحصائيات',      icon: 'chart' },
  { key: 'settings',     label: 'الإعدادات',       icon: 'settings' },
];

/* ── App Sidebar ──────────────────────────────────────────────────── */
interface AppSidebarProps {
  page: string;
  setPage: (p: string) => void;
}
export function AppSidebar({ page, setPage }: AppSidebarProps) {
  const { setOpenMobile } = useSidebar();
  const navigate = (key: string) => { setPage(key); setOpenMobile(false); };

  return (
    <ShadSidebar side="right" collapsible="offcanvas">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <BrandLogo />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {navItems.map((n) => {
                const active = page === n.key;
                return (
                  <SidebarMenuItem key={n.key}>
                    <SidebarMenuButton
                      isActive={active}
                      onClick={() => navigate(n.key)}
                      className="gap-3 text-[16px] h-11"
                    >
                      <Icon
                        name={n.icon}
                        size={17}
                        className={active ? 'text-primary shrink-0' : 'text-muted-foreground shrink-0'}
                      />
                      <span className="flex-1 text-start">{n.label}</span>
                      {n.badge && (
                        <span className={cn(
                          'text-[11px] h-5 min-w-[20px] px-1.5 rounded-full flex items-center justify-center tabular',
                          active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                        )}>
                          {n.badge}
                        </span>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => navigate('careers')} className="text-[15px] h-11">
              <Icon name="globe" size={17} />
              <span className="flex-1 text-start">صفحة الوظائف (للمستخدم)</span>
              <Icon name="chevLeft" size={14} />
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => navigate('apply')} className="text-[15px] h-11">
              <Icon name="send" size={17} />
              <span className="flex-1 text-start">بوابة التقديم العامة</span>
              <Icon name="chevLeft" size={14} />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </ShadSidebar>
  );
}

/* ── App Topbar ───────────────────────────────────────────────────── */
export function AppTopbar() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <header className="h-16 bg-card border-b border-border sticky top-0 z-20 px-4 sm:px-6 flex items-center gap-3">
      <SidebarTrigger className="shrink-0" />
      <div className="w-px h-5 bg-border shrink-0 hidden lg:block" />

      <div className="flex-1 max-w-[440px] hidden sm:block">
        <DInput
          placeholder="ابحث عن متقدم، وظيفة، أو قسم…"
          icon={<Icon name="search" size={14} />}
        />
      </div>
      <div className="flex-1" />

      <div className="flex items-center gap-1 sm:gap-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label="تبديل المظهر"
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          title={isDark ? 'تفعيل المظهر الفاتح' : 'تفعيل المظهر الداكن'}
        >
          <Icon name={isDark ? 'sun' : 'moon'} size={18} />
        </Button>
        <Button variant="ghost" size="icon" aria-label="الإشعارات">
          <div className="relative">
            <Icon name="bell" size={18} />
            <span className="absolute -top-0.5 -end-0.5 w-2 h-2 bg-primary rounded-full ring-2 ring-card" />
          </div>
        </Button>
        <div className="w-px h-5 bg-border shrink-0 hidden sm:block" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="hidden sm:flex items-center gap-3 rounded-md px-2 py-1 hover:bg-accent transition-colors">
              <div className="text-end leading-tight">
                <div className="text-[13px] font-medium">أحمد المدير</div>
                <div className="text-[11px] text-muted-foreground">مدير الموارد البشرية</div>
              </div>
              <UserAvatar name="أحمد" tone="slate" size={32} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="bottom">
            <DropdownMenuItem>الملف الشخصي</DropdownMenuItem>
            <DropdownMenuItem>الإعدادات</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">تسجيل الخروج</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="sm:hidden">
          <UserAvatar name="أ" tone="slate" size={32} />
        </div>
      </div>
    </header>
  );
}
