import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN
const ACTOR_ID = process.env.APIFY_ACTOR_ID || "Zt16dqMI2yN7Igggl"

if (!APIFY_API_TOKEN) {
  throw new Error('APIFY_API_TOKEN environment variable is required')
}

const BASE_URL = `https://api.apify.com/v2/acts/${ACTOR_ID}`

export async function POST(request: NextRequest) {
  try {
    const input = await request.json()
    
    console.log("[v0] Starting Apify actor with input:", input)

    const runResponse = await fetch(`${BASE_URL}/run-sync-get-dataset-items?token=${APIFY_API_TOKEN}&timeout=120`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    })

    console.log("[v0] Run response status:", runResponse.status)

    if (!runResponse.ok) {
      const errorText = await runResponse.text()
      console.error("[v0] API Error Response:", errorText)
      return NextResponse.json(
        { error: `Failed to run actor: ${runResponse.status}` },
        { status: runResponse.status }
      )
    }

    const responseText = await runResponse.text()
    console.log("[v0] Raw response text length:", responseText.length)

    if (!responseText || responseText.trim() === "") {
      console.log("[v0] Empty response received")
      return NextResponse.json({ data: [] })
    }

    let results
    try {
      results = JSON.parse(responseText)
      console.log("[v0] Parsed results:", results)
    } catch (parseError) {
      console.error("[v0] JSON Parse Error:", parseError)
      return NextResponse.json(
        { error: 'Invalid JSON response from Apify' },
        { status: 500 }
      )
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error("[v0] Apify API Error:", error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
