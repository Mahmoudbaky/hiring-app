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
import {
  useQualificationTypes,
  useDepartments,
  useProfessionalGrades,
  useGeneralSpecialties,
  useSubmitApplication,
} from "@/hooks/useCareers"
import { CvUpload } from "@/components/cv-upload"

/* ── Zod schema ───────────────────────────────────────────────────── */
const schema = z.object({
  hiringCompanyCode: z.string().min(1, "كود الشركة مطلوب"),
  applicant: z.object({
    name: z.string().min(1, "الاسم مطلوب"),
    email: z.string().email("بريد إلكتروني غير صالح"),
    phone: z.string().min(1, "رقم الهاتف مطلوب"),
    gender: z.enum(["male", "female"]).optional(),
    dateOfBirth: z.string().optional(),
    nationality: z.string().optional(),
  }),
  qualificationTypeId: z.string().optional(),
  qualificationYear: z.string().optional(),
  jobProfile: z.object({
    departmentId: z.string().optional(),
    professionalGradeId: z.string().optional(),
    generalSpecialtyId: z.string().optional(),
    yearsOfExperience: z.string().optional(),
    additionalInfo: z.string().optional(),
  }).optional(),
  cvUrl: z.string().optional(),
  agreedToTerms: z.boolean().refine((v) => v === true, "يجب الموافقة على الشروط"),
})

type FormValues = z.infer<typeof schema>

