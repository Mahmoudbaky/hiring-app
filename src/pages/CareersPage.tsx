import { useState } from 'react';
import { Icon } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { DSelect } from '@/components/shell';
import { Btn, BrandLogo, DInput } from '@/components/shell';
import type { Job } from '@/types';

/* ── Public header ────────────────────────────────────────────────── */
function PublicHeader({
  onHome, onGoApply,
}: {
  onHome: () => void;
  onGoApply: (id: number | null) => void;
}) {
  return (
    <header className="bg-[var(--background)] border-b border-[var(--border)] sticky top-0 z-30">
      <div className="max-w-[1120px] mx-auto px-6 h-16 flex items-center justify-between">
        <button onClick={onHome} className="flex items-center gap-3">
          <BrandLogo size={36} />
          <span className="ps-3 border-s border-[var(--border)] text-[13.5px] text-[var(--muted-foreground)]">
            الوظائف المتاحة
          </span>
        </button>
        <nav className="flex items-center gap-1 text-[13.5px]">
          <button onClick={onHome} className="h-9 px-3 rounded-md hover:bg-[var(--accent)]">الوظائف</button>
          <button className="h-9 px-3 rounded-md hover:bg-[var(--accent)] text-[var(--muted-foreground)]">عن الشركة</button>
          <button className="h-9 px-3 rounded-md hover:bg-[var(--accent)] text-[var(--muted-foreground)]">تواصل</button>
          <div className="mx-2 h-6 w-px bg-[var(--border)]" />
          <Btn size="sm" onClick={() => onGoApply(null)}>
            <Icon name="send" size={13} /> تقديم طلب عام
          </Btn>
        </nav>
      </div>
    </header>
  );
}

/* ── Job listings page ────────────────────────────────────────────── */
interface ListingsProps {
  jobs: Job[];
  onOpenJob: (id: number) => void;
  onGoApply: (id: number | null) => void;
}

