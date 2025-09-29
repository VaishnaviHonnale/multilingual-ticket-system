-- Fix for infinite recursion in RLS policies
-- This script fixes the problematic policies that cause infinite recursion

-- First, disable RLS temporarily to fix the policies
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE tickets DISABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
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

-- Create a function to check if user is admin (avoids recursion)
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to check if user is agent or admin
CREATE OR REPLACE FUNCTION is_agent_or_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id AND role IN ('agent', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create non-recursive policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Simplified admin policies (no recursion)
CREATE POLICY "Service role can do anything on profiles" ON profiles
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Tickets policies (simplified)
CREATE POLICY "Users can view their own tickets" ON tickets
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can create tickets" ON tickets
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own tickets" ON tickets
  FOR UPDATE USING (created_by = auth.uid());

-- Allow agents and admins to view and update all tickets
CREATE POLICY "Agents can view all tickets" ON tickets
  FOR SELECT USING (is_agent_or_admin(auth.uid()));

CREATE POLICY "Agents can update all tickets" ON tickets
  FOR UPDATE USING (is_agent_or_admin(auth.uid()));

-- Ticket comments policies
CREATE POLICY "Users can view comments on accessible tickets" ON ticket_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tickets 
      WHERE id = ticket_id 
      AND (created_by = auth.uid() OR is_agent_or_admin(auth.uid()))
    )
  );

CREATE POLICY "Users can create comments" ON ticket_comments
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Grant execute permissions on the new functions
GRANT EXECUTE ON FUNCTION is_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_agent_or_admin(UUID) TO authenticated;

-- Create a simple policy for other tables
ALTER TABLE ticket_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_classifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE speech_to_text_logs ENABLE ROW LEVEL SECURITY;

-- Simple policies for remaining tables
CREATE POLICY "Users can access their ticket attachments" ON ticket_attachments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM tickets 
      WHERE id = ticket_id 
      AND (created_by = auth.uid() OR is_agent_or_admin(auth.uid()))
    )
  );

CREATE POLICY "Users can access their ticket translations" ON ticket_translations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM tickets 
      WHERE id = ticket_id 
      AND (created_by = auth.uid() OR is_agent_or_admin(auth.uid()))
    )
  );

CREATE POLICY "Allow AI classifications" ON ai_classifications
  FOR ALL USING (true);

CREATE POLICY "Users can access their speech logs" ON speech_to_text_logs
  FOR ALL USING (user_id = auth.uid() OR is_agent_or_admin(auth.uid()));

-- Final message
SELECT 'Database policies fixed successfully! Infinite recursion resolved.' as status;