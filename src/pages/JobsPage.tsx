import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { DSwitch } from '@/components/ui/dswitch';
import { DSelect } from '@/components/ui/dselect';
import { DDialog } from '@/components/ui/ddialog';
import { Btn, PageHeader, DInput, DTextarea, DLabel } from '@/components/shell';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useJobs, useCreateJob, useJobTitles } from '@/hooks/useJobs';
import type { JobAd } from '@/types/api';
import { useState } from 'react';

/* ── Zod schema ───────────────────────────────────────────────────── */
const schema = z.object({
  adTitle: z.string().min(1, 'عنوان الوظيفة مطلوب'),
  jobTitleId: z.string().optional(),
  adType: z.enum(['remote', 'on_site', 'hybrid']),
  salaryFrom: z.string().optional(),
  salaryTo: z.string().optional(),
  description: z.string().optional(),
  isPublished: z.boolean(),
  deadline: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;


/* ── Add job dialog ───────────────────────────────────────────────── */
function AddJobDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: jobTitles = [] } = useJobTitles();
  const { mutate: createJob, isPending, error: submitError } = useCreateJob(onClose);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      adTitle: '',
      jobTitleId: '',
      adType: 'on_site',
      salaryFrom: '',
      salaryTo: '',
      description: '',
      isPublished: true,
      deadline: '',
    },
  });

  const onSubmit = (values: FormValues) => {
    createJob({
      adTitle: values.adTitle,
      adType: values.adType,
      jobTitleId: values.jobTitleId || null,
      salaryFrom: values.salaryFrom ? Number(values.salaryFrom) : undefined,
      salaryTo: values.salaryTo ? Number(values.salaryTo) : undefined,
      description: values.description || undefined,
      isPublished: values.isPublished,
      deadline: values.deadline || null,
    });
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const AD_TYPE_OPTIONS: { value: FormValues['adType']; label: string }[] = [
    { value: 'on_site', label: 'حضوري' },
    { value: 'remote', label: 'عن بعد' },
    { value: 'hybrid', label: 'هجين' },
  ];

  return (
    <DDialog open={open} onClose={handleClose} size="lg">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* Header */}
          <div className="p-6 border-b border-border flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg tone-rose flex items-center justify-center">
                <Icon name="briefcase" size={18} />
              </div>
              <div>
                <h2 className="text-[17px] font-bold">إضافة وظيفة شاغرة</h2>
                <p className="text-[13px] text-muted-foreground mt-0.5">
                  قم بتعبئة تفاصيل الوظيفة لنشرها في بوابة التوظيف
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="w-8 h-8 rounded-md hover:bg-accent flex items-center justify-center"
            >
              <Icon name="x" size={16} />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* Title + job title setting */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="adTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>عنوان الوظيفة</FormLabel>
                    <FormControl>
                      <DInput placeholder="مثال: مطور Laravel محترف" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="jobTitleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المسمى الوظيفي</FormLabel>
                    <FormControl>
                      <DSelect
                        value={field.value ?? ''}
                        onChange={(v) => field.onChange(String(v) || undefined)}
                        placeholder="اختر مسمى (اختياري)"
                        options={jobTitles.map((t) => ({ value: t.id, label: t.title }))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Ad type + salary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="adType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>نوع العمل</FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-3 gap-2">
                        {AD_TYPE_OPTIONS.map((t) => (
                          <button
                            key={t.value}
                            type="button"
                            onClick={() => field.onChange(t.value)}
                            className={cn(
                              'h-10 rounded-md border text-[13.5px] transition-colors focus-ring font-medium',
                              field.value === t.value
                                ? 'border-primary bg-[oklch(0.97_0.03_30)] text-primary'
                                : 'border-border bg-white hover:bg-accent',
                            )}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-1.5">
                <DLabel>النطاق السعري (شهرياً)</DLabel>
                <div className="grid grid-cols-2 gap-2">
                  <FormField
                    control={form.control}
                    name="salaryFrom"
                    render={({ field }) => (
                      <FormItem className="space-y-0">
                        <FormControl>
                          <DInput type="number" placeholder="من" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="salaryTo"
                    render={({ field }) => (
                      <FormItem className="space-y-0">
                        <FormControl>
                          <DInput type="number" placeholder="إلى" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>وصف الوظيفة والمتطلبات</FormLabel>
                  <FormControl>
                    <DTextarea placeholder="اكتب تفاصيل الوظيفة هنا…" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Deadline */}
            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>آخر موعد للتقديم</FormLabel>
                  <FormControl>
                    <DInput type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Publish toggle */}
            <FormField
              control={form.control}
              name="isPublished"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between p-3 rounded-md bg-(--muted)/60 border border-border">
                    <div className="flex items-center gap-2">
                      <Icon name="info" size={14} className="text-[oklch(0.55_0.13_230)]" />
                      <span className="text-[13px]">
                        سيتم نشر الوظيفة فوراً وتنبيه المتقدمين المهتمين.
                      </span>
                    </div>
                    <FormControl>
                      <DSwitch on={field.value} onChange={field.onChange} />
                    </FormControl>
                  </div>
                </FormItem>
              )}
            />

            {/* Server error */}
            {submitError && (
              <div className="flex items-center gap-2 rounded-md border border-[oklch(0.9_0.05_25)] bg-[oklch(0.97_0.03_25)] px-3 py-2 text-[12.5px] text-[oklch(0.5_0.15_25)]">
                <Icon name="info" size={13} />
                {submitError instanceof Error
                  ? submitError.message
                  : 'حدث خطأ غير متوقع، يرجى المحاولة مجدداً.'}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border flex items-center gap-2">
            <Btn type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <svg viewBox="0 0 24 24" width="14" height="14" className="animate-spin">
                    <circle
                      cx="12" cy="12" r="10"
                      fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="30 60"
                    />
                  </svg>
                  جاري الحفظ…
                </>
              ) : (
                <>
                  <Icon name="send" size={14} />
                  {form.watch('isPublished') ? 'نشر الوظيفة الآن' : 'حفظ كمسودة'}
                </>
              )}
            </Btn>
            <Btn type="button" variant="ghost" onClick={handleClose}>
              إلغاء
            </Btn>
          </div>
        </form>
      </Form>
    </DDialog>
  );
}

/* ── Helpers ──────────────────────────────────────────────────────── */
const AD_TYPE_LABEL: Record<JobAd['adType'], string> = {
  on_site: 'حضوري',
  remote: 'عن بعد',
  hybrid: 'هجين',
};

function formatSalary(from: number | null, to: number | null): string {
  if (from && to) return `${from.toLocaleString()} – ${to.toLocaleString()} ر.س`;
  if (from) return `من ${from.toLocaleString()} ر.س`;
  return 'حسب الاتفاق';
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return 'اليوم';
  if (days === 1) return 'أمس';
  if (days < 30) return `منذ ${days} يوم`;
  const months = Math.floor(days / 30);
  return `منذ ${months} شهر`;
}

/* ── Jobs page ────────────────────────────────────────────────────── */
export function JobsPage() {
  const [addOpen, setAddOpen] = useState(false);
  const { data: jobs = [], isLoading } = useJobs();

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

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <svg viewBox="0 0 24 24" width="24" height="24" className="animate-spin me-2">
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="40 60" />
          </svg>
          جاري التحميل…
        </div>
      ) : jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Icon name="briefcase" size={40} className="mb-3 opacity-30" />
          <p className="text-[14px]">لا توجد وظائف بعد. أضف أول وظيفة شاغرة.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((j) => (
            <Card key={j.id} className="p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-lg tone-sky flex items-center justify-center shrink-0">
                    <Icon name="briefcase" size={18} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[15px]">{j.adTitle}</h3>
                    <div className="text-[12.5px] text-muted-foreground mt-0.5">
                      {AD_TYPE_LABEL[j.adType]}
                    </div>
                  </div>
                </div>
                <Badge tone={j.isPublished ? 'emerald' : 'neutral'}>
                  {j.isPublished ? 'منشورة' : 'مسودة'}
                </Badge>
              </div>

              <div className="flex items-center gap-2 flex-wrap mb-4">
                <Badge tone="neutral">{AD_TYPE_LABEL[j.adType]}</Badge>
                <Badge tone="neutral">{formatSalary(j.salaryFrom, j.salaryTo)}</Badge>
                {j.deadline && (
                  <Badge tone="amber">
                    ينتهي {new Date(j.deadline).toLocaleDateString('ar-SA')}
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="text-[12.5px] text-muted-foreground">
                  {timeAgo(j.createdAt)}
                </div>
                <div className="flex items-center gap-1">
                  <Btn variant="ghost" size="iconSm"><Icon name="eye" size={15} /></Btn>
                  <Btn variant="ghost" size="iconSm"><Icon name="settings" size={15} /></Btn>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <AddJobDialog open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
