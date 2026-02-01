'use client'

import React from "react"
import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

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

export default function CustomUploadPage() {
    const [uploadedFile, setUploadedFile] = useState<File | null>(null)
    const [fileUrl, setFileUrl] = useState<string | null>(null)
    const [purpose, setPurpose] = useState('')
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            setUploadedFile(file)
            setAnalysis(null)

            // Create URL for preview
            const url = URL.createObjectURL(file)
            setFileUrl(url)
        }
    }

    const handleAnalyze = async () => {
        if (!uploadedFile || !purpose) return

        setIsAnalyzing(true)
        setAnalysis(null)

        try {
            const formData = new FormData()
            formData.append('file', uploadedFile)
            formData.append('purpose', purpose)

            const res = await fetch('http://localhost:8000/api/forms/upload', {
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

    return (
        <div className="flex h-screen flex-col overflow-hidden">
            <Header />

            <main className="flex-1 overflow-hidden bg-muted/10">
                <div className="container mx-auto h-full p-4 md:p-6 lg:p-8">
                    <div className="grid h-full gap-6 lg:grid-cols-2">

                        {/* Left Column: Input & AI (Scrollable) */}
                        <div className="flex flex-col gap-6 overflow-y-auto pr-2 pb-20">
                            <div className="mb-2">
                                <Link href="/forms" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                                    </svg>
                                    Back to Forms
                                </Link>
                                <h1 className="text-3xl font-bold mt-2">Upload Custom Form</h1>
                                <p className="text-muted-foreground">Upload your form and tell us what you need.</p>
                            </div>

                            {/* Step 1: Upload & Purpose */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>1. Upload & Purpose</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <Label>Select Form (PDF/Image)</Label>
                                        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors flex flex-col items-center justify-center bg-background/50">
                                            <input
                                                type="file"
                                                id="file-upload"
                                                className="hidden"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                onChange={handleFileUpload}
                                            />
                                            <label htmlFor="file-upload" className="cursor-pointer w-full">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mx-auto text-muted-foreground mb-2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                                </svg>
                                                {uploadedFile ? (
                                                    <div className="text-sm">
                                                        <p className="font-medium text-primary line-clamp-1">{uploadedFile.name}</p>
                                                        <span className="text-xs text-muted-foreground">Click to change</span>
                                                    </div>
                                                ) : (
                                                    <div className="text-sm">
                                                        <p className="font-medium">Upload File</p>
                                                        <span className="text-xs text-muted-foreground">PDF, JPG, PNG</span>
                                                    </div>
                                                )}
                                            </label>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="purpose">Purpose of Application</Label>
                                        <Textarea
                                            id="purpose"
                                            placeholder="e.g., Applying for a scholarship, Updating my bank address..."
                                            value={purpose}
                                            onChange={(e) => setPurpose(e.target.value)}
                                            className="min-h-[100px] resize-none"
                                        />
                                    </div>

                                    <Button
                                        onClick={handleAnalyze}
                                        disabled={!uploadedFile || !purpose || isAnalyzing}
                                        className="w-full"
                                        size="lg"
                                    >
                                        {isAnalyzing ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Analyzing with AI...
                                            </>
                                        ) : 'Analyze & Get Guidance'}
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Step 2: AI Analysis (Appears Below) */}
                            {analysis && (
                                <Card className="border-2 border-primary animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <CardHeader className="bg-primary/5 sticky top-0 z-10 backdrop-blur-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">AI</div>
                                            <div>
                                                <CardTitle className="text-lg">Guidance & Instructions</CardTitle>
                                                <CardDescription className="line-clamp-1">Based on "{purpose}"</CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-6">
                                        {/* Warnings */}
                                        {analysis.guidance.warnings.length > 0 && (
                                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm">
                                                <p className="font-semibold text-amber-800 mb-2">⚠️ Important Notes</p>
                                                <ul className="space-y-1 text-amber-900 list-disc ml-4">
                                                    {analysis.guidance.warnings.map((w, i) => <li key={i}>{w}</li>)}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Fields */}
                                        <div>
                                            <h3 className="font-semibold mb-3 flex items-center justify-between">
                                                <span>Fields to Fill</span>
                                                <span className="text-xs bg-muted px-2 py-1 rounded-full">{analysis.guidance.fieldsToFill.length} fields</span>
                                            </h3>
                                            <div className="space-y-3">
                                                {analysis.guidance.fieldsToFill.map((field, idx) => (
                                                    <div key={idx} className="p-3 bg-muted/30 rounded border border-border/50 hover:border-primary/30 transition-colors">
                                                        <p className="font-medium text-sm text-primary">{field.fieldName}</p>
                                                        <p className="text-xs text-muted-foreground mt-1">{field.instruction}</p>
                                                        {field.example && (
                                                            <p className="text-xs mt-1 bg-muted/50 inline-block px-1.5 py-0.5 rounded text-muted-foreground">Ex: {field.example}</p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Chat */}
                                        <div className="bg-primary/5 rounded-lg p-4 text-center">
                                            <p className="text-sm font-medium mb-2">Need more help?</p>
                                            <Button variant="outline" size="sm" className="w-full">Chat with AI Assistant</Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Right Column: Preview (Fixed) */}
                        <div className="flex flex-col h-full overflow-hidden rounded-xl border bg-slate-50 shadow-sm relative">
                            <div className="absolute top-4 right-4 z-10 bg-white/80 backdrop-blur px-3 py-1 rounded-full text-xs font-medium shadow-sm border">
                                Document Preview
                            </div>

                            {fileUrl ? (
                                uploadedFile?.type === 'application/pdf' ? (
                                    <iframe
                                        src={fileUrl}
                                        className="w-full h-full border-0"
                                        title="PDF Preview"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center p-4 overflow-auto">
                                        <img
                                            src={fileUrl}
                                            alt="Form Preview"
                                            className="max-w-full max-h-full object-contain shadow-md"
                                        />
                                    </div>
                                )
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 mb-4 opacity-20">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                    </svg>
                                    <p>Document preview will appear here</p>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
