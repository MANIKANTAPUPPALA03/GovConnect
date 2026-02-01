'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

interface ServiceCenter {
    name: string
    type: string
    address: string
    latitude?: number
    longitude?: number
    distance?: number
    phone?: string
    timings?: string
    services: string[]
}

interface ServiceMapProps {
    services: ServiceCenter[]
    userLocation?: { lat: number; lng: number }
    center?: { lat: number; lng: number }
}

// Dynamically import Leaflet components (client-side only)
const MapContainer = dynamic(
    () => import('react-leaflet').then((mod) => mod.MapContainer),
    { ssr: false }
)
const TileLayer = dynamic(
    () => import('react-leaflet').then((mod) => mod.TileLayer),
    { ssr: false }
)
const Marker = dynamic(
    () => import('react-leaflet').then((mod) => mod.Marker),
    { ssr: false }
)
const Popup = dynamic(
    () => import('react-leaflet').then((mod) => mod.Popup),
    { ssr: false }
)

// Icon colors by service type
const getMarkerColor = (type: string): string => {
    const colors: Record<string, string> = {
        'Police': '#3B82F6',
        'Fire': '#EF4444',
        'Health': '#10B981',
        'Administrative': '#8B5CF6',
        'Passport': '#06B6D4',
        'Transport': '#F59E0B',
        'Banking': '#EC4899',
        'Identity': '#6366F1',
        'Tax': '#14B8A6',
        'Food': '#22C55E',
        'Employment': '#A855F7',
        'Civic': '#0EA5E9',
    }
    return colors[type] || '#6B7280'
}

function ServiceMapComponent({ services, userLocation, center }: ServiceMapProps) {
    const [mounted, setMounted] = useState(false)
    const [L, setL] = useState<typeof import('leaflet') | null>(null)

    useEffect(() => {
        setMounted(true)
        // Import Leaflet on client side
        import('leaflet').then((leaflet) => {
            setL(leaflet.default)
        })
    }, [])

    if (!mounted || !L) {
        return (
            <div className="h-[400px] w-full bg-muted rounded-lg flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    // Default center (Delhi)
    const mapCenter = center || userLocation || { lat: 28.6139, lng: 77.2090 }

    // Create custom marker icon
    const createIcon = (type: string) => {
        const color = getMarkerColor(type)
        return L.divIcon({
            className: 'custom-marker',
            html: `
        <div style="
          background-color: ${color};
          width: 32px;
          height: 32px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        ">
          <span style="
            transform: rotate(45deg);
            color: white;
            font-size: 12px;
            font-weight: bold;
          ">${type.charAt(0)}</span>
        </div>
      `,
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32],
        })
    }

    // User location marker
    const userIcon = L.divIcon({
        className: 'user-marker',
        html: `
      <div style="
        background-color: #3B82F6;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5), 0 2px 5px rgba(0,0,0,0.3);
      "></div>
    `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
    })

    return (
        <div className="h-[400px] w-full rounded-lg overflow-hidden border-2 border-border shadow-lg relative z-0">
            <link
                rel="stylesheet"
                href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
                integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
                crossOrigin=""
            />
            <MapContainer
                center={[mapCenter.lat, mapCenter.lng]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* User location marker */}
                {userLocation && (
                    <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                        <Popup>
                            <strong>Your Location</strong>
                        </Popup>
                    </Marker>
                )}

                {/* Service center markers */}
                {services.map((service, index) => {
                    if (!service.latitude || !service.longitude) return null

                    return (
                        <Marker
                            key={index}
                            position={[service.latitude, service.longitude]}
                            icon={createIcon(service.type)}
                        >
                            <Popup>
                                <div className="min-w-[200px]">
                                    <h4 className="font-bold text-sm mb-1">{service.name}</h4>
                                    <p className="text-xs text-gray-600 mb-2">{service.type}</p>
                                    <p className="text-xs mb-1">{service.address}</p>
                                    {service.distance && (
                                        <p className="text-xs font-semibold text-blue-600">
                                            {service.distance} km away
                                        </p>
                                    )}
                                    {service.phone && (
                                        <a
                                            href={`tel:${service.phone}`}
                                            className="text-xs text-blue-500 hover:underline"
                                        >
                                            📞 {service.phone}
                                        </a>
                                    )}
                                </div>
                            </Popup>
                        </Marker>
                    )
                })}
            </MapContainer>
        </div>
    )
}

export default function ServiceMap(props: ServiceMapProps) {
    return <ServiceMapComponent {...props} />
}
