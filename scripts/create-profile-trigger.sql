-- Create profile trigger function and trigger
-- Run this after the main database setup

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

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon;

SELECT 'Profile trigger created successfully!' as status;