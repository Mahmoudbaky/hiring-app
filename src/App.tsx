import { Navigate, Route, Routes } from "react-router-dom"
import { Icon } from "@/components/icons"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Btn } from "@/components/shell"
import { DDialog } from "@/components/ui/ddialog"
import { AttachIcon } from "@/components/shell"
import { DashboardPage } from "@/pages/DashboardPage"
// import { ApplicationsPage } from "@/pages/ApplicationsPage"
import { IncomingPage } from "@/pages/IncomingPage"
import { JobsPage } from "@/pages/JobsPage"
import { SettingsPage } from "@/pages/SettingsPage"
import { CareersPage, JobDetailPage } from "@/pages/CareersPage"
import { ApplyPage } from "@/pages/ApplyPage"
import { LoginPage } from "@/pages/LoginPage"
import { DashboardLayout } from "@/layouts/DashboardLayout"
import { STATUS_META } from "@/data"
import { useApp } from "@/context/AppContext"
import type { Application } from "@/types"

/* ── Full-screen loading spinner shown during session check ──────── */
function AuthLoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
      <svg
        viewBox="0 0 24 24"
        width="32"
        height="32"
        className="animate-spin text-[var(--primary)]"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeDasharray="40 60"
        />
      </svg>
    </div>
  )
}

/* ── Applicant dialog ─────────────────────────────────────────────── */
function ApplicantDialog({
  applicant,
  onClose,
  onUpdate,
}: {
  applicant: Application | null
  onClose: () => void
  onUpdate: (id: number, s: Application["status"]) => void
}) {
  if (!applicant || applicant.manualAdd) return null

  return (
    <DDialog open={!!applicant} onClose={onClose} size="md">
      <div className="flex items-start justify-between border-b border-[var(--border)] p-6">
        <div className="flex items-center gap-3">
          <Avatar
            name={applicant.name}
            tone={applicant.avatar as any}
            size={48}
          />
          <div>
            <h2 className="text-[17px] font-bold">{applicant.name}</h2>
            <div className="text-[12.5px] text-[var(--muted-foreground)]">
              {applicant.email}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-[var(--accent)]"
        >
          <Icon name="x" size={16} />
        </button>
      </div>

      <div className="space-y-4 p-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="mb-1 text-[11.5px] text-[var(--muted-foreground)]">
              الوظيفة المستهدفة
            </div>
            <div className="text-[13.5px] font-medium">{applicant.job}</div>
            <div className="mt-0.5 text-[12px] text-[var(--primary)]">
              {applicant.jobMeta}
            </div>
          </div>
          <div>
            <div className="mb-1 text-[11.5px] text-[var(--muted-foreground)]">
              تاريخ التقديم
            </div>
            <div className="tabular text-[13.5px] font-medium">
              {applicant.date}
            </div>
          </div>
          <div>
            <div className="mb-1 text-[11.5px] text-[var(--muted-foreground)]">
              الموقع
            </div>
            <div className="text-[13.5px] font-medium">
              {applicant.location || "—"}
            </div>
          </div>
          <div>
            <div className="mb-1 text-[11.5px] text-[var(--muted-foreground)]">
              الحالة
            </div>
            <Badge tone={STATUS_META[applicant.status].tone as any}>
              {STATUS_META[applicant.status].label}
            </Badge>
          </div>
        </div>
        <div>
          <div className="mb-2 text-[11.5px] text-[var(--muted-foreground)]">
            المرفقات
          </div>
          <div className="flex gap-2">
            {applicant.attachments.map((at, i) => (
              <div
                key={i}
                className="flex h-10 cursor-pointer items-center gap-2 rounded-md border border-[var(--border)] bg-white px-3 text-[13px] hover:bg-[var(--accent)]"
              >
                <AttachIcon type={at.type} />
                <span>
                  {at.type === "pdf"
                    ? "السيرة الذاتية.pdf"
                    : at.type === "image"
                      ? "أعمال سابقة.png"
                      : "رابط Portfolio"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-[var(--border)] p-4">
        <Btn
          onClick={() => {
            onUpdate(applicant.id, "shortlisted")
            onClose()
          }}
        >
          <Icon name="check" size={14} /> ترشيح
        </Btn>
        <Btn
          variant="outline"
          onClick={() => {
            onUpdate(applicant.id, "interview")
            onClose()
          }}
        >
          <Icon name="calendar" size={14} /> تحديد مقابلة
        </Btn>
        <div className="flex-1" />
        <Btn
          variant="ghost"
          onClick={() => {
            onUpdate(applicant.id, "rejected")
            onClose()
          }}
        >
          <Icon name="x" size={14} className="text-[var(--destructive)]" />
          <span className="text-[var(--destructive)]">رفض</span>
        </Btn>
      </div>
    </DDialog>
  )
}

/* ── Super-admin-only route guard ─────────────────────────────────── */
function SuperAdminOnly() {
  const { user } = useApp()
  if (user?.role !== "super_admin") return <Navigate to="/dashboard" replace />
  return null
}

/* ── Protected layout (dashboard shell + dialog) ─────────────────── */
function AdminLayout() {
  const { loggedIn, authLoading, viewing, setViewing, setApplications } =
    useApp()
  if (authLoading) return <AuthLoadingScreen />
  if (!loggedIn) return <Navigate to="/login" replace />

  return (
    <>
      <DashboardLayout />
      <ApplicantDialog
        applicant={viewing}
        onClose={() => setViewing(null)}
        onUpdate={(id, s) =>
          setApplications((prev) =>
            prev.map((x) => (x.id === id ? { ...x, status: s } : x))
          )
        }
      />
    </>
  )
}

/* ── Route wrappers: pull from context, pass as props ─────────────── */
function DashboardRoute() {
  const { applications, setViewing } = useApp()
  return <DashboardPage applications={applications} onOpenApp={setViewing} />
}

// function ApplicationsRoute() {
//   const { applications, setApplications, setViewing } = useApp()
//   return (
//     <ApplicationsPage
//       applications={applications}
//       setApplications={setApplications}
//       onOpenApp={setViewing}
//     />
//   )
// }

function IncomingRoute() {
  return <IncomingPage />
}

function JobsRoute() {
  return <JobsPage />
}

/* ── Root ─────────────────────────────────────────────────────────── */
export default function App() {
  const { loggedIn, authLoading } = useApp()

  // While the session check is in-flight, block rendering to avoid flicker
  if (authLoading) return <AuthLoadingScreen />

  return (
    <Routes>
      {/* Redirect already-logged-in users away from /login */}
      <Route
        path="/login"
        element={loggedIn ? <Navigate to="/incoming" replace /> : <LoginPage />}
      />

      {/* Protected admin routes */}
      <Route element={<AdminLayout />}>
        <Route index element={<Navigate to="/incoming" replace />} />
        <Route
          path="/dashboard"
          element={
            <>
              <SuperAdminOnly />
              <DashboardRoute />
            </>
          }
        />
        <Route path="/incoming" element={<IncomingRoute />} />
        <Route
          path="/jobs"
          element={
            <>
              <SuperAdminOnly />
              <JobsRoute />
            </>
          }
        />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Public routes — pages are self-contained */}
      <Route path="/careers" element={<CareersPage />} />
      <Route path="/careers/:id" element={<JobDetailPage />} />
      <Route path="/apply" element={<ApplyPage />} />

      {/* Fallback */}
      <Route
        path="*"
        element={<Navigate to={loggedIn ? "/dashboard" : "/login"} replace />}
      />
    </Routes>
  )
}
