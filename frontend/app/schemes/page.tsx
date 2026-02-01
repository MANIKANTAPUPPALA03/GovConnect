'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { fetchFromBackend, postToBackend } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { useLanguage } from '@/contexts/language-context'
import { useTranslate } from '@/components/translate'

interface Scheme {
  id: string
  name: string
  category: string
  description: string
  benefit: string
  eligibility?: string[]
  documents?: string[]
  relevance_reason?: string
}

const defaultCategories = ['All', 'Education', 'Agriculture', 'Health', 'Environment', 'Social Welfare', 'Finance']

// Page content that needs translation
const PAGE_TEXT = {
  pageTitle: 'Discover Government Schemes',
  pageSubtitle: "Find schemes you're eligible for and get step-by-step guidance on how to apply",
  searchTitle: 'AI-Powered Scheme Search',
  searchDescription: "Describe your situation and we'll find relevant schemes for you",
  searchPlaceholder: 'e.g., I am a farmer with 2 acres looking for subsidies',
  searchButton: 'Search',
  noSchemes: 'No schemes found in this category.',
  viewDetails: 'View Details',
  retry: 'Retry',
}

// Main Content Component
function SchemesContent() {
  const { language } = useLanguage()
  const { t, translateBatch } = useTranslate()
  const searchParams = useSearchParams()
  const urlQuery = searchParams.get('q') || ''

  const [schemes, setSchemes] = useState<Scheme[]>([])
  const [categories, setCategories] = useState<string[]>(defaultCategories)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState(urlQuery)

  // Translate page text when language changes
  useEffect(() => {
    translateBatch(Object.values(PAGE_TEXT))
  }, [language])

  // Fetch schemes when page loads or language changes - use URL query if present
  useEffect(() => {
    fetchSchemes(urlQuery || undefined)
  }, [language, urlQuery])

  async function fetchSchemes(query?: string) {
    setIsLoading(true)
    setError(null)
    try {
      // Use POST for multilingual support
      const data = await postToBackend<{ schemes: Scheme[] }>('/api/schemes', {
        query: query || '',
        language: language
      })

      setSchemes(data.schemes || [])

      // Fetch categories
      try {
        const categoriesData = await fetchFromBackend<{ categories: string[] }>('/api/schemes/categories')
        const backendCategories = categoriesData.categories || []
        const uniqueCategories = ['All', ...backendCategories.filter((c: string) => c !== 'All')]
        setCategories(uniqueCategories)
      } catch (catErr) {
        console.warn('Failed to fetch categories:', catErr)
      }
    } catch (err) {
      console.error('Error fetching schemes:', err)
      setError('Failed to load schemes. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      await fetchSchemes(searchQuery)
    } else {
      await fetchSchemes()
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-[#1E3A8A] to-[#0D9488] py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-3xl font-bold text-white md:text-4xl lg:text-5xl mb-4">
                {t(PAGE_TEXT.pageTitle)}
              </h1>
              <p className="text-lg text-white/90 leading-relaxed mb-8">
                {t(PAGE_TEXT.pageSubtitle)}
              </p>
            </div>
          </div>
        </section>

        {/* AI Search Box */}
        <section className="py-8 bg-background">
          <div className="container mx-auto px-4">
            <Card className="mx-auto max-w-3xl shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">{t(PAGE_TEXT.searchTitle)}</CardTitle>
                <CardDescription>
                  {t(PAGE_TEXT.searchDescription)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    placeholder={t(PAGE_TEXT.searchPlaceholder)}
                    className="flex-1 h-12"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button size="lg" className="h-12 px-8" onClick={handleSearch}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="h-5 w-5 mr-2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                      />
                    </svg>
                    {t(PAGE_TEXT.searchButton)}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Schemes by Category */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-destructive">{error}</p>
                <Button onClick={() => window.location.reload()} className="mt-4">
                  {t(PAGE_TEXT.retry)}
                </Button>
              </div>
            ) : (
              <Tabs defaultValue="All" className="w-full">
                <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7 mb-8">
                  {categories.map((category) => (
                    <TabsTrigger key={category} value={category}>
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {categories.map((category) => (
                  <TabsContent key={category} value={category} className="mt-6">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {schemes
                        .filter((scheme) => category === 'All' || scheme.category === category)
                        .map((scheme) => (
                          <Card key={scheme.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                              <div className="flex items-start justify-between mb-2">
                                <Badge variant="secondary" className="mb-2">
                                  {scheme.category}
                                </Badge>
                              </div>
                              <CardTitle className="text-xl">{scheme.name}</CardTitle>
                              <CardDescription className="leading-relaxed">
                                {scheme.description}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="mb-4 rounded-lg bg-[#16A34A]/10 p-3">
                                <p className="text-sm font-medium text-[#16A34A]">
                                  💰 {scheme.benefit}
                                </p>
                              </div>
                              <Button asChild className="w-full">
                                <Link href={`/schemes/view?id=${scheme.id}`}>{t(PAGE_TEXT.viewDetails)}</Link>
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                    {schemes.filter((scheme) => category === 'All' || scheme.category === category).length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">{t(PAGE_TEXT.noSchemes)}</p>
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default function SchemesPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <SchemesContent />
    </Suspense>
  )
}
