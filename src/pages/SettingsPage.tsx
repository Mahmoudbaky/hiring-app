import { useState, useMemo, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useApp } from "@/context/AppContext"
import { PageHeader, Btn, DInput, DLabel, Th, Td } from "@/components/shell"
import { DDialog } from "@/components/ui/ddialog"
import { Icon } from "@/components/icons"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  useJobTitlesSettings,
  useCreateJobTitle,
  useDeleteJobTitle,
  useQualificationTypesSettings,
  useCreateQualificationType,
  useDeleteQualificationType,
  useDepartmentsSettings,
  useCreateDepartment,
  useDeleteDepartment,
  useProfessionalGradesSettings,
  useCreateProfessionalGrade,
  useToggleProfessionalGrade,
  useGeneralSpecialtiesSettings,
  useCreateGeneralSpecialty,
  useToggleGeneralSpecialty,
} from "@/hooks/useSettings"

/* ── Shared: pill chip with active/inactive toggle ─────────────────── */
function Chip({
  label,
  isActive,
  onToggle,
}: {
  label: string
  isActive: boolean
  onToggle: () => void
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12.5px] font-medium shadow-sm transition-all",
        isActive
          ? "border-border bg-background"
          : "border-dashed border-border/60 bg-muted/40 text-muted-foreground"
      )}
    >
      {!isActive && (
        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
      )}
      <span className={cn(!isActive && "opacity-60")}>{label}</span>
      <button
        type="button"
        onClick={onToggle}
        title={isActive ? "تعطيل" : "تفعيل"}
        className={cn(
          "rounded-full p-0.5 transition-colors",
          isActive
            ? "text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            : "text-primary/60 hover:bg-primary/10 hover:text-primary"
        )}
      >
        <Icon name={isActive ? "x" : "check"} size={11} />
      </button>
    </span>
  )
}

/* ── Shared: simple name-only dialog ──────────────────────────────── */
function AddNameDialog({
  open,
  onClose,
  title,
  label,
  placeholder,
  onSubmit,
  isPending,
}: {
  open: boolean
  onClose: () => void
  title: string
  label: string
  placeholder: string
  onSubmit: (name: string) => void
  isPending: boolean
}) {
  const [name, setName] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (!open) { setName(""); setError("") }
  }, [open])

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError(`${label} مطلوب`); return }
    onSubmit(name.trim())
  }

  return (
    <DDialog open={open} onClose={onClose} size="sm">
      <form onSubmit={submit}>
        <div className="border-b border-border p-5">
          <h2 className="text-[16px] font-semibold">{title}</h2>
        </div>
        <div className="space-y-4 p-5">
          {error && <p className="text-[13px] text-destructive">{error}</p>}
          <div className="space-y-1.5">
            <DLabel required>{label}</DLabel>
            <DInput
              placeholder={placeholder}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-border p-4">
          <Btn type="button" variant="outline" size="sm" onClick={onClose}>
            إلغاء
          </Btn>
          <Btn type="submit" size="sm" disabled={isPending}>
            {isPending ? "جاري الإضافة…" : "إضافة"}
          </Btn>
        </div>
      </form>
    </DDialog>
  )
}

