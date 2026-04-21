import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { DSelect } from '@/components/ui/dselect';
import { Btn, BrandLogo, DInput, DTextarea, DLabel } from '@/components/shell';
import type { Job } from '@/types';

interface SubmittedApp {
  name: string;
  email: string;
  phone: string;
  jobId: number | string;
  years: number;
  cv: string | null;
  why: string;
}

interface Props {
  jobs: Job[];
  preselectedJobId?: number | null;
  onSubmitted?: (app: SubmittedApp) => void;
}

export function ApplyPage({ jobs, preselectedJobId, onSubmitted }: Props) {
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [phone, setPhone]     = useState('');
  const [jobId, setJobId]     = useState<number | string>(preselectedJobId ?? jobs[0]?.id ?? '');
  const [years, setYears]     = useState(0);
  const [cv, setCv]           = useState<string | null>(null);
  const [why, setWhy]         = useState('');
  const [sent, setSent]       = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    setSent(true);
    onSubmitted?.({ name, email, phone, jobId, years, cv, why });
  };

  return (
    <div className="min-h-screen bg-[var(--background)]" dir="rtl">
      <div className="max-w-[860px] mx-auto px-6 py-10">
        <Card className="overflow-hidden">
          <div className="public-header-bg px-8 py-6 border-b border-[var(--border)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BrandLogo size={40} />
              <div className="ps-3 border-s border-[var(--border)]">
                <div className="text-[18px] font-bold">بوابة التوظيف</div>
                <div className="text-[12.5px] text-[var(--muted-foreground)]">نظام إدارة الموارد البشرية</div>
              </div>
            </div>
            <Badge tone="emerald" className="h-7">
              <span className="w-1.5 h-1.5 rounded-full bg-[oklch(0.6_0.15_155)]" />
              متاح حالياً
            </Badge>
          </div>

          {sent ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-full tone-emerald mx-auto flex items-center justify-center mb-4">
                <Icon name="check" size={28} />
              </div>
              <h2 className="text-[22px] font-bold mb-2">تم إرسال طلبك بنجاح</h2>
              <p className="text-[14px] text-[var(--muted-foreground)] max-w-md mx-auto">
                شكراً لاهتمامك بالانضمام إلى فريقنا. سيقوم فريق الموارد البشرية بمراجعة طلبك والتواصل معك خلال 3-5 أيام عمل.
              </p>
              <Btn className="mt-6" variant="outline" onClick={() => { setSent(false); setName(''); setEmail(''); setPhone(''); setYears(0); setCv(null); setWhy(''); }}>
                إرسال طلب آخر
              </Btn>
            </div>
          ) : (
            <form onSubmit={submit} className="p-8 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-[var(--border)]">
                <div className="w-10 h-10 rounded-lg tone-sky flex items-center justify-center">
                  <Icon name="userPlus" size={18} />
                </div>
                <div>
                  <h2 className="text-[18px] font-bold">نموذج طلب انضمام للفريق</h2>
                  <p className="text-[12.5px] text-[var(--muted-foreground)] mt-0.5">يرجى تعبئة المعلومات التالية بدقة</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <DLabel required>الاسم الكامل</DLabel>
                  <DInput icon={<Icon name="user" size={14} />} placeholder="أدخل اسمك الثلاثي" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <DLabel required>المسمى الوظيفي المطلوب</DLabel>
                  <DSelect
                    value={jobId}
                    onChange={setJobId}
                    options={jobs.map((j) => ({ value: j.id, label: j.title }))}
                  />
                </div>

                <div className="space-y-1.5">
                  <DLabel required>البريد الإلكتروني</DLabel>
                  <DInput icon={<Icon name="mail" size={14} />} placeholder="example@domain.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <DLabel>سنوات الخبرة</DLabel>
                  <div className="flex items-center gap-3">
                    <input
                      type="range" min="0" max="20" value={years}
                      onChange={(e) => setYears(+e.target.value)}
                      className="flex-1 accent-[var(--primary)]"
                    />
                    <div className="h-10 min-w-[64px] px-3 rounded-md border border-[var(--border)] bg-white text-[13.5px] tabular font-medium flex items-center justify-center">
                      {years} سنة
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <DLabel required>رقم الهاتف</DLabel>
                  <DInput icon={<Icon name="phone" size={14} />} placeholder="05xxxxxxxx" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>

                <div className="space-y-1.5">
                  <DLabel>السيرة الذاتية (PDF)</DLabel>
                  <div
                    className={cn(
                      'rounded-md p-4 text-center transition-colors cursor-pointer min-h-[98px] flex flex-col items-center justify-center upload-dash',
                      dragOver && 'bg-[oklch(0.97_0.03_30)]',
                    )}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) setCv(f.name); }}
                    onClick={() => setCv(cv ?? 'CV_example.pdf')}
                  >
                    {cv ? (
                      <div className="flex items-center gap-2 text-[13px]">
                        <Icon name="pdf" size={18} className="text-[var(--primary)]" />
                        <span className="font-medium">{cv}</span>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setCv(null); }}
                          className="w-6 h-6 rounded-full hover:bg-[var(--accent)] flex items-center justify-center"
                        >
                          <Icon name="x" size={12} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-full tone-sky flex items-center justify-center mb-2">
                          <Icon name="cloud" size={18} />
                        </div>
                        <div className="text-[13px] font-medium">ارفع ملفاً أو اسحب وأفلت هنا</div>
                        <div className="text-[11.5px] text-[var(--muted-foreground)] mt-0.5">PDF, DOC حتى 10MB</div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <DLabel>لماذا تريد الانضمام إلينا؟</DLabel>
                <DTextarea placeholder="اكتب نبذة قصيرة عنك ولماذا أنت مناسب لهذه الوظيفة…" value={why} onChange={(e) => setWhy(e.target.value)} />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Btn type="submit">
                  <Icon name="send" size={14} /> إرسال الطلب
                </Btn>
                <span className="text-[12px] text-[var(--muted-foreground)]">نحترم خصوصيتك — بياناتك لن تتم مشاركتها.</span>
              </div>
            </form>
          )}

          <div className="px-8 py-4 border-t border-[var(--border)] text-center text-[11.5px] text-[var(--muted-foreground)]">
            © 2026 جميع الحقوق محفوظة لـ ضم — نظام التوظيف.
          </div>
        </Card>
      </div>
    </div>
  );
}
