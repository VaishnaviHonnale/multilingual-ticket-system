import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

function getFallbackResponse(message: string): string {
  const lowerMessage = message.toLowerCase()
  
  // Smart fallback responses based on message content
  if (lowerMessage.includes('ticket') || lowerMessage.includes('create')) {
    return "To create a new ticket, click the 'New Ticket' button in your dashboard. You can fill in the title and description, or use voice input for multilingual support. The AI will automatically classify and prioritize your ticket."
  }
  
  if (lowerMessage.includes('status') || lowerMessage.includes('track')) {
    return "You can track your tickets in the dashboard. Tickets have different statuses: 'open' (newly created), 'in_progress' (being worked on), 'resolved' (solution provided), and 'closed' (completed)."
  }
  
  if (lowerMessage.includes('language') || lowerMessage.includes('multilingual')) {
    return "Our system supports 5 languages: English, Hindi (हिंदी), Tamil (தமிழ்), Telugu (తెలుగు), and Kannada (ಕನ್ನಡ). Use the language switcher in the header to change your preference. You can also create tickets using voice input in any of these languages."
  }
  
  if (lowerMessage.includes('voice') || lowerMessage.includes('speech')) {
    return "You can use voice input to create tickets! Click the microphone icon in the ticket creation form, allow microphone permissions, and speak your issue. The system supports speech recognition in multiple languages."
  }
  
  if (lowerMessage.includes('priority') || lowerMessage.includes('urgent')) {
    return "Ticket priorities are: Low (feature requests), Medium (general questions), High (important issues), Urgent (major problems), and Critical (system down). The AI automatically assigns priority, but you can adjust it when creating tickets."
  }
  
  if (lowerMessage.includes('admin') || lowerMessage.includes('dashboard')) {
    return "Admins have access to a comprehensive dashboard with analytics, user management, and system settings. You can view ticket statistics, AI performance metrics, and manage user roles from the admin panel."
  }
  
  // Default helpful response
  return "I'm here to help you with the ticket management system! You can ask me about creating tickets, checking status, using voice input, language support, or navigating the dashboard. What would you like to know?"
}

export async function POST(request: NextRequest) {
  try {
    const { message, ticketId } = await request.json()

    const supabase = await createClient()
    // Optional authentication - allow testing without login
    const { data: { user } } = await supabase.auth.getUser()
    
    // Get user profile for context if authenticated
    let profile = null
    if (user) {
      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      profile = profileData
    }

    // Get ticket context if ticketId is provided
    let ticketContext = ""
    if (ticketId) {
      const { data: ticket } = await supabase
        .from("tickets")
        .select("title, description, status, priority, category")
        .eq("id", ticketId)
        .single()

      if (ticket) {
        ticketContext = `
Current ticket context:
- Title: ${ticket.title}
- Description: ${ticket.description}
- Status: ${ticket.status}
- Priority: ${ticket.priority}
- Category: ${ticket.category || "Not specified"}
`
      }
    }

    // Get recent tickets for better context
    let recentTicketsContext = ""
    if (user) {
      const { data: recentTickets } = await supabase
        .from("tickets")
        .select("title, status, priority, category, created_at")
        .eq("created_by", user.id)
        .order("created_at", { ascending: false })
        .limit(3)

      if (recentTickets && recentTickets.length > 0) {
        recentTicketsContext = `
Recent tickets:
${recentTickets.map(t => `- ${t.title} (${t.status}, ${t.priority})`).join('\n')}
`
      }
    }

    const systemPrompt = `You are a helpful AI assistant for a multilingual ticket support system. You help users with:
- Creating and managing support tickets
- Understanding ticket statuses and priorities  
- Providing guidance on system features
- Answering questions about the support process
- Offering troubleshooting suggestions
- Multilingual support (English, Hindi, Tamil, Telugu, Kannada)

User context:
- Name: ${profile?.full_name || "User"}
- Role: ${profile?.role || "user"}
- Department: ${profile?.department || "Not specified"}
- Language: ${profile?.language_preference || "en"}

${ticketContext}
${recentTicketsContext}

Key features you can help with:
1. Ticket Creation: Users can create tickets via text or voice input
2. Speech-to-Text: Voice input supports multiple languages
3. AI Classification: Tickets are automatically categorized and prioritized
4. Status Tracking: open, in_progress, resolved, closed
5. Priority Levels: low, medium, high, urgent, critical
6. Categories: technical, billing, general, feature, bug, support, other
7. Multilingual UI: Full support for Hindi, Tamil, Telugu, Kannada, English
8. Role-based Access: user, agent, admin roles with different permissions
9. Notifications: Email/SMS alerts for ticket updates
10. Admin Dashboard: Analytics, user management, system settings

Be helpful, concise, and professional. Respond in the user's preferred language when possible.`

    // Check if Groq API key is configured
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY.includes('your_groq_api_key')) {
      console.warn('Groq API key not configured, using fallback response')
      const fallbackResponse = getFallbackResponse(message)
      return NextResponse.json({ response: fallbackResponse })
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant', // Updated to current supported model
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_completion_tokens: 1000, // Updated parameter name
        top_p: 1,
        stream: false
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Groq API error:', response.status, errorText)
      throw new Error(`Groq API error: ${response.status}`)
    }

    const data = await response.json()
    const aiResponse = data.choices?.[0]?.message?.content || "I'm sorry, I couldn't process your request."

    return NextResponse.json({ response: aiResponse })
  } catch (error) {
    console.error("Chat API error:", error)
    
    // Fix the undefined message error by using the message parameter
    const fallbackResponse = getFallbackResponse(message || "")
    return NextResponse.json({ response: fallbackResponse })
  }
}
