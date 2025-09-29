import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { TicketDetail } from "@/components/tickets/ticket-detail"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface TicketPageProps {
  params: Promise<{ id: string }>
}

export default async function TicketPage({ params }: TicketPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: user, error: userError } = await supabase.auth.getUser()
  if (userError || !user?.user) {
    redirect("/auth/login")
  }

  // Get ticket with related data
  const { data: ticket, error } = await supabase
    .from("tickets")
    .select(`
      *,
      profiles:created_by (
        id,
        full_name,
        email,
        role
      ),
      assigned_profile:assigned_to (
        id,
        full_name,
        email,
        role
      )
    `)
    .eq("id", id)
    .single()

  if (error || !ticket) {
    notFound()
  }

  // Get user profile for permissions
  const { data: userProfile } = await supabase.from("profiles").select("*").eq("id", user.user.id).single()

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl p-6">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        <TicketDetail ticket={ticket} currentUser={user.user} currentUserProfile={userProfile} />
      </div>
    </div>
  )
}
