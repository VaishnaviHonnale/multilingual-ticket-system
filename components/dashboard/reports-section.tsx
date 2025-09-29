"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { useTranslation } from "react-i18next"
import { Download, FileText, CalendarIcon, TrendingUp, Users, Clock, Target } from "lucide-react"
import { format } from "date-fns"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface ReportData {
  ticketTrends: Array<{ date: string; tickets: number; resolved: number }>
  performanceMetrics: {
    totalTickets: number
    resolvedTickets: number
    avgResolutionTime: number
    customerSatisfaction: number
  }
  agentPerformance: Array<{ agent: string; tickets: number; resolved: number; avgTime: number }>
  categoryBreakdown: Array<{ category: string; count: number; percentage: number }>
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

export function ReportsSection() {
  const { t } = useTranslation()
  const [reportData, setReportData] = useState<ReportData>({
    ticketTrends: [],
    performanceMetrics: {
      totalTickets: 0,
      resolvedTickets: 0,
      avgResolutionTime: 0,
      customerSatisfaction: 0,
    },
    agentPerformance: [],
    categoryBreakdown: [],
  })
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date(),
  })
  const [selectedReport, setSelectedReport] = useState("overview")

  useEffect(() => {
    fetchReportData()
  }, [dateRange])

  const fetchReportData = async () => {
    setLoading(true)
    const supabase = createClient()

    const { data: tickets } = await supabase
      .from("tickets")
      .select(`
        *,
        profiles:created_by (full_name, email),
        ticket_comments (created_at, user_id)
      `)
      .gte("created_at", dateRange.from.toISOString())
      .lte("created_at", dateRange.to.toISOString())

    const { data: agents } = await supabase.from("profiles").select("*").eq("role", "agent")

    if (tickets && agents) {
      // Calculate ticket trends
      const ticketTrends = generateTicketTrends(tickets)

      // Calculate performance metrics
      const performanceMetrics = calculatePerformanceMetrics(tickets)

      // Calculate agent performance
      const agentPerformance = calculateAgentPerformance(tickets, agents)

      // Calculate category breakdown
      const categoryBreakdown = calculateCategoryBreakdown(tickets)

      setReportData({
        ticketTrends,
        performanceMetrics,
        agentPerformance,
        categoryBreakdown,
      })
    }

    setLoading(false)
  }

  const generateTicketTrends = (tickets: any[]) => {
    const trends: Record<string, { tickets: number; resolved: number }> = {}

    tickets.forEach((ticket) => {
      const date = ticket.created_at.split("T")[0]
      if (!trends[date]) {
        trends[date] = { tickets: 0, resolved: 0 }
      }
      trends[date].tickets++
      if (ticket.status === "resolved" || ticket.status === "closed") {
        trends[date].resolved++
      }
    })

    return Object.entries(trends)
      .map(([date, data]) => ({
        date: format(new Date(date), "MMM dd"),
        tickets: data.tickets,
        resolved: data.resolved,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  const calculatePerformanceMetrics = (tickets: any[]) => {
    const totalTickets = tickets.length
    const resolvedTickets = tickets.filter((t) => t.status === "resolved" || t.status === "closed").length

    const avgResolutionTime =
      resolvedTickets > 0
        ? tickets
            .filter((t) => t.status === "resolved" || t.status === "closed")
            .reduce((sum, ticket) => {
              const created = new Date(ticket.created_at).getTime()
              const updated = new Date(ticket.updated_at).getTime()
              return sum + (updated - created)
            }, 0) /
          resolvedTickets /
          (1000 * 60 * 60 * 24) // Convert to days
        : 0

    return {
      totalTickets,
      resolvedTickets,
      avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
      customerSatisfaction: 85 + Math.random() * 10, // Mock data
    }
  }

  const calculateAgentPerformance = (tickets: any[], agents: any[]) => {
    return agents.map((agent) => {
      const agentTickets = tickets.filter((t) => t.assigned_to === agent.id)
      const resolvedTickets = agentTickets.filter((t) => t.status === "resolved" || t.status === "closed")

      const avgTime =
        resolvedTickets.length > 0
          ? resolvedTickets.reduce((sum, ticket) => {
              const created = new Date(ticket.created_at).getTime()
              const updated = new Date(ticket.updated_at).getTime()
              return sum + (updated - created)
            }, 0) /
            resolvedTickets.length /
            (1000 * 60 * 60 * 24)
          : 0

      return {
        agent: agent.full_name || agent.email,
        tickets: agentTickets.length,
        resolved: resolvedTickets.length,
        avgTime: Math.round(avgTime * 10) / 10,
      }
    })
  }

  const calculateCategoryBreakdown = (tickets: any[]) => {
    const categories: Record<string, number> = {}

    tickets.forEach((ticket) => {
      const category = ticket.category || "unclassified"
      categories[category] = (categories[category] || 0) + 1
    })

    const total = tickets.length
    return Object.entries(categories).map(([category, count]) => ({
      category: t(`categories.${category}`, category),
      count,
      percentage: Math.round((count / total) * 100),
    }))
  }

  const exportReport = (format: "csv" | "pdf") => {
    console.log(`Exporting report as ${format}`)
    // In a real app, this would generate and download the report
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded w-48" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-16 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Report Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h2 className="text-2xl font-bold">{t("reports.title", "Detailed Reports")}</h2>

        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <CalendarIcon className="h-4 w-4 mr-2" />
                {format(dateRange.from, "MMM dd")} - {format(dateRange.to, "MMM dd")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <div className="p-4 space-y-4">
                <div className="space-y-2">
                  <Label>{t("reports.dateRange", "Date Range")}</Label>
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      value={format(dateRange.from, "yyyy-MM-dd")}
                      onChange={(e) => setDateRange((prev) => ({ ...prev, from: new Date(e.target.value) }))}
                    />
                    <Input
                      type="date"
                      value={format(dateRange.to, "yyyy-MM-dd")}
                      onChange={(e) => setDateRange((prev) => ({ ...prev, to: new Date(e.target.value) }))}
                    />
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button variant="outline" size="sm" onClick={() => exportReport("csv")}>
            <Download className="h-4 w-4 mr-2" />
            {t("reports.exportCSV", "Export CSV")}
          </Button>

          <Button variant="outline" size="sm" onClick={() => exportReport("pdf")}>
            <FileText className="h-4 w-4 mr-2" />
            {t("reports.exportPDF", "Export PDF")}
          </Button>
        </div>
      </div>

      {/* Performance Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("reports.totalTickets", "Total Tickets")}
                </p>
                <p className="text-2xl font-bold">{reportData.performanceMetrics.totalTickets}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("reports.resolvedTickets", "Resolved")}</p>
                <p className="text-2xl font-bold">{reportData.performanceMetrics.resolvedTickets}</p>
                <p className="text-xs text-muted-foreground">
                  {Math.round(
                    (reportData.performanceMetrics.resolvedTickets / reportData.performanceMetrics.totalTickets) * 100,
                  )}
                  % resolution rate
                </p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("reports.avgResolutionTime", "Avg Resolution")}
                </p>
                <p className="text-2xl font-bold">{reportData.performanceMetrics.avgResolutionTime}d</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("reports.satisfaction", "Satisfaction")}</p>
                <p className="text-2xl font-bold">{Math.round(reportData.performanceMetrics.customerSatisfaction)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports Tabs */}
      <Tabs value={selectedReport} onValueChange={setSelectedReport}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">{t("reports.overview", "Overview")}</TabsTrigger>
          <TabsTrigger value="trends">{t("reports.trends", "Trends")}</TabsTrigger>
          <TabsTrigger value="agents">{t("reports.agents", "Agents")}</TabsTrigger>
          <TabsTrigger value="categories">{t("reports.categories", "Categories")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t("reports.ticketTrends", "Ticket Trends")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={reportData.ticketTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="tickets" stroke="#8884d8" name="Created" />
                    <Line type="monotone" dataKey="resolved" stroke="#82ca9d" name="Resolved" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("reports.categoryDistribution", "Category Distribution")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={reportData.categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, percentage }) => `${category} ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {reportData.categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("reports.detailedTrends", "Detailed Ticket Trends")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={reportData.ticketTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="tickets" fill="#8884d8" name="Created" />
                  <Bar dataKey="resolved" fill="#82ca9d" name="Resolved" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("reports.agentPerformance", "Agent Performance")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.agentPerformance.map((agent, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{agent.agent}</p>
                        <p className="text-sm text-muted-foreground">
                          {agent.tickets} tickets • {agent.resolved} resolved
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">{agent.avgTime}d avg</Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        {Math.round((agent.resolved / agent.tickets) * 100)}% rate
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("reports.categoryAnalysis", "Category Analysis")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.categoryBreakdown.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{category.category}</p>
                      <p className="text-sm text-muted-foreground">{category.count} tickets</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">{category.percentage}%</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
