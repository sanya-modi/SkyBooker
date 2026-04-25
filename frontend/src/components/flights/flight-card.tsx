"use client"

import { Plane, Luggage, Check, X, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Flight } from "@/lib/types"

interface FlightCardProps {
  flight: Flight
  onSelect?: (flight: Flight, fareClass: string) => void
  compact?: boolean
}

export function FlightCard({ flight, onSelect, compact = false }: FlightCardProps) {
  const getStatusColor = (status: Flight['status']) => {
    switch (status) {
      case 'on-time':
        return 'bg-green-100 text-green-700'
      case 'delayed':
        return 'bg-red-100 text-red-700'
      case 'cancelled':
        return 'bg-red-200 text-red-800'
      case 'en-route':
        return 'bg-blue-100 text-blue-700'
      case 'completed':
        return 'bg-slate-100 text-slate-600'
      default:
        return 'bg-slate-100 text-slate-600'
    }
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-[0_40px_60px_-15px_rgba(0,35,111,0.05)] hover:bg-[#f2f4f6] transition-colors duration-300">
      <div className="p-6 md:p-8">
        {/* Airline Info */}
        <div className="flex flex-wrap items-center justify-between gap-4 md:gap-8 mb-6 md:mb-10">
          <div className="flex items-center gap-4 md:gap-6">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#e6e8ea] flex items-center justify-center p-3">
              <Plane className="w-full h-full text-[#00236f]" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900">{flight.airline}</h4>
              <p className="text-xs font-bold tracking-[0.05em] uppercase text-slate-400">
                {flight.flightNumber} • {flight.aircraft}
              </p>
            </div>
          </div>

          {/* Time Display */}
          <div className="flex flex-1 items-center justify-between max-w-lg gap-4">
            <div className="text-center">
              <div className="text-xl md:text-2xl font-black text-[#00236f]">{flight.departure.time}</div>
              <div className="text-sm font-bold text-slate-500">{flight.departure.code}</div>
            </div>
            
            <div className="flex-1 flex flex-col items-center gap-2">
              <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">{flight.duration}</div>
              <div className="w-full h-[2px] bg-slate-200 relative">
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 bg-white px-2">
                  <Plane className="w-4 h-4 text-[#00236f] rotate-90" />
                </div>
              </div>
              <div className={cn(
                "text-[10px] font-bold uppercase",
                flight.stops === 0 ? "text-green-600" : "text-orange-500"
              )}>
                {flight.stops === 0 ? 'Non-stop' : `${flight.stops} Stop${flight.stops > 1 ? 's' : ''}`}
                {flight.stopInfo && ` (${flight.stopInfo})`}
              </div>
            </div>

            <div className="text-center">
              <div className="text-xl md:text-2xl font-black text-[#00236f]">
                {flight.arrival.time}
                {flight.arrival.time.includes('+1') && (
                  <span className="text-xs align-top ml-1 font-medium text-red-500">+1</span>
                )}
              </div>
              <div className="text-sm font-bold text-slate-500">{flight.arrival.code}</div>
            </div>
          </div>
        </div>

        {/* Fare Grid */}
        {!compact && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t-2 border-[#eceef0] pt-6 md:pt-8">
            {/* Economy */}
            <div 
              onClick={() => onSelect?.(flight, 'economy')}
              className="bg-[#f2f4f6] rounded-2xl p-4 md:p-6 flex flex-col justify-between group hover:bg-white transition-all cursor-pointer"
            >
              <div>
                <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-1">Economy</div>
                <div className="text-xl md:text-2xl font-black text-[#00236f] mb-4">${flight.prices.economy}</div>
                <ul className="text-xs space-y-2 text-slate-500 mb-6">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4" /> 1x Cabin bag
                  </li>
                  <li className="flex items-center gap-2 opacity-40">
                    <X className="w-4 h-4" /> No checked bag
                  </li>
                </ul>
              </div>
              <button className="w-full py-3 rounded-xl border-2 border-[#00236f]/20 text-[#00236f] font-bold hover:bg-[#00236f] hover:text-white transition-all">
                Select
              </button>
            </div>

            {/* Business */}
            <div 
              onClick={() => onSelect?.(flight, 'business')}
              className="bg-[#00236f]/5 rounded-2xl p-4 md:p-6 flex flex-col justify-between border-2 border-[#00236f]/10 relative overflow-hidden group hover:bg-white transition-all cursor-pointer"
            >
              <div className="absolute -right-4 -top-4 w-20 h-20 bg-[#00236f]/10 rounded-full blur-2xl" />
              <div>
                <div className="text-[10px] font-bold tracking-widest text-[#00236f] uppercase mb-1">Business</div>
                <div className="text-xl md:text-2xl font-black text-[#00236f] mb-4">${flight.prices.business}</div>
                <ul className="text-xs space-y-2 text-slate-500 mb-6">
                  <li className="flex items-center gap-2 font-semibold text-[#00236f]">
                    <Luggage className="w-4 h-4" /> Lie-flat bed
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4" /> 2x Checked bags
                  </li>
                </ul>
              </div>
              <button className="w-full py-3 rounded-xl bg-[#00236f] text-white font-bold hover:scale-105 transition-all">
                Select
              </button>
            </div>

            {/* First Class */}
            {flight.prices.first && (
              <div 
                onClick={() => onSelect?.(flight, 'first')}
                className="bg-[#f2f4f6] rounded-2xl p-4 md:p-6 flex flex-col justify-between group hover:bg-white transition-all cursor-pointer"
              >
                <div>
                  <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-1">First Class</div>
                  <div className="text-xl md:text-2xl font-black text-[#00236f] mb-4">${flight.prices.first}</div>
                  <ul className="text-xs space-y-2 text-slate-500 mb-6">
                    <li className="flex items-center gap-2 font-semibold text-[#00236f]">
                      <ArrowRight className="w-4 h-4" /> Private Suite
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4" /> Chauffeur service
                    </li>
                  </ul>
                </div>
                <button className="w-full py-3 rounded-xl border-2 border-[#00236f]/20 text-[#00236f] font-bold hover:bg-[#00236f] hover:text-white transition-all">
                  Select
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
