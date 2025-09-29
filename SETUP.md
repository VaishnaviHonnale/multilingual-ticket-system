# Complete Setup Guide - Multilingual AI Ticket Management System

This guide will walk you through setting up the complete MVP from scratch.

## 🎯 Overview

This system provides:
- ✅ Multilingual ticket management (English, Hindi, Tamil, Telugu, Kannada)
- ✅ AI-powered classification using Groq AI
- ✅ Speech-to-text ticket creation
- ✅ Role-based access control (Admin, Agent, User)
- ✅ Real-time notifications
- ✅ Comprehensive analytics dashboard
- ✅ AI chatbot for user assistance

## 📋 Prerequisites

Before starting, ensure you have:
- Node.js 18+ installed
- npm, yarn, or pnpm package manager
- A Supabase account (free tier works)
- A Groq AI API key (free tier available)
- Modern web browser with speech recognition support

## 🚀 Step-by-Step Setup

### Step 1: Clone and Install Dependencies

```bash
# Clone the repository
git clone <your-repo-url>
cd multilingual-ticket-system

# Install dependencies
npm install

# Or if you prefer yarn/pnpm
yarn install
# pnpm install
```

### Step 2: Set Up Supabase Database

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose organization and enter project details
   - Wait for project to be ready

2. **Get Your Supabase Credentials**
   - Go to Settings > API
   - Copy the Project URL and anon public key
   - Save these for the environment variables

3. **Set Up the Database Schema**
   - Go to SQL Editor in Supabase dashboard
   - Copy and paste the contents of `scripts/setup-database.sql`
   - Click "Run" to execute the script
   - This creates all tables, policies, and sample data

### Step 3: Get Groq AI API Key

