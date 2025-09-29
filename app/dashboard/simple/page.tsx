"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SimpleCreateTicketForm } from "@/components/tickets/simple-create-ticket-form"
import { 
  Plus, 
  TicketIcon, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  User,
  LogOut,
  Globe
} from "lucide-react"
import { useTranslation } from "react-i18next"
import { createClient } from "@/lib/supabase-client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"

export default function SimpleDashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const { t } = useTranslation()
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
          router.push("/auth/login")
          return
        }

        setUser(user)

        // Get user profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        if (profileError) {
          console.error("Profile error:", profileError)
          // Create a basic profile if it doesn't exist
          const { data: newProfile } = await supabase
            .from("profiles")
            .insert({
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || user.email,
              role: "user",
              language_preference: "en"
            })
            .select()
            .single()
          
          setProfile(newProfile || { 
            id: user.id, 
            email: user.email, 
            role: "user", 
            full_name: user.email 
          })
        } else {
          setProfile(profileData)
          
          // Redirect to role-specific dashboard
          if (profileData.role === 'admin') {
            router.push('/admin')
            return
          } else if (profileData.role === 'agent') {
            router.push('/agent')
            return
          } else {
            router.push('/dashboard/user')
            return
          }
        }

        // Get user tickets (simplified query)
        const { data: ticketsData, error: ticketsError } = await supabase
          .from("tickets")
          .select("*")
          .eq("created_by", user.id)
          .order("created_at", { ascending: false })

        if (ticketsError) {
          console.error("Tickets error:", ticketsError)
          setTickets([])
        } else {
          setTickets(ticketsData || [])
        }

      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Failed to load dashboard")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase, router])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/")
      toast.success("Signed out successfully")
    } catch (error) {
      console.error("Error signing out:", error)
      toast.error("Error signing out")
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "destructive"
      case "urgent": return "destructive"
      case "high": return "secondary"
      case "medium": return "outline"
      case "low": return "outline"
      default: return "outline"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "secondary"
      case "in_progress": return "default"
      case "resolved": return "outline"
      case "closed": return "outline"
      default: return "outline"
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === "open").length,
    inProgress: tickets.filter(t => t.status === "in_progress").length,
    resolved: tickets.filter(t => t.status === "resolved" || t.status === "closed").length
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold">Dashboard</h1>
            <div className="text-sm text-muted-foreground">
              Welcome, {profile?.full_name || user?.email}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {profile?.role === "admin" && (
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin">
                  <User className="h-4 w-4 mr-2" />
                  Admin
                </Link>
              </Button>
            )}
            
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Tickets</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <TicketIcon className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Open Tickets</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.open}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Resolved</p>
                    <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Create Ticket Button */}
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">My Tickets</h2>
            <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Ticket
            </Button>
          </div>

          {/* Tickets List */}
          {tickets.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <TicketIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No tickets yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first support ticket to get started
                </p>
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Ticket
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {tickets.map((ticket) => (
                <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{ticket.title}</h3>
                          <Badge variant={getStatusColor(ticket.status)}>
                            {ticket.status}
                          </Badge>
                          <Badge variant={getPriorityColor(ticket.priority)}>
                            {ticket.priority}
                          </Badge>
                          {ticket.language && ticket.language !== "en" && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Globe className="h-3 w-3" />
                              {ticket.language.toUpperCase()}
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                          {ticket.description}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>
                            Created: {new Date(ticket.created_at).toLocaleDateString()}
                          </span>
                          {ticket.category && (
                            <span>
                              Category: {ticket.category}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/tickets/${ticket.id}`}>
                            View
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create Ticket Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">Create New Ticket</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowCreateForm(false)}>
                ×
              </Button>
            </div>
            <div className="p-4">
              <SimpleCreateTicketForm 
                onSuccess={() => {
                  setShowCreateForm(false)
                  window.location.reload()
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}