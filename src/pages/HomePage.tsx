import { useNavigate } from "react-router-dom"
import { Icon } from "@/components/icons"
import { BrandLogo } from "@/components/shell"
import { ThemeToggle } from "@/components/theme-toggle"


/* ── Path card ────────────────────────────────────────────────────── */
// type Tone = "rose" | "sky" | "emerald" | "violet"

// const TONE_CLASSES: Record<
//   Tone,
//   { bg: string; bgDark: string; text: string; textDark: string }
// > = {
//   rose: {
//     bg: "bg-[oklch(0.97_0.03_25)]",
//     bgDark: "dark:bg-[oklch(0.25_0.04_25)]",
//     text: "text-[oklch(0.55_0.17_25)]",
//     textDark: "dark:text-[oklch(0.78_0.15_25)]",
//   },
//   sky: {
//     bg: "bg-[oklch(0.97_0.03_230)]",
//     bgDark: "dark:bg-[oklch(0.25_0.04_230)]",
//     text: "text-[oklch(0.5_0.13_230)]",
//     textDark: "dark:text-[oklch(0.72_0.12_230)]",
//   },
//   emerald: {
//     bg: "bg-[oklch(0.97_0.04_155)]",
//     bgDark: "dark:bg-[oklch(0.25_0.05_155)]",
//     text: "text-[oklch(0.5_0.13_155)]",
//     textDark: "dark:text-[oklch(0.72_0.13_155)]",
//   },
//   violet: {
//     bg: "bg-[oklch(0.97_0.03_295)]",
//     bgDark: "dark:bg-[oklch(0.25_0.04_295)]",
//     text: "text-[oklch(0.55_0.14_295)]",
//     textDark: "dark:text-[oklch(0.75_0.13_295)]",
//   },
// }

// function PathCard({
//   num,
//   title,
//   desc,
//   cta,
//   tone,
//   icon,
//   onClick,
// }: {
//   num: string
//   title: string
//   desc: string
//   cta: string
//   tone: Tone
//   icon: string
//   onClick: () => void
// }) {
//   const t = TONE_CLASSES[tone]
//   return (
//     <button
//       onClick={onClick}
//       className="group w-full rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 text-start transition-all hover:-translate-y-0.5 hover:border-[var(--primary)] hover:shadow-[0_12px_30px_-15px_oklch(0.2_0.01_260/0.2)] sm:p-5 dark:hover:shadow-[0_12px_30px_-15px_oklch(0_0_0/0.4)]"
//     >
//       <div className="mb-3 flex items-start justify-between gap-2">
//         <div
//           className={cn(
//             "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12",
//             t.bg,
//             t.bgDark,
//             t.text,
//             t.textDark
//           )}
//         >
//           <Icon name={icon as any} size={18} />
//         </div>
//         <div
//           className={cn(
//             "text-end text-[14px] leading-snug font-bold sm:text-[16px]",
//             t.text,
//             t.textDark
//           )}
//         >
//           {num}. {title}
//         </div>
//       </div>
//       <p className="mb-4 min-h-[56px] text-[12px] leading-[1.85] text-[var(--muted-foreground)] sm:text-[12.5px]">
//         {desc}
//       </p>
//       <div className="flex items-center justify-between gap-1.5 border-t border-[var(--border)] pt-3 text-[12.5px] font-medium text-[var(--primary)] sm:text-[13px]">
//         <Icon name="chevLeft" size={13} />
//         <span>{cta}</span>
//       </div>
//     </button>
//   )
// }

// /* ── QR icon ──────────────────────────────────────────────────────── */
// function QrIcon() {
//   return (
//     <svg
//       width="28"
//       height="28"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="var(--primary)"
//       strokeWidth="1.6"
//     >
//       <rect x="3" y="3" width="7" height="7" rx="1" />
//       <rect x="14" y="3" width="7" height="7" rx="1" />
//       <rect x="3" y="14" width="7" height="7" rx="1" />
//       <path d="M14 14h3v3h-3zM18 18h3v3h-3z" />
//     </svg>
//   )
// }

