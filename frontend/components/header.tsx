'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { LanguageSelector } from '@/components/language-selector'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/contexts/language-context'
import { useTranslate } from '@/components/translate'

export function Header() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { language } = useLanguage()
  const { t, translateBatch } = useTranslate()

  // Navigation labels
  const NAV_LABELS = {
    schemes: 'Schemes',
    forms: 'Forms',
    complaints: 'Complaints',
    processTracker: 'Process Tracker',
    serviceLocator: 'Service Locator',
    lifeEvents: 'Life Events',
    about: 'About',
  }

  // Translate nav labels when language changes
  useEffect(() => {
    translateBatch(Object.values(NAV_LABELS))
  }, [language])

  const navLinks = [
    { href: '/schemes', label: t(NAV_LABELS.schemes) },
    { href: '/forms', label: t(NAV_LABELS.forms) },
    { href: '/complaints', label: t(NAV_LABELS.complaints) },
    { href: '/process-tracker', label: t(NAV_LABELS.processTracker) },
    { href: '/service-locator', label: t(NAV_LABELS.serviceLocator) },
    { href: '/life-events', label: t(NAV_LABELS.lifeEvents) },
    { href: '/about', label: t(NAV_LABELS.about) },
  ]

  return (
    <header className="sticky top-0 z-[2000] w-full border-b border-border bg-card shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1E3A8A]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-6 w-6 text-white"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z"
              />
            </svg>
          </div>
          <span className="text-xl font-bold text-[#1E3A8A]">GovConnect</span>
        </Link>

        <div className="flex items-center gap-4">
          <LanguageSelector />

          {/* Hamburger Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="h-10 w-10"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            )}
          </Button>
        </div>
      </div>

      {/* Hamburger Menu Dropdown */}
      {isMenuOpen && (
        <div className="border-t border-border bg-card shadow-lg">
          <nav className="container mx-auto px-4 py-4">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    'rounded-lg px-4 py-3 text-base font-medium transition-colors hover:bg-muted',
                    pathname === link.href
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
