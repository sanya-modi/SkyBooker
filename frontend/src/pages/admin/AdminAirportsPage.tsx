// export { default } from '../../app/admin/airports/page'
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { AdminHeader } from "@/components/admin/admin-header"
import {
  MapPin,
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2
} from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { airportApi, type Airport } from "@/services/api"

export default function AirportsPage() {
  const navigate = useNavigate()
  const { isLoggedIn } = useAuth()
  const [airports, setAirports] = useState<Airport[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingAirport, setEditingAirport] = useState<Airport | null>(null)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    iataCode: '',
    city: '',
    country: '',
    description: '',
    phoneNumber: '',
    email: ''
  })

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login')
      return
    }
    loadAirports()
  }, [isLoggedIn, navigate])

  const loadAirports = async () => {
    try {
      setLoading(true)
      const data = await airportApi.getAll()
      setAirports(data)
    } catch (err) {
      console.error('Error loading airports:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (airport: Airport) => {
    setEditingAirport(airport)
    setFormData({
      name: airport.name,
      iataCode: airport.iataCode,
      city: airport.city,
      country: airport.country,
      description: airport.description,
      phoneNumber: airport.phoneNumber,
      email: airport.email
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSaving(true)
      if (editingAirport) {
        await airportApi.update(editingAirport.id, formData)
      } else {
        await airportApi.create(formData)
      }
      await loadAirports()
      setShowModal(false)
      setEditingAirport(null)
      setFormData({
        name: '',
        iataCode: '',
        city: '',
        country: '',
        description: '',
        phoneNumber: '',
        email: ''
      })
    } catch (err) {
      console.error('Error saving airport:', err)
      alert('Failed to save airport')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      await airportApi.update(id, { isActive: !currentStatus })
      setAirports(airports.map(a => a.id === id ? { ...a, isActive: !currentStatus } : a))
    } catch (err) {
      console.error('Error updating airport:', err)
      alert('Failed to update airport status')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this airport?')) return
    
    try {
      await airportApi.delete(id)
      setAirports(airports.filter(a => a.id !== id))
    } catch (err) {
      console.error('Error deleting airport:', err)
      alert('Failed to delete airport')
    }
  }

  const filteredAirports = airports.filter(airport =>
    airport.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    airport.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    airport.iataCode.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      <AdminHeader />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 pt-24">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-red-600 mb-2">Airport Management</h1>
            <p className="text-slate-600">Manage airports and their information</p>
          </div>
          <button
            onClick={() => {
              setEditingAirport(null)
              setFormData({
                name: '',
                iataCode: '',
                city: '',
                country: '',
                description: '',
                phoneNumber: '',
                email: ''
              })
              setShowModal(true)
            }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-bold hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Airport
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search airports..."
              className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-600 mt-4">Loading airports...</p>
            </div>
          ) : filteredAirports.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 font-bold mb-2">No airports found</p>
              <p className="text-sm text-slate-500">Add your first airport to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-bold text-slate-600">Airport</th>
                    <th className="text-left py-4 px-6 text-sm font-bold text-slate-600">IATA Code</th>
                    <th className="text-left py-4 px-6 text-sm font-bold text-slate-600">Location</th>
                    <th className="text-left py-4 px-6 text-sm font-bold text-slate-600">Contact</th>
                    <th className="text-left py-4 px-6 text-sm font-bold text-slate-600">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-bold text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAirports.map((airport) => (
                    <tr key={airport.id} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-bold text-slate-800">{airport.name}</p>
                          <p className="text-sm text-slate-500">{airport.description}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-mono font-bold text-slate-800">{airport.iataCode}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-bold text-slate-800">{airport.city}</p>
                          <p className="text-sm text-slate-500">{airport.country}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <p className="text-sm text-slate-600">{airport.email}</p>
                          <p className="text-sm text-slate-600">{airport.phoneNumber}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {airport.isActive ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-green-50 text-green-700">
                            <CheckCircle2 className="w-3 h-3" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-red-50 text-red-700">
                            <XCircle className="w-3 h-3" />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(airport)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(airport.id, airport.isActive)}
                            className={`p-2 rounded-lg transition-all ${
                              airport.isActive
                                ? 'text-yellow-600 hover:bg-yellow-50'
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                            title={airport.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {airport.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleDelete(airport.id)}
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

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-2xl font-black text-slate-800">
                {editingAirport ? 'Edit Airport' : 'Add New Airport'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Airport Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Indira Gandhi International Airport"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">IATA Code *</label>
                  <input
                    type="text"
                    required
                    maxLength={3}
                    value={formData.iataCode}
                    onChange={(e) => setFormData({ ...formData, iataCode: e.target.value.toUpperCase() })}
                    placeholder="e.g., DEL"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent font-mono"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">City *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g., New Delhi"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Country *</label>
                  <input
                    type="text"
                    required
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="e.g., India"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description..."
                    rows={2}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contact@airport.com"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="+91 1234567890"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingAirport(null)
                  }}
                  className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      {editingAirport ? 'Update Airport' : 'Create Airport'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}


