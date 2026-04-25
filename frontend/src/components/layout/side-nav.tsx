'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  icon: string
  label: string
  active?: boolean
}

interface SideNavProps {
  title?: string
  subtitle?: string
  items: NavItem[]
  bottomItems?: NavItem[]
  showNewButton?: boolean
  newButtonLabel?: string
  onNewClick?: () => void
  className?: string
}

export function SideNav({ 
  title = 'SkyBooker',
  subtitle = 'Staff Portal',
  items,
  bottomItems,
  showNewButton = false,
  newButtonLabel = 'New Flight',
  onNewClick,
  className 
}: SideNavProps) {
  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={cn(
        'fixed h-screen left-0 top-0 w-64 z-50',
        'bg-primary dark:bg-primary flex flex-col py-6',
        className
      )}
    >
      {/* Header */}
      <div className="px-6 mb-10">
        <h1 className="text-2xl font-black text-primary-foreground tracking-tight">
          {title}
        </h1>
        <p className="text-primary-foreground/50 text-xs font-medium tracking-widest uppercase mt-1">
          {subtitle}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center rounded-xl mx-2 px-4 py-3 transition-colors',
              item.active
                ? 'bg-primary-container text-primary-foreground font-semibold'
                : 'text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/5'
            )}
          >
            <Icon name={item.icon} className="mr-3" />
            <span className="tracking-wide">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="mt-auto px-2 space-y-1">
        {showNewButton && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onNewClick}
            className="w-full flex items-center justify-center primary-gradient text-primary-foreground py-4 rounded-xl font-bold mb-6"
          >
            <Icon name="add" className="mr-2" />
            {newButtonLabel}
          </motion.button>
        )}
        
        {bottomItems?.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/5 rounded-xl px-4 py-3 transition-colors"
          >
            <Icon name={item.icon} className="mr-3" />
            <span className="tracking-wide">{item.label}</span>
          </Link>
        ))}
      </div>
    </motion.aside>
  )
}
