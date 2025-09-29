# Multilingual Ticket Management System

A comprehensive, AI-powered ticket management system with multilingual support, speech-to-text capabilities, and intelligent classification.

## 🌟 Features

### Core Functionality
- **Ticket Management**: Full CRUD operations for tickets with status tracking
- **User Authentication**: JWT/OAuth2-based secure authentication
- **Role-Based Access Control**: Support for admin, agent, and user roles
- **Real-time Updates**: Instant notifications and status updates
- **Dashboard Analytics**: Comprehensive reporting and metrics

### AI & ML Features
- **Intelligent Classification**: Automatic ticket categorization using Groq AI
- **Priority Detection**: AI-based urgency assessment
- **Multilingual NLP**: Support for Hindi, Tamil, Telugu, Kannada, and English
- **Smart Response Suggestions**: AI-generated response templates

### Communication Features
- **Speech-to-Text**: Voice input for ticket creation (browser-based)
- **Email Notifications**: SendGrid/Resend integration
- **SMS Alerts**: Twilio integration for urgent notifications
- **In-App Notifications**: Real-time notification center

### Multilingual Support
- **Languages Supported**:
  - English (en)
  - Hindi (hi)
  - Tamil (ta)
  - Telugu (te)
  - Kannada (kn)
- **Dynamic Language Switching**: User preference-based UI language
- **Localized Notifications**: Email and SMS in user's preferred language

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- Supabase account
- API Keys (optional but recommended):
  - Groq AI API key (for AI classification)
  - SendGrid/Resend API key (for emails)
  - Twilio credentials (for SMS)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/multilingual-ticket-system.git
cd multilingual-ticket-system
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Set up environment variables**
Create a `.env.local` file in the root directory:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# AI Configuration (Groq)
GROQ_API_KEY=your_groq_api_key

# Email Service (SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=support@yourdomain.com
SENDGRID_FROM_NAME=Ticket Support System

# SMS Service (Twilio)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Feature Flags
ENABLE_AI_CLASSIFICATION=true
ENABLE_SPEECH_TO_TEXT=true
ENABLE_SMS_NOTIFICATIONS=false
ENABLE_EMAIL_NOTIFICATIONS=false
```

4. **Set up the database**
Run the SQL migrations in Supabase:
```bash
# Run these SQL files in order in your Supabase SQL editor:
scripts/001_create_database_schema.sql
scripts/002_create_profile_trigger.sql
scripts/007_add_notifications_table.sql
scripts/003_seed_data.sql (optional)
```

5. **Configure Supabase Auth**
In Supabase Dashboard:
- Go to Authentication > URL Configuration
- Add `http://localhost:3000` to Redirect URLs
- Configure email templates if needed

6. **Start the development server**
```bash
npm run dev
# or
yarn dev
```

Visit `http://localhost:3000` to see the application.

## 📱 Usage Guide

### Creating Your First Account
1. Navigate to `/auth/register`
2. Create an account (first account will be admin)
3. Verify your email if email verification is enabled

### User Roles
- **Admin**: Full system access, user management, analytics
- **Agent**: Ticket management, assignment, responses
- **User**: Create tickets, view own tickets, add comments

### Creating a Ticket
1. Login to the system
2. Click "New Ticket" from dashboard
3. Fill in the details or use voice input
4. AI will automatically classify and prioritize
5. Submit to create the ticket

### Voice Input
1. Click the microphone icon in the ticket form
2. Speak your ticket description
3. System supports multiple languages
4. Text will be automatically transcribed

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **AI/ML**: Groq AI (Llama 3 70B model)
- **Internationalization**: i18next, react-i18next
- **Notifications**: SendGrid/Resend (email), Twilio (SMS)

### Project Structure
```
multilingual-ticket-system/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard views
│   └── tickets/           # Ticket management pages
├── components/            # React components
│   ├── admin/            # Admin-specific components
│   ├── tickets/          # Ticket-related components
│   └── ui/               # UI components (shadcn)
├── lib/                   # Utilities and services
│   ├── ai/               # AI classification service
│   ├── notifications/    # Email/SMS services
│   └── supabase/         # Supabase client
├── public/               # Static assets
│   └── locales/         # Translation files
└── scripts/             # Database migrations
```

## 🔧 Configuration

### AI Classification
The system uses Groq AI for intelligent ticket classification:
- Automatic category detection (technical, billing, support, etc.)
- Priority assessment (low, medium, high, urgent, critical)
- Sentiment analysis
- Multilingual support

### Notification Settings
Configure notifications in `.env.local`:
- `ENABLE_EMAIL_NOTIFICATIONS`: Enable/disable email notifications
- `ENABLE_SMS_NOTIFICATIONS`: Enable/disable SMS notifications

### Language Support
Add new languages by:
1. Creating translation files in `public/locales/{lang}/`
2. Adding language option to language switcher
3. Updating AI prompts for the new language

## 🚢 Deployment

### Vercel Deployment (Recommended)
1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Docker Deployment
```bash
docker build -t ticket-system .
docker run -p 3000:3000 --env-file .env.local ticket-system
```

### Manual Deployment
```bash
npm run build
npm run start
```

## 🔒 Security Features
- JWT-based authentication
- Row-level security in Supabase
- Input validation and sanitization
- CSRF protection
- Rate limiting on API routes
- Secure environment variable handling

## 📊 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Ticket Endpoints
- `GET /api/tickets` - List tickets
- `POST /api/tickets` - Create ticket
- `GET /api/tickets/[id]` - Get ticket details
- `PUT /api/tickets/[id]` - Update ticket
- `DELETE /api/tickets/[id]` - Delete ticket

### AI Classification
- `POST /api/classify` - Classify ticket content

### Chat Support
- `POST /api/chat` - AI-powered chat support

## 🧪 Testing
```bash
# Run unit tests
npm run test

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e
```

## 🤝 Contributing
Contributions are welcome! Please read our contributing guidelines and submit PRs.

## 📝 License
MIT License - see LICENSE file for details

## 🆘 Support
For issues and questions:
- Create an issue on GitHub
- Contact support at support@yourdomain.com

## 🙏 Acknowledgments
- Groq AI for LLM capabilities
- Supabase for backend infrastructure
- Vercel for hosting platform
- shadcn/ui for component library

---
Built with ❤️ using Next.js and AI