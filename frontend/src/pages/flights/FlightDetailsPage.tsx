// export { default } from '../../app/flights/[id]/book/page'
// "use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { CustomerHeader } from "@/components/layout/customer-header"
import { BottomNav } from "@/components/layout/bottom-nav"
import { ProgressStepper } from "@/components/ui/progress-stepper"
import { MealCard } from "@/components/addons/meal-card"
import { 
  User, 
  Luggage, 
  Plus, 
  Minus,
  ArrowLeft,
  Shield,
  Plane,
  ArrowRight
} from "lucide-react"

const steps = [
  { label: 'Details', status: 'current' as const },
  { label: 'Add-ons', status: 'upcoming' as const },
  { label: 'Payment', status: 'upcoming' as const }
]

const meals = [
  { id: 'executive', name: 'The Executive', description: 'Grilled salmon with citrus glaze and seasonal herbs.', price: 0, image: '' },
  { id: 'garden', name: 'The Garden', description: 'Organic quinoa bowl with roasted vegetables and tahini.', price: 12, image: '' },
  { id: 'asian', name: 'Asian Fusion', description: 'Teriyaki chicken with jasmine rice and steamed vegetables.', price: 15, image: '' },
]

export default function BookingPage() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [title, setTitle] = useState<'Mr' | 'Ms' | 'Mrs'>('Mr')
  const [selectedMeal, setSelectedMeal] = useState('executive')
  const [extraBaggage, setExtraBaggage] = useState(1)
  const [passengerData, setPassengerData] = useState({
    fullName: '',
    dateOfBirth: '',
    passportNumber: ''
  })

  const totalPrice = 1248 + (selectedMeal === 'garden' ? 12 : selectedMeal === 'asian' ? 15 : 0) + (extraBaggage * 45)

  const handleContinue = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1)
    } else {
      navigate('/checkout')
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb] pb-40">
      <CustomerHeader showBack onBack={() => navigate(-1)} />

      <main className="pt-20 pb-32 px-4 md:px-5 max-w-md mx-auto">
        {/* Progress Bar */}
        <section className="mb-8">
          <ProgressStepper steps={steps} currentStep={currentStep} />
        </section>

        {/* Header Content */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#00236f] tracking-tight mb-2">
            Traveler Info
          </h1>
          <p className="text-slate-500">Customize your journey from New York to London.</p>
        </div>

        {/* Form Sections */}
        <div className="space-y-6">
          {/* Passenger Details */}
          <section className="bg-white rounded-2xl p-6 shadow-[0_10px_40px_-10px_rgba(0,35,111,0.06)]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                <User className="w-5 h-5 text-[#00236f]" />
              </div>
              <h2 className="text-lg font-bold text-[#00236f] tracking-tight">Passenger 1 (Adult)</h2>
            </div>

            <div className="space-y-5">
              {/* Title Selection */}
              <div className="flex gap-2">
                {(['Mr', 'Ms', 'Mrs'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTitle(t)}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all active:scale-95 ${
                      title === t 
                        ? 'bg-[#1e3a8a] text-white' 
                        : 'bg-[#f2f4f6] text-slate-500'
                    }`}
                  >
                    {t}.
                  </button>
                ))}
              </div>

              {/* Input Fields */}
              <div className="space-y-4">
                <div className="group">
                  <label className="text-[10px] font-bold uppercase tracking-[0.05em] text-slate-400 ml-4 mb-1 block">
                    Full Name
                  </label>
                  <input 
                    type="text"
                    placeholder="As it appears on passport"
                    value={passengerData.fullName}
                    onChange={(e) => setPassengerData({...passengerData, fullName: e.target.value})}
                    className="w-full bg-[#f2f4f6] border-none rounded-lg px-5 py-4 text-slate-800 focus:ring-2 focus:ring-[#00236f]/40 placeholder:text-slate-400"
                  />
                </div>
                <div className="group">
                  <label className="text-[10px] font-bold uppercase tracking-[0.05em] text-slate-400 ml-4 mb-1 block">
                    Date of Birth
                  </label>
                  <input 
                    type="date"
                    value={passengerData.dateOfBirth}
                    onChange={(e) => setPassengerData({...passengerData, dateOfBirth: e.target.value})}
                    className="w-full bg-[#f2f4f6] border-none rounded-lg px-5 py-4 text-slate-800 focus:ring-2 focus:ring-[#00236f]/40"
                  />
                </div>
                <div className="group">
                  <label className="text-[10px] font-bold uppercase tracking-[0.05em] text-slate-400 ml-4 mb-1 block">
                    Passport Number
                  </label>
                  <input 
                    type="text"
                    placeholder="Ex: XXXXXX"
                    value={passengerData.passportNumber}
                    onChange={(e) => setPassengerData({...passengerData, passportNumber: e.target.value})}
                    className="w-full bg-[#f2f4f6] border-none rounded-lg px-5 py-4 text-slate-800 focus:ring-2 focus:ring-[#00236f]/40 placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Meal Selection */}
          <section>
            <h3 className="text-sm font-bold uppercase tracking-[0.1em] text-slate-400 mb-4 px-2">
              Gourmet Meal Selection
            </h3>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4">
              {meals.map((meal) => (
                <MealCard 
                  key={meal.id}
                  {...meal}
                  isSelected={selectedMeal === meal.id}
                  onSelect={setSelectedMeal}
                />
              ))}
            </div>
          </section>

          {/* Baggage */}
          <section className="bg-white rounded-2xl p-6 shadow-[0_10px_40px_-10px_rgba(0,35,111,0.06)]">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <Luggage className="w-5 h-5 text-[#00236f]" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#00236f]">Extra Baggage</h2>
                  <p className="text-[10px] text-slate-500">Max 23kg per unit - $45/each</p>
                </div>
              </div>
              
              {/* Stepper */}
              <div className="flex items-center bg-[#f2f4f6] rounded-full px-1 py-1">
                <button 
                  onClick={() => setExtraBaggage(Math.max(0, extraBaggage - 1))}
                  className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#00236f] shadow-sm active:scale-90 transition-transform"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 font-bold text-[#00236f]">{extraBaggage}</span>
                <button 
                  onClick={() => setExtraBaggage(extraBaggage + 1)}
                  className="w-8 h-8 rounded-full bg-[#00236f] flex items-center justify-center text-white shadow-sm active:scale-90 transition-transform"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Sticky Bottom CTA */}
      <div className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-2xl px-6 py-6 pb-10 flex items-center justify-between z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.04)]">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">Total Price</span>
          <div className="text-2xl font-extrabold text-[#00236f]">${totalPrice.toFixed(2)}</div>
        </div>
        <button 
          onClick={handleContinue}
          className="bg-gradient-to-br from-[#00236f] to-[#1e3a8a] text-white px-10 py-4 rounded-xl font-bold tracking-tight shadow-xl shadow-[#00236f]/20 active:scale-95 transition-all flex items-center gap-2"
        >
          Continue <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <BottomNav />
    </div>
  )
}

