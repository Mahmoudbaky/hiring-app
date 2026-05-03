import { useState } from "react"
import { Outlet, useLocation } from "react-router-dom"
import { Sidebar, Topbar } from "@/components/shell"

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { pathname } = useLocation()
  const page = pathname.replace(/^\//, "") || "dashboard"

  return (
    <div className="flex min-h-screen" dir="rtl">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Just for test purpose */}
      {/* <Sidebar
        page={page}
        onCloseMobile={() => setSidebarOpen(false)}
        isOpen={sidebarOpen}
      /> */}

      <main className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
