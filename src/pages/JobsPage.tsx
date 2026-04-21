import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { DSelect } from '@/components/ui/dselect';
import { DSwitch } from '@/components/ui/dswitch';
import { DDialog } from '@/components/ui/ddialog';
import { Btn, PageHeader, DInput, DLabel } from '@/components/shell';
import { useToast } from '@/components/ui/toast';
import { DEPARTMENTS } from '@/data';
import type { Job } from '@/types';

/* ── Add job dialog ───────────────────────────────────────────────── */
function AddJobDialog({
  open, onClose, onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (j: Job) => void;
}) {
  const [title, setTitle]         = useState('');
  const [dept, setDept]           = useState('التطوير البرمجي');
  const [type, setType]           = useState<'fulltime' | 'remote'>('fulltime');
  const [salaryFrom, setSalaryFrom] = useState('');
  const [salaryTo, setSalaryTo]   = useState('');
  const [desc, setDesc]           = useState('');
  const [publishNow, setPublishNow] = useState(true);
  const toast = useToast();

  const reset = () => {
    setTitle(''); setDept('التطوير البرمجي'); setType('fulltime');
    setSalaryFrom(''); setSalaryTo(''); setDesc(''); setPublishNow(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { toast({ title: 'الرجاء إدخال عنوان الوظيفة', tone: 'error' }); return; }
    onCreate({
      id: Date.now(),
      title,
      dept,
      type: type === 'fulltime' ? 'دوام كامل' : 'عن بعد',
      remote: type === 'remote',
      salary: salaryFrom && salaryTo ? `${salaryFrom} – ${salaryTo} ر.س` : 'حسب الاتفاق',
      applicants: 0,
      published: publishNow,
      created: 'الآن',
    });
    toast({ title: publishNow ? 'تم نشر الوظيفة بنجاح' : 'تم حفظ المسودة', tone: 'success' });
    reset();
    onClose();
  };

  return (
    <DDialog open={open} onClose={onClose} size="lg">
      <form onSubmit={submit}>
        <div className="p-6 border-b border-[var(--border)] flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg tone-rose flex items-center justify-center">
              <Icon name="briefcase" size={18} />
            </div>
            <div>
              <h2 className="text-[17px] font-bold">إضافة وظيفة شاغرة</h2>
              <p className="text-[13px] text-[var(--muted-foreground)] mt-0.5">قم بتعبئة تفاصيل الوظيفة لنشرها في بوابة التوظيف</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-md hover:bg-[var(--accent)] flex items-center justify-center">
            <Icon name="x" size={16} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <DLabel required>عنوان الوظيفة</DLabel>
              <DInput placeholder="مثال: مطور Laravel محترف" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <DLabel>القسم</DLabel>
              <DSelect value={dept} onChange={(v) => setDept(String(v))} options={DEPARTMENTS.map((d) => ({ value: d, label: d }))} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <DLabel>نوع العمل</DLabel>
              <div className="grid grid-cols-2 gap-2">
                {(['fulltime', 'remote'] as const).map((t) => (
                  <button
                    key={t} type="button" onClick={() => setType(t)}
                    className={cn(
                      'h-10 rounded-md border text-[13.5px] transition-colors focus-ring font-medium',
                      type === t
                        ? 'border-[var(--primary)] bg-[oklch(0.97_0.03_30)] text-[var(--primary)]'
                        : 'border-[var(--border)] bg-white hover:bg-[var(--accent)]',
                    )}
                  >
                    {t === 'fulltime' ? 'دوام كامل' : 'عن بعد'}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <DLabel>النطاق السعري (شهرياً)</DLabel>
              <div className="grid grid-cols-2 gap-2">
                <DInput placeholder="من" value={salaryFrom} onChange={(e) => setSalaryFrom(e.target.value)} />
                <DInput placeholder="إلى" value={salaryTo}   onChange={(e) => setSalaryTo(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <DLabel>وصف الوظيفة والمتطلبات</DLabel>
            <div className="rounded-md border border-[var(--input)] bg-white overflow-hidden">
              <div className="flex items-center gap-1 px-2 py-1.5 border-b border-[var(--border)] bg-[var(--muted)]/40">
                {(['bold', 'italic', 'list'] as const).map((n) => (
                  <button key={n} type="button" className="w-7 h-7 rounded hover:bg-white flex items-center justify-center">
                    <Icon name={n} size={13} />
                  </button>
                ))}
              </div>
              <textarea
                placeholder="اكتب تفاصيل الوظيفة هنا…"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="w-full min-h-[120px] px-3 py-2.5 text-[13.5px] focus:outline-none resize-y"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-md bg-[var(--muted)]/60 border border-[var(--border)]">
            <div className="flex items-center gap-2">
              <Icon name="info" size={14} className="text-[oklch(0.55_0.13_230)]" />
              <span className="text-[13px]">سيتم نشر الوظيفة فوراً وتنبيه المتقدمين المهتمين.</span>
            </div>
            <DSwitch on={publishNow} onChange={setPublishNow} />
          </div>
        </div>

        <div className="p-4 border-t border-[var(--border)] flex items-center gap-2">
          <Btn type="submit">
            <Icon name="send" size={14} /> {publishNow ? 'نشر الوظيفة الآن' : 'حفظ كمسودة'}
          </Btn>
          <Btn type="button" variant="ghost" onClick={onClose}>إلغاء</Btn>
        </div>
      </form>
    </DDialog>
  );
}

/* ── Jobs page ────────────────────────────────────────────────────── */
interface Props {
  jobs: Job[];
  setJobs: React.Dispatch<React.SetStateAction<Job[]>>;
}

export function JobsPage({ jobs, setJobs }: Props) {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div>
      <PageHeader
        icon="briefcase"
        title="الوظائف المتاحة"
        desc="إدارة الوظائف المنشورة في بوابة التوظيف"
        actions={
          <Btn onClick={() => setAddOpen(true)}>
            <Icon name="plus" size={14} /> إضافة وظيفة شاغرة
          </Btn>
        }
      />

      <div className="grid grid-cols-2 gap-4">
        {jobs.map((j) => (
          <Card key={j.id} className="p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-lg tone-sky flex items-center justify-center shrink-0">
                  <Icon name="briefcase" size={18} />
                </div>
                <div>
                  <h3 className="font-semibold text-[15px]">{j.title}</h3>
                  <div className="text-[12.5px] text-[var(--muted-foreground)] mt-0.5">{j.dept}</div>
                </div>
              </div>
              <Badge tone={j.published ? 'emerald' : 'neutral'}>
                {j.published ? 'منشورة' : 'مسودة'}
              </Badge>
            </div>
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <Badge tone="neutral">{j.type}</Badge>
              {j.remote && <Badge tone="sky">عن بعد</Badge>}
              <Badge tone="neutral">{j.salary}</Badge>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
              <div className="flex items-center gap-1.5 text-[12.5px] text-[var(--muted-foreground)]">
                <Icon name="users" size={14} />
                <span className="tabular font-medium text-[var(--foreground)]">{j.applicants}</span>
                <span>متقدم</span>
                <span className="mx-1">•</span>
                <span>{j.created}</span>
              </div>
              <div className="flex items-center gap-1">
                <Btn variant="ghost" size="iconSm"><Icon name="eye" size={15} /></Btn>
                <Btn variant="ghost" size="iconSm"><Icon name="settings" size={15} /></Btn>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <AddJobDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreate={(j) => setJobs((js) => [j, ...js])}
      />
    </div>
  );
}
