"use client"

import { cn } from "@/lib/utils"

interface Step {
  label: string
  status: 'completed' | 'current' | 'upcoming'
}

interface ProgressStepperProps {
  steps: Step[]
  currentStep: number
}

export function ProgressStepper({ steps, currentStep }: ProgressStepperProps) {
  return (
    <div className="flex justify-between items-center px-2 relative">
      {/* Progress Line Background */}
      <div className="absolute top-1/2 left-0 w-full h-[2px] bg-[#e6e8ea] -z-10 -translate-y-1/2" />
      
      {/* Progress Line Active */}
      <div 
        className="absolute top-1/2 left-0 h-[2px] bg-[#00236f] -z-10 -translate-y-1/2 transition-all duration-500"
        style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
      />

      {steps.map((step, index) => {
        const isCompleted = index < currentStep
        const isCurrent = index === currentStep
        const isUpcoming = index > currentStep

        return (
          <div key={step.label} className="flex flex-col items-center gap-2">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
              isCompleted && "bg-[#00236f] text-white",
              isCurrent && "bg-[#1e3a8a] text-white ring-4 ring-[#f7f9fb]",
              isUpcoming && "bg-[#e0e3e5] text-slate-400"
            )}>
              {index + 1}
            </div>
            <span className={cn(
              "text-[10px] font-bold uppercase tracking-[0.05em]",
              isCompleted && "text-[#00236f]",
              isCurrent && "text-[#1e3a8a]",
              isUpcoming && "text-slate-400"
            )}>
              {step.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
