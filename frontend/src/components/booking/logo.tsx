import { PlaneTakeoff } from 'lucide-react'

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <PlaneTakeoff size={compact ? 18 : 24} className="text-white" strokeWidth={2.5} />
  )
}
