import { useNavigate } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"
import { cn } from "@/lib/utils"
import { Icon } from "@/components/icons"
import { Avatar } from "@/components/ui/avatar"
import { useTheme } from "@/components/theme-provider"
import { useApp } from "@/context/AppContext"
import { REQUESTS_QUERY_KEY } from "@/hooks/useRequests"
import { requestsService } from "@/services/requests.service"

type Page = string

/* ── Brand logo ───────────────────────────────────────────────────── */
export function BrandLogo({
  size = 38,
  companyName,
}: {
  size?: number
  companyName?: string | null
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div style={{ width: size, height: size }}>
        <svg viewBox="0 0 40 40" width={size} height={size}>
          <defs>
            <linearGradient id="lg-brand" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="oklch(0.68 0.19 30)" />
              <stop offset="1" stopColor="oklch(0.55 0.18 20)" />
            </linearGradient>
          </defs>
          <rect
            x="2"
            y="2"
            width="36"
            height="36"
            rx="9"
            fill="url(#lg-brand)"
          />
          <path
            d="M12 14 L12 26 L20 26 A6 6 0 0 0 20 14 Z"
            fill="#fff"
            opacity="0.96"
          />
          <circle cx="27" cy="20" r="2.6" fill="#fff" opacity="0.9" />
        </svg>
      </div>
      <div className="leading-tight">
        <div className="text-[16px] font-bold tracking-tight text-[var(--foreground)]">
          {companyName ?? "ضم"}
        </div>
        <div className="-mt-0.5 text-[11.5px] text-muted-foreground">
          نظام التوظيف
        </div>
      </div>
    </div>
  )
}

/* ── Table helpers ────────────────────────────────────────────────── */
export function Th({
  children,
  className = "",
}: {
  children?: React.ReactNode
  className?: string
}) {
  return (
    <th
      className={cn(
        "bg-[var(--muted)]/40 px-4 py-3 text-start text-[12px] font-medium text-[var(--muted-foreground)]",
        className
      )}
    >
      {children}
    </th>
  )
}

export function Td({
  children,
  className = "",
  colSpan,
}: {
  children?: React.ReactNode
  className?: string
  colSpan?: number
}) {
  return (
    <td
      colSpan={colSpan}
      className={cn(
        "border-t border-[var(--border)] px-4 py-3 text-[13.5px] text-[var(--foreground)]",
        className
      )}
    >
      {children}
    </td>
  )
}

/* ── Page header ──────────────────────────────────────────────────── */
interface PageHeaderProps {
  icon?: string
  title: string
  desc?: string
  actions?: React.ReactNode
}

export function PageHeader({ icon, title, desc, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div className="flex items-start gap-3">
        {icon && (
          <div className="tone-rose flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
            <Icon name={icon} size={18} />
          </div>
        )}
        <div>
          <h1 className="text-[20px] font-bold tracking-tight text-[var(--foreground)] sm:text-[22px]">
            {title}
          </h1>
          {desc && (
            <p className="mt-1 text-[13px] text-[var(--muted-foreground)] sm:text-[13.5px]">
              {desc}
            </p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      )}
    </div>
  )
}

/* ── Button ───────────────────────────────────────────────────────── */
type ButtonVariant =
  | "default"
  | "outline"
  | "ghost"
  | "subtle"
  | "destructive"
  | "link"
type ButtonSize = "sm" | "md" | "lg" | "icon" | "iconSm"

const btnVariants: Record<ButtonVariant, string> = {
  default: "bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]",
  outline:
    "border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--accent)] text-[var(--foreground)]",
  ghost: "hover:bg-[var(--accent)] text-[var(--foreground)]",
  subtle:
    "bg-[var(--secondary)] hover:bg-[var(--border)] text-[var(--secondary-foreground)]",
  destructive: "bg-[var(--destructive)] text-white hover:opacity-90",
  link: "text-[var(--primary)] underline-offset-4 hover:underline",
}

const btnSizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-[13px]",
  md: "h-9 px-4 text-[13.5px]",
  lg: "h-10 px-5 text-sm",
  icon: "h-9 w-9",
  iconSm: "h-8 w-8",
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

export function Btn({
  variant = "default",
  size = "md",
  className = "",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cn(
        "focus-ring inline-flex items-center justify-center gap-2 rounded-md font-medium whitespace-nowrap transition-colors disabled:pointer-events-none disabled:opacity-50",
        btnVariants[variant],
        btnSizes[size],
        className
      )}
      {...rest}
    >
      {children}
    </button>
  )
}

/* ── Input ────────────────────────────────────────────────────────── */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode
}

export function DInput({ icon, className = "", ...rest }: InputProps) {
  return (
    <div className="relative">
      {icon && (
        <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3 text-[var(--muted-foreground)]">
          {icon}
        </span>
      )}
      <input
        className={cn(
          "h-10 w-full rounded-md border border-[var(--input)] bg-[var(--card)] text-[13.5px] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]",
          "focus-ring px-3 transition-shadow",
          icon ? "ps-9" : "",
          className
        )}
        {...rest}
      />
    </div>
  )
}

