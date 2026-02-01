'use client'


import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Badge } from '@/components/ui/badge'
import { useLanguage } from '@/contexts/language-context'
import { useTranslate } from '@/components/translate'

// Dynamically import map to avoid SSR issues
const ServiceMap = dynamic(() => import('@/components/service-map'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full bg-muted rounded-lg flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  ),
})

interface ServiceCenter {
  name: string
  type: string
  address: string
  pincode: string
  latitude?: number
  longitude?: number
  distance?: number
  phone?: string
  timings?: string
  services: string[]
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Indian states for dropdown
const STATES = [
  'Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Telangana',
  'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'West Bengal', 'Madhya Pradesh',
  'Bihar', 'Punjab', 'Haryana', 'Kerala', 'Andhra Pradesh'
]

const PAGE_TEXT = {
  pageTitle: 'Find Services Near You',
  pageSubtitle: 'Locate nearby government offices, hospitals, police stations, and more.',
}

export default function ServiceLocatorPage() {
  const { language } = useLanguage()
  const { t, translateBatch } = useTranslate()
  const [pincode, setPincode] = useState('')
  const [state, setState] = useState('')
  const [radius, setRadius] = useState('10')
  const [isSearching, setIsSearching] = useState(false)
  const [services, setServices] = useState<ServiceCenter[] | null>(null)

  useEffect(() => {
    translateBatch(Object.values(PAGE_TEXT))
  }, [language, translateBatch])
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [locationStatus, setLocationStatus] = useState<string | null>(null)
  const [serviceTypes, setServiceTypes] = useState<string[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]) // Empty = All

  useEffect(() => {
    fetch(`${API_BASE}/api/locator/types`)
      .then(res => res.json())
      .then(data => setServiceTypes(data.types || []))
      .catch(err => console.error('Failed to load types:', err))
  }, [])

