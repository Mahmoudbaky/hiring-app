import {
  SidebarProvider,
  SidebarInset,
} from '@/components/ui/sidebar';
import { AppSidebar, AppTopbar } from '@/components/shell';

interface DashboardLayoutProps {
  page: string;
  setPage: (p: string) => void;
  children: React.ReactNode;
}

export function DashboardLayout({ page, setPage, children }: DashboardLayoutProps) {
  return (
    <SidebarProvider dir="rtl">
      <AppSidebar page={page} setPage={setPage} />
      <SidebarInset>
        <AppTopbar />
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
