import { cn } from "../../lib/utils"
import { Luggage } from "lucide-react"

interface BaggageCardProps {
  id: string
  weight: string
  price: number
  isSelected: boolean
  onSelect: (id: string) => void
}

export function BaggageCard({ id, weight, price, isSelected, onSelect }: BaggageCardProps) {
  return (
    <div 
      onClick={() => onSelect(id)}
      className={cn(
        "min-w-[200px] bg-white rounded-2xl overflow-hidden shadow-[0_10px_40px_-10px_rgba(0,35,111,0.06)] flex flex-col cursor-pointer transition-all p-5",
        isSelected && "ring-2 ring-[#00236f]"
      )}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center",
          isSelected ? "bg-[#1e3a8a]" : "bg-slate-100"
        )}>
          <Luggage size={20} className={isSelected ? "text-white" : "text-slate-600"} />
        </div>
        <div>
          <p className="font-bold text-slate-800">{weight}</p>
          <p className="text-xs text-slate-500">Extra Baggage</p>
        </div>
      </div>
      <button 
        className={cn(
          "w-full py-2 text-xs font-bold rounded-full transition-all active:scale-95",
          isSelected 
            ? "bg-[#1e3a8a] text-white" 
            : "bg-[#f2f4f6] text-[#00236f]"
        )}
      >
        {isSelected ? 'SELECTED' : `ADD +₹${price}`}
      </button>
    </div>
  )
}
