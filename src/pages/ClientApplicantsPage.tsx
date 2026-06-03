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
} from "@tanstack/react-table"
import * as XLSX from "xlsx"
import { useApp } from "@/context/AppContext"
import {
  useClientApplicants,
  useClientApplicantDetail,
  useUpdateClientStatus,
  type ClientApplicant,
  type ClientStatus,
} from "@/hooks/useClientApplicants"
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

/* ── Status metadata ─────────────────────────────────────────────── */
const STATUS_META: Record<
  ClientStatus,
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

const STATUS_TRIGGER_COLOR: Record<ClientStatus, string> = {
  new: "border-sky-200     bg-sky-50     text-sky-700",
  review: "border-amber-200   bg-amber-50   text-amber-700",
  shortlisted: "border-emerald-200 bg-emerald-50 text-emerald-700",
  interview: "border-violet-200  bg-violet-50  text-violet-700",
  rejected: "border-rose-200    bg-rose-50    text-rose-700",
  hired: "border-green-200   bg-green-50   text-green-700",
}

const STATUS_OPTIONS = (
  Object.entries(STATUS_META) as [ClientStatus, { label: string }][]
).map(([value, { label }]) => ({ value, label }))

/* ── Helpers ─────────────────────────────────────────────────────── */
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
  if (n.includes("باكستان") || n.includes("باكستاني")) return "🇵🇰"
  if (n.includes("الهند") || n.includes("هندي")) return "🇮🇳"
  if (n.includes("سودان") || n.includes("سوداني")) return "🇸🇩"
  if (n.includes("فلسطين") || n.includes("فلسطيني")) return "🇵🇸"
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
  return (
    <DSelect
      value={value}
      onChange={(v) => onChange(String(v))}
      options={[
        { value: "all", label: placeholder },
        ...options.map((o) => ({ value: o, label: o })),
      ]}
      placeholder={placeholder}
    />
  )
}

/* ── Info item ───────────────────────────────────────────────────── */
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

/* ── Section wrapper ─────────────────────────────────────────────── */
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

/* ── Stat card ───────────────────────────────────────────────────── */
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

