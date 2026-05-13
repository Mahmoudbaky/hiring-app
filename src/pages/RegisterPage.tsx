import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Icon } from "@/components/icons"
import { BrandLogo, Btn, DInput, DLabel } from "@/components/shell"
import { Badge } from "@/components/ui/badge"
import { useApp } from "@/context/AppContext"
import { PhoneInput } from "@/components/ui/phone-input"

export function RegisterPage() {
  const { register } = useApp()
  const navigate = useNavigate()

  const [companyName, setCompanyName] = useState("")
  const [dialCode, setDialCode] = useState("+966")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [address, setAddress] = useState("")
  const [managerName, setManagerName] = useState("")
  const [companyRecord, setCompanyRecord] = useState("")

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [userDialCode, setUserDialCode] = useState("+966")
  const [userPhoneNumber, setUserPhoneNumber] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!companyName.trim()) {
      setError("اسم الشركة مطلوب")
      return
    }
    if (!name.trim() || !email.trim() || !password) {
      setError("الاسم والبريد وكلمة المرور مطلوبة")
      return
    }
    if (password.length < 8) {
      setError("كلمة المرور يجب أن تكون 8 أحرف على الأقل")
      return
    }
    if (password !== confirmPassword) {
      setError("كلمتا المرور غير متطابقتين")
      return
    }
    setError("")
    setLoading(true)
    try {
      await register({
        companyName,
        phoneNumber: phoneNumber ? `${dialCode}${phoneNumber}` : undefined,
        address: address || undefined,
        managerName: managerName || undefined,
        companyRecord: companyRecord || undefined,
        name,
        email,
        password,
        userPhoneNumber: userPhoneNumber
          ? `${userDialCode}${userPhoneNumber}`
          : undefined,
      })
      navigate("/incoming", { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ غير متوقع")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="grid min-h-screen grid-cols-1 lg:grid-cols-[1fr_520px]"
      dir="rtl"
    >
      {/* ── Left dark panel ──────────────────────────────────────── */}
      <div className="relative hidden overflow-hidden bg-[oklch(0.18_0.02_30)] text-white lg:block">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 80% at 0% 100%, oklch(0.55 0.22 30 / 0.5), transparent 60%), radial-gradient(80% 60% at 100% 0%, oklch(0.45 0.18 350 / 0.35), transparent 55%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(oklch(0.95 0 0 / 0.6) 1px, transparent 1px), linear-gradient(90deg, oklch(0.95 0 0 / 0.6) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />

        <div className="relative flex h-full flex-col p-12">
          <BrandLogo size={36} />

          <div className="flex max-w-[480px] flex-1 flex-col justify-center">
            <Badge
              tone="rose"
              className="mb-5 w-fit border-white/15 bg-white/10 text-white"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
              منصة إدارة التوظيف
            </Badge>

            <h1 className="text-[42px] leading-[1.15] font-bold tracking-tight text-balance">
              ابدأ رحلة التوظيف
              <br />
              مع <span className="text-[oklch(0.78_0.18_30)]">شركتك</span>.
            </h1>
            <p className="mt-4 text-[15px] leading-relaxed text-white/70">
              أنشئ حساب شركتك في دقيقتين. راجع المتقدمين، صنّف السير الذاتية،
              وانشر الوظائف الجديدة من واجهة واحدة بسيطة.
            </p>
          </div>

          <div className="text-[12px] text-white/50">
            © 2026 ضم — جميع الحقوق محفوظة.
          </div>
        </div>
      </div>

      {/* ── Right form panel ─────────────────────────────────────── */}
      <div className="flex flex-col bg-background">
        <div className="flex flex-1 items-start justify-center overflow-y-auto px-8 py-8 lg:px-12">
          <form onSubmit={submit} className="w-full max-w-[400px]">
            <h2 className="text-[26px] font-bold tracking-tight">
              إنشاء حساب جديد
            </h2>
            <p className="mt-1 text-[13.5px] text-muted-foreground">
              أدخل بيانات شركتك ومعلومات المسؤول لإنشاء الحساب.
            </p>

            {/* Company section */}
            <div className="mt-7 space-y-4">
              <p className="text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
                معلومات الشركة
              </p>

              <div className="space-y-1.5">
                <DLabel required>اسم الشركة</DLabel>
                <DInput
                  placeholder="مثال: شركة الأفق للتقنية"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <DLabel>رقم الترخيص</DLabel>
                <DInput
                  placeholder="رقم الترخيص"
                  value={companyRecord}
                  onChange={(e) => setCompanyRecord(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <DLabel>اسم المدير المسؤول</DLabel>
                <DInput
                  placeholder="الاسم الكامل"
                  value={managerName}
                  onChange={(e) => setManagerName(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <DLabel>رقم الهاتف</DLabel>
                <PhoneInput
                  dialCode={dialCode}
                  onDialCodeChange={setDialCode}
                  number={phoneNumber}
                  onNumberChange={setPhoneNumber}
                />
              </div>

              <div className="space-y-1.5">
                <DLabel>العنوان</DLabel>
                <DInput
                  placeholder="المدينة، الحي"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>

            {/* Divider */}
            <div className="my-6 border-t border-border" />

            {/* User section */}
            <div className="space-y-4">
              <p className="text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
                بيانات المستخدم
              </p>

              <div className="space-y-1.5">
                <DLabel required>اسم المستخدم</DLabel>
                <DInput
                  placeholder="اسم المستخدم"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <DLabel required>البريد الإلكتروني</DLabel>
                <DInput
                  icon={<Icon name="mail" size={14} />}
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <DLabel>رقم الهاتف</DLabel>
                <PhoneInput
                  dialCode={userDialCode}
                  onDialCodeChange={setUserDialCode}
                  number={userPhoneNumber}
                  onNumberChange={setUserPhoneNumber}
                />
              </div>

              <div className="space-y-1.5">
                <DLabel required>كلمة المرور</DLabel>
                <div className="relative">
                  <DInput
                    type={showPw ? "text" : "password"}
                    placeholder="8 أحرف على الأقل"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pe-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((s) => !s)}
                    className="absolute inset-y-0 inset-e-0 flex items-center pe-3 text-muted-foreground hover:text-foreground"
                  >
                    <Icon name="eye" size={15} />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <DLabel required>تأكيد كلمة المرور</DLabel>
                <div className="relative">
                  <DInput
                    type={showConfirmPw ? "text" : "password"}
                    placeholder="أعد إدخال كلمة المرور"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pe-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw((s) => !s)}
                    className="absolute inset-y-0 inset-e-0 flex items-center pe-3 text-muted-foreground hover:text-foreground"
                  >
                    <Icon name="eye" size={15} />
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-md border border-[oklch(0.9_0.05_25)] bg-[oklch(0.97_0.03_25)] px-3 py-2 text-[12.5px] text-[oklch(0.5_0.15_25)]">
                  <Icon name="info" size={13} /> {error}
                </div>
              )}

              <Btn
                type="submit"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg
                      viewBox="0 0 24 24"
                      width="14"
                      height="14"
                      className="animate-spin"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeDasharray="30 60"
                      />
                    </svg>
                    جاري إنشاء الحساب…
                  </>
                ) : (
                  <>
                    إنشاء الحساب <Icon name="chevLeft" size={14} />
                  </>
                )}
              </Btn>

              <p className="text-center text-[11.5px] text-muted-foreground">
                بالنقر على "إنشاء الحساب" أنت توافق على شروط الخدمة وسياسة
                الخصوصية.
              </p>

              <div className="flex items-center justify-center gap-2 pt-1">
                <span className="text-[12.5px] text-muted-foreground">
                  لديك حساب بالفعل؟
                </span>
                <Link to="/login">
                  <Btn variant="outline" size="sm">
                    تسجيل الدخول
                  </Btn>
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
