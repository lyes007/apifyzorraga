import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Test the Apify API directly
    const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN
    const ACTOR_ID = process.env.APIFY_ACTOR_ID || "Zt16dqMI2yN7Igggl"
    
    if (!APIFY_API_TOKEN) {
      return NextResponse.json(
        { error: 'APIFY_API_TOKEN not found' },
        { status: 500 }
      )
    }

    const BASE_URL = `https://api.apify.com/v2/acts/${ACTOR_ID}`
    
    const testInput = {
      selectPageType: "get-manufacturers-by-type-id-lang-id-country-id",
      typeId: 1,
      langId: 6,
      countryId: 6,
    }

    const response = await fetch(`${BASE_URL}/run-sync-get-dataset-items?token=${APIFY_API_TOKEN}&timeout=120`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testInput),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: `Apify API test failed: ${response.status}`, details: errorText },
        { status: response.status }
      )
    }

    const data = await response.text()
    let results
    
    try {
      results = JSON.parse(data)
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid JSON response from Apify' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Apify API is working correctly',
      data: {
        hasData: !!results,
        dataLength: results?.length || 0,
        firstItem: results?.[0] || null,
        hasManufacturers: !!(results?.[0]?.manufacturers),
        manufacturersCount: results?.[0]?.manufacturers?.length || 0
      }
    })
  } catch (error) {
    console.error('Apify API test error:', error)
    return NextResponse.json(
      { error: 'Apify API test failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
