import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useApp } from "@/context/AppContext"
import {
  useQualificationTypes,
  useDepartments,
  useProfessionalGrades,
  useGeneralSpecialties,
  useSubmitApplication,
} from "@/hooks/useCareers"
import { useCompanies } from "@/hooks/useSettings"
import { useToast } from "@/components/ui/toast"
import { Icon } from "@/components/icons"
import { Btn, PageHeader, DInput } from "@/components/shell"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { CvUpload } from "@/components/cv-upload"
import { DSelect } from "@/components/ui/dselect"
import { Combobox } from "@/components/ui/combobox"
import { Card } from "@/components/ui/card"

const manualSchema = z.object({
  hiringCompanyCode: z.string().min(1),
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
})
type ManualFormValues = z.infer<typeof manualSchema>

const YEARS_OF_EXPERIENCE = [
  { value: "less_than_1", label: "أقل من سنة" },
  { value: "1_3", label: "1 - 3 سنوات" },
  { value: "3_5", label: "3 - 5 سنوات" },
  { value: "5_10", label: "5 - 10 سنوات" },
  { value: "more_than_10", label: "أكثر من 10 سنوات" },
]

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

const QUALIFICATION_YEARS = Array.from({ length: 40 }, (_, i) => {
  const year = new Date().getFullYear() - i
  return { value: String(year), label: String(year) }
})

export function ManualApplyPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { user } = useApp()
  const isSuperAdmin = user?.role === "super_admin"
  const { data: qualTypes = [] } = useQualificationTypes()
  const { data: departments = [] } = useDepartments()
  const { data: companies = [] } = useCompanies()
  const { mutate: submit, isPending, error: submitError } = useSubmitApplication()

  const [selectedCompanyCode, setSelectedCompanyCode] = useState("")
  const companyCode = isSuperAdmin ? selectedCompanyCode : (user?.uniqueCode ?? "")

  const form = useForm<ManualFormValues>({
    resolver: zodResolver(manualSchema),
    defaultValues: {
      hiringCompanyCode: companyCode,
      cvUrl: "",
      qualificationTypeId: "",
      qualificationYear: "",
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

  const [prevDeptId, setPrevDeptId] = useState(selectedDepartmentId)
  useEffect(() => {
    if (selectedDepartmentId !== prevDeptId) {
      form.setValue("jobProfile.professionalGradeId", "")
      form.setValue("jobProfile.generalSpecialtyId", "")
      setPrevDeptId(selectedDepartmentId)
    }
  }, [selectedDepartmentId, prevDeptId, form])

  const onSubmit = (values: ManualFormValues) => {
    if (isSuperAdmin && !selectedCompanyCode) {
      toast({ title: "الرجاء اختيار الشركة", tone: "error" })
      return
    }

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

    submit(
      {
        hiringCompanyCode: companyCode,
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
      },
      {
        onSuccess: () => {
          toast({ title: "تم إضافة الطلب بنجاح", tone: "success" })
          navigate("/incoming")
        },
        onError: () => toast({ title: "فشل إضافة الطلب", tone: "error" }),
      }
    )
  }

  return (
    <div>
      <PageHeader
        icon="userPlus"
        title="إضافة طلب يدوي"
        desc="تقديم طلب توظيف نيابةً عن المتقدم"
      />

      <Card className="mx-auto max-w-3xl p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            {/* Company / code */}
            {isSuperAdmin ? (
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium after:mr-1 after:text-destructive after:content-['*']">
                  الشركة
                </label>
                <DSelect
                  value={selectedCompanyCode}
                  onChange={(v) => setSelectedCompanyCode(String(v))}
                  placeholder="اختر الشركة"
                  options={companies.map((c) => ({
                    value: c.uniqueCode,
                    label: c.companyName,
                  }))}
                />
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium">كود الشركة</label>
                <DInput value={companyCode} disabled />
              </div>
            )}

            {/* Personal info */}
            <div className="space-y-3">
              <h3 className="text-[12px] font-semibold tracking-wide text-muted-foreground uppercase">
                البيانات الشخصية
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
                  name="applicant.phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>رقم الجوال</FormLabel>
                      <FormControl>
                        <DInput icon={<Icon name="phone" size={14} />} placeholder="05xxxxxxxx" {...field} />
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
                        <DSelect
                          value={field.value ?? ""}
                          onChange={(v) => field.onChange(String(v))}
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
                        <DSelect
                          value={field.value ?? ""}
                          onChange={(v) => field.onChange(String(v))}
                          placeholder="مثال: 2018"
                          options={QUALIFICATION_YEARS}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Job profile */}
            <div className="space-y-3">
              <h3 className="text-[12px] font-semibold tracking-wide text-muted-foreground uppercase">
                بيانات الوظيفة المطلوبة
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="jobProfile.departmentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>القطاع</FormLabel>
                      <FormControl>
                        <DSelect
                          value={field.value ?? ""}
                          onChange={(v) => field.onChange(String(v))}
                          placeholder="اختر القطاع"
                          options={departments.map((d) => ({ value: d.id, label: d.name }))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="jobProfile.professionalGradeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الدرجة المهنية</FormLabel>
                      <FormControl>
                        <DSelect
                          value={field.value ?? ""}
                          onChange={(v) => field.onChange(String(v))}
                          placeholder="اختر الدرجة"
                          disabled={!selectedDepartmentId}
                          options={professionalGrades.map((g) => ({ value: g.id, label: g.name }))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="jobProfile.generalSpecialtyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>التخصص العام</FormLabel>
                      <FormControl>
                        <DSelect
                          value={field.value ?? ""}
                          onChange={(v) => field.onChange(String(v))}
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
              <FormField
                control={form.control}
                name="jobProfile.yearsOfExperience"
                render={({ field }) => (
                  <FormItem className="max-w-sm">
                    <FormLabel>سنوات الخبرة</FormLabel>
                    <FormControl>
                      <DSelect
                        value={field.value ?? ""}
                        onChange={(v) => field.onChange(String(v))}
                        placeholder="اختر سنوات الخبرة"
                        options={YEARS_OF_EXPERIENCE}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="jobProfile.additionalInfo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>معلومات إضافية</FormLabel>
                    <FormControl>
                      <textarea
                        {...field}
                        rows={3}
                        placeholder="أي معلومات إضافية تود إضافتها..."
                        className="focus-ring w-full resize-none rounded-md border border-input bg-card px-3 py-2 text-[13.5px] text-foreground placeholder:text-muted-foreground"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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

            {/* Server error */}
            {submitError && (
              <div className="flex items-center gap-2 rounded-md border border-[oklch(0.9_0.05_25)] bg-[oklch(0.97_0.03_25)] px-3 py-2 text-[12.5px] text-[oklch(0.5_0.15_25)]">
                <Icon name="info" size={13} />
                {submitError instanceof Error
                  ? submitError.message
                  : "حدث خطأ غير متوقع، يرجى المحاولة مجدداً."}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
              <Btn variant="outline" type="button" onClick={() => navigate("/incoming")}>
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
      </Card>
    </div>
  )
}
