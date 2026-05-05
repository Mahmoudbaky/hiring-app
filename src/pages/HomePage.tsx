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
      className="h-9 w-9 rounded-full border border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)] flex items-center justify-center transition-colors shadow-[0_1px_0_0_oklch(0.9_0.005_260/0.5),0_4px_12px_-6px_oklch(0.2_0.01_260/0.1)]"
    >
      {isDark ? (
        /* sun */
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--primary)]">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        /* moon */
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
  num,
  title,
  desc,
  cta,
  tone,
  icon,
  onClick,
}: {
  num: string
  title: string
  desc: string
  cta: string
  tone: Tone
  icon: string
  onClick: () => void
}) {
  const t = TONE_CLASSES[tone]
  return (
    <button
      onClick={onClick}
      className="group text-start bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5 hover:border-[var(--primary)] hover:-translate-y-0.5 hover:shadow-[0_12px_30px_-15px_oklch(0.2_0.01_260/0.2)] dark:hover:shadow-[0_12px_30px_-15px_oklch(0_0_0/0.4)] transition-all"
    >
      <div className="flex items-start justify-between mb-3 gap-3">
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", t.bg, t.bgDark, t.text, t.textDark)}>
          <Icon name={icon as any} size={20} />
        </div>
        <div className={cn("text-[16px] font-bold text-end", t.text, t.textDark)}>
          {num}. {title}
        </div>
      </div>
      <p className="text-[12.5px] text-[var(--muted-foreground)] leading-[1.85] mb-4 min-h-[64px]">
        {desc}
      </p>
      <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between gap-1.5 text-[13px] font-medium text-[var(--primary)]">
        <Icon name="chevLeft" size={14} />
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
      {/* Decorative dots */}
      <div className="absolute top-[180px] start-0 opacity-30 dark:opacity-20 pointer-events-none">
        <svg width="80" height="200" viewBox="0 0 80 200">
          {Array.from({ length: 10 }).map((_, r) =>
            Array.from({ length: 4 }).map((_, c) => (
              <circle
                key={`${r}-${c}`}
                cx={10 + c * 18}
                cy={10 + r * 18}
                r="2"
                fill="var(--primary)"
              />
            ))
          )}
        </svg>
      </div>

      {/* Decorative quarter-circles */}
      <div className="absolute -start-32 bottom-32 w-64 h-64 rounded-full border-[40px] border-[var(--primary)] opacity-[0.06] dark:opacity-[0.12] pointer-events-none" />
      <div className="absolute -end-32 top-20 w-72 h-72 rounded-full border-[40px] border-[var(--primary)] opacity-[0.05] dark:opacity-[0.08] pointer-events-none" />

      {/* Top nav */}
      <header className="relative z-10">
        <div className="max-w-[1200px] mx-auto px-6 pt-6 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <BrandLogo size={44} />
            <div className="text-start leading-tight">
              <div className="text-[16px] font-bold text-[var(--foreground)]">منصة التوظيف</div>
              <div className="text-[11px] text-[var(--muted-foreground)] -mt-0.5">ربط المواهب بالفرص</div>
            </div>
          </div>

          {/* Nav buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/login")}
              className="h-11 px-5 rounded-full bg-[var(--card)] border border-[var(--border)] hover:border-[var(--primary)] text-[13.5px] font-medium text-[var(--foreground)] flex items-center gap-2 transition-colors shadow-[0_1px_0_0_oklch(0.9_0.005_260/0.4),0_4px_16px_-8px_oklch(0.2_0.01_260/0.1)]"
            >
              <Icon name="briefcase" size={14} className="text-[var(--primary)]" />
              <span>تسجيل دخول الشركات</span>
            </button>
            <button
              onClick={() => navigate("/login")}
              className="h-11 px-5 rounded-full bg-[var(--card)] border border-[var(--border)] hover:border-[var(--primary)] text-[13.5px] font-medium text-[var(--foreground)] flex items-center gap-2 transition-colors shadow-[0_1px_0_0_oklch(0.9_0.005_260/0.4),0_4px_16px_-8px_oklch(0.2_0.01_260/0.1)]"
            >
              <Icon name="settings" size={14} className="text-[var(--primary)]" />
              <span>دخول الأدمن</span>
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 max-w-[1200px] mx-auto px-6 pt-16 pb-10 text-center">
        <h1 className="text-[56px] font-extrabold tracking-tight leading-[1.15] text-[var(--foreground)]">
          نربط <span className="text-[var(--primary)]">المواهب</span> بالفرص
        </h1>
        <p className="text-[15px] text-[var(--muted-foreground)] mt-5 max-w-[640px] mx-auto leading-relaxed">
          منصة متكاملة للتوظيف تتيح للشركات والجهات العثور على أفضل الكفاءات بسهولة وكفاءة
        </p>

        {/* Two CTAs */}
        <div className="flex items-center justify-center gap-4 mt-9 flex-wrap">
          <button
            onClick={() => navigate("/apply")}
            className="group h-[68px] min-w-[280px] rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white px-6 flex items-center gap-4 transition-colors shadow-[0_8px_24px_-8px_oklch(0.55_0.18_30/0.5)]"
          >
            <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
              <Icon name="upload" size={18} />
            </div>
            <div className="text-start flex-1">
              <div className="text-[16px] font-bold">رفع السيرة الذاتية</div>
              <div className="text-[11.5px] text-white/80 mt-0.5">للأفراد الباحثين عن عمل</div>
            </div>
          </button>

          <button
            onClick={() => navigate("/login")}
            className="group h-[68px] min-w-[280px] rounded-xl bg-[var(--card)] border-2 border-[var(--primary)] text-[var(--primary)] px-6 flex items-center gap-4 hover:bg-[var(--accent)] transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-[oklch(0.97_0.03_25)] dark:bg-[oklch(0.25_0.04_25)] flex items-center justify-center shrink-0">
              <Icon name="briefcase" size={18} />
            </div>
            <div className="text-start flex-1">
              <div className="text-[16px] font-bold">تسجيل جهة توظيف</div>
              <div className="text-[11.5px] text-[var(--muted-foreground)] mt-0.5">لشركات ومكاتب التوظيف</div>
            </div>
          </button>
        </div>
      </section>

      {/* Choose your path */}
      <section className="relative z-10 max-w-[1200px] mx-auto px-6 pb-12">
        <div className="text-center mb-8">
          <h2 className="text-[24px] font-bold text-[var(--foreground)] inline-flex items-center gap-2">
            اختر <span className="text-[var(--primary)]">مسارك</span>
          </h2>
        </div>

        <div className="grid grid-cols-4 gap-5">
          <PathCard
            num="1"
            title="مكاتب التوظيف"
            desc="سجل كمكتب توظيف واحصل على كودك الفريد وأضف المرشحين لديك"
            cta="سجل الآن"
            tone="rose"
            icon="users"
            onClick={() => navigate("/login")}
          />
          <PathCard
            num="2"
            title="الشركات"
            desc="تصفح قاعدة البيانات وابحث عن أفضل المواهب المناسبة لوظائفك"
            cta="ابدأ البحث"
            tone="sky"
            icon="briefcase"
            onClick={() => navigate("/careers")}
          />
          <PathCard
            num="3"
            title="الأفراد"
            desc="أضف معلوماتك مباشرة بدون الحاجة لإنشاء حساب وابدأ رحلتك المهنية"
            cta="أضف معلوماتك"
            tone="emerald"
            icon="user"
            onClick={() => navigate("/apply")}
          />
          <PathCard
            num="4"
            title="الأدمن"
            desc="إدارة المنصة والمستخدمين ومراقبة جميع العمليات والإعدادات"
            cta="دخول الأدمن"
            tone="violet"
            icon="settings"
            onClick={() => navigate("/login")}
          />
        </div>
      </section>

      {/* Unique code section */}
      <section className="relative z-10 max-w-[1200px] mx-auto px-6 pb-20">
        <div className="max-w-[760px] mx-auto rounded-2xl border border-dashed border-[var(--primary)] bg-[var(--card)] p-6 flex items-center gap-5 opacity-80 dark:opacity-70">
          <div className="w-16 h-16 rounded-xl border-2 border-dashed border-[var(--primary)] bg-[var(--background)] flex items-center justify-center shrink-0">
            <QrIcon />
          </div>
          <div className="flex-1 text-start">
            <div className="text-[15px] font-bold mb-1 text-[var(--foreground)]">الكود الفريد</div>
            <div className="text-[12.5px] text-[var(--muted-foreground)] leading-relaxed">
              كل مكتب توظيف يحصل على كود فريد خاص به يستخدم لإضافة وإدارة المرشحين بسهولة
            </div>
          </div>
          <div
            className="px-5 py-3 rounded-lg bg-[var(--background)] border border-[var(--border)] font-mono text-[16px] font-bold text-[var(--primary)] tabular-nums tracking-wider shrink-0"
            dir="ltr"
          >
            AG-2024-001234
          </div>
        </div>
      </section>
    </div>
  )
}
