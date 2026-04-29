'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState } from 'react'
import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'
import { SupportModal } from '@/components/layout/SupportModal'

interface TopNavProps {
  variant?: 'default' | 'transparent'
  showAuth?: boolean
  showNavLinks?: boolean
  className?: string
}

const navLinks = [
  { href: '/', label: 'Explore', active: true },
  { href: '/deals', label: 'Deals' },
  { href: '/trips', label: 'My Trips' },
]

export function TopNav({ 
  variant = 'default', 
  showAuth = true, 
  showNavLinks = true,
  className 
}: TopNavProps) {
  const [supportModalOpen, setSupportModalOpen] = useState(false)

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={cn(
        'fixed top-0 w-full z-50 transition-all duration-300',
        variant === 'transparent' 
          ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl' 
          : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.04)]',
        className
      )}
    >
      <div className="flex justify-between items-center h-20 px-6 lg:px-8 max-w-screen-2xl mx-auto">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Icon name="cloud" filled className="text-primary text-2xl" />
          <span className="text-2xl font-black italic tracking-tighter text-primary">
            SkyBooker
          </span>
        </Link>

        {/* Navigation Links - Desktop */}
        {showNavLinks && (
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'font-medium transition-colors',
                  link.active
                    ? 'text-primary border-b-2 border-primary/40 pb-1'
                    : 'text-muted-foreground hover:text-primary'
                )}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={() => setSupportModalOpen(true)}
              className="font-medium transition-colors text-muted-foreground hover:text-primary"
            >
              Support
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 lg:gap-6">
          <div className="hidden sm:flex items-center gap-2 text-muted-foreground">
            <button className="p-2 rounded-full hover:bg-primary/5 transition-colors">
              <Icon name="language" />
            </button>
            <button className="p-2 rounded-full hover:bg-primary/5 transition-colors">
              <Icon name="payments" />
            </button>
          </div>
          
          {showAuth ? (
            <div className="flex items-center gap-2 lg:gap-4">
              <Link
                href="/auth/signin"
                className="px-4 py-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-5 py-2.5 text-sm font-bold bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all"
              >
                Sign Up
              </Link>
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container-high ring-2 ring-primary/10">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAHHxPwFMedh0NC0UgYsqAaeuLOg0IZHuIY3QeZA3QzCQAMnqLwbSLzTWzLrIaRxS349EV99goS5h3thYi8GQvkIvMQK6xiDmGoFWOXlfJ_TJOQxspB5QOCbxUISQxWmXtPGH-kT2YPJtkY1mEWY6KJcTJYg9zvWAOEeh4NC9jNvEvXzsmL64JjnyTtELIxUfhvTfdO28tMkHyM_nL6t4w8B3U6DB34uINzNYjv3iCIjj4QLJCsiGdQqpub2B71D6lsf9gAvGjIEH8"
                alt="User profile"
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </div>
      <SupportModal isOpen={supportModalOpen} onClose={() => setSupportModalOpen(false)} />
    </motion.nav>
  )
}
