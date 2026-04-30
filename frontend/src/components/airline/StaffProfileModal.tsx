import { useState, useRef, useEffect } from "react"
import { Camera, X, Loader2, Save } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { type UserResponse, getAllAirlinesCached, type Airline } from "@/services/api"

interface StaffProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

export function StaffProfileModal({ isOpen, onClose }: StaffProfileModalProps) {
  const { profile, updateProfile } = useAuth()
  const [airlines, setAirlines] = useState<Airline[]>([])
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  
  const [formData, setFormData] = useState({
    firstName: profile?.firstName || '',
    lastName: profile?.lastName || '',
    phoneNumber: profile?.phoneNumber || '',
    profilePhotoUrl: profile?.profilePhotoUrl || ''
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setFormData({
        firstName: profile?.firstName || '',
        lastName: profile?.lastName || '',
        phoneNumber: profile?.phoneNumber || '',
        profilePhotoUrl: profile?.profilePhotoUrl || ''
      })
      setSuccessMsg('')
      setErrorMsg('')
    }
  }, [isOpen, profile])

  useEffect(() => {
    getAllAirlinesCached().then(setAirlines).catch(console.error)
  }, [])

  if (!isOpen || !profile) return null

  const myAirline = airlines.find(a => a.id === profile.airlineId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')
    
    try {
      await updateProfile(formData)
      setSuccessMsg('Profile updated successfully!')
      setTimeout(() => {
        setSuccessMsg('')
        onClose()
      }, 2000)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  // Handle local file selection to show preview and simulate upload
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // In a real app, upload file to S3/Cloudinary and get URL.
      // Here, using an object URL for preview and simulating saving the URL.
      const objectUrl = URL.createObjectURL(file)
      setFormData({ ...formData, profilePhotoUrl: objectUrl })
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-2xl font-black text-[#00236f]">Edit Profile</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {successMsg && (
            <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl font-bold text-sm">
              {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl font-bold text-sm">
              {errorMsg}
            </div>
          )}

          <div className="flex flex-col items-center mb-8">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#00236f] bg-slate-100 flex items-center justify-center">
                {formData.profilePhotoUrl ? (
                  <img src={formData.profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-black text-[#00236f]">
                    {formData.firstName?.[0]}{formData.lastName?.[0]}
                  </span>
                )}
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-sm font-bold text-slate-500 mt-3 cursor-pointer hover:text-[#00236f]" onClick={() => fileInputRef.current?.click()}>
              Change Photo
            </p>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoChange} />
          </div>

          <form id="profile-form" onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">First Name</label>
                <input
                  type="text"
                  required
                  pattern="^[A-Za-z][A-Za-z\s'-]{1,49}$"
                  maxLength={50}
                  title="First name must be 2-50 alphabetic characters"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00236f]"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Last Name</label>
                <input
                  type="text"
                  required
                  pattern="^[A-Za-z][A-Za-z\s'-]{1,49}$"
                  maxLength={50}
                  title="Last name must be 2-50 alphabetic characters"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00236f]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Email (Read Only)</label>
              <input
                type="email"
                readOnly
                value={profile.email}
                className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                pattern="^[0-9]{10}$"
                maxLength={10}
                title="Phone number must be exactly 10 digits"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00236f]"
                placeholder="e.g. 9876543210"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Airline (Read Only)</label>
              <input
                type="text"
                readOnly
                value={myAirline ? `${myAirline.name} (${myAirline.iataCode})` : 'N/A'}
                className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-slate-200 bg-slate-50">
          <button
            type="submit"
            form="profile-form"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-[#00236f] to-[#1e3a8a] text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
