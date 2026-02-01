'use client'

import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { useLanguage } from '@/contexts/language-context'

export default function LifeEventsPage() {
  const [lifeEvent, setLifeEvent] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [recommendations, setRecommendations] = useState<{
    eventType: string
    schemes: Array<{
      name: string
      category: string
      benefit: string
      priority: 'high' | 'medium' | 'low'
      deadline?: string
      estimatedAmount?: string
    }>
    nextSteps: string[]
    documents: string[]
  } | null>(null)

  const handleAnalyze = async () => {
    if (!lifeEvent.trim()) return

    setIsAnalyzing(true)
    await new Promise(resolve => setTimeout(resolve, 2500))

    // Mock AI analysis based on keywords
    const eventLower = lifeEvent.toLowerCase()

    if (eventLower.includes('land') || eventLower.includes('farm')) {
      setRecommendations({
        eventType: 'Agricultural Land Purchase',
        schemes: [
          {
            name: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
            category: 'Agriculture',
            benefit: 'Direct income support of ₹6,000 per year',
            priority: 'high',
            deadline: 'Register within 3 months',
            estimatedAmount: '₹6,000/year'
          },
          {
            name: 'Soil Health Card Scheme',
            category: 'Agriculture',
            benefit: 'Free soil testing and recommendations',
            priority: 'high'
          },
          {
            name: 'Kisan Credit Card (KCC)',
            category: 'Agriculture',
            benefit: 'Easy credit access up to ₹3 lakhs at 4% interest',
            priority: 'high',
            estimatedAmount: 'Up to ₹3,00,000'
          },
          {
            name: 'Pradhan Mantri Fasal Bima Yojana',
            category: 'Agriculture',
            benefit: 'Crop insurance at subsidized premium',
            priority: 'medium',
            deadline: 'Before crop sowing'
          },
          {
            name: 'Micro Irrigation Scheme',
            category: 'Agriculture',
            benefit: 'Subsidy on drip/sprinkler irrigation (up to 55%)',
            priority: 'medium',
            estimatedAmount: '55% subsidy'
          }
        ],
        nextSteps: [
          'Get land documents verified at Tehsil office',
          'Register on PM-KISAN portal within 3 months',
          'Apply for Kisan Credit Card at nearest bank',
          'Get soil health card for your land',
          'Enroll in crop insurance before sowing season'
        ],
        documents: [
          'Land Ownership Documents (7/12 extract, Khata)',
          'Aadhar Card',
          'Bank Account Details',
          'Passport Size Photos',
          'Mobile Number linked to Aadhar'
        ]
      })
    } else if (eventLower.includes('b.tech') || eventLower.includes('btech') || eventLower.includes('engineering') || eventLower.includes('college')) {
      setRecommendations({
        eventType: 'B.Tech Enrollment',
        schemes: [
          {
            name: 'National Scholarship Portal (NSP)',
            category: 'Education',
            benefit: 'Merit-cum-means scholarship up to ₹50,000/year',
            priority: 'high',
            deadline: 'Apply within 1st semester',
            estimatedAmount: '₹20,000-₹50,000/year'
          },
          {
            name: 'Central Sector Scheme of Scholarship',
            category: 'Education',
            benefit: 'Scholarship for top 82,000 students',
            priority: 'high',
            deadline: 'October 31',
            estimatedAmount: '₹10,000-₹20,000/year'
          },
          {
            name: 'Post Matric Scholarship for SC/ST/OBC',
            category: 'Education',
            benefit: 'Full tuition fee + maintenance allowance',
            priority: 'high',
            estimatedAmount: 'Full tuition + ₹1,200/month'
          },
          {
            name: 'Education Loan Scheme',
            category: 'Education',
            benefit: 'Interest subsidy on education loans',
            priority: 'medium',
            estimatedAmount: 'Interest subsidy on up to ₹4 lakhs'
          },
          {
            name: 'Free Laptop/Tablet Schemes',
            category: 'Education',
            benefit: 'State-specific schemes for free devices',
            priority: 'medium'
          }
        ],
        nextSteps: [
          'Register on National Scholarship Portal immediately',
          'Check state-specific scholarship portals',
          'Apply for education loan with interest subsidy',
          'Check if your college offers fee waivers',
          'Look for corporate/private scholarships'
        ],
        documents: [
          'College Admission Letter',
          'Fee Receipt/Structure',
          'Class 12th Marksheet',
          'Income Certificate (for scholarships)',
          'Caste Certificate (if applicable)',
          'Bank Account Details',
          'Aadhar Card'
        ]
      })
    } else if (eventLower.includes('baby') || eventLower.includes('child') || eventLower.includes('born')) {
      setRecommendations({
        eventType: 'New Child Birth',
        schemes: [
          {
            name: 'Pradhan Mantri Matru Vandana Yojana',
            category: 'Social Welfare',
            benefit: 'Cash incentive of ₹5,000 for first child',
            priority: 'high',
            deadline: 'Within 6 months of birth',
            estimatedAmount: '₹5,000'
          },
          {
            name: 'Sukanya Samriddhi Yojana (for girl child)',
            category: 'Social Welfare',
            benefit: 'High-interest savings account with tax benefits',
            priority: 'high',
            estimatedAmount: '7.6% interest'
          },
          {
            name: 'Ayushman Bharat Health Card',
            category: 'Health',
            benefit: 'Free health coverage up to ₹5 lakhs',
            priority: 'high',
            estimatedAmount: '₹5,00,000 coverage'
          },
          {
            name: 'National Immunization Programme',
            category: 'Health',
            benefit: 'Free vaccination for all children',
            priority: 'high'
          }
        ],
        nextSteps: [
          'Register birth within 21 days at municipal office',
          'Apply for birth certificate',
          'Enroll in Ayushman Bharat for health coverage',
          'Open Sukanya Samriddhi account (for girl child)',
          'Register for PMMVY cash benefit'
        ],
        documents: [
          'Hospital Birth Certificate',
          'Mother and Father Aadhar Card',
          'Marriage Certificate',
          'Bank Account Details',
          'Address Proof'
        ]
      })
    } else {
      setRecommendations({
        eventType: 'General Life Event',
        schemes: [
          {
            name: 'Ayushman Bharat Health Card',
            category: 'Health',
            benefit: 'Free health coverage up to ₹5 lakhs',
            priority: 'high',
            estimatedAmount: '₹5,00,000 coverage'
          },
          {
            name: 'PM-JAY (Health Insurance)',
            category: 'Health',
            benefit: 'Comprehensive health insurance',
            priority: 'medium'
          },
          {
            name: 'Atal Pension Yojana',
            category: 'Social Welfare',
            benefit: 'Pension scheme with govt co-contribution',
            priority: 'medium'
          }
        ],
        nextSteps: [
          'Describe your life event more specifically',
          'Visit nearest CSC/Jan Seva Kendra',
          'Check eligibility on government portals'
        ],
        documents: [
          'Aadhar Card',
          'Income Certificate',
          'Bank Account Details'
        ]
      })
    }

    setIsAnalyzing(false)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-[#16A34A] bg-[#16A34A]/10 text-[#16A34A]'
      case 'medium': return 'border-[#F59E0B] bg-[#F59E0B]/10 text-[#F59E0B]'
      case 'low': return 'border-[#6B7280] bg-[#6B7280]/10 text-[#6B7280]'
      default: return ''
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-[#1E3A8A] to-[#0D9488] py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl font-bold text-white md:text-5xl text-balance mb-4 leading-tight">
                Life Events Assistant
              </h1>
              <p className="text-lg text-white/90 leading-relaxed">
                Tell us what's happening in your life, and we'll recommend relevant schemes and next steps
              </p>
            </div>
          </div>
        </section>

        {/* Life Event Input */}
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-primary" />
                    Describe Your Life Event
                  </CardTitle>
                  <CardDescription>
                    Share what's happening in your life and get personalized scheme recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="life-event" className="text-base font-semibold">
                      What's happening?
                    </Label>
                    <Textarea
                      id="life-event"
                      placeholder="Examples: 
• I just bought 2 acres of agricultural land
• I joined B.Tech in Computer Science
• I had a baby girl
• I'm starting a small business
• I'm getting married next month"
                      value={lifeEvent}
                      onChange={(e) => setLifeEvent(e.target.value)}
                      className="min-h-32 resize-none"
                    />
                  </div>

                  <Button
                    onClick={handleAnalyze}
                    disabled={!lifeEvent.trim() || isAnalyzing}
                    className="w-full h-12 text-base"
                    size="lg"
                  >
                    {isAnalyzing ? (
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
                        Analyzing Your Life Event...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5 mr-2" />
                        Get Personalized Recommendations
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* AI Recommendations */}
              {recommendations && (
                <div className="mt-8 space-y-6">
                  <Card className="border-2 border-[#16A34A] bg-[#16A34A]/5">
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#16A34A]">
                          <Sparkles className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-[#16A34A]">Recommendations Ready!</CardTitle>
                          <CardDescription className="text-base mt-1">
                            Life Event: <strong className="text-foreground">{recommendations.eventType}</strong>
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>

                  {/* Schemes */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Recommended Schemes ({recommendations.schemes.length})</CardTitle>
                      <CardDescription>
                        Apply for these schemes based on your situation
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {recommendations.schemes.map((scheme, index) => (
                          <Card key={index} className="border-2">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between gap-4 mb-3">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-foreground mb-1">{scheme.name}</h4>
                                  <p className="text-sm text-muted-foreground mb-2">{scheme.benefit}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium border-2 whitespace-nowrap ${getPriorityColor(scheme.priority)}`}>
                                  {scheme.priority.toUpperCase()} PRIORITY
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-3 text-sm">
                                <span className="flex items-center gap-1 text-muted-foreground">
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                                  </svg>
                                  {scheme.category}
                                </span>
                                {scheme.estimatedAmount && (
                                  <span className="flex items-center gap-1 font-semibold text-[#16A34A]">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                                    </svg>
                                    {scheme.estimatedAmount}
                                  </span>
                                )}
                                {scheme.deadline && (
                                  <span className="flex items-center gap-1 text-[#F59E0B] font-medium">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {scheme.deadline}
                                  </span>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Next Steps */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Next Steps</CardTitle>
                      <CardDescription>
                        Follow these steps to make the most of available schemes
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ol className="space-y-3">
                        {recommendations.nextSteps.map((step, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-white text-sm font-semibold">
                              {index + 1}
                            </div>
                            <span className="text-sm leading-relaxed pt-1">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </CardContent>
                  </Card>

                  {/* Required Documents */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Required Documents</CardTitle>
                      <CardDescription>
                        Keep these documents ready for scheme applications
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="grid gap-3 md:grid-cols-2">
                        {recommendations.documents.map((doc, index) => (
                          <li key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={2}
                              stroke="currentColor"
                              className="h-5 w-5 text-secondary shrink-0 mt-0.5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span className="text-sm leading-relaxed font-medium">{doc}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
