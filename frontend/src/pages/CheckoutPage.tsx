// export { default } from '../app/checkout/page'
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { CustomerHeader } from "@/components/layout/customer-header"
import { 
  CreditCard, 
  Lock, 
  Wifi,
  Shield
} from "lucide-react"

export default function CheckoutPage() {
  const navigate = useNavigate()
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'netbanking'>('card')
  const [cardData, setCardData] = useState({
    name: 'Alex Thompson',
    number: '',
    expiry: '',
    cvv: ''
  })

  const handlePayment = () => {
    navigate('/booking-success')
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb] pb-32">
      <CustomerHeader showBack showSecure onBack={() => navigate(-1)} />

      <main className="pt-20 px-4 md:px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-8">
          {/* Left Column: Payment Methods */}
          <div className="lg:col-span-7 space-y-8">
            <section>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[#00236f] mb-2">
                Payment Method
              </h2>
              <p className="text-slate-500 mb-8">Choose your preferred way to pay for your journey.</p>

              {/* Payment Tabs */}
              <div className="flex p-1.5 bg-[#f2f4f6] rounded-xl mb-10 w-fit">
                {(['card', 'upi', 'netbanking'] as const).map((method) => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`px-8 py-3 rounded-lg text-sm font-bold tracking-wide uppercase transition-all ${
                      paymentMethod === method 
                        ? 'bg-white text-[#00236f] shadow-[0_10px_40px_-10px_rgba(0,35,111,0.06)]' 
                        : 'text-slate-500 hover:text-[#00236f]'
                    }`}
                  >
                    {method === 'card' ? 'Card' : method === 'upi' ? 'UPI' : 'Net Banking'}
                  </button>
                ))}
              </div>

              {/* Visual Credit Card */}
              <div className="relative mb-12 group">
                <div className="absolute -top-6 -left-6 w-32 h-32 bg-[#00236f]/5 rounded-full blur-3xl" />
                
                <div className="relative w-full max-w-md aspect-[1.6/1] rounded-2xl p-8 text-white overflow-hidden shadow-[0_10px_40px_-10px_rgba(0,35,111,0.06)] bg-gradient-to-br from-[#00236f] to-[#1e3a8a] flex flex-col justify-between transform transition-transform group-hover:scale-[1.02] duration-500">
                  {/* Abstract Pattern */}
                  <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full -mr-20 -mt-20 blur-2xl" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#1e3a8a]/40 rounded-full -ml-10 -mb-10 blur-xl" />
                  </div>

                  <div className="flex justify-between items-start relative z-10">
                    <Wifi className="w-10 h-8 text-white/40" />
                    <div className="h-8 w-12 bg-white/10 rounded-md backdrop-blur-sm border border-white/20" />
                  </div>

                  <div className="space-y-6 relative z-10">
                    <p className="text-2xl tracking-[0.25em] font-medium">
                      {cardData.number || '•••• •••• •••• 4242'}
                    </p>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest opacity-60 mb-1">Card Holder</p>
                        <p className="text-sm font-bold tracking-wide uppercase">{cardData.name}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest opacity-60 mb-1">Expires</p>
                        <p className="text-sm font-bold tracking-wide">{cardData.expiry || '09/27'}</p>
                      </div>
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-[#b7c4fd]/40 rounded-full mix-blend-screen" />
                        <div className="w-6 h-6 bg-[#b6c4ff]/40 rounded-full -ml-3 mix-blend-screen" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Inputs */}
              <div className="space-y-4">
                <div className="group">
                  <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 mb-1.5 ml-1">
                    Cardholder Name
                  </label>
                  <input 
                    type="text"
                    placeholder="Alex Thompson"
                    value={cardData.name}
                    onChange={(e) => setCardData({...cardData, name: e.target.value})}
                    className="w-full bg-[#f2f4f6] border-none rounded-lg py-4 px-4 text-sm font-medium focus:ring-2 focus:ring-[#00236f]/40 transition-all placeholder:text-slate-400"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="group">
                    <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 mb-1.5 ml-1">
                      Expiry Date
                    </label>
                    <input 
                      type="text"
                      placeholder="MM/YY"
                      value={cardData.expiry}
                      onChange={(e) => setCardData({...cardData, expiry: e.target.value})}
                      className="w-full bg-[#f2f4f6] border-none rounded-lg py-4 px-4 text-sm font-medium focus:ring-2 focus:ring-[#00236f]/40 transition-all placeholder:text-slate-400"
                    />
                  </div>
                  <div className="group">
                    <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 mb-1.5 ml-1">
                      CVV
                    </label>
                    <input 
                      type="password"
                      placeholder="•••"
                      maxLength={4}
                      value={cardData.cvv}
                      onChange={(e) => setCardData({...cardData, cvv: e.target.value})}
                      className="w-full bg-[#f2f4f6] border-none rounded-lg py-4 px-4 text-sm font-medium focus:ring-2 focus:ring-[#00236f]/40 transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Booking Summary */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white rounded-2xl p-8 shadow-[0_10px_40px_-10px_rgba(0,35,111,0.06)] border-t-4 border-[#00236f]">
                <h3 className="text-xl font-bold text-[#00236f] mb-6">Booking Summary</h3>
                
                {/* Flight Detail */}
                <div className="flex gap-4 mb-6">
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-100 to-blue-200" />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-slate-800">London to Tokyo</h4>
                      <span className="text-[10px] font-bold uppercase tracking-widest bg-[#b7c4fd]/30 text-[#435081] px-2 py-0.5 rounded">
                        Business
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Dec 14 — Dec 28 - 1 Passenger</p>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-4 pt-6 border-t border-[#e6e8ea]">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Base Fare</span>
                    <span className="font-medium">$1,120.00</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Taxes & Fees</span>
                    <span className="font-medium">$95.00</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Convenience Fee</span>
                    <span className="font-medium">$25.00</span>
                  </div>
                </div>

                {/* Total */}
                <div className="pt-6 mt-6 border-t border-[#00236f]/10">
                  <div className="flex justify-between items-end mb-8">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#00236f]">Total Amount</p>
                      <p className="text-3xl font-extrabold text-[#00236f] mt-1">$1,240.00</p>
                    </div>
                    <Shield className="w-12 h-12 text-[#1e3a8a]/20" />
                  </div>
                  <button 
                    onClick={handlePayment}
                    className="w-full py-5 rounded-full bg-[#6bff8f] text-[#002109] font-bold tracking-wide uppercase text-sm shadow-xl shadow-[#6bff8f]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                  >
                    <span>Confirm & Pay</span>
                    <CreditCard className="w-4 h-4" />
                  </button>
                  <p className="text-[10px] text-center text-slate-500 mt-6 leading-relaxed">
                    By clicking &apos;Confirm & Pay&apos;, you agree to SkyBooker&apos;s{' '}
                    <a href="#" className="underline hover:text-[#00236f]">Terms of Service</a> and{' '}
                    <a href="#" className="underline hover:text-[#00236f]">Cancellation Policy</a>.
                  </p>
                </div>
              </div>

              {/* Trust Badge */}
              <div className="bg-[#f2f4f6] rounded-2xl p-6 flex items-center gap-4 border-l-2 border-[#00236f]/20">
                <Lock className="w-5 h-5 text-[#00236f]/60" />
                <p className="text-xs text-slate-500 font-medium">
                  Your data is protected by 256-bit SSL encryption and follows PCI DSS compliance standards.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

