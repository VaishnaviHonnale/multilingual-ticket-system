-- Multilingual Ticket Management System Database Setup
-- This script sets up all necessary tables, policies, and functions
-- Safe to run multiple times - handles existing objects gracefully

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (if not exists)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'agent', 'user')),
  department TEXT,
  language_preference TEXT NOT NULL DEFAULT 'en' CHECK (language_preference IN ('en', 'hi', 'ta', 'te', 'kn')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to profiles if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'department') THEN
    ALTER TABLE profiles ADD COLUMN department TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'language_preference') THEN
    ALTER TABLE profiles ADD COLUMN language_preference TEXT NOT NULL DEFAULT 'en' CHECK (language_preference IN ('en', 'hi', 'ta', 'te', 'kn'));
  END IF;
END $$;

-- Create tickets table (if not exists)
CREATE TABLE IF NOT EXISTS tickets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent', 'critical')),
  category TEXT CHECK (category IN ('technical', 'billing', 'general', 'feature', 'bug', 'support', 'other')),
  language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'hi', 'ta', 'te', 'kn')),
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Add missing columns to tickets if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tickets' AND column_name = 'language') THEN
    ALTER TABLE tickets ADD COLUMN language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'hi', 'ta', 'te', 'kn'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tickets' AND column_name = 'resolved_at') THEN
    ALTER TABLE tickets ADD COLUMN resolved_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Create ticket_comments table
CREATE TABLE IF NOT EXISTS ticket_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'hi', 'ta', 'te', 'kn')),
  is_internal BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ticket_attachments table
CREATE TABLE IF NOT EXISTS ticket_attachments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE NOT NULL,
  filename TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ticket_translations table for multilingual support
CREATE TABLE IF NOT EXISTS ticket_translations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE NOT NULL,
  language TEXT NOT NULL CHECK (language IN ('en', 'hi', 'ta', 'te', 'kn')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(ticket_id, language)
);

-- Create notifications table (if not exists)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  read BOOLEAN DEFAULT FALSE,
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ai_classifications table to track AI performance
CREATE TABLE IF NOT EXISTS ai_classifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE NOT NULL,
  predicted_category TEXT,
  predicted_priority TEXT,
  confidence DECIMAL(3,2),
  reasoning TEXT,
  language_detected TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create speech_to_text_logs table to track usage
CREATE TABLE IF NOT EXISTS speech_to_text_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  confidence DECIMAL(3,2),
  transcript_length INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tickets_created_by ON tickets(created_by);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to ON tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority);
CREATE INDEX IF NOT EXISTS idx_tickets_language ON tickets(language);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at);
CREATE INDEX IF NOT EXISTS idx_ticket_comments_ticket_id ON ticket_comments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist, then recreate them
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_tickets_updated_at ON tickets;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically set resolved_at when status changes to resolved/closed
CREATE OR REPLACE FUNCTION set_resolved_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IN ('resolved', 'closed') AND OLD.status NOT IN ('resolved', 'closed') THEN
    NEW.resolved_at = NOW();
  ELSIF NEW.status NOT IN ('resolved', 'closed') THEN
    NEW.resolved_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists, then recreate
DROP TRIGGER IF EXISTS set_ticket_resolved_at ON tickets;

CREATE TRIGGER set_ticket_resolved_at BEFORE UPDATE ON tickets
  FOR EACH ROW EXECUTE FUNCTION set_resolved_at();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_classifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE speech_to_text_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then recreate them
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view their own tickets" ON tickets;
DROP POLICY IF EXISTS "Agents can view assigned tickets" ON tickets;
DROP POLICY IF EXISTS "Users can create tickets" ON tickets;
DROP POLICY IF EXISTS "Agents can update tickets" ON tickets;
DROP POLICY IF EXISTS "Users can view comments on their tickets" ON ticket_comments;
DROP POLICY IF EXISTS "Users can create comments" ON ticket_comments;
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Tickets policies
CREATE POLICY "Users can view their own tickets" ON tickets
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Agents can view assigned tickets" ON tickets
  FOR SELECT USING (
    assigned_to = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('agent', 'admin')
    )
  );

CREATE POLICY "Users can create tickets" ON tickets
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Agents can update tickets" ON tickets
  FOR UPDATE USING (
    assigned_to = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('agent', 'admin')
    )
  );

-- Ticket comments policies
CREATE POLICY "Users can view comments on their tickets" ON ticket_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tickets 
      WHERE id = ticket_id AND created_by = auth.uid()
    ) OR
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('agent', 'admin')
    )
  );

