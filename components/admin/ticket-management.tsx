"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Eye, Edit, Trash2 } from "lucide-react"
import { useTranslation } from "react-i18next"
import type { Ticket, Profile } from "@/lib/types"
import Link from "next/link"

interface TicketWithProfiles extends Ticket {
  profiles?: Profile
  assigned_profile?: Profile
}

export function TicketManagement() {
  const [tickets, setTickets] = useState<TicketWithProfiles[]>([])
  const [agents, setAgents] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const { t } = useTranslation()

  useEffect(() => {
    fetchTickets()
    fetchAgents()
  }, [searchTerm, statusFilter, priorityFilter])

  const fetchTickets = async () => {
    const supabase = createClient()

    let query = supabase
      .from("tickets")
      .select(`
        *,
        profiles:created_by (
          id,
          full_name,
          email
        ),
        assigned_profile:assigned_to (
          id,
          full_name,
          email
        )
      `)
      .order("created_at", { ascending: false })

    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter)
    }

    if (priorityFilter !== "all") {
      query = query.eq("priority", priorityFilter)
    }

    if (searchTerm) {
      query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching tickets:", error)
    } else {
      setTickets(data || [])
    }
    setLoading(false)
  }

  const fetchAgents = async () => {
    const supabase = createClient()

    const { data, error } = await supabase.from("profiles").select("*").in("role", ["admin", "agent"])

    if (error) {
      console.error("Error fetching agents:", error)
    } else {
      setAgents(data || [])
    }
  }

  const assignTicket = async (ticketId: string, agentId: string) => {
    const supabase = createClient()

    const { error } = await supabase
      .from("tickets")
      .update({
        assigned_to: agentId === "unassigned" ? null : agentId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", ticketId)

    if (error) {
      console.error("Error assigning ticket:", error)
    } else {
      fetchTickets() // Refresh the list
    }
  }

  const updateTicketStatus = async (ticketId: string, newStatus: string) => {
    const supabase = createClient()

    const updateData: any = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    }

    if (newStatus === "resolved" || newStatus === "closed") {
      updateData.resolved_at = new Date().toISOString()
    }

    const { error } = await supabase.from("tickets").update(updateData).eq("id", ticketId)

    if (error) {
      console.error("Error updating ticket status:", error)
    } else {
      fetchTickets() // Refresh the list
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "in_progress":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      case "resolved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "closed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("admin.ticketManagement", "Ticket Management")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("admin.ticketManagement", "Ticket Management")}</CardTitle>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={t("admin.searchTickets", "Search tickets...")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder={t("admin.status", "Status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("admin.allStatus", "All Status")}</SelectItem>
                <SelectItem value="open">{t("status.open", "Open")}</SelectItem>
                <SelectItem value="in_progress">{t("status.inProgress", "In Progress")}</SelectItem>
                <SelectItem value="resolved">{t("status.resolved", "Resolved")}</SelectItem>
                <SelectItem value="closed">{t("status.closed", "Closed")}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder={t("admin.priority", "Priority")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("admin.allPriority", "All Priority")}</SelectItem>
                <SelectItem value="urgent">{t("priority.urgent", "Urgent")}</SelectItem>
                <SelectItem value="high">{t("priority.high", "High")}</SelectItem>
                <SelectItem value="medium">{t("priority.medium", "Medium")}</SelectItem>
                <SelectItem value="low">{t("priority.low", "Low")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {tickets.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">{t("admin.noTickets", "No tickets found")}</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("admin.title", "Title")}</TableHead>
                <TableHead>{t("admin.creator", "Creator")}</TableHead>
                <TableHead>{t("admin.assignee", "Assignee")}</TableHead>
                <TableHead>{t("admin.status", "Status")}</TableHead>
                <TableHead>{t("admin.priority", "Priority")}</TableHead>
                <TableHead>{t("admin.created", "Created")}</TableHead>
                <TableHead>{t("admin.actions", "Actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-medium">
                    <Link href={`/tickets/${ticket.id}`} className="hover:underline">
                      {ticket.title}
                    </Link>
                  </TableCell>
                  <TableCell>{ticket.profiles?.full_name || ticket.profiles?.email}</TableCell>
                  <TableCell>
                    <Select
                      value={ticket.assigned_to || "unassigned"}
                      onValueChange={(agentId) => assignTicket(ticket.id, agentId)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue>
                          {ticket.assigned_profile?.full_name ||
                            ticket.assigned_profile?.email ||
                            t("admin.unassigned", "Unassigned")}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">{t("admin.unassigned", "Unassigned")}</SelectItem>
                        {agents.map((agent) => (
                          <SelectItem key={agent.id} value={agent.id}>
                            {agent.full_name || agent.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={ticket.status}
                      onValueChange={(newStatus) => updateTicketStatus(ticket.id, newStatus)}
                    >
                      <SelectTrigger className="w-32">
                        <Badge className={getStatusColor(ticket.status)}>{ticket.status.replace("_", " ")}</Badge>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
                  </TableCell>
                  <TableCell>{new Date(ticket.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/tickets/${ticket.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
