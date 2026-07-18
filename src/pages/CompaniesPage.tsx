import { useState } from "react"
import { PageHeader, Btn, DInput, DLabel, Th, Td } from "@/components/shell"
import { PhoneInput } from "@/components/ui/phone-input"
import { DDialog } from "@/components/ui/ddialog"
import { Icon } from "@/components/icons"
import {
  useCompanies,
  useCreateCompany,
  useFreezeCompany,
} from "@/hooks/useSettings"

export function CompaniesPage() {
  const { data: companies = [], isLoading } = useCompanies()
  const { mutate: freeze, isPending: isFreezing } = useFreezeCompany()
  const [search, setSearch] = useState("")
  const [open, setOpen] = useState(false)
  const emptyForm = {
    companyName: "",
    companyRecord: "",
    managerName: "",
    phoneNumber: "",
    address: "",
  }
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState("")
  const { mutate: create, isPending } = useCreateCompany(() => {
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
    if (!form.companyName.trim()) {
      setError("اسم الشركة مطلوب")
      return
    }
    create({
      companyName: form.companyName.trim(),
      companyRecord: form.companyRecord || undefined,
      managerName: form.managerName || undefined,
      phoneNumber: form.phoneNumber || undefined,
      address: form.address || undefined,
    })
  }

  const q = search.trim().toLowerCase()
  const filtered = companies.filter(
    (c) =>
      !q ||
      c.companyName.toLowerCase().includes(q) ||
      c.uniqueCode.toLowerCase().includes(q) ||
      (c.managerName ?? "").toLowerCase().includes(q) ||
      (c.phoneNumber ?? "").toLowerCase().includes(q),
  )

  return (
    <div>
      <PageHeader
        icon="briefcase"
        title="الشركات"
        desc="إدارة شركات التوظيف المسجّلة في المنصة"
      />

      <div className="card-shadow rounded-xl border border-border bg-card p-5">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="relative min-w-[200px] flex-1">
            <span className="pointer-events-none absolute inset-y-0 inset-e-3 flex items-center text-muted-foreground">
              <Icon name="search" size={14} />
            </span>
            <DInput
              placeholder="بحث باسم الشركة أو الكود أو المدير أو الهاتف…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pe-9"
            />
          </div>
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
                <Th className="w-[80px]"></Th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <Td
                    colSpan={6}
                    className="py-10 text-center text-[var(--muted-foreground)]"
                  >
                    جاري التحميل…
                  </Td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <Td
                    colSpan={6}
                    className="py-10 text-center text-[var(--muted-foreground)]"
                  >
                    {q ? "لا توجد نتائج مطابقة" : "لا توجد شركات بعد"}
                  </Td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className={c.isActive ? "" : "opacity-60"}>
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
                    <Td>
                      <button
                        onClick={() =>
                          freeze({ id: c.id, isActive: !c.isActive })
                        }
                        disabled={isFreezing}
                        className={`rounded p-1.5 transition-colors ${c.isActive ? "text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20" : "text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"}`}
                        title={c.isActive ? "تجميد الشركة" : "تفعيل الشركة"}
                      >
                        <Icon name={c.isActive ? "ban" : "check"} size={14} />
                      </button>
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DDialog open={open} onClose={() => setOpen(false)} size="md">
        <form onSubmit={submit}>
          <div className="border-b border-border p-5">
            <h2 className="text-[16px] font-semibold">إنشاء شركة توظيف</h2>
          </div>
          <div className="p-5">
            {error && (
              <p className="mb-4 text-[13px] text-destructive">{error}</p>
            )}
            <p className="mb-3 text-[13px] font-medium text-muted-foreground">
              معلومات الشركة
            </p>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <DLabel required>اسم الشركة</DLabel>
                <DInput
                  placeholder="مثال: شركة الأفق للتقنية"
                  value={form.companyName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, companyName: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <DLabel>رقم الترخيص</DLabel>
                <DInput
                  placeholder="رقم الترخيص"
                  value={form.companyRecord}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, companyRecord: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <DLabel>اسم المدير المسؤول</DLabel>
                <DInput
                  placeholder="الاسم الكامل"
                  value={form.managerName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, managerName: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <DLabel>رقم الهاتف</DLabel>
                <PhoneInput
                  value={form.phoneNumber}
                  onChange={(v) => setForm((f) => ({ ...f, phoneNumber: v }))}
                />
              </div>
              <div className="space-y-1.5">
                <DLabel>العنوان</DLabel>
                <DInput
                  placeholder="المدينة، الحي"
                  value={form.address}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, address: e.target.value }))
                  }
                />
              </div>
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
    </div>
  )
}
