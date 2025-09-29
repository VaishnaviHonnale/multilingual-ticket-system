-- Add environment variable for Groq API key
-- This will be handled by the environment variables in the project settings
-- GROQ_API_KEY = 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

-- Ensure all necessary tables exist and have proper indexes
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to ON tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_ticket_comments_ticket_id ON ticket_comments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
