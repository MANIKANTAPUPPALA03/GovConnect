'use client'

import React from "react"
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
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

interface FieldGuidance {
  fieldName: string
  instruction: string
  example?: string
}

interface AnalysisResult {
  analysis_method: string
  guidance: {
    formType: string
    fieldsToFill: FieldGuidance[]
    requiredDocuments: string[]
    warnings: string[]
  }
}

export default function FormDetailPage() {
  const params = useParams()
  const formId = params?.id as string

  const [form, setForm] = useState<FormData | null>(null)
  const [purpose, setPurpose] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)

  // Fetch form details on mount
  useEffect(() => {
    async function fetchForm() {
      try {
        const res = await fetch(`http://localhost:8000/api/forms/${formId}`)
        if (res.ok) {
          const data = await res.json()
          setForm(data)
        }
      } catch (error) {
        console.error('Failed to fetch form:', error)
      } finally {
        setIsLoading(false)
      }
    }
    if (formId) {
      fetchForm()
    }
  }, [formId])

  const handleAnalyze = async () => {
    if (!purpose.trim()) return

    setIsAnalyzing(true)
    setAnalysis(null)

    try {
      const formData = new FormData()
      formData.append('purpose', purpose)

      const res = await fetch(`http://localhost:8000/api/forms/${formId}/analyze`, {
        method: 'POST',
        body: formData
      })

      const data = await res.json()
      setAnalysis(data)
    } catch (error) {
      console.error('Failed to analyze form:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const pdfUrl = `http://localhost:8000/api/forms/${formId}/download`

  if (isLoading) return (
    <div className="flex h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )

  if (!form) return <div className="p-12 text-center">Form not found</div>

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header />

      <main className="flex-1 overflow-hidden bg-muted/10">
        <div className="container mx-auto h-full p-4 md:p-6 lg:p-8">
          <div className="grid h-full gap-6 lg:grid-cols-2">

            {/* Left Column: Info, Input, AI (Scrollable) */}
            <div className="flex flex-col gap-6 overflow-y-auto pr-2 pb-20">
              <div className="mb-2">
                <Link href="/forms" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                  Back to Forms
                </Link>
              </div>

              {/* Form Info Card */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl">{form.name}</CardTitle>
                      <div className="flex gap-2 mt-2">
                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-medium">{form.category}</span>
                        <span className="bg-muted px-2 py-0.5 rounded text-xs text-muted-foreground flex items-center gap-1">
                          ⏱ {form.processingTime}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{form.description}</p>
                </CardContent>
              </Card>

              {/* Purpose Input */}
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg">Get AI Guidance</CardTitle>
                  <CardDescription>Tell us your purpose for filling this form</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="purpose">Purpose</Label>
                    <Textarea
                      id="purpose"
                      placeholder="e.g. Applying for my son's birth certificate..."
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      className="resize-none"
                    />
                  </div>
                  <Button onClick={handleAnalyze} disabled={!purpose || isAnalyzing} className="w-full">
                    {isAnalyzing ? 'Analyzing...' : 'Get Guidance'}
                  </Button>
                </CardContent>
              </Card>

              {/* AI Guidance Results */}
              {analysis && (
                <Card className="border-2 border-primary animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <CardHeader className="bg-primary/5 sticky top-0 z-10 backdrop-blur-sm">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-green-500 block"></span>
                      AI Guidance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    {/* Warnings */}
                    {analysis.guidance.warnings.length > 0 && (
                      <div className="p-4 rounded bg-amber-50 border border-amber-200 text-sm text-amber-900">
                        <p className="font-bold mb-2">⚠️ Important Checklist</p>
                        <ul className="list-disc ml-4 space-y-1">
                          {analysis.guidance.warnings.map((w, i) => <li key={i}>{w}</li>)}
                        </ul>
                      </div>
                    )}

                    {/* Fields */}
                    <div>
                      <h3 className="font-semibold mb-3">Fields to Fill</h3>
                      <div className="space-y-3">
                        {analysis.guidance.fieldsToFill.map((field, idx) => (
                          <div key={idx} className="p-3 rounded border bg-card/50 hover:bg-card transition-colors">
                            <p className="font-medium text-primary text-sm">{field.fieldName}</p>
                            <p className="text-xs text-muted-foreground mt-1">{field.instruction}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Required Docs */}
                    <div>
                      <h3 className="font-semibold mb-2">Required Documents</h3>
                      <div className="flex flex-wrap gap-2">
                        {analysis.guidance.requiredDocuments.map((doc, idx) => (
                          <span key={idx} className="text-xs bg-muted px-2 py-1 rounded border flex items-center gap-1">
                            📄 {doc}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column: PDF Preview (Fixed) */}
            <div className="flex flex-col h-full overflow-hidden rounded-xl border bg-slate-50 shadow-sm relative">
              <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-medium shadow-sm border flex items-center gap-2">
                Preview
                <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">
                  (Download)
                </a>
              </div>
              <iframe
                src={pdfUrl}
                className="w-full h-full border-0"
                title="PDF Preview"
              />
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
