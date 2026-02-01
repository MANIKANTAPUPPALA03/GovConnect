'use client'

import React from "react"
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

interface FormData {
  id: string
  name: string
  description: string
  category: string
  processingTime: string
  file?: string
}

export default function FormsPage() {
  const [forms, setForms] = useState<FormData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string>('All')

  // Fetch forms on mount
  useEffect(() => {
    async function fetchForms() {
      try {
        const res = await fetch('http://localhost:8000/api/forms')
        const data = await res.json()
        setForms(data.forms || [])
      } catch (error) {
        console.error('Failed to fetch forms:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchForms()
  }, [])

  // Get unique categories
  const categories = ['All', ...Array.from(new Set(forms.map(f => f.category)))]
  const filteredForms = activeCategory === 'All'
    ? forms
    : forms.filter(f => f.category === activeCategory)

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Certificates':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-8 w-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        )
      case 'Welfare':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-8 w-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        )
      case 'RTA':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-8 w-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-2.25a1.125 1.125 0 00-1.125-1.125h-.75a2.625 2.625 0 00-2.625 2.625v.375m-12 0v-.375a2.625 2.625 0 012.625-2.625h.75a1.125 1.125 0 011.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125H3.375" />
          </svg>
        )
      case 'Utilities':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-8 w-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
          </svg>
        )
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-8 w-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        )
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-muted/20">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-[#1E3A8A] to-[#0D9488] py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-3xl font-bold text-white md:text-4xl lg:text-5xl mb-4">
                Government Forms & Applications
              </h1>
              <p className="text-lg text-white/90 leading-relaxed">
                Access official government forms with AI-powered filling guidance. Select a form below or upload your own document.
              </p>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          {/* Upload CTA */}
          <div className="mb-12">
            <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-2 border-dashed border-primary/20 hover:border-primary/50 transition-all cursor-pointer group">
              <Link href="/forms/upload">
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="h-16 w-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-primary">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">Upload Your Own Form</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Have a specific form you need help with? Upload it here and our AI will guide you through filling it out field by field.
                    </p>
                  </div>
                </CardContent>
              </Link>
            </Card>
          </div>

          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Official Forms Gallery</h2>
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <Button
                    key={cat}
                    variant={activeCategory === cat ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveCategory(cat)}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>

            {/* Forms Grid */}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-muted-foreground">Loading forms...</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredForms.map((form) => (
                  <Link key={form.id} href={`/forms/${form.id}`}>
                    <Card className="h-full cursor-pointer transition-all hover:shadow-lg hover:border-primary hover:-translate-y-1">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="text-primary">{getCategoryIcon(form.category)}</div>
                          <span className="text-xs bg-muted px-2 py-1 rounded-full">{form.category}</span>
                        </div>
                        <CardTitle className="text-lg mt-3 line-clamp-2">{form.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{form.description}</p>
                        <div className="flex items-center justify-between pt-4 border-t mt-auto">
                          <span className="text-xs text-muted-foreground">⏱ {form.processingTime}</span>
                          <span className="text-sm font-medium text-primary flex items-center">
                            Open Form
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 ml-1">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
