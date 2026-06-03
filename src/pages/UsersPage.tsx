import { useState } from "react"
import { useApp } from "@/context/AppContext"
import { PageHeader, Btn, DInput, DLabel, Th, Td } from "@/components/shell"
import { DSelect } from "@/components/ui/dselect"
import { PhoneInput } from "@/components/ui/phone-input"
import { DDialog } from "@/components/ui/ddialog"
import { Icon } from "@/components/icons"
import {
  useCompanies,
  useUsers,
  useCreateUser,
  useFreezeUser,
  useDeleteUser,
} from "@/hooks/useSettings"
import type { CompanyUser } from "@/types/api"

export function UsersPage() {
  const { user: me } = useApp()
  const isSuperAdmin = me?.role === "super_admin"

  const { data: users = [], isLoading } = useUsers()
  const { data: companies = [] } = useCompanies()
  const { mutate: freeze, isPending: isFreezing } = useFreezeUser()
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser()

  const [search, setSearch] = useState("")
  const [companyFilter, setCompanyFilter] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

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

  const [detailUser, setDetailUser] = useState<CompanyUser | null>(null)
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
      phoneNumber: form.phoneNumber
        ? `${form.dialCode}${form.phoneNumber}`
        : undefined,
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
    if (hiringCompanyId === me?.hiringCompanyId) return me?.companyName ?? "—"
    return "—"
  }

  const roleLabel = (role: string) =>
    role === "super_admin" ? "مشرف عام" : "مستخدم شركة"

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
    { value: "5", label: "5 صفوف" },
    { value: "10", label: "10 صفوف" },
    { value: "20", label: "20 صفوف" },
    { value: "50", label: "50 صفوف" },
  ]

  return (
    <div>
      <PageHeader
        icon="users"
        title="المستخدمون"
        desc="إدارة حسابات المستخدمين في المنصة"
      />

      <div className="card-shadow rounded-xl border border-border bg-card p-5">
        {/* toolbar */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="relative min-w-[200px] flex-1">
            <span className="pointer-events-none absolute inset-y-0 inset-e-3 flex items-center text-muted-foreground">
              <Icon name="search" size={14} />
            </span>
            <DInput
              placeholder="بحث بالاسم أو البريد أو الهاتف…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="pe-9"
            />
          </div>
          {isSuperAdmin && (
            <div className="w-[200px]">
              <DSelect
                value={companyFilter}
                onChange={(v) => {
                  setCompanyFilter(String(v))
                  setPage(1)
                }}
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

        {/* table */}
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
                  <Td
                    colSpan={COL_COUNT}
                    className="py-10 text-center text-muted-foreground"
                  >
                    جاري التحميل…
                  </Td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <Td
                    colSpan={COL_COUNT}
                    className="py-10 text-center text-muted-foreground"
                  >
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
                    {isSuperAdmin && (
                      <Td>{resolveCompanyName(u.hiringCompanyId)}</Td>
                    )}
                    <Td>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setDetailUser(u)}
                          className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          title="عرض التفاصيل"
                        >
                          <Icon name="eye" size={14} />
                        </button>
                        {isSuperAdmin && u.id !== me?.id && (
                          <button
                            onClick={() =>
                              freeze({ id: u.id, isFrozen: !u.isFrozen })
                            }
                            disabled={isFreezing}
                            className={`rounded p-1.5 transition-colors ${u.isFrozen ? "text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20" : "text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20"}`}
                            title={u.isFrozen ? "إلغاء التجميد" : "تجميد الحساب"}
                          >
                            <Icon
                              name={u.isFrozen ? "check" : "ban"}
                              size={14}
                            />
                          </button>
                        )}
                        {isSuperAdmin && u.id !== me?.id && (
                          <button
                            onClick={() => setDeleteTarget(u)}
                            className="rounded p-1.5 text-destructive transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
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

        {/* pagination footer */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-[13px] text-muted-foreground">
          <span>
            عرض{" "}
            {filtered.length === 0 ? 0 : start + 1}–
            {Math.min(start + pageSize, filtered.length)} من {filtered.length}{" "}
            مستخدم
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[12px]">صفوف في الصفحة:</span>
            <DSelect
              value={String(pageSize)}
              onChange={(v) => {
                setPageSize(Number(v))
                setPage(1)
              }}
              options={pageSizeOptions}
              placeholder=""
            />
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="rounded p-1.5 transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-30"
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
                className="rounded p-1.5 transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="الصفحة التالية"
              >
                <Icon name="chevLeft" size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* create user dialog */}
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
                onDialCodeChange={(v) =>
                  setForm((f) => ({ ...f, dialCode: v }))
                }
                number={form.phoneNumber}
                onNumberChange={(v) =>
                  setForm((f) => ({ ...f, phoneNumber: v }))
                }
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
          <div className="flex justify-end gap-2 border-t border-border p-4">
            <Btn
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCreateOpen(false)}
            >
              إلغاء
            </Btn>
            <Btn type="submit" size="sm" disabled={isCreating}>
              {isCreating ? "جاري الإنشاء…" : "إنشاء المستخدم"}
            </Btn>
          </div>
        </form>
      </DDialog>

      {/* user details dialog */}
      <DDialog
        open={!!detailUser}
        onClose={() => setDetailUser(null)}
        size="sm"
      >
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
                  <p className="text-[13px] text-muted-foreground">
                    {detailUser.email}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 rounded-xl border border-border p-4 text-[13px]">
                <div>
                  <p className="mb-0.5 text-[11px] text-muted-foreground">
                    رقم الهاتف
                  </p>
                  <p dir="ltr" className="font-medium">
                    {detailUser.phoneNumber ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="mb-0.5 text-[11px] text-muted-foreground">
                    الدور
                  </p>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[12px] font-medium ${detailUser.role === "super_admin" ? "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400" : "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400"}`}
                  >
                    {roleLabel(detailUser.role)}
                  </span>
                </div>
                <div>
                  <p className="mb-0.5 text-[11px] text-muted-foreground">
                    الشركة
                  </p>
                  <p className="font-medium">
                    {resolveCompanyName(detailUser.hiringCompanyId)}
                  </p>
                </div>
                <div>
                  <p className="mb-0.5 text-[11px] text-muted-foreground">
                    الحالة
                  </p>
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
                  <p className="mb-0.5 text-[11px] text-muted-foreground">
                    تاريخ الإنشاء
                  </p>
                  <p className="font-medium">
                    {new Date(detailUser.createdAt).toLocaleDateString("ar-SA", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end border-t border-border p-4">
              <Btn
                variant="outline"
                size="sm"
                onClick={() => setDetailUser(null)}
              >
                إغلاق
              </Btn>
            </div>
          </>
        )}
      </DDialog>

      {/* delete confirm dialog */}
      <DDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        size="sm"
      >
        {deleteTarget && (
          <>
            <div className="border-b border-border p-5">
              <h2 className="text-[16px] font-semibold">تأكيد الحذف</h2>
            </div>
            <div className="p-5 text-[14px]">
              هل أنت متأكد من حذف المستخدم{" "}
              <span className="font-semibold">{deleteTarget.name}</span>؟ لا
              يمكن التراجع عن هذا الإجراء.
            </div>
            <div className="flex justify-end gap-2 border-t border-border p-4">
              <Btn
                variant="outline"
                size="sm"
                onClick={() => setDeleteTarget(null)}
              >
                إلغاء
              </Btn>
              <Btn
                size="sm"
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={isDeleting}
                onClick={() =>
                  deleteUser(deleteTarget.id, {
                    onSuccess: () => setDeleteTarget(null),
                  })
                }
              >
                {isDeleting ? "جاري الحذف…" : "حذف"}
              </Btn>
            </div>
          </>
        )}
      </DDialog>
    </div>
  )
}
