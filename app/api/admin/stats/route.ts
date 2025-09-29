import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Get ticket statistics
    const { data: tickets } = await supabase
      .from("tickets")
      .select("*")

    const { data: users } = await supabase
      .from("profiles")
      .select("*")

    if (!tickets || !users) {
      return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
    }

    // Calculate statistics
    const stats = {
      totalTickets: tickets.length,
      openTickets: tickets.filter(t => t.status === 'open').length,
      inProgressTickets: tickets.filter(t => t.status === 'in_progress').length,
      resolvedTickets: tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length,
      totalUsers: users.length,
      
      // Tickets by priority
      ticketsByPriority: {
        low: tickets.filter(t => t.priority === 'low').length,
        medium: tickets.filter(t => t.priority === 'medium').length,
        high: tickets.filter(t => t.priority === 'high').length,
        urgent: tickets.filter(t => t.priority === 'urgent').length,
        critical: tickets.filter(t => t.priority === 'critical').length,
      },
      
      // Tickets by language
      ticketsByLanguage: {
        en: tickets.filter(t => t.language === 'en').length,
        hi: tickets.filter(t => t.language === 'hi').length,
        ta: tickets.filter(t => t.language === 'ta').length,
        te: tickets.filter(t => t.language === 'te').length,
        kn: tickets.filter(t => t.language === 'kn').length,
      },
      
      // Tickets by category
      ticketsByCategory: tickets.reduce((acc: any, ticket) => {
        const category = ticket.category || 'other'
        acc[category] = (acc[category] || 0) + 1
        return acc
      }, {}),
      
      // Users by role
      usersByRole: {
        admin: users.filter(u => u.role === 'admin').length,
        agent: users.filter(u => u.role === 'agent').length,
        user: users.filter(u => u.role === 'user').length,
      },
      
      // Average resolution time (mock data for now)
      avgResolutionTime: 24, // hours
      
      // AI metrics (mock data)
      aiClassificationAccuracy: 87,
      speechToTextUsage: Math.floor(tickets.length * 0.4), // 40% of tickets use speech
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}