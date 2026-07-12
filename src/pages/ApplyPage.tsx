import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Icon } from "@/components/icons"
import { Card } from "@/components/ui/card"
import { Btn, BrandLogo, DInput, DTextarea } from "@/components/shell"
import { Combobox } from "@/components/ui/combobox"
import { DSelect } from "@/components/ui/dselect"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverPopup, PopoverTrigger } from "@/components/ui/popover"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  // useQualificationTypes,
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
  jobProfile: z
    .object({
      departmentId: z.string().optional(),
      professionalGradeId: z.string().optional(),
      generalSpecialtyId: z.string().optional(),
      yearsOfExperience: z.string().optional(),
      additionalInfo: z.string().optional(),
    })
    .optional(),
  cvUrl: z.string().optional(),
  agreedToTerms: z
    .boolean()
    .refine((v) => v === true, "يجب الموافقة على الشروط"),
})

type FormValues = z.infer<typeof schema>

// const YEARS_OF_EXPERIENCE = [
//   { value: "less_than_1", label: "أقل من سنة" },
//   { value: "1_3", label: "1 - 3 سنوات" },
//   { value: "3_5", label: "3 - 5 سنوات" },
//   { value: "5_10", label: "5 - 10 سنوات" },
//   { value: "more_than_10", label: "أكثر من 10 سنوات" },
// ]

const NATIONALITIES = [
  { value: "سعودي", label: "سعودي" },
  { value: "مصري", label: "مصري" },
  { value: "أردني", label: "أردني" },
  { value: "سوري", label: "سوري" },
  { value: "لبناني", label: "لبناني" },
  { value: "عراقي", label: "عراقي" },
  { value: "يمني", label: "يمني" },
  { value: "فلسطيني", label: "فلسطيني" },
  { value: "ليبي", label: "ليبي" },
  { value: "تونسي", label: "تونسي" },
  { value: "جزائري", label: "جزائري" },
  { value: "مغربي", label: "مغربي" },
  { value: "سوداني", label: "سوداني" },
  { value: "إماراتي", label: "إماراتي" },
  { value: "كويتي", label: "كويتي" },
  { value: "بحريني", label: "بحريني" },
  { value: "قطري", label: "قطري" },
  { value: "عُماني", label: "عُماني" },
  { value: "موريتاني", label: "موريتاني" },
  { value: "جيبوتي", label: "جيبوتي" },
  { value: "صومالي", label: "صومالي" },
  { value: "باكستاني", label: "باكستاني" },
  { value: "هندي", label: "هندي" },
  { value: "بنغلاديشي", label: "بنغلاديشي" },
  { value: "فلبيني", label: "فلبيني" },
  { value: "إندونيسي", label: "إندونيسي" },
  { value: "نيجيري", label: "نيجيري" },
  { value: "إثيوبي", label: "إثيوبي" },
  { value: "أخرى", label: "أخرى" },
]

// const QUALIFICATION_YEARS = Array.from({ length: 40 }, (_, i) => {
//   const year = new Date().getFullYear() - i
//   return { value: String(year), label: String(year) }
// })

