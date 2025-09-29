import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { notificationService } from "@/lib/notifications/notification-service"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { status, assigned_to, ...updateData } = body

    // Get current ticket data
    const { data: currentTicket } = await supabase.from("tickets").select("*").eq("id", params.id).single()

    if (!currentTicket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    const { data: ticket, error } = await supabase
      .from("tickets")
      .update({
        ...updateData,
        ...(status && { status }),
        ...(assigned_to && { assigned_to }),
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await notificationService.notifyTicketUpdated(params.id, ticket, user.id)

    // Send status change notification if status changed
    if (status && status !== currentTicket.status) {
      await notificationService.notifyTicketStatusChanged(params.id, ticket, status)
    }

    return NextResponse.json(ticket)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: ticket, error } = await supabase
      .from("tickets")
      .select(`
        *,
        created_by_profile:profiles!tickets_created_by_fkey(full_name, email),
        assigned_to_profile:profiles!tickets_assigned_to_fkey(full_name, email),
        ticket_comments(
          *,
          user:profiles(full_name, email)
        ),
        ticket_attachments(*)
      `)
      .eq("id", params.id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(ticket)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
