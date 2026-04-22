import { useState } from 'react';
import { Sidebar, Topbar } from '@/components/shell';

type Page = string;

interface DashboardLayoutProps {
  page: Page;
  setPage: (p: Page) => void;
  children: React.ReactNode;
}

export function DashboardLayout({ page, setPage, children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen" dir="rtl">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        page={page}
        setPage={(p) => { setPage(p); setSidebarOpen(false); }}
        isOpen={sidebarOpen}
      />

      <main className="flex-1 min-w-0 flex flex-col">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
