// export { default } from '../app/profile/page'
import { Link } from 'react-router-dom'
import { CustomerHeader } from "@/components/layout/customer-header"
import { BottomNav } from "@/components/layout/bottom-nav"
import { 
  Star, 
  Mail, 
  Phone, 
  Shield, 
  LogOut,
  ChevronRight,
  User
} from "lucide-react"

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-[#f7f9fb] pb-32">
      <CustomerHeader />

      <main className="pt-24 px-4 md:px-6 max-w-lg mx-auto space-y-8">
        {/* Premium Loyalty Card */}
        <section className="relative overflow-hidden bg-[#1e3a8a] rounded-2xl p-6 text-white shadow-xl">
          {/* Background Texture */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/10 rounded-full -ml-24 -mb-24 blur-3xl" />
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-10">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.1em] opacity-80 mb-1">Loyalty Tier</p>
                <h2 className="text-2xl font-extrabold tracking-tight">SkyBooker Elite</h2>
              </div>
              <Star className="w-10 h-10 text-yellow-400" fill="currentColor" />
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.1em] opacity-80 mb-1">Miles Balance</p>
                <p className="text-3xl font-bold">128,450</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-xs font-semibold">
                Gold Member
              </div>
            </div>
          </div>
        </section>

        {/* Personal Information */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Personal Information</h3>
            <button className="text-[#00236f] text-xs font-semibold">Edit</button>
          </div>
          
          <div className="bg-white rounded-2xl p-6 space-y-6 shadow-[0_40px_60px_rgba(0,0,0,0.04)]">
            {/* Profile Identity */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-[#f2f4f6] flex items-center justify-center overflow-hidden">
                <User className="w-8 h-8 text-[#00236f]" />
              </div>
              <div>
                <h4 className="text-xl font-bold tracking-tight text-[#00236f]">Marcus Holloway</h4>
                <p className="text-slate-500 text-sm">Member since 2021</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5">
              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-full bg-[#f2f4f6] flex items-center justify-center text-[#00236f] transition-colors group-hover:bg-[#00236f]/5">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400">Email Address</p>
                  <p className="text-slate-800 font-medium">m.holloway@skybooker.com</p>
                </div>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-full bg-[#f2f4f6] flex items-center justify-center text-[#00236f] transition-colors group-hover:bg-[#00236f]/5">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400">Phone Number</p>
                  <p className="text-slate-800 font-medium">+1 (555) 092-4412</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Passport Details */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Passport Details</h3>
            <Shield className="w-4 h-4 text-[#00236f]/40" />
          </div>
          
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="col-span-2">
                <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400 mb-1">Passport Number</p>
                <p className="text-slate-800 font-bold text-lg tracking-[0.2em]">A12930485</p>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400 mb-1">Nationality</p>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-3.5 bg-[#e6e8ea] rounded-sm overflow-hidden border border-slate-200 flex items-center justify-center">
                    <span className="text-[8px]">🇺🇸</span>
                  </div>
                  <p className="text-slate-800 font-medium">USA</p>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400 mb-1">Expiry Date</p>
                <p className="text-slate-800 font-medium">14 NOV 2030</p>
              </div>
            </div>
          </div>
        </section>

        {/* Action Items */}
        <section className="pb-10 flex flex-col gap-3">
          <Link 
            to="/profile/security"
            className="w-full h-14 bg-[#f2f4f6] hover:bg-[#e6e8ea] text-[#00236f] font-bold rounded-2xl flex items-center justify-between px-6 transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5" />
              <span>Security Settings</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </Link>
          <button className="w-full h-14 bg-[#f2f4f6] hover:bg-red-50 text-red-500 font-bold rounded-2xl flex items-center justify-between px-6 transition-all active:scale-[0.98]">
            <div className="flex items-center gap-3">
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </div>
          </button>
        </section>
      </main>

      <BottomNav />
    </div>
  )
}

