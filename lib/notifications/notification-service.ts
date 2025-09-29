import { createClient } from "@/lib/supabase/client"
import { emailService } from "./email-service"

interface CreateNotificationParams {
  userId: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  ticketId?: string
  sendEmail?: boolean
  emailTemplate?: string
  emailVariables?: Record<string, any>
}

export class NotificationService {
  private supabase = createClient()

  async createNotification({
    userId,
    title,
    message,
    type,
    ticketId,
    sendEmail = false,
    emailTemplate,
    emailVariables = {},
  }: CreateNotificationParams): Promise<boolean> {
    try {
      // Create in-app notification
      const { error: dbError } = await this.supabase.from("notifications").insert({
        user_id: userId,
        title,
        message,
        type,
        ticket_id: ticketId,
        read: false,
      })

      if (dbError) {
        console.error("Failed to create notification:", dbError)
        return false
      }

      // Send email notification if requested
      if (sendEmail && emailTemplate) {
        const { data: user } = await this.supabase
          .from("profiles")
          .select("email, email_notifications")
          .eq("id", userId)
          .single()

        if (user?.email && user.email_notifications) {
          await emailService.sendNotification(emailTemplate, user.email, emailVariables)
        }
      }

      return true
    } catch (error) {
      console.error("Failed to create notification:", error)
      return false
    }
  }

  async notifyTicketCreated(ticketId: string, ticket: any): Promise<void> {
    // Notify assigned agent
    if (ticket.assigned_to) {
      await this.createNotification({
        userId: ticket.assigned_to,
        title: "New Ticket Assigned",
        message: `You have been assigned ticket: ${ticket.title}`,
        type: "info",
        ticketId,
        sendEmail: true,
        emailTemplate: "ticket_created",
        emailVariables: {
          title: ticket.title,
          priority: ticket.priority,
          category: ticket.category,
          description: ticket.description,
          ticketUrl: `${process.env.NEXT_PUBLIC_APP_URL}/tickets/${ticketId}`,
        },
      })
    }

    // Notify admins
    const { data: admins } = await this.supabase.from("profiles").select("id").eq("role", "admin")

    if (admins) {
      for (const admin of admins) {
        await this.createNotification({
          userId: admin.id,
          title: "New Ticket Created",
          message: `New ticket created: ${ticket.title}`,
          type: "info",
          ticketId,
        })
      }
    }
  }

  async notifyTicketUpdated(ticketId: string, ticket: any, updatedBy: string): Promise<void> {
    // Notify ticket creator
    if (ticket.created_by !== updatedBy) {
      await this.createNotification({
        userId: ticket.created_by,
        title: "Ticket Updated",
        message: `Your ticket "${ticket.title}" has been updated`,
        type: "info",
        ticketId,
        sendEmail: true,
        emailTemplate: "ticket_updated",
        emailVariables: {
          title: ticket.title,
          status: ticket.status,
          updatedBy: "Support Team",
          ticketUrl: `${process.env.NEXT_PUBLIC_APP_URL}/tickets/${ticketId}`,
        },
      })
    }

    // Notify assigned agent if different from updater
    if (ticket.assigned_to && ticket.assigned_to !== updatedBy) {
      await this.createNotification({
        userId: ticket.assigned_to,
        title: "Assigned Ticket Updated",
        message: `Ticket "${ticket.title}" has been updated`,
        type: "info",
        ticketId,
      })
    }
  }

  async notifyTicketStatusChanged(ticketId: string, ticket: any, newStatus: string): Promise<void> {
    const statusMessages = {
      open: "Your ticket has been opened and is being reviewed",
      in_progress: "Work has started on your ticket",
      resolved: "Your ticket has been resolved",
      closed: "Your ticket has been closed",
    }

    const message = statusMessages[newStatus as keyof typeof statusMessages] || "Your ticket status has been updated"

    await this.createNotification({
      userId: ticket.created_by,
      title: "Ticket Status Updated",
      message: `${ticket.title}: ${message}`,
      type: newStatus === "resolved" ? "success" : "info",
      ticketId,
      sendEmail: true,
      emailTemplate: "ticket_updated",
      emailVariables: {
        title: ticket.title,
        status: newStatus,
        updatedBy: "Support Team",
        ticketUrl: `${process.env.NEXT_PUBLIC_APP_URL}/tickets/${ticketId}`,
      },
    })
  }
}

export const notificationService = new NotificationService()