export function JobListingsPage({ jobs, onOpenJob, onGoApply }: ListingsProps) {
  const [q, setQ]       = useState('');
  const [dept, setDept] = useState('all');
  const [type, setType] = useState('all');

  const depts = ['all', ...new Set(jobs.map((j) => j.dept))];

  const filtered = jobs
    .filter((j) => j.published)
    .filter((j) => !q || j.title.includes(q) || j.dept.includes(q))
    .filter((j) => dept === 'all' || j.dept === dept)
    .filter((j) => type === 'all' || (type === 'remote' ? j.remote : j.type === 'دوام كامل' && !j.remote));

  return (
    <div className="min-h-screen bg-[var(--background)]" dir="rtl">
      <PublicHeader onHome={() => {}} onGoApply={onGoApply} />

      <section className="max-w-[1120px] mx-auto px-6 pt-14 pb-10">
        <div className="max-w-[640px]">
          <Badge variant="rose" className="mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
            {filtered.length} وظيفة شاغرة الآن
          </Badge>
          <h1 className="text-[42px] font-bold tracking-tight leading-[1.15]">
            ابنِ مستقبلك المهني<br />
            معنا في <span className="text-[var(--primary)]">ضم</span>.
          </h1>
          <p className="text-[15px] text-[var(--muted-foreground)] mt-4 leading-relaxed">
            نبحث عن عقول شغوفة لصنع منتجات يستخدمها آلاف العملاء يومياً.
            استعرض الفرص المتاحة وقدّم طلبك خلال دقائق.
          </p>
        </div>

        <Card className="mt-8">
          <div className="p-4 flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[240px]">
            <DInput
              placeholder="ابحث عن مسمى وظيفي أو قسم…"
              icon={<Icon name="search" size={14} />}
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <DSelect
            value={dept} onChange={(v) => setDept(String(v))} className="min-w-[180px]"
            options={[{ value: 'all', label: 'جميع الأقسام' }, ...depts.filter((d) => d !== 'all').map((d) => ({ value: d, label: d }))]}
          />
          <DSelect
            value={type} onChange={(v) => setType(String(v))} className="min-w-[150px]"
            options={[
              { value: 'all', label: 'جميع الأنواع' },
              { value: 'fulltime', label: 'دوام كامل' },
              { value: 'remote', label: 'عن بعد' },
            ]}
          />
          </div>
        </Card>
      </section>

      <section className="max-w-[1120px] mx-auto px-6 pb-20">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[18px] font-semibold">{filtered.length} وظيفة متاحة</h2>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-[var(--muted-foreground)]">
            لا توجد وظائف متاحة تطابق البحث
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {filtered.map((j) => (
            <Card
              key={j.id}
              className="p-5 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onOpenJob(j.id)}
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl tone-primary flex items-center justify-center shrink-0">
                  <Icon name="briefcase" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-[16px]">{j.title}</h3>
                  <div className="text-[13px] text-[var(--muted-foreground)] mt-0.5">{j.dept}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap mb-4">
                <Badge variant="neutral">{j.type}</Badge>
                {j.remote && <Badge variant="sky">عن بعد</Badge>}
                <Badge variant="neutral">{j.salary}</Badge>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
                <div className="flex items-center gap-1.5 text-[12.5px] text-[var(--muted-foreground)]">
                  <Icon name="users" size={14} />
                  <span className="tabular font-medium text-[var(--foreground)]">{j.applicants}</span>
                  <span>متقدم</span>
                  <span className="mx-1">•</span>
                  <span>{j.created}</span>
                </div>
                <Btn
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); onGoApply(j.id); }}
                >
                  قدّم الآن
                </Btn>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ── Job detail page ──────────────────────────────────────────────── */
interface DetailProps {
  job: Job | undefined;
  onBack: () => void;
  onApply: (id: number) => void;
}

export function JobDetailPage({ job, onBack, onApply }: DetailProps) {
  if (!job) return null;

  return (
    <div className="min-h-screen bg-[var(--background)]" dir="rtl">
      <PublicHeader onHome={onBack} onGoApply={() => onApply(job.id)} />

      <div className="max-w-[1120px] mx-auto px-6 py-10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[13.5px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-8"
        >
          <Icon name="chevRight" size={16} /> العودة إلى الوظائف
        </button>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <Card className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 rounded-xl tone-primary flex items-center justify-center shrink-0">
                  <Icon name="briefcase" size={26} />
                </div>
                <div>
                  <h1 className="text-[24px] font-bold">{job.title}</h1>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge variant="neutral">{job.dept}</Badge>
                    <Badge variant="neutral">{job.type}</Badge>
                    {job.remote && <Badge variant="sky">عن بعد</Badge>}
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-[16px] font-semibold mb-3">عن الوظيفة</h2>
                <p className="text-[14px] text-[var(--muted-foreground)] leading-relaxed">
                  نحن نبحث عن محترف موهوب للانضمام إلى فريقنا. ستعمل على مشاريع متنوعة وتحديات تقنية
                  مثيرة في بيئة عمل داعمة وتشجع على الإبداع والتطوير المستمر.
                </p>
              </div>

              <div className="mt-6">
                <h2 className="text-[16px] font-semibold mb-3">المسؤوليات الرئيسية</h2>
                <ul className="space-y-2 text-[14px] text-[var(--muted-foreground)]">
                  {['تطوير وصيانة التطبيقات وفق أفضل الممارسات', 'التعاون مع فريق التصميم والمنتج لتحقيق تجربة مستخدم متميزة', 'إجراء مراجعات الكود وضمان الجودة', 'المشاركة في اجتماعات التخطيط والتطوير'].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Icon name="check" size={15} className="text-[var(--primary)] mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6">
                <h2 className="text-[16px] font-semibold mb-3">المتطلبات</h2>
                <ul className="space-y-2 text-[14px] text-[var(--muted-foreground)]">
                  {['خبرة لا تقل عن 3 سنوات في المجال', 'إلمام عميق بأحدث التقنيات والأدوات', 'قدرة على العمل ضمن فريق متعدد التخصصات', 'مهارات تواصل ممتازة'].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Icon name="check" size={15} className="text-[var(--primary)] mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="p-5">
              <h3 className="text-[15px] font-semibold mb-4">تفاصيل الوظيفة</h3>
              <div className="space-y-3">
                {[
                  { icon: 'briefcase', label: 'القسم',         value: job.dept },
                  { icon: 'clock',     label: 'نوع العمل',     value: job.type },
                  { icon: 'globe',     label: 'طريقة العمل',   value: job.remote ? 'عن بعد' : 'من المكتب' },
                  { icon: 'users',     label: 'عدد المتقدمين', value: `${job.applicants} متقدم` },
                  { icon: 'calendar',  label: 'تاريخ النشر',   value: job.created },
                ].map((row) => (
                  <div key={row.label} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md tone-sky flex items-center justify-center shrink-0">
                      <Icon name={row.icon} size={14} />
                    </div>
                    <div>
                      <div className="text-[11px] text-[var(--muted-foreground)]">{row.label}</div>
                      <div className="text-[13.5px] font-medium">{row.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 p-3 rounded-lg bg-[oklch(0.97_0.03_30)] border border-[oklch(0.92_0.06_30)]">
                <div className="text-[12px] text-[var(--muted-foreground)] mb-0.5">الراتب الشهري</div>
                <div className="text-[20px] font-bold text-[var(--primary)]">{job.salary}</div>
              </div>

              <Btn className="w-full mt-4" onClick={() => onApply(job.id)}>
                <Icon name="send" size={14} /> قدّم الآن
              </Btn>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
