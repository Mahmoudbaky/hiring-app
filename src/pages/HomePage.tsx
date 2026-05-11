import { useNavigate } from "react-router-dom"
import { Icon } from "@/components/icons"
import { BrandLogo } from "@/components/shell"
import { useTheme } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

/* ── Dark mode toggle ─────────────────────────────────────────────── */
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
      className="h-9 w-9 shrink-0 rounded-full border border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)] flex items-center justify-center transition-colors"
    >
      {isDark ? (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--primary)]">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--muted-foreground)]">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  )
}

/* ── Path card ────────────────────────────────────────────────────── */
type Tone = "rose" | "sky" | "emerald" | "violet"

const TONE_CLASSES: Record<Tone, { bg: string; bgDark: string; text: string; textDark: string }> = {
  rose:    { bg: "bg-[oklch(0.97_0.03_25)]",  bgDark: "dark:bg-[oklch(0.25_0.04_25)]",  text: "text-[oklch(0.55_0.17_25)]",  textDark: "dark:text-[oklch(0.78_0.15_25)]" },
  sky:     { bg: "bg-[oklch(0.97_0.03_230)]", bgDark: "dark:bg-[oklch(0.25_0.04_230)]", text: "text-[oklch(0.5_0.13_230)]",  textDark: "dark:text-[oklch(0.72_0.12_230)]" },
  emerald: { bg: "bg-[oklch(0.97_0.04_155)]", bgDark: "dark:bg-[oklch(0.25_0.05_155)]", text: "text-[oklch(0.5_0.13_155)]",  textDark: "dark:text-[oklch(0.72_0.13_155)]" },
  violet:  { bg: "bg-[oklch(0.97_0.03_295)]", bgDark: "dark:bg-[oklch(0.25_0.04_295)]", text: "text-[oklch(0.55_0.14_295)]", textDark: "dark:text-[oklch(0.75_0.13_295)]" },
}

function PathCard({
  num, title, desc, cta, tone, icon, onClick,
}: {
  num: string; title: string; desc: string; cta: string
  tone: Tone; icon: string; onClick: () => void
}) {
  const t = TONE_CLASSES[tone]
  return (
    <button
      onClick={onClick}
      className="group text-start bg-[var(--card)] rounded-2xl border border-[var(--border)] p-4 sm:p-5 hover:border-[var(--primary)] hover:-translate-y-0.5 hover:shadow-[0_12px_30px_-15px_oklch(0.2_0.01_260/0.2)] dark:hover:shadow-[0_12px_30px_-15px_oklch(0_0_0/0.4)] transition-all w-full"
    >
      <div className="flex items-start justify-between mb-3 gap-2">
        <div className={cn("w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0", t.bg, t.bgDark, t.text, t.textDark)}>
          <Icon name={icon as any} size={18} />
        </div>
        <div className={cn("text-[14px] sm:text-[16px] font-bold text-end leading-snug", t.text, t.textDark)}>
          {num}. {title}
        </div>
      </div>
      <p className="text-[12px] sm:text-[12.5px] text-[var(--muted-foreground)] leading-[1.85] mb-4 min-h-[56px]">
        {desc}
      </p>
      <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between gap-1.5 text-[12.5px] sm:text-[13px] font-medium text-[var(--primary)]">
        <Icon name="chevLeft" size={13} />
        <span>{cta}</span>
      </div>
    </button>
  )
}

/* ── QR icon ──────────────────────────────────────────────────────── */
function QrIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.6">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <path d="M14 14h3v3h-3zM18 18h3v3h-3z" />
    </svg>
  )
}

