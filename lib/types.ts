export interface Profile {
  id: string
  email: string
  full_name?: string
  role: "admin" | "agent" | "user"
  department?: string
  language_preference: string
  created_at: string
  updated_at: string
}

export interface Ticket {
  id: string
  title: string
  description: string
  status: "open" | "in_progress" | "resolved" | "closed"
  priority: "low" | "medium" | "high" | "urgent"
  category?: string
  language: string
  created_by: string
  assigned_to?: string
  created_at: string
  updated_at: string
  resolved_at?: string
  profiles?: Profile
  assigned_profile?: Profile
}

export interface TicketComment {
  id: string
  ticket_id: string
  user_id: string
  content: string
  language: string
  is_internal: boolean
  created_at: string
  profiles?: Profile
}

export interface TicketAttachment {
  id: string
  ticket_id: string
  filename: string
  file_url: string
  file_size?: number
  mime_type?: string
  uploaded_by: string
  created_at: string
}

export interface TicketTranslation {
  id: string
  ticket_id: string
  language: string
  title: string
  description: string
  created_at: string
}
