// export { default } from '../../app/admin/payments/page'
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { AdminHeader } from "@/components/admin/admin-header"
import {
  CreditCard,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw
} from "lucide-react"
import { useAuth } from "@/context/auth-context"

export default function PaymentsPage() {
  const navigate = useNavigate()
  const { isLoggedIn } = useAuth()
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login')
      return
    }
    setLoading(false)
  }, [isLoggedIn, navigate])

  const stats = [
    {
      label: 'Total Transactions',
      value: '0',
      icon: CreditCard,
      color: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      label: 'Total Revenue',
      value: '₹0',
      icon: DollarSign,
      color: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      label: 'Pending Refunds',
      value: '0',
      icon: RefreshCw,
      color: 'bg-yellow-50',
      textColor: 'text-yellow-600'
    },
    {
      label: 'Success Rate',
      value: '100%',
      icon: TrendingUp,
      color: 'bg-emerald-50',
      textColor: 'text-emerald-600'
    }
  ]

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      <AdminHeader />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 pt-24">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-red-600 mb-2">Payment Management</h1>
          <p className="text-slate-600">Monitor transactions and process refunds</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.textColor}`} />
                  </div>
                </div>
                <p className="text-3xl font-black text-slate-800 mb-1">{stat.value}</p>
                <p className="text-sm text-slate-500 font-bold">{stat.label}</p>
              </div>
            )
          })}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by transaction ID..."
                className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent appearance-none"
              >
                <option value="ALL">All Status</option>
                <option value="SUCCESS">Success</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
                <option value="REFUNDED">Refunded</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="text-center py-12">
            <CreditCard className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 font-bold mb-2">No transactions yet</p>
            <p className="text-sm text-slate-500">Transactions will appear here once bookings are made</p>
          </div>
        </div>
      </main>
    </div>
  )
}


