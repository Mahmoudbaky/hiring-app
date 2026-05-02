import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Icon } from "@/components/icons"
import { BrandLogo, Btn, DInput, DLabel } from "@/components/shell"
import { Badge } from "@/components/ui/badge"
import { useApp } from "@/context/AppContext"

export function LoginPage() {
  const { login } = useApp()
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError("الرجاء إدخال البريد وكلمة المرور")
      return
    }
    setError("")
    setLoading(true)
    try {
      await login(email, password, remember)
      navigate("/dashboard", { replace: true })
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
              أدر طلبات التوظيف
              <br />
              من <span className="text-[oklch(0.78_0.18_30)]">مكان واحد</span>.
            </h1>
            <p className="mt-4 text-[15px] leading-relaxed text-white/70">
              راجع المتقدمين، صنّف السير الذاتية، وانشر الوظائف الجديدة. كل ما
              تحتاجه لبناء فريقك في واجهة واحدة بسيطة.
            </p>
          </div>

          <div className="text-[12px] text-white/50">
            © 2026 ضم — جميع الحقوق محفوظة.
          </div>
        </div>

        {/* Floating preview card */}
        {/* <div
          className="absolute bottom-12 start-12 opacity-90 pointer-events-none hidden xl:block"
          style={{ transform: 'translate(-30%, -10%) rotate(-4deg)' }}
        >
          <div className="w-[320px] bg-white text-[var(--foreground)] rounded-xl border border-[var(--border)] shadow-[0_8px_24px_-12px_rgba(0,0,0,0.18)] p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-md bg-[oklch(0.97_0.04_155)] text-[oklch(0.5_0.13_155)] flex items-center justify-center">
                <Icon name="check" size={14} />
              </div>
              <div>
                <div className="text-[12.5px] font-medium">طلب جديد تم ترشيحه</div>
                <div className="text-[11px] text-[var(--muted-foreground)]">قبل دقيقتين</div>
              </div>
            </div>
            <div className="text-[12.5px] text-[var(--muted-foreground)]">نورة السبيعي · مصمم UI/UX</div>
          </div>
        </div> */}
      </div>

      {/* ── Right form panel ─────────────────────────────────────── */}
      <div className="flex flex-col bg-background">
        <div className="flex items-center justify-between p-6">
          <div className="text-[12.5px] text-[var(--muted-foreground)]">
            ليس لديك حساب؟
          </div>
          <Link to="/register">
            <Btn variant="outline" size="sm">
              إنشاء حساب
            </Btn>
          </Link>
        </div>

        <div className="flex flex-1 items-center px-8 lg:px-12">
          <form onSubmit={submit} className="mx-auto w-full max-w-[400px]">
            <h2 className="text-[26px] font-bold tracking-tight">
              تسجيل الدخول
            </h2>
            <p className="mt-1 text-[13.5px] text-[var(--muted-foreground)]">
              أدخل بياناتك للوصول إلى لوحة التحكم.
            </p>

            {/* Social buttons (decorative) */}
            {/* <div className="mt-6 mb-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                className="flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-background text-[13px] transition-colors hover:bg-accent"
              >
                <svg viewBox="0 0 24 24" width="14" height="14">
                  <path
                    fill="#4285F4"
                    d="M22.5 12.2c0-.8-.1-1.6-.2-2.3H12v4.4h5.9c-.3 1.4-1 2.5-2.2 3.3v2.7h3.5c2-1.9 3.3-4.7 3.3-8.1z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3 0 5.5-1 7.3-2.7l-3.5-2.7c-1 .7-2.3 1.1-3.8 1.1-2.9 0-5.4-2-6.3-4.6H2v2.8C3.8 20.5 7.6 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.7 14.1c-.2-.7-.4-1.4-.4-2.1s.1-1.5.4-2.1V7.1H2C1.4 8.6 1 10.3 1 12s.4 3.4 1 4.9l3.7-2.8z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.4c1.6 0 3.1.6 4.2 1.6l3.1-3.1C17.5 2.1 15 1 12 1 7.6 1 3.8 3.5 2 7.1l3.7 2.8C6.6 7.4 9.1 5.4 12 5.4z"
                  />
                </svg>
                Google
              </button>
              <button
                type="button"
                className="flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-background text-[13px] transition-colors hover:bg-accent"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                  <path d="M16.4 1.5c0 1.2-.5 2.3-1.3 3.1-.9.9-2 1.4-3.2 1.4-.1-1.2.5-2.4 1.3-3.2.9-.9 2.1-1.4 3.2-1.3zM21 17.3c-.5 1.2-.8 1.8-1.5 2.9-.9 1.5-2.2 3.4-3.8 3.4-1.4 0-1.8-.9-3.8-.9s-2.4.9-3.8.9c-1.6 0-2.8-1.7-3.7-3.2-2.7-4.1-2.9-9-1.3-11.6 1.2-1.9 3-3 4.8-3 1.8 0 2.9 1 4.4 1 1.4 0 2.3-1 4.4-1 1.6 0 3.3.9 4.5 2.4-3.9 2.2-3.3 7.9-.2 9.1z" />
                </svg>
                Apple
              </button>
            </div> */}

            <div className="my-5 flex items-center gap-3">
              {/* <div className="h-px flex-1 bg-[var(--border)]" /> */}
              {/* <div className="text-[11.5px] text-[var(--muted-foreground)]">
                أو بالبريد الإلكتروني
              </div> */}
              {/* <div className="h-px flex-1 bg-[var(--border)]" /> */}
            </div>

            <div className="space-y-4">
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
                <div className="flex items-center justify-between">
                  <DLabel required>كلمة المرور</DLabel>
                  <button
                    type="button"
                    className="text-[12px] text-[var(--primary)] hover:underline"
                  >
                    نسيت كلمة المرور؟
                  </button>
                </div>
                <div className="relative">
                  <DInput
                    type={showPw ? "text" : "password"}
                    placeholder="أدخل كلمة المرور"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pe-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((s) => !s)}
                    className="absolute inset-y-0 end-0 flex items-center pe-3 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  >
                    <Icon name="eye" size={15} />
                  </button>
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-2 select-none">
                <button
                  type="button"
                  onClick={() => setRemember((r) => !r)}
                  className={cn(
                    "flex h-4 w-4 items-center justify-center rounded border transition-colors",
                    remember
                      ? "border-primary bg-primary"
                      : "border-border bg-background"
                  )}
                >
                  {remember && (
                    <Icon
                      name="check"
                      size={11}
                      className="text-white"
                      strokeWidth={3}
                    />
                  )}
                </button>
                <span className="text-[13px]">تذكرني على هذا الجهاز</span>
              </label>

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
                    جاري تسجيل الدخول…
                  </>
                ) : (
                  <>
                    تسجيل الدخول <Icon name="chevLeft" size={14} />
                  </>
                )}
              </Btn>
            </div>
            {/* 
            <div className="mt-8 flex items-center justify-between border-t border-[var(--border)] pt-5 text-[12px] text-[var(--muted-foreground)]">
              <span>محمي بـ TLS وتشفير شامل</span>
              <button type="button" className="hover:text-[var(--foreground)]">
                شروط الخدمة
              </button>
            </div> */}
          </form>
        </div>
      </div>
    </div>
  )
}