  const toggleType = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  const handleSearch = async () => {
    if (!pincode || pincode.length !== 6) return

    setIsSearching(true)
    setLocationError(null)
    setLocationStatus(`Searching services near PIN ${pincode}...`)

    try {
      let url = `${API_BASE}/api/locator/nearby?pincode=${pincode}&radius=${radius}`
      if (selectedTypes.length > 0) {
        url += `&type=${selectedTypes.join(',')}`
      }
      const response = await fetch(url, { headers: { 'Content-Type': 'application/json' } })

      if (!response.ok) throw new Error('Failed to fetch services')

      const data = await response.json()
      setServices(data.services || [])

      if (data.services?.length > 0) {
        setLocationStatus(`Found ${data.services.length} services near PIN ${pincode}`)
      } else {
        setLocationStatus('No services found. Try a different PIN or increase radius.')
      }
    } catch (error) {
      console.error('Error fetching services:', error)
      setLocationError('Failed to fetch services. Please try again.')
      setLocationStatus(null)
    } finally {
      setIsSearching(false)
    }
  }

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser')
      return
    }

    setIsSearching(true)
    setLocationError(null)
    setLocationStatus('Getting your location...')

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords
        setUserLocation({ lat: latitude, lng: longitude })
        setLocationStatus(`Location found! (accuracy: ${Math.round(accuracy)}m)`)

        try {
          let url = `${API_BASE}/api/locator/nearby?lat=${latitude}&lng=${longitude}&radius=${radius}`
          if (selectedTypes.length > 0) {
            url += `&type=${selectedTypes.join(',')}`
          }

          const response = await fetch(url, { headers: { 'Content-Type': 'application/json' } })

          if (!response.ok) throw new Error('Failed to fetch services')

          const data = await response.json()
          setServices(data.services || [])

          if (data.services?.length > 0) {
            setLocationStatus(`Found ${data.services.length} services within ${radius} km of your location`)
          } else {
            setLocationStatus(`No services found within ${radius} km. Try increasing the radius.`)
          }
        } catch (error) {
          console.error('Error fetching services:', error)
          setLocationError('Failed to fetch services. Please try again.')
          setLocationStatus(null)
        } finally {
          setIsSearching(false)
        }
      },
      (error) => {
        setIsSearching(false)
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location permission denied. Please enter PIN code manually.')
            break
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location unavailable. Please enter PIN code manually.')
            break
          case error.TIMEOUT:
            setLocationError('Location request timed out. Please enter PIN code manually.')
            break
          default:
            setLocationError('Unable to get location. Please enter PIN code manually.')
        }
        setLocationStatus(null)
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    )
  }

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'Police':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        )
      case 'Fire':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
          </svg>
        )
      case 'Health':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        )
      case 'Administrative':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
          </svg>
        )
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
        )
    }
  }

  const getServiceColor = (type: string) => {
    switch (type) {
      case 'Police':
        return 'bg-blue-100 text-blue-700'
      case 'Fire':
        return 'bg-red-100 text-red-700'
      case 'Health':
        return 'bg-green-100 text-green-700'
      case 'Administrative':
        return 'bg-purple-100 text-purple-700'
      case 'Passport':
        return 'bg-cyan-100 text-cyan-700'
      case 'Transport':
        return 'bg-orange-100 text-orange-700'
      case 'Banking':
        return 'bg-pink-100 text-pink-700'
      case 'Identity':
        return 'bg-indigo-100 text-indigo-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-r from-[#1E3A8A] to-[#0D9488] text-white">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
                {t(PAGE_TEXT.pageTitle)}
              </h1>
              <p className="text-xl leading-relaxed text-white/90">
                {t(PAGE_TEXT.pageSubtitle)}
              </p>
            </div>
          </div>
        </section>

        {/* Search Section */}
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl">
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
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    Find Services Near You
                  </CardTitle>
                  <CardDescription>
                    Use your location or enter PIN code to locate government services
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Use My Location Button */}
                  <Button
                    onClick={handleUseMyLocation}
                    disabled={isSearching}
                    variant="outline"
                    className="w-full h-12 border-primary text-primary hover:bg-primary/10"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="h-5 w-5 mr-2"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    📍 Use My Current Location
                  </Button>

                  <div className="relative flex items-center">
                    <div className="flex-grow border-t border-muted"></div>
                    <span className="flex-shrink mx-4 text-muted-foreground text-sm">or enter PIN code</span>
                    <div className="flex-grow border-t border-muted"></div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="pincode" className="text-base">PIN Code</Label>
                      <Input
                        id="pincode"
                        type="text"
                        placeholder="e.g., 110001"
                        maxLength={6}
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                        className="h-12 text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="radius" className="text-base">Search Radius (km)</Label>
                      <Input
                        id="radius"
                        type="number"
                        min="1"
                        max="50"
                        value={radius}
                        onChange={(e) => setRadius(e.target.value)}
                        className="h-12 text-base"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base">Filter Services (Select Multiple)</Label>
                    <div className="flex flex-wrap gap-2 p-4 border rounded-lg bg-muted/20">
                      {serviceTypes.map((type) => (
                        <Badge
                          key={type}
                          variant={selectedTypes.includes(type) ? "default" : "outline"}
                          className="cursor-pointer px-3 py-1 text-sm hover:bg-primary/80 transition-colors"
                          onClick={() => toggleType(type)}
                        >
                          {type}
                          {selectedTypes.includes(type) && (
                            <span className="ml-1 text-xs">✓</span>
                          )}
                        </Badge>
                      ))}
                      {serviceTypes.length === 0 && (
                        <span className="text-sm text-muted-foreground">Loading specific types...</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {selectedTypes.length === 0 ? "Showing ALL services" : `Selected: ${selectedTypes.join(', ')}`}
                    </p>
                  </div>

                  <Button
                    onClick={handleSearch}
                    disabled={pincode.length !== 6 || isSearching}
                    className="w-full h-12 text-base"
                    size="lg"
                  >
                    {isSearching ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5 mr-2"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Searching Services...
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
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                        </svg>
                        Search by PIN Code
                      </>
                    )}
                  </Button>

                  {locationError && (
                    <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                      {locationError}
                    </div>
                  )}

                  {locationStatus && !locationError && (
                    <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                      </svg>
                      {locationStatus}
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground bg-muted/50 rounded p-2">
                    <strong>Note:</strong> Currently showing Delhi-based service centers for demo. In production, this would connect to real government databases.
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Map & Results Section */}
        {services && (
          <section className="py-12 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Found {services.length} Services
                </h2>
                <p className="text-muted-foreground">
                  {userLocation
                    ? `Services within ${radius} km of your location`
                    : `Services near PIN code ${pincode}`}
                </p>
              </div>

              {/* Interactive Map */}
              <div className="mb-8">
                <ServiceMap
                  services={services}
                  userLocation={userLocation || undefined}
                  center={services[0] && services[0].latitude && services[0].longitude
                    ? { lat: services[0].latitude, lng: services[0].longitude }
                    : userLocation || undefined
                  }
                />
              </div>

              {/* Service Cards */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {services.map((service, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-3">
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${getServiceColor(service.type)}`}>
                          {getServiceIcon(service.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg mb-1 leading-tight">{service.name}</CardTitle>
                          <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-secondary/10 text-secondary">
                            {service.type}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-start gap-2 text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                        <span className="text-muted-foreground leading-relaxed">{service.address}</span>
                      </div>

                      {service.distance && (
                        <div className="flex items-center gap-2 text-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5 text-muted-foreground shrink-0">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
                          </svg>
                          <span className="font-semibold text-secondary">{service.distance} km</span>
                          <span className="text-muted-foreground">away</span>
                        </div>
                      )}

                      {service.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5 text-muted-foreground shrink-0">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                          </svg>
                          <a href={`tel:${service.phone}`} className="text-primary hover:underline">
                            {service.phone}
                          </a>
                        </div>
                      )}

                      {service.timings && (
                        <div className="flex items-center gap-2 text-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5 text-muted-foreground shrink-0">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-muted-foreground">{service.timings}</span>
                        </div>
                      )}

                      <Button variant="outline" className="w-full mt-2 bg-transparent" asChild>
                        <a
                          href={`https://www.google.com/maps/search/${encodeURIComponent(service.address)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Get Directions
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4 ml-2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                          </svg>
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}
