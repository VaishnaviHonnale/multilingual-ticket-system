interface EmailOptions {
  to: string
  subject: string
  html?: string
  text?: string
  language?: string
}

interface TicketData {
  id: string
  title: string
  description?: string
  status: string
  priority: string
  category?: string
  language?: string
}

// Email templates in multiple languages
const EMAIL_TEMPLATES = {
  ticketCreated: {
    en: {
      subject: (id: string, title: string) => `Ticket #${id} Created: ${title}`,
      html: (ticket: TicketData) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Your ticket has been created</h2>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px;">
            <p><strong>Ticket ID:</strong> #${ticket.id}</p>
            <p><strong>Title:</strong> ${ticket.title}</p>
            <p><strong>Status:</strong> ${ticket.status}</p>
            <p><strong>Priority:</strong> <span style="color: ${ticket.priority === 'urgent' ? 'red' : ticket.priority === 'high' ? 'orange' : 'green'}">${ticket.priority}</span></p>
            ${ticket.category ? `<p><strong>Category:</strong> ${ticket.category}</p>` : ''}
          </div>
          <p style="margin-top: 20px;">We will review your ticket and get back to you soon.</p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">This is an automated message. Please do not reply to this email.</p>
        </div>
      `
    },
    hi: {
      subject: (id: string, title: string) => `टिकट #${id} बनाया गया: ${title}`,
      html: (ticket: TicketData) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">आपका टिकट बनाया गया है</h2>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px;">
            <p><strong>टिकट आईडी:</strong> #${ticket.id}</p>
            <p><strong>शीर्षक:</strong> ${ticket.title}</p>
            <p><strong>स्थिति:</strong> ${ticket.status}</p>
            <p><strong>प्राथमिकता:</strong> ${ticket.priority}</p>
          </div>
          <p style="margin-top: 20px;">हम आपके टिकट की समीक्षा करेंगे और जल्द ही आपसे संपर्क करेंगे।</p>
        </div>
      `
    }
  },
  ticketAssigned: {
    en: {
      subject: (title: string) => `New Ticket Assigned: ${title}`,
      html: (ticket: TicketData) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">You have been assigned a new ticket</h2>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px;">
            <p><strong>Ticket ID:</strong> #${ticket.id}</p>
            <p><strong>Title:</strong> ${ticket.title}</p>
            <p><strong>Priority:</strong> <span style="color: ${ticket.priority === 'urgent' ? 'red' : ticket.priority === 'high' ? 'orange' : 'green'}">${ticket.priority}</span></p>
            <p><strong>Category:</strong> ${ticket.category || 'General'}</p>
            ${ticket.description ? `<p><strong>Description:</strong> ${ticket.description}</p>` : ''}
          </div>
          <p style="margin-top: 20px;">Please review and respond to this ticket promptly.</p>
        </div>
      `
    }
  },
  statusUpdate: {
    en: {
      subject: (id: string) => `Ticket #${id} Status Updated`,
      html: (ticket: TicketData, oldStatus: string) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Your ticket status has been updated</h2>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px;">
            <p><strong>Ticket ID:</strong> #${ticket.id}</p>
            <p><strong>Title:</strong> ${ticket.title}</p>
            <p><strong>Previous Status:</strong> ${oldStatus}</p>
            <p><strong>New Status:</strong> <strong style="color: #007bff;">${ticket.status}</strong></p>
          </div>
          ${ticket.status === 'closed' ? 
            '<p style="margin-top: 20px; color: green;">Your ticket has been resolved. Thank you for your patience.</p>' : 
            '<p style="margin-top: 20px;">We are continuing to work on your request.</p>'
          }
        </div>
      `
    }
  }
}

export const emailService = {
  async sendEmail(options: EmailOptions) {
    try {
      // Check if email notifications are enabled
      if (process.env.ENABLE_EMAIL_NOTIFICATIONS !== 'true') {
        console.log('Email notifications disabled. Would send:', options)
        return { success: true, message: 'Email notifications disabled' }
      }

      // Use SendGrid API if configured
      if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY !== 'your_sendgrid_api_key_here') {
        const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            personalizations: [{ to: [{ email: options.to }] }],
            from: {
              email: process.env.SENDGRID_FROM_EMAIL || 'noreply@ticketsystem.com',
              name: process.env.SENDGRID_FROM_NAME || 'Ticket Support System'
            },
            subject: options.subject,
            content: [
              { type: 'text/plain', value: options.text || 'Please view this email in HTML' },
              { type: 'text/html', value: options.html || options.text || '' }
            ]
          })
        })

        if (response.ok) {
          return { success: true, message: 'Email sent via SendGrid' }
        } else {
          throw new Error(`SendGrid error: ${response.statusText}`)
        }
      }

      // Use Resend API as alternative
      if (process.env.RESEND_API_KEY) {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: process.env.SENDGRID_FROM_EMAIL || 'noreply@ticketsystem.com',
            to: options.to,
            subject: options.subject,
            html: options.html || options.text || ''
          })
        })

        if (response.ok) {
          return { success: true, message: 'Email sent via Resend' }
        }
      }

      // Fallback: Log email for development
      console.log('Email Service - Development Mode:', {
        to: options.to,
        subject: options.subject,
        preview: (options.text || options.html || '').substring(0, 100) + '...'
      })

      return { success: true, message: 'Email logged (development mode)' }
    } catch (error) {
      console.error('Email service error:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  },

  async sendTicketCreatedEmail(ticket: TicketData, userEmail: string) {
    const lang = ticket.language || 'en'
    const template = EMAIL_TEMPLATES.ticketCreated[lang as keyof typeof EMAIL_TEMPLATES.ticketCreated] || EMAIL_TEMPLATES.ticketCreated.en
    
    return emailService.sendEmail({
      to: userEmail,
      subject: template.subject(ticket.id, ticket.title),
      html: template.html(ticket),
      language: lang
    })
  },

  async sendTicketAssignedEmail(ticket: TicketData, agentEmail: string) {
    const template = EMAIL_TEMPLATES.ticketAssigned.en
    
    return emailService.sendEmail({
      to: agentEmail,
      subject: template.subject(ticket.title),
      html: template.html(ticket)
    })
  },

  async sendTicketStatusUpdateEmail(ticket: TicketData, userEmail: string, oldStatus: string) {
    const template = EMAIL_TEMPLATES.statusUpdate.en
    
    return emailService.sendEmail({
      to: userEmail,
      subject: template.subject(ticket.id),
      html: template.html(ticket, oldStatus)
    })
  },

  async sendTicketCommentEmail(ticket: TicketData, userEmail: string, comment: string, commenterName: string) {
    return emailService.sendEmail({
      to: userEmail,
      subject: `New comment on Ticket #${ticket.id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New comment on your ticket</h2>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px;">
            <p><strong>Ticket:</strong> ${ticket.title}</p>
            <p><strong>Comment by:</strong> ${commenterName}</p>
            <div style="background: white; padding: 15px; border-left: 3px solid #007bff; margin-top: 10px;">
              ${comment}
            </div>
          </div>
          <p style="margin-top: 20px;">Login to view and respond to this comment.</p>
        </div>
      `
    })
  }
}
