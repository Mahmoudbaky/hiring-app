import { useState } from "react"
import { cn } from "@/lib/utils"
import { Icon } from "@/components/icons"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDesc,
  CardBody,
} from "@/components/ui/card"
import { Btn, PageHeader, Th, Td, DInput } from "@/components/shell"
import { DSelect } from "@/components/ui/dselect"
import { STATUS_META } from "@/data"
import { useDashboard } from "@/hooks/useDashboard"
import type { DashboardChartEntry, DashboardDepartment, DashboardRecentRequest } from "@/types/api"

/* ── Stat card ────────────────────────────────────────────────────── */
function StatCard({
  tone,
  icon,
  label,
  value,
  sub,
  trend,
}: {
  tone: string
  icon: string
  label: string
  value: string | number
  sub?: string
  trend?: string | null
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-lg",
            tone
          )}
        >
          <Icon name={icon} size={20} />
        </div>
        {trend != null && (
          <div className={cn(
            "flex items-center gap-1 text-[12px] font-medium",
            Number(trend) >= 0
              ? "text-[oklch(0.5_0.13_155)]"
              : "text-[oklch(0.5_0.18_25)]"
          )}>
            <Icon name={Number(trend) >= 0 ? "trendUp" : "trendUp"} size={13} />
            <span>{Number(trend) >= 0 ? "+" : ""}{trend}%</span>
          </div>
        )}
      </div>
      <div className="mt-4">
        <div className="text-[13px] text-[var(--muted-foreground)]">{label}</div>
        <div className="tabular mt-0.5 text-[28px] font-bold tracking-tight">
          {typeof value === "number" ? value.toLocaleString("ar-SA") : value}
        </div>
        {sub && (
          <div className="mt-0.5 text-[12px] text-[var(--muted-foreground)]">{sub}</div>
        )}
      </div>
    </Card>
  )
}

/* ── Bar chart ────────────────────────────────────────────────────── */
function BarChart({ data }: { data: DashboardChartEntry[] }) {
  if (!data.length) {
    return (
      <div className="flex h-48 items-center justify-center text-[13px] text-[var(--muted-foreground)]">
        لا توجد بيانات في هذه الفترة
      </div>
    )
  }

  const max = Math.max(...data.map((d) => d.new + d.shortlisted + d.rejected), 1)

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.getDate().toString()
  }

  const monthLabel = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString("ar-SA", { month: "long" })
  }

  return (
    <div>
      <div className="flex h-48 items-end gap-2" dir="ltr">
        {data.map((d, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-40 w-full items-end justify-center gap-0.5">
              <div
                className="w-3 rounded-t-sm bg-[oklch(0.85_0.08_230)]"
                style={{ height: `${(d.rejected / max) * 100}%` }}
              />
              <div
                className="w-3 rounded-t-sm bg-[oklch(0.78_0.1_155)]"
                style={{ height: `${(d.shortlisted / max) * 100}%` }}
              />
              <div
                className="w-3 rounded-t-sm bg-[var(--primary)]"
                style={{ height: `${(d.new / max) * 100}%` }}
              />
            </div>
            <div className="tabular text-[11px] text-[var(--muted-foreground)]">
              {formatDate(d.date)}
            </div>
          </div>
        ))}
      </div>
      {data[0] && (
        <div className="mb-2 text-center text-[11px] text-[var(--muted-foreground)]">
          {monthLabel(data[0].date)}
        </div>
      )}
      <div className="mt-2 flex items-center gap-5 text-[12px] text-[var(--muted-foreground)]">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-[var(--primary)]" />
          طلبات جديدة
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-[oklch(0.78_0.1_155)]" />
          تم الترشيح
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-[oklch(0.85_0.08_230)]" />
          مرفوضة
        </span>
      </div>
    </div>
  )
}

