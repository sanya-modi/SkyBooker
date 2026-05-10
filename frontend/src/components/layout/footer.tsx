'use client'

import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui/icon'

const footerLinks = {
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Careers', href: '/careers' },
    { label: 'Sustainability', href: '/sustainability' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Settings', href: '/cookies' },
  ],
  support: [
    { label: 'Help Center', href: '/help' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'FAQs', href: '/faq' },
  ],
}

export function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="bg-muted dark:bg-slate-950 w-full px-4 py-10 sm:px-6 lg:px-8 lg:py-12"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 mb-10 lg:mb-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-start-2">
            <div className="flex items-center gap-2 mb-4">
              <Icon name="cloud" filled className="text-primary" />
              <span className="text-lg font-black text-primary">SkyBooker</span>
            </div>
            <p className="text-muted-foreground max-w-xs leading-relaxed text-sm">
              Redefining the horizon of travel. SkyBooker provides a seamless, ethereal experience from booking to landing.
            </p>
          </div>

          {/* Company Links */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-widest text-primary mb-6">
              Company
            </h5>
            <ul className="space-y-4">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-widest text-primary mb-6">
              Legal
            </h5>
            <ul className="space-y-4">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-widest text-primary mb-6">
              Support
            </h5>
            <ul className="space-y-4">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-border text-muted-foreground text-sm flex justify-center items-center">
          <span>&copy; 2026 SkyBooker. The Ethereal Horizon.</span>
        </div>
      </div>
    </motion.footer>
  )
}
