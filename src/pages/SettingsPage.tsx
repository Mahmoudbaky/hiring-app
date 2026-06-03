import { useState } from "react"
import { useApp } from "@/context/AppContext"
import { PageHeader, Btn, DInput, DLabel, Th, Td } from "@/components/shell"
import { DDialog } from "@/components/ui/ddialog"
import { DSwitch } from "@/components/ui/dswitch"
import { Icon } from "@/components/icons"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  useJobTitlesSettings,
  useCreateJobTitle,
  useToggleJobTitle,
  useDeleteJobTitle,
  useQualificationTypesSettings,
  useCreateQualificationType,
  useToggleQualificationType,
  useDeleteQualificationType,
} from "@/hooks/useSettings"

/* ── Job Titles Tab ────────────────────────────────────────────────── */
function JobTitlesTab() {
  const { data: titles = [], isLoading } = useJobTitlesSettings()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [error, setError] = useState("")
  const { mutate: create, isPending } = useCreateJobTitle(() => {
    setOpen(false)
    setTitle("")
    setError("")
  })
  const { mutate: toggle } = useToggleJobTitle()
  const { mutate: remove } = useDeleteJobTitle()

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) {
      setError("المسمى الوظيفي مطلوب")
      return
    }
    create({ title: title.trim() })
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[13.5px] text-[var(--muted-foreground)]">
          المسميات الوظيفية المتاحة عند إنشاء الوظائف
        </p>
        <Btn
          size="sm"
          onClick={() => {
            setTitle("")
            setError("")
            setOpen(true)
          }}
        >
          <Icon name="plus" size={14} />
          إضافة مسمى
        </Btn>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-start">
          <thead>
            <tr>
              <Th>المسمى الوظيفي</Th>
              <Th className="w-28">مفعّل</Th>
              <Th className="w-16"></Th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <Td
                  colSpan={3}
                  className="py-10 text-center text-[var(--muted-foreground)]"
                >
                  جاري التحميل…
                </Td>
              </tr>
            ) : titles.length === 0 ? (
              <tr>
                <Td
                  colSpan={3}
                  className="py-10 text-center text-[var(--muted-foreground)]"
                >
                  لا توجد مسميات وظيفية بعد
                </Td>
              </tr>
            ) : (
              titles.map((t) => (
                <tr key={t.id}>
                  <Td
                    className={
                      t.isActive
                        ? ""
                        : "text-[var(--muted-foreground)] line-through"
                    }
                  >
                    {t.title}
                  </Td>
                  <Td>
                    <DSwitch
                      on={t.isActive}
                      onChange={(v) => toggle({ id: t.id, isActive: v })}
                    />
                  </Td>
                  <Td>
                    <button
                      type="button"
                      onClick={() => remove(t.id)}
                      className="rounded p-1.5 text-[var(--muted-foreground)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--destructive)]"
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

      <DDialog open={open} onClose={() => setOpen(false)} size="sm">
        <form onSubmit={submit}>
          <div className="border-b border-border p-5">
            <h2 className="text-[16px] font-semibold">إضافة مسمى وظيفي</h2>
          </div>
          <div className="space-y-4 p-5">
            {error && (
              <p className="text-[13px] text-[var(--destructive)]">{error}</p>
            )}
            <div className="space-y-1.5">
              <DLabel required>المسمى الوظيفي</DLabel>
              <DInput
                placeholder="مثال: مهندس برمجيات"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t border-border p-4">
            <Btn
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
            >
              إلغاء
            </Btn>
            <Btn type="submit" size="sm" disabled={isPending}>
              {isPending ? "جاري الإضافة…" : "إضافة"}
            </Btn>
          </div>
        </form>
      </DDialog>
    </>
  )
}

/* ── Qualification Types Tab ───────────────────────────────────────── */
function QualificationTypesTab() {
  const { data: types = [], isLoading } = useQualificationTypesSettings()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const { mutate: create, isPending } = useCreateQualificationType(() => {
    setOpen(false)
    setName("")
    setError("")
  })
  const { mutate: toggle } = useToggleQualificationType()
  const { mutate: remove } = useDeleteQualificationType()

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError("اسم نوع المؤهل مطلوب")
      return
    }
    create({ name: name.trim() })
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[13.5px] text-[var(--muted-foreground)]">
          أنواع المؤهلات الأكاديمية المتاحة في نماذج التقديم
        </p>
        <Btn
          size="sm"
          onClick={() => {
            setName("")
            setError("")
            setOpen(true)
          }}
        >
          <Icon name="plus" size={14} />
          إضافة نوع
        </Btn>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-start">
          <thead>
            <tr>
              <Th>نوع المؤهل</Th>
              <Th className="w-28">مفعّل</Th>
              <Th className="w-16"></Th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <Td
                  colSpan={3}
                  className="py-10 text-center text-[var(--muted-foreground)]"
                >
                  جاري التحميل…
                </Td>
              </tr>
            ) : types.length === 0 ? (
              <tr>
                <Td
                  colSpan={3}
                  className="py-10 text-center text-[var(--muted-foreground)]"
                >
                  لا توجد أنواع مؤهلات بعد
                </Td>
              </tr>
            ) : (
              types.map((t) => (
                <tr key={t.id}>
                  <Td
                    className={
                      t.isActive
                        ? ""
                        : "text-[var(--muted-foreground)] line-through"
                    }
                  >
                    {t.name}
                  </Td>
                  <Td>
                    <DSwitch
                      on={t.isActive}
                      onChange={(v) => toggle({ id: t.id, isActive: v })}
                    />
                  </Td>
                  <Td>
                    <button
                      type="button"
                      onClick={() => remove(t.id)}
                      className="rounded p-1.5 text-[var(--muted-foreground)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--destructive)]"
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

      <DDialog open={open} onClose={() => setOpen(false)} size="sm">
        <form onSubmit={submit}>
          <div className="border-b border-border p-5">
            <h2 className="text-[16px] font-semibold">إضافة نوع مؤهل</h2>
          </div>
          <div className="space-y-4 p-5">
            {error && (
              <p className="text-[13px] text-[var(--destructive)]">{error}</p>
            )}
            <div className="space-y-1.5">
              <DLabel required>اسم نوع المؤهل</DLabel>
              <DInput
                placeholder="مثال: بكالوريوس"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t border-border p-4">
            <Btn
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
            >
              إلغاء
            </Btn>
            <Btn type="submit" size="sm" disabled={isPending}>
              {isPending ? "جاري الإضافة…" : "إضافة"}
            </Btn>
          </div>
        </form>
      </DDialog>
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
        desc="إدارة المسميات الوظيفية وأنواع المؤهلات"
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
        </div>
      </Tabs>
    </div>
  )
}
