import { useState, useMemo, useRef, useEffect } from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverPopup, PopoverTrigger } from "@/components/ui/popover"
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  type RowSelectionState,
  type Row,
} from "@tanstack/react-table"
import * as XLSX from "xlsx"
import { useApp } from "@/context/AppContext"
import {
  useRequests,
  useRequestDetail,
  useUpdateRequestStatus,
  useMarkRequestViewed,
} from "@/hooks/useRequests"
import { useJobs } from "@/hooks/useJobs"
import { useOpenCv } from "@/hooks/useOpenCv"
import { useToast } from "@/components/ui/toast"
import { Icon } from "@/components/icons"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { DDialog } from "@/components/ui/ddialog"
import { Btn, Th, Td, PageHeader } from "@/components/shell"
import { DSelect } from "@/components/ui/dselect"
import { cn } from "@/lib/utils"
import type { JobRequest, RequestStatus } from "@/types/api"

/* ── Status metadata ─────────────────────────────────────────────── */
const STATUS_META: Record<
  RequestStatus,
  {
    label: string
    tone:
      | "sky"
      | "amber"
      | "emerald"
      | "violet"
      | "rose"
      | "success"
      | "neutral"
  }
> = {
  new: { label: "جديد", tone: "sky" },
  review: { label: "قيد المراجعة", tone: "amber" },
  shortlisted: { label: "تم الترشيح", tone: "emerald" },
  interview: { label: "موعد مقابلة", tone: "violet" },
  rejected: { label: "مرفوض", tone: "rose" },
  hired: { label: "تم التعيين", tone: "success" },
}

/* ── Indeterminate checkbox ──────────────────────────────────────── */
function IndeterminateCheckbox({
  checked,
  indeterminate,
  onChange,
}: {
  checked?: boolean
  indeterminate?: boolean
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = !!indeterminate && !checked
  }, [indeterminate, checked])
  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="h-4 w-4 cursor-pointer rounded accent-primary"
      onClick={(e) => e.stopPropagation()}
    />
  )
}

/* ── Filter select ───────────────────────────────────────────────── */
function FilterSelect({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  options: string[]
  placeholder: string
}) {
  const selectOptions = [
    { value: "all", label: placeholder },
    ...options.map((o) => ({ value: o, label: o })),
  ]
  return (
    <DSelect
      value={value}
      onChange={(v) => onChange(String(v))}
      options={selectOptions}
      placeholder={placeholder}
    />
  )
}

/* ── Small layout helpers for the dialog ────────────────────────── */
function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="px-6 py-4">
      <h3 className="mb-3 text-[11.5px] font-semibold tracking-wide text-muted-foreground uppercase">
        {title}
      </h3>
      {children}
    </div>
  )
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: string
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon
        name={icon}
        size={14}
        className="mt-0.5 shrink-0 text-muted-foreground"
      />
      <div>
        <div className="text-[11px] text-muted-foreground">{label}</div>
        <div className="text-[13px] font-medium">{value || "—"}</div>
      </div>
    </div>
  )
}

