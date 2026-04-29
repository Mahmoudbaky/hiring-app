import { useState, useMemo, useRef, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
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
  useSubmitManualApplication,
} from "@/hooks/useRequests"
import { usePublishedJobs, useQualificationTypes } from "@/hooks/useCareers"
import { useCompanies } from "@/hooks/useSettings"
import { useOpenCv } from "@/hooks/useOpenCv"
import { useToast } from "@/components/ui/toast"
import { Icon } from "@/components/icons"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { DDialog } from "@/components/ui/ddialog"
import { Btn, Th, Td, PageHeader, DInput } from "@/components/shell"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { CvUpload } from "@/components/cv-upload"
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
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 rounded-md border border-input bg-card px-2.5 text-[13px] text-foreground focus:outline-none"
    >
      <option value="all">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
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
                  value={data.jobAd.adTitle}
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

/* ── Manual apply schema ─────────────────────────────────────────── */
const manualSchema = z.object({
  jobAdId: z.string().min(1, "الرجاء اختيار وظيفة"),
  applicant: z.object({
    name: z.string().min(1, "الاسم مطلوب"),
    email: z.string().email("بريد إلكتروني غير صالح"),
    phone: z.string().min(1, "رقم الهاتف مطلوب"),
    gender: z.enum(["male", "female"]).optional(),
    dateOfBirth: z.string().optional(),
    currentJobLocation: z.string().optional(),
  }),
  cvUrl: z.string().optional(),
})
type ManualFormValues = z.infer<typeof manualSchema>

