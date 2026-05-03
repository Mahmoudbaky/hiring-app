import { useRef, useState } from "react"
import { useApp } from "@/context/AppContext"
import { PageHeader, Btn, DInput, DLabel } from "@/components/shell"
import { Icon } from "@/components/icons"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  useMyProfile,
  useMyCompany,
  useUpdateProfile,
  useUpdateMyCompany,
  useUploadImage,
} from "@/hooks/useProfile"

/* ── Image Upload Zone ────────────────────────────────────────────── */
function ImageUploadZone({
  current,
  onUpload,
  uploading,
  shape = "circle",
  placeholder,
}: {
  current: string | null
  onUpload: (file: File) => void
  uploading: boolean
  shape?: "circle" | "square"
  placeholder?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const handleFile = (file: File) => {
    setPreview(URL.createObjectURL(file))
    onUpload(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith("image/")) handleFile(file)
  }

  const src = preview ?? current

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Preview */}
      <div
        className={`relative overflow-hidden bg-[var(--muted)] ${
          shape === "circle" ? "rounded-full" : "rounded-xl"
        }`}
        style={{ width: shape === "circle" ? 96 : 120, height: shape === "circle" ? 96 : 80 }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {src ? (
          <img src={src} alt="preview" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            {shape === "circle" ? (
              <Icon name="users" size={32} className="text-[var(--muted-foreground)]" />
            ) : (
              <Icon name="briefcase" size={28} className="text-[var(--muted-foreground)]" />
            )}
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <svg viewBox="0 0 24 24" width="20" height="20" className="animate-spin text-white">
              <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="30 60" />
            </svg>
          </div>
        )}
      </div>

      {/* Button + hint */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
      />
      <Btn
        type="button"
        variant="outline"
        size="sm"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        <Icon name="link" size={13} />
        {current || preview ? "تغيير الصورة" : "رفع صورة"}
      </Btn>
      <p className="text-[11.5px] text-[var(--muted-foreground)]">
        {placeholder ?? "PNG أو JPG أو WEBP · حتى 5 ميجابايت"}
      </p>
    </div>
  )
}

/* ── Toast helper ─────────────────────────────────────────────────── */
function SavedBanner({ show }: { show: boolean }) {
  if (!show) return null
  return (
    <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[13px] text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400">
      <Icon name="check" size={14} /> تم الحفظ بنجاح
    </div>
  )
}

/* ── Personal Info Tab ────────────────────────────────────────────── */
function PersonalTab() {
  const { user, refreshProfile } = useApp()
  const { data: profile } = useMyProfile()
  const { mutateAsync: uploadImage, isPending: uploading } = useUploadImage()
  const { mutate: updateProfile, isPending: saving } = useUpdateProfile(async () => {
    await refreshProfile()
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  })

  const [name, setName] = useState(user?.name ?? "")
  const [imageUrl, setImageUrl] = useState<string | null>(user?.image ?? null)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNewPw, setShowNewPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)
  const [pwError, setPwError] = useState("")
  const [saved, setSaved] = useState(false)

  const handleImageUpload = async (file: File) => {
    const url = await uploadImage(file)
    setImageUrl(url)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPwError("")

    if (newPassword || confirmPassword) {
      if (newPassword.length < 8) {
        setPwError("كلمة المرور يجب أن تكون 8 أحرف على الأقل")
        return
      }
      if (newPassword !== confirmPassword) {
        setPwError("كلمتا المرور غير متطابقتين")
        return
      }
    }

    updateProfile({
      name: name.trim() || undefined,
      image: imageUrl,
      newPassword: newPassword || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-8 sm:grid-cols-[180px_1fr]">
        {/* Avatar upload */}
        <div className="flex flex-col items-center gap-2 pt-1">
          <p className="mb-1 text-[12.5px] font-medium text-[var(--muted-foreground)]">صورة الملف الشخصي</p>
          <ImageUploadZone
            current={imageUrl ?? profile?.image ?? null}
            onUpload={handleImageUpload}
            uploading={uploading}
            shape="circle"
          />
        </div>

        {/* Fields */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <DLabel required>الاسم الكامل</DLabel>
            <DInput
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="اسمك الكامل"
            />
          </div>
          <div className="space-y-1.5">
            <DLabel>البريد الإلكتروني</DLabel>
            <DInput value={user?.email ?? ""} disabled className="opacity-60" />
            <p className="text-[11.5px] text-[var(--muted-foreground)]">لا يمكن تغيير البريد الإلكتروني</p>
          </div>
          <div className="space-y-1.5">
            <DLabel>الدور</DLabel>
            <DInput
              value={user?.role === "super_admin" ? "مشرف النظام" : "مستخدم شركة"}
              disabled
              className="opacity-60"
            />
          </div>

          {/* Password change */}
          <div className="border-t border-[var(--border)] pt-4">
            <p className="mb-3 text-[13px] font-medium">تغيير كلمة المرور</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <DLabel>كلمة المرور الجديدة</DLabel>
                <div className="relative">
                  <DInput
                    type={showNewPw ? "text" : "password"}
                    placeholder="اتركه فارغاً للإبقاء على الحالية"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pe-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(v => !v)}
                    className="absolute inset-y-0 end-0 flex items-center pe-3 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  >
                    <Icon name="eye" size={14} />
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <DLabel>تأكيد كلمة المرور</DLabel>
                <div className="relative">
                  <DInput
                    type={showConfirmPw ? "text" : "password"}
                    placeholder="اتركه فارغاً للإبقاء على الحالية"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pe-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw(v => !v)}
                    className="absolute inset-y-0 end-0 flex items-center pe-3 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  >
                    <Icon name="eye" size={14} />
                  </button>
                </div>
              </div>
            </div>
            {pwError && (
              <p className="mt-2 flex items-center gap-1.5 text-[12.5px] text-[var(--destructive)]">
                <Icon name="info" size={13} /> {pwError}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 pt-1">
            <Btn type="submit" size="md" disabled={saving || uploading}>
              {saving ? (
                <>
                  <svg viewBox="0 0 24 24" width="13" height="13" className="animate-spin">
                    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="30 60" />
                  </svg>
                  جاري الحفظ…
                </>
              ) : (
                "حفظ التغييرات"
              )}
            </Btn>
            <SavedBanner show={saved} />
          </div>
        </div>
      </div>
    </form>
  )
}

/* ── Company Info Tab ─────────────────────────────────────────────── */
function CompanyTab() {
  const { refreshProfile } = useApp()
  const { data: company, isLoading } = useMyCompany()
  const { mutateAsync: uploadImage, isPending: uploading } = useUploadImage()
  const { mutate: updateCompany, isPending: saving } = useUpdateMyCompany(async () => {
    await refreshProfile()
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  })

  const [form, setForm] = useState({
    companyName: "",
    phoneNumber: "",
    address: "",
    managerName: "",
    companyRecord: "",
  })
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [initialized, setInitialized] = useState(false)

  // Populate form once data loads
  if (company && !initialized) {
    setForm({
      companyName: company.companyName ?? "",
      phoneNumber: company.phoneNumber ?? "",
      address: company.address ?? "",
      managerName: company.managerName ?? "",
      companyRecord: company.companyRecord ?? "",
    })
    setLogoUrl(company.logo ?? null)
    setInitialized(true)
  }

  const handleLogoUpload = async (file: File) => {
    const url = await uploadImage(file)
    setLogoUrl(url)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateCompany({
      companyName: form.companyName.trim() || undefined,
      phoneNumber: form.phoneNumber.trim() || undefined,
      address: form.address.trim() || undefined,
      managerName: form.managerName.trim() || undefined,
      companyRecord: form.companyRecord.trim() || undefined,
      logo: logoUrl,
    })
  }

  if (isLoading) {
    return (
      <div className="py-12 text-center text-[13.5px] text-[var(--muted-foreground)]">
        جاري التحميل…
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-8 sm:grid-cols-[180px_1fr]">
        {/* Logo upload */}
        <div className="flex flex-col items-center gap-2 pt-1">
          <p className="mb-1 text-[12.5px] font-medium text-[var(--muted-foreground)]">شعار الشركة</p>
          <ImageUploadZone
            current={logoUrl}
            onUpload={handleLogoUpload}
            uploading={uploading}
            shape="square"
            placeholder="PNG أو JPG أو WEBP · حتى 5 ميجابايت"
          />
          {company?.uniqueCode && (
            <div className="mt-2 rounded-md border border-dashed border-[var(--border)] px-3 py-1.5 text-center">
              <div className="text-[10px] text-[var(--muted-foreground)]">كود الشركة</div>
              <div className="font-mono text-[14px] font-bold tracking-widest">{company.uniqueCode}</div>
            </div>
          )}
        </div>

        {/* Fields */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <DLabel required>اسم الشركة</DLabel>
            <DInput
              value={form.companyName}
              onChange={(e) => setForm(f => ({ ...f, companyName: e.target.value }))}
              placeholder="اسم الشركة"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <DLabel>رقم الهاتف</DLabel>
              <DInput
                value={form.phoneNumber}
                onChange={(e) => setForm(f => ({ ...f, phoneNumber: e.target.value }))}
                placeholder="اختياري"
              />
            </div>
            <div className="space-y-1.5">
              <DLabel>اسم المدير</DLabel>
              <DInput
                value={form.managerName}
                onChange={(e) => setForm(f => ({ ...f, managerName: e.target.value }))}
                placeholder="اختياري"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <DLabel>العنوان</DLabel>
            <DInput
              value={form.address}
              onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))}
              placeholder="المدينة، الحي"
            />
          </div>
          <div className="space-y-1.5">
            <DLabel>السجل التجاري</DLabel>
            <DInput
              value={form.companyRecord}
              onChange={(e) => setForm(f => ({ ...f, companyRecord: e.target.value }))}
              placeholder="رقم السجل التجاري"
            />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <Btn type="submit" size="md" disabled={saving || uploading}>
              {saving ? (
                <>
                  <svg viewBox="0 0 24 24" width="13" height="13" className="animate-spin">
                    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="30 60" />
                  </svg>
                  جاري الحفظ…
                </>
              ) : (
                "حفظ التغييرات"
              )}
            </Btn>
            <SavedBanner show={saved} />
          </div>
        </div>
      </div>
    </form>
  )
}

/* ── Main Page ────────────────────────────────────────────────────── */
export function ProfilePage() {
  const { user } = useApp()
  const isCompanyUser = user?.role === "company_user"

  return (
    <div>
      <PageHeader
        icon="users"
        title="الملف الشخصي"
        desc="إدارة بيانات حسابك الشخصي وبيانات شركتك"
      />

      <Tabs defaultValue="personal" dir="rtl">
        <TabsList className="mb-6 h-auto w-full justify-start gap-1 rounded-xl border border-[var(--border)] bg-[var(--card)] p-1.5">
          <TabsTrigger value="personal" className="gap-1.5 rounded-lg px-4 py-2 text-[13.5px]">
            <Icon name="users" size={14} />
            المعلومات الشخصية
          </TabsTrigger>
          {isCompanyUser && (
            <TabsTrigger value="company" className="gap-1.5 rounded-lg px-4 py-2 text-[13.5px]">
              <Icon name="briefcase" size={14} />
              معلومات الشركة
            </TabsTrigger>
          )}
        </TabsList>

        <div className="card-shadow rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
          <TabsContent value="personal">
            <PersonalTab />
          </TabsContent>
          {isCompanyUser && (
            <TabsContent value="company">
              <CompanyTab />
            </TabsContent>
          )}
        </div>
      </Tabs>
    </div>
  )
}