/* ── Request detail dialog ───────────────────────────────────────── */
function RequestDetailDialog({
  id,
  onClose,
}: {
  id: string | null
  onClose: () => void
}) {
  const { data, isLoading } = useRequestDetail(id)
  const { openCv } = useOpenCv()

  return (
    <DDialog open={!!id} onClose={onClose} size="lg">
      {isLoading || !data ? (
        <div className="flex items-center justify-center p-16">
          <svg
            viewBox="0 0 24 24"
            width="24"
            height="24"
            className="animate-spin text-primary"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeDasharray="40 60"
            />
          </svg>
        </div>
      ) : (
        <>
          {/* ── Header ── */}
          <div className="flex items-start justify-between border-b border-border p-5">
            <div className="flex items-center gap-3">
              <Avatar name={data.applicant.name} size={46} />
              <div>
                <h2 className="text-[16px] font-bold">{data.applicant.name}</h2>
                <p className="text-[12.5px] text-muted-foreground">
                  {data.applicant.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone={STATUS_META[data.status].tone as any}>
                {STATUS_META[data.status].label}
              </Badge>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent"
              >
                <Icon name="x" size={16} />
              </button>
            </div>
          </div>

          {/* ── Scrollable body ── */}
          <div className="max-h-[70vh] divide-y divide-border overflow-y-auto">
            {/* Personal info */}
            <Section title="البيانات الشخصية">
              <div className="grid grid-cols-2 gap-4">
                <InfoItem
                  icon="phone"
                  label="الجوال"
                  value={data.applicant.phone}
                />
                <InfoItem
                  icon="user"
                  label="الجنس"
                  value={
                    data.applicant.gender === "male"
                      ? "ذكر"
                      : data.applicant.gender === "female"
                        ? "أنثى"
                        : "—"
                  }
                />
                <InfoItem
                  icon="calendar"
                  label="تاريخ الميلاد"
                  value={data.applicant.dateOfBirth ?? "—"}
                />
                <InfoItem
                  icon="globe"
                  label="الجنسية"
                  value={data.applicant.nationality ?? "—"}
                />
                <InfoItem
                  icon="globe"
                  label="مكان العمل الحالي"
                  value={data.applicant.currentJobLocation ?? "—"}
                />
              </div>
            </Section>

            {/* Application info */}
            <Section title="تفاصيل الطلب">
              <div className="grid grid-cols-2 gap-4">
                <InfoItem
                  icon="briefcase"
                  label="الوظيفة"
                  value={data.jobAd?.adTitle ?? "—"}
                />
                <InfoItem
                  icon="users"
                  label="الشركة"
                  value={data.company.companyName}
                />
                <InfoItem
                  icon="send"
                  label="نوع التقديم"
                  value={data.submissionType === "self" ? "ذاتي" : "يدوي"}
                />
                <InfoItem
                  icon="clock"
                  label="تاريخ التقديم"
                  value={new Date(data.createdAt).toLocaleDateString("ar-SA")}
                />
              </div>
              {data.notes && (
                <div className="mt-3 rounded-md bg-muted/40 px-3 py-2">
                  <p className="mb-1 text-[11px] text-muted-foreground">
                    ملاحظات
                  </p>
                  <p className="text-[13px]">{data.notes}</p>
                </div>
              )}
            </Section>

            {/* Job profile */}
            {(data.department ||
              data.professionalGrade ||
              data.generalSpecialty ||
              data.yearsOfExperience) && (
              <Section title="بيانات الوظيفة المطلوبة">
                <div className="grid grid-cols-2 gap-4">
                  {data.department && (
                    <InfoItem
                      icon="briefcase"
                      label="القطاع"
                      value={data.department.name}
                    />
                  )}
                  {data.professionalGrade && (
                    <InfoItem
                      icon="sparkles"
                      label="الدرجة المهنية"
                      value={data.professionalGrade.name}
                    />
                  )}
                  {data.generalSpecialty && (
                    <InfoItem
                      icon="globe"
                      label="التخصص العام"
                      value={data.generalSpecialty.name}
                    />
                  )}
                  {data.yearsOfExperience && (
                    <InfoItem
                      icon="clock"
                      label="سنوات الخبرة"
                      value={data.yearsOfExperience}
                    />
                  )}
                </div>
                {data.additionalInfo && (
                  <div className="mt-3 rounded-md bg-muted/40 px-3 py-2">
                    <p className="mb-1 text-[11px] text-muted-foreground">
                      معلومات إضافية
                    </p>
                    <p className="text-[13px]">{data.additionalInfo}</p>
                  </div>
                )}
              </Section>
            )}

            {/* CV */}
            {data.cvUrl && (
              <Section title="السيرة الذاتية">
                <button
                  onClick={() => openCv(data.cvUrl!)}
                  className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-[13px] transition-colors hover:bg-accent"
                >
                  <Icon name="pdf" size={15} />
                  <span>فتح السيرة الذاتية</span>
                  <Icon
                    name="chevLeft"
                    size={13}
                    className="text-muted-foreground"
                  />
                </button>
              </Section>
            )}

            {/* Qualifications */}
            <Section title="المؤهلات الأكاديمية">
              {data.qualifications.length === 0 ? (
                <p className="text-[13px] text-muted-foreground">
                  لا توجد مؤهلات مسجلة
                </p>
              ) : (
                <div className="space-y-2">
                  {data.qualifications.map((q) => (
                    <div
                      key={q.id}
                      className="flex items-center gap-3 rounded-lg border border-border px-4 py-3"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[oklch(0.97_0.03_30)] text-primary">
                        <Icon name="sparkles" size={16} />
                      </div>
                      <div>
                        <div className="text-[13.5px] font-medium">
                          {q.typeName ?? "مؤهل أكاديمي"}
                        </div>
                        <div className="text-[12px] text-muted-foreground">
                          {[q.yearObtained, q.instituteName]
                            .filter(Boolean)
                            .join(" · ") || "—"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Section>
          </div>
        </>
      )}
    </DDialog>
  )
}

/* ── Column helper ───────────────────────────────────────────────── */
const col = createColumnHelper<JobRequest>()

function nationalityFlag(nat: string | null): string {
  if (!nat) return ""
  const n = nat.trim()
  if (n.includes("مصر")) return "🇪🇬"
  if (n.includes("سعودي") || n.includes("السعودية")) return "🇸🇦"
  if (n.includes("إمارات") || n.includes("إماراتي")) return "🇦🇪"
  if (n.includes("أردن") || n.includes("أردني")) return "🇯🇴"
  if (n.includes("كويت") || n.includes("كويتي")) return "🇰🇼"
  if (n.includes("يمن") || n.includes("يمني")) return "🇾🇪"
  if (n.includes("عراق") || n.includes("عراقي")) return "🇮🇶"
  if (n.includes("سوريا") || n.includes("سوري")) return "🇸🇾"
  if (n.includes("لبنان") || n.includes("لبناني")) return "🇱🇧"
  if (n.includes("مغرب") || n.includes("مغربي")) return "🇲🇦"
  if (n.includes("تونس") || n.includes("تونسي")) return "🇹🇳"
  if (n.includes("ليبيا") || n.includes("ليبي")) return "🇱🇾"
  if (n.includes("فلسطين") || n.includes("فلسطيني")) return "🇵🇸"
  if (n.includes("باكستان") || n.includes("باكستاني")) return "🇵🇰"
  if (n.includes("الهند") || n.includes("هندي")) return "🇮🇳"
  if (n.includes("سودان") || n.includes("سوداني")) return "🇸🇩"
  return ""
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)
  const weeks = Math.floor(days / 7)
  const months = Math.floor(days / 30)
  if (mins < 1) return "الآن"
  if (mins < 60) return `منذ ${mins} دقيقة`
  if (hours < 24) return `منذ ${hours} ساعة`
  if (days === 1) return "منذ يوم"
  if (days < 7) return `منذ ${days} أيام`
  if (weeks === 1) return "منذ أسبوع"
  if (weeks < 5) return `منذ ${weeks} أسابيع`
  if (months === 1) return "منذ شهر"
  return `منذ ${months} أشهر`
}

/* ── Company banner ──────────────────────────────────────────────── */
function CompanyBanner({
  user,
  stats,
  // activeJobsCount,
}: {
  user: import("@/context/AppContext").AuthUser
  stats: {
    total: number
    byStatus: Record<string, number>
    employmentRate: number
  }
  activeJobsCount: number
}) {
  const memberSince = user.companyCreatedAt
    ? new Date(user.companyCreatedAt).toLocaleDateString("ar-SA", {
        month: "long",
        year: "numeric",
      })
    : null

  const chips = [
    // { label: "معروض حالياً", value: activeJobsCount },
    { label: "معدل التوظيف", value: `${stats.employmentRate}%` },
    { label: "تم توظيفهم", value: stats.byStatus.hired ?? 0 },
    { label: "إجمالي المرشحين", value: stats.total },
  ]

  return (
    <div
      className="relative mb-5 overflow-hidden rounded-2xl"
      style={{
        background:
          "linear-gradient(135deg, #2d2777 0%, #1a1650 50%, #261e6e 100%)",
      }}
    >
      {/* subtle radial glow top-right */}
      <div
        className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full opacity-20"
        style={{
          background: "radial-gradient(circle, #a78bfa, transparent 70%)",
        }}
      />
      {/* subtle radial glow bottom-left */}
      <div
        className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full opacity-10"
        style={{
          background: "radial-gradient(circle, #818cf8, transparent 70%)",
        }}
      />

      <div
        className="relative flex flex-wrap items-center justify-between gap-5 px-7 py-5"
        dir="rtl"
      >
        {/* ── Right: company identity ── */}
        <div className="flex items-center gap-4">
          {/* logo / avatar */}
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-[22px] font-bold text-white"
            style={{
              background: "rgba(255,255,255,0.12)",
              backdropFilter: "blur(6px)",
            }}
          >
            {user.companyLogo ? (
              <img
                src={user.companyLogo}
                alt=""
                className="h-full w-full rounded-xl object-cover"
              />
            ) : (
              (user.companyName ?? user.name).charAt(0)
            )}
          </div>

          {/* text block */}
          <div className="text-right">
            <p className="mb-0.5 text-[11px] font-medium tracking-wide text-white/50">
              مرحباً بك
            </p>
            <h2 className="text-[22px] leading-tight font-extrabold tracking-tight text-white">
              {user.companyName ?? user.name}
            </h2>

            {/* meta row */}
            <div className="mt-2 flex flex-wrap items-center justify-end gap-x-3 gap-y-1">
              {user.companyAddress && (
                <span className="flex items-center gap-1 text-[11.5px] text-white/60">
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {user.companyAddress}
                </span>
              )}
              {memberSince && (
                <span className="flex items-center gap-1 text-[11.5px] text-white/60">
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="5" width="18" height="16" rx="2" />
                    <path d="M3 9h18M8 3v4M16 3v4" />
                  </svg>
                  عضو منذ {memberSince}
                </span>
              )}
              {user.companyPhone && (
                <span className="flex items-center gap-1 text-[11.5px] text-white/60">
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
                  </svg>
                  {user.companyPhone}
                </span>
              )}
              <span className="flex items-center gap-1 text-[11.5px] text-white/60">
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                {user.email}
              </span>
            </div>
          </div>
        </div>

        {/* ── Left: stat chips ── */}
        <div className="flex flex-wrap items-center gap-2">
          {/* unique code — distinct accent chip */}
          {user.uniqueCode && (
            <div
              className="flex flex-col items-center gap-0.5 rounded-xl px-4 py-3 text-center text-white"
              style={{
                background: "rgba(167, 100, 150, 0.45)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <span className="text-[18px] leading-none font-black tracking-widest">
                {user.uniqueCode}
              </span>
              <span className="mt-1 text-[9px] font-medium tracking-wider uppercase opacity-60">
                الكود الفريد
              </span>
            </div>
          )}

          {chips.map((chip) => (
            <div
              key={chip.label}
              className="flex flex-col items-center gap-0.5 rounded-xl px-4 py-3 text-center text-white"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <span className="tabular text-[18px] leading-none font-black">
                {chip.value}
              </span>
              <span className="mt-1 text-[9px] font-medium tracking-wider uppercase opacity-60">
                {chip.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Department stats strip ──────────────────────────────────────── */
const DEPT_PALETTE = [
  {
    bar: "bg-amber-400",
    iconBg: "bg-amber-50  dark:bg-amber-950/40",
    iconColor: "text-amber-500",
  },
  {
    bar: "bg-emerald-400",
    iconBg: "bg-emerald-50 dark:bg-emerald-950/40",
    iconColor: "text-emerald-500",
  },
  {
    bar: "bg-blue-500",
    iconBg: "bg-blue-50   dark:bg-blue-950/40",
    iconColor: "text-blue-500",
  },
  {
    bar: "bg-rose-400",
    iconBg: "bg-rose-50   dark:bg-rose-950/40",
    iconColor: "text-rose-500",
  },
  {
    bar: "bg-violet-400",
    iconBg: "bg-violet-50 dark:bg-violet-950/40",
    iconColor: "text-violet-500",
  },
  {
    bar: "bg-sky-400",
    iconBg: "bg-sky-50    dark:bg-sky-950/40",
    iconColor: "text-sky-500",
  },
]

const DEPT_ICON_MAP: [string, string][] = [
  ["مالية", "briefcase"],
  ["محاسبة", "briefcase"],
  ["تقنية", "globe"],
  ["معلومات", "globe"],
  ["طب", "users"],
  ["صحة", "users"],
  ["تمريض", "sparkles"],
  ["صيدلة", "sparkles"],
  ["إدارة", "settings"],
  ["موارد", "users"],
  ["هندسة", "settings"],
  ["قانون", "briefcase"],
]

function deptIconName(name: string): string {
  for (const [kw, icon] of DEPT_ICON_MAP) {
    if (name.includes(kw)) return icon
  }
  return "chart"
}

function DeptCard({
  name,
  count,
  total,
  idx,
}: {
  name: string
  count: number
  total: number
  idx: number
}) {
  const p = DEPT_PALETTE[idx % DEPT_PALETTE.length]
  const pct = total > 0 ? Math.round((count / total) * 100) : 0

  return (
    <div className="flex min-w-[175px] flex-1 flex-col justify-between rounded-xl border border-border bg-card px-4 py-3.5">
      <div className="mb-3 flex items-start justify-between gap-3">
        {/* icon */}
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            p.iconBg
          )}
        >
          <Icon name={deptIconName(name)} size={20} className={p.iconColor} />
        </div>
        {/* text — rtl */}
        <div className="text-right">
          <p className="text-[12.5px] leading-snug font-medium text-foreground">
            {name}
          </p>
          <p className="tabular mt-0.5 text-[26px] leading-none font-bold">
            {count}
          </p>
        </div>
      </div>
      {/* progress */}
      <div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              p.bar
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-1.5 text-right text-[11px] text-muted-foreground">
          {pct}% من الإجمالي
        </p>
      </div>
    </div>
  )
}

/* ── Stats strip ─────────────────────────────────────────────────── */
function StatCard({
  label,
  value,
  active,
  onClick,
}: {
  label: string
  value: number
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 rounded-xl border px-4 py-3 text-center transition-all",
        onClick && "cursor-pointer hover:shadow-sm",
        active
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-border bg-card hover:bg-accent/40"
      )}
    >
      <span
        className={cn(
          "tabular text-[22px] leading-none font-bold",
          active ? "text-primary" : "text-foreground"
        )}
      >
        {value}
      </span>
      <span className="text-[11.5px] text-muted-foreground">{label}</span>
    </button>
  )
}

/* ── Main page ───────────────────────────────────────────────────── */
export function IncomingPage() {
  const { user } = useApp()
  const isSuperAdmin = user?.role === "super_admin"

  const { data: requests = [], isLoading } = useRequests()
  const { data: jobs = [] } = useJobs()
  const activeJobsCount = jobs.filter((j) => j.isPublished).length
  const toast = useToast()
  const { mutate: changeStatus } = useUpdateRequestStatus(
    () => toast({ title: "تم تغيير الحالة بنجاح", tone: "success" }),
    () => toast({ title: "فشل تغيير الحالة", tone: "error" })
  )

  const { mutate: markViewed } = useMarkRequestViewed()

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [globalFilter, setGlobalFilter] = useState("")
  const [companyFilter, setCompanyFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "all">("all")
  const [sourceFilter, setSourceFilter] = useState<"all" | "self" | "manual">(
    "all"
  )
  const [genderFilter, setGenderFilter] = useState<"all" | "male" | "female">(
    "all"
  )
  const [nationalityFilter, setNationalityFilter] = useState("all")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [gradeFilter, setGradeFilter] = useState("all")
  const [specialtyFilter, setSpecialtyFilter] = useState("all")
  const [experienceFilter, setExperienceFilter] = useState("all")
  const [qualificationFilter, setQualificationFilter] = useState("all")
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [sortField, setSortField] = useState<
    "date" | "name" | "status" | "company"
  >("date")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const { openCv } = useOpenCv()

  const resetFilters = () => {
    setGlobalFilter("")
    setCompanyFilter("all")
    setStatusFilter("all")
    setSourceFilter("all")
    setGenderFilter("all")
    setNationalityFilter("all")
    setDepartmentFilter("all")
    setGradeFilter("all")
    setSpecialtyFilter("all")
    setExperienceFilter("all")
    setQualificationFilter("all")
    setDateRange(undefined)
    setSortField("date")
    setSortDir("desc")
    table.setPageIndex(0)
  }

  /* Department stats */
  const deptStats = useMemo(() => {
    const map = new Map<string, number>()
    for (const r of requests) {
      if (r.department?.name)
        map.set(r.department.name, (map.get(r.department.name) ?? 0) + 1)
    }
    return [...map.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  }, [requests])

  /* Stats computed from all requests */
  const stats = useMemo(() => {
    const total = requests.length
    const byStatus = Object.fromEntries(
      Object.keys(STATUS_META).map((s) => [
        s,
        requests.filter((r) => r.status === s).length,
      ])
    ) as Record<RequestStatus, number>
    const hiredCount = byStatus.hired ?? 0
    const employmentRate =
      total > 0 ? Math.round((hiredCount / total) * 100) : 0
    return { total, byStatus, employmentRate }
  }, [requests])

  /* Dropdown options derived from raw data */
  const uniqueCompanies = useMemo(
    () => [...new Set(requests.map((r) => r.company.companyName))].sort(),
    [requests]
  )
  const uniqueNationalities = useMemo(
    () =>
      [
        ...new Set(
          requests.map((r) => r.applicant.nationality).filter(Boolean)
        ),
      ].sort() as string[],
    [requests]
  )
  const uniqueDepartments = useMemo(
    () =>
      [
        ...new Set(requests.map((r) => r.department?.name).filter(Boolean)),
      ].sort() as string[],
    [requests]
  )
  const uniqueGrades = useMemo(
    () =>
      [
        ...new Set(
          requests.map((r) => r.professionalGrade?.name).filter(Boolean)
        ),
      ].sort() as string[],
    [requests]
  )
  const uniqueSpecialties = useMemo(
    () =>
      [
        ...new Set(
          requests.map((r) => r.generalSpecialty?.name).filter(Boolean)
        ),
      ].sort() as string[],
    [requests]
  )
  const uniqueExperiences = useMemo(
    () =>
      [
        ...new Set(requests.map((r) => r.yearsOfExperience).filter(Boolean)),
      ].sort() as string[],
    [requests]
  )
  const uniqueQualifications = useMemo(
    () =>
      [
        ...new Set(
          requests.flatMap((r) => r.qualifications.map((q) => q.name))
        ),
      ].sort(),
    [requests]
  )

  /* Pre-filter + sort before handing to TanStack Table */
  const preFiltered = useMemo(() => {
    let data = requests
    if (companyFilter !== "all")
      data = data.filter((r) => r.company.companyName === companyFilter)
    if (statusFilter !== "all")
      data = data.filter((r) => r.status === statusFilter)
    if (sourceFilter !== "all")
      data = data.filter((r) => r.submissionType === sourceFilter)
    if (genderFilter !== "all")
      data = data.filter((r) => r.applicant.gender === genderFilter)
    if (nationalityFilter !== "all")
      data = data.filter((r) => r.applicant.nationality === nationalityFilter)
    if (departmentFilter !== "all")
      data = data.filter((r) => r.department?.name === departmentFilter)
    if (gradeFilter !== "all")
      data = data.filter((r) => r.professionalGrade?.name === gradeFilter)
    if (specialtyFilter !== "all")
      data = data.filter((r) => r.generalSpecialty?.name === specialtyFilter)
    if (experienceFilter !== "all")
      data = data.filter((r) => r.yearsOfExperience === experienceFilter)
    if (qualificationFilter !== "all")
      data = data.filter((r) =>
        r.qualifications.some((q) => q.name === qualificationFilter)
      )
    if (dateRange?.from) {
      const from = dateRange.from.getTime()
      const to = dateRange.to
        ? dateRange.to.getTime() + 86399999
        : from + 86399999
      data = data.filter((r) => {
        const t = new Date(r.createdAt).getTime()
        return t >= from && t <= to
      })
    }

    data = [...data].sort((a, b) => {
      let av = ""
      let bv = ""
      if (sortField === "date") {
        av = a.createdAt
        bv = b.createdAt
      } else if (sortField === "name") {
        av = a.applicant.name
        bv = b.applicant.name
      } else if (sortField === "status") {
        av = a.status
        bv = b.status
      } else {
        av = a.company.companyName
        bv = b.company.companyName
      }
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av)
    })
    return data
  }, [
    requests,
    companyFilter,
    statusFilter,
    sourceFilter,
    genderFilter,
    nationalityFilter,
    departmentFilter,
    gradeFilter,
    specialtyFilter,
    experienceFilter,
    qualificationFilter,
    dateRange,
    sortField,
    sortDir,
  ])

  /* Column definitions */
  const columns = useMemo(
    () => [
      /* ── 1. Checkbox ── */
      col.display({
        id: "select",
        header: ({ table }) => (
          <IndeterminateCheckbox
            checked={table.getIsAllPageRowsSelected()}
            indeterminate={table.getIsSomePageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <IndeterminateCheckbox
            checked={row.getIsSelected()}
            indeterminate={row.getIsSomeSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
      }),

      /* ── 2. المرشح ── */
      col.accessor((r) => r.applicant.name, {
        id: "applicant",
        header: "المرشح",
        cell: (info) => {
          const { applicant, isViewedByAdmin } = info.row.original
          const flag = nationalityFlag(applicant.nationality)
          return (
            <div className="flex items-center gap-2.5">
              <div className="relative shrink-0">
                <Avatar name={applicant.name} size={36} />
                {isSuperAdmin && !isViewedByAdmin && (
                  <span className="absolute -end-0.5 -top-0.5 block h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-card" />
                )}
              </div>
              <div>
                <div
                  className={cn(
                    "flex items-center gap-1 text-[13px] leading-snug",
                    isSuperAdmin && !isViewedByAdmin
                      ? "font-semibold"
                      : "font-medium"
                  )}
                >
                  {applicant.name}
                  {flag && <span className="text-[13px]">{flag}</span>}
                </div>
                {applicant.nationality && (
                  <div className="text-[11px] text-muted-foreground">
                    {applicant.nationality}
                  </div>
                )}
              </div>
            </div>
          )
        },
      }),

      /* ── 3. الرقم المرجعي ── */
      col.accessor("referenceNumber", {
        header: "الرقم المرجعي",
        cell: (info) => {
          const v = info.getValue()
          return v ? (
            <span className="tabular rounded bg-muted px-2 py-0.5 text-[12px] font-semibold text-foreground">
              {v}
            </span>
          ) : (
            <span className="text-[12px] text-muted-foreground">—</span>
          )
        },
      }),

      /* ── 4. القطاع / التخصص / الدرجة ── */
      col.display({
        id: "profile",
        header: "القطاع / التخصص / الدرجة",
        cell: ({ row }) => {
          const {
            department,
            professionalGrade,
            generalSpecialty,
            yearsOfExperience,
            qualifications,
          } = row.original
          if (
            !department &&
            !professionalGrade &&
            !generalSpecialty &&
            !yearsOfExperience
          )
            return <span className="text-[12px] text-muted-foreground">—</span>
          return (
            <div className="flex flex-col gap-0.5">
              {department && (
                <span className="text-[13px] leading-snug font-bold">
                  {department.name}
                </span>
              )}
              {(professionalGrade || generalSpecialty) && (
                <span className="text-[11.5px] text-muted-foreground">
                  {[professionalGrade?.name, generalSpecialty?.name]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              )}
              <div className="mt-1 flex flex-wrap gap-1">
                {qualifications[0] && (
                  <span className="inline-flex h-5 items-center rounded-md border border-amber-200 bg-amber-50 px-1.5 text-[10.5px] font-medium text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400">
                    {qualifications[0].name}
                  </span>
                )}
                {yearsOfExperience && (
                  <span className="inline-flex h-5 items-center rounded-md border border-blue-200 bg-blue-50 px-1.5 text-[10.5px] font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-400">
                    {yearsOfExperience}
                  </span>
                )}
              </div>
            </div>
          )
        },
      }),

      /* ── 5. المصدر ── */
      col.accessor("submissionType", {
        header: "المصدر",
        cell: (info) => (
          <Badge tone={info.getValue() === "self" ? "sky" : "amber"}>
            {info.getValue() === "self" ? "ذاتي" : "يدوي"}
          </Badge>
        ),
      }),

      /* ── 6. الحالة ── */
      col.accessor("status", {
        header: "الحالة ↑",
        cell: (info) => {
          const { id, status } = info.row.original
          const statusOptions = (
            Object.entries(STATUS_META) as [RequestStatus, { label: string }][]
          ).map(([key, { label }]) => ({ value: key, label }))
          const triggerColor = {
            new: "border-sky-200     bg-sky-50     text-sky-700",
            review: "border-amber-200   bg-amber-50   text-amber-700",
            shortlisted: "border-emerald-200 bg-emerald-50 text-emerald-700",
            interview: "border-violet-200  bg-violet-50  text-violet-700",
            rejected: "border-rose-200    bg-rose-50    text-rose-700",
            hired: "border-green-200   bg-green-50   text-green-700",
          }[status]
          return (
            <DSelect
              value={status}
              onChange={(v) => changeStatus({ id, status: v as RequestStatus })}
              options={statusOptions}
              className="w-[140px]"
              triggerClassName={triggerColor}
            />
          )
        },
      }),

      /* ── 7. الشركة (super_admin only) ── */
      ...(isSuperAdmin
        ? [
            col.accessor((r) => r.company.companyName, {
              id: "company",
              header: "الشركة",
              cell: (info) => (
                <span className="text-[13px] font-medium">
                  {info.getValue()}
                </span>
              ),
            }),
          ]
        : []),

      /* ── 8. الملاحظات ── */
      col.accessor("notes", {
        header: "الملاحظات",
        cell: (info) => {
          const notes = info.getValue()
          return notes ? (
            <div className="flex max-w-[160px] items-start gap-1.5">
              <Icon
                name="send"
                size={12}
                className="mt-0.5 shrink-0 text-muted-foreground"
              />
              <p className="line-clamp-2 text-[11.5px] leading-snug text-foreground">
                {notes}
              </p>
            </div>
          ) : (
            <span className="text-[12px] text-muted-foreground">—</span>
          )
        },
      }),

      /* ── 9. التاريخ ── */
      col.accessor("createdAt", {
        header: "التاريخ ↑",
        cell: (info) => {
          const v = info.getValue()
          return (
            <div>
              <div className="text-[12.5px] font-medium">
                {new Date(v).toLocaleDateString("ar-SA", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>
              <div className="text-[11px] text-muted-foreground">
                {relativeTime(v)}
              </div>
            </div>
          )
        },
      }),

      /* ── 10. الإجراءات ── */
      col.display({
        id: "actions",
        header: "الإجراءات",
        cell: ({ row }) => {
          const { id, cvUrl } = row.original
          return (
            <div className="flex items-center gap-0.5">
              <Btn
                variant="ghost"
                size="iconSm"
                title="عرض التفاصيل"
                onClick={() => {
                  setSelectedId(id)
                  if (isSuperAdmin && !row.original.isViewedByAdmin)
                    markViewed(id)
                }}
              >
                <Icon name="eye" size={14} />
              </Btn>
              {cvUrl ? (
                <Btn
                  variant="ghost"
                  size="iconSm"
                  title="فتح السيرة الذاتية"
                  onClick={() => openCv(cvUrl)}
                >
                  <Icon name="pdf" size={14} />
                </Btn>
              ) : (
                <Btn
                  variant="ghost"
                  size="iconSm"
                  disabled
                  title="لا توجد سيرة ذاتية"
                >
                  <Icon name="pdf" size={14} className="opacity-25" />
                </Btn>
              )}
              <Btn variant="ghost" size="iconSm" title="طباعة">
                <Icon name="download" size={14} />
              </Btn>
            </div>
          )
        },
      }),
    ],
    [isSuperAdmin, changeStatus, setSelectedId, openCv, markViewed]
  )

  /* TanStack Table instance */
  const table = useReactTable({
    data: preFiltered,
    columns,
    state: { globalFilter, rowSelection },
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: (row, _colId, value) => {
      const s = String(value).toLowerCase()
      const { name, email, phone } = row.original.applicant
      return (
        name.toLowerCase().includes(s) ||
        email.toLowerCase().includes(s) ||
        phone.includes(s)
      )
    },
    initialState: { pagination: { pageSize: 10 } },
    enableRowSelection: true,
  })

  /* Excel export */
  const exportToExcel = () => {
    const rows: Row<JobRequest>[] =
      Object.keys(rowSelection).length > 0
        ? table.getSelectedRowModel().rows
        : table.getFilteredRowModel().rows

    const sheetData = rows.map((row) => {
      const r = row.original
      return {
        الاسم: r.applicant.name,
        "البريد الإلكتروني": r.applicant.email,
        الجوال: r.applicant.phone,
        الجنس:
          r.applicant.gender === "male"
            ? "ذكر"
            : r.applicant.gender === "female"
              ? "أنثى"
              : "",
        الوظيفة: r.jobAd?.adTitle ?? "—",
        الشركة: r.company.companyName,
        الحالة: STATUS_META[r.status].label,
        "نوع التقديم": r.submissionType === "self" ? "ذاتي" : "يدوي",
        "تاريخ التقديم": new Date(r.createdAt).toLocaleDateString("ar-SA"),
        "رابط السيرة الذاتية": r.cvUrl ?? "",
      }
    })

    const ws = XLSX.utils.json_to_sheet(sheetData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "طلبات التوظيف")
    XLSX.writeFile(wb, "job-requests.xlsx")
  }

  const selectedCount = Object.keys(rowSelection).length
  const filteredCount = table.getFilteredRowModel().rows.length
  const { pageIndex, pageSize } = table.getState().pagination
  const pageCount = table.getPageCount()

  const hasActiveFilters =
    globalFilter !== "" ||
    companyFilter !== "all" ||
    sourceFilter !== "all" ||
    genderFilter !== "all" ||
    nationalityFilter !== "all" ||
    departmentFilter !== "all" ||
    gradeFilter !== "all" ||
    specialtyFilter !== "all" ||
    experienceFilter !== "all" ||
    qualificationFilter !== "all" ||
    !!dateRange?.from

  return (
    <div>
      {/* ── Welcome banner ──────────────────────────────────────── */}

      <PageHeader
        icon="users"
        title="إدارة طلبات التوظيف"
        desc={
          isSuperAdmin && requests.filter((r) => !r.isViewedByAdmin).length > 0
            ? `${requests.filter((r) => !r.isViewedByAdmin).length} طلب لم تتم مراجعته بعد`
            : "راجع وصنّف طلبات المتقدمين للوظائف الشاغرة"
        }
      />
      {user && (
        <CompanyBanner
          user={user}
          stats={stats}
          activeJobsCount={activeJobsCount}
        />
      )}

      {/* ── Department stats strip ──────────────────────────────── */}
      {!isLoading && deptStats.length > 0 && (
        <div className="mb-4 flex gap-3 overflow-x-auto pb-1" dir="rtl">
          {deptStats.map((d, i) => (
            <DeptCard
              key={d.name}
              name={d.name}
              count={d.count}
              total={requests.length}
              idx={i}
            />
          ))}
        </div>
      )}

      {/* ── Stats cards ─────────────────────────────────────────── */}
      {!isLoading && requests.length > 0 && (
        <div className="mb-4 grid grid-cols-4 gap-3 md:grid-cols-8">
          <StatCard
            label="الإجمالي"
            value={stats.total}
            active={statusFilter === "all"}
            onClick={() => {
              setStatusFilter("all")
              table.setPageIndex(0)
            }}
          />
          {(
            Object.entries(STATUS_META) as [RequestStatus, { label: string }][]
          ).map(([key, meta]) => (
            <StatCard
              key={key}
              label={meta.label}
              value={stats.byStatus[key] ?? 0}
              active={statusFilter === key}
              onClick={() => {
                setStatusFilter(key)
                table.setPageIndex(0)
              }}
            />
          ))}
          <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card px-4 py-3 text-center">
            <span className="tabular text-[22px] leading-none font-bold text-emerald-600">
              {stats.employmentRate}%
            </span>
            <span className="text-[11.5px] text-muted-foreground">
              معدل التوظيف
            </span>
          </div>
        </div>
      )}

      <Card className="overflow-hidden">
        {/* ── Row 1: Search + primary filters ────────────────────── */}
        <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-3">
          {/* Search */}
          <div className="relative min-w-[220px] flex-1">
            <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Icon name="search" size={14} />
            </span>
            <input
              type="text"
              value={globalFilter}
              onChange={(e) => {
                setGlobalFilter(e.target.value)
                table.setPageIndex(0)
              }}
              placeholder="بحث بالاسم أو البريد أو الجوال…"
              className="h-9 w-full rounded-md border border-input bg-card ps-3 pe-9 text-[13px] text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>

          {/* Source */}
          {/* <DSelect
            value={sourceFilter}
            onChange={(v) => {
              setSourceFilter(v as typeof sourceFilter)
              table.setPageIndex(0)
            }}
            options={[
              { value: "all", label: "كل المصادر" },
              { value: "self", label: "ذاتي" },
              { value: "manual", label: "يدوي" },
            ]}
          /> */}
          <Btn variant="outline" size="sm" onClick={exportToExcel}>
            <Icon name="download" size={13} />
            Excel
          </Btn>
          {/* Unviewed toggle — super_admin only */}
          {isSuperAdmin && (
            <button
              type="button"
              onClick={() => {
                setStatusFilter("all")
                setGlobalFilter("")
                setSourceFilter("all")
                setGenderFilter("all")
                setNationalityFilter("all")
                // setJobFilter("all")
                setCompanyFilter("all")
              }}
              className={cn(
                "flex h-9 items-center gap-2 rounded-md border px-3 text-[13px] transition-colors",
                "border-border bg-card text-foreground hover:bg-accent"
              )}
            >
              <Icon name="bell" size={14} />
              غير مراجَعة
              {requests.filter((r) => !r.isViewedByAdmin).length > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-semibold text-primary-foreground">
                  {requests.filter((r) => !r.isViewedByAdmin).length}
                </span>
              )}
            </button>
          )}

          {/* Reset */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="flex h-9 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-[13px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Icon name="x" size={13} />
              إعادة تعيين
            </button>
          )}

          {/* Result count */}
          <span className="tabular me-auto text-[12.5px] text-muted-foreground">
            {filteredCount} طلب
          </span>
        </div>

        {/* ── Row 2: Sort controls ────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/30 px-5 py-2">
          <span className="flex items-center gap-1.5 text-[12px] font-semibold text-muted-foreground">
            <Icon name="sort" size={13} />
            ترتيب:
          </span>
          {(
            [
              { key: "date", label: "التاريخ" },
              { key: "name", label: "الاسم" },
              { key: "status", label: "الحالة" },
              { key: "company", label: "الشركة" },
            ] as { key: typeof sortField; label: string }[]
          ).map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                if (sortField === key)
                  setSortDir((d) => (d === "asc" ? "desc" : "asc"))
                else {
                  setSortField(key)
                  setSortDir("desc")
                }
              }}
              className={cn(
                "flex h-7 items-center gap-1 rounded-md border px-2.5 text-[12.5px] transition-colors",
                sortField === key
                  ? "border-primary bg-primary/5 font-medium text-primary"
                  : "border-border bg-card text-foreground hover:bg-accent"
              )}
            >
              {label}
              {sortField === key && (
                <Icon
                  name="chevDown"
                  size={11}
                  className={sortDir === "asc" ? "rotate-180" : ""}
                />
              )}
            </button>
          ))}
        </div>

        {/* ── Row 3: Advanced filters ─────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-2.5">
          <span className="flex items-center gap-1.5 text-[12px] font-semibold text-muted-foreground">
            <Icon name="filter" size={13} />
            فرز:
          </span>

          {/* Company — super_admin only */}
          {isSuperAdmin && (
            <FilterSelect
              value={companyFilter}
              onChange={(v) => {
                setCompanyFilter(v)
                table.setPageIndex(0)
              }}
              options={uniqueCompanies}
              placeholder="كل الشركات"
            />
          )}

          {/* Nationality */}
          {uniqueNationalities.length > 0 && (
            <FilterSelect
              value={nationalityFilter}
              onChange={(v) => {
                setNationalityFilter(v)
                table.setPageIndex(0)
              }}
              options={uniqueNationalities}
              placeholder="كل الجنسيات"
            />
          )}

          {/* Status (duplicate of tabs for quick access in toolbar) */}
          <DSelect
            value={statusFilter}
            onChange={(v) => {
              setStatusFilter(v as typeof statusFilter)
              table.setPageIndex(0)
            }}
            options={[
              { value: "all", label: "كل الحالات" },
              ...(
                Object.entries(STATUS_META) as [
                  RequestStatus,
                  { label: string },
                ][]
              ).map(([k, m]) => ({ value: k, label: m.label })),
            ]}
          />

          {/* Source */}
          <DSelect
            value={sourceFilter}
            onChange={(v) => {
              setSourceFilter(v as typeof sourceFilter)
              table.setPageIndex(0)
            }}
            options={[
              { value: "all", label: "كل المصادر" },
              { value: "self", label: "ذاتي" },
              { value: "manual", label: "يدوي" },
            ]}
          />

          <DSelect
            value={genderFilter}
            onChange={(v) => {
              setGenderFilter(v as typeof genderFilter)
              table.setPageIndex(0)
            }}
            options={[
              { value: "all", label: "كل الجنس" },
              { value: "male", label: "ذكر" },
              { value: "female", label: "أنثى" },
            ]}
          />

          {/* Gender */}
          <DSelect
            value={genderFilter}
            onChange={(v) => {
              setGenderFilter(v as typeof genderFilter)
              table.setPageIndex(0)
            }}
            options={[
              { value: "all", label: "كل الجنس" },
              { value: "male", label: "ذكر" },
              { value: "female", label: "أنثى" },
            ]}
          />

          {/* Date range */}
          <Popover>
            <PopoverTrigger
              render={
                <button
                  type="button"
                  className={cn(
                    "flex h-9 items-center gap-2 rounded-md border px-3 text-[13px] transition-colors",
                    dateRange?.from
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border bg-card text-foreground hover:bg-accent"
                  )}
                />
              }
            >
              <CalendarIcon size={14} />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "dd/MM/yyyy")} -{" "}
                    {format(dateRange.to, "dd/MM/yyyy")}
                  </>
                ) : (
                  format(dateRange.from, "dd/MM/yyyy")
                )
              ) : (
                <span className="text-muted-foreground">نطاق التاريخ</span>
              )}
            </PopoverTrigger>
            <PopoverPopup>
              <Calendar
                defaultMonth={dateRange?.from}
                mode="range"
                numberOfMonths={2}
                selected={dateRange}
                onSelect={(range) => {
                  setDateRange(range)
                  table.setPageIndex(0)
                }}
              />
            </PopoverPopup>
          </Popover>

          <div className="me-auto" />
        </div>

        {/* ── Row 4: Profile filters ───────────────────────────────── */}
        {(uniqueDepartments.length > 0 ||
          uniqueGrades.length > 0 ||
          uniqueSpecialties.length > 0 ||
          uniqueExperiences.length > 0 ||
          uniqueQualifications.length > 0) && (
          <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-2.5">
            <span className="flex items-center gap-1.5 text-[12px] font-semibold text-muted-foreground">
              <Icon name="sparkles" size={13} />
              الملف المهني:
            </span>

            {/* Department */}
            {uniqueDepartments.length > 0 && (
              <FilterSelect
                value={departmentFilter}
                onChange={(v) => {
                  setDepartmentFilter(v)
                  table.setPageIndex(0)
                }}
                options={uniqueDepartments}
                placeholder="كل القطاعات"
              />
            )}

            {/* Professional grade */}
            {uniqueGrades.length > 0 && (
              <FilterSelect
                value={gradeFilter}
                onChange={(v) => {
                  setGradeFilter(v)
                  table.setPageIndex(0)
                }}
                options={uniqueGrades}
                placeholder="كل الدرجات المهنية"
              />
            )}

            {/* General specialty */}
            {uniqueSpecialties.length > 0 && (
              <FilterSelect
                value={specialtyFilter}
                onChange={(v) => {
                  setSpecialtyFilter(v)
                  table.setPageIndex(0)
                }}
                options={uniqueSpecialties}
                placeholder="كل التخصصات"
              />
            )}

            {/* Years of experience */}
            {uniqueExperiences.length > 0 && (
              <FilterSelect
                value={experienceFilter}
                onChange={(v) => {
                  setExperienceFilter(v)
                  table.setPageIndex(0)
                }}
                options={uniqueExperiences}
                placeholder="كل مستويات الخبرة"
              />
            )}

            {/* Qualification type */}
            {uniqueQualifications.length > 0 && (
              <FilterSelect
                value={qualificationFilter}
                onChange={(v) => {
                  setQualificationFilter(v)
                  table.setPageIndex(0)
                }}
                options={uniqueQualifications}
                placeholder="كل المؤهلات"
              />
            )}
          </div>
        )}

        {/* ── Row 5: Bulk actions (when selection > 0) ───────────── */}
        {selectedCount > 0 && (
          <div className="flex flex-wrap items-center gap-3 border-b border-border bg-[oklch(0.97_0.03_30)] px-5 py-2.5 dark:bg-[oklch(0.22_0.03_30)]">
            <span className="text-[13px] font-medium text-primary">
              ✓ تم تحديد {selectedCount} {selectedCount === 1 ? "طلب" : "طلبات"}
            </span>
            <div className="me-auto flex items-center gap-2">
              {/* Bulk status change */}
              <select
                defaultValue=""
                onChange={(e) => {
                  if (!e.target.value) return
                  const newStatus = e.target.value as RequestStatus
                  table
                    .getSelectedRowModel()
                    .rows.forEach((row) =>
                      changeStatus({ id: row.original.id, status: newStatus })
                    )
                  setRowSelection({})
                  e.target.value = ""
                }}
                className="h-8 rounded-md border border-input bg-card px-2 text-[12.5px] text-foreground focus:outline-none"
              >
                <option value="">تحديث الحالة…</option>
                {(
                  Object.entries(STATUS_META) as [
                    RequestStatus,
                    { label: string },
                  ][]
                ).map(([k, m]) => (
                  <option key={k} value={k}>
                    {m.label}
                  </option>
                ))}
              </select>
              <Btn variant="outline" size="sm" onClick={exportToExcel}>
                <Icon name="download" size={13} /> تصدير ({selectedCount})
              </Btn>
              <button
                type="button"
                onClick={() => setRowSelection({})}
                className="flex h-8 items-center gap-1 rounded-md border border-border bg-card px-2.5 text-[12.5px] text-muted-foreground hover:bg-accent"
              >
                <Icon name="x" size={12} /> إلغاء التحديد
              </button>
            </div>
          </div>
        )}

        {/* ── Table ──────────────────────────────────────────────── */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((h) => (
                    <Th key={h.id}>
                      {h.isPlaceholder
                        ? null
                        : flexRender(h.column.columnDef.header, h.getContext())}
                    </Th>
                  ))}
                </tr>
              ))}
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="p-16 text-center text-[13px] text-muted-foreground"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="24"
                      height="24"
                      className="mx-auto mb-2 animate-spin text-[var(--primary)]"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeDasharray="40 60"
                      />
                    </svg>
                    جاري التحميل…
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="p-16 text-center text-[13px] text-muted-foreground"
                  >
                    لا توجد طلبات مطابقة
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className={cn(
                      "row",
                      row.getIsSelected() &&
                        "bg-[oklch(0.97_0.03_30)] dark:bg-[oklch(0.25_0.03_30)]"
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <Td key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </Td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Footer: pagination ─────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border px-5 py-3">
          {/* Per-page selector — far right (start in RTL) */}
          <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
            <DSelect
              value={pageSize}
              onChange={(v) => {
                table.setPageSize(Number(v))
                table.setPageIndex(0)
              }}
              options={[5, 10, 20, 50].map((s) => ({
                value: s,
                label: String(s),
              }))}
              className="w-[80px]"
              placement="top"
            />
            <span>صف في الصفحة</span>
          </div>

          {/* Range label + nav buttons */}
          <div className="flex items-center gap-3">
            <span className="tabular text-[12px] text-muted-foreground">
              {filteredCount > 0
                ? `${Math.min(pageIndex * pageSize + 1, filteredCount)}–${Math.min((pageIndex + 1) * pageSize, filteredCount)} من ${filteredCount}`
                : "0 طلب"}
            </span>
            <div className="flex items-center gap-1">
              <Btn
                variant="outline"
                size="sm"
                disabled={!table.getCanPreviousPage()}
                onClick={() => table.previousPage()}
              >
                <Icon name="chevRight" size={13} /> السابق
              </Btn>
              {Array.from({ length: Math.min(pageCount, 5) }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => table.setPageIndex(i)}
                  className={cn(
                    "tabular focus-ring h-8 min-w-8 rounded-md border px-2 text-[13px]",
                    pageIndex === i
                      ? "page-active"
                      : "border-border bg-card hover:bg-accent"
                  )}
                >
                  {i + 1}
                </button>
              ))}
              {pageCount > 5 && (
                <span className="px-1 text-muted-foreground">…</span>
              )}
              <Btn
                variant="outline"
                size="sm"
                disabled={!table.getCanNextPage()}
                onClick={() => table.nextPage()}
              >
                التالي <Icon name="chevLeft" size={13} />
              </Btn>
            </div>
          </div>
        </div>
      </Card>

      <RequestDetailDialog
        id={selectedId}
        onClose={() => setSelectedId(null)}
      />
    </div>
  )
}
