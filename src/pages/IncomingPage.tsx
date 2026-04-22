import { useState } from 'react';
import { Icon } from '@/components/icons';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDesc } from '@/components/ui/card';
import { DSelect } from '@/components/ui/dselect';
import { Btn, Th, Td, AttachIcon, DLabel, Pagination } from '@/components/shell';
import { useToast } from '@/components/ui/toast';
import { STATUS_META } from '@/data';
import type { Application, StatusKey } from '@/types';

const PER_PAGE = 5;

interface Props {
  applications: Application[];
  setApplications: React.Dispatch<React.SetStateAction<Application[]>>;
  onOpenApp: (a: Application) => void;
}

export function IncomingPage({ applications, setApplications, onOpenApp }: Props) {
  const [page, setPage]         = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({ location: 'all', jobType: 'all' });
  const toast = useToast();

  let filtered = applications;
  if (activeFilters.location !== 'all') {
    filtered = filtered.filter((a) => a.location.includes(activeFilters.location));
  }

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const view = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const act = (a: Application, newStatus: StatusKey, msg: string) => {
    setApplications((apps) => apps.map((x) => (x.id === a.id ? { ...x, status: newStatus } : x)));
    toast({ title: msg, tone: newStatus === 'rejected' ? 'error' : 'success' });
  };

  return (
    <div>
      <Card className="relative overflow-visible">
        <CardHeader className="flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg tone-sky flex items-center justify-center">
              <Icon name="briefcase" size={18} />
            </div>
            <div>
              <CardTitle>طلبات التوظيف الواردة</CardTitle>
              <CardDesc>مراجعة وتصنيف المتقدمين للوظائف الشاغرة</CardDesc>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone="neutral" className="h-7 px-3">
              <span className="tabular font-semibold">{filtered.length}</span>
              <span className="text-[var(--muted-foreground)]">طلب إجمالي</span>
            </Badge>
            <Btn
              variant="outline" size="sm"
              onClick={() => toast({ title: 'تم تصدير الملف بنجاح', desc: `${filtered.length} طلب إلى Excel`, tone: 'success' })}
            >
              <Icon name="download" size={13} /> تصدير Excel
            </Btn>
            <div className="relative">
              <Btn size="sm" onClick={() => setFilterOpen((o) => !o)}>
                <Icon name="filter" size={13} /> تصفية متقدمة
                <Icon name="chevDown" size={12} />
              </Btn>
              {filterOpen && (
                <div className="absolute top-full mt-2 end-0 w-72 bg-white border border-[var(--border)] rounded-md elev-shadow p-4 anim-pop z-20 space-y-3">
                  <div>
                    <DLabel className="mb-1.5 block">الموقع الجغرافي</DLabel>
                    <DSelect
                      value={activeFilters.location}
                      onChange={(v) => setActiveFilters((f) => ({ ...f, location: String(v) }))}
                      options={[
                        { value: 'all', label: 'جميع المواقع' },
                        { value: 'الرياض', label: 'الرياض' },
                        { value: 'جدة', label: 'جدة' },
                        { value: 'الدمام', label: 'الدمام' },
                        { value: 'الإمارات', label: 'الإمارات' },
                        { value: 'الكويت', label: 'الكويت' },
                      ]}
                    />
                  </div>
                  <div>
                    <DLabel className="mb-1.5 block">نوع الوظيفة</DLabel>
                    <DSelect
                      value={activeFilters.jobType}
                      onChange={(v) => setActiveFilters((f) => ({ ...f, jobType: String(v) }))}
                      options={[
                        { value: 'all', label: 'الكل' },
                        { value: 'fulltime', label: 'دوام كامل' },
                        { value: 'remote', label: 'عن بعد' },
                      ]}
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Btn size="sm" className="flex-1" onClick={() => setFilterOpen(false)}>تطبيق</Btn>
                    <Btn
                      variant="outline" size="sm"
                      onClick={() => { setActiveFilters({ location: 'all', jobType: 'all' }); setFilterOpen(false); }}
                    >
                      مسح
                    </Btn>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead>
            <tr>
              <Th>المتقدم</Th>
              <Th>الوظيفة المستهدفة</Th>
              <Th>المرفقات</Th>
              <Th>تاريخ التقديم</Th>
              <Th>الحالة</Th>
              <Th>الإجراءات</Th>
            </tr>
          </thead>
          <tbody>
            {view.map((a) => (
              <tr key={a.id} className="row">
                <Td>
                  <div className="flex items-center gap-3">
                    <Avatar name={a.name} tone={a.avatar as any} />
                    <div>
                      <div className="font-medium">{a.name}</div>
                      <div className="text-[12px] text-[var(--muted-foreground)]">{a.location}</div>
                    </div>
                  </div>
                </Td>
                <Td>
                  <div className="font-medium">{a.job}</div>
                  <div className="text-[11.5px] text-[var(--primary)] mt-0.5">{a.jobMeta}</div>
                </Td>
                <Td>
                  <div className="flex items-center gap-1.5">
                    {a.attachments.map((at, i) => <AttachIcon key={i} type={at.type} />)}
                  </div>
                </Td>
                <Td className="text-[var(--muted-foreground)] tabular">{a.date}</Td>
                <Td>
                  <Badge tone={STATUS_META[a.status].tone as any}>{STATUS_META[a.status].label}</Badge>
                </Td>
                <Td>
                  <div className="flex items-center gap-1">
                    <Btn variant="ghost" size="iconSm" onClick={() => onOpenApp(a)} title="عرض">
                      <Icon name="eye" size={15} />
                    </Btn>
                    {a.status !== 'rejected' ? (
                      <Btn
                        variant="ghost" size="iconSm"
                        onClick={() => act(a, 'shortlisted', `تم ترشيح ${a.name}`)} title="ترشيح"
                      >
                        <Icon name="check" size={15} className="text-[oklch(0.5_0.13_155)]" />
                      </Btn>
                    ) : (
                      <Btn
                        variant="ghost" size="iconSm"
                        onClick={() => act(a, 'new', 'تم استعادة الطلب')} title="استعادة"
                      >
                        <Icon name="trash" size={15} className="text-[var(--muted-foreground)]" />
                      </Btn>
                    )}
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        <Pagination
          page={page} pages={pages} total={filtered.length}
          perPage={PER_PAGE} onPage={setPage}
        />
      </Card>
    </div>
  );
}
