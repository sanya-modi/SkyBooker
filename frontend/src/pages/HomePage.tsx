import { Link } from 'react-router-dom'
import { CustomerHeader } from "@/components/layout/customer-header"
import { BottomNav } from "@/components/layout/bottom-nav"
import { 
  Plane, 
  ArrowRight, 
  ChevronRight,
  Star,
  Ticket,
  Bell,
  Car,
  Users
} from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#f7f9fb] pb-32 md:pb-0">
      <CustomerHeader />
      
      <main className="pt-20 px-4 md:px-8 space-y-8 max-w-7xl mx-auto">
        <section className="relative overflow-hidden bg-gradient-to-br from-[#00236f] to-[#1e3a8a] rounded-2xl p-6 md:p-8 text-white">
          <div className="relative z-10 space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded-full bg-green-400 flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-200">Booking Confirmed</span>
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">London to Tokyo</h2>
              <p className="text-blue-200 text-sm">Flight SK-442 - Nov 24, 2023</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-white/60">PNR Reference</p>
                <p className="text-xl font-mono font-bold tracking-widest">G4K9Z2</p>
              </div>
              <Link
                to="/bookings/download"
                className="bg-white text-[#00236f] px-6 py-2.5 rounded-full text-sm font-bold shadow-lg transition-transform active:scale-95"
              >
                Download Ticket
              </Link>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -left-10 -top-10 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl" />
        </section>

        <section className="bg-[#f2f4f6] rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full bg-[#00236f]/10 flex items-center justify-center text-[#00236f]">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold">Gate Update</h4>
              <p className="text-xs text-slate-500">London Heathrow (LHR) - Terminal 5</p>
            </div>
          </div>
          <button className="text-[#00236f]">
            <ChevronRight className="w-5 h-5" />
          </button>
        </section>

        <section className="space-y-6">
          <div className="flex items-center space-x-2 p-1 bg-[#f2f4f6] rounded-full w-fit">
            <button className="px-6 py-2 rounded-full bg-white text-[#00236f] text-sm font-bold shadow-sm">
              Upcoming
            </button>
            <button className="px-6 py-2 rounded-full text-slate-500 text-sm font-medium hover:bg-white/50 transition-colors">
              Past Flights
            </button>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm group hover:bg-[#f2f4f6] transition-colors duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#f2f4f6] rounded-xl flex items-center justify-center">
                  <Plane className="w-5 h-5 text-[#00236f]" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Paris (CDG)</h3>
                  <p className="text-xs text-slate-500">Air France - AF1582</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wider rounded-full">
                On Time
              </span>
            </div>

            <div className="flex items-center justify-between py-4 relative">
              <div className="text-center">
                <p className="text-2xl font-extrabold">14:20</p>
                <p className="text-xs text-slate-500">Terminal 2E</p>
              </div>
              <div className="flex-1 flex flex-col items-center px-4">
                <div className="w-full h-px bg-slate-200 relative">
                  <Plane className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-[#00236f] rotate-90" />
                </div>
                <p className="text-[10px] text-slate-500 mt-2 font-medium tracking-widest uppercase">1h 15m</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-extrabold">15:35</p>
                <p className="text-xs text-slate-500">Gate B21</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full border-2 border-white bg-[#e6e8ea] overflow-hidden" />
                <div className="w-8 h-8 rounded-full border-2 border-white bg-[#00236f] text-white flex items-center justify-center text-[10px] font-bold">
                  +2
                </div>
              </div>
              <Link to="/bookings/1" className="text-[#00236f] text-sm font-bold flex items-center gap-1">
                Details <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Next Hotel</p>
              <div className="h-24 w-full rounded-xl bg-gradient-to-br from-blue-100 to-blue-200" />
              <h4 className="font-bold text-sm leading-tight">The Ritz-Carlton, Kyoto</h4>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm flex flex-col justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Transfer</p>
                <p className="text-sm font-bold">Private SUV</p>
                <p className="text-xs text-slate-500">Confirmed</p>
              </div>
              <div className="w-12 h-12 bg-[#b7c4fd]/20 rounded-full flex items-center justify-center text-[#4f5c8e]">
                <Car className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden h-40 flex items-center">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00236f] to-[#1e3a8a]" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-transparent" />
            <div className="relative z-10 p-6 text-white space-y-2">
              <h3 className="text-xl font-bold leading-tight">
                Explore the<br />Ancient Capital
              </h3>
              <Link 
                to="/tours"
                className="bg-white text-[#00236f] px-4 py-1.5 rounded-full text-xs font-bold inline-block transition-transform active:scale-95"
              >
                Book Tours
              </Link>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-4 gap-4 pb-8">
          <Link to="/flights" className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white shadow-sm hover:bg-[#f2f4f6] transition-colors">
            <div className="w-12 h-12 rounded-full bg-[#00236f]/10 flex items-center justify-center">
              <Plane className="w-5 h-5 text-[#00236f]" />
            </div>
            <span className="text-xs font-bold text-slate-700">Flights</span>
          </Link>
          <Link to="/bookings" className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white shadow-sm hover:bg-[#f2f4f6] transition-colors">
            <div className="w-12 h-12 rounded-full bg-[#00236f]/10 flex items-center justify-center">
              <Ticket className="w-5 h-5 text-[#00236f]" />
            </div>
            <span className="text-xs font-bold text-slate-700">Bookings</span>
          </Link>
          <Link to="/profile" className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white shadow-sm hover:bg-[#f2f4f6] transition-colors">
            <div className="w-12 h-12 rounded-full bg-[#00236f]/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-[#00236f]" />
            </div>
            <span className="text-xs font-bold text-slate-700">Profile</span>
          </Link>
          <Link to="/support" className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white shadow-sm hover:bg-[#f2f4f6] transition-colors">
            <div className="w-12 h-12 rounded-full bg-[#00236f]/10 flex items-center justify-center">
              <Star className="w-5 h-5 text-[#00236f]" />
            </div>
            <span className="text-xs font-bold text-slate-700">Rewards</span>
          </Link>
        </section>
      </main>

      <button className="fixed bottom-28 right-6 w-14 h-14 bg-[#00236f] text-white rounded-full flex items-center justify-center shadow-xl shadow-[#00236f]/20 z-40 transition-transform active:scale-90 md:hidden">
        <Plane className="w-6 h-6" />
      </button>

      <BottomNav />
    </div>
  )
}
