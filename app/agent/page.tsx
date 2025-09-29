"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
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

export default function AgentDashboard() {
  const [assignedTickets, setAssignedTickets] = useState<Ticket[]>([])
  const [unassignedTickets, setUnassignedTickets] = useState<Ticket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
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

    // Check if user is agent or admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['agent', 'admin'].includes(profile.role)) {
      window.location.href = '/dashboard'
      return
    }

    setUser(user)
    loadTickets()
  }

  const loadTickets = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Load assigned tickets
      const { data: assigned } = await supabase
        .from('tickets')
        .select('*')
        .eq('assigned_to', user.id)
        .order('created_at', { ascending: false })

      if (assigned) {
        setAssignedTickets(assigned)
      }

      // Load unassigned tickets
      const { data: unassigned } = await supabase
        .from('tickets')
        .select('*')
        .is('assigned_to', null)
        .eq('status', 'open')
        .order('created_at', { ascending: false })

      if (unassigned) {
        setUnassignedTickets(unassigned)
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
        .order('created_at', { ascending: true })

      if (data) {
        setComments(data)
      }
    } catch (error) {
      console.error('Error loading comments:', error)
    }
  }

  const assignToSelf = async (ticketId: string) => {
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ 
          assigned_to: user.id, 
          status: 'in_progress' 
        })
        .eq('id', ticketId)

      if (error) throw error
      
      loadTickets()
    } catch (error) {
      console.error('Error assigning ticket:', error)
    }
  }

  const updateTicketStatus = async (ticketId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ status })
        .eq('id', ticketId)

      if (error) throw error
      
      loadTickets()
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status })
      }
    } catch (error) {
      console.error('Error updating ticket status:', error)
    }
  }

  const addComment = async () => {
    if (!selectedTicket || !newComment.trim()) return

    try {
      const { error } = await supabase
        .from('ticket_comments')
        .insert({
          ticket_id: selectedTicket.id,
          user_id: user.id,
          content: newComment,
          language: selectedTicket.language,
          is_internal: false
        })

      if (error) throw error
      
      setNewComment("")
      loadComments(selectedTicket.id)
    } catch (error) {
      console.error('Error adding comment:', error)
    }
  }

  const selectTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    loadComments(ticket.id)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading agent dashboard...</div>
      </div>
    )
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

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Agent Dashboard</h1>
        <p className="text-gray-600">Manage and resolve support tickets</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets List */}
        <div className="lg:col-span-1">
          <Tabs defaultValue="assigned" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="assigned">
                Assigned ({assignedTickets.length})
              </TabsTrigger>
              <TabsTrigger value="unassigned">
                Available ({unassignedTickets.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="assigned" className="space-y-4">
              {assignedTickets.map((ticket) => (
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
                      <Badge variant={ticket.status === 'open' ? 'destructive' : ticket.status === 'in_progress' ? 'default' : 'secondary'}>
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

            <TabsContent value="unassigned" className="space-y-4">
              {unassignedTickets.map((ticket) => (
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
                      <Badge variant="destructive">unassigned</Badge>
                      <Badge variant="outline">{ticket.category}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{ticket.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-400">
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </p>
                      <Button 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation()
                          assignToSelf(ticket.id)
                        }}
                      >
                        Take
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>

        {/* Ticket Details */}
        <div className="lg:col-span-2">
          {selectedTicket ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{selectedTicket.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={selectedTicket.status === 'open' ? 'destructive' : selectedTicket.status === 'in_progress' ? 'default' : 'secondary'}>
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
                {/* Description */}
                <div>
                  <h3 className="font-medium mb-2">Description</h3>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded">{selectedTicket.description}</p>
                </div>

                {/* Status Actions */}
                {selectedTicket.assigned_to === user.id && (
                  <div>
                    <h3 className="font-medium mb-2">Update Status</h3>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant={selectedTicket.status === 'in_progress' ? 'default' : 'outline'}
                        onClick={() => updateTicketStatus(selectedTicket.id, 'in_progress')}
                      >
                        In Progress
                      </Button>
                      <Button 
                        size="sm" 
                        variant={selectedTicket.status === 'resolved' ? 'default' : 'outline'}
                        onClick={() => updateTicketStatus(selectedTicket.id, 'resolved')}
                      >
                        Resolved
                      </Button>
                      <Button 
                        size="sm" 
                        variant={selectedTicket.status === 'closed' ? 'default' : 'outline'}
                        onClick={() => updateTicketStatus(selectedTicket.id, 'closed')}
                      >
                        Closed
                      </Button>
                    </div>
                  </div>
                )}

                {/* Comments */}
                <div>
                  <h3 className="font-medium mb-2">Comments</h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {comments.map((comment) => (
                      <div key={comment.id} className="bg-gray-50 p-3 rounded">
                        <p className="text-sm">{comment.content}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(comment.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add Comment */}
                {selectedTicket.assigned_to === user.id && (
                  <div>
                    <h3 className="font-medium mb-2">Add Response</h3>
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Type your response..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                      />
                      <Button onClick={addComment} disabled={!newComment.trim()}>
                        Send Response
                      </Button>
                    </div>
                  </div>
                )}
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