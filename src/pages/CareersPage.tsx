import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Icon } from "@/components/icons"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Btn, BrandLogo, DInput } from "@/components/shell"
import { usePublishedJob, usePublishedJobs } from "@/hooks/useCareers"
import type { PublicJob } from "@/types/api"

/* ── helpers ──────────────────────────────────────────────────────── */
const AD_TYPE_LABEL: Record<PublicJob["adType"], string> = {
  remote: "عن بعد",
  on_site: "في المكتب",
  hybrid: "هجين",
}

function salaryLabel(job: PublicJob) {
  if (!job.salaryFrom && !job.salaryTo) return null
  if (job.salaryFrom && job.salaryTo)
    return `${job.salaryFrom.toLocaleString("ar-SA")} – ${job.salaryTo.toLocaleString("ar-SA")} ر.س`
  return `${(job.salaryFrom ?? job.salaryTo)!.toLocaleString("ar-SA")} ر.س`
}

/* ── Public header ────────────────────────────────────────────────── */
function PublicHeader() {
  const navigate = useNavigate()
  return (
    <header
      className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--background)]"
      dir="rtl"
    >
      <div className="mx-auto flex h-16 max-w-[1120px] items-center justify-between px-6">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-3"
        >
          <BrandLogo size={36} />
          <span className="border-s border-[var(--border)] ps-3 text-[13.5px] text-[var(--muted-foreground)]">
            الوظائف المتاحة
          </span>
        </button>
        <nav className="flex items-center gap-1 text-[13.5px]">
          <button
            onClick={() => navigate("/careers")}
            className="h-9 rounded-md px-3 hover:bg-[var(--accent)]"
          >
            الوظائف
          </button>
          <div className="mx-2 h-6 w-px bg-[var(--border)]" />
          <Btn size="sm" onClick={() => navigate("/apply")}>
            <Icon name="send" size={13} /> تقديم طلب
          </Btn>
        </nav>
      </div>
    </header>
  )
}

/* ── Job card ─────────────────────────────────────────────────────── */
function JobCard({ job, onClick }: { job: PublicJob; onClick: () => void }) {
  const navigate = useNavigate()
  const salary = salaryLabel(job)

  return (
    <Card
      className="cursor-pointer p-5 transition-shadow hover:shadow-md"
      onClick={onClick}
    >
      <div className="mb-4 flex items-start gap-3">
        <div className="tone-rose flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
          <Icon name="briefcase" size={20} />
        </div>
        <div>
          <h3 className="text-[16px] font-semibold">{job.adTitle}</h3>
          <div className="mt-0.5 text-[13px] text-[var(--muted-foreground)]">
            {AD_TYPE_LABEL[job.adType]}
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge tone="neutral">{AD_TYPE_LABEL[job.adType]}</Badge>
        {salary && <Badge tone="amber">{salary}</Badge>}
        {job.deadline && (
          <Badge tone="rose">
            ينتهي {new Date(job.deadline).toLocaleDateString("ar-SA")}
          </Badge>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-[var(--border)] pt-3">
        <div className="text-[12.5px] text-[var(--muted-foreground)]">
          {new Date(job.createdAt).toLocaleDateString("ar-SA")}
        </div>
        <Btn
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            navigate(`/apply?jobId=${job.id}`)
          }}
        >
          قدّم الآن
        </Btn>
      </div>
    </Card>
  )
}