/* ── Textarea ─────────────────────────────────────────────────────── */
export function DTextarea({
  className = "",
  ...rest
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "focus-ring min-h-[120px] w-full resize-y rounded-md border border-[var(--input)] bg-[var(--card)] p-3 text-[13.5px] placeholder:text-[var(--muted-foreground)]",
        className
      )}
      {...rest}
    />
  )
}

/* ── Label ────────────────────────────────────────────────────────── */
interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
}

export function DLabel({
  children,
  className = "",
  required,
  ...rest
}: LabelProps) {
  return (
    <label
      className={cn(
        "flex items-center gap-1 text-[13px] font-medium text-[var(--foreground)]",
        className
      )}
      {...rest}
    >
      {children}
      {required && <span className="text-[var(--primary)]">*</span>}
    </label>
  )
}

/* ── Sidebar ──────────────────────────────────────────────────────── */
const allNavItems = [
  // { key: "applications", label: "طلبات التوظيف", icon: "users", badge: 24 },
  { key: "incoming", label: "طلبات التوظيف", icon: "briefcase", superAdminOnly: false },
  { key: "jobs", label: "الوظائف المتاحة", icon: "globe", superAdminOnly: true },
  { key: "dashboard", label: "الإحصائيات", icon: "chart", superAdminOnly: true },
  { key: "settings", label: "الإعدادات", icon: "settings", superAdminOnly: false },
]

interface SidebarProps {
  page: Page
  onCloseMobile: () => void
  isOpen?: boolean
}

export function Sidebar({ page, onCloseMobile, isOpen = false }: SidebarProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useApp()

  const go = (path: string) => {
    navigate(path)
    onCloseMobile()
  }

  const prefetchMap: Record<string, () => void> = {
    incoming: () =>
      queryClient.prefetchQuery({
        queryKey: REQUESTS_QUERY_KEY,
        queryFn: requestsService.list,
        staleTime: 30_000,
      }),
  }

  return (
    <aside
      className={cn(
        "z-30 flex h-screen w-[240px] flex-col border-l border-[var(--border)] bg-[var(--card)]",
        "fixed top-0 right-0 transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "translate-x-full",
        "lg:sticky lg:top-0 lg:shrink-0 lg:translate-x-0"
      )}
    >
      <div className="border-b border-[var(--border)] p-5">
        <BrandLogo companyName={user?.companyName} />
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {allNavItems.filter((n) => !n.superAdminOnly || user?.role === "super_admin").map((n) => {
          const active = page === n.key
          return (
            <button
              key={n.key}
              onClick={() => go(`/${n.key}`)}
              onMouseEnter={() => prefetchMap[n.key]?.()}
              className={cn(
                "focus-ring flex h-10 w-full items-center gap-3 rounded-md px-3 text-[13.5px] transition-colors",
                active
                  ? "bg-[oklch(0.97_0.03_30)] font-medium text-[var(--primary)]"
                  : "text-[var(--foreground)] hover:bg-[var(--accent)]"
              )}
            >
              <Icon
                name={n.icon}
                size={17}
                className={
                  active
                    ? "text-[var(--primary)]"
                    : "text-[var(--muted-foreground)]"
                }
              />
              <span className="flex-1 text-start">{n.label}</span>
              {/* {n.badge && (
                <span
                  className={cn(
                    "flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px]",
                    active
                      ? "bg-[var(--primary)] text-white"
                      : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                  )}
                >
                  {n.badge}
                </span>
              )} */}
            </button>
          )
        })}
      </nav>
      {/* <div className="space-y-1 border-t border-[var(--border)] p-3">
        <button
          onClick={() => go("/careers")}
          className="focus-ring flex h-10 w-full items-center gap-3 rounded-md px-3 text-[13.5px] text-[var(--muted-foreground)] hover:bg-[var(--accent)]"
        >
          <Icon name="globe" size={17} />
          <span className="flex-1 text-start">صفحة الوظائف (للمستخدم)</span>
          <Icon name="chevLeft" size={14} />
        </button>
        <button
          onClick={() => go("/apply")}
          className="focus-ring flex h-10 w-full items-center gap-3 rounded-md px-3 text-[13.5px] text-[var(--muted-foreground)] hover:bg-[var(--accent)]"
        >
          <Icon name="send" size={17} />
          <span className="flex-1 text-start">بوابة التقديم العامة</span>
          <Icon name="chevLeft" size={14} />
        </button>
      </div> */}
    </aside>
  )
}

/* ── Topbar ───────────────────────────────────────────────────────── */
interface TopbarProps {
  onMenuClick?: () => void
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { theme, setTheme } = useTheme()
  const { user, logout } = useApp()
  const navigate = useNavigate()
  const isDark = theme === "dark"

