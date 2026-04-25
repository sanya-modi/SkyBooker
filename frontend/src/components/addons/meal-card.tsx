import { cn } from "../../lib/utils"

interface MealCardProps {
  id: string
  name: string
  description: string
  price: number
  image: string
  isSelected: boolean
  onSelect: (id: string) => void
}

export function MealCard({ 
  id, 
  name, 
  description, 
  price, 
  image, 
  isSelected, 
  onSelect 
}: MealCardProps) {
  return (
    <div 
      onClick={() => onSelect(id)}
      className={cn(
        "min-w-[240px] bg-white rounded-2xl overflow-hidden shadow-[0_10px_40px_-10px_rgba(0,35,111,0.06)] flex flex-col cursor-pointer transition-all",
        isSelected && "ring-2 ring-[#00236f]"
      )}
    >
      <div className="h-32 relative">
        <div 
          className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200"
          style={{ 
            backgroundImage: `url(${image})`, 
            backgroundSize: 'cover', 
            backgroundPosition: 'center' 
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#00236f]/80 to-transparent" />
        <span className="absolute bottom-3 left-4 text-white font-bold tracking-tight">
          {name}
        </span>
      </div>
      <div className="p-4 flex flex-col justify-between flex-1">
        <p className="text-xs text-slate-500 mb-4">{description}</p>
        <button 
          className={cn(
            "w-full py-2 text-xs font-bold rounded-full transition-all active:scale-95",
            isSelected 
              ? "bg-[#1e3a8a] text-white" 
              : "bg-[#f2f4f6] text-[#00236f]"
          )}
        >
          {isSelected ? 'SELECTED' : price === 0 ? 'INCLUDED' : `ADD +₹${price}`}
        </button>
      </div>
    </div>
  )
}
