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
  useFreezeUser,
  useDeleteUser,
  useJobTitlesSettings,
  useCreateJobTitle,
  useToggleJobTitle,
  useDeleteJobTitle,
  useQualificationTypesSettings,
  useCreateQualificationType,
  useToggleQualificationType,
  useDeleteQualificationType,
} from "@/hooks/useSettings"
import type { CompanyUser } from "@/types/api"

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

      <div className="overflow-hidden rounded-xl border border-border">
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
          <div className="border-b border-border p-5">
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
  const { mutate: freeze, isPending: isFreezing } = useFreezeUser()
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser()

  // ── filters
  const [search, setSearch] = useState("")
  const [companyFilter, setCompanyFilter] = useState("")

  // ── pagination
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // ── create dialog
  const emptyForm = {
    name: "",
    email: "",
    password: "",
    dialCode: "+966",
    phoneNumber: "",
    hiringCompanyId: isSuperAdmin ? "" : (me?.hiringCompanyId ?? ""),
  }
  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState("")
  const { mutate: create, isPending: isCreating } = useCreateUser(() => {
    setCreateOpen(false)
    setForm(emptyForm)
    setFormError("")
  })

  // ── details dialog
  const [detailUser, setDetailUser] = useState<CompanyUser | null>(null)

  // ── delete confirm dialog
  const [deleteTarget, setDeleteTarget] = useState<CompanyUser | null>(null)

  function openCreate() {
    setForm(emptyForm)
    setFormError("")
    setCreateOpen(true)
  }

  function submitCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { setFormError("الاسم مطلوب"); return }
    if (!form.email.trim()) { setFormError("البريد الإلكتروني مطلوب"); return }
    if (form.password.length < 8) { setFormError("كلمة المرور يجب أن تكون 8 أحرف على الأقل"); return }
    create({
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      phoneNumber: form.phoneNumber ? `${form.dialCode}${form.phoneNumber}` : undefined,
      hiringCompanyId: form.hiringCompanyId || undefined,
    })
  }

  const companyOptions = companies.map((c) => ({ value: c.id, label: c.companyName }))

  const resolveCompanyName = (hiringCompanyId: string | null) => {
    if (!hiringCompanyId) return "—"
    const found = companies.find((c) => c.id === hiringCompanyId)
    if (found) return found.companyName
    if (hiringCompanyId === me?.hiringCompanyId) return me?.companyName ?? "—"
    return "—"
  }

  const roleLabel = (role: string) =>
    role === "super_admin" ? "مشرف عام" : "مستخدم شركة"

  // ── client-side filtering + pagination
  const q = search.trim().toLowerCase()
  const filtered = users.filter((u) => {
    const matchSearch =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.phoneNumber ?? "").toLowerCase().includes(q)
    const matchCompany = !companyFilter || u.hiringCompanyId === companyFilter
    return matchSearch && matchCompany
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * pageSize
  const paginated = filtered.slice(start, start + pageSize)

  const COL_COUNT = isSuperAdmin ? 6 : 5

  const pageSizeOptions = [
    { value: "5",  label: "5 صفوف" },
    { value: "10", label: "10 صفوف" },
    { value: "20", label: "20 صفوف" },
    { value: "50", label: "50 صفوف" },
  ]

  return (
    <>
      {/* ── toolbar ── */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <span className="pointer-events-none absolute inset-y-0 inset-e-3 flex items-center text-muted-foreground">
            <Icon name="search" size={14} />
          </span>
          <DInput
            placeholder="بحث بالاسم أو البريد أو الهاتف…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="pe-9"
          />
        </div>
        {isSuperAdmin && (
          <div className="w-[200px]">
            <DSelect
              value={companyFilter}
              onChange={(v) => { setCompanyFilter(String(v)); setPage(1) }}
              options={[{ value: "", label: "كل الشركات" }, ...companyOptions]}
              placeholder="كل الشركات"
            />
          </div>
        )}
        <Btn size="sm" onClick={openCreate}>
          <Icon name="userPlus" size={14} />
          إنشاء مستخدم
        </Btn>
      </div>

      {/* ── table ── */}
      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-start">
          <thead>
            <tr>
              <Th>الاسم</Th>
              <Th>البريد الإلكتروني</Th>
              <Th>رقم الهاتف</Th>
              <Th>الدور</Th>
              {isSuperAdmin && <Th>الشركة</Th>}
              <Th className="w-[100px]">إجراءات</Th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <Td colSpan={COL_COUNT} className="py-10 text-center text-muted-foreground">
                  جاري التحميل…
                </Td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <Td colSpan={COL_COUNT} className="py-10 text-center text-muted-foreground">
                  لا يوجد مستخدمون
                </Td>
              </tr>
            ) : (
              paginated.map((u) => (
                <tr key={u.id} className={u.isFrozen ? "opacity-50" : ""}>
                  <Td className="font-medium">
                    <span>{u.name}</span>
                    {u.isFrozen && (
                      <span className="ms-2 inline-flex items-center rounded-full bg-orange-100 px-1.5 py-0.5 text-[11px] font-medium text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                        مجمّد
                      </span>
                    )}
                  </Td>
                  <Td className="text-muted-foreground">{u.email}</Td>
                  <Td className="text-muted-foreground">
                    <span dir="ltr">{u.phoneNumber ?? "—"}</span>
                  </Td>
                  <Td>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[12px] font-medium ${u.role === "super_admin" ? "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400" : "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400"}`}
                    >
                      {roleLabel(u.role)}
                    </span>
                  </Td>
                  {isSuperAdmin && <Td>{resolveCompanyName(u.hiringCompanyId)}</Td>}
                  <Td>
                    <div className="flex items-center gap-1">
                      {/* view details */}
                      <button
                        onClick={() => setDetailUser(u)}
                        className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        title="عرض التفاصيل"
                      >
                        <Icon name="eye" size={14} />
                      </button>
                      {/* freeze / unfreeze — super admin only */}
                      {isSuperAdmin && u.id !== me?.id && (
                        <button
                          onClick={() => freeze({ id: u.id, isFrozen: !u.isFrozen })}
                          disabled={isFreezing}
                          className={`rounded p-1.5 transition-colors ${u.isFrozen ? "text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20" : "text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20"}`}
                          title={u.isFrozen ? "إلغاء التجميد" : "تجميد الحساب"}
                        >
                          <Icon name={u.isFrozen ? "check" : "ban"} size={14} />
                        </button>
                      )}
                      {/* delete — super admin only, can't delete self */}
                      {isSuperAdmin && u.id !== me?.id && (
                        <button
                          onClick={() => setDeleteTarget(u)}
                          className="rounded p-1.5 text-destructive hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="حذف المستخدم"
                        >
                          <Icon name="trash" size={14} />
                        </button>
                      )}
                    </div>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── pagination footer ── */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-[13px] text-muted-foreground">
        <span>
          عرض {filtered.length === 0 ? 0 : start + 1}–{Math.min(start + pageSize, filtered.length)} من {filtered.length} مستخدم
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[12px]">صفوف في الصفحة:</span>
          <DSelect
            value={String(pageSize)}
            onChange={(v) => { setPageSize(Number(v)); setPage(1) }}
            options={pageSizeOptions}
            placeholder=""
          />
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="rounded p-1.5 hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="الصفحة السابقة"
            >
              <Icon name="chevRight" size={14} />
            </button>
            <span className="min-w-[60px] text-center text-[12px]">
              {safePage} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="rounded p-1.5 hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="الصفحة التالية"
            >
              <Icon name="chevLeft" size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ── create user dialog ── */}
      <DDialog open={createOpen} onClose={() => setCreateOpen(false)} size="md">
        <form onSubmit={submitCreate}>
          <div className="border-b border-border p-5">
            <h2 className="text-[16px] font-semibold">إنشاء مستخدم جديد</h2>
          </div>
          <div className="space-y-4 p-5">
            {formError && (
              <p className="text-[13px] text-destructive">{formError}</p>
            )}
            <div className="space-y-1.5">
              <DLabel required>الاسم الكامل</DLabel>
              <DInput
                placeholder="مثال: أحمد محمد"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <DLabel required>البريد الإلكتروني</DLabel>
              <DInput
                type="email"
                placeholder="user@example.com"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <DLabel required>كلمة المرور</DLabel>
              <DInput
                type="password"
                placeholder="8 أحرف على الأقل"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
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
                  onChange={(v) => setForm((f) => ({ ...f, hiringCompanyId: String(v) }))}
                  options={companyOptions}
                  placeholder="اختر شركة (اختياري)"
                />
              ) : (
                <DInput value={me?.companyName ?? ""} disabled className="opacity-60" />
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t border-border p-4">
            <Btn type="button" variant="outline" size="sm" onClick={() => setCreateOpen(false)}>
              إلغاء
            </Btn>
            <Btn type="submit" size="sm" disabled={isCreating}>
              {isCreating ? "جاري الإنشاء…" : "إنشاء المستخدم"}
            </Btn>
          </div>
        </form>
      </DDialog>

      {/* ── user details dialog ── */}
      <DDialog open={!!detailUser} onClose={() => setDetailUser(null)} size="sm">
        {detailUser && (
          <>
            <div className="border-b border-border p-5">
              <h2 className="text-[16px] font-semibold">تفاصيل المستخدم</h2>
            </div>
            <div className="space-y-4 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted text-[18px] font-bold text-muted-foreground">
                  {detailUser.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold">{detailUser.name}</p>
                  <p className="text-[13px] text-muted-foreground">{detailUser.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 rounded-xl border border-border p-4 text-[13px]">
                <div>
                  <p className="mb-0.5 text-[11px] text-muted-foreground">رقم الهاتف</p>
                  <p dir="ltr" className="font-medium">{detailUser.phoneNumber ?? "—"}</p>
                </div>
                <div>
                  <p className="mb-0.5 text-[11px] text-muted-foreground">الدور</p>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[12px] font-medium ${detailUser.role === "super_admin" ? "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400" : "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400"}`}>
                    {roleLabel(detailUser.role)}
                  </span>
                </div>
                <div>
                  <p className="mb-0.5 text-[11px] text-muted-foreground">الشركة</p>
                  <p className="font-medium">{resolveCompanyName(detailUser.hiringCompanyId)}</p>
                </div>
                <div>
                  <p className="mb-0.5 text-[11px] text-muted-foreground">الحالة</p>
                  {detailUser.isFrozen ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-[12px] font-medium text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                      <Icon name="ban" size={11} /> مجمّد
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[12px] font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      <Icon name="check" size={11} /> نشط
                    </span>
                  )}
                </div>
                <div className="col-span-2">
                  <p className="mb-0.5 text-[11px] text-muted-foreground">تاريخ الإنشاء</p>
                  <p className="font-medium">
                    {new Date(detailUser.createdAt).toLocaleDateString("ar-SA", {
                      year: "numeric", month: "long", day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end border-t border-border p-4">
              <Btn variant="outline" size="sm" onClick={() => setDetailUser(null)}>
                إغلاق
              </Btn>
            </div>
          </>
        )}
      </DDialog>

      {/* ── delete confirm dialog ── */}
      <DDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} size="sm">
        {deleteTarget && (
          <>
            <div className="border-b border-border p-5">
              <h2 className="text-[16px] font-semibold">تأكيد الحذف</h2>
            </div>
            <div className="p-5 text-[14px]">
              هل أنت متأكد من حذف المستخدم{" "}
              <span className="font-semibold">{deleteTarget.name}</span>؟ لا يمكن
              التراجع عن هذا الإجراء.
            </div>
            <div className="flex justify-end gap-2 border-t border-border p-4">
              <Btn variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>
                إلغاء
              </Btn>
              <Btn
                size="sm"
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={isDeleting}
                onClick={() => deleteUser(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })}
              >
                {isDeleting ? "جاري الحذف…" : "حذف"}
              </Btn>
            </div>
          </>
        )}
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
        desc="إدارة الشركات والمستخدمين وبيانات النظام"
      />

      <Tabs defaultValue={isSuperAdmin ? "companies" : "users"} dir="rtl">
        <TabsList className="mb-6 h-auto w-full justify-start gap-1 rounded-xl border border-border bg-card p-1.5">
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

        <div className="card-shadow rounded-xl border border-border bg-card p-5">
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
