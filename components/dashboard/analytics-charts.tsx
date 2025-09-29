"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useTranslation } from "react-i18next"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"

interface AnalyticsData {
  ticketsByStatus: Array<{ name: string; value: number }>
  ticketsByPriority: Array<{ name: string; value: number }>
  ticketsByLanguage: Array<{ name: string; value: number }>
  ticketsOverTime: Array<{ date: string; tickets: number }>
  categoryBreakdown: Array<{ name: string; value: number }>
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

export function AnalyticsCharts() {
  const { t } = useTranslation()
  const [data, setData] = useState<AnalyticsData>({
    ticketsByStatus: [],
    ticketsByPriority: [],
    ticketsByLanguage: [],
    ticketsOverTime: [],
    categoryBreakdown: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAnalytics() {
      const supabase = createClient()

      const { data: tickets } = await supabase
        .from("tickets")
        .select("status, priority, language, category, created_at, ai_classification")

      if (tickets) {
        // Status breakdown
        const statusCounts = tickets.reduce((acc: Record<string, number>, ticket) => {
          acc[ticket.status] = (acc[ticket.status] || 0) + 1
          return acc
        }, {})

        const ticketsByStatus = Object.entries(statusCounts).map(([status, count]) => ({
          name: t(`status.${status}`, status),
          value: count,
        }))

        // Priority breakdown
        const priorityCounts = tickets.reduce((acc: Record<string, number>, ticket) => {
          acc[ticket.priority] = (acc[ticket.priority] || 0) + 1
          return acc
        }, {})

        const ticketsByPriority = Object.entries(priorityCounts).map(([priority, count]) => ({
          name: t(`priority.${priority}`, priority),
          value: count,
        }))

        // Language breakdown
        const languageCounts = tickets.reduce((acc: Record<string, number>, ticket) => {
          acc[ticket.language] = (acc[ticket.language] || 0) + 1
          return acc
        }, {})

        const ticketsByLanguage = Object.entries(languageCounts).map(([language, count]) => ({
          name: t(`languages.${language}`, language.toUpperCase()),
          value: count,
        }))

        // Category breakdown (from AI classification)
        const categoryCounts = tickets.reduce((acc: Record<string, number>, ticket) => {
          const category = ticket.category || "unclassified"
          acc[category] = (acc[category] || 0) + 1
          return acc
        }, {})

        const categoryBreakdown = Object.entries(categoryCounts).map(([category, count]) => ({
          name: t(`categories.${category}`, category),
          value: count,
        }))

        // Tickets over time (last 7 days)
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date()
          date.setDate(date.getDate() - i)
          return date.toISOString().split("T")[0]
        }).reverse()

        const ticketsOverTime = last7Days.map((date) => {
          const count = tickets.filter((ticket) => ticket.created_at.startsWith(date)).length
          return {
            date: new Date(date).toLocaleDateString(),
            tickets: count,
          }
        })

        setData({
          ticketsByStatus,
          ticketsByPriority,
          ticketsByLanguage,
          ticketsOverTime,
          categoryBreakdown,
        })
      }

      setLoading(false)
    }

    fetchAnalytics()
  }, [t])

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle>{t("common.loading")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Tickets by Status */}
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.ticketsByStatus", "Tickets by Status")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.ticketsByStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.ticketsByStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tickets by Priority */}
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.ticketsByPriority", "Tickets by Priority")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.ticketsByPriority}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tickets Over Time */}
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.ticketsOverTime", "Tickets Over Time (Last 7 Days)")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.ticketsOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="tickets" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.categoryBreakdown", "Category Breakdown")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.categoryBreakdown} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={80} />
              <Tooltip />
              <Bar dataKey="value" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Language Distribution */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>{t("dashboard.languageDistribution", "Language Distribution")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.ticketsByLanguage}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