/* ── Shared: simple flat-list tab (job titles / qual types) ────────── */
function SimpleListTab({
  data,
  isLoading,
  emptyMsg,
  headerDesc,
  addLabel,
  addTitle,
  addFieldLabel,
  addPlaceholder,
  onCreate,
  onDelete,
  isPending,
}: {
  data: { id: string; label: string }[]
  isLoading: boolean
  emptyMsg: string
  headerDesc: string
  addLabel: string
  addTitle: string
  addFieldLabel: string
  addPlaceholder: string
  onCreate: (name: string) => void
  onDelete: (id: string) => void
  isPending: boolean
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[13.5px] text-muted-foreground">{headerDesc}</p>
        <Btn size="sm" onClick={() => setOpen(true)}>
          <Icon name="plus" size={14} />
          {addLabel}
        </Btn>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-start">
          <thead>
            <tr>
              <Th>{addFieldLabel}</Th>
              <Th className="w-16"></Th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <Td colSpan={2} className="py-10 text-center text-muted-foreground">
                  جاري التحميل…
                </Td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <Td colSpan={2} className="py-10 text-center text-muted-foreground">
                  {emptyMsg}
                </Td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item.id}>
                  <Td>{item.label}</Td>
                  <Td>
                    <button
                      type="button"
                      onClick={() => onDelete(item.id)}
                      className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-destructive"
                    >
                      <Icon name="trash" size={14} />
                    </button>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AddNameDialog
        open={open}
        onClose={() => setOpen(false)}
        title={addTitle}
        label={addFieldLabel}
        placeholder={addPlaceholder}
        onSubmit={(name) => { onCreate(name); setOpen(false) }}
        isPending={isPending}
      />
    </>
  )
}

/* ── Job Titles Tab ────────────────────────────────────────────────── */
function JobTitlesTab() {
  const { data: titles = [], isLoading } = useJobTitlesSettings()
  const { mutate: create, isPending } = useCreateJobTitle()
  const { mutate: remove } = useDeleteJobTitle()
  return (
    <SimpleListTab
      data={titles.map((t) => ({ id: t.id, label: t.title }))}
      isLoading={isLoading}
      emptyMsg="لا توجد مسميات وظيفية بعد"
      headerDesc="المسميات الوظيفية المتاحة عند إنشاء الوظائف"
      addLabel="إضافة مسمى"
      addTitle="إضافة مسمى وظيفي"
      addFieldLabel="المسمى الوظيفي"
      addPlaceholder="مثال: مهندس برمجيات"
      onCreate={(name) => create({ title: name })}
      onDelete={(id) => remove(id)}
      isPending={isPending}
    />
  )
}

/* ── Qualification Types Tab ───────────────────────────────────────── */
function QualificationTypesTab() {
  const { data: types = [], isLoading } = useQualificationTypesSettings()
  const { mutate: create, isPending } = useCreateQualificationType()
  const { mutate: remove } = useDeleteQualificationType()
  return (
    <SimpleListTab
      data={types.map((t) => ({ id: t.id, label: t.name }))}
      isLoading={isLoading}
      emptyMsg="لا توجد أنواع مؤهلات بعد"
      headerDesc="أنواع المؤهلات الأكاديمية المتاحة في نماذج التقديم"
      addLabel="إضافة نوع"
      addTitle="إضافة نوع مؤهل"
      addFieldLabel="اسم نوع المؤهل"
      addPlaceholder="مثال: بكالوريوس"
      onCreate={(name) => create({ name })}
      onDelete={(id) => remove(id)}
      isPending={isPending}
    />
  )
}

