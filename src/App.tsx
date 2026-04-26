import { Navigate, Route, Routes, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Icon } from '@/components/icons';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Btn } from '@/components/shell';
import { DDialog } from '@/components/ui/ddialog';
import { AttachIcon } from '@/components/shell';
import { DashboardPage }    from '@/pages/DashboardPage';
import { ApplicationsPage } from '@/pages/ApplicationsPage';
import { IncomingPage }     from '@/pages/IncomingPage';
import { JobsPage }         from '@/pages/JobsPage';
import { SettingsPage }     from '@/pages/SettingsPage';
import { JobListingsPage, JobDetailPage } from '@/pages/CareersPage';
import { ApplyPage }        from '@/pages/ApplyPage';
import { LoginPage }        from '@/pages/LoginPage';
import { DashboardLayout }  from '@/layouts/DashboardLayout';
import { STATUS_META }      from '@/data';
import { useApp }           from '@/context/AppContext';
import type { Application } from '@/types';

/* ── Full-screen loading spinner shown during session check ──────── */
function AuthLoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <svg viewBox="0 0 24 24" width="32" height="32" className="animate-spin text-[var(--primary)]">
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="40 60" />
      </svg>
    </div>
  );
}

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

/* ── Protected layout (dashboard shell + dialog) ─────────────────── */
function AdminLayout() {
  const { loggedIn, authLoading, viewing, setViewing, setApplications } = useApp();
  if (authLoading) return <AuthLoadingScreen />;
  if (!loggedIn) return <Navigate to="/login" replace />;

  return (
    <>
      <DashboardLayout />
      <ApplicantDialog
        applicant={viewing}
        onClose={() => setViewing(null)}
        onUpdate={(id, s) =>
          setApplications((prev) => prev.map((x) => (x.id === id ? { ...x, status: s } : x)))
        }
      />
    </>
  );
}

/* ── Route wrappers: pull from context, pass as props ─────────────── */
function DashboardRoute() {
  const { applications, setViewing } = useApp();
  return <DashboardPage applications={applications} onOpenApp={setViewing} />;
}

function ApplicationsRoute() {
  const { applications, setApplications, setViewing } = useApp();
  return (
    <ApplicationsPage
      applications={applications}
      setApplications={setApplications}
      onOpenApp={setViewing}
    />
  );
}

function IncomingRoute() {
  const { applications, setApplications, setViewing } = useApp();
  return (
    <IncomingPage
      applications={applications}
      setApplications={setApplications}
      onOpenApp={setViewing}
    />
  );
}

function JobsRoute() {
  const { jobs, setJobs } = useApp();
  return <JobsPage jobs={jobs} setJobs={setJobs} />;
}

function CareersRoute() {
  const { jobs } = useApp();
  const navigate = useNavigate();
  return (
    <JobListingsPage
      jobs={jobs}
      onOpenJob={(id) => navigate(`/careers/${id}`)}
      onGoApply={(id) => navigate(`/apply?jobId=${id}`)}
    />
  );
}

function CareerDetailRoute() {
  const { jobs } = useApp();
  const { id } = useParams();
  const navigate = useNavigate();
  const job = jobs.find((j) => j.id === Number(id));
  return (
    <JobDetailPage
      job={job}
      onBack={() => navigate('/careers')}
      onApply={(jobId) => navigate(`/apply?jobId=${jobId ?? id}`)}
    />
  );
}

function ApplyRoute() {
  const { jobs, setApplications } = useApp();
  const [params] = useSearchParams();
  const jobId = params.get('jobId') ? Number(params.get('jobId')) : null;
  return (
    <ApplyPage
      jobs={jobs.filter((j) => j.published)}
      preselectedJobId={jobId}
      onSubmitted={(app) => {
        const j = jobs.find((x) => x.id === app.jobId);
        setApplications((prev) => [
          {
            id: Date.now(),
            name: app.name,
            email: app.email,
            location: '—',
            job: j?.title ?? '—',
            jobMeta: `خبرة ${app.years} سنة`,
            date: 'الآن',
            rawDate: '2026-04-21',
            status: 'new',
            attachments: app.cv ? [{ type: 'pdf' }] : [],
            avatar: 'sky',
          } as Application,
          ...prev,
        ]);
      }}
    />
  );
}

/* ── Public page wrapper (back-to-dashboard button) ──────────────── */
function PublicShell({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  return (
    <div className="relative" dir="rtl">
      <div className="fixed top-4 start-4 z-40">
        <Btn variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
          <Icon name="chevRight" size={13} /> لوحة التحكم
        </Btn>
      </div>
      {children}
    </div>
  );
}

/* ── Root ─────────────────────────────────────────────────────────── */
export default function App() {
  const { loggedIn, authLoading } = useApp();

  // While the session check is in-flight, block rendering to avoid flicker
  if (authLoading) return <AuthLoadingScreen />;

  return (
    <Routes>
      {/* Redirect already-logged-in users away from /login */}
      <Route path="/login" element={loggedIn ? <Navigate to="/dashboard" replace /> : <LoginPage />} />

      {/* Protected admin routes */}
      <Route element={<AdminLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard"    element={<DashboardRoute />} />
        <Route path="/applications" element={<ApplicationsRoute />} />
        <Route path="/incoming"     element={<IncomingRoute />} />
        <Route path="/jobs"         element={<JobsRoute />} />
        <Route path="/settings"     element={<SettingsPage />} />
      </Route>

      {/* Public routes */}
      <Route path="/careers" element={<PublicShell><CareersRoute /></PublicShell>} />
      <Route path="/careers/:id" element={<PublicShell><CareerDetailRoute /></PublicShell>} />
      <Route path="/apply" element={<PublicShell><ApplyRoute /></PublicShell>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to={loggedIn ? '/dashboard' : '/login'} replace />} />
    </Routes>
  );
}
