"use client"

import { Bell, HelpCircle, Search, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

interface AdminHeaderProps {
  title?: string
  showSearch?: boolean
  showDateRange?: boolean
}

export function AdminHeader({ 
  title = "Horizon Admin",
  showSearch = false,
  showDateRange = false
}: AdminHeaderProps) {
  return (
    <header className="w-full h-16 sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl flex items-center justify-between px-6 shadow-sm shadow-blue-900/5">
      {showSearch ? (
        <div className="flex items-center gap-4 flex-1">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Search by PNR, Passenger, or Flight ID..."
              className="w-full pl-10 pr-4 py-2 bg-[#f2f4f6] rounded-lg border-none focus:ring-2 focus:ring-[#00236f]/40 text-sm placeholder:text-slate-400 transition-all"
            />
          </div>
          {showDateRange && (
            <div className="hidden lg:flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Date Range</span>
              <button className="flex items-center bg-[#f2f4f6] rounded-lg px-3 py-1.5 gap-2 text-sm text-slate-600 hover:bg-[#e6e8ea] transition-colors">
                <Calendar className="w-4 h-4" />
                <span>Oct 12 - Oct 19, 2023</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-50 transition-all duration-300">
            <svg className="w-6 h-6 text-[#00236f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7M12 19l-4-4m0 0l4-4m-4 4h12" />
            </svg>
          </div>
          <h1 className="text-xl font-black text-[#00236f] uppercase tracking-tighter">{title}</h1>
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
          </button>
          <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors">
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
        <div className="h-8 w-px bg-slate-200 mx-2" />
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-[#00236f] leading-none">Sarah Jenkins</p>
            <p className="text-[10px] text-slate-400 font-medium">Head Administrator</p>
          </div>
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#1e3a8a]/10 group-hover:border-[#1e3a8a]/40 transition-all">
            <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
              <span className="text-[#00236f] font-bold text-sm">SJ</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
