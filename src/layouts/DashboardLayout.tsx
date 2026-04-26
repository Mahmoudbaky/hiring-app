import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar, Topbar } from '@/components/shell';

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const page = pathname.replace(/^\//, '') || 'dashboard';

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
        onCloseMobile={() => setSidebarOpen(false)}
        isOpen={sidebarOpen}
      />

      <main className="flex-1 min-w-0 flex flex-col">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
