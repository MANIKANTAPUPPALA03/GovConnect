'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { useLanguage } from '@/contexts/language-context'
import { useTranslate } from '@/components/translate'

const PAGE_TEXT = {
  pageTitle: 'Interactive Process Tracker',
  pageSubtitle: 'Visualize the journey of your application from start to finish. Know exactly what happens at each step.',
  inputLabel: 'What are you applying for?',
  inputPlaceholder: 'e.g., Passport Renewal, Driving License, New Water Connection...',
  inputHint: 'Be as specific as possible to get the most accurate process steps.',
}

export default function ProcessTrackerPage() {
  const { language } = useLanguage()
  const { t, translateBatch } = useTranslate()
  const [application, setApplication] = useState('')
  const [isTracking, setIsTracking] = useState(false)
  const [processSteps, setProcessSteps] = useState<{
    title: string
    steps: Array<{
      step: number
      title: string
      description: string
      status: 'completed' | 'in-progress' | 'pending'
      estimatedTime: string
      actionItems: string[]
    }>
  } | null>(null)

  useEffect(() => {
    translateBatch(Object.values(PAGE_TEXT))
  }, [language, translateBatch])

  const handleTrack = async () => {
    if (!application) return

    setIsTracking(true)

    try {
      const response = await fetch('/api/process/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          processType: application,
          details: application,
          language
        }),
      })

      if (!response.ok) throw new Error('Failed to track process')

      const data = await response.json()

      // Transform backend response to match UI format
      setProcessSteps({
        title: data.process_name || `${application} Process`,
        steps: data.steps?.map((step: { step_number: number; title: string; description: string; estimated_time?: string; documents_needed?: string[] }, index: number) => ({
          step: step.step_number || index + 1,
          title: step.title,
          description: step.description,
          status: index === 0 ? 'completed' : index === 1 ? 'in-progress' : 'pending',
          estimatedTime: step.estimated_time || 'Varies',
          actionItems: step.documents_needed || [],
        })) || [],
      })
    } catch (error) {
      console.error('Error tracking process:', error)
      // Fallback to a basic response
      setProcessSteps({
        title: `${application} Process`,
        steps: [
          {
            step: 1,
            title: 'Start Application',
            description: 'Begin your application process',
            status: 'in-progress',
            estimatedTime: 'Varies',
            actionItems: ['Gather required documents', 'Fill out application form'],
          },
        ],
      })
    } finally {
      setIsTracking(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-r from-[#1E3A8A] to-[#0D9488] py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl font-bold text-white md:text-5xl text-balance mb-4 leading-tight">
                {t(PAGE_TEXT.pageTitle)}
              </h1>
              <p className="text-lg text-white/90 leading-relaxed">
                {t(PAGE_TEXT.pageSubtitle)}
              </p>
            </div>
          </div>
        </section>

        {/* Input Section */}
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="h-6 w-6 text-primary"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Track Your Application Process
                  </CardTitle>
                  <CardDescription>
                    Tell us what you're applying for, and we'll show you the complete step-by-step process
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="application" className="text-base font-semibold">
                      {t(PAGE_TEXT.inputLabel)}
                    </Label>
                    <Textarea
                      id="application"
                      placeholder={t(PAGE_TEXT.inputPlaceholder)}
                      value={application}
                      onChange={(e) => setApplication(e.target.value)}
                      className="min-h-24 resize-none"
                    />
                    <p className="text-sm text-muted-foreground">
                      {t(PAGE_TEXT.inputHint)}
                    </p>
                  </div>

                  <Button
                    onClick={handleTrack}
                    disabled={!application || isTracking}
                    className="w-full h-12 text-base"
                    size="lg"
                  >
                    {isTracking ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5 mr-2"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Generating Process Flow...
                      </>
                    ) : (
                      <>
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
                            d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                          />
                        </svg>
                        Track Process
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Process Flow */}
        {processSteps && (
          <section className="py-12 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="mx-auto max-w-4xl">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-foreground mb-2">{processSteps.title}</h2>
                  <p className="text-muted-foreground">
                    Follow these steps to complete your application successfully
                  </p>
                </div>

                <div className="relative space-y-8">
                  {/* Vertical Timeline Line */}
                  <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-border md:left-12" />

                  {processSteps.steps.map((step, index) => (
                    <Card
                      key={index}
                      className={`relative border-2 ${step.status === 'completed'
                        ? 'border-[#16A34A]/20 bg-[#16A34A]/5'
                        : step.status === 'in-progress'
                          ? 'border-[#F59E0B]/20 bg-[#F59E0B]/5'
                          : 'border-border'
                        }`}
                    >
                      {/* Step Number Circle */}
                      <div
                        className={`absolute -left-4 top-6 flex h-16 w-16 items-center justify-center rounded-full border-4 border-background md:-left-6 ${step.status === 'completed'
                          ? 'bg-[#16A34A] text-white'
                          : step.status === 'in-progress'
                            ? 'bg-[#F59E0B] text-white'
                            : 'bg-muted text-muted-foreground'
                          }`}
                      >
                        {step.status === 'completed' ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={3}
                            stroke="currentColor"
                            className="h-8 w-8"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M4.5 12.75l6 6 9-13.5"
                            />
                          </svg>
                        ) : step.status === 'in-progress' ? (
                          <svg
                            className="animate-spin h-8 w-8"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                        ) : (
                          <span className="text-2xl font-bold">{step.step}</span>
                        )}
                      </div>

                      <CardHeader className="pl-16 md:pl-20">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <CardTitle className="text-xl mb-2">{step.title}</CardTitle>
                            <CardDescription className="text-base">{step.description}</CardDescription>
                          </div>
                          <div
                            className={`shrink-0 rounded-full px-3 py-1 text-sm font-medium ${step.status === 'completed'
                              ? 'bg-[#16A34A] text-white'
                              : step.status === 'in-progress'
                                ? 'bg-[#F59E0B] text-white'
                                : 'bg-muted text-muted-foreground'
                              }`}
                          >
                            {step.estimatedTime}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pl-16 md:pl-20">
                        <div className="space-y-3">
                          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                            Action Items:
                          </h4>
                          <ul className="space-y-2">
                            {step.actionItems.map((item, itemIndex) => (
                              <li key={itemIndex} className="flex items-start gap-3">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={2}
                                  stroke="currentColor"
                                  className="h-5 w-5 text-primary shrink-0 mt-0.5"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                <span className="text-sm leading-relaxed">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}