/* ── Section heading ──────────────────────────────────────────────── */
function SectionHeading({
  icon,
  title,
  subtitle,
}: {
  icon: string
  title: string
  subtitle?: string
}) {
  return (
    <div className="flex items-center gap-3 border-b border-border pb-4">
      <Icon name={icon as never} size={28} className="shrink-0 text-primary" />
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

  // const { data: qualTypes = [] } = useQualificationTypes()
  const { data: departments = [] } = useDepartments()
  const {
    mutate: submit,
    isPending,
    isSuccess,
    data: submitData,
    // error: submitError,
  } = useSubmitApplication()

  // Capture resolved label names at submission time for the success card
  const [submittedInfo, setSubmittedInfo] = useState<{
    name: string
    jobLabel: string
    specialtyLabel: string
  } | null>(null)

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

  const selectedDepartmentId =
    form.watch("jobProfile.departmentId") || undefined
  const { data: professionalGrades = [] } =
    useProfessionalGrades(selectedDepartmentId)
  const { data: generalSpecialties = [] } =
    useGeneralSpecialties(selectedDepartmentId)

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
    const qualifications = values.qualificationTypeId
      ? [
        {
          qualificationTypeId: values.qualificationTypeId,
          yearObtained: values.qualificationYear
            ? parseInt(values.qualificationYear, 10)
            : undefined,
        },
      ]
      : []

    const dept = departments.find(
      (d) => d.id === values.jobProfile?.departmentId
    )
    const grade = professionalGrades.find(
      (g) => g.id === values.jobProfile?.professionalGradeId
    )
    const specialty = generalSpecialties.find(
      (s) => s.id === values.jobProfile?.generalSpecialtyId
    )

    const jobLabel = [dept?.name, grade?.name].filter(Boolean).join(" — ")
    setSubmittedInfo({
      name: values.applicant.name,
      jobLabel,
      specialtyLabel: specialty?.name ?? "",
    })

    submit({
      hiringCompanyCode: values.hiringCompanyCode,
      cvUrl: values.cvUrl || undefined,
      applicant: values.applicant,
      qualifications,
      jobProfile: {
        departmentId: values.jobProfile?.departmentId || undefined,
        professionalGradeId:
          values.jobProfile?.professionalGradeId || undefined,
        generalSpecialtyId: values.jobProfile?.generalSpecialtyId || undefined,
        yearsOfExperience: values.jobProfile?.yearsOfExperience || undefined,
        additionalInfo: values.jobProfile?.additionalInfo || undefined,
      },
    })
  }

  /* ── Success screen ─────────────────────────────────────────────── */
  if (isSuccess && submitData) {
    const submittedAt = new Date(submitData.createdAt).toLocaleString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

    return (
      <div
        className="flex min-h-screen items-start justify-center bg-linear-to-b from-primary/6 to-background px-4 py-10"
        dir="rtl"
      >
        <div className="w-full max-w-[520px]">
          <div className="mb-5 flex items-center justify-center gap-2.5">
            <BrandLogo size={28} />
            <span className="text-[13px] font-medium text-muted-foreground">
              منصة التوظيف
            </span>
          </div>
          <Card className="overflow-hidden shadow-lg">
            <div className="px-8 pt-10 pb-6 text-center">
              {/* Check circle */}
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-950/40">
                <Icon
                  name="check"
                  size={28}
                  className="text-emerald-600 dark:text-emerald-400"
                />
              </div>

              <h2 className="mb-1 text-[22px] font-bold">
                تم إرسال طلبك بنجاح!
              </h2>
              <p className="mx-auto max-w-xs text-[13px] leading-relaxed text-muted-foreground">
                سيتم مراجعة ملفك وعرضه على الشركات والمكاتب المناسبة قريباً
              </p>

              {/* Reference number box */}
              <div className="mt-6 rounded-xl border border-primary/15 bg-primary/5 px-6 py-4">
                <p className="mb-1 text-[11.5px] text-muted-foreground">
                  رقمك المرجعي
                </p>
                <p className="text-[22px] font-bold tracking-wide text-primary">
                  {submitData.referenceNumber ?? "—"}
                </p>
              </div>

              {/* Status badge */}
              <div className="mt-4 flex items-center justify-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                <span className="text-[13px] font-medium text-amber-600">
                  قيد المراجعة
                </span>
              </div>
            </div>

            {/* Details */}
            <div className="mx-6 mb-2 border-t border-border" />
            <div className="space-y-3 px-8 pb-4">
              {submittedInfo?.name && (
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-muted-foreground">الاسم</span>
                  <span className="font-semibold">{submittedInfo.name}</span>
                </div>
              )}
              {submittedInfo?.jobLabel && (
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-muted-foreground">الوظيفة</span>
                  <span className="font-semibold text-primary">
                    {submittedInfo.jobLabel}
                  </span>
                </div>
              )}
              {submittedInfo?.specialtyLabel && (
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-muted-foreground">التخصص</span>
                  <span className="font-semibold text-primary">
                    {submittedInfo.specialtyLabel}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-muted-foreground">تاريخ الإرسال</span>
                <span className="font-medium">{submittedAt}</span>
              </div>
            </div>

            {/* Info note */}
            {/* <div className="mx-6 mb-5 rounded-lg bg-amber-50 border border-amber-100 px-4 py-3 text-[12.5px] text-amber-700 text-center">
              📱 تم إرسال الرقم المرجعي على جوالك وبريدك الإلكتروني
            </div> */}

            {/* Actions */}
            <div className="flex flex-col gap-3 px-6 pb-8">
              <Btn className="w-full" onClick={() => navigate("/careers")}>
                <Icon name="search" size={15} /> تتبع حالة طلبي
              </Btn>
              <Btn
                variant="outline"
                className="w-full"
                onClick={() => navigate("/")}
              >
                العودة للرئيسية
              </Btn>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  /* ── Form ───────────────────────────────────────────────────────── */
  return (
    <div
      className="min-h-screen bg-linear-to-b from-primary/5 via-background to-background"
      dir="rtl"
    >
      <div className="mx-auto max-w-[860px] px-6 py-10">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between border-b border-border pb-5">
          <BrandLogo size={36} />
          <div className="text-[13px] font-medium text-muted-foreground">
            منصة التوظيف
          </div>
        </div>

        {/* Page title */}
        <div className="mb-8 text-center">
          {/* <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl  text-primary">
            <Icon name="userPlus" size={28} />
          </div> */}
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
              <SectionHeading
                icon="building2"
                title="معلومات الطلب"
                subtitle="أدخل كود الشركة للمتابعة"
              />
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
              <SectionHeading
                icon="user"
                title="البيانات الشخصية"
                subtitle="معلومات أساسية للتواصل"
              />
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
                          placeholder="أدخل اسمك الكامل"
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
                      <FormLabel required>رقم الجوال</FormLabel>
                      <FormControl>
                        <DInput
                          icon={<Icon name="phone" size={14} />}
                          placeholder="+966 5XX XXX XXXX"
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
                          placeholder="example@email.com"
                          {...field}
                        />
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
                        <Combobox
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          options={NATIONALITIES}
                          placeholder="اختر الجنسية"
                          searchPlaceholder="ابحث عن جنسية…"
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
                        <Popover>
                          <PopoverTrigger
                            render={
                              <button
                                type="button"
                                className={cn(
                                  "focus-ring flex h-10 w-full items-center gap-2 rounded-md border border-input bg-card px-3 text-[13.5px] transition-colors",
                                  field.value
                                    ? "text-foreground"
                                    : "text-muted-foreground"
                                )}
                              />
                            }
                          >
                            <CalendarIcon
                              size={14}
                              className="shrink-0 text-muted-foreground"
                            />
                            {field.value
                              ? format(new Date(field.value), "dd/MM/yyyy")
                              : "اختر تاريخ الميلاد"}
                          </PopoverTrigger>
                          <PopoverPopup align="start">
                            <Calendar
                              mode="single"
                              captionLayout="dropdown"
                              startMonth={new Date(1950, 0)}
                              endMonth={new Date()}
                              selected={
                                field.value ? new Date(field.value) : undefined
                              }
                              defaultMonth={
                                field.value ? new Date(field.value) : undefined
                              }
                              onSelect={(d) =>
                                field.onChange(d ? format(d, "yyyy-MM-dd") : "")
                              }
                            />
                          </PopoverPopup>
                        </Popover>
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
                        <div className="flex h-10 items-center gap-1 rounded-md border border-input bg-card p-1">
                          {(["male", "female"] as const).map((val) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => field.onChange(val)}
                              className={`h-full flex-1 rounded-sm text-[13px] font-medium transition-colors ${field.value === val
                                ? "bg-primary text-white"
                                : "text-muted-foreground hover:bg-accent"
                                }`}
                            >
                              {val === "male" ? "ذكر" : "أنثى"}
                            </button>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* <FormField
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
                          options={qualTypes.map((q) => ({
                            value: q.id,
                            label: q.name,
                          }))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}

                {/* <FormField
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
                /> */}
              </div>
            </Card>

            {/* ── Job profile card ────────────────────────────────── */}
            <Card className="space-y-5 p-6">
              <SectionHeading
                icon="briefcase"
                title="بيانات الوظيفة المطلوبة"
                subtitle="حدد قطاعك ودرجتك وتخصصك بدقة"
              />

              {/* Cascading selects row */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {/* Department */}
                <FormField
                  control={form.control}
                  name="jobProfile.departmentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <span className="me-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] text-white">
                          1
                        </span>
                        القطاع
                      </FormLabel>
                      <FormControl>
                        <DSelect
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          placeholder="اختر القطاع"
                          options={departments.map((d) => ({
                            value: d.id,
                            label: d.name,
                          }))}
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
                        <span className="me-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] text-white">
                          2
                        </span>
                        الدرجة المهنية
                      </FormLabel>
                      <FormControl>
                        <DSelect
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          placeholder="اختر الدرجة"
                          disabled={!selectedDepartmentId}
                          options={professionalGrades.map((g) => ({
                            value: g.id,
                            label: g.name,
                          }))}
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
                        <span className="me-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] text-white">
                          3
                        </span>
                        التخصص العام
                      </FormLabel>
                      <FormControl>
                        <DSelect
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          placeholder="اختر التخصص"
                          disabled={!selectedDepartmentId}
                          options={generalSpecialties.map((s) => ({
                            value: s.id,
                            label: s.name,
                          }))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Years of experience */}
              {/* <FormField
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
              /> */}

              {/* Additional info */}
              <FormField
                control={form.control}
                name="jobProfile.additionalInfo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>أخرى (معلومات إضافية اختيارية)</FormLabel>
                    <FormControl>
                      <DTextarea
                        {...field}
                        rows={3}
                        placeholder="أي معلومات إضافية تود إضافتها مثل شهادات، مهارات، أو ملاحظات خاصة..."
                        className="min-h-0 resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Card>

            {/* ── CV Upload card ───────────────────────────────────── */}
            <Card className="space-y-5 p-6">
              <SectionHeading
                icon="upload"
                title="السيرة الذاتية"
                subtitle="ارفع ملف سيرتك الذاتية"
              />
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
            {/* <div className="space-y-3">
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
                          className="h-4 w-4 accent-primary"
                        />
                        <span>
                          أوافق على{" "}
                          <span className="text-primary underline">
                            سياسة الخصوصية وشروط الاستخدام
                          </span>
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
            </div> */}

            {/* ── Actions ──────────────────────────────────────────── */}
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <Btn
                type="submit"
                disabled={isPending}
                size="lg"
                className="w-full sm:w-auto sm:px-10"
              >
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
                    إرسال الطلب <Icon name="chevLeft" size={14} />
                  </>
                )}
              </Btn>
              {/* <div className="flex items-center gap-4 text-[12px] text-muted-foreground">
                <span>🔒 بياناتك محفوظة</span>
                <span>✨ مجاني تماماً</span>
                <span>✓ لا يلزم إنشاء حساب</span>
              </div> */}
            </div>
          </form>
        </Form>

        <div className="mt-8 border-t border-border pt-6 text-center text-[11.5px] text-muted-foreground">
          © 2026 جميع الحقوق محفوظة — منصة التوظيف
        </div>
      </div>
    </div>
  )
}
