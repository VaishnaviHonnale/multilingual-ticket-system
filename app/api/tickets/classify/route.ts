import { NextResponse } from "next/server"
import { classifyTicket } from "@/lib/ai/ticket-classifier"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, description, language } = body

    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      )
    }

    const classification = await classifyTicket({
      title,
      description,
      language: language || "en"
    })

    return NextResponse.json(classification)
  } catch (error) {
    console.error("Classification error:", error)
    return NextResponse.json(
      { error: "Failed to classify ticket" },
      { status: 500 }
    )
  }
}