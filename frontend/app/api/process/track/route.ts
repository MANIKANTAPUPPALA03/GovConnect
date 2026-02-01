import { NextResponse } from 'next/server'
import { API_BASE_URL as API_BASE } from '@/lib/api-config'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { processType, details } = body

        const response = await fetch(`${API_BASE}/api/process/track`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // Backend expects snake_case: process_type, not processType
            body: JSON.stringify({ process_type: processType, details }),
        })

        if (!response.ok) {
            throw new Error(`Backend error: ${response.status}`)
        }

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error('[API] Failed to track process:', error)
        return NextResponse.json(
            { error: 'Failed to track process' },
            { status: 500 }
        )
    }
}
