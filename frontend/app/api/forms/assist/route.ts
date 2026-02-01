import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { formId, purpose, userProfile } = body

    // Mock form assistance response
    const mockGuidance = {
      fieldsToFill: [
        {
          section: 'Personal Details',
          fields: ['Full Name', 'Father\'s Name', 'Date of Birth', 'Gender'],
          priority: 'high',
        },
        {
          section: 'Address Details',
          fields: ['House No.', 'Street', 'City', 'District', 'State', 'PIN'],
          priority: 'high',
        },
        {
          section: 'Income Details',
          fields: ['Occupation', 'Annual Income', 'Source of Income'],
          priority: 'high',
        },
      ],
      fieldsToSkip: [
        {
          field: 'Employer Name',
          reason: 'Only required if you are a salaried employee',
        },
      ],
      exampleEntries: {
        'Full Name': 'Rajesh Kumar Singh (as per Aadhaar)',
        'Annual Income': '180000 (yearly, not monthly)',
        'Date of Birth': '15/08/1990 (DD/MM/YYYY format)',
      },
      commonMistakes: [
        'Entering monthly income instead of annual income',
        'Name mismatch between Aadhaar and form',
        'Wrong date format (use DD/MM/YYYY)',
      ],
    }

    return NextResponse.json(mockGuidance)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to provide form assistance' },
      { status: 500 }
    )
  }
}
