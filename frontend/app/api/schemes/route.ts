import { NextResponse } from 'next/server'
import { API_BASE_URL as API_BASE } from '@/lib/api-config'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    // Build backend URL with query params
    let backendUrl = `${API_BASE}/api/schemes`
    if (category && category !== 'All') {
      backendUrl += `?category=${encodeURIComponent(category)}`
    }

    const response = await fetch(backendUrl, {
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('[API] Failed to fetch schemes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch schemes' },
      { status: 500 }
    )
  }
}

// POST handler for multilingual support
export async function POST(request: Request) {
  try {
    const body = await request.json()

    const response = await fetch(`${API_BASE}/api/schemes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('[API] Failed to fetch schemes (POST):', error)
    return NextResponse.json(
      { error: 'Failed to fetch schemes' },
      { status: 500 }
    )
  }
}