/* ── Listings page ────────────────────────────────────────────────── */
export function CareersPage() {
  const navigate = useNavigate()
  const { data: jobs = [], isLoading, isError } = usePublishedJobs()
  const [q, setQ] = useState("")
  const [type, setType] = useState<PublicJob["adType"] | "all">("all")

  const filtered = jobs
    .filter((j) => !q || j.adTitle.includes(q))
    .filter((j) => type === "all" || j.adType === type)

  return (
    <div className="min-h-screen bg-[var(--background)]" dir="rtl">
      <PublicHeader />

      <section className="mx-auto max-w-[1120px] px-6 pt-14 pb-10">
        <div className="max-w-[640px]">
          <Badge tone="rose" className="mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
            {filtered.length} وظيفة شاغرة الآن
          </Badge>
          <h1 className="text-[42px] leading-[1.15] font-bold tracking-tight">
            ابنِ مستقبلك المهني
            <br />
            معنا في <span className="text-[var(--primary)]">ضم</span>.
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted-foreground)]">
            نبحث عن عقول شغوفة لصنع منتجات يستخدمها آلاف العملاء يومياً. استعرض
            الفرص المتاحة وقدّم طلبك خلال دقائق.
          </p>
        </div>

        <Card className="mt-8 flex flex-wrap items-center gap-3 p-4">
          <div className="min-w-[240px] flex-1">
            <DInput
              placeholder="ابحث عن مسمى وظيفي…"
              icon={<Icon name="search" size={14} />}
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {(["all", "remote", "on_site", "hybrid"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`h-9 rounded-md border px-3 text-[13px] transition-colors ${
                  type === t
                    ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                    : "border-[var(--border)] hover:bg-[var(--accent)]"
                }`}
              >
                {
                  {
                    all: "الكل",
                    remote: "عن بعد",
                    on_site: "في المكتب",
                    hybrid: "هجين",
                  }[t]
                }
              </button>
            ))}
          </div>
        </Card>
      </section>

      <section className="mx-auto max-w-[1120px] px-6 pb-20">
        {isLoading && (
          <div className="flex justify-center py-20">
            <svg
              viewBox="0 0 24 24"
              width="28"
              height="28"
              className="animate-spin text-[var(--primary)]"
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
        )}

        {isError && (
          <div className="py-20 text-center text-[var(--destructive)]">
            تعذّر تحميل الوظائف، يرجى المحاولة مجدداً.
          </div>
        )}

        {!isLoading && !isError && filtered.length === 0 && (
          <div className="py-20 text-center text-[var(--muted-foreground)]">
            لا توجد وظائف متاحة تطابق البحث.
          </div>
        )}

        {!isLoading && !isError && filtered.length > 0 && (
          <>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-[18px] font-semibold">
                {filtered.length} وظيفة متاحة
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {filtered.map((j) => (
                <JobCard
                  key={j.id}
                  job={j}
                  onClick={() => navigate(`/careers/${j.id}`)}
                />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  )
}

/* ── Job detail page ──────────────────────────────────────────────── */
export function JobDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: job, isLoading } = usePublishedJob(id)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)]" dir="rtl">
        <PublicHeader />
        <div className="flex justify-center py-20">
          <svg
            viewBox="0 0 24 24"
            width="28"
            height="28"
            className="animate-spin text-[var(--primary)]"
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
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-[var(--background)]" dir="rtl">
        <PublicHeader />
        <div className="py-20 text-center text-[var(--muted-foreground)]">
          الوظيفة غير موجودة.
        </div>
      </div>
    )
  }

  const salary = salaryLabel(job)

  return (
    <div className="min-h-screen bg-[var(--background)]" dir="rtl">
      <PublicHeader />

      <div className="mx-auto max-w-[1120px] px-6 py-10">
        <button
          onClick={() => navigate("/careers")}
          className="mb-8 flex items-center gap-2 text-[13.5px] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        >
          <Icon name="chevRight" size={16} /> العودة إلى الوظائف
        </button>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card className="p-6">
              <div className="mb-6 flex items-start gap-4">
                <div className="tone-rose flex h-16 w-16 shrink-0 items-center justify-center rounded-xl">
                  <Icon name="briefcase" size={26} />
                </div>
                <div>
                  <h1 className="text-[24px] font-bold">{job.adTitle}</h1>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge tone="neutral">{AD_TYPE_LABEL[job.adType]}</Badge>
                    {salary && <Badge tone="amber">{salary}</Badge>}
                  </div>
                </div>
              </div>

              {job.description && (
                <div>
                  <h2 className="mb-3 text-[16px] font-semibold">عن الوظيفة</h2>
                  <p className="text-[14px] leading-relaxed whitespace-pre-line text-[var(--muted-foreground)]">
                    {job.description}
                  </p>
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="p-5">
              <h3 className="mb-4 text-[15px] font-semibold">تفاصيل الوظيفة</h3>
              <div className="space-y-3">
                {[
                  {
                    icon: "clock",
                    label: "نوع العمل",
                    value: AD_TYPE_LABEL[job.adType],
                  },
                  {
                    icon: "calendar",
                    label: "تاريخ النشر",
                    value: new Date(job.createdAt).toLocaleDateString("ar-SA"),
                  },
                  ...(job.deadline
                    ? [
                        {
                          icon: "ban",
                          label: "آخر موعد",
                          value: new Date(job.deadline).toLocaleDateString(
                            "ar-SA"
                          ),
                        },
                      ]
                    : []),
                ].map((row) => (
                  <div key={row.label} className="flex items-center gap-3">
                    <div className="tone-sky flex h-8 w-8 shrink-0 items-center justify-center rounded-md">
                      <Icon name={row.icon} size={14} />
                    </div>
                    <div>
                      <div className="text-[11px] text-[var(--muted-foreground)]">
                        {row.label}
                      </div>
                      <div className="text-[13.5px] font-medium">
                        {row.value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {salary && (
                <div className="mt-5 rounded-lg border border-primary/25 bg-primary/10 p-3">
                  <div className="mb-0.5 text-[12px] text-[var(--muted-foreground)]">
                    الراتب الشهري
                  </div>
                  <div className="text-[20px] font-bold text-[var(--primary)]">
                    {salary}
                  </div>
                </div>
              )}

              <Btn
                className="mt-4 w-full"
                onClick={() => navigate(`/apply?jobId=${job.id}`)}
              >
                <Icon name="send" size={14} /> قدّم الآن
              </Btn>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
