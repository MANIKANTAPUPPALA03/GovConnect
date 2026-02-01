'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Header } from '@/components/header'
import { useLanguage } from '@/contexts/language-context'
import { useTranslate } from '@/components/translate'

const PAGE_TEXT = {
  heroTitle: 'Government Services, Simplified by AI',
  heroSubtitle: 'Discover schemes you are eligible for, understand complex forms, and get your grievances resolved.',
  searchPlaceholder: 'Describe your situation (e.g., I am a farmer with 2 acres)',
}

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const router = useRouter()
  const { language } = useLanguage()
  const { t, translateBatch } = useTranslate()

  // Translate when language changes
  useEffect(() => {
    translateBatch(Object.values(PAGE_TEXT))
  }, [language])

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: searchQuery }),
      })

      if (response.ok) {
        const data = await response.json()

        const routes: Record<string, string> = {
          scheme: '/schemes',
          form: '/forms',
          complaint: '/complaints',
          process: '/process-tracker',
          service_locator: '/service-locator',
          life_event: '/schemes',
        }

        const targetRoute = routes[data.intent] || '/schemes'
        router.push(`${targetRoute}?q=${encodeURIComponent(searchQuery)}`)
      } else {
        router.push(`/schemes?q=${encodeURIComponent(searchQuery)}`)
      }
    } catch (error) {
      console.error('Search error:', error)
      router.push(`/schemes?q=${encodeURIComponent(searchQuery)}`)
    } finally {
      setIsSearching(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 relative overflow-hidden bg-gradient-to-r from-[#1E3A8A] via-[#1E5F8A] to-[#0D9488]">
        {/* Hero Section */}
        <section className="py-24 md:py-32">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl text-center">
              <h1 className="text-4xl font-bold text-white md:text-5xl lg:text-6xl text-balance mb-6 leading-tight">
                {t(PAGE_TEXT.heroTitle)}
              </h1>
              <p className="text-lg text-white/90 md:text-xl leading-relaxed mb-10 max-w-3xl mx-auto">
                {t(PAGE_TEXT.heroSubtitle)}
              </p>

              {/* Large Search Bar */}
              <div className="mx-auto max-w-2xl">
                <div className="flex items-center gap-2 bg-white rounded-full shadow-2xl p-2">
                  <div className="flex items-center flex-1 pl-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="h-5 w-5 text-muted-foreground mr-3"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                      />
                    </svg>
                    <Input
                      placeholder={t(PAGE_TEXT.searchPlaceholder)}
                      className="border-0 h-12 text-base focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={handleKeyPress}
                    />
                  </div>
                  <Button
                    size="lg"
                    className="h-12 w-12 rounded-full bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 flex-shrink-0"
                    onClick={handleSearch}
                    disabled={isSearching || !searchQuery.trim()}
                  >
                    {isSearching ? (
                      <svg
                        className="animate-spin h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2.5}
                        stroke="currentColor"
                        className="h-5 w-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                        />
                      </svg>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