/* ── Top departments ──────────────────────────────────────────────── */
function TopDepartments({ data }: { data: DashboardDepartment[] }) {
  if (!data.length) {
    return (
      <div className="py-6 text-center text-[13px] text-[var(--muted-foreground)]">
        لا توجد بيانات
      </div>
    )
  }

  const max = Math.max(...data.map((d) => d.count), 1)

  return (
    <div className="space-y-3">
      {data.map((d, i) => (
        <div key={d.departmentId}>
          <div className="mb-1 flex items-center justify-between text-[12.5px]">
            <span>{d.name}</span>
            <span className="tabular text-[var(--muted-foreground)]">{d.count}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[var(--muted)]">
            <div
              className="h-full rounded-full bg-[var(--primary)]"
              style={{
                width: `${(d.count / max) * 100}%`,
                opacity: 0.7 + (i === 0 ? 0.3 : 0),
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Recent requests table ────────────────────────────────────────── */
function RecentRequests({
  data,
  q,
}: {
  data: DashboardRecentRequest[]
  q: string
}) {
  const filtered = data.filter(
    (r) =>
      !q ||
      r.applicant.name.includes(q) ||
      r.applicant.email.includes(q) ||
      r.jobAd?.adTitle.includes(q)
  )

  if (!filtered.length) {
    return (
      <div className="py-8 text-center text-[13px] text-[var(--muted-foreground)]">
        لا توجد طلبات
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[580px]">
        <thead>
          <tr>
            <Th>المتقدم</Th>
            <Th>الوظيفة</Th>
            <Th>الرقم المرجعي</Th>
            <Th>الحالة</Th>
            <Th>الإجراءات</Th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((r) => (
            <tr key={r.id} className="row">
              <Td>
                <div className="flex items-center gap-3">
                  <Avatar name={r.applicant.name} />
                  <div>
                    <div className="font-medium">{r.applicant.name}</div>
                    <div className="text-[12px] text-[var(--muted-foreground)]">
                      {r.applicant.email}
                    </div>
                  </div>
                </div>
              </Td>
              <Td>{r.jobAd?.adTitle ?? "—"}</Td>
              <Td>
                <span className="tabular text-[12.5px] text-[var(--muted-foreground)]">
                  {r.referenceNumber ?? "—"}
                </span>
              </Td>
              <Td>
                <Badge tone={STATUS_META[r.status]?.tone as any}>
                  {STATUS_META[r.status]?.label ?? r.status}
                </Badge>
              </Td>
              <Td>
                <div className="flex items-center gap-1">
                  <Btn variant="ghost" size="iconSm">
                    <Icon name="eye" size={15} />
                  </Btn>
                  <Btn variant="ghost" size="iconSm">
                    <Icon
                      name="check"
                      size={15}
                      className="text-[oklch(0.5_0.13_155)]"
                    />
                  </Btn>
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ── Skeleton loader ──────────────────────────────────────────────── */
function StatSkeleton() {
  return (
    <Card className="p-5">
      <div className="h-11 w-11 animate-pulse rounded-lg bg-[var(--muted)]" />
      <div className="mt-4 space-y-2">
        <div className="h-3 w-24 animate-pulse rounded bg-[var(--muted)]" />
        <div className="h-8 w-16 animate-pulse rounded bg-[var(--muted)]" />
      </div>
    </Card>
  )
}

/* ── Dashboard page ───────────────────────────────────────────────── */
export function DashboardPage() {
  const [q, setQ] = useState("")
  const [chartDays, setChartDays] = useState(30)
  const { data, isLoading, isError } = useDashboard(chartDays)

  return (
    <div>
      <PageHeader
        icon="chart"
        title="لوحة المعلومات"
        desc="نظرة شاملة على أداء التوظيف لهذا الشهر"
        actions={
          <>
            <Btn variant="outline">
              <Icon name="download" size={14} /> تصدير التقرير
            </Btn>
            <Btn>
              <Icon name="plus" size={14} /> نشر وظيفة
            </Btn>
          </>
        }
      />

      {/* ── Stat cards ──────────────────────────────────────────────── */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
        ) : isError ? (
          <div className="col-span-4 py-4 text-center text-[13px] text-[var(--muted-foreground)]">
            تعذّر تحميل البيانات
          </div>
        ) : (
          <>
            <StatCard
              tone="tone-sky"
              icon="users"
              label="إجمالي الطلبات"
              value={data!.stats.totalRequests}
              sub="هذا الشهر"
              trend={data!.stats.totalRequestsTrend != null ? String(data!.stats.totalRequestsTrend) : null}
            />
            <StatCard
              tone="tone-amber"
              icon="clock"
              label="قيد المراجعة"
              value={data!.stats.underReview}
              sub="بانتظار الرد"
            />
            <StatCard
              tone="tone-emerald"
              icon="calendar"
              label="مقابلات مجدولة"
              value={data!.stats.scheduledInterviews}
              sub="إجمالي المقابلات"
            />
            <StatCard
              tone="tone-rose"
              icon="ban"
              label="طلبات مرفوضة"
              value={data!.stats.rejected}
              sub="إجمالي الرفض"
            />
          </>
        )}
      </div>

      {/* ── Chart + departments ─────────────────────────────────────── */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>توزيع الطلبات حسب الحالة</CardTitle>
              <CardDesc>
                {chartDays === 7 ? "آخر 7 أيام" : chartDays === 30 ? "آخر 30 يوماً" : "آخر 3 أشهر"}
              </CardDesc>
            </div>
            <DSelect
              value={String(chartDays)}
              onChange={(v) => setChartDays(Number(v))}
              options={[
                { value: "7", label: "آخر 7 أيام" },
                { value: "30", label: "آخر 30 يوماً" },
                { value: "90", label: "آخر 3 أشهر" },
              ]}
              className="w-32"
            />
          </CardHeader>
          <CardBody>
            {isLoading ? (
              <div className="h-48 animate-pulse rounded-lg bg-[var(--muted)]" />
            ) : (
              <BarChart data={data?.chart ?? []} />
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>الأقسام الأكثر طلباً</CardTitle>
              <CardDesc>حسب حجم الطلبات المفتوحة</CardDesc>
            </div>
          </CardHeader>
          <CardBody>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-1">
                    <div className="h-3 w-32 animate-pulse rounded bg-[var(--muted)]" />
                    <div className="h-2 w-full animate-pulse rounded-full bg-[var(--muted)]" />
                  </div>
                ))}
              </div>
            ) : (
              <TopDepartments data={data?.topDepartments ?? []} />
            )}
          </CardBody>
        </Card>
      </div>

      {/* ── Recent requests ─────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Icon
              name="list"
              size={18}
              className="text-[var(--muted-foreground)]"
            />
            <div>
              <CardTitle>أحدث طلبات التوظيف</CardTitle>
              <CardDesc>أحدث 4 طلبات وردت إلى النظام</CardDesc>
            </div>
          </div>
          <div className="w-[220px]">
            <DInput
              placeholder="بحث…"
              icon={<Icon name="search" size={14} />}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </CardHeader>
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded-lg bg-[var(--muted)]" />
            ))}
          </div>
        ) : (
          <RecentRequests data={data?.recentRequests ?? []} q={q} />
        )}
      </Card>
    </div>
  )
}
