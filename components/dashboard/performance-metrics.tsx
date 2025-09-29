"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useTranslation } from "react-i18next"
import { TrendingUp, TrendingDown, Clock, Target, Brain, Users } from "lucide-react"

interface PerformanceData {
  resolutionRate: number
  avgResolutionTime: number
  customerSatisfaction: number
  agentProductivity: number
  aiAccuracy: number
  responseTime: number
  trends: {
    resolutionRate: "up" | "down" | "stable"
    responseTime: "up" | "down" | "stable"
  }
}

export function PerformanceMetrics() {
  const { t } = useTranslation()
  const [data, setData] = useState<PerformanceData>({
    resolutionRate: 0,
    avgResolutionTime: 0,
    customerSatisfaction: 0,
    agentProductivity: 0,
    aiAccuracy: 0,
    responseTime: 0,
    trends: {
      resolutionRate: "stable",
      responseTime: "stable",
    },
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPerformanceData() {
      const supabase = createClient()

      const [ticketsResult, commentsResult, profilesResult] = await Promise.all([
        supabase.from("tickets").select("status, priority, created_at, updated_at, ai_classification"),
        supabase.from("ticket_comments").select("created_at, ticket_id"),
        supabase.from("profiles").select("role").eq("role", "agent"),
      ])

      if (ticketsResult.data && commentsResult.data && profilesResult.data) {
        const tickets = ticketsResult.data
        const comments = commentsResult.data
        const agents = profilesResult.data

        // Calculate resolution rate
        const resolvedTickets = tickets.filter((t) => t.status === "resolved" || t.status === "closed")
        const resolutionRate = tickets.length > 0 ? (resolvedTickets.length / tickets.length) * 100 : 0

        // Calculate average resolution time
        const avgResolutionTime =
          resolvedTickets.length > 0
            ? resolvedTickets.reduce((sum, ticket) => {
                const created = new Date(ticket.created_at).getTime()
                const updated = new Date(ticket.updated_at).getTime()
                return sum + (updated - created)
              }, 0) /
              resolvedTickets.length /
              (1000 * 60 * 60 * 24) // Convert to days
            : 0

        // Calculate AI accuracy (simplified - based on confidence scores)
        const aiClassifiedTickets = tickets.filter((t) => t.ai_classification)
        const aiAccuracy =
          aiClassifiedTickets.length > 0
            ? (aiClassifiedTickets.reduce((sum, ticket) => {
                return sum + (ticket.ai_classification?.confidence || 0)
              }, 0) /
                aiClassifiedTickets.length) *
              100
            : 0

        // Calculate response time (time to first comment)
        const ticketsWithComments = tickets.filter((ticket) =>
          comments.some((comment) => comment.ticket_id === ticket.id),
        )
        const responseTime =
          ticketsWithComments.length > 0
            ? ticketsWithComments.reduce((sum, ticket) => {
                const firstComment = comments
                  .filter((c) => c.ticket_id === ticket.id)
                  .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())[0]

                if (firstComment) {
                  const created = new Date(ticket.created_at).getTime()
                  const responded = new Date(firstComment.created_at).getTime()
                  return sum + (responded - created)
                }
                return sum
              }, 0) /
              ticketsWithComments.length /
              (1000 * 60 * 60) // Convert to hours
            : 0

        // Agent productivity (tickets per agent)
        const agentProductivity = agents.length > 0 ? tickets.length / agents.length : 0

        // Mock customer satisfaction (would come from surveys in real app)
        const customerSatisfaction = 85 + Math.random() * 10

        setData({
          resolutionRate: Math.round(resolutionRate),
          avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
          customerSatisfaction: Math.round(customerSatisfaction),
          agentProductivity: Math.round(agentProductivity * 10) / 10,
          aiAccuracy: Math.round(aiAccuracy),
          responseTime: Math.round(responseTime * 10) / 10,
          trends: {
            resolutionRate: resolutionRate > 75 ? "up" : resolutionRate < 50 ? "down" : "stable",
            responseTime: responseTime < 2 ? "up" : responseTime > 8 ? "down" : "stable",
          },
        })
      }

      setLoading(false)
    }

    fetchPerformanceData()
  }, [])

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <div className="h-4 w-4" />
    }
  }

  const getPerformanceColor = (value: number, type: "percentage" | "time" | "accuracy") => {
    if (type === "percentage" || type === "accuracy") {
      if (value >= 80) return "text-green-600"
      if (value >= 60) return "text-yellow-600"
      return "text-red-600"
    } else {
      // time
      if (value <= 2) return "text-green-600"
      if (value <= 8) return "text-yellow-600"
      return "text-red-600"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("common.loading")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          {t("dashboard.performanceMetrics", "Performance Metrics")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Resolution Rate */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{t("dashboard.resolutionRate", "Resolution Rate")}</span>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold ${getPerformanceColor(data.resolutionRate, "percentage")}`}>
                {data.resolutionRate}%
              </span>
              {getTrendIcon(data.trends.resolutionRate)}
            </div>
          </div>
          <Progress value={data.resolutionRate} className="h-2" />
        </div>

        {/* Average Resolution Time */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{t("dashboard.avgResolutionTime", "Avg Resolution Time")}</span>
          </div>
          <Badge variant="outline" className={getPerformanceColor(data.avgResolutionTime, "time")}>
            {data.avgResolutionTime} {t("common.days", "days")}
          </Badge>
        </div>

        {/* Response Time */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{t("dashboard.responseTime", "First Response Time")}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={getPerformanceColor(data.responseTime, "time")}>
              {data.responseTime}h
            </Badge>
            {getTrendIcon(data.trends.responseTime)}
          </div>
        </div>

        {/* Customer Satisfaction */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{t("dashboard.customerSatisfaction", "Customer Satisfaction")}</span>
            <span className={`text-sm font-bold ${getPerformanceColor(data.customerSatisfaction, "percentage")}`}>
              {data.customerSatisfaction}%
            </span>
          </div>
          <Progress value={data.customerSatisfaction} className="h-2" />
        </div>

        {/* Agent Productivity */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{t("dashboard.agentProductivity", "Tickets per Agent")}</span>
          </div>
          <Badge variant="outline">{data.agentProductivity}</Badge>
        </div>

        {/* AI Accuracy */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{t("dashboard.aiAccuracy", "AI Classification Accuracy")}</span>
            </div>
            <span className={`text-sm font-bold ${getPerformanceColor(data.aiAccuracy, "accuracy")}`}>
              {data.aiAccuracy}%
            </span>
          </div>
          <Progress value={data.aiAccuracy} className="h-2" />
        </div>
      </CardContent>
    </Card>
  )
}
