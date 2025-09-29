interface SMSOptions {
  to: string
  message: string
  language?: string
}

interface TicketData {
  id: string
  title: string
  status: string
  priority: string
}

// SMS templates in multiple languages
const SMS_TEMPLATES = {
  ticketCreated: {
    en: (ticket: TicketData) => `Ticket #${ticket.id} created: "${ticket.title}". Priority: ${ticket.priority}. We'll review it soon.`,
    hi: (ticket: TicketData) => `टिकट #${ticket.id} बनाया गया: "${ticket.title}"। प्राथमिकता: ${ticket.priority}। हम इसकी जल्द समीक्षा करेंगे।`,
    ta: (ticket: TicketData) => `டிக்கெட் #${ticket.id} உருவாக்கப்பட்டது: "${ticket.title}". முன்னுரிமை: ${ticket.priority}`,
    te: (ticket: TicketData) => `టికెట్ #${ticket.id} సృష్టించబడింది: "${ticket.title}". ప్రాధాన్యత: ${ticket.priority}`,
    kn: (ticket: TicketData) => `ಟಿಕೆಟ್ #${ticket.id} ಸೃಷ್ಟಿಸಲಾಗಿದೆ: "${ticket.title}". ಆದ್ಯತೆ: ${ticket.priority}`
  },
  ticketAssigned: {
    en: (ticket: TicketData, agentName: string) => `Ticket #${ticket.id} assigned to ${agentName}. They will contact you soon.`,
    hi: (ticket: TicketData, agentName: string) => `टिकट #${ticket.id} ${agentName} को सौंपा गया। वे जल्द आपसे संपर्क करेंगे।`
  },
  statusUpdate: {
    en: (ticket: TicketData) => `Ticket #${ticket.id} status changed to ${ticket.status}.${
      ticket.status === 'closed' ? ' Thank you!' : ' We\'re working on it.'
    }`,
    hi: (ticket: TicketData) => `टिकट #${ticket.id} स्थिति ${ticket.status} में बदल गई।${
      ticket.status === 'closed' ? ' धन्यवाद!' : ' हम इस पर काम कर रहे हैं।'
    }`
  },
  urgentAlert: {
    en: (ticket: TicketData) => `🚨 Urgent ticket #${ticket.id}: "${ticket.title}". Our team is prioritizing this issue.`,
    hi: (ticket: TicketData) => `🚨 अत्यावश्यक टिकट #${ticket.id}: "${ticket.title}"। हमारी टीम इसे प्राथमिकता दे रही है।`
  }
}

export const smsService = {
  async sendSMS(options: SMSOptions) {
    try {
      // Check if SMS notifications are enabled
      if (process.env.ENABLE_SMS_NOTIFICATIONS !== 'true') {
        console.log('SMS notifications disabled. Would send:', options)
        return { success: true, message: 'SMS notifications disabled' }
      }

      // Check if Twilio is configured
      if (
        !process.env.TWILIO_ACCOUNT_SID || 
        !process.env.TWILIO_AUTH_TOKEN ||
        !process.env.TWILIO_PHONE_NUMBER ||
        process.env.TWILIO_ACCOUNT_SID === 'your_twilio_account_sid_here'
      ) {
        console.log('SMS Service - Twilio not configured:', {
          to: options.to,
          message: options.message.substring(0, 50) + '...'
        })
        return { success: true, message: 'SMS logged (Twilio not configured)' }
      }

      // Use Twilio API
      const authHeader = Buffer.from(
        `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
      ).toString('base64')

      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${authHeader}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            To: options.to,
            From: process.env.TWILIO_PHONE_NUMBER,
            Body: options.message
          }).toString()
        }
      )

      if (response.ok) {
        const data = await response.json()
        console.log('SMS sent successfully:', data.sid)
        return { success: true, message: 'SMS sent via Twilio', sid: data.sid }
      } else {
        const error = await response.text()
        throw new Error(`Twilio error: ${error}`)
      }
    } catch (error) {
      console.error('SMS service error:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  },

  async sendTicketCreatedSMS(ticket: TicketData, userPhone: string, language = 'en') {
    const template = SMS_TEMPLATES.ticketCreated[language as keyof typeof SMS_TEMPLATES.ticketCreated] || SMS_TEMPLATES.ticketCreated.en
    
    return smsService.sendSMS({
      to: userPhone,
      message: template(ticket),
      language
    })
  },

  async sendTicketAssignedSMS(ticket: TicketData, userPhone: string, agentName: string, language = 'en') {
    const template = SMS_TEMPLATES.ticketAssigned[language as keyof typeof SMS_TEMPLATES.ticketAssigned] || SMS_TEMPLATES.ticketAssigned.en
    
    return smsService.sendSMS({
      to: userPhone,
      message: template(ticket, agentName),
      language
    })
  },

  async sendStatusUpdateSMS(ticket: TicketData, userPhone: string, language = 'en') {
    const template = SMS_TEMPLATES.statusUpdate[language as keyof typeof SMS_TEMPLATES.statusUpdate] || SMS_TEMPLATES.statusUpdate.en
    
    return smsService.sendSMS({
      to: userPhone,
      message: template(ticket),
      language
    })
  },

  async sendUrgentAlertSMS(ticket: TicketData, agentPhone: string, language = 'en') {
    const template = SMS_TEMPLATES.urgentAlert[language as keyof typeof SMS_TEMPLATES.urgentAlert] || SMS_TEMPLATES.urgentAlert.en
    
    return smsService.sendSMS({
      to: agentPhone,
      message: template(ticket),
      language
    })
  },

  // Helper function to format phone numbers
  formatPhoneNumber(phone: string, countryCode = '+1'): string {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '')
    
    // If the number doesn't start with country code, add it
    if (!phone.startsWith('+')) {
      // For Indian numbers
      if (digits.length === 10 && countryCode === '+91') {
        return `+91${digits}`
      }
      // For US numbers
      if (digits.length === 10 && countryCode === '+1') {
        return `+1${digits}`
      }
      // Return with provided country code
      return `${countryCode}${digits}`
    }
    
    return `+${digits}`
  },

  // Validate phone number
  isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^\+?[1-9]\d{10,14}$/
    return phoneRegex.test(phone.replace(/\D/g, ''))
  }
}