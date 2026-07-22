import { useState } from "react"
import { useApp } from "@/context/AppContext"
import { PageHeader, Btn, DInput, DLabel, Th, Td } from "@/components/shell"
import { DDialog } from "@/components/ui/ddialog"
import { Icon } from "@/components/icons"
import {
  useAdmins,
  useCreateAdmin,
  useFreezeAdmin,
  useDeleteAdmin,
} from "@/hooks/useSettings"
import type { AdminUser } from "@/types/api"

export function AdminsPage() {
  const { user: me } = useApp()

  const { data: admins = [], isLoading } = useAdmins()
  const { mutate: freeze, isPending: isFreezing } = useFreezeAdmin()
  const { mutate: deleteAdmin, isPending: isDeleting } = useDeleteAdmin()

  const [search, setSearch] = useState("")

  const emptyForm = { name: "", email: "", password: "" }
  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState("")
  const { mutate: create, isPending: isCreating } = useCreateAdmin(() => {
    setCreateOpen(false)
    setForm(emptyForm)
    setFormError("")
  })

  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null)

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
    create(
      { name: form.name.trim(), email: form.email.trim(), password: form.password },
      { onError: (err) => setFormError(err instanceof Error ? err.message : "تعذّر إنشاء المشرف") }
    )
  }

  const q = search.trim().toLowerCase()
  const filtered = admins.filter(
    (a) =>
      !q ||
      a.name.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q)
  )

  return (
    <div>
      <PageHeader
        icon="shield"
        title="المشرفون"
        desc="إدارة حسابات المشرفين العامين"
      />

      <div className="card-shadow rounded-xl border border-border bg-card p-5">
        {/* toolbar */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="relative min-w-[200px] flex-1">
            <span className="pointer-events-none absolute inset-y-0 inset-e-3 flex items-center text-muted-foreground">
              <Icon name="search" size={14} />
            </span>
            <DInput
              placeholder="بحث بالاسم أو البريد…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pe-9"
            />
          </div>
          <Btn size="sm" onClick={openCreate}>
            <Icon name="userPlus" size={14} />
            إضافة مشرف
          </Btn>
        </div>

        {/* table */}
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-start">
            <thead>
              <tr>
                <Th>الاسم</Th>
                <Th>البريد الإلكتروني</Th>
                <Th>الحالة</Th>
                <Th>تاريخ الإنشاء</Th>
                <Th className="w-[100px]">إجراءات</Th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <Td colSpan={5} className="py-10 text-center text-muted-foreground">
                    جاري التحميل…
                  </Td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <Td colSpan={5} className="py-10 text-center text-muted-foreground">
                    لا يوجد مشرفون
                  </Td>
                </tr>
              ) : (
                filtered.map((a) => {
                  const isSelf = a.id === me?.id
                  return (
                    <tr key={a.id} className={a.isFrozen ? "opacity-50" : ""}>
                      <Td className="font-medium">
                        <span>{a.name}</span>
                        {isSelf && (
                          <span className="ms-2 inline-flex items-center rounded-full bg-violet-100 px-1.5 py-0.5 text-[11px] font-medium text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
                            أنت
                          </span>
                        )}
                        {a.isFrozen && (
                          <span className="ms-2 inline-flex items-center rounded-full bg-orange-100 px-1.5 py-0.5 text-[11px] font-medium text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                            مجمّد
                          </span>
                        )}
                      </Td>
                      <Td className="text-muted-foreground">{a.email}</Td>
                      <Td>
                        {a.isFrozen ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-[12px] font-medium text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                            <Icon name="ban" size={11} /> مجمّد
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[12px] font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            <Icon name="check" size={11} /> نشط
                          </span>
                        )}
                      </Td>
                      <Td className="text-muted-foreground">
                        {new Date(a.createdAt).toLocaleDateString("ar-SA", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </Td>
                      <Td>
                        <div className="flex items-center gap-1">
                          {!isSelf && (
                            <button
                              onClick={() => freeze({ id: a.id, isFrozen: !a.isFrozen })}
                              disabled={isFreezing}
                              className={`rounded p-1.5 transition-colors ${a.isFrozen ? "text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20" : "text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20"}`}
                              title={a.isFrozen ? "إلغاء التجميد" : "تجميد الحساب"}
                            >
                              <Icon name={a.isFrozen ? "check" : "ban"} size={14} />
                            </button>
                          )}
                          {!isSelf && (
                            <button
                              onClick={() => setDeleteTarget(a)}
                              className="rounded p-1.5 text-destructive transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                              title="حذف المشرف"
                            >
                              <Icon name="trash" size={14} />
                            </button>
                          )}
                        </div>
                      </Td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* create admin dialog */}
      <DDialog open={createOpen} onClose={() => setCreateOpen(false)} size="md">
        <form onSubmit={submitCreate}>
          <div className="border-b border-border p-5">
            <h2 className="text-[16px] font-semibold">إضافة مشرف جديد</h2>
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
                placeholder="admin@example.com"
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
          </div>
          <div className="flex justify-end gap-2 border-t border-border p-4">
            <Btn type="button" variant="outline" size="sm" onClick={() => setCreateOpen(false)}>
              إلغاء
            </Btn>
            <Btn type="submit" size="sm" disabled={isCreating}>
              {isCreating ? "جاري الإنشاء…" : "إنشاء المشرف"}
            </Btn>
          </div>
        </form>
      </DDialog>

      {/* delete confirm dialog */}
      <DDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} size="sm">
        {deleteTarget && (
          <>
            <div className="border-b border-border p-5">
              <h2 className="text-[16px] font-semibold">تأكيد الحذف</h2>
            </div>
            <div className="p-5 text-[14px]">
              هل أنت متأكد من حذف المشرف{" "}
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
                onClick={() =>
                  deleteAdmin(deleteTarget.id, {
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
