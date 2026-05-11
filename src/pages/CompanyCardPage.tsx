import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Icon } from '@/components/icons';
import { careersService } from '@/services/careers.service';

/* ── Icon rows ────────────────────────────────────────────────────── */
function InfoItem({ icon, value }: { icon: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-3 text-white/80">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
        <Icon name={icon} size={14} className="text-white" />
      </div>
      <span className="text-[13.5px]">{value}</span>
    </div>
  );
}

/* ── Skeleton ─────────────────────────────────────────────────────── */
function Skeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
      <svg viewBox="0 0 24 24" width="28" height="28" className="animate-spin text-[var(--primary)]">
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="40 60" />
      </svg>
    </div>
  );
}

/* ── Not found ────────────────────────────────────────────────────── */
function NotFound({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--background)] px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--muted)]">
        <Icon name="briefcase" size={28} className="text-[var(--muted-foreground)]" />
      </div>
      <h1 className="text-[18px] font-bold">الشركة غير موجودة</h1>
      <p className="max-w-[280px] text-[13.5px] text-[var(--muted-foreground)]">
        لم نتمكن من العثور على شركة بهذا الرمز. تأكد من صحة الرابط.
      </p>
      <button
        onClick={onBack}
        className="mt-2 flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-5 py-2.5 text-[13.5px] font-medium hover:bg-[var(--accent)] transition-colors"
      >
        <Icon name="chevLeft" size={14} />
        العودة
      </button>
    </div>
  );
}

/* ── Main page ────────────────────────────────────────────────────── */
export function CompanyCardPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const { data: company, isLoading, isError } = useQuery({
    queryKey: ['public', 'company', code],
    queryFn: () => careersService.getCompanyByCode(code!),
    enabled: !!code,
    retry: false,
  });

  if (isLoading) return <Skeleton />;
  if (isError || !company) return <NotFound onBack={() => navigate(-1)} />;

  const applyUrl = `${window.location.origin}/apply?code=${company.uniqueCode}`;
  const cardUrl  = window.location.href;

  const handleCopy = () => {
    navigator.clipboard.writeText(cardUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-[var(--background)]" dir="rtl">
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[var(--primary)] to-[oklch(0.38_0.14_250)]">
        {/* decorative circles */}
        <div className="pointer-events-none absolute -top-20 -start-20 h-64 w-64 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-16 -end-16 h-48 w-48 rounded-full bg-white/5" />

        <div className="relative mx-auto max-w-lg px-6 pb-12 pt-14">
          {/* Logo */}
          <div className="mb-6 flex justify-center">
            {company.logo ? (
              <img
                src={company.logo}
                alt="شعار الشركة"
                className="h-24 w-24 rounded-2xl object-cover shadow-xl ring-4 ring-white/20"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-white/15 shadow-xl ring-4 ring-white/20">
                <Icon name="briefcase" size={36} className="text-white" />
              </div>
            )}
          </div>

          {/* Company name + code */}
          <div className="text-center">
            <h1 className="text-[26px] font-bold text-white leading-tight">
              {company.companyName}
            </h1>
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[12px] font-mono font-semibold tracking-widest text-white/80">
              <Icon name="sparkles" size={11} className="text-white/60" />
              {company.uniqueCode}
            </div>
          </div>

          {/* Info rows */}
          {(company.phoneNumber || company.managerName || company.address) && (
            <div className="mt-8 space-y-3">
              <InfoItem icon="user"  value={company.managerName} />
              <InfoItem icon="phone" value={company.phoneNumber} />
              <InfoItem icon="globe" value={company.address} />
            </div>
          )}
        </div>
      </div>

      {/* ── Card body ─────────────────────────────────────────────── */}
      <div className="mx-auto max-w-lg px-6 py-8 space-y-4">

        {/* Apply CTA */}
        <a
          href={applyUrl}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-4 text-[15px] font-semibold text-white shadow-md hover:opacity-90 transition-opacity"
        >
          <Icon name="send" size={16} />
          تقدم على وظيفة الآن
        </a>

        {/* Browse jobs */}
        <a
          href="/careers"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-6 py-3.5 text-[14px] font-medium text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors"
        >
          <Icon name="briefcase" size={15} />
          تصفح الوظائف المتاحة
        </a>

        {/* Divider */}
        <div className="flex items-center gap-3 py-2">
          <div className="h-px flex-1 bg-[var(--border)]" />
          <span className="text-[11.5px] text-[var(--muted-foreground)]">مشاركة البطاقة</span>
          <div className="h-px flex-1 bg-[var(--border)]" />
        </div>

        {/* Copy link */}
        <button
          onClick={handleCopy}
          className="group flex w-full items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-start hover:bg-[var(--accent)] transition-colors"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--muted)]">
            <Icon
              name={copied ? 'check' : 'link'}
              size={15}
              className={copied ? 'text-emerald-500' : 'text-[var(--muted-foreground)]'}
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-medium">
              {copied ? 'تم نسخ الرابط!' : 'نسخ رابط البطاقة'}
            </div>
            <div className="truncate font-mono text-[11px] text-[var(--muted-foreground)]">
              {cardUrl}
            </div>
          </div>
          <Icon
            name="link"
            size={14}
            className="shrink-0 text-[var(--muted-foreground)] opacity-0 transition-opacity group-hover:opacity-100"
          />
        </button>
      </div>
    </div>
  );
}
