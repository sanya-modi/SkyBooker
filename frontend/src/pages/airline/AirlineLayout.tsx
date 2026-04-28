import { Outlet } from 'react-router-dom'
import { AirlineHeader } from '@/components/airline/airline-header'

export default function AirlineLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <AirlineHeader />
      <main className="w-full px-6 pt-16">
        <Outlet />
      </main>
    </div>
  )
}