/* ── Departments hierarchical tab ─────────────────────────────────── */
function DepartmentsTab() {
  const { data: departments = [], isLoading } = useDepartmentsSettings()
  const { data: allGrades = [] } = useProfessionalGradesSettings()
  const { data: allSpecialties = [] } = useGeneralSpecialtiesSettings()

  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [addDeptOpen, setAddDeptOpen] = useState(false)
  const [addGradeForDept, setAddGradeForDept] = useState<string | null>(null)
  const [addSpecialtyForDept, setAddSpecialtyForDept] = useState<string | null>(null)

  const { mutate: createDept, isPending: isDeptPending } = useCreateDepartment(() =>
    setAddDeptOpen(false)
  )
  const { mutate: removeDept } = useDeleteDepartment()
  const { mutate: createGrade, isPending: isGradePending } = useCreateProfessionalGrade(() =>
    setAddGradeForDept(null)
  )
  const { mutate: toggleGrade } = useToggleProfessionalGrade()
  const { mutate: createSpecialty, isPending: isSpecialtyPending } = useCreateGeneralSpecialty(() =>
    setAddSpecialtyForDept(null)
  )
  const { mutate: toggleSpecialty } = useToggleGeneralSpecialty()

  const gradesByDept = useMemo(() => {
    const map: Record<string, typeof allGrades> = {}
    for (const g of allGrades) {
      ;(map[g.departmentId] ??= []).push(g)
    }
    return map
  }, [allGrades])

  const specialtiesByDept = useMemo(() => {
    const map: Record<string, typeof allSpecialties> = {}
    for (const s of allSpecialties) {
      ;(map[s.departmentId] ??= []).push(s)
    }
    return map
  }, [allSpecialties])

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <>
      <div className="mb-5 flex items-center justify-between">
        <p className="text-[13.5px] text-muted-foreground">
          الأقسام مع الدرجات الوظيفية والتخصصات العامة المرتبطة بها
        </p>
        <Btn size="sm" onClick={() => setAddDeptOpen(true)}>
          <Icon name="plus" size={14} />
          إضافة قسم
        </Btn>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-muted-foreground text-[13.5px]">
          جاري التحميل…
        </div>
      ) : departments.length === 0 ? (
        <div className="py-14 text-center">
          <Icon name="building2" size={36} className="mx-auto mb-3 text-muted-foreground opacity-30" />
          <p className="text-[13.5px] text-muted-foreground">لا توجد أقسام بعد — ابدأ بإضافة قسم</p>
        </div>
      ) : (
        <div className="space-y-3">
          {departments.map((dept) => {
            const isOpen = expanded.has(dept.id)
            const grades = gradesByDept[dept.id] ?? []
            const specialties = specialtiesByDept[dept.id] ?? []

            return (
              <div
                key={dept.id}
                className="overflow-hidden rounded-xl border border-border transition-shadow hover:shadow-sm"
              >
                {/* ── Department header row ── */}
                <div
                  className="flex cursor-pointer items-center justify-between px-4 py-3.5 transition-colors hover:bg-accent/40"
                  onClick={() => toggleExpand(dept.id)}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      name={isOpen ? "chevDown" : "chevRight"}
                      size={14}
                      className="shrink-0 text-muted-foreground"
                    />
                    <span className="font-semibold text-[14px]">{dept.name}</span>
                    <span className="rounded-full border border-border bg-muted/50 px-2 py-0.5 text-[11.5px] text-muted-foreground">
                      {grades.length} درجة · {specialties.length} تخصص
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeDept(dept.id) }}
                    className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-destructive"
                    aria-label="حذف القسم"
                  >
                    <Icon name="trash" size={14} />
                  </button>
                </div>

                {/* ── Expanded body ── */}
                {isOpen && (
                  <div className="border-t border-border bg-muted/20 px-5 py-4 space-y-5">

                    {/* Professional Grades */}
                    <div>
                      <div className="mb-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Icon name="layers" size={13} className="text-muted-foreground" />
                          <span className="text-[12.5px] font-semibold text-muted-foreground tracking-wide">
                            الدرجات الوظيفية
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setAddGradeForDept(dept.id)}
                          className="flex items-center gap-1 rounded-md px-2 py-1 text-[12px] text-primary transition-colors hover:bg-primary/10"
                        >
                          <Icon name="plus" size={11} />
                          إضافة درجة
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2 min-h-[28px]">
                        {grades.length === 0 ? (
                          <span className="text-[12.5px] text-muted-foreground italic">
                            لا توجد درجات بعد
                          </span>
                        ) : (
                          grades.map((g) => (
                            <Chip
                              key={g.id}
                              label={g.name}
                              isActive={g.isActive}
                              onToggle={() => toggleGrade({ id: g.id, isActive: !g.isActive })}
                            />
                          ))
                        )}
                      </div>
                    </div>

                    <div className="border-t border-border/60" />

                    {/* General Specialties */}
                    <div>
                      <div className="mb-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Icon name="flask" size={13} className="text-muted-foreground" />
                          <span className="text-[12.5px] font-semibold text-muted-foreground tracking-wide">
                            التخصصات العامة
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setAddSpecialtyForDept(dept.id)}
                          className="flex items-center gap-1 rounded-md px-2 py-1 text-[12px] text-primary transition-colors hover:bg-primary/10"
                        >
                          <Icon name="plus" size={11} />
                          إضافة تخصص
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2 min-h-[28px]">
                        {specialties.length === 0 ? (
                          <span className="text-[12.5px] text-muted-foreground italic">
                            لا توجد تخصصات بعد
                          </span>
                        ) : (
                          specialties.map((s) => (
                            <Chip
                              key={s.id}
                              label={s.name}
                              isActive={s.isActive}
                              onToggle={() => toggleSpecialty({ id: s.id, isActive: !s.isActive })}
                            />
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Add Department */}
      <AddNameDialog
        open={addDeptOpen}
        onClose={() => setAddDeptOpen(false)}
        title="إضافة قسم"
        label="اسم القسم"
        placeholder="مثال: الموارد البشرية"
        onSubmit={(name) => createDept({ name })}
        isPending={isDeptPending}
      />

      {/* Add Professional Grade */}
      <AddNameDialog
        open={addGradeForDept !== null}
        onClose={() => setAddGradeForDept(null)}
        title="إضافة درجة وظيفية"
        label="اسم الدرجة الوظيفية"
        placeholder="مثال: مدير أول"
        onSubmit={(name) => createGrade({ name, departmentId: addGradeForDept! })}
        isPending={isGradePending}
      />

      {/* Add General Specialty */}
      <AddNameDialog
        open={addSpecialtyForDept !== null}
        onClose={() => setAddSpecialtyForDept(null)}
        title="إضافة تخصص عام"
        label="اسم التخصص"
        placeholder="مثال: هندسة البرمجيات"
        onSubmit={(name) => createSpecialty({ name, departmentId: addSpecialtyForDept! })}
        isPending={isSpecialtyPending}
      />
    </>
  )
}

/* ── Main Page ─────────────────────────────────────────────────────── */
export function SettingsPage() {
  const { user } = useApp()
  const isSuperAdmin = user?.role === "super_admin"

  return (
    <div>
      <PageHeader
        icon="settings"
        title="الإعدادات"
        desc="إدارة المسميات الوظيفية وأنواع المؤهلات والأقسام والدرجات والتخصصات"
      />

      <Tabs defaultValue="job-titles" dir="rtl">
        <TabsList className="mb-6 h-auto w-full justify-start gap-1 rounded-xl border border-border bg-card p-1.5">
          {isSuperAdmin && (
            <TabsTrigger
              value="job-titles"
              className="gap-1.5 rounded-lg px-4 py-2 text-[13.5px]"
            >
              <Icon name="list" size={14} />
              المسميات الوظيفية
            </TabsTrigger>
          )}
          {isSuperAdmin && (
            <TabsTrigger
              value="qual-types"
              className="gap-1.5 rounded-lg px-4 py-2 text-[13.5px]"
            >
              <Icon name="bold" size={14} />
              أنواع المؤهلات
            </TabsTrigger>
          )}
          {isSuperAdmin && (
            <TabsTrigger
              value="departments"
              className="gap-1.5 rounded-lg px-4 py-2 text-[13.5px]"
            >
              <Icon name="building2" size={14} />
              الأقسام والتخصصات
            </TabsTrigger>
          )}
        </TabsList>

        <div className="card-shadow rounded-xl border border-border bg-card p-5">
          {isSuperAdmin && (
            <TabsContent value="job-titles">
              <JobTitlesTab />
            </TabsContent>
          )}
          {isSuperAdmin && (
            <TabsContent value="qual-types">
              <QualificationTypesTab />
            </TabsContent>
          )}
          {isSuperAdmin && (
            <TabsContent value="departments">
              <DepartmentsTab />
            </TabsContent>
          )}
        </div>
      </Tabs>
    </div>
  )
}
