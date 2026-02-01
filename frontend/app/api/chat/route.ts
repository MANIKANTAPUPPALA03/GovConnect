import { NextResponse } from 'next/server'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { message } = body

    // Use intent classification from backend
    const response = await fetch(`${API_BASE}/api/intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: message }),
    })

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`)
    }

    const intentData = await response.json()

    // Transform intent response to chat response format
    const intentMessages: Record<string, string> = {
      scheme: "I can help you find government schemes! Based on your message, you seem to be looking for government schemes. Go to the Schemes page to explore options that match your profile.",
      form: "I can help you understand forms! It seems you need assistance with a government form. Visit the Forms page to get guidance on filling out official documents.",
      complaint: "I can help you file a complaint! It looks like you want to raise a grievance. Go to the Complaints page to generate a formally worded complaint.",
      process: "I can track processes for you! You seem to be asking about a government process. Visit the Process Tracker to see step-by-step procedures.",
      service_locator: "I can help you find services! It looks like you're looking for government offices nearby. Visit the Service Locator to find offices in your area.",
      life_event: "I can guide you through life events! It seems you're going through a major life change. Visit the Life Events page for a complete checklist.",
    }

    const responseMessage = intentMessages[intentData.intent] ||
      `I understand you're asking about: "${message}". I'm here to help with government schemes, forms, complaints, and services. Try asking about a specific topic!`

    return NextResponse.json({
      message: responseMessage,
      intent: intentData.intent,
      entities: intentData.entities,
      confidence: intentData.confidence,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[API] Failed to process chat request:', error)
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    )
  }
}
