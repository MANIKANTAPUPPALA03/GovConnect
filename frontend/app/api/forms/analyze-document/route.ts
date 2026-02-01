import { NextResponse } from 'next/server'
import { API_BASE_URL as API_BASE } from '@/lib/api-config'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const purpose = formData.get('purpose') as string

    if (!file || !purpose) {
      return NextResponse.json(
        { error: 'File and purpose are required' },
        { status: 400 }
      )
    }

    // For now, send form analysis request to backend
    // Note: Backend expects JSON, not FormData currently
    const response = await fetch(`${API_BASE}/api/forms/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        formType: file.name,
        purpose: purpose,
      }),
    })

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('[API] Error analyzing document:', error)
    return NextResponse.json(
      { error: 'Failed to analyze document' },
      { status: 500 }
    )
  }
}
