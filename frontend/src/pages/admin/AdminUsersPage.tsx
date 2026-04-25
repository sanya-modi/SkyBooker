// export { default } from '../../app/admin/users/page'
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { AdminHeader } from "@/components/admin/admin-header"
import {
  Users,
  Search,
  Filter,
  Ban,
  Trash2,
  CheckCircle2,
  XCircle,
  Mail,
  Phone,
  Calendar
} from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { authApi, type UserResponse } from "@/services/api"

export default function UsersPage() {
  const navigate = useNavigate()
  const { isLoggedIn } = useAuth()
  const [users, setUsers] = useState<UserResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('ALL')

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login')
      return
    }
    loadUsers()
  }, [isLoggedIn, navigate])

  const loadUsers = async () => {
    try {
      setLoading(true)
      // Mock data for now - replace with actual API call
      setUsers([])
    } catch (err) {
      console.error('Error loading users:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSuspend = async (userId: number) => {
    if (!confirm('Are you sure you want to suspend this user?')) return
    
    try {
      await authApi.updateUser(userId, { isActive: false })
      setUsers(users.map(u => u.id === userId ? { ...u, isActive: false } : u))
    } catch (err) {
      console.error('Error suspending user:', err)
      alert('Failed to suspend user')
    }
  }

  const handleActivate = async (userId: number) => {
    try {
      await authApi.updateUser(userId, { isActive: true })
      setUsers(users.map(u => u.id === userId ? { ...u, isActive: true } : u))
    } catch (err) {
      console.error('Error activating user:', err)
      alert('Failed to activate user')
    }
  }

  const handleDelete = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return
    
    try {
      await authApi.deleteUser(userId)
      setUsers(users.filter(u => u.id !== userId))
    } catch (err) {
      console.error('Error deleting user:', err)
      alert('Failed to delete user')
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      <AdminHeader />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 pt-24">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-red-600 mb-2">User Management</h1>
          <p className="text-slate-600">Manage all users in the system</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent appearance-none"
              >
                <option value="ALL">All Roles</option>
                <option value="CUSTOMER">Customers</option>
                <option value="AIRLINE_STAFF">Airline Staff</option>
                <option value="ADMIN">Administrators</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-600 mt-4">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 font-bold mb-2">No users found</p>
              <p className="text-sm text-slate-500">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-bold text-slate-600">User</th>
                    <th className="text-left py-4 px-6 text-sm font-bold text-slate-600">Contact</th>
                    <th className="text-left py-4 px-6 text-sm font-bold text-slate-600">Role</th>
                    <th className="text-left py-4 px-6 text-sm font-bold text-slate-600">Provider</th>
                    <th className="text-left py-4 px-6 text-sm font-bold text-slate-600">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-bold text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-bold text-slate-800">{user.firstName} {user.lastName}</p>
                          <p className="text-sm text-slate-500">ID: {user.id}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Mail className="w-4 h-4" />
                            {user.email}
                          </div>
                          {user.phoneNumber && (
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Phone className="w-4 h-4" />
                              {user.phoneNumber}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold ${
                          user.role === 'ADMIN' ? 'bg-red-50 text-red-700' :
                          user.role === 'AIRLINE_STAFF' ? 'bg-blue-50 text-blue-700' :
                          'bg-green-50 text-green-700'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-slate-600">{user.authProvider}</span>
                      </td>
                      <td className="py-4 px-6">
                        {user.isActive ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-green-50 text-green-700">
                            <CheckCircle2 className="w-3 h-3" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-red-50 text-red-700">
                            <XCircle className="w-3 h-3" />
                            Suspended
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          {user.isActive ? (
                            <button
                              onClick={() => handleSuspend(user.id)}
                              className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-all"
                              title="Suspend"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleActivate(user.id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all"
                              title="Activate"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

