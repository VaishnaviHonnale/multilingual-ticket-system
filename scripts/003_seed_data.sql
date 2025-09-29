-- Seed data for demo purposes
-- Note: Run this after creating user accounts via the application

-- Insert sample categories (if you have a categories table)
INSERT INTO ticket_categories (name, description) VALUES
  ('technical', 'Technical issues and bugs'),
  ('billing', 'Payment and subscription issues'),
  ('feature', 'Feature requests and enhancements'),
  ('support', 'General support inquiries'),
  ('documentation', 'Documentation questions')
ON CONFLICT (name) DO NOTHING;

-- Insert some sample ticket templates
INSERT INTO ticket_templates (title, description, category, language) VALUES
  ('Login Issue', 'Unable to login to the system', 'technical', 'en'),
  ('Payment Failed', 'Payment processing failed', 'billing', 'en'),
  ('लॉगिन समस्या', 'सिस्टम में लॉगिन करने में असमर्थ', 'technical', 'hi'),
  ('பில்லிங் பிரச்சனை', 'கட்டணம் செலுத்துவதில் சிக்கல்', 'billing', 'ta')
ON CONFLICT DO NOTHING;

-- Sample notification preferences (these will be created when users register)
-- Just documenting the structure here
COMMENT ON COLUMN profiles.notification_preferences IS 'JSON object with email, sms, and in_app notification preferences';
COMMENT ON COLUMN profiles.language_preference IS 'User preferred language: en, hi, ta, te, kn';
COMMENT ON COLUMN profiles.phone_number IS 'User phone number for SMS notifications';

-- Grant necessary permissions
GRANT ALL ON ticket_categories TO authenticated;
GRANT ALL ON ticket_templates TO authenticated;
GRANT ALL ON notifications TO authenticated;