CREATE POLICY "Users can create comments" ON ticket_comments
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT := 'user';
BEGIN
  -- Check if this is the first user (make them admin)
  IF NOT EXISTS (SELECT 1 FROM public.profiles LIMIT 1) THEN
    user_role := 'admin';
  END IF;

  INSERT INTO public.profiles (id, email, full_name, role, language_preference)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    user_role,
    COALESCE(NEW.raw_user_meta_data->>'language_preference', 'en')
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Note: Sample data will be created when users register through the application
-- The first user to register will automatically become an admin

-- Create function to get ticket statistics
CREATE OR REPLACE FUNCTION get_ticket_stats(user_role TEXT DEFAULT 'user', user_id UUID DEFAULT auth.uid())
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  IF user_role = 'admin' THEN
    SELECT json_build_object(
      'total', COUNT(*),
      'open', COUNT(*) FILTER (WHERE status = 'open'),
      'in_progress', COUNT(*) FILTER (WHERE status = 'in_progress'),
      'resolved', COUNT(*) FILTER (WHERE status IN ('resolved', 'closed')),
      'by_priority', json_build_object(
        'low', COUNT(*) FILTER (WHERE priority = 'low'),
        'medium', COUNT(*) FILTER (WHERE priority = 'medium'),
        'high', COUNT(*) FILTER (WHERE priority = 'high'),
        'urgent', COUNT(*) FILTER (WHERE priority = 'urgent'),
        'critical', COUNT(*) FILTER (WHERE priority = 'critical')
      ),
      'by_language', json_build_object(
        'en', COUNT(*) FILTER (WHERE language = 'en'),
        'hi', COUNT(*) FILTER (WHERE language = 'hi'),
        'ta', COUNT(*) FILTER (WHERE language = 'ta'),
        'te', COUNT(*) FILTER (WHERE language = 'te'),
        'kn', COUNT(*) FILTER (WHERE language = 'kn')
      )
    ) INTO result
    FROM tickets;
  ELSE
    SELECT json_build_object(
      'total', COUNT(*),
      'open', COUNT(*) FILTER (WHERE status = 'open'),
      'in_progress', COUNT(*) FILTER (WHERE status = 'in_progress'),
      'resolved', COUNT(*) FILTER (WHERE status IN ('resolved', 'closed'))
    ) INTO result
    FROM tickets
    WHERE created_by = user_id;
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_type TEXT DEFAULT 'info',
  p_ticket_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, title, message, type, ticket_id)
  VALUES (p_user_id, p_title, p_message, p_type, p_ticket_id)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to automatically notify on ticket status changes
CREATE OR REPLACE FUNCTION notify_ticket_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify ticket creator
  IF OLD.status != NEW.status THEN
    PERFORM create_notification(
      NEW.created_by,
      'Ticket Status Updated',
      'Your ticket "' || NEW.title || '" status changed from ' || OLD.status || ' to ' || NEW.status,
      'info',
      NEW.id
    );
  END IF;
  
  -- Notify assigned agent if different from creator
  IF NEW.assigned_to IS NOT NULL AND NEW.assigned_to != NEW.created_by AND OLD.status != NEW.status THEN
    PERFORM create_notification(
      NEW.assigned_to,
      'Assigned Ticket Updated',
      'Ticket "' || NEW.title || '" status changed to ' || NEW.status,
      'info',
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists, then recreate
DROP TRIGGER IF EXISTS notify_on_ticket_status_change ON tickets;

CREATE TRIGGER notify_on_ticket_status_change
  AFTER UPDATE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION notify_ticket_status_change();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Create view for ticket analytics
CREATE OR REPLACE VIEW ticket_analytics AS
SELECT 
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as total_tickets,
  COUNT(*) FILTER (WHERE status = 'open') as open_tickets,
  COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_tickets,
  COUNT(*) FILTER (WHERE status = 'resolved') as resolved_tickets,
  COUNT(*) FILTER (WHERE status = 'closed') as closed_tickets,
  COUNT(*) FILTER (WHERE priority = 'critical') as critical_tickets,
  COUNT(*) FILTER (WHERE priority = 'urgent') as urgent_tickets,
  AVG(CASE 
    WHEN resolved_at IS NOT NULL 
    THEN EXTRACT(EPOCH FROM (resolved_at - created_at))/3600 
    ELSE NULL 
  END) as avg_resolution_hours
FROM tickets
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

COMMENT ON TABLE profiles IS 'User profiles with role-based access control';
COMMENT ON TABLE tickets IS 'Support tickets with multilingual support';
COMMENT ON TABLE ticket_comments IS 'Comments on tickets with internal/external visibility';
COMMENT ON TABLE notifications IS 'User notifications for ticket updates';
COMMENT ON TABLE ai_classifications IS 'AI classification results for performance tracking';
COMMENT ON TABLE speech_to_text_logs IS 'Speech-to-text usage analytics';

-- Final message
SELECT 'Database setup completed successfully! All tables, policies, and functions have been created.' as status;