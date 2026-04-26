import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Icon } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Btn, BrandLogo, DInput, DLabel, DTextarea } from '@/components/shell';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { usePublishedJobs, useSubmitApplication } from '@/hooks/useCareers';

/* ── Zod schema ───────────────────────────────────────────────────── */
const schema = z.object({
  hiringCompanyCode: z.string().min(1, 'كود الشركة مطلوب'),
  jobAdId:           z.string().min(1, 'الرجاء اختيار وظيفة'),
  applicant: z.object({
    name:               z.string().min(1, 'الاسم مطلوب'),
    email:              z.string().email('بريد إلكتروني غير صالح'),
    phone:              z.string().min(1, 'رقم الهاتف مطلوب'),
    gender:             z.enum(['male', 'female']).optional(),
    dateOfBirth:        z.string().optional(),
    currentJobLocation: z.string().optional(),
  }),
  cvUrl: z
    .string()
    .url('رابط السيرة الذاتية غير صالح')
    .optional()
    .or(z.literal('')),
});

type FormValues = z.infer<typeof schema>;

/* ── Native select helper ─────────────────────────────────────────── */
function NativeSelect({
  value, onChange, options, placeholder, className = '',
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`h-10 w-full rounded-md border border-[var(--input)] bg-[var(--card)] px-3 text-[13.5px] text-[var(--foreground)] focus-ring ${className}`}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

/* ── Apply page ───────────────────────────────────────────────────── */
export function ApplyPage() {
  const navigate              = useNavigate();
  const [params]              = useSearchParams();
  const preselectedJobId      = params.get('jobId') ?? '';

  const { data: jobs = [], isLoading: jobsLoading } = usePublishedJobs();
  const { mutate: submit, isPending, isSuccess, error: submitError } = useSubmitApplication();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      hiringCompanyCode: '',
      jobAdId:           preselectedJobId,
      cvUrl:             '',
      applicant: {
        name:               '',
        email:              '',
        phone:              '',
        gender:             undefined,
        dateOfBirth:        '',
        currentJobLocation: '',
      },
    },
  });

  // Sync jobAdId when URL param changes after mount
  useEffect(() => {
    if (preselectedJobId) form.setValue('jobAdId', preselectedJobId);
  }, [preselectedJobId, form]);

  const onSubmit = (values: FormValues) => {
    submit({
      jobAdId:           values.jobAdId,
      hiringCompanyCode: values.hiringCompanyCode,
      cvUrl:             values.cvUrl || undefined,
      applicant:         values.applicant,
      qualifications:    [],
    });
  };

  /* ── Success screen ─────────────────────────────────────────────── */
  if (isSuccess) {
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

            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-full tone-emerald mx-auto flex items-center justify-center mb-4">
                <Icon name="check" size={28} />
              </div>
              <h2 className="text-[22px] font-bold mb-2">تم إرسال طلبك بنجاح</h2>
              <p className="text-[14px] text-[var(--muted-foreground)] max-w-md mx-auto">
                شكراً لاهتمامك بالانضمام إلى فريقنا. سيقوم فريق الموارد البشرية
                بمراجعة طلبك والتواصل معك خلال 3-5 أيام عمل.
              </p>
              <div className="flex justify-center gap-3 mt-6">
                <Btn variant="outline" onClick={() => navigate('/careers')}>
                  <Icon name="briefcase" size={14} /> استعراض الوظائف
                </Btn>
              </div>
            </div>

            <div className="px-8 py-4 border-t border-[var(--border)] text-center text-[11.5px] text-[var(--muted-foreground)]">
              © 2026 جميع الحقوق محفوظة لـ ضم — نظام التوظيف.
            </div>
          </Card>
        </div>
      </div>
    );
  }

  /* ── Form ───────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-[var(--background)]" dir="rtl">
      <div className="max-w-[860px] mx-auto px-6 py-10">
        <Card className="overflow-hidden">
          {/* Header */}
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

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-8 space-y-8">

              {/* Section title */}
              <div className="flex items-center gap-3 pb-4 border-b border-[var(--border)]">
                <div className="w-10 h-10 rounded-lg tone-sky flex items-center justify-center">
                  <Icon name="userPlus" size={18} />
                </div>
                <div>
                  <h2 className="text-[18px] font-bold">نموذج طلب انضمام للفريق</h2>
                  <p className="text-[12.5px] text-[var(--muted-foreground)] mt-0.5">
                    يرجى تعبئة المعلومات التالية بدقة
                  </p>
                </div>
              </div>

              {/* ── Job & company ───────────────────────────────────── */}
              <div className="space-y-4">
                <h3 className="text-[14px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">
                  معلومات الطلب
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                  <FormField
                    control={form.control}
                    name="jobAdId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>الوظيفة المطلوبة</FormLabel>
                        <FormControl>
                          <NativeSelect
                            value={field.value}
                            onChange={field.onChange}
                            placeholder={jobsLoading ? 'جاري التحميل…' : 'اختر وظيفة'}
                            options={jobs.map((j) => ({ value: j.id, label: j.adTitle }))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="hiringCompanyCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>كود الشركة</FormLabel>
                        <FormControl>
                          <DInput
                            placeholder="مثال: DHUM2024"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* ── Personal info ────────────────────────────────────── */}
              <div className="space-y-4">
                <h3 className="text-[14px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">
                  المعلومات الشخصية
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                  <FormField
                    control={form.control}
                    name="applicant.name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>الاسم الكامل</FormLabel>
                        <FormControl>
                          <DInput
                            icon={<Icon name="user" size={14} />}
                            placeholder="أدخل اسمك الثلاثي"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="applicant.email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>البريد الإلكتروني</FormLabel>
                        <FormControl>
                          <DInput
                            icon={<Icon name="mail" size={14} />}
                            type="email"
                            placeholder="example@domain.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="applicant.phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>رقم الهاتف</FormLabel>
                        <FormControl>
                          <DInput
                            icon={<Icon name="phone" size={14} />}
                            placeholder="05xxxxxxxx"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="applicant.gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الجنس</FormLabel>
                        <FormControl>
                          <NativeSelect
                            value={field.value ?? ''}
                            onChange={(v) => field.onChange(v || undefined)}
                            placeholder="اختر (اختياري)"
                            options={[
                              { value: 'male',   label: 'ذكر' },
                              { value: 'female', label: 'أنثى' },
                            ]}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="applicant.dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>تاريخ الميلاد</FormLabel>
                        <FormControl>
                          <DInput type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="applicant.currentJobLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>مكان العمل الحالي</FormLabel>
                        <FormControl>
                          <DInput
                            icon={<Icon name="globe" size={14} />}
                            placeholder="مثال: الرياض"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* ── CV URL ───────────────────────────────────────────── */}
              <div className="space-y-4">
                <h3 className="text-[14px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">
                  السيرة الذاتية
                </h3>
                <FormField
                  control={form.control}
                  name="cvUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>رابط السيرة الذاتية</FormLabel>
                      <FormControl>
                        <DInput
                          icon={<Icon name="link" size={14} />}
                          placeholder="https://drive.google.com/…"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* ── Server error ─────────────────────────────────────── */}
              {submitError && (
                <div className="rounded-md bg-[oklch(0.97_0.03_25)] border border-[oklch(0.9_0.05_25)] text-[oklch(0.5_0.15_25)] text-[12.5px] px-3 py-2 flex items-center gap-2">
                  <Icon name="info" size={13} />
                  {submitError instanceof Error
                    ? submitError.message
                    : 'حدث خطأ غير متوقع، يرجى المحاولة مجدداً.'}
                </div>
              )}

              {/* ── Actions ──────────────────────────────────────────── */}
              <div className="flex items-center gap-3 pt-2 border-t border-[var(--border)]">
                <Btn type="submit" disabled={isPending}>
                  {isPending ? (
                    <>
                      <svg viewBox="0 0 24 24" width="14" height="14" className="animate-spin">
                        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="30 60" />
                      </svg>
                      جاري الإرسال…
                    </>
                  ) : (
                    <><Icon name="send" size={14} /> إرسال الطلب</>
                  )}
                </Btn>
                <span className="text-[12px] text-[var(--muted-foreground)]">
                  نحترم خصوصيتك — بياناتك لن تتم مشاركتها.
                </span>
              </div>
            </form>
          </Form>

          <div className="px-8 py-4 border-t border-[var(--border)] text-center text-[11.5px] text-[var(--muted-foreground)]">
            © 2026 جميع الحقوق محفوظة لـ ضم — نظام التوظيف.
          </div>
        </Card>
      </div>
    </div>
  );
}
