import { NextResponse } from 'next/server'
import { API_BASE_URL as API_BASE } from '@/lib/api-config'

export async function GET() {
  try {
    const response = await fetch(`${API_BASE}/api/schemes/categories`, {
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('[API] Failed to fetch categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}