/* ── Home page ────────────────────────────────────────────────────── */
export function HomePage() {
  const navigate = useNavigate()

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-[var(--background)]"
      dir="rtl"
    >
      {/* Decorative dots — hidden on small screens to reduce noise */}
      <div className="pointer-events-none absolute start-0 top-[180px] hidden opacity-30 sm:block dark:opacity-20">
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
      <div className="pointer-events-none absolute -start-24 bottom-32 h-48 w-48 rounded-full border-[30px] border-[var(--primary)] opacity-[0.06] sm:-start-32 sm:h-64 sm:w-64 sm:border-[40px] dark:opacity-[0.12]" />
      <div className="pointer-events-none absolute -end-24 top-20 h-56 w-56 rounded-full border-[30px] border-[var(--primary)] opacity-[0.05] sm:-end-32 sm:h-72 sm:w-72 sm:border-[40px] dark:opacity-[0.08]" />

      {/* ── Top nav ───────────────────────────────────────────────── */}
      <header className="relative z-10">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-3 px-4 pt-5 sm:px-6 sm:pt-6">
          {/* Brand */}
          <div className="flex shrink-0 items-center gap-2.5">
            <BrandLogo size={38} />
            {/* brand text hidden on very small screens */}
            <div className="xs:block hidden text-start leading-tight">
              <div className="text-[15px] font-bold text-[var(--foreground)]">
                منصة التوظيف
              </div>
              <div className="-mt-0.5 text-[10px] text-[var(--muted-foreground)]">
                ربط المواهب بالفرص
              </div>
            </div>
          </div>

          {/* Nav buttons — text labels hidden on mobile, icons only */}
          <div className="flex items-center gap-2">
            {/* Companies login — icon-only on mobile, full pill on md+ */}
            <button
              onClick={() => navigate("/login")}
              className="flex h-10 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-3 text-[var(--foreground)] transition-colors hover:border-[var(--primary)] md:px-5"
            >
              <Icon
                name="briefcase"
                size={17}
                className="text-[var(--primary)]"
              />
              <span className="hidden text-[13.5px] font-medium md:inline">
                تسجيل دخول الشركات
              </span>
            </button>

            {/* Admin login — icon-only on mobile */}
            {/* <button
              onClick={() => navigate("/login")}
              className="flex h-10 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-3 text-[var(--foreground)] transition-colors hover:border-[var(--primary)] md:px-5"
            >
              <Icon
                name="settings"
                size={14}
                className="text-[var(--primary)]"
              />
              <span className="hidden text-[13.5px] font-medium md:inline">
                دخول الأدمن
              </span>
            </button> */}

            <button
              onClick={() => navigate("/contact")}
              className="flex h-10 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-3 text-[var(--foreground)] transition-colors hover:border-[var(--primary)] md:px-5"
            >
              <Icon name="mail" size={17} className="text-[var(--primary)]" />
              <span className="hidden text-[13.5px] font-medium md:inline">
                اتصل بنا
              </span>
            </button>

            <ThemeToggle size={17} />
          </div>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-[1200px] px-4 pt-12 pb-8 text-center sm:px-6 sm:pt-16 sm:pb-10">
        <h1 className="text-[38px] leading-[1.2] font-extrabold tracking-tight text-[var(--foreground)] sm:text-[48px] lg:text-[56px]">
          نربط <span className="text-[var(--primary)]">المواهب</span> بالفرص
        </h1>
        <p className="mx-auto mt-4 max-w-[560px] text-[13.5px] leading-relaxed text-[var(--muted-foreground)] sm:mt-5 sm:text-[15px]">
          منصة متكاملة للتوظيف تتيح للشركات والجهات العثور على أفضل الكفاءات
          بسهولة وكفاءة
        </p>

        {/* Three CTAs */}
        <div className="mt-7 flex flex-col items-stretch justify-center gap-3 sm:mt-9 lg:flex-row lg:items-center">
          <button
            onClick={() => navigate("/apply")}
            className="flex h-[60px] w-full items-center gap-4 rounded-xl bg-[var(--primary)] px-6 text-white shadow-[0_8px_24px_-8px_rgba(24,31,115,0.5)] transition-colors hover:bg-[var(--primary-hover)] sm:h-[68px] lg:w-auto lg:min-w-[240px]"
          >
            <Icon name="upload" size={24} className="shrink-0" />
            <div className="flex-1 text-start">
              <div className="text-[15px] font-bold sm:text-[16px]">
                رفع السيرة الذاتية
              </div>
              <div className="mt-0.5 text-[11px] text-white/80 sm:text-[11.5px]">
                للأفراد الباحثين عن عمل
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate("/login")}
            className="flex h-[60px] w-full items-center gap-4 rounded-xl border-2 border-[var(--primary)] bg-[var(--card)] px-6 text-[var(--primary)] transition-colors hover:bg-[var(--accent)] sm:h-[68px] lg:w-auto lg:min-w-[240px]"
          >
            <Icon name="briefcase" size={24} className="shrink-0" />
            <div className="flex-1 text-start">
              <div className="text-[15px] font-bold sm:text-[16px]">
                تسجيل جهة توظيف
              </div>
              <div className="mt-0.5 text-[11px] text-[var(--muted-foreground)] sm:text-[11.5px]">
                لمكاتب التوظيف
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate("/login")}
            className="flex h-[60px] w-full items-center gap-4 rounded-xl border-2 border-[var(--primary)] bg-[var(--card)] px-6 text-[var(--primary)] transition-colors hover:bg-[var(--accent)] sm:h-[68px] lg:w-auto lg:min-w-[240px]"
          >
            <Icon name="building2" size={24} className="shrink-0" />
            <div className="flex-1 text-start">
              <div className="text-[15px] font-bold sm:text-[16px]">
                الشركات العميلة
              </div>
              <div className="mt-0.5 text-[11px] text-[var(--muted-foreground)] sm:text-[11.5px]">
                ابحث عن أفضل الكفاءات لشركتك
              </div>
            </div>
          </button>
        </div>
      </section>

      {/* ── Choose your path ──────────────────────────────────────── */}
      {/* <section className="relative z-10 mx-auto max-w-[1200px] px-4 pb-10 sm:px-6 sm:pb-12"> */}
      {/* <div className="mb-6 text-center sm:mb-8">
          <h2 className="inline-flex items-center gap-2 text-[20px] font-bold text-[var(--foreground)] sm:text-[24px]">
            اختر <span className="text-[var(--primary)]">مسارك</span>
          </h2>
        </div> */}

      {/* 1 col mobile → 2 col tablet → 3 col desktop */}
      {/* <div className="mx-auto grid w-full max-w-[900px] grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-5">
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
          /> */}
      {/* <PathCard
            num="4"
            title="الأدمن"
            desc="إدارة المنصة والمستخدمين ومراقبة جميع العمليات والإعدادات"
            cta="دخول الأدمن"
            tone="violet"
            icon="settings"
            onClick={() => navigate("/login")}
          /> */}
      {/* </div> */}
      {/* </section> */}

      {/* ── Contact CTA ───────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-[1200px] px-4 pb-10 sm:px-6 sm:pb-12">
        <div className="flex flex-col items-center justify-between gap-5 rounded-2xl bg-[var(--primary)] px-6 py-8 shadow-[0_12px_40px_-12px_oklch(0.55_0.18_30/0.45)] sm:flex-row sm:px-10 sm:py-10">
          <div className="text-center sm:text-start">
            <h2 className="text-[20px] font-bold text-white sm:text-[22px]">
              هل لديك استفسار؟
            </h2>
            <p className="mt-1 text-[13px] text-white/75 sm:text-[13.5px]">
              تواصل معنا وسيتم الرد عليك في أسرع وقت ممكن
            </p>
          </div>
          <button
            onClick={() => navigate("/contact")}
            className="flex shrink-0 items-center gap-2.5 rounded-xl bg-white px-6 py-3 text-[14px] font-bold text-[var(--primary)] transition-opacity hover:opacity-90"
          >
            <Icon name="mail" size={17} />
            اتصل بنا
          </button>
        </div>
      </section>

      {/* ── Unique code ───────────────────────────────────────────── */}
      {/* <section className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 pb-16 sm:pb-20">
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
      </section> */}
    </div >
  )
}
