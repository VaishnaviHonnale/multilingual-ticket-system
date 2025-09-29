"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreateTicketForm } from "@/components/tickets/create-ticket-form"
import { 
  Plus, 
  TicketIcon, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  User,
  Settings,
  LogOut,
  MessageSquare,
  Globe
} from "lucide-react"
import { useTranslation } from "react-i18next"
import { createClient } from "@/lib/supabase-client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"
import { LanguageSwitcher } from "@/components/language-switcher"

interface DashboardData {
  user: any
  profile: any
  tickets: any[]
  stats: {
    total: number
    open: number
    inProgress: number
    resolved: number
  }
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const { t } = useTranslation()
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
          router.push("/auth/login")
          return
        }

        // Get user profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        // Get user tickets with proper join syntax
        const { data: tickets, error: ticketsError } = await supabase
          .from("tickets")
          .select(`
            *,
            creator:profiles!created_by(full_name, email),
            assignee:profiles!assigned_to(full_name, email)
          `)
          .eq("created_by", user.id)
          .order("created_at", { ascending: false })

        if (ticketsError) {
          console.error("Error fetching tickets:", ticketsError)
          // Continue with empty tickets array
        }

        const ticketsList = tickets || []
        const stats = {
          total: ticketsList.length,
          open: ticketsList.filter(t => t.status === "open").length,
          inProgress: ticketsList.filter(t => t.status === "in_progress").length,
          resolved: ticketsList.filter(t => t.status === "resolved" || t.status === "closed").length
        }

        setData({
          user,
          profile,
          tickets: ticketsList,
          stats
        })
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        toast.error(t("dashboard.loadError", "Failed to load dashboard"))
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [supabase, router, t])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/")
      toast.success(t("auth.signedOut", "Signed out successfully"))
    } catch (error) {
      console.error("Error signing out:", error)
      toast.error(t("auth.signOutError", "Error signing out"))
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
          <p>{t("loading", "Loading...")}</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">{t("dashboard.noData", "Unable to load dashboard data")}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold">{t("dashboard.title", "Dashboard")}</h1>
            <div className="text-sm text-muted-foreground">
              {t("welcome", "Welcome")}, {data.profile?.full_name || data.user.email}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            
            {data.profile?.role === "admin" && (
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin">
                  <Settings className="h-4 w-4 mr-2" />
                  {t("admin.dashboard", "Admin")}
                </Link>
              </Button>
            )}
            
            <Button variant="outline" size="sm" asChild>
              <Link href="/profile">
                <User className="h-4 w-4 mr-2" />
                {t("profile.title", "Profile")}
              </Link>
            </Button>
            
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              {t("auth.signOut", "Sign Out")}
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
                    <p className="text-sm font-medium text-muted-foreground">{t("dashboard.totalTickets", "Total Tickets")}</p>
                    <p className="text-2xl font-bold">{data.stats.total}</p>
                  </div>
                  <TicketIcon className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t("dashboard.openTickets", "Open Tickets")}</p>
                    <p className="text-2xl font-bold text-warning">{data.stats.open}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-warning" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t("dashboard.inProgress", "In Progress")}</p>
                    <p className="text-2xl font-bold text-info">{data.stats.inProgress}</p>
                  </div>
                  <Clock className="h-8 w-8 text-info" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t("dashboard.resolved", "Resolved")}</p>
                    <p className="text-2xl font-bold text-success">{data.stats.resolved}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-success" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="tickets" className="space-y-6">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="tickets">{t("dashboard.myTickets", "My Tickets")}</TabsTrigger>
                <TabsTrigger value="create">{t("dashboard.createTicket", "Create Ticket")}</TabsTrigger>
              </TabsList>
              
              <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                {t("tickets.createNew", "New Ticket")}
              </Button>
            </div>

            <TabsContent value="tickets" className="space-y-6">
              {data.tickets.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <TicketIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">{t("tickets.noTickets", "No tickets yet")}</h3>
                    <p className="text-muted-foreground mb-4">
                      {t("tickets.noTicketsDescription", "Create your first support ticket to get started")}
                    </p>
                    <Button onClick={() => setShowCreateForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      {t("tickets.createFirst", "Create First Ticket")}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {data.tickets.map((ticket) => (
                    <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{ticket.title}</h3>
                              <Badge variant={getStatusColor(ticket.status)}>
                                {t(`status.${ticket.status}`, ticket.status)}
                              </Badge>
                              <Badge variant={getPriorityColor(ticket.priority)}>
                                {t(`priority.${ticket.priority}`, ticket.priority)}
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
                                {t("tickets.created", "Created")}: {new Date(ticket.created_at).toLocaleDateString()}
                              </span>
                              {ticket.category && (
                                <span>
                                  {t("tickets.category", "Category")}: {t(`category.${ticket.category}`, ticket.category)}
                                </span>
                              )}
                              {ticket.assignee && (
                                <span>
                                  {t("tickets.assignedTo", "Assigned to")}: {ticket.assignee.full_name}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/tickets/${ticket.id}`}>
                                {t("tickets.view", "View")}
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="create" className="space-y-6">
              <CreateTicketForm 
                onSuccess={() => {
                  setShowCreateForm(false)
                  // Refresh the page to show new ticket
                  window.location.reload()
                }}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Create Ticket Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">{t("tickets.createNew", "Create New Ticket")}</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowCreateForm(false)}>
                ×
              </Button>
            </div>
            <div className="p-4">
              <CreateTicketForm 
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