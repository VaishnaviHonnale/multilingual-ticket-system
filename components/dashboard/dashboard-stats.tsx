"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Ticket, Clock, CheckCircle, AlertCircle, TrendingUp, Users, Brain, Globe } from "lucide-react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useTranslation } from "react-i18next"

interface Stats {
  total: number
  open: number
  inProgress: number
  resolved: number
  avgResponseTime: number
  totalUsers: number
  aiClassified: number
  languageBreakdown: Record<string, number>
}

export function DashboardStats() {
  const [stats, setStats] = useState<Stats>({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    avgResponseTime: 0,
    totalUsers: 0,
    aiClassified: 0,
    languageBreakdown: {},
  })
  const [loading, setLoading] = useState(true)
  const { t } = useTranslation()

  useEffect(() => {
    async function fetchStats() {
      const supabase = createClient()

      const [ticketsResult, usersResult] = await Promise.all([
        supabase.from("tickets").select("status, language, ai_classification, created_at, updated_at"),
        supabase.from("profiles").select("id"),
      ])

      if (ticketsResult.data && usersResult.data) {
        const tickets = ticketsResult.data
        const users = usersResult.data

        const stats = tickets.reduce(
          (acc, ticket) => {
            acc.total++

            // Status breakdown
            switch (ticket.status) {
              case "open":
                acc.open++
                break
              case "in_progress":
                acc.inProgress++
                break
              case "resolved":
              case "closed":
                acc.resolved++
                break
            }

            // Language breakdown
            if (ticket.language) {
              acc.languageBreakdown[ticket.language] = (acc.languageBreakdown[ticket.language] || 0) + 1
            }

            // AI classification count
            if (ticket.ai_classification) {
              acc.aiClassified++
            }

            return acc
          },
          {
            total: 0,
            open: 0,
            inProgress: 0,
            resolved: 0,
            avgResponseTime: 0,
            totalUsers: users.length,
            aiClassified: 0,
            languageBreakdown: {} as Record<string, number>,
          },
        )

        // Calculate average response time (simplified - time from creation to first update)
        const resolvedTickets = tickets.filter((t) => t.status === "resolved" || t.status === "closed")
        if (resolvedTickets.length > 0) {
          const totalResponseTime = resolvedTickets.reduce((sum, ticket) => {
            const created = new Date(ticket.created_at).getTime()
            const updated = new Date(ticket.updated_at).getTime()
            return sum + (updated - created)
          }, 0)
          stats.avgResponseTime = Math.round(totalResponseTime / resolvedTickets.length / (1000 * 60 * 60)) // Convert to hours
        }

        setStats(stats)
      }
      setLoading(false)
    }

    fetchStats()
  }, [])

  const statCards = [
    {
      title: t("dashboard.totalTickets", "Total Tickets"),
      value: stats.total,
      icon: Ticket,
      color: "text-blue-600",
    },
    {
      title: t("status.open", "Open"),
      value: stats.open,
      icon: AlertCircle,
      color: "text-red-600",
    },
    {
      title: t("status.inProgress", "In Progress"),
      value: stats.inProgress,
      icon: Clock,
      color: "text-yellow-600",
    },
    {
      title: t("status.resolved", "Resolved"),
      value: stats.resolved,
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      title: t("dashboard.avgResponseTime", "Avg Response Time"),
      value: `${stats.avgResponseTime}h`,
      icon: TrendingUp,
      color: "text-purple-600",
    },
    {
      title: t("dashboard.totalUsers", "Total Users"),
      value: stats.totalUsers,
      icon: Users,
      color: "text-indigo-600",
    },
    {
      title: t("dashboard.aiClassified", "AI Classified"),
      value: stats.aiClassified,
      icon: Brain,
      color: "text-pink-600",
    },
    {
      title: t("dashboard.languages", "Languages"),
      value: Object.keys(stats.languageBreakdown).length,
      icon: Globe,
      color: "text-teal-600",
    },
  ]

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("common.loading")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
