import { useState } from "react"
import { useApp } from "@/context/AppContext"
import { PageHeader, Btn, DInput, DLabel, Th, Td } from "@/components/shell"
import { DSelect } from "@/components/ui/dselect"
import { PhoneInput } from "@/components/ui/phone-input"
import { DDialog } from "@/components/ui/ddialog"
import { DSwitch } from "@/components/ui/dswitch"
import { Icon } from "@/components/icons"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  useCompanies,
  useCreateCompany,
  useUsers,
  useCreateUser,
  useJobTitlesSettings,
  useCreateJobTitle,
  useToggleJobTitle,
  useDeleteJobTitle,
  useQualificationTypesSettings,
  useCreateQualificationType,
  useToggleQualificationType,
  useDeleteQualificationType,
} from "@/hooks/useSettings"

function generateCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

/* ── Companies Tab ─────────────────────────────────────────────────── */
function CompaniesTab() {
  const { data: companies = [], isLoading } = useCompanies()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    companyName: "",
    uniqueCode: generateCode(),
    phoneNumber: "",
    address: "",
    managerName: "",
  })
  const [error, setError] = useState("")
  const { mutate: create, isPending } = useCreateCompany(() => {
    setOpen(false)
    setForm({
      companyName: "",
      uniqueCode: generateCode(),
      phoneNumber: "",
      address: "",
      managerName: "",
    })
    setError("")
  })

  function openDialog() {
    setForm((f) => ({ ...f, uniqueCode: generateCode() }))
    setError("")
    setOpen(true)
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.companyName.trim()) {
      setError("اسم الشركة مطلوب")
      return
    }
    create({
      companyName: form.companyName.trim(),
      uniqueCode: form.uniqueCode,
      phoneNumber: form.phoneNumber || undefined,
      address: form.address || undefined,
      managerName: form.managerName || undefined,
    })
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[13.5px] text-[var(--muted-foreground)]">
          إدارة شركات التوظيف وأكوادها الفريدة
        </p>
        <Btn size="sm" onClick={openDialog}>
          <Icon name="plus" size={14} />
          إنشاء شركة
        </Btn>
      </div>

      <div className="overflow-hidden rounded-xl border border-[var(--border)]">
        <table className="w-full text-start">
          <thead>
            <tr>
              <Th>اسم الشركة</Th>
              <Th>الكود الفريد</Th>
              <Th>المدير</Th>
              <Th>الهاتف</Th>
              <Th>الحالة</Th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <Td
                  colSpan={5}
                  className="py-10 text-center text-[var(--muted-foreground)]"
                >
                  جاري التحميل…
                </Td>
              </tr>
            ) : companies.length === 0 ? (
              <tr>
                <Td
                  colSpan={5}
                  className="py-10 text-center text-[var(--muted-foreground)]"
                >
                  لا توجد شركات بعد
                </Td>
              </tr>
            ) : (
              companies.map((c) => (
                <tr key={c.id}>
                  <Td className="font-medium">{c.companyName}</Td>
                  <Td>
                    <span className="inline-flex items-center gap-1.5 rounded bg-[var(--muted)]/60 px-2 py-0.5 font-mono text-[13px]">
                      {c.uniqueCode}
                      <button
                        type="button"
                        onClick={() =>
                          navigator.clipboard.writeText(c.uniqueCode)
                        }
                        className="text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
                      >
                        <Icon name="link" size={12} />
                      </button>
                    </span>
                  </Td>
                  <Td>{c.managerName ?? "—"}</Td>
                  <Td>{c.phoneNumber ?? "—"}</Td>
                  <Td>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-medium ${c.isActive ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-[var(--muted)] text-[var(--muted-foreground)]"}`}
                    >
                      {c.isActive ? "نشطة" : "غير نشطة"}
                    </span>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <DDialog open={open} onClose={() => setOpen(false)} size="md">
        <form onSubmit={submit}>
          <div className="border-b border-[var(--border)] p-5">
            <h2 className="text-[16px] font-semibold">إنشاء شركة توظيف</h2>
          </div>
          <div className="space-y-4 p-5">
            {error && (
              <p className="text-[13px] text-[var(--destructive)]">{error}</p>
            )}
            <div className="space-y-1.5">
              <DLabel required>اسم الشركة</DLabel>
              <DInput
                placeholder="مثال: شركة النجم للتوظيف"
                value={form.companyName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, companyName: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <DLabel required>الكود الفريد</DLabel>
              <div className="flex gap-2">
                <DInput
                  className="font-mono"
                  value={form.uniqueCode}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      uniqueCode: e.target.value.toUpperCase(),
                    }))
                  }
                  maxLength={50}
                />
                <Btn
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setForm((f) => ({ ...f, uniqueCode: generateCode() }))
                  }
                  className="shrink-0"
                >
                  <Icon name="undo" size={14} />
                </Btn>
              </div>
              <p className="text-[12px] text-[var(--muted-foreground)]">
                يُستخدم لربط طلبات التوظيف بهذه الشركة
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <DLabel>اسم المدير</DLabel>
                <DInput
                  placeholder="اختياري"
                  value={form.managerName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, managerName: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <DLabel>رقم الهاتف</DLabel>
                <DInput
                  placeholder="اختياري"
                  value={form.phoneNumber}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phoneNumber: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <DLabel>العنوان</DLabel>
              <DInput
                placeholder="اختياري"
                value={form.address}
                onChange={(e) =>
                  setForm((f) => ({ ...f, address: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t border-[var(--border)] p-4">
            <Btn
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
            >
              إلغاء
            </Btn>
            <Btn type="submit" size="sm" disabled={isPending}>
              {isPending ? "جاري الإنشاء…" : "إنشاء الشركة"}
            </Btn>
          </div>
        </form>
      </DDialog>
    </>
  )
}

/* ── Users Tab ─────────────────────────────────────────────────────── */
function UsersTab() {
  const { user: me } = useApp()
  const isSuperAdmin = me?.role === "super_admin"

  const { data: users = [], isLoading } = useUsers()
  const { data: companies = [] } = useCompanies()

  const emptyForm = {
    name: "",
    email: "",
    password: "",
    dialCode: "+966",
    phoneNumber: "",
    hiringCompanyId: isSuperAdmin ? "" : (me?.hiringCompanyId ?? ""),
  }
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState("")
  const { mutate: create, isPending } = useCreateUser(() => {
    setOpen(false)
    setForm(emptyForm)
    setError("")
  })

  function openDialog() {
    setForm(emptyForm)
    setError("")
    setOpen(true)
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) {
      setError("الاسم مطلوب")
      return
    }
    if (!form.email.trim()) {
      setError("البريد الإلكتروني مطلوب")
      return
    }
    if (form.password.length < 8) {
      setError("كلمة المرور يجب أن تكون 8 أحرف على الأقل")
      return
    }
    create({
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      phoneNumber: form.phoneNumber ? `${form.dialCode}${form.phoneNumber}` : undefined,
      hiringCompanyId: form.hiringCompanyId || undefined,
    })
  }

  const companyOptions = companies.map((c) => ({
    value: c.id,
    label: c.companyName,
  }))

  const resolveCompanyName = (hiringCompanyId: string | null) => {
    if (!hiringCompanyId) return "—"
    const found = companies.find((c) => c.id === hiringCompanyId)
    if (found) return found.companyName
    // for company_user the companies list is empty — use own company name
    if (hiringCompanyId === me?.hiringCompanyId) return me?.companyName ?? "—"
    return "—"
  }

  const roleLabel = (role: string) =>
    role === "super_admin" ? "مشرف عام" : "مستخدم شركة"

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[13.5px] text-muted-foreground">
          إدارة مستخدمي النظام وربطهم بالشركات
        </p>
        <Btn size="sm" onClick={openDialog}>
          <Icon name="userPlus" size={14} />
          إنشاء مستخدم
        </Btn>
      </div>

      <div className="overflow-hidden rounded-xl border border-[var(--border)]">
        <table className="w-full text-start">
          <thead>
            <tr>
              <Th>الاسم</Th>
              <Th>البريد الإلكتروني</Th>
              <Th>الدور</Th>
              <Th>الشركة</Th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <Td
                  colSpan={4}
                  className="py-10 text-center text-[var(--muted-foreground)]"
                >
                  جاري التحميل…
                </Td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <Td
                  colSpan={4}
                  className="py-10 text-center text-[var(--muted-foreground)]"
                >
                  لا يوجد مستخدمون بعد
                </Td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id}>
                  <Td className="font-medium">{u.name}</Td>
                  <Td className="text-muted-foreground">{u.email}</Td>
                  <Td>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[12px] font-medium ${u.role === "super_admin" ? "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400" : "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400"}`}
                    >
                      {roleLabel(u.role)}
                    </span>
                  </Td>
                  <Td>{resolveCompanyName(u.hiringCompanyId)}</Td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <DDialog open={open} onClose={() => setOpen(false)} size="md">
        <form onSubmit={submit}>
          <div className="border-b border-[var(--border)] p-5">
            <h2 className="text-[16px] font-semibold">إنشاء مستخدم جديد</h2>
          </div>
          <div className="space-y-4 p-5">
            {error && (
              <p className="text-[13px] text-[var(--destructive)]">{error}</p>
            )}
            <div className="space-y-1.5">
              <DLabel required>الاسم الكامل</DLabel>
              <DInput
                placeholder="مثال: أحمد محمد"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <DLabel required>البريد الإلكتروني</DLabel>
              <DInput
                type="email"
                placeholder="user@example.com"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <DLabel required>كلمة المرور</DLabel>
              <DInput
                type="password"
                placeholder="8 أحرف على الأقل"
                value={form.password}
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <DLabel>رقم الهاتف</DLabel>
              <PhoneInput
                dialCode={form.dialCode}
                onDialCodeChange={(v) => setForm((f) => ({ ...f, dialCode: v }))}
                number={form.phoneNumber}
                onNumberChange={(v) => setForm((f) => ({ ...f, phoneNumber: v }))}
              />
            </div>
            <div className="space-y-1.5">
              <DLabel>الشركة</DLabel>
              {isSuperAdmin ? (
                <DSelect
                  value={form.hiringCompanyId}
                  onChange={(v) =>
                    setForm((f) => ({ ...f, hiringCompanyId: String(v) }))
                  }
                  options={companyOptions}
                  placeholder="اختر شركة (اختياري)"
                />
              ) : (
                <DInput
                  value={me?.companyName ?? ""}
                  disabled
                  className="opacity-60"
                />
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t border-[var(--border)] p-4">
            <Btn
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
            >
              إلغاء
            </Btn>
            <Btn type="submit" size="sm" disabled={isPending}>
              {isPending ? "جاري الإنشاء…" : "إنشاء المستخدم"}
            </Btn>
          </div>
        </form>
      </DDialog>
    </>
  )
}

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

      <div className="overflow-hidden rounded-xl border border-[var(--border)]">
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
          <div className="border-b border-[var(--border)] p-5">
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
          <div className="flex justify-end gap-2 border-t border-[var(--border)] p-4">
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

      <div className="overflow-hidden rounded-xl border border-[var(--border)]">
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
          <div className="border-b border-[var(--border)] p-5">
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
          <div className="flex justify-end gap-2 border-t border-[var(--border)] p-4">
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
        desc="إدارة الشركات والمستخدمين وبيانات النظام"
      />

      <Tabs defaultValue={isSuperAdmin ? "companies" : "users"} dir="rtl">
        <TabsList className="mb-6 h-auto w-full justify-start gap-1 rounded-xl border border-[var(--border)] bg-[var(--card)] p-1.5">
          {isSuperAdmin && (
            <TabsTrigger
              value="companies"
              className="gap-1.5 rounded-lg px-4 py-2 text-[13.5px]"
            >
              <Icon name="briefcase" size={14} />
              الشركات
            </TabsTrigger>
          )}
          <TabsTrigger
            value="users"
            className="gap-1.5 rounded-lg px-4 py-2 text-[13.5px]"
          >
            <Icon name="users" size={14} />
            المستخدمون
          </TabsTrigger>
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

        <div className="card-shadow rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
          {isSuperAdmin && (
            <TabsContent value="companies">
              <CompaniesTab />
            </TabsContent>
          )}
          <TabsContent value="users">
            <UsersTab />
          </TabsContent>
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
