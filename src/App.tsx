import { useState } from 'react';
import { Icon } from '@/components/icons';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Btn } from '@/components/shell';
import { DDialog } from '@/components/ui/ddialog';
import { ToastProvider } from '@/components/ui/toast';
import { AttachIcon } from '@/components/shell';
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
    <DDialog open={!!applicant} onClose={onClose} size="md">
      <div className="p-6 border-b border-[var(--border)] flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar name={applicant.name} tone={applicant.avatar as any} size={48} />
          <div>
            <h2 className="text-[17px] font-bold">{applicant.name}</h2>
            <div className="text-[12.5px] text-[var(--muted-foreground)]">{applicant.email}</div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-md hover:bg-[var(--accent)] flex items-center justify-center"
        >
          <Icon name="x" size={16} />
        </button>
      </div>

      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-[11.5px] text-[var(--muted-foreground)] mb-1">الوظيفة المستهدفة</div>
            <div className="text-[13.5px] font-medium">{applicant.job}</div>
            <div className="text-[12px] text-[var(--primary)] mt-0.5">{applicant.jobMeta}</div>
          </div>
          <div>
            <div className="text-[11.5px] text-[var(--muted-foreground)] mb-1">تاريخ التقديم</div>
            <div className="text-[13.5px] font-medium tabular">{applicant.date}</div>
          </div>
          <div>
            <div className="text-[11.5px] text-[var(--muted-foreground)] mb-1">الموقع</div>
            <div className="text-[13.5px] font-medium">{applicant.location || '—'}</div>
          </div>
          <div>
            <div className="text-[11.5px] text-[var(--muted-foreground)] mb-1">الحالة</div>
            <Badge tone={STATUS_META[applicant.status].tone as any}>
              {STATUS_META[applicant.status].label}
            </Badge>
          </div>
        </div>
        <div>
          <div className="text-[11.5px] text-[var(--muted-foreground)] mb-2">المرفقات</div>
          <div className="flex gap-2">
            {applicant.attachments.map((at, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-3 h-10 rounded-md border border-[var(--border)] bg-white text-[13px] cursor-pointer hover:bg-[var(--accent)]"
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

      <div className="p-4 border-t border-[var(--border)] flex items-center gap-2">
        <Btn onClick={() => { onUpdate(applicant.id, 'shortlisted'); onClose(); }}>
          <Icon name="check" size={14} /> ترشيح
        </Btn>
        <Btn variant="outline" onClick={() => { onUpdate(applicant.id, 'interview'); onClose(); }}>
          <Icon name="calendar" size={14} /> تحديد مقابلة
        </Btn>
        <div className="flex-1" />
        <Btn variant="ghost" onClick={() => { onUpdate(applicant.id, 'rejected'); onClose(); }}>
          <Icon name="x" size={14} className="text-[var(--destructive)]" />
          <span className="text-[var(--destructive)]">رفض</span>
        </Btn>
      </div>
    </DDialog>
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
      <ToastProvider>
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
      </ToastProvider>
    );
  }

  if (page === 'career-detail') {
    const job = jobs.find((j) => j.id === publicJobId);
    return (
      <ToastProvider>
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
      </ToastProvider>
    );
  }

  if (page === 'apply') {
    return (
      <ToastProvider>
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
      </ToastProvider>
    );
  }

  /* ── Admin shell ────────────────────────────────────────────────── */
  return (
    <ToastProvider>
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
    </ToastProvider>
  );
}