  const toggleTheme = () => setTheme(isDark ? "light" : "dark")
  const handleLogout = async () => {
    await logout()
    navigate("/login", { replace: true })
  }

  const initials = user?.name?.trim().slice(0, 1) ?? "؟"
  const roleLabel =
    user?.role === "super_admin" ? "مشرف النظام" : "مستخدم الشركة"

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-[var(--border)] bg-[var(--card)] px-4 sm:px-6">
      <Btn
        variant="ghost"
        size="icon"
        className="shrink-0 lg:hidden"
        aria-label="فتح القائمة"
        onClick={onMenuClick}
      >
        <Icon name="menu" size={20} />
      </Btn>

      <div className="hidden max-w-[440px] flex-1 sm:block">
        <DInput
          placeholder="ابحث عن متقدم، وظيفة، أو قسم…"
          icon={<Icon name="search" size={14} />}
        />
      </div>
      <div className="flex-1" />

      <div className="flex items-center gap-1 sm:gap-2">
        <Btn
          variant="ghost"
          size="icon"
          aria-label="تبديل المظهر"
          onClick={toggleTheme}
          title={isDark ? "تفعيل المظهر الفاتح" : "تفعيل المظهر الداكن"}
        >
          <Icon name={isDark ? "sun" : "moon"} size={18} />
        </Btn>
        <Btn variant="ghost" size="icon" aria-label="الإشعارات">
          <div className="relative">
            <Icon name="bell" size={18} />
            <span className="absolute -end-0.5 -top-0.5 h-2 w-2 rounded-full bg-[var(--primary)] ring-2 ring-[var(--card)]" />
          </div>
        </Btn>
        <div className="hidden h-6 w-px bg-[var(--border)] sm:block" />
        <div className="hidden items-center gap-3 pe-1 sm:flex">
          <div className="text-end leading-tight">
            <div className="text-[13px] font-medium">{user?.name ?? "—"}</div>
            <div className="text-[11px] text-[var(--muted-foreground)]">
              {roleLabel}
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="تسجيل الخروج"
            className="focus-ring rounded-full"
          >
            <Avatar name={initials} tone="slate" size={32} />
          </button>
        </div>
        <div className="sm:hidden">
          <button
            onClick={handleLogout}
            title="تسجيل الخروج"
            className="focus-ring rounded-full"
          >
            <Avatar name={initials} tone="slate" size={32} />
          </button>
        </div>
      </div>
    </header>
  )
}

/* ── Attachment icon ──────────────────────────────────────────────── */
export function AttachIcon({ type }: { type: "pdf" | "image" | "link" }) {
  return (
    <span
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-md",
        type === "pdf"
          ? "tone-rose"
          : type === "image"
            ? "tone-amber"
            : "tone-sky"
      )}
    >
      <Icon
        name={type === "pdf" ? "pdf" : type === "image" ? "image" : "link"}
        size={14}
      />
    </span>
  )
}

/* ── Pagination ───────────────────────────────────────────────────── */
interface PaginationProps {
  page: number
  pages: number
  total: number
  perPage: number
  onPage: (p: number) => void
}

export function Pagination({
  page,
  pages,
  total,
  perPage,
  onPage,
}: PaginationProps) {
  return (
    <div className="flex items-center justify-between border-t border-[var(--border)] p-4">
      <div className="tabular text-[12px] text-[var(--muted-foreground)]">
        عرض{" "}
        <span className="font-medium text-[var(--foreground)]">
          {Math.min((page - 1) * perPage + 1, total)}
        </span>{" "}
        إلى{" "}
        <span className="font-medium text-[var(--foreground)]">
          {Math.min(page * perPage, total)}
        </span>{" "}
        من أصل {total} طلب
      </div>
      <div className="flex items-center gap-1">
        <Btn
          variant="outline"
          size="sm"
          disabled={page === 1}
          onClick={() => onPage(Math.max(1, page - 1))}
        >
          <Icon name="chevRight" size={13} /> السابق
        </Btn>
        {Array.from({ length: Math.min(pages, 5) }).map((_, i) => (
          <button
            key={i}
            onClick={() => onPage(i + 1)}
            className={cn(
              "tabular focus-ring h-8 min-w-8 rounded-md border px-2 text-[13px]",
              page === i + 1
                ? "page-active"
                : "border-[var(--border)] bg-[var(--card)] hover:bg-[var(--accent)]"
            )}
          >
            {i + 1}
          </button>
        ))}
        {pages > 5 && (
          <span className="px-2 text-[var(--muted-foreground)]">…</span>
        )}
        <Btn
          variant="outline"
          size="sm"
          disabled={page === pages}
          onClick={() => onPage(Math.min(pages, page + 1))}
        >
          التالي <Icon name="chevLeft" size={13} />
        </Btn>
      </div>
    </div>
  )
}
