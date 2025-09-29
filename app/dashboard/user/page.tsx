"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { ChatbotWidget } from "@/components/chat/chatbot-widget"

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

interface Comment {
  id: string
  ticket_id: string
  user_id: string
  content: string
  language: string
  is_internal: boolean
  created_at: string
}

interface CreateTicketForm {
  title: string
  description: string
  priority: string
  category: string
  language: string
}

export default function UserDashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [createForm, setCreateForm] = useState<CreateTicketForm>({
    title: '',
    description: '',
    priority: 'medium',
    category: 'general',
    language: 'en'
  })

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

    setUser(user)
    loadTickets()
  }

  const loadTickets = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('tickets')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false })

      if (data) {
        setTickets(data)
      }
    } catch (error) {
      console.error('Error loading tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadComments = async (ticketId: string) => {
    try {
      const { data } = await supabase
        .from('ticket_comments')
        .select('*')
        .eq('ticket_id', ticketId)
        .eq('is_internal', false) // Only show public comments to users
        .order('created_at', { ascending: true })

      if (data) {
        setComments(data)
      }
    } catch (error) {
      console.error('Error loading comments:', error)
    }
  }

  const createTicket = async () => {
    if (!createForm.title.trim() || !createForm.description.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createForm),
      })

      if (!response.ok) {
        throw new Error('Failed to create ticket')
      }

      const newTicket = await response.json()
      setTickets([newTicket, ...tickets])
      setCreateForm({
        title: '',
        description: '',
        priority: 'medium',
        category: 'general',
        language: 'en'
      })
      setShowCreateForm(false)
      toast.success('Ticket created successfully!')
    } catch (error) {
      console.error('Error creating ticket:', error)
      toast.error('Failed to create ticket')
    }
  }

  const startVoiceInput = async () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Speech recognition not supported in this browser')
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = createForm.language === 'hi' ? 'hi-IN' : 
                     createForm.language === 'ta' ? 'ta-IN' :
                     createForm.language === 'te' ? 'te-IN' :
                     createForm.language === 'kn' ? 'kn-IN' : 'en-US'

    recognition.onstart = () => {
      setIsRecording(true)
      toast.info('Listening... Speak now!')
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setCreateForm(prev => ({
        ...prev,
        description: prev.description + (prev.description ? ' ' : '') + transcript
      }))
      toast.success('Voice input captured!')
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      toast.error('Voice input failed. Please try again.')
      setIsRecording(false)
    }

    recognition.onend = () => {
      setIsRecording(false)
    }

    recognition.start()
  }

  const selectTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    loadComments(ticket.id)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading your dashboard...</div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'destructive'
      case 'in_progress': return 'default'
      case 'resolved': return 'secondary'
      case 'closed': return 'outline'
      default: return 'secondary'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-600'
      case 'urgent': return 'bg-red-400'
      case 'high': return 'bg-orange-400'
      case 'medium': return 'bg-yellow-400'
      case 'low': return 'bg-green-400'
      default: return 'bg-gray-400'
    }
  }

  const openTickets = tickets.filter(t => t.status === 'open')
  const inProgressTickets = tickets.filter(t => t.status === 'in_progress')
  const resolvedTickets = tickets.filter(t => ['resolved', 'closed'].includes(t.status))

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Support Tickets</h1>
            <p className="text-gray-600">Track and manage your support requests</p>
          </div>
          <Button onClick={() => setShowCreateForm(true)}>
            Create New Ticket
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tickets.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{openTickets.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{inProgressTickets.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{resolvedTickets.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets List */}
        <div className="lg:col-span-1">
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="open">Open</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {tickets.map((ticket) => (
                <Card 
                  key={ticket.id} 
                  className={`cursor-pointer transition-colors ${
                    selectedTicket?.id === ticket.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => selectTicket(ticket)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{ticket.title}</CardTitle>
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(ticket.priority)}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={getStatusColor(ticket.status)}>
                        {ticket.status}
                      </Badge>
                      <Badge variant="outline">{ticket.category}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{ticket.description}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="open" className="space-y-4">
              {openTickets.map((ticket) => (
                <Card 
                  key={ticket.id} 
                  className={`cursor-pointer transition-colors ${
                    selectedTicket?.id === ticket.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => selectTicket(ticket)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{ticket.title}</CardTitle>
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(ticket.priority)}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="destructive">open</Badge>
                      <Badge variant="outline">{ticket.category}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{ticket.description}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="resolved" className="space-y-4">
              {resolvedTickets.map((ticket) => (
                <Card 
                  key={ticket.id} 
                  className={`cursor-pointer transition-colors ${
                    selectedTicket?.id === ticket.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => selectTicket(ticket)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{ticket.title}</CardTitle>
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(ticket.priority)}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">{ticket.status}</Badge>
                      <Badge variant="outline">{ticket.category}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{ticket.description}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>

        {/* Ticket Details or Create Form */}
        <div className="lg:col-span-2">
          {showCreateForm ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Create New Ticket</CardTitle>
                  <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </Button>
                </div>
                <CardDescription>
                  Describe your issue and we'll help you resolve it
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title *</label>
                  <Input
                    placeholder="Brief description of your issue"
                    value={createForm.title}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Description *</label>
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Detailed description of your issue"
                      value={createForm.description}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={startVoiceInput}
                      disabled={isRecording}
                    >
                      {isRecording ? 'Recording...' : '🎤 Voice Input'}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Priority</label>
                    <Select value={createForm.priority} onValueChange={(value) => setCreateForm(prev => ({ ...prev, priority: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <Select value={createForm.category} onValueChange={(value) => setCreateForm(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="billing">Billing</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="feature">Feature Request</SelectItem>
                        <SelectItem value="bug">Bug Report</SelectItem>
                        <SelectItem value="support">Support</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Language</label>
                    <Select value={createForm.language} onValueChange={(value) => setCreateForm(prev => ({ ...prev, language: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                        <SelectItem value="ta">தமிழ் (Tamil)</SelectItem>
                        <SelectItem value="te">తెలుగు (Telugu)</SelectItem>
                        <SelectItem value="kn">ಕನ್ನಡ (Kannada)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={createTicket} className="w-full">
                  Create Ticket
                </Button>
              </CardContent>
            </Card>
          ) : selectedTicket ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{selectedTicket.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusColor(selectedTicket.status)}>
                      {selectedTicket.status}
                    </Badge>
                    <Badge variant="outline">{selectedTicket.priority}</Badge>
                    <Badge variant="outline">{selectedTicket.category}</Badge>
                  </div>
                </div>
                <CardDescription>
                  Created on {new Date(selectedTicket.created_at).toLocaleDateString()} | 
                  Language: {selectedTicket.language}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">Description</h3>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded">{selectedTicket.description}</p>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Updates & Responses</h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {comments.length > 0 ? (
                      comments.map((comment) => (
                        <div key={comment.id} className="bg-blue-50 p-3 rounded">
                          <p className="text-sm">{comment.content}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(comment.created_at).toLocaleString()}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">No updates yet. Our team will respond soon.</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-500">Select a ticket</h3>
                  <p className="text-gray-400">Choose a ticket from the list to view details</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Chatbot Widget */}
      <ChatbotWidget />
    </div>
  )
}