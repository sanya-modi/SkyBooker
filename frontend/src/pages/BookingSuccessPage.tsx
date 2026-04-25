// export { default } from '../app/booking-success/page'
import { Link } from 'react-router-dom'
import { CustomerHeader } from "@/components/layout/customer-header"
import { 
  CheckCircle, 
  Download, 
  Ticket, 
  ArrowRight,
  Plane
} from "lucide-react"

export default function BookingSuccessPage() {
  return (
    <div className="min-h-screen bg-[#f7f9fb] flex flex-col items-center justify-center p-6 md:p-12">
      {/* Background Decorative Elements */}
      <div className="fixed -top-24 -left-12 w-64 h-64 bg-[#00236f]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed -bottom-32 -right-12 w-96 h-96 bg-[#b7c4fd]/10 rounded-full blur-3xl pointer-events-none" />

      <main className="w-full max-w-4xl mx-auto relative">
        {/* Success Card */}
        <div className="relative bg-white rounded-2xl shadow-[0_40px_60px_-20px_rgba(0,35,111,0.05)] p-8 md:p-16 text-center overflow-hidden">
          {/* Decorative Flight Overlay */}
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Plane className="w-28 h-28 text-[#00236f] rotate-12" />
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Checkmark */}
            <div className="w-24 h-24 md:w-32 md:h-32 bg-green-100 rounded-full flex items-center justify-center mb-8">
              <CheckCircle className="w-16 h-16 md:w-20 md:h-20 text-green-500" strokeWidth={1.5} />
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-[#00236f] tracking-tight mb-4">
              Booking Confirmed
            </h1>
            <p className="text-slate-500 text-lg md:text-xl max-w-xl mx-auto leading-relaxed">
              Your flight with SkyHorizon is all set. We&apos;ve sent a confirmation email with all the details to your registered address.
            </p>

            {/* PNR Section */}
            <div className="mt-12 mb-12 flex flex-col items-center w-full">
              <div className="bg-[#f2f4f6] rounded-2xl p-6 md:p-8 w-full max-w-md flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-left">
                  <span className="text-xs font-bold tracking-widest text-[#4f5c8e] uppercase block mb-1">
                    Booking Reference
                  </span>
                  <span className="text-3xl font-black text-[#00236f] tracking-tighter">
                    PNR: SH792KL
                  </span>
                </div>
                <div className="hidden md:block h-16 w-px bg-slate-200" />
                <div className="text-right flex flex-col items-end">
                  <span className="text-xs font-bold tracking-widest text-[#4f5c8e] uppercase block mb-1">
                    Passenger
                  </span>
                  <span className="text-lg font-bold text-slate-800">ALEXANDER R.</span>
                </div>
              </div>
            </div>

            {/* Flight Preview */}
            <div className="w-full max-w-2xl bg-[#eceef0] rounded-2xl p-6 mb-12 flex flex-col md:flex-row items-center gap-8 text-left">
              <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                <Plane className="w-10 h-10 text-[#00236f]" />
              </div>
              <div className="flex-1 grid grid-cols-3 gap-8">
                <div>
                  <span className="block text-[10px] font-bold text-[#4f5c8e] uppercase tracking-widest mb-1">From</span>
                  <span className="block text-xl font-bold text-[#00236f]">LHR</span>
                  <span className="text-xs text-slate-500">London</span>
                </div>
                <div className="flex items-center justify-center">
                  <ArrowRight className="w-6 h-6 text-slate-300" />
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-[#4f5c8e] uppercase tracking-widest mb-1">To</span>
                  <span className="block text-xl font-bold text-[#00236f]">JFK</span>
                  <span className="text-xs text-slate-500">New York</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              <button className="bg-gradient-to-br from-[#00236f] to-[#1e3a8a] text-white px-10 py-5 rounded-xl font-bold text-lg shadow-[0_10px_40px_-10px_rgba(0,35,111,0.3)] transition-all duration-300 active:scale-95 flex items-center justify-center gap-3">
                <Download className="w-5 h-5" />
                Download E-Ticket (PDF)
              </button>
              <Link 
                to="/bookings"
                className="bg-[#b7c4fd] text-[#435081] px-10 py-5 rounded-xl font-bold text-lg transition-all duration-300 active:scale-95 hover:bg-[#b7c4fd]/80 flex items-center justify-center gap-3"
              >
                <Ticket className="w-5 h-5" />
                Go to My Bookings
              </Link>
            </div>

            <Link 
              to="/receipt"
              className="mt-8 text-[#4f5c8e] font-semibold hover:text-[#00236f] transition-colors flex items-center gap-2 group"
            >
              View Receipt
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-12 text-center">
          <p className="text-slate-500 font-medium text-sm">
            Need help with your booking?{' '}
            <Link to="/support" className="text-[#00236f] font-bold hover:underline underline-offset-4 ml-1">
              Contact Support
            </Link>
          </p>
        </div>

        {/* Branding */}
        <div className="mt-auto pt-12 pb-8 flex items-center justify-center">
          <div className="flex items-center gap-2 opacity-40">
            <span className="text-2xl font-black italic tracking-tighter text-[#00236f]">SkyHorizon</span>
            <span className="h-4 w-px bg-[#00236f]/30" />
            <span className="text-sm font-medium tracking-tight text-[#00236f]">Digital Concierge Service</span>
          </div>
        </div>
      </main>
    </div>
  )
}


