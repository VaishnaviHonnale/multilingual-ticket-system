import { emailService } from "./email-service"
import { smsService } from "./sms-service"
import { createClient } from "@/lib/supabase/client"

interface NotificationOptions {
  type: 'ticket_created' | 'ticket_assigned' | 'ticket_status_changed' | 'ticket_commented' | 'ticket_closed'
  ticketId: string
  userId?: string
  data?: any
}

export const notificationService = {
  // Helper to get user details and preferences
  async getUserNotificationPreferences(userId: string) {
    try {
      const supabase = await createClient()
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, phone_number, language_preference, notification_preferences')
        .eq('id', userId)
        .single()
      
      return profile || null
    } catch (error) {
      console.error('Error fetching user preferences:', error)
      return null
    }
  },

  // Create in-app notification
  async createInAppNotification(userId: string, title: string, message: string, ticketId?: string) {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title,
          message,
          ticket_id: ticketId,
          type: 'info',
          read: false
        })
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating in-app notification:', error)
      return null
    }
  },

  async notifyTicketCreated(ticketId: string, ticket: any) {
    try {
      // Get creator's details
      const userProfile = await this.getUserNotificationPreferences(ticket.created_by)
      if (!userProfile) return

      const ticketData = {
        id: ticketId,
        title: ticket.title,
        description: ticket.description,
        status: ticket.status || 'new',
        priority: ticket.priority || 'medium',
        category: ticket.category,
        language: ticket.language || userProfile.language_preference || 'en'
      }

      // Send in-app notification
      await this.createInAppNotification(
        ticket.created_by,
        `Ticket #${ticketId} Created`,
        `Your ticket "${ticket.title}" has been created successfully.`,
        ticketId
      )

      // Send email notification
      if (userProfile.email) {
        await emailService.sendTicketCreatedEmail(ticketData, userProfile.email)
      }

      // Send SMS notification for high priority tickets
      if (userProfile.phone_number && (ticket.priority === 'urgent' || ticket.priority === 'critical')) {
        await smsService.sendTicketCreatedSMS(
          ticketData,
          userProfile.phone_number,
          userProfile.language_preference || 'en'
        )
      }

      // Notify agents about urgent tickets
      if (ticket.priority === 'urgent' || ticket.priority === 'critical') {
        await this.notifyAgentsAboutUrgentTicket(ticketId, ticketData)
      }

      console.log(`Notifications sent for ticket #${ticketId} created`)
    } catch (error) {
      console.error('Error in notifyTicketCreated:', error)
    }
  },

  async notifyTicketAssigned(ticketId: string, assigneeId: string) {
    try {
      const supabase = await createClient()
      
      // Get ticket details
      const { data: ticket } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', ticketId)
        .single()
      
      if (!ticket) return

      // Get assignee details
      const assigneeProfile = await this.getUserNotificationPreferences(assigneeId)
      if (!assigneeProfile) return

      const ticketData = {
        id: ticketId,
        title: ticket.title,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        category: ticket.category
      }

      // Send in-app notification
      await this.createInAppNotification(
        assigneeId,
        `New Ticket Assigned`,
        `You have been assigned ticket #${ticketId}: "${ticket.title}"`,
        ticketId
      )

      // Send email notification
      if (assigneeProfile.email) {
        await emailService.sendTicketAssignedEmail(ticketData, assigneeProfile.email)
      }

      // Send SMS for urgent tickets
      if (assigneeProfile.phone_number && (ticket.priority === 'urgent' || ticket.priority === 'critical')) {
        await smsService.sendUrgentAlertSMS(
          ticketData,
          assigneeProfile.phone_number,
          assigneeProfile.language_preference || 'en'
        )
      }

      console.log(`Assignment notifications sent for ticket #${ticketId}`)
    } catch (error) {
      console.error('Error in notifyTicketAssigned:', error)
    }
  },

  async notifyTicketStatusChanged(ticketId: string, newStatus: string, oldStatus: string) {
    try {
      const supabase = await createClient()
      
      // Get ticket details
      const { data: ticket } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', ticketId)
        .single()
      
      if (!ticket) return

      // Get creator's details
      const userProfile = await this.getUserNotificationPreferences(ticket.created_by)
      if (!userProfile) return

      const ticketData = {
        id: ticketId,
        title: ticket.title,
        status: newStatus,
        priority: ticket.priority
      }

      // Send in-app notification
      await this.createInAppNotification(
        ticket.created_by,
        `Ticket Status Updated`,
        `Ticket #${ticketId} status changed from ${oldStatus} to ${newStatus}`,
        ticketId
      )

      // Send email notification
      if (userProfile.email) {
        await emailService.sendTicketStatusUpdateEmail(
          { ...ticketData, description: ticket.description, category: ticket.category },
          userProfile.email,
          oldStatus
        )
      }

      // Send SMS for important status changes
      if (userProfile.phone_number && (newStatus === 'closed' || newStatus === 'resolved')) {
        await smsService.sendStatusUpdateSMS(
          ticketData,
          userProfile.phone_number,
          userProfile.language_preference || 'en'
        )
      }

      console.log(`Status change notifications sent for ticket #${ticketId}`)
    } catch (error) {
      console.error('Error in notifyTicketStatusChanged:', error)
    }
  },

  async notifyTicketCommented(ticketId: string, commentId: string, userId: string) {
    try {
      const supabase = await createClient()
      
      // Get ticket and comment details
      const { data: ticket } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', ticketId)
        .single()
      
      const { data: comment } = await supabase
        .from('comments')
        .select('*')
        .eq('id', commentId)
        .single()
      
      if (!ticket || !comment) return

      // Get commenter details
      const { data: commenter } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', userId)
        .single()

      // Notify ticket creator if someone else commented
      if (ticket.created_by !== userId) {
        const creatorProfile = await this.getUserNotificationPreferences(ticket.created_by)
        if (creatorProfile) {
          // Send in-app notification
          await this.createInAppNotification(
            ticket.created_by,
            `New Comment on Ticket`,
            `${commenter?.full_name || 'Someone'} commented on ticket #${ticketId}`,
            ticketId
          )

          // Send email notification
          if (creatorProfile.email) {
            await emailService.sendTicketCommentEmail(
              {
                id: ticketId,
                title: ticket.title,
                status: ticket.status,
                priority: ticket.priority
              },
              creatorProfile.email,
              comment.content,
              commenter?.full_name || 'Support Agent'
            )
          }
        }
      }

      // Notify assigned agent if someone else commented
      if (ticket.assigned_to && ticket.assigned_to !== userId) {
        const agentProfile = await this.getUserNotificationPreferences(ticket.assigned_to)
        if (agentProfile) {
          await this.createInAppNotification(
            ticket.assigned_to,
            `New Comment on Assigned Ticket`,
            `${commenter?.full_name || 'Someone'} commented on ticket #${ticketId}`,
            ticketId
          )
        }
      }

      console.log(`Comment notifications sent for ticket #${ticketId}`)
    } catch (error) {
      console.error('Error in notifyTicketCommented:', error)
    }
  },

  // Helper to notify all available agents about urgent tickets
  async notifyAgentsAboutUrgentTicket(ticketId: string, ticketData: any) {
    try {
      const supabase = await createClient()
      
      // Get all agents and admins
      const { data: agents } = await supabase
        .from('profiles')
        .select('id, email, phone_number, language_preference')
        .in('role', ['agent', 'admin'])
      
      if (!agents || agents.length === 0) return

      // Send notifications to all agents
      for (const agent of agents) {
        // Create in-app notification
        await this.createInAppNotification(
          agent.id,
          `🚨 Urgent Ticket Alert`,
          `Urgent ticket #${ticketId}: "${ticketData.title}" requires immediate attention`,
          ticketId
        )

        // Send SMS alert for urgent tickets
        if (agent.phone_number) {
          await smsService.sendUrgentAlertSMS(
            ticketData,
            agent.phone_number,
            agent.language_preference || 'en'
          )
        }
      }

      console.log(`Urgent ticket alerts sent to ${agents.length} agents`)
    } catch (error) {
      console.error('Error notifying agents about urgent ticket:', error)
    }
  },

  // Mark notifications as read
  async markNotificationsAsRead(notificationIds: string[]) {
    try {
      const supabase = await createClient()
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .in('id', notificationIds)
      
      if (error) throw error
      return true
    } catch (error) {
      console.error('Error marking notifications as read:', error)
      return false
    }
  },

  // Get unread notification count
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const supabase = await createClient()
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false)
      
      if (error) throw error
      return count || 0
    } catch (error) {
      console.error('Error getting unread count:', error)
      return 0
    }
  }
}