/* ── Native select helper ─────────────────────────────────────────── */
function NativeSelect({
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  className = "",
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
  disabled?: boolean
  className?: string
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`focus-ring h-10 w-full rounded-md border border-input bg-card px-3 text-[13.5px] text-foreground disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
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

const YEARS_OF_EXPERIENCE = [
  { value: "less_than_1", label: "أقل من سنة" },
  { value: "1_3", label: "1 - 3 سنوات" },
  { value: "3_5", label: "3 - 5 سنوات" },
  { value: "5_10", label: "5 - 10 سنوات" },
  { value: "more_than_10", label: "أكثر من 10 سنوات" },
]

const QUALIFICATION_YEARS = Array.from({ length: 40 }, (_, i) => {
  const year = new Date().getFullYear() - i
  return { value: String(year), label: String(year) }
})

/* ── Section heading ──────────────────────────────────────────────── */
function SectionHeading({
  icon,
  title,
  subtitle,
  tone = "sky",
}: {
  icon: string
  title: string
  subtitle?: string
  tone?: string
}) {
  return (
    <div className="flex items-center gap-3 border-b border-border pb-4">
      <div className={`tone-${tone} flex h-10 w-10 items-center justify-center rounded-lg`}>
        <Icon name={icon as never} size={18} />
      </div>
      <div>
        <h2 className="text-[16px] font-bold">{title}</h2>
        {subtitle && (
          <p className="mt-0.5 text-[12px] text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </div>
  )
}

/* ── Apply page ───────────────────────────────────────────────────── */
export function ApplyPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const preselectedCode = params.get("code") ?? ""

  const { data: qualTypes = [] } = useQualificationTypes()
  const { data: departments = [] } = useDepartments()
  const {
    mutate: submit,
    isPending,
    isSuccess,
    error: submitError,
  } = useSubmitApplication()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      hiringCompanyCode: preselectedCode,
      cvUrl: "",
      qualificationTypeId: "",
      qualificationYear: "",
      agreedToTerms: false,
      applicant: {
        name: "",
        email: "",
        phone: "",
        gender: undefined,
        dateOfBirth: "",
        nationality: "",
      },
      jobProfile: {
        departmentId: "",
        professionalGradeId: "",
        generalSpecialtyId: "",
        yearsOfExperience: "",
        additionalInfo: "",
      },
    },
  })

  const selectedDepartmentId = form.watch("jobProfile.departmentId") || undefined
  const { data: professionalGrades = [] } = useProfessionalGrades(selectedDepartmentId)
  const { data: generalSpecialties = [] } = useGeneralSpecialties(selectedDepartmentId)

  // Reset cascading selects when department changes
  const [prevDeptId, setPrevDeptId] = useState(selectedDepartmentId)
  useEffect(() => {
    if (selectedDepartmentId !== prevDeptId) {
      form.setValue("jobProfile.professionalGradeId", "")
      form.setValue("jobProfile.generalSpecialtyId", "")
      setPrevDeptId(selectedDepartmentId)
    }
  }, [selectedDepartmentId, prevDeptId, form])

  // Sync URL params
  useEffect(() => {
    if (preselectedCode) form.setValue("hiringCompanyCode", preselectedCode)
  }, [preselectedCode, form])

  const onSubmit = (values: FormValues) => {
    const qualifications =
      values.qualificationTypeId
        ? [
            {
              qualificationTypeId: values.qualificationTypeId,
              yearObtained: values.qualificationYear
                ? parseInt(values.qualificationYear, 10)
                : undefined,
            },
          ]
        : []

    submit({
      hiringCompanyCode: values.hiringCompanyCode,
      cvUrl: values.cvUrl || undefined,
      applicant: values.applicant,
      qualifications,
      jobProfile: {
        departmentId: values.jobProfile?.departmentId || undefined,
        professionalGradeId: values.jobProfile?.professionalGradeId || undefined,
        generalSpecialtyId: values.jobProfile?.generalSpecialtyId || undefined,
        yearsOfExperience: values.jobProfile?.yearsOfExperience || undefined,
        additionalInfo: values.jobProfile?.additionalInfo || undefined,
      },
    })
  }

  /* ── Success screen ─────────────────────────────────────────────── */
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background" dir="rtl">
        <div className="mx-auto max-w-[860px] px-6 py-10">
          <Card className="overflow-hidden">
            <div className="public-header-bg flex items-center justify-between border-b border-border px-8 py-6">
              <div className="flex items-center gap-3">
                <BrandLogo size={40} />
                <div className="border-s border-border ps-3">
                  <div className="text-[18px] font-bold">منصة التوظيف</div>
                  <div className="text-[12.5px] text-muted-foreground">
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
              <h2 className="mb-2 text-[22px] font-bold">تم إرسال طلبك بنجاح</h2>
              <p className="mx-auto max-w-md text-[14px] text-muted-foreground">
                شكراً لاهتمامك بالانضمام إلى فريقنا. سيقوم فريق الموارد البشرية
                بمراجعة طلبك والتواصل معك خلال 3-5 أيام عمل.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <Btn variant="outline" onClick={() => navigate("/careers")}>
                  <Icon name="briefcase" size={14} /> استعراض الوظائف
                </Btn>
              </div>
            </div>

            <div className="border-t border-border px-8 py-4 text-center text-[11.5px] text-muted-foreground">
              © 2026 جميع الحقوق محفوظة — منصة التوظيف
            </div>
          </Card>
        </div>
      </div>
    )
  }

  /* ── Form ───────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="mx-auto max-w-[860px] px-6 py-10">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo size={36} />
            <div>
              <div className="text-[17px] font-bold">منصة التوظيف</div>
            </div>
          </div>
          <Badge tone="sky" className="h-7 text-[11.5px]">
            لا يلزم إنشاء حساب ✓
          </Badge>
        </div>

        {/* Page title */}
        <div className="mb-6 text-center">
          <h1 className="text-[26px] font-bold">
            تسجيل <span className="text-primary">طلب</span> جديد
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            أكمل بياناتك في خطوات بسيطة — بدون تعقيدات
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            {/* ── Company card ────────────────────────────────────── */}
            <Card className="space-y-5 p-6">
              <SectionHeading icon="briefcase" title="معلومات الطلب" subtitle="أدخل كود الشركة للمتابعة" tone="amber" />
              <FormField
                control={form.control}
                name="hiringCompanyCode"
                render={({ field }) => (
                  <FormItem className="max-w-sm">
                    <FormLabel required>كود الشركة</FormLabel>
                    <FormControl>
                      <DInput placeholder="مثال: DHUM2024" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Card>

            {/* ── Personal info card ──────────────────────────────── */}
            <Card className="space-y-5 p-6">
              <SectionHeading icon="user" title="البيانات الشخصية" subtitle="معلومات أساسية للتواصل" tone="sky" />
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="applicant.name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>الاسم الكامل</FormLabel>
                      <FormControl>
                        <DInput icon={<Icon name="user" size={14} />} placeholder="أدخل اسمك الكامل" {...field} />
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
                      <FormLabel required>رقم الجوال</FormLabel>
                      <FormControl>
                        <DInput icon={<Icon name="phone" size={14} />} placeholder="+966 5XX XXX XXXX" {...field} />
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
                        <DInput icon={<Icon name="mail" size={14} />} type="email" placeholder="example@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="applicant.nationality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الجنسية</FormLabel>
                      <FormControl>
                        <DInput placeholder="اختر الجنسية" {...field} />
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
                  name="applicant.gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الجنس</FormLabel>
                      <FormControl>
                        <div className="flex h-10 items-center gap-4 rounded-md border border-input px-3">
                          {(["male", "female"] as const).map((val) => (
                            <label key={val} className="flex cursor-pointer items-center gap-2">
                              <input
                                type="radio"
                                name="gender"
                                value={val}
                                checked={field.value === val}
                                onChange={() => field.onChange(val)}
                                className="accent-primary"
                              />
                              <span className="text-[13.5px]">{val === "male" ? "ذكر" : "أنثى"}</span>
                            </label>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="qualificationTypeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>أعلى مؤهل علمي</FormLabel>
                      <FormControl>
                        <NativeSelect
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          placeholder="اختر المؤهل"
                          options={qualTypes.map((q) => ({ value: q.id, label: q.name }))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="qualificationYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>سنة الحصول على المؤهل</FormLabel>
                      <FormControl>
                        <NativeSelect
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          placeholder="مثال: 2018"
                          options={QUALIFICATION_YEARS}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Card>

            {/* ── Job profile card ────────────────────────────────── */}
            <Card className="space-y-5 p-6">
              <SectionHeading icon="briefcase" title="بيانات الوظيفة المطلوبة" subtitle="حدد قطاعك ودرجتك وتخصصك بدقة" tone="violet" />

              {/* Cascading selects row */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {/* Department */}
                <FormField
                  control={form.control}
                  name="jobProfile.departmentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <span className="me-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] text-white">1</span>
                        القطاع
                      </FormLabel>
                      <FormControl>
                        <NativeSelect
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          placeholder="اختر القطاع"
                          options={departments.map((d) => ({ value: d.id, label: d.name }))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Professional grade */}
                <FormField
                  control={form.control}
                  name="jobProfile.professionalGradeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <span className="me-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] text-white">2</span>
                        الدرجة المهنية
                      </FormLabel>
                      <FormControl>
                        <NativeSelect
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          placeholder="اختر الدرجة"
                          disabled={!selectedDepartmentId}
                          options={professionalGrades.map((g) => ({ value: g.id, label: g.name }))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* General specialty */}
                <FormField
                  control={form.control}
                  name="jobProfile.generalSpecialtyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <span className="me-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] text-white">3</span>
                        التخصص العام
                      </FormLabel>
                      <FormControl>
                        <NativeSelect
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          placeholder="اختر التخصص"
                          disabled={!selectedDepartmentId}
                          options={generalSpecialties.map((s) => ({ value: s.id, label: s.name }))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Years of experience */}
              <FormField
                control={form.control}
                name="jobProfile.yearsOfExperience"
                render={({ field }) => (
                  <FormItem className="max-w-sm">
                    <FormLabel>سنوات الخبرة</FormLabel>
                    <FormControl>
                      <NativeSelect
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        placeholder="اختر سنوات الخبرة"
                        options={YEARS_OF_EXPERIENCE}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Additional info */}
              <FormField
                control={form.control}
                name="jobProfile.additionalInfo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>أخرى (معلومات إضافية اختيارية)</FormLabel>
                    <FormControl>
                      <textarea
                        {...field}
                        rows={3}
                        placeholder="أي معلومات إضافية تود إضافتها مثل شهادات، مهارات، أو ملاحظات خاصة..."
                        className="focus-ring w-full resize-none rounded-md border border-input bg-card px-3 py-2 text-[13.5px] text-foreground placeholder:text-muted-foreground"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Card>

            {/* ── CV Upload card ───────────────────────────────────── */}
            <Card className="space-y-5 p-6">
              <SectionHeading icon="upload" title="السيرة الذاتية" subtitle="ارفع ملف سيرتك الذاتية" tone="emerald" />
              <FormField
                control={form.control}
                name="cvUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <CvUpload value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Card>

            {/* ── Terms & errors ───────────────────────────────────── */}
            <div className="space-y-3">
              <FormField
                control={form.control}
                name="agreedToTerms"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-[13px]">
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          className="accent-primary h-4 w-4"
                        />
                        <span>
                          أوافق على{" "}
                          <span className="text-primary underline">سياسة الخصوصية وشروط الاستخدام</span>
                          . وأقر بصحة جميع البيانات المدخلة
                        </span>
                      </label>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {submitError && (
                <div className="flex items-center gap-2 rounded-md border border-[oklch(0.9_0.05_25)] bg-[oklch(0.97_0.03_25)] px-3 py-2 text-[12.5px] text-[oklch(0.5_0.15_25)]">
                  <Icon name="info" size={13} />
                  {submitError instanceof Error
                    ? submitError.message
                    : "حدث خطأ غير متوقع، يرجى المحاولة مجدداً."}
                </div>
              )}
            </div>

            {/* ── Actions ──────────────────────────────────────────── */}
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <Btn type="submit" disabled={isPending} className="flex-1 sm:flex-none sm:px-10">
                {isPending ? (
                  <>
                    <svg viewBox="0 0 24 24" width="14" height="14" className="animate-spin">
                      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="30 60" />
                    </svg>
                    جاري الإرسال…
                  </>
                ) : (
                  <>
                    <Icon name="send" size={14} /> مراجعة البيانات وإرسال الطلب ✓
                  </>
                )}
              </Btn>
              <div className="flex items-center gap-4 text-[12px] text-muted-foreground">
                <span>🔒 بياناتك محفوظة</span>
                <span>✨ مجاني تماماً</span>
                <span>✓ لا يلزم إنشاء حساب</span>
              </div>
            </div>
          </form>
        </Form>

        <div className="mt-6 text-center text-[11.5px] text-muted-foreground">
          © 2026 جميع الحقوق محفوظة — منصة التوظيف
        </div>
      </div>
    </div>
  )
}
