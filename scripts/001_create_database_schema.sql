-- Create users profile table for extended user information
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'agent', 'user')),
  department TEXT,
  language_preference TEXT DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tickets table
CREATE TABLE IF NOT EXISTS public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  category TEXT,
  language TEXT NOT NULL DEFAULT 'en',
  created_by UUID NOT NULL REFERENCES auth.users(id),
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create ticket_comments table
CREATE TABLE IF NOT EXISTS public.ticket_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  content TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'en',
  is_internal BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ticket_attachments table
CREATE TABLE IF NOT EXISTS public.ticket_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ticket_translations table for multilingual support
CREATE TABLE IF NOT EXISTS public.ticket_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_translations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for tickets
CREATE POLICY "Users can view all tickets" ON public.tickets
  FOR SELECT USING (true);

CREATE POLICY "Users can create tickets" ON public.tickets
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own tickets or assigned tickets" ON public.tickets
  FOR UPDATE USING (
    auth.uid() = created_by OR 
    auth.uid() = assigned_to OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'agent')
    )
  );

-- RLS Policies for ticket_comments
CREATE POLICY "Users can view comments on tickets they can see" ON public.ticket_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tickets 
      WHERE id = ticket_id
    )
  );

CREATE POLICY "Users can create comments" ON public.ticket_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for ticket_attachments
CREATE POLICY "Users can view attachments on tickets they can see" ON public.ticket_attachments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tickets 
      WHERE id = ticket_id
    )
  );

CREATE POLICY "Users can upload attachments" ON public.ticket_attachments
  FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

-- RLS Policies for ticket_translations
CREATE POLICY "Users can view all translations" ON public.ticket_translations
  FOR SELECT USING (true);

CREATE POLICY "Admins and agents can manage translations" ON public.ticket_translations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'agent')
    )
  );
