"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { ChatbotWidget } from "@/components/chat/chatbot-widget"

interface TicketStats {
  total: number
  open: number
  in_progress: number
  resolved: number
  by_priority: {
    low: number
    medium: number
    high: number
    urgent: number
    critical: number
  }
  by_language: {
    en: number
    hi: number
    ta: number
    te: number
    kn: number
  }
}

interface User {
  id: string
  email: string
  full_name: string
  role: string
  department: string
  language_preference: string
  created_at: string
}

interface Ticket {
  id: string
  title: string
  description: string
  status: string
  priority: string
  category: string
  language: string
  created_by: string
  assigned_to: string
  created_at: string
  updated_at: string
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default function AdminDashboard() {
  const [stats, setStats] = useState<TicketStats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  const supabase = createClient()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      window.location.href = '/auth/login'
      return
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      window.location.href = '/dashboard'
      return
    }

    setUser(user)
    loadDashboardData()
  }

  const loadDashboardData = async () => {
    try {
      // Load ticket statistics
      const { data: statsData } = await supabase.rpc('get_ticket_stats', { 
        user_role: 'admin' 
      })
      if (statsData) {
        setStats(statsData)
      }

      // Load all users
      const { data: usersData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      if (usersData) {
        setUsers(usersData)
      }

      // Load all tickets
      const { data: ticketsData } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)
      if (ticketsData) {
        setTickets(ticketsData)
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) throw error
      
      // Refresh users list
      loadDashboardData()
    } catch (error) {
      console.error('Error updating user role:', error)
    }
  }

  const assignTicket = async (ticketId: string, agentId: string) => {
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ assigned_to: agentId, status: 'in_progress' })
        .eq('id', ticketId)

      if (error) throw error
      
      // Refresh tickets list
      loadDashboardData()
    } catch (error) {
      console.error('Error assigning ticket:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading admin dashboard...</div>
      </div>
    )
  }

  const priorityData = stats ? [
    { name: 'Low', value: stats.by_priority.low },
    { name: 'Medium', value: stats.by_priority.medium },
    { name: 'High', value: stats.by_priority.high },
    { name: 'Urgent', value: stats.by_priority.urgent },
    { name: 'Critical', value: stats.by_priority.critical },
  ] : []

  const languageData = stats ? [
    { name: 'English', value: stats.by_language.en },
    { name: 'Hindi', value: stats.by_language.hi },
    { name: 'Tamil', value: stats.by_language.ta },
    { name: 'Telugu', value: stats.by_language.te },
    { name: 'Kannada', value: stats.by_language.kn },
  ] : []

  const agents = users.filter(u => u.role === 'agent')

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600">Manage users, tickets, and system analytics</p>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.open}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.in_progress}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="tickets">Ticket Management</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tickets by Priority</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={priorityData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {priorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tickets by Language</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={languageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage user roles and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{user.full_name || user.email}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      <div className="text-sm text-gray-500">
                        Department: {user.department || 'Not specified'} | 
                        Language: {user.language_preference}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'agent' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                      <select
                        value={user.role}
                        onChange={(e) => updateUserRole(user.id, e.target.value)}
                        className="px-2 py-1 border rounded"
                      >
                        <option value="user">User</option>
                        <option value="agent">Agent</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tickets" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ticket Management</CardTitle>
              <CardDescription>Assign and manage support tickets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium">{ticket.title}</div>
                        <div className="text-sm text-gray-600 mt-1">{ticket.description}</div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={ticket.status === 'open' ? 'destructive' : ticket.status === 'in_progress' ? 'default' : 'secondary'}>
                            {ticket.status}
                          </Badge>
                          <Badge variant="outline">{ticket.priority}</Badge>
                          <Badge variant="outline">{ticket.category}</Badge>
                          <Badge variant="outline">{ticket.language}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {ticket.status === 'open' && (
                          <select
                            onChange={(e) => assignTicket(ticket.id, e.target.value)}
                            className="px-2 py-1 border rounded text-sm"
                            defaultValue=""
                          >
                            <option value="">Assign to agent</option>
                            {agents.map((agent) => (
                              <option key={agent.id} value={agent.id}>
                                {agent.full_name || agent.email}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Chatbot Widget */}
      <ChatbotWidget />
    </div>
  )
}