import { useState } from 'react';
import { Icon } from '@/components/icons';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { DSelect } from '@/components/ui/dselect';
import { Btn, PageHeader, Th, Td, Pagination } from '@/components/shell';
import { useToast } from '@/components/ui/toast';
import { STATUS_META } from '@/data';
import type { Application, StatusKey } from '@/types';

const PER_PAGE = 6;

interface Props {
  applications: Application[];
  setApplications: React.Dispatch<React.SetStateAction<Application[]>>;
  onOpenApp: (a: Application) => void;
}

export function ApplicationsPage({ applications, setApplications, onOpenApp }: Props) {
  const [job, setJob]       = useState<string>('all');
  const [status, setStatus] = useState<string>('all');
  const [sort, setSort]     = useState<string>('newest');
  const [page, setPage]     = useState(1);
  const toast = useToast();

  const reset = () => { setJob('all'); setStatus('all'); setSort('newest'); };

  const jobs = ['all', ...new Set(applications.map((a) => a.job))];

  const filtered = applications
    .filter((a) => job === 'all' || a.job === job)
    .filter((a) => status === 'all' || a.status === status)
    .sort((a, b) =>
      sort === 'newest' ? b.rawDate.localeCompare(a.rawDate) : a.rawDate.localeCompare(b.rawDate),
    );

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const view = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const updateStatus = (id: number, newStatus: StatusKey, msg: string) => {
    setApplications((apps) => apps.map((a) => (a.id === id ? { ...a, status: newStatus } : a)));
    toast({ title: msg, tone: newStatus === 'rejected' ? 'error' : 'success' });
  };

  return (
    <div>
      <PageHeader
        icon="users"
        title="إدارة طلبات التوظيف"
        desc="راجع وصنّف طلبات المتقدمين للوظائف الشاغرة"
        actions={
          <Btn onClick={() => onOpenApp({ manualAdd: true } as any)}>
            <Icon name="plus" size={14} /> إضافة طلب يدوي
          </Btn>
        }
      />

      <Card>
        <div className="p-4 border-b border-[var(--border)] flex flex-wrap items-center gap-3">
          <span className="text-[13px] text-[var(--muted-foreground)] flex items-center gap-1.5">
            <Icon name="filter" size={14} /> تصفية حسب:
          </span>
          <DSelect
            value={job}
            onChange={(v) => setJob(String(v))}
            className="min-w-[170px]"
            options={[
              { value: 'all', label: 'جميع الوظائف' },
              ...jobs.filter((j) => j !== 'all').map((j) => ({ value: j, label: j })),
            ]}
          />
          <DSelect
            value={status}
            onChange={(v) => setStatus(String(v))}
            className="min-w-[150px]"
            options={[
              { value: 'all', label: 'جميع الحالات' },
              ...Object.entries(STATUS_META).map(([k, v]) => ({ value: k, label: v.label })),
            ]}
          />
          <DSelect
            value={sort}
            onChange={(v) => setSort(String(v))}
            className="min-w-[130px]"
            options={[
              { value: 'newest', label: 'الأحدث أولاً' },
              { value: 'oldest', label: 'الأقدم أولاً' },
            ]}
          />
          <Btn variant="ghost" size="sm" onClick={reset}>
            <Icon name="undo" size={13} /> إعادة ضبط
          </Btn>
          <div className="flex-1" />
          <div className="text-[12px] text-[var(--muted-foreground)] tabular">
            عرض <span className="font-medium text-[var(--foreground)]">{view.length}</span> من أصل {filtered.length} طلب
          </div>
        </div>

        <table className="w-full">
          <thead>
            <tr>
              <Th>المتقدم</Th>
              <Th>الوظيفة</Th>
              <Th>تاريخ التقديم</Th>
              <Th>الحالة</Th>
              <Th>الإجراءات</Th>
            </tr>
          </thead>
          <tbody>
            {view.length === 0 && (
              <tr>
                <Td colSpan={5}>
                  <div className="text-center py-10 text-[var(--muted-foreground)]">لا توجد طلبات مطابقة للتصفية</div>
                </Td>
              </tr>
            )}
            {view.map((a) => (
              <tr key={a.id} className="row">
                <Td>
                  <div className="flex items-center gap-3">
                    <Avatar name={a.name} tone={a.avatar as any} />
                    <div>
                      <div className="font-medium">{a.name}</div>
                      <div className="text-[12px] text-[var(--muted-foreground)]">{a.email}</div>
                    </div>
                  </div>
                </Td>
                <Td>{a.job}</Td>
                <Td className="text-[var(--muted-foreground)] tabular">{a.date}</Td>
                <Td>
                  <Badge tone={STATUS_META[a.status].tone as any}>{STATUS_META[a.status].label}</Badge>
                </Td>
                <Td>
                  <div className="flex items-center gap-1">
                    <Btn variant="ghost" size="iconSm" title="عرض" onClick={() => onOpenApp(a)}>
                      <Icon name="eye" size={15} />
                    </Btn>
                    <Btn
                      variant="ghost" size="iconSm" title="قبول"
                      onClick={() => updateStatus(a.id, 'shortlisted', `تم ترشيح ${a.name}`)}
                    >
                      <Icon name="check" size={15} className="text-[oklch(0.5_0.13_155)]" />
                    </Btn>
                    <Btn
                      variant="ghost" size="iconSm" title="رفض"
                      onClick={() => updateStatus(a.id, 'rejected', `تم رفض طلب ${a.name}`)}
                    >
                      <Icon name="x" size={15} className="text-[oklch(0.55_0.15_25)]" />
                    </Btn>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>

        <Pagination
          page={page} pages={pages} total={filtered.length}
          perPage={PER_PAGE} onPage={setPage}
        />
      </Card>
    </div>
  );
}
