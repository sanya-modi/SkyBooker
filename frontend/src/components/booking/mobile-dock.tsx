import { CreditCard, Plane, Search, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '../../lib/utils'

export function MobileDock({ active }: { active: 'explore' | 'results' | 'booking' | 'payment' }) {
  const navigate = useNavigate()
  const items = [
    { id: 'explore', label: 'Explore', icon: Search, path: '/' },
    { id: 'results', label: 'Flights', icon: Plane, path: '/results' },
    { id: 'booking', label: 'Booking', icon: User, path: '/booking' },
    { id: 'payment', label: 'Payment', icon: CreditCard, path: '/payment' },
  ] as const

  return (
    <nav className="mobile-dock">
      {items.map((item) => (
        <button
          className={cn(active === item.id && 'active')}
          key={item.id}
          onClick={() => navigate(item.path)}
          type="button"
        >
          <item.icon size={20} />
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  )
}
