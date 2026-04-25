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
      className="bg-muted dark:bg-slate-950 w-full py-12 px-8"
    >
      <div className="max-w-screen-2xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2">
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
        <div className="pt-8 border-t border-border text-muted-foreground text-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <span>&copy; 2024 SkyBooker. The Ethereal Horizon.</span>
          <div className="flex gap-6">
            <button className="hover:text-primary transition-colors">
              <Icon name="public" size="xl" />
            </button>
            <button className="hover:text-primary transition-colors">
              <Icon name="camera" size="xl" />
            </button>
            <button className="hover:text-primary transition-colors">
              <Icon name="social_leaderboard" size="xl" />
            </button>
          </div>
        </div>
      </div>
    </motion.footer>
  )
}