/* ── Home page ────────────────────────────────────────────────────── */
export function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[var(--background)] relative overflow-hidden" dir="rtl">
      {/* Decorative dots — hidden on small screens to reduce noise */}
      <div className="hidden sm:block absolute top-[180px] start-0 opacity-30 dark:opacity-20 pointer-events-none">
        <svg width="80" height="200" viewBox="0 0 80 200">
          {Array.from({ length: 10 }).map((_, r) =>
            Array.from({ length: 4 }).map((_, c) => (
              <circle key={`${r}-${c}`} cx={10 + c * 18} cy={10 + r * 18} r="2" fill="var(--primary)" />
            ))
          )}
        </svg>
      </div>

      {/* Decorative quarter-circles */}
      <div className="absolute -start-24 sm:-start-32 bottom-32 w-48 sm:w-64 h-48 sm:h-64 rounded-full border-[30px] sm:border-[40px] border-[var(--primary)] opacity-[0.06] dark:opacity-[0.12] pointer-events-none" />
      <div className="absolute -end-24 sm:-end-32 top-20 w-56 sm:w-72 h-56 sm:h-72 rounded-full border-[30px] sm:border-[40px] border-[var(--primary)] opacity-[0.05] dark:opacity-[0.08] pointer-events-none" />

      {/* ── Top nav ───────────────────────────────────────────────── */}
      <header className="relative z-10">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-5 sm:pt-6 flex items-center justify-between gap-3">

          {/* Brand */}
          <div className="flex items-center gap-2.5 shrink-0">
            <BrandLogo size={38} />
            {/* brand text hidden on very small screens */}
            <div className="hidden xs:block text-start leading-tight">
              <div className="text-[15px] font-bold text-[var(--foreground)]">منصة التوظيف</div>
              <div className="text-[10px] text-[var(--muted-foreground)] -mt-0.5">ربط المواهب بالفرص</div>
            </div>
          </div>

          {/* Nav buttons — text labels hidden on mobile, icons only */}
          <div className="flex items-center gap-2">
            {/* Companies login — icon-only on mobile, full pill on md+ */}
            <button
              onClick={() => navigate("/login")}
              className="h-10 rounded-full bg-[var(--card)] border border-[var(--border)] hover:border-[var(--primary)] text-[var(--foreground)] flex items-center gap-2 transition-colors px-3 md:px-5"
            >
              <Icon name="briefcase" size={14} className="text-[var(--primary)]" />
              <span className="hidden md:inline text-[13.5px] font-medium">تسجيل دخول الشركات</span>
            </button>

            {/* Admin login — icon-only on mobile */}
            <button
              onClick={() => navigate("/login")}
              className="h-10 rounded-full bg-[var(--card)] border border-[var(--border)] hover:border-[var(--primary)] text-[var(--foreground)] flex items-center gap-2 transition-colors px-3 md:px-5"
            >
              <Icon name="settings" size={14} className="text-[var(--primary)]" />
              <span className="hidden md:inline text-[13.5px] font-medium">دخول الأدمن</span>
            </button>

            <button
              onClick={() => navigate("/contact")}
              className="h-10 rounded-full bg-[var(--card)] border border-[var(--border)] hover:border-[var(--primary)] text-[var(--foreground)] flex items-center gap-2 transition-colors px-3 md:px-5"
            >
              <Icon name="mail" size={14} className="text-[var(--primary)]" />
              <span className="hidden md:inline text-[13.5px] font-medium">اتصل بنا</span>
            </button>

            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-8 sm:pb-10 text-center">
        <h1 className="text-[38px] sm:text-[48px] lg:text-[56px] font-extrabold tracking-tight leading-[1.2] text-[var(--foreground)]">
          نربط <span className="text-[var(--primary)]">المواهب</span> بالفرص
        </h1>
        <p className="text-[13.5px] sm:text-[15px] text-[var(--muted-foreground)] mt-4 sm:mt-5 max-w-[560px] mx-auto leading-relaxed">
          منصة متكاملة للتوظيف تتيح للشركات والجهات العثور على أفضل الكفاءات بسهولة وكفاءة
        </p>

        {/* Two CTAs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 mt-7 sm:mt-9">
          <button
            onClick={() => navigate("/apply")}
            className="h-[60px] sm:h-[68px] w-full sm:min-w-[280px] sm:w-auto rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white px-6 flex items-center gap-4 transition-colors shadow-[0_8px_24px_-8px_oklch(0.55_0.18_30/0.5)]"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
              <Icon name="upload" size={17} />
            </div>
            <div className="text-start flex-1">
              <div className="text-[15px] sm:text-[16px] font-bold">رفع السيرة الذاتية</div>
              <div className="text-[11px] sm:text-[11.5px] text-white/80 mt-0.5">للأفراد الباحثين عن عمل</div>
            </div>
          </button>

          <button
            onClick={() => navigate("/login")}
            className="h-[60px] sm:h-[68px] w-full sm:min-w-[280px] sm:w-auto rounded-xl bg-[var(--card)] border-2 border-[var(--primary)] text-[var(--primary)] px-6 flex items-center gap-4 hover:bg-[var(--accent)] transition-colors"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[oklch(0.97_0.03_25)] dark:bg-[oklch(0.25_0.04_25)] flex items-center justify-center shrink-0">
              <Icon name="briefcase" size={17} />
            </div>
            <div className="text-start flex-1">
              <div className="text-[15px] sm:text-[16px] font-bold">تسجيل جهة توظيف</div>
              <div className="text-[11px] sm:text-[11.5px] text-[var(--muted-foreground)] mt-0.5">لشركات ومكاتب التوظيف</div>
            </div>
          </button>
        </div>
      </section>

      {/* ── Choose your path ──────────────────────────────────────── */}
      <section className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 pb-10 sm:pb-12">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-[20px] sm:text-[24px] font-bold text-[var(--foreground)] inline-flex items-center gap-2">
            اختر <span className="text-[var(--primary)]">مسارك</span>
          </h2>
        </div>

        {/* 1 col mobile → 2 col tablet → 4 col desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
          <PathCard
            num="1" title="مكاتب التوظيف"
            desc="سجل كمكتب توظيف واحصل على كودك الفريد وأضف المرشحين لديك"
            cta="سجل الآن" tone="rose" icon="users"
            onClick={() => navigate("/login")}
          />
          <PathCard
            num="2" title="الشركات"
            desc="تصفح قاعدة البيانات وابحث عن أفضل المواهب المناسبة لوظائفك"
            cta="ابدأ البحث" tone="sky" icon="briefcase"
            onClick={() => navigate("/careers")}
          />
          <PathCard
            num="3" title="الأفراد"
            desc="أضف معلوماتك مباشرة بدون الحاجة لإنشاء حساب وابدأ رحلتك المهنية"
            cta="أضف معلوماتك" tone="emerald" icon="user"
            onClick={() => navigate("/apply")}
          />
          <PathCard
            num="4" title="الأدمن"
            desc="إدارة المنصة والمستخدمين ومراقبة جميع العمليات والإعدادات"
            cta="دخول الأدمن" tone="violet" icon="settings"
            onClick={() => navigate("/login")}
          />
        </div>
      </section>

      {/* ── Contact CTA ───────────────────────────────────────────── */}
      <section className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 pb-10 sm:pb-12">
        <div className="rounded-2xl bg-[var(--primary)] px-6 py-8 sm:px-10 sm:py-10 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-[0_12px_40px_-12px_oklch(0.55_0.18_30/0.45)]">
          <div className="text-center sm:text-start">
            <h2 className="text-[20px] sm:text-[22px] font-bold text-white">
              هل لديك استفسار؟
            </h2>
            <p className="mt-1 text-[13px] sm:text-[13.5px] text-white/75">
              تواصل معنا وسيتم الرد عليك في أسرع وقت ممكن
            </p>
          </div>
          <button
            onClick={() => navigate("/contact")}
            className="shrink-0 flex items-center gap-2.5 rounded-xl bg-white px-6 py-3 text-[14px] font-bold text-[var(--primary)] transition-opacity hover:opacity-90"
          >
            <Icon name="mail" size={16} />
            اتصل بنا
          </button>
        </div>
      </section>

      {/* ── Unique code ───────────────────────────────────────────── */}
      <section className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 pb-16 sm:pb-20">
        <div className="max-w-[760px] mx-auto rounded-2xl border border-dashed border-[var(--primary)] bg-[var(--card)] p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 opacity-80 dark:opacity-70">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 border-dashed border-[var(--primary)] bg-[var(--background)] flex items-center justify-center shrink-0">
            <QrIcon />
          </div>
          <div className="flex-1 text-start">
            <div className="text-[14px] sm:text-[15px] font-bold mb-1 text-[var(--foreground)]">الكود الفريد</div>
            <div className="text-[12px] sm:text-[12.5px] text-[var(--muted-foreground)] leading-relaxed">
              كل مكتب توظيف يحصل على كود فريد خاص به يستخدم لإضافة وإدارة المرشحين بسهولة
            </div>
          </div>
          <div
            className="self-start sm:self-auto px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg bg-[var(--background)] border border-[var(--border)] font-mono text-[14px] sm:text-[16px] font-bold text-[var(--primary)] tabular-nums tracking-wider shrink-0"
            dir="ltr"
          >
            AG-2024-001234
          </div>
        </div>
      </section>
    </div>
  )
}
