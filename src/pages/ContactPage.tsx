import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Icon } from "@/components/icons"
import { BrandLogo } from "@/components/shell"
import { useTheme } from "@/components/theme-provider"
import { useSubmitContact } from "@/hooks/useContact"
import { cn } from "@/lib/utils"

/* ── Theme toggle ─────────────────────────────────────────────────── */
function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)
  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="تبديل الوضع"
      className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)] transition-colors hover:border-[var(--primary)]"
    >
      <Icon name={isDark ? "sun" : "moon"} size={15} className="text-[var(--muted-foreground)]" />
    </button>
  )
}

/* ── Info card ─────────────────────────────────────────────────────── */
function InfoCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: string
  label: string
  value: string
  tone: "sky" | "emerald" | "rose" | "violet"
}) {
  const toneClass = {
    sky: "tone-sky",
    emerald: "tone-emerald",
    rose: "tone-rose",
    violet: "tone-violet",
  }[tone]

  return (
    <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", toneClass)}>
        <Icon name={icon} size={17} />
      </div>
      <div className="min-w-0">
        <div className="text-[11.5px] text-[var(--muted-foreground)]">{label}</div>
        <div className="truncate text-[13.5px] font-medium text-[var(--foreground)]">{value}</div>
      </div>
    </div>
  )
}

/* ── Field wrapper ────────────────────────────────────────────────── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-medium text-[var(--foreground)]">{label}</label>
      {children}
    </div>
  )
}

/* ── Input / Textarea styles ──────────────────────────────────────── */
const inputCls =
  "h-10 w-full rounded-md border border-[var(--input)] bg-[var(--card)] px-3 text-[13.5px] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus-ring transition-shadow"

const textareaCls =
  "min-h-[130px] w-full resize-y rounded-md border border-[var(--input)] bg-[var(--card)] p-3 text-[13.5px] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus-ring transition-shadow"

/* ── Page ─────────────────────────────────────────────────────────── */
export function ContactPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  const { mutate: submit, isPending } = useSubmitContact(() => {
    setSent(true)
    setForm({ fullName: "", email: "", phone: "", subject: "", message: "" })
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    setError("")
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const { fullName, email, phone, subject, message } = form
    if (!fullName.trim() || !email.trim() || !phone.trim() || !subject.trim() || !message.trim()) {
      setError("يرجى تعبئة جميع الحقول المطلوبة")
      return
    }
    submit({ fullName: fullName.trim(), email: email.trim(), phone: phone.trim(), subject: subject.trim(), message: message.trim() })
  }

  return (
    <div dir="rtl" className="min-h-screen bg-[var(--background)]">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--card)]/90 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <button onClick={() => navigate("/")} className="focus-ring rounded-md">
            <BrandLogo />
          </button>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => navigate("/login")}
              className="focus-ring h-9 rounded-md border border-[var(--border)] bg-[var(--card)] px-4 text-[13px] font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--accent)]"
            >
              تسجيل الدخول
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        {/* ── Section header ── */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[oklch(0.97_0.03_30)] dark:bg-[oklch(0.25_0.04_30)]">
            <Icon name="mail" size={22} className="text-[var(--primary)]" />
          </div>
          <h1 className="text-[28px] font-bold tracking-tight text-[var(--foreground)] sm:text-[32px]">
            اتصل بنا
          </h1>
          <p className="mt-2 text-[14px] text-[var(--muted-foreground)]">
            راسلنا وسيتم الرد عليك في أسرع وقت
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* ── Contact info ── */}
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
              <h2 className="mb-5 text-[17px] font-bold text-[var(--foreground)]">
                معلومات التواصل
              </h2>
              <div className="flex flex-col gap-3">
                <InfoCard
                  icon="phone"
                  label="الهاتف"
                  value="966125420029"
                  tone="sky"
                />
                <InfoCard
                  icon="phone"
                  label="الجوال"
                  value="96655442444"
                  tone="emerald"
                />
                <InfoCard
                  icon="mail"
                  label="البريد الالكتروني"
                  value="Contact@Ainaa.Sa"
                  tone="rose"
                />
                <InfoCard
                  icon="globe"
                  label="العنوان"
                  value="المملكة العربية السعودية - مكة المكرمة - حي الزاهر"
                  tone="violet"
                />
              </div>
            </div>

            {/* Map placeholder */}
            <div className="flex items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--muted)]/40 px-4 py-6">
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[13.5px] text-[var(--primary)] underline-offset-4 hover:underline"
              >
                <Icon name="globe" size={15} />
                عرض العنوان على الخريطة
              </a>
            </div>
          </div>

          {/* ── Contact form ── */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
            {sent ? (
              <div className="flex flex-col items-center gap-4 py-10 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[oklch(0.97_0.04_155)] dark:bg-[oklch(0.25_0.05_155)]">
                  <Icon name="check" size={24} className="text-[oklch(0.5_0.13_155)]" />
                </div>
                <div>
                  <p className="text-[17px] font-bold text-[var(--foreground)]">
                    تم إرسال رسالتك بنجاح!
                  </p>
                  <p className="mt-1 text-[13.5px] text-[var(--muted-foreground)]">
                    سنتواصل معك في أقرب وقت ممكن
                  </p>
                </div>
                <button
                  onClick={() => setSent(false)}
                  className="focus-ring mt-2 rounded-md border border-[var(--border)] bg-[var(--card)] px-5 py-2 text-[13.5px] font-medium transition-colors hover:bg-[var(--accent)]"
                >
                  إرسال رسالة أخرى
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Field label="الاسم رباعي">
                  <input
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="الاسم رباعي"
                    className={inputCls}
                  />
                </Field>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="البريد الإلكتروني">
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="البريد الإلكتروني"
                      className={inputCls}
                      dir="ltr"
                    />
                  </Field>
                  <Field label="رقم الهاتف">
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="رقم الهاتف"
                      className={inputCls}
                      dir="ltr"
                    />
                  </Field>
                </div>

                <Field label="عنوان الرسالة">
                  <input
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    placeholder="عنوان الرسالة"
                    className={inputCls}
                  />
                </Field>

                <Field label="الرسالة">
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="الرسالة"
                    className={textareaCls}
                  />
                </Field>

                {error && (
                  <p className="text-[12.5px] text-[var(--destructive)]">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={isPending}
                  className="focus-ring mt-1 flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[var(--primary)] text-[14px] font-medium text-white transition-colors hover:bg-[var(--primary-hover)] disabled:opacity-60"
                >
                  <Icon name="send" size={15} />
                  {isPending ? "جاري الإرسال..." : "إرسال الرسالة"}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
