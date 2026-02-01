'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { useLanguage } from '@/contexts/language-context'

export default function SchemeDetailPage() {
  const [eligibilityData, setEligibilityData] = useState({
    age: '',
    income: '',
    category: '',
    state: '',
    occupation: '',
  })
  const [eligibilityResult, setEligibilityResult] = useState<null | {
    eligible: boolean
    confidence: number
    warnings: string[]
  }>(null)

  const handleCheckEligibility = () => {
    // Mock eligibility check
    setEligibilityResult({
      eligible: true,
      confidence: 85,
      warnings: ['Ensure your income certificate is not older than 6 months'],
    })
  }

  // Mock scheme data
  const scheme = {
    name: 'PM-KISAN',
    category: 'Agriculture',
    description: 'Pradhan Mantri Kisan Samman Nidhi is a central sector scheme providing income support to all landholding farmers\' families.',
    benefit: '₹6,000 per year in three equal installments of ₹2,000',
    eligibility: [
      'Must be a landholding farmer',
      'Family can own cultivable land',
      'No income restrictions',
      'Applicable across all states',
    ],
    documents: [
      'Land ownership documents',
      'Aadhaar card',
      'Bank account details',
      'Mobile number',
    ],
    limitations: [
      'Institutional landholders not eligible',
      'Government employees not eligible',
      'Income tax payers in previous year not eligible',
    ],
    rejectionReasons: [
      'Incorrect bank account details',
      'Aadhaar not linked with bank account',
      'Land records not updated',
      'Missing or invalid documents',
    ],
    steps: [
      'Visit the official PM-KISAN portal',
      'Click on "New Farmer Registration"',
      'Enter Aadhaar number and mobile number',
      'Fill in personal and land details',
      'Upload required documents',
      'Submit the application',
      'Note down the registration number for tracking',
    ],
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-[#1E3A8A] to-[#0D9488] py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 mb-4">
              <Button asChild variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
                <Link href="/schemes">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="h-5 w-5 mr-2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                  Back to Schemes
                </Link>
              </Button>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <Badge className="bg-white/20 text-white hover:bg-white/30">{scheme.category}</Badge>
            </div>
            <h1 className="text-3xl font-bold text-white md:text-4xl mb-4">{scheme.name}</h1>
            <p className="text-lg text-white/90 leading-relaxed max-w-3xl">{scheme.description}</p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Benefit Card */}
              <Card className="border-2 border-[#16A34A]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#16A34A]">
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
                        d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
                      />
                    </svg>
                    Benefit
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold">{scheme.benefit}</p>
                </CardContent>
              </Card>

              {/* Eligibility Criteria */}
              <Card>
                <CardHeader>
                  <CardTitle>Eligibility Criteria</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {scheme.eligibility.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="h-5 w-5 text-[#16A34A] mt-0.5 shrink-0"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Required Documents */}
              <Card>
                <CardHeader>
                  <CardTitle>Required Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {scheme.documents.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="h-5 w-5 text-[#2563EB] mt-0.5 shrink-0"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                          />
                        </svg>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Limitations */}
              <Card className="border-2 border-[#F59E0B]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#F59E0B]">
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
                        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                      />
                    </svg>
                    Limitations & Disqualifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {scheme.limitations.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="h-5 w-5 text-[#DC2626] mt-0.5 shrink-0"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Common Rejection Reasons */}
              <Card className="border-2 border-[#DC2626]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#DC2626]">
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
                        d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Common Rejection Reasons
                  </CardTitle>
                  <CardDescription>Avoid these mistakes to increase your approval chances</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {scheme.rejectionReasons.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#DC2626] text-xs font-bold text-white">
                          !
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Application Steps */}
              <Card>
                <CardHeader>
                  <CardTitle>Step-by-Step Application Guide</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-3">
                    {scheme.steps.map((step, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                          {index + 1}
                        </span>
                        <span className="pt-1.5">{step}</span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>

              {/* Official Apply Button */}
              <Card className="border-2 border-[#16A34A]">
                <CardContent className="pt-6">
                  <Button asChild size="lg" className="w-full h-12 bg-[#16A34A] hover:bg-[#15803D]">
                    <a href="https://pmkisan.gov.in" target="_blank" rel="noopener noreferrer">
                      Apply on Official Portal
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="h-5 w-5 ml-2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                        />
                      </svg>
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Eligibility Checker */}
            <div className="lg:col-span-1">
              <Card className="sticky top-20 border-2 border-primary">
                <CardHeader>
                  <CardTitle>Check Your Eligibility</CardTitle>
                  <CardDescription>Answer a few questions to see if you qualify</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="Enter your age"
                      value={eligibilityData.age}
                      onChange={(e) => setEligibilityData({ ...eligibilityData, age: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="income">Annual Income (₹)</Label>
                    <Input
                      id="income"
                      type="number"
                      placeholder="Enter annual income"
                      value={eligibilityData.income}
                      onChange={(e) => setEligibilityData({ ...eligibilityData, income: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={eligibilityData.category}
                      onValueChange={(value) => setEligibilityData({ ...eligibilityData, category: value })}
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="obc">OBC</SelectItem>
                        <SelectItem value="sc">SC</SelectItem>
                        <SelectItem value="st">ST</SelectItem>
                        <SelectItem value="ews">EWS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Select
                      value={eligibilityData.state}
                      onValueChange={(value) => setEligibilityData({ ...eligibilityData, state: value })}
                    >
                      <SelectTrigger id="state">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="maharashtra">Maharashtra</SelectItem>
                        <SelectItem value="karnataka">Karnataka</SelectItem>
                        <SelectItem value="delhi">Delhi</SelectItem>
                        <SelectItem value="punjab">Punjab</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="occupation">Occupation</Label>
                    <Select
                      value={eligibilityData.occupation}
                      onValueChange={(value) => setEligibilityData({ ...eligibilityData, occupation: value })}
                    >
                      <SelectTrigger id="occupation">
                        <SelectValue placeholder="Select occupation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="farmer">Farmer</SelectItem>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="self-employed">Self Employed</SelectItem>
                        <SelectItem value="salaried">Salaried</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={handleCheckEligibility} className="w-full h-12">
                    Check Eligibility
                  </Button>

                  {eligibilityResult && (
                    <div className={`rounded-lg border-2 p-4 ${eligibilityResult.eligible ? 'border-[#16A34A] bg-[#16A34A]/10' : 'border-[#DC2626] bg-[#DC2626]/10'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        {eligibilityResult.eligible ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="h-6 w-6 text-[#16A34A]"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="h-6 w-6 text-[#DC2626]"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        )}
                        <p className={`font-semibold ${eligibilityResult.eligible ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
                          {eligibilityResult.eligible ? 'You are Eligible!' : 'Not Eligible'}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Confidence: {eligibilityResult.confidence}%
                      </p>
                      {eligibilityResult.warnings.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-[#F59E0B]">Warnings:</p>
                          {eligibilityResult.warnings.map((warning, index) => (
                            <p key={index} className="text-xs text-muted-foreground">
                              • {warning}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
