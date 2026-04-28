import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Icon } from "@/components/icons"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Btn, BrandLogo, DInput } from "@/components/shell"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { usePublishedJobs, useQualificationTypes, useSubmitApplication } from "@/hooks/useCareers"
import { CvUpload } from "@/components/cv-upload"

/* ── Zod schema ───────────────────────────────────────────────────── */
const schema = z.object({
  hiringCompanyCode: z.string().min(1, "كود الشركة مطلوب"),
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

type FormValues = z.infer<typeof schema>

/* ── Native select helper ─────────────────────────────────────────── */
function NativeSelect({
  value,
  onChange,
  options,
  placeholder,
  className = "",
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
  className?: string
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`focus-ring h-10 w-full rounded-md border border-[var(--input)] bg-[var(--card)] px-3 text-[13.5px] text-[var(--foreground)] ${className}`}
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

/* ── Apply page ───────────────────────────────────────────────────── */
export function ApplyPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const preselectedJobId = params.get("jobId") ?? ""

  const { data: jobs = [], isLoading: jobsLoading } = usePublishedJobs()
  const { data: qualTypes = [] } = useQualificationTypes()
  const {
    mutate: submit,
    isPending,
    isSuccess,
    error: submitError,
  } = useSubmitApplication()

  // qualDetails keys = checked typeIds; values = the expandable sub-fields
  const [qualDetails, setQualDetails] = useState<
    Record<string, { yearObtained: string; instituteName: string }>
  >({})

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
    value: string,
  ) => {
    setQualDetails((prev) => ({
      ...prev,
      [id]: { ...prev[id], [key]: value },
    }))
  }

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      hiringCompanyCode: "",
      jobAdId: preselectedJobId,
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

  // Sync jobAdId when URL param changes after mount
  useEffect(() => {
    if (preselectedJobId) form.setValue("jobAdId", preselectedJobId)
  }, [preselectedJobId, form])

  const onSubmit = (values: FormValues) => {
    submit({
      jobAdId: values.jobAdId,
      hiringCompanyCode: values.hiringCompanyCode,
      cvUrl: values.cvUrl || undefined,
      applicant: values.applicant,
      qualifications: Object.entries(qualDetails).map(([typeId, det]) => ({
        qualificationTypeId: typeId,
        yearObtained: det.yearObtained ? parseInt(det.yearObtained, 10) : undefined,
        instituteName: det.instituteName || undefined,
      })),
    })
  }

  /* ── Success screen ─────────────────────────────────────────────── */
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[var(--background)]" dir="rtl">
        <div className="mx-auto max-w-[860px] px-6 py-10">
          <Card className="overflow-hidden">
            <div className="public-header-bg flex items-center justify-between border-b border-[var(--border)] px-8 py-6">
              <div className="flex items-center gap-3">
                <BrandLogo size={40} />
                <div className="border-s border-[var(--border)] ps-3">
                  <div className="text-[18px] font-bold">بوابة التوظيف</div>
                  <div className="text-[12.5px] text-[var(--muted-foreground)]">
                    نظام إدارة الموارد البشرية
                  </div>
                </div>
              </div>
              <Badge tone="emerald" className="h-7">
                <span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.6_0.15_155)]" />
                متاح حالياً
              </Badge>
            </div>

            <div className="p-12 text-center">
              <div className="tone-emerald mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <Icon name="check" size={28} />
              </div>
              <h2 className="mb-2 text-[22px] font-bold">
                تم إرسال طلبك بنجاح
              </h2>
              <p className="mx-auto max-w-md text-[14px] text-[var(--muted-foreground)]">
                شكراً لاهتمامك بالانضمام إلى فريقنا. سيقوم فريق الموارد البشرية
                بمراجعة طلبك والتواصل معك خلال 3-5 أيام عمل.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <Btn variant="outline" onClick={() => navigate("/careers")}>
                  <Icon name="briefcase" size={14} /> استعراض الوظائف
                </Btn>
              </div>
            </div>

            <div className="border-t border-[var(--border)] px-8 py-4 text-center text-[11.5px] text-[var(--muted-foreground)]">
              © 2026 جميع الحقوق محفوظة لـ ضم — نظام التوظيف.
            </div>
          </Card>
        </div>
      </div>
    )
  }

  /* ── Form ───────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-[var(--background)]" dir="rtl">
      <div className="mx-auto max-w-[860px] px-6 py-10">
        <Card className="overflow-hidden">
          {/* Header */}
          <div className="public-header-bg flex items-center justify-between border-b border-[var(--border)] px-8 py-6">
            <div className="flex items-center gap-3">
              <BrandLogo size={40} />
              <div className="border-s border-[var(--border)] ps-3">
                <div className="text-[18px] font-bold">بوابة التوظيف</div>
                <div className="text-[12.5px] text-[var(--muted-foreground)]">
                  نظام إدارة الموارد البشرية
                </div>
              </div>
            </div>
            <Badge tone="emerald" className="h-7">
              <span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.6_0.15_155)]" />
              متاح حالياً
            </Badge>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8 p-8"
            >
              {/* Section title */}
              <div className="flex items-center gap-3 border-b border-[var(--border)] pb-4">
                <div className="tone-sky flex h-10 w-10 items-center justify-center rounded-lg">
                  <Icon name="userPlus" size={18} />
                </div>
                <div>
                  <h2 className="text-[18px] font-bold">
                    نموذج طلب انضمام للفريق
                  </h2>
                  <p className="mt-0.5 text-[12.5px] text-[var(--muted-foreground)]">
                    يرجى تعبئة المعلومات التالية بدقة
                  </p>
                </div>
              </div>

              {/* ── Job & company ───────────────────────────────────── */}
              <div className="space-y-4">
                <h3 className="text-[14px] font-semibold tracking-wide text-[var(--muted-foreground)] uppercase">
                  معلومات الطلب
                </h3>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="jobAdId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>الوظيفة المطلوبة</FormLabel>
                        <FormControl>
                          {preselectedJobId ? (
                            <div className="flex h-10 items-center gap-2 rounded-md border border-input bg-muted px-3 text-[13.5px]">
                              <Icon
                                name="briefcase"
                                size={14}
                                className="shrink-0 text-muted-foreground"
                              />
                              <span className="truncate text-foreground">
                                {jobs.find((j) => j.id === preselectedJobId)
                                  ?.adTitle ?? "جاري التحميل…"}
                              </span>
                            </div>
                          ) : (
                            <NativeSelect
                              value={field.value}
                              onChange={field.onChange}
                              placeholder={
                                jobsLoading ? "جاري التحميل…" : "اختر وظيفة"
                              }
                              options={jobs.map((j) => ({
                                value: j.id,
                                label: j.adTitle,
                              }))}
                            />
                          )}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="hiringCompanyCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>كود الشركة</FormLabel>
                        <FormControl>
                          <DInput placeholder="مثال: DHUM2024" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* ── Personal info ────────────────────────────────────── */}
              <div className="space-y-4">
                <h3 className="text-[14px] font-semibold tracking-wide text-[var(--muted-foreground)] uppercase">
                  المعلومات الشخصية
                </h3>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="applicant.name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>الاسم الكامل</FormLabel>
                        <FormControl>
                          <DInput
                            icon={<Icon name="user" size={14} />}
                            placeholder="أدخل اسمك الثلاثي"
                            {...field}
                          />
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
                          <DInput
                            icon={<Icon name="mail" size={14} />}
                            type="email"
                            placeholder="example@domain.com"
                            {...field}
                          />
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
                          <DInput
                            icon={<Icon name="phone" size={14} />}
                            placeholder="05xxxxxxxx"
                            {...field}
                          />
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
                          <DInput
                            icon={<Icon name="globe" size={14} />}
                            placeholder="مثال: الرياض"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* ── CV Upload ────────────────────────────────────────── */}
              <div className="space-y-4">
                <h3 className="text-[14px] font-semibold tracking-wide text-[var(--muted-foreground)] uppercase">
                  السيرة الذاتية
                </h3>
                <FormField
                  control={form.control}
                  name="cvUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ملف السيرة الذاتية</FormLabel>
                      <FormControl>
                        <CvUpload
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* ── Qualifications ───────────────────────────────────── */}
              {qualTypes.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-[14px] font-semibold tracking-wide text-muted-foreground uppercase">
                    المؤهل الدراسي - الأكاديمي
                  </h3>
                  <div className="overflow-hidden rounded-lg border border-border">
                    {qualTypes.map((qt, idx) => {
                      const checked = qt.id in qualDetails
                      const det = qualDetails[qt.id]
                      return (
                        <div
                          key={qt.id}
                          className={idx > 0 ? "border-t border-border" : ""}
                        >
                          {/* ── Checkbox row ── */}
                          <button
                            type="button"
                            onClick={() => toggleQual(qt.id)}
                            className="flex w-full items-center gap-3 px-4 py-3 text-right transition-colors hover:bg-muted"
                          >
                            <div
                              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                                checked
                                  ? "border-primary bg-primary"
                                  : "border-muted-foreground"
                              }`}
                            >
                              {checked && (
                                <svg
                                  viewBox="0 0 10 8"
                                  width="10"
                                  height="8"
                                  fill="none"
                                  stroke="white"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M1 4l3 3 5-6" />
                                </svg>
                              )}
                            </div>
                            <span className="text-[13.5px] text-foreground">
                              {qt.name}
                            </span>
                          </button>

                          {/* ── Expandable inputs ── */}
                          {checked && (
                            <div className="grid grid-cols-1 gap-4 border-t border-border bg-(--muted)/40 px-4 py-4 sm:grid-cols-2">
                              <div className="flex flex-col gap-1.5">
                                <label className="text-[12.5px] font-medium text-foreground">
                                  سنة الحصول
                                </label>
                                <DInput
                                  type="number"
                                  placeholder="مثال: 2020"
                                  value={det.yearObtained}
                                  onChange={(e) =>
                                    setQualField(qt.id, "yearObtained", e.target.value)
                                  }
                                />
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <label className="text-[12.5px] font-medium text-foreground">
                                  اسم المؤسسة التعليمية
                                </label>
                                <DInput
                                  placeholder="مثال: جامعة الملك سعود"
                                  value={det.instituteName}
                                  onChange={(e) =>
                                    setQualField(qt.id, "instituteName", e.target.value)
                                  }
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

              {/* ── Server error ─────────────────────────────────────── */}
              {submitError && (
                <div className="flex items-center gap-2 rounded-md border border-[oklch(0.9_0.05_25)] bg-[oklch(0.97_0.03_25)] px-3 py-2 text-[12.5px] text-[oklch(0.5_0.15_25)]">
                  <Icon name="info" size={13} />
                  {submitError instanceof Error
                    ? submitError.message
                    : "حدث خطأ غير متوقع، يرجى المحاولة مجدداً."}
                </div>
              )}

              {/* ── Actions ──────────────────────────────────────────── */}
              <div className="flex items-center gap-3 border-t border-[var(--border)] pt-2">
                <Btn type="submit" disabled={isPending}>
                  {isPending ? (
                    <>
                      <svg
                        viewBox="0 0 24 24"
                        width="14"
                        height="14"
                        className="animate-spin"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeDasharray="30 60"
                        />
                      </svg>
                      جاري الإرسال…
                    </>
                  ) : (
                    <>
                      <Icon name="send" size={14} /> إرسال الطلب
                    </>
                  )}
                </Btn>
                <span className="text-[12px] text-[var(--muted-foreground)]">
                  نحترم خصوصيتك — بياناتك لن تتم مشاركتها.
                </span>
              </div>
            </form>
          </Form>

          <div className="border-t border-[var(--border)] px-8 py-4 text-center text-[11.5px] text-[var(--muted-foreground)]">
            © 2026 جميع الحقوق محفوظة لـ ضم — نظام التوظيف.
          </div>
        </Card>
      </div>
    </div>
  )
}
