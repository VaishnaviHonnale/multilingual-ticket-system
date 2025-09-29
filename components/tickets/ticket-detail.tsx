"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { MessageCircle, Clock } from "lucide-react"
import type { Ticket, Profile, TicketComment } from "@/lib/types"
import { AIClassificationPanel } from "@/components/tickets/ai-classification-panel"
import { useTranslation } from "react-i18next"

interface TicketDetailProps {
  ticket: Ticket
  currentUser: any
  currentUserProfile: Profile | null
}

export function TicketDetail({ ticket, currentUser, currentUserProfile }: TicketDetailProps) {
  const [comments, setComments] = useState<TicketComment[]>([])
  const [newComment, setNewComment] = useState("")
  const [status, setStatus] = useState(ticket.status)
  const [priority, setPriority] = useState(ticket.priority)
  const [assignedTo, setAssignedTo] = useState(ticket.assigned_to || "")
  const [agents, setAgents] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [commentsLoading, setCommentsLoading] = useState(true)

  const { toast } = useToast()
  const supabase = createClient()
  const { t } = useTranslation()

  const canEdit =
    currentUserProfile?.role === "admin" || currentUserProfile?.role === "agent" || ticket.created_by === currentUser.id

  const canUseAI = currentUserProfile?.role === "admin" || currentUserProfile?.role === "agent"

  useEffect(() => {
    fetchComments()
    if (currentUserProfile?.role === "admin" || currentUserProfile?.role === "agent") {
      fetchAgents()
    }
  }, [])

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from("ticket_comments")
      .select(`
        *,
        profiles (
          id,
          full_name,
          email,
          role
        )
      `)
      .eq("ticket_id", ticket.id)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching comments:", error)
    } else {
      setComments(data || [])
    }
    setCommentsLoading(false)
  }

  const fetchAgents = async () => {
    const { data, error } = await supabase.from("profiles").select("*").in("role", ["admin", "agent"])

    if (error) {
      console.error("Error fetching agents:", error)
    } else {
      setAgents(data || [])
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return

    setIsLoading(true)
    try {
      const { error } = await supabase.from("ticket_comments").insert({
        ticket_id: ticket.id,
        user_id: currentUser.id,
        content: newComment,
        language: "en", // TODO: detect language
        is_internal: false,
      })

      if (error) throw error

      setNewComment("")
      await fetchComments()

      toast({
        title: t("common.success"),
        description: t("tickets.commentAdded", "Comment added successfully"),
      })
    } catch (error) {
      console.error("Error adding comment:", error)
      toast({
        title: t("common.error"),
        description: t("tickets.commentError", "Failed to add comment"),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateTicket = async () => {
    setIsLoading(true)
    try {
      const updates: any = {
        status,
        priority,
        updated_at: new Date().toISOString(),
      }

      if (assignedTo) {
        updates.assigned_to = assignedTo
      }

      const { error } = await supabase.from("tickets").update(updates).eq("id", ticket.id)

      if (error) throw error

      toast({
        title: t("common.success"),
        description: t("tickets.ticketUpdated"),
      })
    } catch (error) {
      console.error("Error updating ticket:", error)
      toast({
        title: t("common.error"),
        description: t("tickets.updateError", "Failed to update ticket"),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
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

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Ticket Details */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{ticket.title}</CardTitle>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {ticket.profiles?.full_name?.[0] || ticket.profiles?.email?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    {t("tickets.createdBy", "Created by")} {ticket.profiles?.full_name || ticket.profiles?.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {new Date(ticket.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge className={getStatusColor(status)}>{t(`status.${status}`, status.replace("_", " "))}</Badge>
                <Badge className={getPriorityColor(priority)}>{t(`priority.${priority}`, priority)}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap">{ticket.description}</p>
            </div>
            {ticket.category && (
              <div className="mt-4">
                <Badge variant="outline">{t(`categories.${ticket.category}`, ticket.category)}</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Comments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              {t("tickets.comments")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {commentsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : comments.length === 0 ? (
              <p className="text-muted-foreground">{t("tickets.noComments", "No comments yet")}</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="border-l-2 border-muted pl-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {comment.profiles?.full_name?.[0] || comment.profiles?.email?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm">
                      {comment.profiles?.full_name || comment.profiles?.email}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                </div>
              ))
            )}

            {/* Add Comment */}
            <div className="border-t pt-4">
              <Textarea
                placeholder={t("tickets.addComment")}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
              />
              <Button onClick={handleAddComment} disabled={isLoading || !newComment.trim()} className="mt-2">
                {isLoading ? t("common.loading") : t("tickets.addComment")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {canUseAI && (
          <AIClassificationPanel
            ticketId={ticket.id}
            currentClassification={ticket.ai_classification}
            onClassificationUpdate={(classification) => {
              setPriority(classification.priority)
            }}
          />
        )}

        {canEdit && (
          <Card>
            <CardHeader>
              <CardTitle>{t("tickets.updateTicket", "Update Ticket")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">{t("tickets.status")}</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">{t("status.open")}</SelectItem>
                    <SelectItem value="in_progress">{t("status.inProgress")}</SelectItem>
                    <SelectItem value="resolved">{t("status.resolved")}</SelectItem>
                    <SelectItem value="closed">{t("status.closed")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">{t("tickets.priority")}</label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">{t("priority.low")}</SelectItem>
                    <SelectItem value="medium">{t("priority.medium")}</SelectItem>
                    <SelectItem value="high">{t("priority.high")}</SelectItem>
                    <SelectItem value="urgent">{t("priority.urgent")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(currentUserProfile?.role === "admin" || currentUserProfile?.role === "agent") && (
                <div>
                  <label className="text-sm font-medium">{t("tickets.assignTo", "Assign to")}</label>
                  <Select value={assignedTo} onValueChange={setAssignedTo}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("tickets.selectAgent", "Select agent")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">{t("tickets.unassigned", "Unassigned")}</SelectItem>
                      {agents.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id}>
                          {agent.full_name || agent.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button onClick={handleUpdateTicket} disabled={isLoading} className="w-full">
                {isLoading ? t("common.loading") : t("tickets.updateTicket", "Update Ticket")}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Ticket Info */}
        <Card>
          <CardHeader>
            <CardTitle>{t("tickets.ticketInformation", "Ticket Information")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <span className="font-medium">ID:</span>
              <span className="ml-2 font-mono text-xs">{ticket.id}</span>
            </div>
            <div>
              <span className="font-medium">{t("tickets.language", "Language")}:</span>
              <span className="ml-2">{ticket.language.toUpperCase()}</span>
            </div>
            <div>
              <span className="font-medium">{t("tickets.createdAt")}:</span>
              <span className="ml-2">{new Date(ticket.created_at).toLocaleString()}</span>
            </div>
            <div>
              <span className="font-medium">{t("tickets.updatedAt")}:</span>
              <span className="ml-2">{new Date(ticket.updated_at).toLocaleString()}</span>
            </div>
            {ticket.assigned_profile && (
              <div>
                <span className="font-medium">{t("tickets.assignedTo")}:</span>
                <span className="ml-2">{ticket.assigned_profile.full_name || ticket.assigned_profile.email}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
