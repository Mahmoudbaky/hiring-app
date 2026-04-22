import { useState } from 'react';
import { Icon } from '@/components/icons';
import { UserAvatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Btn } from '@/components/shell';
import { AttachIcon } from '@/components/shell';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { DashboardPage }    from '@/pages/DashboardPage';
import { ApplicationsPage } from '@/pages/ApplicationsPage';
import { IncomingPage }     from '@/pages/IncomingPage';
import { JobsPage }         from '@/pages/JobsPage';
import { SettingsPage }     from '@/pages/SettingsPage';
import { JobListingsPage, JobDetailPage } from '@/pages/CareersPage';
import { ApplyPage }        from '@/pages/ApplyPage';
import { DashboardLayout }  from '@/layouts/DashboardLayout';
import { SEED_APPLICATIONS, SEED_JOBS, STATUS_META } from '@/data';
import type { Application, Job } from '@/types';

type Page =
  | 'dashboard' | 'applications' | 'incoming' | 'jobs' | 'settings'
  | 'careers' | 'career-detail' | 'apply';

/* ── Applicant dialog ─────────────────────────────────────────────── */
function ApplicantDialog({
  applicant, onClose, onUpdate,
}: {
  applicant: Application | null;
  onClose: () => void;
  onUpdate: (id: number, s: Application['status']) => void;
}) {
  if (!applicant || applicant.manualAdd) return null;

  return (
    <Dialog open={!!applicant} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-lg" showCloseButton={false} dir="rtl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <UserAvatar name={applicant.name} tone={applicant.avatar as string} size={48} />
            <div>
              <DialogTitle className="text-[17px]">{applicant.name}</DialogTitle>
              <div className="text-[12.5px] text-muted-foreground">{applicant.email}</div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-[11.5px] text-muted-foreground mb-1">الوظيفة المستهدفة</div>
              <div className="text-[13.5px] font-medium">{applicant.job}</div>
              <div className="text-[12px] text-primary mt-0.5">{applicant.jobMeta}</div>
            </div>
            <div>
              <div className="text-[11.5px] text-muted-foreground mb-1">تاريخ التقديم</div>
              <div className="text-[13.5px] font-medium tabular">{applicant.date}</div>
            </div>
            <div>
              <div className="text-[11.5px] text-muted-foreground mb-1">الموقع</div>
              <div className="text-[13.5px] font-medium">{applicant.location || '—'}</div>
            </div>
            <div>
              <div className="text-[11.5px] text-muted-foreground mb-1">الحالة</div>
              <Badge variant={STATUS_META[applicant.status].tone as any}>
                {STATUS_META[applicant.status].label}
              </Badge>
            </div>
          </div>
          <div>
            <div className="text-[11.5px] text-muted-foreground mb-2">المرفقات</div>
            <div className="flex gap-2">
              {applicant.attachments.map((at, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-3 h-10 rounded-md border bg-card text-[13px] cursor-pointer hover:bg-accent"
                >
                  <AttachIcon type={at.type} />
                  <span>
                    {at.type === 'pdf' ? 'السيرة الذاتية.pdf' : at.type === 'image' ? 'أعمال سابقة.png' : 'رابط Portfolio'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="border-0 bg-transparent p-0 m-0">
          <Btn onClick={() => { onUpdate(applicant.id, 'shortlisted'); onClose(); }}>
            <Icon name="check" size={14} /> ترشيح
          </Btn>
          <Btn variant="outline" onClick={() => { onUpdate(applicant.id, 'interview'); onClose(); }}>
            <Icon name="calendar" size={14} /> تحديد مقابلة
          </Btn>
          <div className="flex-1" />
          <Btn variant="ghost" onClick={() => { onUpdate(applicant.id, 'rejected'); onClose(); }}>
            <Icon name="x" size={14} className="text-destructive" />
            <span className="text-destructive">رفض</span>
          </Btn>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ── Root app ─────────────────────────────────────────────────────── */
export default function App() {
  const [page, setPage]             = useState<Page>('dashboard');
  const [applications, setApplications] = useState<Application[]>(SEED_APPLICATIONS);
  const [jobs, setJobs]             = useState<Job[]>(SEED_JOBS);
  const [viewing, setViewing]       = useState<Application | null>(null);
  const [publicJobId, setPublicJobId] = useState<number | null>(null);
  const [applyJobId, setApplyJobId]   = useState<number | null>(null);

  /* ── Public pages (no admin shell) ─────────────────────────────── */
  if (page === 'careers') {
    return (
      <div className="relative">
        <div className="fixed top-4 start-4 z-40">
          <Btn variant="outline" size="sm" onClick={() => setPage('dashboard')}>
            <Icon name="chevRight" size={13} /> لوحة التحكم
          </Btn>
        </div>
        <JobListingsPage
          jobs={jobs}
          onOpenJob={(id) => { setPublicJobId(id); setPage('career-detail'); }}
          onGoApply={(id) => { setApplyJobId(id); setPage('apply'); }}
        />
      </div>
    );
  }

  if (page === 'career-detail') {
    const job = jobs.find((j) => j.id === publicJobId);
    return (
      <div className="relative">
        <div className="fixed top-4 start-4 z-40">
          <Btn variant="outline" size="sm" onClick={() => setPage('dashboard')}>
            <Icon name="chevRight" size={13} /> لوحة التحكم
          </Btn>
        </div>
        <JobDetailPage
          job={job}
          onBack={() => setPage('careers')}
          onApply={(id) => { setApplyJobId(id ?? publicJobId); setPage('apply'); }}
        />
      </div>
    );
  }

  if (page === 'apply') {
    return (
      <div className="relative">
        <div className="fixed top-4 start-4 z-40 flex gap-2">
          <Btn variant="outline" size="sm" onClick={() => setPage('careers')}>
            <Icon name="chevRight" size={13} /> الوظائف المتاحة
          </Btn>
          <Btn variant="ghost" size="sm" onClick={() => setPage('dashboard')}>لوحة التحكم</Btn>
        </div>
        <ApplyPage
          jobs={jobs.filter((j) => j.published)}
          preselectedJobId={applyJobId}
          onSubmitted={(app) => {
            const j = jobs.find((x) => x.id === app.jobId);
            setApplications((prev) => [{
              id: Date.now(), name: app.name, email: app.email,
              location: '—', job: j?.title ?? '—', jobMeta: `خبرة ${app.years} سنة`,
              date: 'الآن', rawDate: '2026-04-21', status: 'new',
              attachments: app.cv ? [{ type: 'pdf' }] : [], avatar: 'sky',
            } as Application, ...prev]);
          }}
        />
      </div>
    );
  }

  /* ── Admin shell ────────────────────────────────────────────────── */
  return (
    <>
      <DashboardLayout page={page} setPage={(p) => setPage(p as Page)}>
        {page === 'dashboard'    && <DashboardPage    applications={applications} onOpenApp={setViewing} />}
        {page === 'applications' && <ApplicationsPage applications={applications} setApplications={setApplications} onOpenApp={setViewing} />}
        {page === 'incoming'     && <IncomingPage     applications={applications} setApplications={setApplications} onOpenApp={setViewing} />}
        {page === 'jobs'         && <JobsPage         jobs={jobs} setJobs={setJobs} />}
        {page === 'settings'     && <SettingsPage />}
      </DashboardLayout>
      <ApplicantDialog
        applicant={viewing}
        onClose={() => setViewing(null)}
        onUpdate={(id, s) => setApplications((prev) => prev.map((x) => (x.id === id ? { ...x, status: s } : x)))}
      />
    </>
  );
}
