import { Outlet } from 'react-router-dom'
import { AdminTopNav } from "@/components/layout/admin-top-nav"

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      <AdminTopNav />
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  )
}

