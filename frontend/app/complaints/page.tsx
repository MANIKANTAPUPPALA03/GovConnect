'use client'

import { jsPDF } from 'jspdf'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { useLanguage } from '@/contexts/language-context'

export default function ComplaintsPage() {
  const { language } = useLanguage()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [location, setLocation] = useState('')
  const [pincode, setPincode] = useState('')
  const [sector, setSector] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [generatedComplaint, setGeneratedComplaint] = useState<{
    subject: string
    body: string
    department: string
    portal: string
  } | null>(null)
  const [isSent, setIsSent] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      // Append location details to description for AI
      const fullDescription = `Location of Issue: ${location}, Pincode: ${pincode}\n\nDetails: ${description}`

      const response = await fetch('/api/complaints/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sector, description: fullDescription, language }),
      })

      if (!response.ok) throw new Error('Failed to generate complaint')

      const data = await response.json()
      setGeneratedComplaint({
        subject: data.subject,
        body: data.body,
        department: data.suggestedDepartment || `Department of ${sector}`,
        portal: data.officialPortal || 'https://pgportal.gov.in/',
      })
    } catch (error) {
      console.error('Error generating complaint:', error)
      // Fallback to basic template
      setGeneratedComplaint({
        subject: `Complaint Regarding ${sector} Service Issue`,
        body: `Respected Sir/Madam,\n\n${description}\n\nI request you to kindly look into this matter urgently.\n\nYours faithfully,\n[Your Name]`,
        department: `Department of ${sector}`,
        portal: 'https://pgportal.gov.in/',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  /* Helper to refine body with current inputs */
  const getRefinedBody = () => {
    if (!generatedComplaint) return ""
    let body = generatedComplaint.body

    // Name Replacement
    const signedName = name.trim() || "Responsible Citizen"
    body = body.replace(/\[Your Name\]/gi, signedName)
      .replace(/\[Name\]/gi, signedName)

    // Contact Info Replacement
    if (email.trim()) {
      body = body.replace(/\[Your Contact Information\]/gi, email)
        .replace(/\[Contact Information\]/gi, email)
    } else {
      // Remove placeholder lines (and preceding newline if exists)
      body = body.replace(/(\r\n|\n|\\n)\[Your Contact Information\]/gi, "")
        .replace(/\[Your Contact Information\]/gi, "")
        .replace(/(\r\n|\n|\\n)\[Contact Information\]/gi, "")
        .replace(/\[Contact Information\]/gi, "")
    }

    // Address Replacement
    const fullAddress = [location, pincode].filter(Boolean).join(", ")
    if (fullAddress) {
      body = body.replace(/\[Your Address\]/gi, fullAddress)
        .replace(/\[Address\]/gi, fullAddress)
    } else {
      body = body.replace(/(\r\n|\n|\\n)\[Your Address\]/gi, "")
        .replace(/\[Your Address\]/gi, "")
        .replace(/(\r\n|\n|\\n)\[Address\]/gi, "")
        .replace(/\[Address\]/gi, "")
    }
    return body
  }

  /* Web3Forms Access Keys per Sector */
  const SECTOR_ACCESS_KEYS: Record<string, string> = {
    "GHMC": "75d766c5-42fb-4e6b-90b3-024105fafb9a",
    "Road Transport": "aec64b43-2ec4-417b-b4c2-969dca7a3716",
    "Electricity": "8b741d0d-9f8f-4813-b326-c2722ff26efd"
  }

  const generatePDFBlob = async (): Promise<Blob> => {
    if (!generatedComplaint) throw new Error("No complaint generated")

    const doc = new jsPDF()

    // Header
    doc.setFontSize(18)
    doc.setTextColor(22, 163, 74) // Green
    doc.text("Official Complaint Letter", 105, 20, { align: "center" })

    // Meta
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Reference: CMP${Date.now().toString().slice(-8)}`, 20, 35)
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 40)
    doc.text(`Sector: ${sector}`, 20, 45)

    // Separator
    doc.setDrawColor(200)
    doc.line(20, 55, 190, 55)

    // Content
    doc.setFontSize(12)
    doc.setTextColor(0)

    const splitBody = doc.splitTextToSize(getRefinedBody(), 170)
    doc.text(splitBody, 20, 65)

    // Footer
    doc.setFontSize(10)
    doc.setTextColor(150)
    doc.text("Generated by GovAssist AI", 105, 280, { align: "center" })

    // Embed Image if exists (Basic support for JPG/PNG)
    if (file && file.type.startsWith('image/')) {
      try {
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = (e) => resolve(e.target?.result as string)
          reader.readAsDataURL(file)
        })
        doc.addPage()
        doc.text("Attached Evidence:", 20, 20)
        doc.addImage(base64, "JPEG", 20, 30, 170, 100)
      } catch (e) {
        console.error("Image embedding failed", e)
      }
    }

    return doc.output('blob')
  }

  const handleDownloadPDF = async () => {
    if (!generatedComplaint) return
    const blob = await generatePDFBlob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Complaint_${sector}_${Date.now()}.pdf`
    link.click()
  }

  const handleSendComplaint = async () => {
    console.log("handleSendComplaint called") // Debug

    if (!generatedComplaint) {
      alert("Please generate a complaint first!")
      return
    }

    setIsSending(true)

    try {
      const accessKey = SECTOR_ACCESS_KEYS[sector] || "75d766c5-42fb-4e6b-90b3-024105fafb9a" // Default to GHMC
      const senderEmail = email || "responsiblecitizen@gmail.com" // Default email

      // Create FormData exactly like HTML form submission
      const formData = new FormData()
      formData.append("access_key", accessKey)
      formData.append("name", name || "Responsible Citizen")
      formData.append("email", senderEmail)
      formData.append("message", getRefinedBody())

      // Submit like a native HTML form (no custom headers)
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        setIsSent(true)
        setFile(null)
      } else {
        alert("Failed to send complaint: " + result.message)
      }
    } catch (error) {
      console.error("Error sending complaint:", error)
      alert("Error sending complaint. Please try again.")
    } finally {
      setIsSending(false)
    }
  }

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported")
      return
    }
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { latitude, longitude } = pos.coords
        // Use the new backend endpoint (assuming relative path/proxy works, else use API_BASE if defined. 
        // In other files API_BASE is empty string for same-origin or localhost:8000. 
        // I'll try direct relative path first, if page is served by Next.js and rewrites are set?
        // Actually, Service Locator used `${API_BASE}/api...`. I should confirm if API_BASE is defined in this file.
        // It is NOT defined in this file. I need to define it or use relative.
        // `fetch('/api/complaints/generate')` on line 38 uses relative. So relative works.
        const res = await fetch(`/api/locator/reverse?lat=${latitude}&lng=${longitude}`)
        const data = await res.json()

        if (data.area) setLocation(data.area)
        if (data.pincode) setPincode(data.pincode)
      } catch (e) {
        console.error("Reverse geocode failed", e)
        alert("Could not fetch address details.")
      }
    }, (err) => {
      console.error(err)
      alert("Location permission denied or unavailable.")
    })
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
                Generate Complaints & Grievances
              </h1>
              <p className="text-lg text-white/90 leading-relaxed">
                Create properly formatted complaints with AI assistance. Get suggested departments and official portal links.
              </p>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Input Section */}
            <div>
              <Card className="border-2 border-primary">
                <CardHeader>
                  <CardTitle>Complaint Details</CardTitle>
                  <CardDescription>
                    Provide information about your complaint and we'll help you draft it professionally
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Your Name (Optional)</Label>
                      <Input
                        id="name"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address (Required)</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Location Details</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleUseLocation}
                      className="text-primary border-primary/20 hover:bg-primary/5 h-8 gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-map-pin"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                      Use My Location
                    </Button>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="location">Location / Area</Label>
                      <Input
                        id="location"
                        placeholder="e.g. MG Road, Secunderabad"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pincode">Pincode</Label>
                      <Input
                        id="pincode"
                        placeholder="e.g. 500003"
                        maxLength={6}
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sector">Select Sector</Label>
                    <Select value={sector} onValueChange={setSector}>
                      <SelectTrigger id="sector">
                        <SelectValue placeholder="Choose the relevant sector" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Road Transport">Road Transport</SelectItem>
                        <SelectItem value="GHMC">GHMC (Municipal Corp)</SelectItem>
                        <SelectItem value="Electricity">Electricity Department</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Describe Your Issue</Label>
                    <Textarea
                      id="description"
                      placeholder="Provide detailed information about your complaint, including dates, locations, and any previous attempts to resolve the issue..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={8}
                      className="resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                      Be specific and include relevant details for better complaint generation
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="file">Upload Supporting Documents (Optional)</Label>
                    <Input
                      id="file"
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground">
                      Accepted formats: JPG, PNG, PDF (Max 5MB)
                    </p>
                  </div>

                  {file && (
                    <div className="rounded-lg bg-[#16A34A]/10 p-3">
                      <p className="text-sm font-medium text-[#16A34A]">
                        ✓ File uploaded: {file.name}
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={handleGenerate}
                    disabled={!sector || !description.trim() || isGenerating}
                    className="w-full h-12"
                    size="lg"
                  >
                    {isGenerating ? (
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
                        Generating with AI...
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
                            d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 22l-.394-1.433a2.25 2.25 0 00-1.423-1.423L13.25 19l1.433-.394a2.25 2.25 0 001.423-1.423L16.5 16l.394 1.433a2.25 2.25 0 001.423 1.423L19.75 19l-1.433.394a2.25 2.25 0 00-1.423 1.423z"
                          />
                        </svg>
                        Generate Complaint with AI
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Tips Card */}
              <Card className="mt-6 border-2 border-[#2563EB]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#2563EB]">
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
                        d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
                      />
                    </svg>
                    Tips for Effective Complaints
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-[#16A34A] mt-0.5">✓</span>
                      <span>Be clear and concise about the issue</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#16A34A] mt-0.5">✓</span>
                      <span>Include dates, locations, and specific incidents</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#16A34A] mt-0.5">✓</span>
                      <span>Mention previous attempts to resolve the issue</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#16A34A] mt-0.5">✓</span>
                      <span>Attach supporting documents or evidence</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#16A34A] mt-0.5">✓</span>
                      <span>Use polite and professional language</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#16A34A] mt-0.5">✓</span>
                      <span>Keep a copy of your complaint for future reference</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Output Section */}
            <div>
              {generatedComplaint ? (
                <div className="space-y-6">
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
                            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Generated Complaint
                      </CardTitle>
                      <CardDescription>Review and customize before submitting</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-base font-semibold">Subject Line</Label>
                        <div className="mt-2 rounded-lg bg-muted p-3">
                          <p className="font-medium">{generatedComplaint.subject}</p>
                        </div>
                      </div>

                      <div>
                        <Label className="text-base font-semibold">Complaint Letter</Label>
                        <div className="mt-2 rounded-lg bg-muted p-4">
                          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                            {getRefinedBody()}
                          </pre>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <Label className="text-sm font-semibold">Suggested Department</Label>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {generatedComplaint.department}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-semibold">Official Portal</Label>
                          <a
                            href={generatedComplaint.portal}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 flex items-center gap-1 text-sm text-primary hover:underline"
                          >
                            Visit Portal
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={2}
                              stroke="currentColor"
                              className="h-4 w-4"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                              />
                            </svg>
                          </a>
                        </div>
                      </div>

                      {!isSent ? (
                        <div className="flex flex-col gap-3 pt-4">
                          <Button
                            onClick={handleSendComplaint}
                            className="w-full h-12"
                            disabled={isSending}
                          >
                            {isSending ? (
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
                                Sending Complaint...
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
                                    d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                                  />
                                </svg>
                                Send Complaint
                              </>
                            )}
                          </Button>
                          <div className="grid gap-3 md:grid-cols-2">
                            <Button onClick={handleDownloadPDF} variant="outline" className="h-12 bg-transparent">
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
                                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                                />
                              </svg>
                              Download PDF
                            </Button>
                            <Button
                              asChild
                              variant="outline"
                              className="h-12 bg-transparent"
                            >
                              <a href={generatedComplaint.portal} target="_blank" rel="noopener noreferrer">
                                Visit Portal
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
                          </div>
                        </div>
                      ) : (
                        <Card className="border-2 border-[#16A34A] bg-[#16A34A]/10 mt-4">
                          <CardContent className="pt-6">
                            <div className="flex items-start gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#16A34A]">
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
                                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-[#16A34A] mb-1">Complaint Sent Successfully!</h4>
                                <p className="text-sm text-muted-foreground mb-3">
                                  Your complaint has been submitted to <strong>{generatedComplaint.department}</strong>
                                </p>
                                <div className="rounded-lg bg-white p-3 space-y-2">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Reference Number:</span>
                                    <span className="font-mono font-semibold">CMP{Date.now().toString().slice(-8)}</span>
                                  </div>
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Status:</span>
                                    <span className="text-[#F59E0B] font-medium">Under Review</span>
                                  </div>
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Expected Response:</span>
                                    <span className="font-medium">7-15 days</span>
                                  </div>
                                </div>
                                <p className="text-xs text-muted-foreground mt-3">
                                  You will receive updates via email and SMS. Track your complaint on the official portal.
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </CardContent>
                  </Card>

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
                        Next Steps
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ol className="space-y-3">
                        <li className="flex items-start gap-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                            1
                          </span>
                          <span className="text-sm">Review and customize the complaint if needed</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                            2
                          </span>
                          <span className="text-sm">Download the PDF for your records</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                            3
                          </span>
                          <span className="text-sm">Submit on the official grievance portal</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                            4
                          </span>
                          <span className="text-sm">Note down your complaint reference number</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                            5
                          </span>
                          <span className="text-sm">Track your complaint status regularly</span>
                        </li>
                      </ol>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card className="border-2 border-dashed border-muted-foreground/30 h-full flex items-center justify-center min-h-[400px]">
                  <CardContent className="text-center py-12">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mx-auto mb-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="h-10 w-10 text-muted-foreground"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No Complaint Generated Yet</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Fill in the complaint details on the left and click "Generate Complaint" to create a professionally formatted complaint letter.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