1. **Sign Up for Groq**
   - Go to [console.groq.com](https://console.groq.com)
   - Create an account
   - Navigate to API Keys section
   - Create a new API key
   - Copy the key (starts with `gsk_`)

### Step 4: Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Groq AI Configuration
GROQ_API_KEY=gsk_your_groq_api_key_here
```

**Important**: Replace the placeholder values with your actual credentials.

### Step 5: Configure Supabase Authentication

1. **Set Up Auth URLs**
   - In Supabase Dashboard, go to Authentication > URL Configuration
   - Add `http://localhost:3000` to Site URL
   - Add `http://localhost:3000/auth/callback` to Redirect URLs

2. **Configure Email Templates (Optional)**
   - Go to Authentication > Email Templates
   - Customize the email templates if needed

### Step 6: Start the Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## 🧪 Testing the Setup

### 1. Test Basic Functionality

1. **Visit the Homepage**
   - Go to `http://localhost:3000`
   - You should see the welcome page

2. **Create an Account**
   - Click "Create Account"
   - Fill in the registration form
   - Choose your preferred language
   - Submit the form

3. **Sign In**
   - Use the credentials you just created
   - Or use demo accounts (see below)

### 2. Demo Accounts

The setup script creates these demo accounts:

```
Admin Account:
Email: admin@example.com
Password: password123

Agent Account:
Email: agent@example.com
Password: password123

User Account:
Email: user@example.com
Password: password123
```

### 3. Test Core Features

1. **Create a Ticket**
   - Sign in as a user
   - Click "New Ticket"
   - Fill in title and description
   - Try the voice input feature
   - Submit the ticket

2. **Test AI Classification**
   - Create tickets with different content
   - Check if AI correctly categorizes them
   - Verify priority assignment

3. **Test Admin Dashboard**
   - Sign in as admin
   - Go to `/admin`
   - Check analytics and user management

4. **Test AI Chatbot**
   - Click the chat widget in bottom-right
   - Ask questions about the system
   - Test multilingual responses

## 🌐 Language Testing

Test the multilingual features:

1. **UI Language Switching**
   - Use the language switcher in the header
   - Verify UI translates correctly

2. **Multilingual Ticket Creation**
   - Create tickets in different languages
   - Test speech-to-text in various languages
   - Verify AI classification works

3. **Supported Languages**
   - English (en)
   - Hindi (hi) - हिंदी
   - Tamil (ta) - தமிழ்
   - Telugu (te) - తెలుగు
   - Kannada (kn) - ಕನ್ನಡ

## 🎤 Speech-to-Text Testing

1. **Browser Compatibility**
   - Works best in Chrome/Chromium browsers
   - Limited support in Firefox and Safari

2. **Test Voice Input**
   - Click microphone icon in ticket form
   - Allow microphone permissions
   - Speak clearly in your chosen language
   - Verify transcription accuracy

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Issues**
   ```
   Error: Invalid API key or URL
   ```
   - Verify Supabase URL and key in `.env.local`
   - Check if the project is active in Supabase

2. **AI Classification Not Working**
   ```
   Error: Groq API error
   ```
   - Verify GROQ_API_KEY in `.env.local`
   - Check API key permissions in Groq console

3. **Speech Recognition Not Working**
   - Ensure you're using a supported browser
   - Check microphone permissions
   - Try HTTPS in production

4. **Authentication Issues**
   - Verify redirect URLs in Supabase Auth settings
   - Check if email confirmation is required

### Debug Mode

Enable debug logging by adding to `.env.local`:
```env
NODE_ENV=development
DEBUG=true
```

## 🚀 Production Deployment

### Vercel Deployment (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial setup"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables in Vercel dashboard
   - Deploy

3. **Update Supabase URLs**
   - Add your production URL to Supabase Auth settings
   - Update `NEXT_PUBLIC_APP_URL` to your production domain

### Environment Variables for Production

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
GROQ_API_KEY=gsk_your_groq_api_key_here
```

## 📊 Performance Optimization

### Database Optimization
- The setup script includes proper indexes
- Row Level Security is configured
- Connection pooling is handled by Supabase

### Frontend Optimization
- Next.js automatic code splitting
- Image optimization with Next.js Image
- Lazy loading of components

### AI API Optimization
- Request caching for similar queries
- Fallback to keyword-based classification
- Rate limiting to prevent abuse

## 🔒 Security Checklist

- ✅ Environment variables are secure
- ✅ Row Level Security enabled in database
- ✅ Input validation on all forms
- ✅ Authentication required for sensitive operations
- ✅ CORS properly configured
- ✅ API rate limiting implemented

## 📈 Monitoring and Analytics

### Built-in Analytics
- Ticket statistics and trends
- AI classification accuracy
- Speech-to-text usage metrics
- User activity tracking

### External Monitoring (Optional)
- Add Vercel Analytics
- Set up Sentry for error tracking
- Configure Supabase monitoring

## 🎉 Success Criteria

Your setup is successful when:

1. ✅ You can create and sign in to accounts
2. ✅ Tickets can be created via text and voice
3. ✅ AI classification works correctly
4. ✅ Language switching functions properly
5. ✅ Admin dashboard shows analytics
6. ✅ AI chatbot responds to queries
7. ✅ All user roles work as expected

## 🆘 Getting Help

If you encounter issues:

1. **Check the Console**
   - Open browser developer tools
   - Look for error messages in console

2. **Verify Environment Variables**
   - Ensure all required variables are set
   - Check for typos in variable names

3. **Database Issues**
   - Check Supabase logs
   - Verify RLS policies are working

4. **AI Issues**
   - Test Groq API key separately
   - Check API usage limits

## 🎯 Next Steps

After successful setup:

1. **Customize the System**
   - Update branding and colors
   - Modify email templates
   - Add custom categories

2. **Add Integrations**
   - Set up email notifications (SendGrid/Resend)
   - Configure SMS alerts (Twilio)
   - Add external ticketing system integration

3. **Scale the System**
   - Set up monitoring
   - Configure backup strategies
   - Plan for user growth

---

**Congratulations! 🎉 Your multilingual AI-powered ticket management system is now ready to use.**

For additional support, refer to the main README.md or create an issue in the repository.