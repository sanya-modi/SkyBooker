import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Plane,
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2
} from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { airlineApi, clearCache, type Airline } from "@/services/api"

export default function AirlinesPage() {
  const navigate = useNavigate()
  const { isLoggedIn } = useAuth()
  const [airlines, setAirlines] = useState<Airline[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingAirline, setEditingAirline] = useState<Airline | null>(null)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState({
    name: '',
    iataCode: '',
    description: '',
    phoneNumber: '',
    email: ''
  })

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login')
      return
    }
    loadAirlines()
  }, [isLoggedIn, navigate])

  const loadAirlines = async () => {
    try {
      setLoading(true)
      const data = await airlineApi.getAll(true)
      setAirlines(data)
    } catch (err) {
      console.error('Error loading airlines:', err)
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Airline name is required'
    } else if (!/^[A-Za-z0-9][A-Za-z0-9\s&()'.,-]{1,99}$/.test(formData.name)) {
      newErrors.name = 'Airline name format is invalid (2-100 characters)'
    }

    if (!formData.iataCode.trim()) {
      newErrors.iataCode = 'IATA code is required'
    } else if (!/^[A-Z0-9]{2,3}$/.test(formData.iataCode)) {
      newErrors.iataCode = 'IATA code must be 2-3 uppercase letters or digits'
    }

    if (formData.description && !/^[A-Za-z0-9\s&()_.,:;!?@#%/+-]{0,500}$/.test(formData.description)) {
      newErrors.description = 'Description format is invalid (max 500 characters)'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(formData.email)) {
      newErrors.email = 'Email format is invalid'
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required'
    } else if (!/^(?:[0-9]{10}|\+?[1-9]\d{1,14})$/.test(formData.phoneNumber.replace(/[\s-]/g, ''))) {
      newErrors.phoneNumber = 'Phone format is invalid (10 digits or international format)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleEdit = (airline: Airline) => {
    setEditingAirline(airline)
    setFormData({
      name: airline.name,
      iataCode: airline.iataCode,
      description: airline.description,
      phoneNumber: airline.phoneNumber,
      email: airline.email
    })
    setErrors({})
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      setSaving(true)
      if (editingAirline) {
        await airlineApi.update(editingAirline.id, formData)
      } else {
        await airlineApi.create(formData)
      }
      clearCache()
      await loadAirlines()
      setShowModal(false)
      setEditingAirline(null)
      setFormData({
        name: '',
        iataCode: '',
        description: '',
        phoneNumber: '',
        email: ''
      })
      setErrors({})
    } catch (err: any) {
      console.error('Error saving airline:', err)
      alert(err.message || 'Failed to save airline')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleStatus = async (airline: Airline) => {
    try {
      await airlineApi.update(airline.id, {
        name: airline.name,
        iataCode: airline.iataCode,
        description: airline.description,
        phoneNumber: airline.phoneNumber,
        email: airline.email,
        isActive: !airline.isActive
      })
      clearCache()
      await loadAirlines()
    } catch (err: any) {
      console.error('Error updating airline:', err)
      alert(err.message || 'Failed to update airline status')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to permanently delete this airline? This action cannot be undone.')) return
    
    try {
      await airlineApi.delete(id)
      clearCache()
      await loadAirlines()
    } catch (err: any) {
      console.error('Error deleting airline:', err)
      alert(err.message || 'Failed to delete airline')
    }
  }

  const filteredAirlines = airlines.filter(airline =>
    airline.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    airline.iataCode.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-sky-600 mb-2">Airline Management</h1>
            <p className="text-slate-600">Manage airlines and their information</p>
          </div>
          <button
            onClick={() => {
              setEditingAirline(null)
              setFormData({
                name: '',
                iataCode: '',
                description: '',
                phoneNumber: '',
                email: ''
              })
              setErrors({})
              setShowModal(true)
            }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Airline
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search airlines..."
              className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-600 mt-4">Loading airlines...</p>
            </div>
          ) : filteredAirlines.length === 0 ? (
            <div className="text-center py-12">
              <Plane className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 font-bold mb-2">No airlines found</p>
              <p className="text-sm text-slate-500">Add your first airline to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-bold text-slate-600">Airline</th>
                    <th className="text-left py-4 px-6 text-sm font-bold text-slate-600">IATA Code</th>
                    <th className="text-left py-4 px-6 text-sm font-bold text-slate-600">Contact</th>
                    <th className="text-left py-4 px-6 text-sm font-bold text-slate-600">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-bold text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAirlines.map((airline) => (
                    <tr key={airline.id} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-bold text-slate-800">{airline.name}</p>
                          <p className="text-sm text-slate-500">{airline.description}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-mono font-bold text-slate-800">{airline.iataCode}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <p className="text-sm text-slate-600">{airline.email}</p>
                          <p className="text-sm text-slate-600">{airline.phoneNumber}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {airline.isActive ? (
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
                            onClick={() => handleEdit(airline)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(airline)}
                            className={`p-2 rounded-lg transition-all ${
                              airline.isActive
                                ? 'text-yellow-600 hover:bg-yellow-50'
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                            title={airline.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {airline.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleDelete(airline.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete Permanently"
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
                {editingAirline ? 'Edit Airline' : 'Add New Airline'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Airline Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value })
                      if (errors.name) setErrors({ ...errors, name: '' })
                    }}
                    placeholder="e.g., Air India"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                      errors.name ? 'border-red-500' : 'border-slate-200'
                    }`}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">IATA Code *</label>
                  <input
                    type="text"
                    required
                    maxLength={3}
                    value={formData.iataCode}
                    onChange={(e) => {
                      setFormData({ ...formData, iataCode: e.target.value.toUpperCase() })
                      if (errors.iataCode) setErrors({ ...errors, iataCode: '' })
                    }}
                    placeholder="e.g., AI"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono ${
                      errors.iataCode ? 'border-red-500' : 'border-slate-200'
                    }`}
                  />
                  {errors.iataCode && <p className="text-red-500 text-xs mt-1">{errors.iataCode}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => {
                      setFormData({ ...formData, description: e.target.value })
                      if (errors.description) setErrors({ ...errors, description: '' })
                    }}
                    placeholder="Brief description..."
                    rows={2}
                    maxLength={500}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                      errors.description ? 'border-red-500' : 'border-slate-200'
                    }`}
                  />
                  {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value })
                      if (errors.email) setErrors({ ...errors, email: '' })
                    }}
                    placeholder="contact@airline.com"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                      errors.email ? 'border-red-500' : 'border-slate-200'
                    }`}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phoneNumber}
                    onChange={(e) => {
                      setFormData({ ...formData, phoneNumber: e.target.value })
                      if (errors.phoneNumber) setErrors({ ...errors, phoneNumber: '' })
                    }}
                    placeholder="+91 1234567890"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                      errors.phoneNumber ? 'border-red-500' : 'border-slate-200'
                    }`}
                  />
                  {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingAirline(null)
                  }}
                  className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      {editingAirline ? 'Update Airline' : 'Create Airline'}
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
