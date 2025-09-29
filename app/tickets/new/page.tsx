import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { NewTicketForm } from "@/components/tickets/new-ticket-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function NewTicketPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl p-6">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create New Ticket</CardTitle>
          </CardHeader>
          <CardContent>
            <NewTicketForm userId={data.user.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
