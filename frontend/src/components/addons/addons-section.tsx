import { MealCard } from "./meal-card"
import { BaggageCard } from "./baggage-card"
import { UtensilsCrossed, Luggage } from "lucide-react"

const MEALS = [
  { id: 'veg', name: 'Veg Delight', description: 'Fresh vegetarian meal with seasonal vegetables', price: 350, image: '/meal-veg.jpg' },
  { id: 'nonveg', name: 'Chicken Special', description: 'Grilled chicken with rice and salad', price: 450, image: '/meal-nonveg.jpg' },
  { id: 'premium', name: 'Premium Platter', description: 'Gourmet meal with dessert and beverage', price: 650, image: '/meal-premium.jpg' },
]

const BAGGAGE = [
  { id: '15kg', weight: '15 kg', price: 800 },
  { id: '20kg', weight: '20 kg', price: 1200 },
  { id: '25kg', weight: '25 kg', price: 1500 },
]

interface AddOnsSectionProps {
  selectedMealId: string
  selectedBaggageId: string
  onMealSelect: (id: string) => void
  onBaggageSelect: (id: string) => void
}

export function AddOnsSection({ selectedMealId, selectedBaggageId, onMealSelect, onBaggageSelect }: AddOnsSectionProps) {
  const handleMealSelect = (id: string) => {
    onMealSelect(selectedMealId === id ? '' : id)
  }

  const handleBaggageSelect = (id: string) => {
    onBaggageSelect(selectedBaggageId === id ? '' : id)
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-[#00236f] to-[#1e3a8a] px-6 py-5">
        <h2 className="text-white font-black text-xl tracking-tight mb-1">Enhance Your Journey 💰</h2>
        <p className="text-blue-200 text-sm">Add meals and extra baggage to your booking</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Meals */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <UtensilsCrossed size={18} className="text-[#00236f]" />
            <h3 className="font-bold text-slate-800">Select Your Meal</h3>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {MEALS.map(meal => (
              <MealCard
                key={meal.id}
                id={meal.id}
                name={meal.name}
                description={meal.description}
                price={meal.price}
                image={meal.image}
                isSelected={selectedMealId === meal.id}
                onSelect={handleMealSelect}
              />
            ))}
          </div>
        </div>

        {/* Baggage */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Luggage size={18} className="text-[#00236f]" />
            <h3 className="font-bold text-slate-800">Extra Baggage</h3>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {BAGGAGE.map(bag => (
              <BaggageCard
                key={bag.id}
                id={bag.id}
                weight={bag.weight}
                price={bag.price}
                isSelected={selectedBaggageId === bag.id}
                onSelect={handleBaggageSelect}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export { MEALS, BAGGAGE }
