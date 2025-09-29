"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Clock, MessageSquare, User } from "lucide-react"
import { useTranslation } from "react-i18next"
import Link from "next/link"
import type { Ticket, Profile } from "@/lib/types"

interface ActivityItem {
  id: string
  type: "ticket_created" | "ticket_updated" | "comment_added"
  title: string
  description: string
  timestamp: string
  user?: Profile
  ticket?: Ticket
}

export function RecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const { t } = useTranslation()

  useEffect(() => {
    fetchRecentActivity()
  }, [])

  const fetchRecentActivity = async () => {
    const supabase = createClient()

    // Fetch recent tickets
    const { data: tickets } = await supabase
      .from("tickets")
      .select(`
        *,
        profiles:created_by (
          id,
          full_name,
          email
        )
      `)
      .order("created_at", { ascending: false })
      .limit(10)

    // Fetch recent comments
    const { data: comments } = await supabase
      .from("ticket_comments")
      .select(`
        *,
        profiles:user_id (
          id,
          full_name,
          email
        ),
        tickets:ticket_id (
          id,
          title
        )
      `)
      .order("created_at", { ascending: false })
      .limit(10)

    const activities: ActivityItem[] = []

    // Add ticket activities
    if (tickets) {
      tickets.forEach((ticket) => {
        activities.push({
          id: `ticket-${ticket.id}`,
          type: "ticket_created",
          title: `New ticket: ${ticket.title}`,
          description: `Created by ${ticket.profiles?.full_name || ticket.profiles?.email}`,
          timestamp: ticket.created_at,
          user: ticket.profiles,
          ticket,
        })
      })
    }

    // Add comment activities
    if (comments) {
      comments.forEach((comment: any) => {
        activities.push({
          id: `comment-${comment.id}`,
          type: "comment_added",
          title: `New comment on: ${comment.tickets?.title}`,
          description: `Comment by ${comment.profiles?.full_name || comment.profiles?.email}`,
          timestamp: comment.created_at,
          user: comment.profiles,
        })
      })
    }

    // Sort by timestamp and take the most recent 15
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    setActivities(activities.slice(0, 15))
    setLoading(false)
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "ticket_created":
        return <User className="h-4 w-4" />
      case "comment_added":
        return <MessageSquare className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case "ticket_created":
        return "text-blue-600"
      case "comment_added":
        return "text-green-600"
      default:
        return "text-gray-600"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.recentActivity", "Recent Activity")}</CardTitle>
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
        <CardTitle>{t("dashboard.recentActivity", "Recent Activity")}</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">{t("dashboard.noActivity", "No recent activity")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className={`mt-1 ${getActivityColor(activity.type)}`}>{getActivityIcon(activity.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {activity.ticket ? (
                      <Link href={`/tickets/${activity.ticket.id}`} className="hover:underline">
                        {activity.title}
                      </Link>
                    ) : (
                      activity.title
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">{activity.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
                {activity.user && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{activity.user.full_name?.[0] || activity.user.email?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