/* ── Company banner ──────────────────────────────────────────────── */
function CompanyBanner({
  stats,
}: {
  stats: { total: number; byStatus: Record<string, number> }
}) {
  const { user } = useApp()
  if (!user) return null

  const memberSince = user.companyCreatedAt
    ? new Date(user.companyCreatedAt).toLocaleDateString("ar-SA", {
        month: "long",
        year: "numeric",
      })
    : null

  const assignedCount = stats.byStatus.review ?? 0

  return (
    <div
      className="relative mb-5 overflow-hidden rounded-2xl"
      style={{
        background:
          "linear-gradient(135deg, #2d2777 0%, #1a1650 50%, #261e6e 100%)",
      }}
    >
      <div
        className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full opacity-20"
        style={{
          background: "radial-gradient(circle, #a78bfa, transparent 70%)",
        }}
      />
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
        <div className="flex items-center gap-4">
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
          <div className="text-right">
            <p className="mb-0.5 text-[11px] font-medium tracking-wide text-white/50">
              مرحباً بك
            </p>
            <h2 className="text-[22px] leading-tight font-extrabold tracking-tight text-white">
              {user.companyName ?? user.name}
            </h2>
            <div className="mt-2 flex flex-wrap items-center justify-end gap-x-3 gap-y-1">
              {user.companyAddress && (
                <span className="flex items-center gap-1 text-[11.5px] text-white/60">
                  <Icon name="globe" size={11} />
                  {user.companyAddress}
                </span>
              )}
              {memberSince && (
                <span className="flex items-center gap-1 text-[11.5px] text-white/60">
                  <Icon name="calendar" size={11} />
                  عضو منذ {memberSince}
                </span>
              )}
              {user.companyPhone && (
                <span className="flex items-center gap-1 text-[11.5px] text-white/60">
                  <Icon name="phone" size={11} />
                  {user.companyPhone}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {[
            { label: "إجمالي المرشحين", value: stats.total },
            { label: "قيد المراجعة", value: assignedCount },
            { label: "تم التعيين", value: stats.byStatus.hired ?? 0 },
          ].map((chip) => (
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

/* ── Detail dialog ───────────────────────────────────────────────── */
function ApplicantDetailDialog({
  id,
  onClose,
  changeStatus,
  isPending,
}: {
  id: string | null
  onClose: () => void
  changeStatus: (args: { id: string; status: ClientStatus }) => void
  isPending: boolean
}) {
  const { data, isLoading } = useClientApplicantDetail(id)
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
          {/* Header */}
          <div className="flex items-start justify-between border-b border-border p-5">
            <div className="flex items-center gap-3">
              <Avatar name={data.name} size={46} />
              <div>
                <h2 className="text-[16px] font-bold">{data.name}</h2>
                <p className="text-[12.5px] text-muted-foreground">
                  {data.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {data.clientStatus && (
                <Badge tone={STATUS_META[data.clientStatus].tone}>
                  {STATUS_META[data.clientStatus].label}
                </Badge>
              )}
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent"
              >
                <Icon name="x" size={16} />
              </button>
            </div>
          </div>

          <div className="max-h-[70vh] divide-y divide-border overflow-y-auto">
            {/* Personal info */}
            <Section title="البيانات الشخصية">
              <div className="grid grid-cols-2 gap-4">
                <InfoItem icon="phone" label="الجوال" value={data.phone} />
                <InfoItem
                  icon="user"
                  label="الجنس"
                  value={
                    data.gender === "male"
                      ? "ذكر"
                      : data.gender === "female"
                        ? "أنثى"
                        : "—"
                  }
                />
                <InfoItem
                  icon="calendar"
                  label="تاريخ الميلاد"
                  value={data.dateOfBirth ?? "—"}
                />
                <InfoItem
                  icon="globe"
                  label="الجنسية"
                  value={data.nationality ?? "—"}
                />
                <InfoItem
                  icon="globe"
                  label="مكان العمل الحالي"
                  value={data.currentJobLocation ?? "—"}
                />
                <InfoItem
                  icon="clock"
                  label="تاريخ التسجيل"
                  value={new Date(data.createdAt).toLocaleDateString("ar-SA")}
                />
              </div>
            </Section>

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

            {/* Status update */}
            <Section title="تحديث الحالة">
              <div className="flex flex-wrap items-center gap-2">
                <DSelect
                  value={data.clientStatus ?? "new"}
                  onChange={(v) =>
                    changeStatus({ id: data.id, status: v as ClientStatus })
                  }
                  options={STATUS_OPTIONS}
                  disabled={isPending}
                  className="w-[180px]"
                  triggerClassName={
                    data.clientStatus
                      ? STATUS_TRIGGER_COLOR[data.clientStatus]
                      : ""
                  }
                />
                <Btn
                  onClick={() =>
                    changeStatus({ id: data.id, status: "shortlisted" })
                  }
                  disabled={isPending}
                >
                  <Icon name="check" size={14} /> ترشيح
                </Btn>
                <Btn
                  variant="outline"
                  onClick={() =>
                    changeStatus({ id: data.id, status: "interview" })
                  }
                  disabled={isPending}
                >
                  <Icon name="calendar" size={14} /> مقابلة
                </Btn>
                <Btn
                  variant="ghost"
                  onClick={() =>
                    changeStatus({ id: data.id, status: "rejected" })
                  }
                  disabled={isPending}
                >
                  <Icon name="x" size={14} className="text-destructive" />
                  <span className="text-destructive">رفض</span>
                </Btn>
              </div>
            </Section>

            {/* Assignment notice */}
            {data.assignedClientCompanyId && (
              <div className="px-6 py-3">
                <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[12.5px] text-amber-700">
                  <Icon name="info" size={13} />
                  هذا المرشح مُعيَّن لشركتك حالياً
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </DDialog>
  )
}

/* ── Column helper ───────────────────────────────────────────────── */
const col = createColumnHelper<ClientApplicant>()

/* ── Main page ───────────────────────────────────────────────────── */
export function ClientApplicantsPage() {
  const toast = useToast()
  // const { openCv } = useOpenCv()

  const { data: applicants = [], isLoading } = useClientApplicants()
  const { mutate: changeStatus, isPending } = useUpdateClientStatus(
    () => toast({ title: "تم تغيير الحالة بنجاح", tone: "success" }),
    () => toast({ title: "فشل تغيير الحالة", tone: "error" })
  )

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [globalFilter, setGlobalFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState<ClientStatus | "all">("all")
  const [genderFilter, setGenderFilter] = useState<"all" | "male" | "female">(
    "all"
  )
  const [nationalityFilter, setNationalityFilter] = useState("all")
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [sortField, setSortField] = useState<"date" | "name" | "status">("date")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  /* Derived options */
  const uniqueNationalities = useMemo(
    () =>
      [
        ...new Set(applicants.map((a) => a.nationality).filter(Boolean)),
      ].sort() as string[],
    [applicants]
  )

  /* Stats */
  const stats = useMemo(() => {
    const total = applicants.length
    const byStatus = Object.fromEntries(
      (Object.keys(STATUS_META) as ClientStatus[]).map((s) => [
        s,
        applicants.filter((a) => a.clientStatus === s).length,
      ])
    ) as Record<ClientStatus, number>
    return { total, byStatus }
  }, [applicants])

  /* Pre-filter + sort */
  const preFiltered = useMemo(() => {
    let data = applicants
    if (statusFilter !== "all")
      data = data.filter((a) => a.clientStatus === statusFilter)
    if (genderFilter !== "all")
      data = data.filter((a) => a.gender === genderFilter)
    if (nationalityFilter !== "all")
      data = data.filter((a) => a.nationality === nationalityFilter)
    if (dateRange?.from) {
      const from = dateRange.from.getTime()
      const to = dateRange.to
        ? dateRange.to.getTime() + 86399999
        : from + 86399999
      data = data.filter((a) => {
        const t = new Date(a.createdAt).getTime()
        return t >= from && t <= to
      })
    }
    data = [...data].sort((a, b) => {
      let av = "",
        bv = ""
      if (sortField === "date") {
        av = a.createdAt
        bv = b.createdAt
      } else if (sortField === "name") {
        av = a.name
        bv = b.name
      } else {
        av = a.clientStatus ?? ""
        bv = b.clientStatus ?? ""
      }
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av)
    })
    return data
  }, [
    applicants,
    statusFilter,
    genderFilter,
    nationalityFilter,
    dateRange,
    sortField,
    sortDir,
  ])

  const resetFilters = () => {
    setGlobalFilter("")
    setStatusFilter("all")
    setGenderFilter("all")
    setNationalityFilter("all")
    setDateRange(undefined)
    setSortField("date")
    setSortDir("desc")
    table.setPageIndex(0)
  }

  /* Columns */
  const columns = useMemo(
    () => [
      /* Checkbox */
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

      /* Applicant */
      col.accessor("name", {
        header: "المرشح",
        cell: (info) => {
          const { name, nationality } = info.row.original
          const flag = nationalityFlag(nationality)
          return (
            <div className="flex items-center gap-2.5">
              <Avatar name={name} size={36} />
              <div>
                <div className="flex items-center gap-1 text-[13px] leading-snug font-medium">
                  {name}
                  {flag && <span className="text-[13px]">{flag}</span>}
                </div>
                {nationality && (
                  <div className="text-[11px] text-muted-foreground">
                    {nationality}
                  </div>
                )}
              </div>
            </div>
          )
        },
      }),

      /* Email */
      col.accessor("email", {
        header: "البريد الإلكتروني",
        cell: (info) => (
          <span className="text-[12.5px] text-muted-foreground">
            {info.getValue()}
          </span>
        ),
      }),

      /* Phone */
      col.accessor("phone", {
        header: "الجوال",
        cell: (info) => (
          <span className="tabular text-[13px]">{info.getValue()}</span>
        ),
      }),

      /* Gender */
      col.accessor("gender", {
        header: "الجنس",
        cell: (info) => {
          const g = info.getValue()
          return g ? (
            <Badge tone={g === "male" ? "sky" : "rose"}>
              {g === "male" ? "ذكر" : "أنثى"}
            </Badge>
          ) : (
            <span className="text-[12px] text-muted-foreground">—</span>
          )
        },
      }),

      /* Location */
      col.accessor("currentJobLocation", {
        header: "مكان العمل",
        cell: (info) => (
          <span className="text-[13px]">{info.getValue() ?? "—"}</span>
        ),
      }),

      /* Status */
      col.accessor("clientStatus", {
        header: "الحالة",
        cell: (info) => {
          const { id, clientStatus } = info.row.original
          const triggerColor = clientStatus
            ? STATUS_TRIGGER_COLOR[clientStatus]
            : ""
          return (
            <DSelect
              value={clientStatus ?? "new"}
              onChange={(v) => changeStatus({ id, status: v as ClientStatus })}
              options={STATUS_OPTIONS}
              className="w-[140px]"
              triggerClassName={triggerColor}
            />
          )
        },
      }),

      /* Date */
      col.accessor("createdAt", {
        header: "تاريخ التسجيل",
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

      /* Actions */
      col.display({
        id: "actions",
        header: "الإجراءات",
        cell: ({ row }) => (
          <div className="flex items-center gap-0.5">
            <Btn
              variant="ghost"
              size="iconSm"
              title="عرض التفاصيل"
              onClick={() => setSelectedId(row.original.id)}
            >
              <Icon name="eye" size={14} />
            </Btn>
          </div>
        ),
      }),
    ],
    [changeStatus]
  )

  /* Table instance */
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
      const { name, email, phone } = row.original
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
    const rows =
      Object.keys(rowSelection).length > 0
        ? table.getSelectedRowModel().rows
        : table.getFilteredRowModel().rows
    const sheetData = rows.map(({ original: a }) => ({
      الاسم: a.name,
      "البريد الإلكتروني": a.email,
      الجوال: a.phone,
      الجنس: a.gender === "male" ? "ذكر" : a.gender === "female" ? "أنثى" : "",
      الجنسية: a.nationality ?? "",
      "مكان العمل": a.currentJobLocation ?? "",
      الحالة: a.clientStatus ? STATUS_META[a.clientStatus].label : "—",
      "تاريخ التسجيل": new Date(a.createdAt).toLocaleDateString("ar-SA"),
    }))
    const ws = XLSX.utils.json_to_sheet(sheetData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "المرشحون")
    XLSX.writeFile(wb, "client-applicants.xlsx")
  }

  const selectedCount = Object.keys(rowSelection).length
  const filteredCount = table.getFilteredRowModel().rows.length
  const { pageIndex, pageSize } = table.getState().pagination
  const pageCount = table.getPageCount()
  const hasActiveFilters =
    globalFilter !== "" ||
    statusFilter !== "all" ||
    genderFilter !== "all" ||
    nationalityFilter !== "all" ||
    !!dateRange?.from

  return (
    <div>
      <PageHeader
        icon="users"
        title="قاعدة المرشحين"
        desc="تصفح جميع المرشحين في النظام وتتبع حالة كل مرشح"
      />

      <CompanyBanner stats={stats} />

      {/* Stat cards */}
      {!isLoading && applicants.length > 0 && (
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
            Object.entries(STATUS_META) as [ClientStatus, { label: string }][]
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
        </div>
      )}

      <Card className="overflow-hidden">
        {/* Row 1: Search + export + reset + count */}
        <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-3">
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
          <Btn variant="outline" size="sm" onClick={exportToExcel}>
            <Icon name="download" size={13} /> Excel
          </Btn>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="flex h-9 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-[13px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Icon name="x" size={13} /> إعادة تعيين
            </button>
          )}
          <span className="tabular me-auto text-[12.5px] text-muted-foreground">
            {filteredCount} مرشح
          </span>
        </div>

        {/* Row 2: Sort */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/30 px-5 py-2">
          <span className="flex items-center gap-1.5 text-[12px] font-semibold text-muted-foreground">
            <Icon name="sort" size={13} /> ترتيب:
          </span>
          {(
            [
              { key: "date", label: "التاريخ" },
              { key: "name", label: "الاسم" },
              { key: "status", label: "الحالة" },
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

        {/* Row 3: Filters */}
        <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-2.5">
          <span className="flex items-center gap-1.5 text-[12px] font-semibold text-muted-foreground">
            <Icon name="filter" size={13} /> فرز:
          </span>
          <DSelect
            value={statusFilter}
            onChange={(v) => {
              setStatusFilter(v as typeof statusFilter)
              table.setPageIndex(0)
            }}
            options={[{ value: "all", label: "كل الحالات" }, ...STATUS_OPTIONS]}
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
        </div>

        {/* Bulk actions */}
        {selectedCount > 0 && (
          <div className="flex flex-wrap items-center gap-3 border-b border-border bg-[oklch(0.97_0.03_30)] px-5 py-2.5 dark:bg-[oklch(0.22_0.03_30)]">
            <span className="text-[13px] font-medium text-primary">
              ✓ تم تحديد {selectedCount}{" "}
              {selectedCount === 1 ? "مرشح" : "مرشحين"}
            </span>
            <div className="me-auto flex items-center gap-2">
              <select
                defaultValue=""
                onChange={(e) => {
                  if (!e.target.value) return
                  const s = e.target.value as ClientStatus
                  table
                    .getSelectedRowModel()
                    .rows.forEach((row) =>
                      changeStatus({ id: row.original.id, status: s })
                    )
                  setRowSelection({})
                  e.target.value = ""
                }}
                className="h-8 rounded-md border border-input bg-card px-2 text-[12.5px] text-foreground focus:outline-none"
              >
                <option value="">تحديث الحالة…</option>
                {STATUS_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
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

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
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
                      className="mx-auto mb-2 animate-spin text-primary"
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
                    لا توجد نتائج مطابقة
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

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border px-5 py-3">
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
          <div className="flex items-center gap-3">
            <span className="tabular text-[12px] text-muted-foreground">
              {filteredCount > 0
                ? `${Math.min(pageIndex * pageSize + 1, filteredCount)}–${Math.min((pageIndex + 1) * pageSize, filteredCount)} من ${filteredCount}`
                : "0 مرشح"}
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

      <ApplicantDetailDialog
        id={selectedId}
        onClose={() => setSelectedId(null)}
        changeStatus={changeStatus}
        isPending={isPending}
      />
    </div>
  )
}
