import { NextResponse } from 'next/server'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

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
