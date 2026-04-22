import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/icons';
import { UserAvatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Btn, PageHeader, Th, Td, AttachIcon, DInput, DSelect } from '@/components/shell';
import { STATUS_META } from '@/data';
import type { Application } from '@/types';

/* ── Stat card ────────────────────────────────────────────────────── */
function StatCard({
  tone, icon, label, value, sub, trend,
}: {
  tone: string; icon: string; label: string; value: string; sub?: string; trend?: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div className={cn('w-11 h-11 rounded-lg flex items-center justify-center', tone)}>
          <Icon name={icon} size={20} />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-[12px] text-[oklch(0.5_0.13_155)] font-medium">
            <Icon name="trendUp" size={13} />
            <span>{trend}</span>
          </div>
        )}
      </div>
      <div className="mt-4">
        <div className="text-[13px] text-muted-foreground">{label}</div>
        <div className="text-[28px] font-bold tabular tracking-tight mt-0.5">{value}</div>
        {sub && <div className="text-[12px] text-muted-foreground mt-0.5">{sub}</div>}
      </div>
    </Card>
  );
}

/* ── Bar chart ────────────────────────────────────────────────────── */
function BarChart() {
  const data = [
    { d: '15', n: 22, s: 14, r: 4 },
    { d: '16', n: 30, s: 20, r: 8 },
    { d: '17', n: 18, s: 12, r: 3 },
    { d: '18', n: 42, s: 25, r: 10 },
    { d: '19', n: 28, s: 18, r: 6 },
    { d: '20', n: 36, s: 22, r: 7 },
    { d: '21', n: 48, s: 30, r: 12 },
  ];
  const max = 60;
  return (
    <div>
      <div className="flex items-end gap-4 h-48" dir="ltr">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full flex items-end justify-center gap-1 h-40">
              <div className="w-3 rounded-t-sm bg-[oklch(0.85_0.08_230)]" style={{ height: `${(d.r / max) * 100}%` }} />
              <div className="w-3 rounded-t-sm bg-[oklch(0.78_0.1_155)]"  style={{ height: `${(d.s / max) * 100}%` }} />
              <div className="w-3 rounded-t-sm bg-[var(--primary)]"       style={{ height: `${(d.n / max) * 100}%` }} />
            </div>
            <div className="text-[11px] text-muted-foreground tabular">{d.d} أبريل</div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-5 mt-4 text-[12px] text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[var(--primary)]" />طلبات جديدة</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[oklch(0.78_0.1_155)]" />تم الترشيح</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[oklch(0.85_0.08_230)]" />مرفوضة</span>
      </div>
    </div>
  );
}

/* ── Dashboard page ───────────────────────────────────────────────── */
interface Props {
  applications: Application[];
  onOpenApp: (a: Application) => void;
}

export function DashboardPage({ applications, onOpenApp }: Props) {
  const [q, setQ] = useState('');

  const recent = applications.slice(0, 4).filter(
    (a) => !q || a.name.includes(q) || a.job.includes(q) || a.email.includes(q),
  );

  return (
    <div>
      <PageHeader
        icon="chart"
        title="الإحصائيات العامة"
        desc="نظرة شاملة على أداء التوظيف لهذا الشهر"
        actions={
          <>
            <Btn variant="outline"><Icon name="download" size={14} /> تصدير التقرير</Btn>
            <Btn><Icon name="plus" size={14} /> نشر وظيفة</Btn>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard tone="tone-sky"     icon="users"    label="إجمالي الطلبات"   value="1,284" sub="هذا الشهر" trend="12%↑" />
        <StatCard tone="tone-amber"   icon="clock"    label="قيد المراجعة"      value="42"    sub="بانتظار الرد" />
        <StatCard tone="tone-emerald" icon="calendar" label="مقابلات مجدولة"    value="18"    sub="هذا الأسبوع" />
        <StatCard tone="tone-rose"    icon="ban"      label="طلبات مرفوضة"      value="156"   sub="إجمالي الرفض" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>توزيع الطلبات حسب الحالة</CardTitle>
              <CardDescription>آخر 30 يوماً</CardDescription>
            </div>
            <DSelect
              value="30"
              onChange={() => {}}
              options={[
                { value: '7', label: 'آخر 7 أيام' },
                { value: '30', label: 'آخر 30 يوماً' },
                { value: '90', label: 'آخر 3 أشهر' },
              ]}
              className="w-32"
            />
          </CardHeader>
          <CardContent>
            <BarChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>الأقسام الأكثر طلباً</CardTitle>
              <CardDescription>حسب حجم الطلبات المفتوحة</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: 'التطوير البرمجي', count: 486, pct: 38 },
              { name: 'التصميم',         count: 312, pct: 24 },
              { name: 'التسويق',         count: 218, pct: 17 },
              { name: 'إدارة المنتج',    count: 164, pct: 13 },
              { name: 'العمليات',        count: 104, pct: 8  },
            ].map((d, i) => (
              <div key={i}>
                <div className="flex items-center justify-between text-[12.5px] mb-1">
                  <span>{d.name}</span>
                  <span className="tabular text-muted-foreground">{d.count}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${d.pct * 2}%`, opacity: 0.7 + (i === 0 ? 0.3 : 0) }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="list" size={18} className="text-muted-foreground" />
            <div>
              <CardTitle>أحدث طلبات التوظيف</CardTitle>
              <CardDescription>أحدث 4 طلبات وردت إلى النظام</CardDescription>
            </div>
          </div>
          <div className="w-[220px]">
            <DInput placeholder="بحث…" icon={<Icon name="search" size={14} />} onChange={(e) => setQ(e.target.value)} />
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[580px]">
            <thead>
              <tr>
                <Th>المتقدم</Th>
                <Th>الوظيفة</Th>
                <Th>المرفقات</Th>
                <Th>الحالة</Th>
                <Th>الإجراءات</Th>
              </tr>
            </thead>
            <tbody>
              {recent.map((a) => (
                <tr key={a.id} className="row">
                  <Td>
                    <div className="flex items-center gap-3">
                      <UserAvatar name={a.name} tone={a.avatar as string} />
                      <div>
                        <div className="font-medium">{a.name}</div>
                        <div className="text-[12px] text-muted-foreground">{a.email}</div>
                      </div>
                    </div>
                  </Td>
                  <Td>{a.job}</Td>
                  <Td>
                    <div className="flex items-center gap-1.5">
                      {a.attachments.map((at, i) => <AttachIcon key={i} type={at.type} />)}
                    </div>
                  </Td>
                  <Td>
                    <Badge variant={STATUS_META[a.status].tone as any}>{STATUS_META[a.status].label}</Badge>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1">
                      <Btn variant="ghost" size="iconSm" onClick={() => onOpenApp(a)}>
                        <Icon name="eye" size={15} />
                      </Btn>
                      <Btn variant="ghost" size="iconSm">
                        <Icon name="check" size={15} className="text-[oklch(0.5_0.13_155)]" />
                      </Btn>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
