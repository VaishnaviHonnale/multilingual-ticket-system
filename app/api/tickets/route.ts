import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { classifyTicket } from "@/lib/ai/ticket-classifier"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Create service role client to bypass RLS issues
    const { createClient: createServiceClient } = await import("@supabase/supabase-js")
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get user profile to check role
    const { data: profile } = await serviceSupabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    let query = serviceSupabase
      .from("tickets")
      .select("*")

    // Filter based on user role
    if (profile?.role === 'admin') {
      // Admin can see all tickets
    } else if (profile?.role === 'agent') {
      // Agent can see assigned tickets and unassigned tickets
      query = query.or(`created_by.eq.${user.id},assigned_to.eq.${user.id},assigned_to.is.null`)
    } else {
      // Regular users can only see their own tickets
      query = query.eq('created_by', user.id)
    }

    const { data: tickets, error } = await query.order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(tickets)
  } catch (error) {
    console.error('Error fetching tickets:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // Use regular client for auth check
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Create service role client to bypass RLS issues
    const { createClient: createServiceClient } = await import("@supabase/supabase-js")
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const body = await request.json()
    const { title, description, priority, category, language } = body

    console.log('Creating ticket with data:', { title, description, priority, category, language })

    // Classify the ticket using AI
    let classificationResult
    try {
      classificationResult = await classifyTicket({ title, description, language })
      console.log('AI classification result:', classificationResult)
    } catch (classifyError) {
      console.error('Classification error:', classifyError)
      // Use default classification if AI fails
      classificationResult = {
        category: category || 'general',
        priority: priority || 'medium',
        sentiment: 'neutral',
        urgency_score: 5,
        suggested_tags: ['needs-review'],
        confidence: 0.5,
        reasoning: 'Default classification due to AI service unavailability',
        language_detected: language || 'en'
      }
    }

    // Insert the ticket using service role to bypass RLS
    const { data: ticket, error } = await serviceSupabase
      .from("tickets")
      .insert({
        title,
        description,
        priority: classificationResult.priority || priority || 'medium',
        category: classificationResult.category || category || 'general',
        language: language || 'en',
        created_by: user.id,
        assigned_to: null, // Will be assigned later by admin/agent
      })
      .select("*")
      .single()

    if (error) {
      console.error('Database error creating ticket:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Store AI classification results for analytics
    if (classificationResult) {
      try {
        await serviceSupabase.from('ai_classifications').insert({
          ticket_id: ticket.id,
          predicted_category: classificationResult.category,
          predicted_priority: classificationResult.priority,
          confidence: classificationResult.confidence,
          reasoning: classificationResult.reasoning,
          language_detected: classificationResult.language_detected
        })
      } catch (aiError) {
        console.error('Error storing AI classification:', aiError)
        // Don't fail the ticket creation if AI logging fails
      }
    }

    console.log('Ticket created successfully:', ticket)
    return NextResponse.json(ticket)
  } catch (error) {
    console.error('Error creating ticket:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
