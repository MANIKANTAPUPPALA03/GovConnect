import { NextResponse } from 'next/server'
import { API_BASE_URL as API_BASE } from '@/lib/api-config'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const response = await fetch(`${API_BASE}/api/complaints/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('[API] Failed to generate complaint:', error)
    return NextResponse.json(
      { error: 'Failed to generate complaint' },
      { status: 500 }
    )
  }
}
