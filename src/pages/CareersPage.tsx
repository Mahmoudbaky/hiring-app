import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icon } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Btn, BrandLogo, DInput } from '@/components/shell';
import { usePublishedJob, usePublishedJobs } from '@/hooks/useCareers';
import type { PublicJob } from '@/types/api';

/* ── helpers ──────────────────────────────────────────────────────── */
const AD_TYPE_LABEL: Record<PublicJob['adType'], string> = {
  remote:  'عن بعد',
  on_site: 'في المكتب',
  hybrid:  'هجين',
};

function salaryLabel(job: PublicJob) {
  if (!job.salaryFrom && !job.salaryTo) return null;
  if (job.salaryFrom && job.salaryTo)
    return `${job.salaryFrom.toLocaleString('ar-SA')} – ${job.salaryTo.toLocaleString('ar-SA')} ر.س`;
  return `${(job.salaryFrom ?? job.salaryTo)!.toLocaleString('ar-SA')} ر.س`;
}

/* ── Public header ────────────────────────────────────────────────── */
function PublicHeader() {
  const navigate = useNavigate();
  return (
    <header className="bg-[var(--background)] border-b border-[var(--border)] sticky top-0 z-30" dir="rtl">
      <div className="max-w-[1120px] mx-auto px-6 h-16 flex items-center justify-between">
        <button onClick={() => navigate('/careers')} className="flex items-center gap-3">
          <BrandLogo size={36} />
          <span className="ps-3 border-s border-[var(--border)] text-[13.5px] text-[var(--muted-foreground)]">
            الوظائف المتاحة
          </span>
        </button>
        <nav className="flex items-center gap-1 text-[13.5px]">
          <button onClick={() => navigate('/careers')} className="h-9 px-3 rounded-md hover:bg-[var(--accent)]">
            الوظائف
          </button>
          <div className="mx-2 h-6 w-px bg-[var(--border)]" />
          <Btn size="sm" onClick={() => navigate('/apply')}>
            <Icon name="send" size={13} /> تقديم طلب
          </Btn>
        </nav>
      </div>
    </header>
  );
}

