import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "API is working",
    timestamp: new Date().toISOString(),
    environment: {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasGroqKey: !!process.env.GROQ_API_KEY,
    }
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    return NextResponse.json({
      status: "ok",
      message: "POST request received",
      data: body
    })
  } catch (error) {
    return NextResponse.json({
      status: "error",
      message: "Invalid request body"
    }, { status: 400 })
  }
}