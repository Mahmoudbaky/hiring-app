import { useState, useEffect, useRef } from "react"
import { useNavigate, useSearchParams, Link } from "react-router-dom"
import { Icon } from "@/components/icons"
import { BrandLogo, Btn } from "@/components/shell"
import { Badge } from "@/components/ui/badge"
import { otpService } from "@/services/otp.service"

function maskEmail(email: string): string {
  const [local, domain] = email.split("@")
  if (!local || !domain) return email
  const visible = local.slice(0, Math.min(3, local.length))
  return `${visible}${"*".repeat(Math.max(2, local.length - 3))}@${domain}`
}

export function VerifyOtpPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const email = params.get("email") ?? ""

  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])

  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState("")

  const [cooldown, setCooldown] = useState(0)
  const [resending, setResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)

  // Start cooldown when page loads (OTP was just sent by registration)
  useEffect(() => {
    setCooldown(60)
  }, [])

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  const otpValue = otp.join("")

  function handleDigit(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1)
    const next = [...otp]
    next[index] = digit
    setOtp(next)
    setError("")
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    if (!digits) return
    const next = [...otp]
    for (let i = 0; i < 6; i++) next[i] = digits[i] ?? ""
    setOtp(next)
    inputRefs.current[Math.min(digits.length, 5)]?.focus()
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (otpValue.length < 6) {
      setError("أدخل الرمز المكوّن من 6 أرقام")
      return
    }
    setVerifying(true)
    setError("")
    try {
      await otpService.verify(email, otpValue)
      navigate("/login?verified=1", { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ غير متوقع")
      setOtp(["", "", "", "", "", ""])
      inputRefs.current[0]?.focus()
    } finally {
      setVerifying(false)
    }
  }

  async function resend() {
    setResending(true)
    setResendSuccess(false)
    setError("")
    try {
      await otpService.send(email)
      setResendSuccess(true)
      setCooldown(60)
      setOtp(["", "", "", "", "", ""])
      inputRefs.current[0]?.focus()
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذّر إرسال الرمز")
    } finally {
      setResending(false)
    }
  }

  if (!email) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4" dir="rtl">
        <p className="text-muted-foreground">رابط غير صالح.</p>
        <Link to="/register"><Btn variant="outline">إنشاء حساب</Btn></Link>
      </div>
    )
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1fr_520px]" dir="rtl">
      {/* Left dark panel */}
      <div className="relative hidden overflow-hidden bg-[oklch(0.18_0.02_30)] text-white lg:block">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 80% at 0% 100%, oklch(0.55 0.22 30 / 0.5), transparent 60%), radial-gradient(80% 60% at 100% 0%, oklch(0.45 0.18 350 / 0.35), transparent 55%)",
          }}
        />
        <div className="relative flex h-full flex-col p-12">
          <BrandLogo size={36} />
          <div className="flex max-w-[480px] flex-1 flex-col justify-center">
            <Badge tone="rose" className="mb-5 w-fit border-white/15 bg-white/10 text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              تأكيد الحساب
            </Badge>
            <h1 className="text-[42px] leading-[1.15] font-bold tracking-tight text-balance">
              خطوة واحدة
              <br />
              لتفعيل <span className="text-[oklch(0.78_0.18_30)]">شركتك</span>.
            </h1>
            <p className="mt-4 text-[15px] leading-relaxed text-white/70">
              أرسلنا رمز تحقق إلى بريدك الإلكتروني. أدخله لتأكيد حساب شركتك وبدء استخدام المنصة.
            </p>
          </div>
          <div className="text-[12px] text-white/50">© 2026 ضم — جميع الحقوق محفوظة.</div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-col bg-background">
        <div className="flex flex-1 items-center px-8 lg:px-12">
          <form onSubmit={submit} className="mx-auto w-full max-w-[400px]">
            {/* Icon */}
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-muted">
              <Icon name="mail" size={24} className="text-primary" />
            </div>

            <h2 className="text-[26px] font-bold tracking-tight">تأكيد البريد الإلكتروني</h2>
            <p className="mt-1 text-[13.5px] text-muted-foreground">
              أرسلنا رمزاً مكوناً من 6 أرقام إلى
            </p>
            <p className="mt-0.5 text-[13.5px] font-semibold text-foreground" dir="ltr">
              {maskEmail(email)}
            </p>

            <div className="my-7" />

            {/* OTP boxes — always LTR regardless of page direction */}
            <div className="flex justify-between gap-2" dir="ltr" onPaste={handlePaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigit(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="h-14 w-12 rounded-xl border border-border bg-background text-center text-[22px] font-bold tracking-widest text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-(--primary)/20 disabled:opacity-50"
                  disabled={verifying}
                />
              ))}
            </div>

            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-md border border-[oklch(0.9_0.05_25)] bg-[oklch(0.97_0.03_25)] px-3 py-2 text-[12.5px] text-[oklch(0.5_0.15_25)]">
                <Icon name="info" size={13} /> {error}
              </div>
            )}
            {resendSuccess && !error && (
              <div className="mt-4 flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-[12.5px] text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400">
                <Icon name="check" size={13} /> تم إرسال رمز جديد
              </div>
            )}

            <Btn type="submit" size="lg" className="mt-5 w-full" disabled={verifying || otpValue.length < 6}>
              {verifying ? (
                <>
                  <svg viewBox="0 0 24 24" width="14" height="14" className="animate-spin">
                    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="30 60" />
                  </svg>
                  جاري التحقق…
                </>
              ) : (
                <>تأكيد الحساب <Icon name="chevLeft" size={14} /></>
              )}
            </Btn>

            <div className="mt-5 flex items-center justify-center gap-2 text-[13px]">
              <span className="text-muted-foreground">لم تستلم الرمز؟</span>
              {cooldown > 0 ? (
                <span className="text-muted-foreground">
                  إعادة الإرسال بعد {cooldown}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={resend}
                  disabled={resending}
                  className="font-medium text-primary hover:underline disabled:opacity-50"
                >
                  {resending ? "جاري الإرسال…" : "إعادة إرسال الرمز"}
                </button>
              )}
            </div>

            <div className="mt-4 flex items-center justify-center gap-2">
              <Link to="/register" className="text-[12.5px] text-muted-foreground hover:text-foreground">
                ← العودة للتسجيل
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
