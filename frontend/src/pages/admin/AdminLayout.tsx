// export { default } from '../../app/admin/layout'
import { Outlet } from 'react-router-dom'
import { AdminSidebar } from "@/components/layout/admin-sidebar"
import { AdminHeader } from "@/components/layout/admin-header"
import { BottomNav } from "@/components/layout/bottom-nav"

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      <AdminSidebar />
      <div className="lg:ml-64">
        <AdminHeader showSearch showDateRange />
        <main className="pb-32 lg:pb-8">
          <Outlet />
        </main>
      </div>
      <BottomNav variant="admin" />
    </div>
  )
}

