import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const envVars = {
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    hasApifyToken: !!process.env.APIFY_API_TOKEN,
    hasApifyActorId: !!process.env.APIFY_ACTOR_ID,
    nodeEnv: process.env.NODE_ENV,
  }
  
  return NextResponse.json(envVars)
}