/* ── Job card ─────────────────────────────────────────────────────── */
function JobCard({ job, onClick }: { job: PublicJob; onClick: () => void }) {
  const navigate = useNavigate();
  const salary   = salaryLabel(job);

  return (
    <Card
      className="p-5 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl tone-rose flex items-center justify-center shrink-0">
          <Icon name="briefcase" size={20} />
        </div>
        <div>
          <h3 className="font-semibold text-[16px]">{job.adTitle}</h3>
          <div className="text-[13px] text-[var(--muted-foreground)] mt-0.5">
            {AD_TYPE_LABEL[job.adType]}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap mb-4">
        <Badge tone="neutral">{AD_TYPE_LABEL[job.adType]}</Badge>
        {salary && <Badge tone="amber">{salary}</Badge>}
        {job.deadline && (
          <Badge tone="rose">
            ينتهي {new Date(job.deadline).toLocaleDateString('ar-SA')}
          </Badge>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
        <div className="text-[12.5px] text-[var(--muted-foreground)]">
          {new Date(job.createdAt).toLocaleDateString('ar-SA')}
        </div>
        <Btn
          size="sm"
          onClick={(e) => { e.stopPropagation(); navigate(`/apply?jobId=${job.id}`); }}
        >
          قدّم الآن
        </Btn>
      </div>
    </Card>
  );
}

/* ── Listings page ────────────────────────────────────────────────── */
export function CareersPage() {
  const navigate          = useNavigate();
  const { data: jobs = [], isLoading, isError } = usePublishedJobs();
  const [q, setQ]         = useState('');
  const [type, setType]   = useState<PublicJob['adType'] | 'all'>('all');

  const filtered = jobs
    .filter((j) => !q || j.adTitle.includes(q))
    .filter((j) => type === 'all' || j.adType === type);

  return (
    <div className="min-h-screen bg-[var(--background)]" dir="rtl">
      <PublicHeader />

      <section className="max-w-[1120px] mx-auto px-6 pt-14 pb-10">
        <div className="max-w-[640px]">
          <Badge tone="rose" className="mb-4">
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

        <Card className="mt-8 p-4 flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[240px]">
            <DInput
              placeholder="ابحث عن مسمى وظيفي…"
              icon={<Icon name="search" size={14} />}
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'remote', 'on_site', 'hybrid'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`h-9 px-3 rounded-md text-[13px] border transition-colors ${
                  type === t
                    ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                    : 'border-[var(--border)] hover:bg-[var(--accent)]'
                }`}
              >
                {{ all: 'الكل', remote: 'عن بعد', on_site: 'في المكتب', hybrid: 'هجين' }[t]}
              </button>
            ))}
          </div>
        </Card>
      </section>

      <section className="max-w-[1120px] mx-auto px-6 pb-20">
        {isLoading && (
          <div className="flex justify-center py-20">
            <svg viewBox="0 0 24 24" width="28" height="28" className="animate-spin text-[var(--primary)]">
              <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="40 60" />
            </svg>
          </div>
        )}

        {isError && (
          <div className="text-center py-20 text-[var(--destructive)]">
            تعذّر تحميل الوظائف، يرجى المحاولة مجدداً.
          </div>
        )}

        {!isLoading && !isError && filtered.length === 0 && (
          <div className="text-center py-20 text-[var(--muted-foreground)]">
            لا توجد وظائف متاحة تطابق البحث.
          </div>
        )}

        {!isLoading && !isError && filtered.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[18px] font-semibold">{filtered.length} وظيفة متاحة</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filtered.map((j) => (
                <JobCard
                  key={j.id}
                  job={j}
                  onClick={() => navigate(`/careers/${j.id}`)}
                />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

/* ── Job detail page ──────────────────────────────────────────────── */
export function JobDetailPage() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: job, isLoading } = usePublishedJob(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)]" dir="rtl">
        <PublicHeader />
        <div className="flex justify-center py-20">
          <svg viewBox="0 0 24 24" width="28" height="28" className="animate-spin text-[var(--primary)]">
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="40 60" />
          </svg>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-[var(--background)]" dir="rtl">
        <PublicHeader />
        <div className="text-center py-20 text-[var(--muted-foreground)]">الوظيفة غير موجودة.</div>
      </div>
    );
  }

  const salary = salaryLabel(job);

  return (
    <div className="min-h-screen bg-[var(--background)]" dir="rtl">
      <PublicHeader />

      <div className="max-w-[1120px] mx-auto px-6 py-10">
        <button
          onClick={() => navigate('/careers')}
          className="flex items-center gap-2 text-[13.5px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-8"
        >
          <Icon name="chevRight" size={16} /> العودة إلى الوظائف
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 rounded-xl tone-rose flex items-center justify-center shrink-0">
                  <Icon name="briefcase" size={26} />
                </div>
                <div>
                  <h1 className="text-[24px] font-bold">{job.adTitle}</h1>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge tone="neutral">{AD_TYPE_LABEL[job.adType]}</Badge>
                    {salary && <Badge tone="amber">{salary}</Badge>}
                  </div>
                </div>
              </div>

              {job.description && (
                <div>
                  <h2 className="text-[16px] font-semibold mb-3">عن الوظيفة</h2>
                  <p className="text-[14px] text-[var(--muted-foreground)] leading-relaxed whitespace-pre-line">
                    {job.description}
                  </p>
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="p-5">
              <h3 className="text-[15px] font-semibold mb-4">تفاصيل الوظيفة</h3>
              <div className="space-y-3">
                {[
                  { icon: 'clock',    label: 'نوع العمل',   value: AD_TYPE_LABEL[job.adType] },
                  { icon: 'calendar', label: 'تاريخ النشر', value: new Date(job.createdAt).toLocaleDateString('ar-SA') },
                  ...(job.deadline ? [{ icon: 'ban', label: 'آخر موعد', value: new Date(job.deadline).toLocaleDateString('ar-SA') }] : []),
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

              {salary && (
                <div className="mt-5 p-3 rounded-lg bg-[oklch(0.97_0.03_30)] border border-[oklch(0.92_0.06_30)]">
                  <div className="text-[12px] text-[var(--muted-foreground)] mb-0.5">الراتب الشهري</div>
                  <div className="text-[20px] font-bold text-[var(--primary)]">{salary}</div>
                </div>
              )}

              <Btn className="w-full mt-4" onClick={() => navigate(`/apply?jobId=${job.id}`)}>
                <Icon name="send" size={14} /> قدّم الآن
              </Btn>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