function NativeSelect({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="focus-ring h-10 w-full rounded-md border border-input bg-card px-3 text-[13.5px] text-foreground"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

/* ── Manual apply dialog ─────────────────────────────────────────── */
function ManualApplyDialog({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const toast = useToast()
  const { user } = useApp()
  const isSuperAdmin = user?.role === "super_admin"
  const { data: jobs = [], isLoading: jobsLoading } = usePublishedJobs()
  const { data: qualTypes = [] } = useQualificationTypes()
  const { data: companies = [] } = useCompanies()
  const { mutate: submit, isPending, error: submitError } = useSubmitManualApplication(
    () => {
      toast({ title: "تم إضافة الطلب بنجاح", tone: "success" })
      onClose()
    },
    () => toast({ title: "فشل إضافة الطلب", tone: "error" })
  )

  const [selectedCompanyId, setSelectedCompanyId] = useState("")
  const [qualDetails, setQualDetails] = useState<
    Record<string, { yearObtained: string; instituteName: string }>
  >({})

  const form = useForm<ManualFormValues>({
    resolver: zodResolver(manualSchema),
    defaultValues: {
      jobAdId: "",
      cvUrl: "",
      applicant: {
        name: "",
        email: "",
        phone: "",
        gender: undefined,
        dateOfBirth: "",
        currentJobLocation: "",
      },
    },
  })

  useEffect(() => {
    if (!open) {
      form.reset()
      setQualDetails({})
      setSelectedCompanyId("")
    }
  }, [open, form])

  const toggleQual = (id: string) => {
    setQualDetails((prev) => {
      if (id in prev) {
        const next = { ...prev }
        delete next[id]
        return next
      }
      return { ...prev, [id]: { yearObtained: "", instituteName: "" } }
    })
  }

  const setQualField = (
    id: string,
    key: "yearObtained" | "instituteName",
    value: string
  ) => {
    setQualDetails((prev) => ({ ...prev, [id]: { ...prev[id], [key]: value } }))
  }

  const onSubmit = (values: ManualFormValues) => {
    if (isSuperAdmin && !selectedCompanyId) {
      toast({ title: "الرجاء اختيار الشركة", tone: "error" })
      return
    }
    submit({
      jobAdId: values.jobAdId,
      companyId: isSuperAdmin ? selectedCompanyId : undefined,
      cvUrl: values.cvUrl || undefined,
      applicant: values.applicant,
      qualifications: Object.entries(qualDetails).map(([typeId, det]) => ({
        qualificationTypeId: typeId,
        yearObtained: det.yearObtained ? parseInt(det.yearObtained, 10) : undefined,
        instituteName: det.instituteName || undefined,
      })),
    })
  }

  return (
    <DDialog open={open} onClose={onClose} size="lg">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="tone-sky flex h-9 w-9 items-center justify-center rounded-lg">
            <Icon name="userPlus" size={16} />
          </div>
          <div>
            <h2 className="text-[15px] font-bold">إضافة طلب يدوي</h2>
            <p className="text-[12px] text-muted-foreground">
              تقديم طلب توظيف نيابةً عن المتقدم
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent"
        >
          <Icon name="x" size={16} />
        </button>
      </div>

      {/* Scrollable form */}
      <div className="max-h-[75vh] overflow-y-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-5">
            {/* Company selection — super_admin only */}
            {isSuperAdmin && (
              <div className="space-y-3">
                <h3 className="text-[12px] font-semibold tracking-wide text-muted-foreground uppercase">
                  الشركة
                </h3>
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium after:mr-1 after:text-destructive after:content-['*']">
                    الشركة
                  </label>
                  <NativeSelect
                    value={selectedCompanyId}
                    onChange={setSelectedCompanyId}
                    placeholder="اختر الشركة"
                    options={companies.map((c) => ({ value: c.id, label: c.companyName }))}
                  />
                </div>
              </div>
            )}

            {/* Job selection */}
            <div className="space-y-3">
              <h3 className="text-[12px] font-semibold tracking-wide text-muted-foreground uppercase">
                الوظيفة
              </h3>
              <FormField
                control={form.control}
                name="jobAdId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>الوظيفة المطلوبة</FormLabel>
                    <FormControl>
                      <NativeSelect
                        value={field.value}
                        onChange={field.onChange}
                        placeholder={jobsLoading ? "جاري التحميل…" : "اختر وظيفة"}
                        options={jobs.map((j) => ({ value: j.id, label: j.adTitle }))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Personal info */}
            <div className="space-y-3">
              <h3 className="text-[12px] font-semibold tracking-wide text-muted-foreground uppercase">
                المعلومات الشخصية
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="applicant.name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>الاسم الكامل</FormLabel>
                      <FormControl>
                        <DInput icon={<Icon name="user" size={14} />} placeholder="الاسم الثلاثي" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="applicant.email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>البريد الإلكتروني</FormLabel>
                      <FormControl>
                        <DInput icon={<Icon name="mail" size={14} />} type="email" placeholder="example@domain.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="applicant.phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>رقم الهاتف</FormLabel>
                      <FormControl>
                        <DInput icon={<Icon name="phone" size={14} />} placeholder="05xxxxxxxx" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="applicant.gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الجنس</FormLabel>
                      <FormControl>
                        <NativeSelect
                          value={field.value ?? ""}
                          onChange={(v) => field.onChange(v || undefined)}
                          placeholder="اختر (اختياري)"
                          options={[
                            { value: "male", label: "ذكر" },
                            { value: "female", label: "أنثى" },
                          ]}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="applicant.dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>تاريخ الميلاد</FormLabel>
                      <FormControl>
                        <DInput type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="applicant.currentJobLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>مكان العمل الحالي</FormLabel>
                      <FormControl>
                        <DInput icon={<Icon name="globe" size={14} />} placeholder="مثال: الرياض" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* CV upload */}
            <div className="space-y-3">
              <h3 className="text-[12px] font-semibold tracking-wide text-muted-foreground uppercase">
                السيرة الذاتية
              </h3>
              <FormField
                control={form.control}
                name="cvUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ملف السيرة الذاتية</FormLabel>
                    <FormControl>
                      <CvUpload value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Qualifications */}
            {qualTypes.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-[12px] font-semibold tracking-wide text-muted-foreground uppercase">
                  المؤهل الأكاديمي
                </h3>
                <div className="overflow-hidden rounded-lg border border-border">
                  {qualTypes.map((qt, idx) => {
                    const checked = qt.id in qualDetails
                    const det = qualDetails[qt.id]
                    return (
                      <div key={qt.id} className={idx > 0 ? "border-t border-border" : ""}>
                        <button
                          type="button"
                          onClick={() => toggleQual(qt.id)}
                          className="flex w-full items-center gap-3 px-4 py-3 text-right transition-colors hover:bg-muted"
                        >
                          <div
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                              checked ? "border-primary bg-primary" : "border-muted-foreground"
                            }`}
                          >
                            {checked && (
                              <svg viewBox="0 0 10 8" width="10" height="8" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 4l3 3 5-6" />
                              </svg>
                            )}
                          </div>
                          <span className="text-[13.5px] text-foreground">{qt.name}</span>
                        </button>
                        {checked && (
                          <div className="grid grid-cols-1 gap-4 border-t border-border bg-muted/40 px-4 py-4 sm:grid-cols-2">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[12.5px] font-medium text-foreground">سنة الحصول</label>
                              <DInput
                                type="number"
                                placeholder="مثال: 2020"
                                value={det.yearObtained}
                                onChange={(e) => setQualField(qt.id, "yearObtained", e.target.value)}
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[12.5px] font-medium text-foreground">اسم المؤسسة التعليمية</label>
                              <DInput
                                placeholder="مثال: جامعة الملك سعود"
                                value={det.instituteName}
                                onChange={(e) => setQualField(qt.id, "instituteName", e.target.value)}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Server error */}
            {submitError && (
              <div className="flex items-center gap-2 rounded-md border border-[oklch(0.9_0.05_25)] bg-[oklch(0.97_0.03_25)] px-3 py-2 text-[12.5px] text-[oklch(0.5_0.15_25)]">
                <Icon name="info" size={13} />
                {submitError instanceof Error ? submitError.message : "حدث خطأ غير متوقع، يرجى المحاولة مجدداً."}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-border pt-2">
              <Btn variant="outline" type="button" onClick={onClose}>
                إلغاء
              </Btn>
              <Btn type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <svg viewBox="0 0 24 24" width="14" height="14" className="animate-spin">
                      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="30 60" />
                    </svg>
                    جاري الإرسال…
                  </>
                ) : (
                  <>
                    <Icon name="send" size={14} /> إضافة الطلب
                  </>
                )}
              </Btn>
            </div>
          </form>
        </Form>
      </div>
    </DDialog>
  )
}

/* ── Column helper ───────────────────────────────────────────────── */
const col = createColumnHelper<JobRequest>()

/* ── Main page ───────────────────────────────────────────────────── */
export function IncomingPage() {
  const { user } = useApp()
  const isSuperAdmin = user?.role === "super_admin"

  const { data: requests = [], isLoading } = useRequests()
  const toast = useToast()
  const { mutate: changeStatus } = useUpdateRequestStatus(
    () => toast({ title: "تم تغيير الحالة بنجاح", tone: "success" }),
    () => toast({ title: "فشل تغيير الحالة", tone: "error" })
  )

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [manualApplyOpen, setManualApplyOpen] = useState(false)
  const [globalFilter, setGlobalFilter] = useState("")
  const [jobFilter, setJobFilter] = useState("all")
  const [companyFilter, setCompanyFilter] = useState("all")
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const { openCv } = useOpenCv()

  /* Dropdown options derived from raw data */
  const uniqueJobTitles = useMemo(
    () => [...new Set(requests.map((r) => r.jobAd.adTitle))].sort(),
    [requests]
  )
  const uniqueCompanies = useMemo(
    () => [...new Set(requests.map((r) => r.company.companyName))].sort(),
    [requests]
  )

  /* Pre-filter by dropdowns before handing to TanStack Table */
  const preFiltered = useMemo(() => {
    let data = requests
    if (jobFilter !== "all")
      data = data.filter((r) => r.jobAd.adTitle === jobFilter)
    if (companyFilter !== "all")
      data = data.filter((r) => r.company.companyName === companyFilter)
    return data
  }, [requests, jobFilter, companyFilter])

  /* Column definitions */
  const columns = useMemo(
    () => [
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

      col.accessor((r) => r.applicant.name, {
        id: "applicant",
        header: "المتقدم",
        cell: (info) => {
          const { applicant } = info.row.original
          return (
            <div className="flex items-center gap-3">
              <Avatar name={applicant.name} size={34} />
              <div>
                <div className="text-[13.5px] font-medium">
                  {applicant.name}
                </div>
                <div className="text-[11.5px] text-muted-foreground">
                  {applicant.email}
                </div>
              </div>
            </div>
          )
        },
      }),

      col.accessor((r) => r.applicant.phone, {
        id: "phone",
        header: "الجوال",
        cell: (info) => (
          <span className="tabular text-[13px] text-muted-foreground">
            {info.getValue()}
          </span>
        ),
      }),

      col.accessor((r) => r.jobAd.adTitle, {
        id: "jobTitle",
        header: "الوظيفة",
        cell: (info) => (
          <span className="text-[13px] font-medium">{info.getValue()}</span>
        ),
      }),

      ...(isSuperAdmin
        ? [
            col.accessor((r) => r.company.companyName, {
              id: "company",
              header: "الشركة",
              cell: (info) => (
                <span className="text-[13px]">{info.getValue()}</span>
              ),
            }),
          ]
        : []),

      col.accessor("status", {
        header: "الحالة",
        cell: (info) => {
          const meta = STATUS_META[info.getValue()]
          return <Badge tone={meta.tone as any}>{meta.label}</Badge>
        },
      }),

      col.accessor("createdAt", {
        header: "تاريخ التقديم",
        cell: (info) => (
          <span className="tabular text-[12.5px] text-muted-foreground">
            {new Date(info.getValue()).toLocaleDateString("ar-SA")}
          </span>
        ),
      }),

      col.display({
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const { id, status, cvUrl } = row.original
          return (
            <div className="flex items-center gap-1.5">
              {/* CV attachment */}
              {cvUrl ? (
                <Btn
                  variant="ghost"
                  size="iconSm"
                  title="عرض السيرة الذاتية"
                  onClick={() => openCv(cvUrl)}
                >
                  <Icon name="link" size={14} />
                </Btn>
              ) : (
                <Btn
                  variant="ghost"
                  size="iconSm"
                  disabled
                  title="لا توجد سيرة ذاتية"
                >
                  <Icon name="link" size={14} className="opacity-30" />
                </Btn>
              )}

              {/* Status select */}
              <select
                value={status}
                onChange={(e) =>
                  changeStatus({ id, status: e.target.value as RequestStatus })
                }
                className="h-8 rounded-md border border-input bg-card px-2 text-[12px] text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
              >
                {(
                  Object.entries(STATUS_META) as [
                    RequestStatus,
                    { label: string },
                  ][]
                ).map(([key, { label }]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>

              {/* View details */}
              <Btn
                variant="ghost"
                size="iconSm"
                title="عرض التفاصيل"
                onClick={() => setSelectedId(id)}
              >
                <Icon name="eye" size={15} />
              </Btn>
            </div>
          )
        },
      }),
    ],
    [isSuperAdmin, changeStatus, setSelectedId, openCv]
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
        الوظيفة: r.jobAd.adTitle,
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

  return (
    <div>
      <PageHeader
        icon="users"
        title="إدارة طلبات التوظيف"
        desc="راجع وصنّف طلبات المتقدمين للوظائف الشاغرة"
        actions={
          <Btn onClick={() => setManualApplyOpen(true)}>
            <Icon name="plus" size={14} /> إضافة طلب يدوي
          </Btn>
        }
      />

      <Card className="overflow-hidden">
        {/* ── Toolbar ────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-4">
          {/* Search */}
          <div className="relative min-w-[200px] flex-1">
            <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Icon name="search" size={14} />
            </span>
            <input
              type="text"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="بحث بالاسم أو البريد أو الجوال…"
              className="h-9 w-full rounded-md border border-[var(--input)] bg-card ps-3 pe-9 text-[13px] text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>

          {/* Job filter */}
          <FilterSelect
            value={jobFilter}
            onChange={(v) => {
              setJobFilter(v)
              table.setPageIndex(0)
            }}
            options={uniqueJobTitles}
            placeholder="كل الوظائف"
          />

          {/* Company filter — super_admin only */}
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

          {/* Right side: badges + export */}
          <div className="me-auto flex items-center gap-2">
            {selectedCount > 0 && (
              <Badge tone="sky" className="h-7 gap-1.5 px-2.5">
                <span className="tabular font-semibold">{selectedCount}</span>
                <span className="text-muted-foreground">محدد</span>
              </Badge>
            )}
            <Badge tone="neutral" className="h-7 gap-1.5 px-2.5">
              <span className="tabular font-semibold">{filteredCount}</span>
              <span className="text-muted-foreground">طلب</span>
            </Badge>
            <Btn variant="outline" size="sm" onClick={exportToExcel}>
              <Icon name="download" size={13} />
              {selectedCount > 0 ? `تصدير (${selectedCount})` : "تصدير Excel"}
            </Btn>
          </div>
        </div>

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

        {/* ── Footer: per-page + pagination ──────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border px-5 py-3">
          {/* Rows per page */}
          <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
            <span>عرض</span>
            <select
              value={pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value))
                table.setPageIndex(0)
              }}
              className="h-8 rounded-md border border-[var(--input)] bg-card px-2 text-[13px] text-foreground focus:outline-none"
            >
              {[5, 10, 20].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <span>صف لكل صفحة</span>
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

      <ManualApplyDialog
        open={manualApplyOpen}
        onClose={() => setManualApplyOpen(false)}
      />
    </div>
  )
}
