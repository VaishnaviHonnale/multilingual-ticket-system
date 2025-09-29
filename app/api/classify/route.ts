import { NextRequest, NextResponse } from "next/server"
import { classifyTicket, suggestResponse } from "@/lib/ai/ticket-classifier"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    // Optional authentication - allow testing without login
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    // Log authentication status but don't block
    console.log('Classification request from:', user ? user.email : 'anonymous')
    
    const body = await request.json()
    const { title, description, language = "en" } = body
    
    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      )
    }
    
    // Classify the ticket
    const classification = await classifyTicket({
      title,
      description,
      language
    })
    
    // Generate a suggested response
    const suggestedResponse = await suggestResponse(
      { title, description, language },
      classification
    )
    
    return NextResponse.json({
      classification,
      suggestedResponse
    })
  } catch (error) {
    console.error("Classification API error:", error)
    return NextResponse.json(
      { error: "Failed to classify ticket" },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Ticket classification endpoint. Send POST request with title, description, and language."
  })
}