"use client"

import Link from "next/link"
import { Plane, Luggage, History, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Booking } from "@/lib/types"

interface BookingCardProps {
  booking: Booking
  variant?: 'upcoming' | 'past'
}

export function BookingCard({ booking, variant = 'upcoming' }: BookingCardProps) {
  const isPast = variant === 'past'
  
  const getStatusBadge = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed':
        return { bg: 'bg-[#00236f]', text: 'text-white', label: 'Confirmed' }
      case 'pending':
        return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' }
      case 'cancelled':
        return { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' }
      case 'completed':
        return { bg: 'bg-slate-400', text: 'text-white', label: 'Completed' }
      default:
        return { bg: 'bg-slate-100', text: 'text-slate-600', label: status }
    }
  }

  const statusBadge = getStatusBadge(booking.status)

  return (
    <div className={cn(
      "bg-white rounded-2xl overflow-hidden shadow-[0_40px_60px_-15px_rgba(0,35,111,0.05)] group",
      isPast && "opacity-75 grayscale hover:grayscale-0",
      "hover:bg-[#f2f4f6] transition-all"
    )}>
      <div className="flex flex-col md:flex-row">
        {/* Image Section */}
        <div className="w-full md:w-48 h-48 md:h-auto relative overflow-hidden">
          <div className="w-full h-full bg-gradient-to-br from-[#00236f] to-[#1e3a8a] transition-transform duration-500 group-hover:scale-110" />
          <div className={cn(
            "absolute top-4 left-4 text-[10px] font-bold px-2 py-1 rounded-sm uppercase",
            statusBadge.bg,
            statusBadge.text
          )}>
            {statusBadge.label}
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-grow p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-[#00236f]">
                  {booking.flight.departure.code} → {booking.flight.arrival.code}
                </h3>
                <p className="text-sm text-slate-500 font-medium">
                  {booking.createdAt} • Flight {booking.flight.flightNumber}
                </p>
              </div>
              {booking.flight.departure.terminal && (
                <div className="text-right">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Terminal</p>
                  <p className="text-lg font-bold text-[#00236f]">{booking.flight.departure.terminal}</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-6 py-4 border-t border-dashed border-slate-200">
              {booking.seatAssignments && (
                <div className="flex items-center gap-2">
                  <Plane className="w-4 h-4 text-[#00236f]" />
                  <span className="text-sm font-semibold">{booking.seatAssignments.join(', ')}</span>
                </div>
              )}
              {booking.extraBaggage && (
                <div className="flex items-center gap-2">
                  <Luggage className="w-4 h-4 text-[#00236f]" />
                  <span className="text-sm font-semibold">{booking.extraBaggage} Checked</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <Link 
              href={`/bookings/${booking.id}`}
              className="text-[#00236f] font-bold text-sm hover:underline flex items-center gap-1"
            >
              View Details <ArrowRight className="w-4 h-4" />
            </Link>
            {!isPast && booking.status === 'confirmed' && (
              <button className="text-red-500 font-bold text-sm bg-red-50 px-4 py-2 rounded-lg hover:bg-red-100 transition-all">
                Request Refund
              </button>
            )}
            {isPast && (
              <button className="p-2 bg-[#e6e8ea] rounded-full">
                <History className="w-5 h-5 text-[#00236f]" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
