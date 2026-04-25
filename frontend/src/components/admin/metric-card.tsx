"use client"

import { TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface MetricCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    label: string
    trend: 'up' | 'down'
  }
  icon?: React.ReactNode
  variant?: 'default' | 'primary' | 'large'
  progress?: number
}

export function MetricCard({ 
  title, 
  value, 
  change, 
  icon,
  variant = 'default',
  progress
}: MetricCardProps) {
  const isPrimary = variant === 'primary'
  const isLarge = variant === 'large'

  return (
    <div className={cn(
      "p-5 md:p-6 rounded-2xl relative overflow-hidden transition-all",
      isPrimary 
        ? "bg-gradient-to-br from-[#00236f] to-[#1e3a8a] text-white shadow-xl" 
        : "bg-white shadow-sm border border-slate-100"
    )}>
      <div className="relative z-10">
        <p className={cn(
          "text-xs font-bold uppercase tracking-[0.05em] mb-1",
          isPrimary ? "text-white/60" : "text-slate-400"
        )}>
          {title}
        </p>
        <div className="flex items-end justify-between">
          <span className={cn(
            "font-bold tracking-tight",
            isLarge ? "text-4xl" : "text-2xl",
            isPrimary ? "text-white" : "text-[#00236f]"
          )}>
            {value}
          </span>
          {icon && (
            <div className={cn(
              isPrimary ? "text-white/40" : "text-[#b7c4fd]"
            )}>
              {icon}
            </div>
          )}
        </div>
        
        {change && (
          <div className={cn(
            "mt-4 flex items-center gap-2 text-xs font-bold w-fit px-3 py-1 rounded-full",
            change.trend === 'up' 
              ? isPrimary 
                ? "bg-white/10 text-[#6bff8f]" 
                : "bg-green-50 text-green-600"
              : isPrimary
                ? "bg-white/10 text-red-300"
                : "bg-red-50 text-red-600"
          )}>
            {change.trend === 'up' 
              ? <TrendingUp className="w-3 h-3" /> 
              : <TrendingDown className="w-3 h-3" />
            }
            {change.value > 0 ? '+' : ''}{change.value}% {change.label}
          </div>
        )}

        {progress !== undefined && (
          <div className="mt-3 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#00236f] rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Decorative element */}
      {isPrimary && (
        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
      )}
    </div>
  )
}
