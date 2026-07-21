import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
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
import { Btn, PageHeader, DInput, DTextarea, SectionHeading } from "@/components/shell"
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
import { Separator } from "@/components/ui/separator"
import { PhoneInput } from "@/components/ui/phone-input"
import { NATIONALITIES } from "@/lib/nationalities"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverPopup, PopoverTrigger } from "@/components/ui/popover"

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
  const selectedDepartment = departments.find((d) => d.id === selectedDepartmentId)
  const hasExtraSpecialties = selectedDepartment?.hasExtraSpecialties ?? false
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

      <div className="mx-auto max-w-3xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            {/* Company / code */}
            <Card className="space-y-5 border-0 p-6 shadow-none!">
              <SectionHeading
                icon="building2"
                title="معلومات الطلب"
                subtitle="حدد الشركة التي سيتم تقديم الطلب نيابة عنها"
              />
              {isSuperAdmin ? (
                <div className="max-w-sm space-y-1.5">
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
                <div className="max-w-sm space-y-1.5">
                  <label className="text-[13px] font-medium">كود الشركة</label>
                  <DInput value={companyCode} disabled />
                </div>
              )}
            </Card>

            <Separator />

            {/* Personal info */}
            <Card className="space-y-5 border-0 p-6 shadow-none!">
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
                        <PhoneInput value={field.value} onChange={field.onChange} />
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
                        <Popover>
                          <PopoverTrigger
                            render={
                              <button
                                type="button"
                                className={cn(
                                  "focus-ring flex h-11 w-full items-center gap-2 rounded-md border border-input bg-card px-3 text-[13.5px] transition-colors",
                                  field.value ? "text-foreground" : "text-muted-foreground"
                                )}
                              />
                            }
                          >
                            <CalendarIcon size={14} className="shrink-0 text-muted-foreground" />
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
                              selected={field.value ? new Date(field.value) : undefined}
                              defaultMonth={field.value ? new Date(field.value) : undefined}
                              onSelect={(d) => field.onChange(d ? format(d, "yyyy-MM-dd") : "")}
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
                        <div className="flex h-11 items-center rounded-md border border-input bg-card p-1">
                          {(["male", "female"] as const).map((val, i) => (
                            <>
                              {i === 1 && (
                                <div key="sep" className="mx-1 h-9 w-px shrink-0 bg-border" />
                              )}
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
                            </>
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
            </Card>

            <Separator />

            {/* Job profile */}
            <Card className="space-y-5 border-0 p-6 shadow-none!">
              <SectionHeading
                icon="briefcase"
                title="بيانات الوظيفة المطلوبة"
                subtitle="حدد القطاع والدرجة والتخصص بدقة"
              />
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
                {hasExtraSpecialties && (
                  <>
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
                  </>
                )}
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
                      <DTextarea
                        {...field}
                        rows={3}
                        placeholder="أي معلومات إضافية تود إضافتها..."
                        className="min-h-0 resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Card>

            <Separator />

            {/* CV upload */}
            <Card className="space-y-5 border-0 p-6 shadow-none!">
              <SectionHeading
                icon="upload"
                title="السيرة الذاتية"
                subtitle="ارفع ملف السيرة الذاتية"
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
      </div>
    </div>
  )
}
