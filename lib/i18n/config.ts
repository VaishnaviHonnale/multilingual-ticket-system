import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import LanguageDetector from "i18next-browser-languagedetector"

// Translation resources
const resources = {
  en: {
    translation: {
      // Common
      "loading": "Loading...",
      "welcome": "Welcome",
      "optional": "Optional",
      "common.back": "Back",
      
      // Authentication
      "auth.signIn": "Sign In",
      "auth.signUp": "Sign Up",
      "auth.signOut": "Sign Out",
      "auth.email": "Email",
      "auth.password": "Password",
      "auth.confirmPassword": "Confirm Password",
      "auth.fullName": "Full Name",
      "auth.languagePreference": "Language Preference",
      "auth.emailPlaceholder": "Enter your email",
      "auth.passwordPlaceholder": "Enter your password",
      "auth.confirmPasswordPlaceholder": "Confirm your password",
      "auth.fullNamePlaceholder": "Enter your full name",
      "auth.selectLanguage": "Select language",
      "auth.signInDescription": "Enter your credentials to access your account",
      "auth.signUpDescription": "Create your account to get started",
      "auth.createAccount": "Create Account",
      "auth.signingIn": "Signing in...",
      "auth.creatingAccount": "Creating account...",
      "auth.noAccount": "Don't have an account?",
      "auth.haveAccount": "Already have an account?",
      "auth.signedIn": "Signed in successfully",
      "auth.signedOut": "Signed out successfully",
      "auth.registrationSuccess": "Account created successfully! Please check your email to verify your account.",
      "auth.loginError": "Failed to sign in",
      "auth.registrationError": "Failed to create account",
      "auth.signOutError": "Error signing out",
      "auth.adminRequired": "Admin access required",
      "auth.required": "Please sign in to create a ticket",
      "auth.demoAccounts": "Demo Accounts",
      "auth.admin": "Admin",
      "auth.agent": "Agent",
      "auth.user": "User",
      
      // Dashboard
      "dashboard.title": "Dashboard",
      "dashboard.totalTickets": "Total Tickets",
      "dashboard.openTickets": "Open Tickets",
      "dashboard.inProgress": "In Progress",
      "dashboard.resolved": "Resolved",
      "dashboard.myTickets": "My Tickets",
      "dashboard.createTicket": "Create Ticket",
      "dashboard.loadError": "Failed to load dashboard",
      "dashboard.noData": "Unable to load dashboard data",
      
      // Tickets
      "tickets.createNew": "Create New Ticket",
      "tickets.title": "Title",
      "tickets.description": "Description",
      "tickets.language": "Language",
      "tickets.priority": "Priority",
      "tickets.category": "Category",
      "tickets.selectLanguage": "Select language",
      "tickets.selectPriority": "Select priority",
      "tickets.selectCategory": "Select category",
      "tickets.titlePlaceholder": "Brief description of your issue",
      "tickets.descriptionPlaceholder": "Detailed description of your issue",
      "tickets.classify": "AI Classify",
      "tickets.create": "Create Ticket",
      "tickets.creating": "Creating...",
      "tickets.created": "Ticket created successfully",
      "tickets.createError": "Failed to create ticket",
      "tickets.classified": "Ticket classified by AI",
      "tickets.noTickets": "No tickets yet",
      "tickets.noTicketsDescription": "Create your first support ticket to get started",
      "tickets.createFirst": "Create First Ticket",
      "tickets.view": "View",
      "tickets.created": "Created",
      "tickets.assignedTo": "Assigned to",
      
      // Status
      "status.open": "Open",
      "status.in_progress": "In Progress",
      "status.resolved": "Resolved",
      "status.closed": "Closed",
      
      // Priority
      "priority.low": "Low",
      "priority.medium": "Medium",
      "priority.high": "High",
      "priority.urgent": "Urgent",
      "priority.critical": "Critical",
      
      // Category
      "category.technical": "Technical",
      "category.billing": "Billing",
      "category.general": "General",
      "category.feature": "Feature Request",
      "category.bug": "Bug Report",
      "category.support": "Support",
      "category.other": "Other",
      
      // Speech
      "speech.listening": "Listening...",
      "speech.start": "Voice Input",
      "speech.stop": "Stop",
      "speech.transcript": "Transcript",
      "speech.confidence": "Confidence",
      "speech.transcribed": "Speech transcribed successfully",
      "speech.error": "Speech recognition error",
      "speech.noSpeech": "No speech detected",
      "speech.audioCapture": "Microphone not accessible",
      "speech.notAllowed": "Microphone permission denied",
      "speech.network": "Network error",
      "speech.notSupported": "Speech recognition not supported in this browser",
      "speech.titleHint": "Click to add title via voice",
      "speech.descriptionHint": "Click to add description via voice",
      
      // Chat
      "chat.aiAssistant": "AI Assistant",
      "chat.typeMessage": "Type your message...",
      
      // AI
      "ai.confidence": "Confidence",
      "ai.suggestions": "AI Suggestions",
      "ai.reasoning": "Reasoning",
      "ai.sentiment": "Sentiment",
      "ai.urgencyScore": "Urgency Score",
      
      // Admin
      "admin.dashboard": "Admin Dashboard",
      "admin.overview": "Overview",
      "admin.users": "Users",
      "admin.tickets": "Tickets",
      "admin.analytics": "Analytics",
      "admin.settings": "Settings",
      "admin.totalUsers": "Total Users",
      "admin.totalTickets": "Total Tickets",
      "admin.openTickets": "Open Tickets",
      "admin.resolvedTickets": "Resolved Tickets",
      "admin.avgResolutionTime": "Avg Resolution Time",
      "admin.systemHealth": "System Health",
      "admin.ticketsByStatus": "Tickets by Status",
      "admin.usersByRole": "Users by Role",
      "admin.detailedAnalytics": "Detailed Analytics",
      "admin.analyticsDescription": "Comprehensive analytics and reporting tools for system performance.",
      
      // Analytics
      "analytics.totalTickets": "Total Tickets",
      "analytics.openTickets": "Open Tickets",
      "analytics.resolvedTickets": "Resolved Tickets",
      "analytics.totalUsers": "Total Users",
      "analytics.avgResolutionTime": "Avg Resolution Time",
      "analytics.aiAccuracy": "AI Classification Accuracy",
      "analytics.speechUsage": "Speech-to-Text Usage",
      "analytics.ticketsByStatus": "Tickets by Status",
      "analytics.ticketsByPriority": "Tickets by Priority",
      "analytics.ticketsByLanguage": "Tickets by Language",
      "analytics.ticketsByCategory": "Tickets by Category",
      "analytics.dailyTrends": "Daily Ticket Trends",
      "analytics.goodTime": "Good response time",
      "analytics.needsImprovement": "Needs improvement",
      "analytics.excellent": "Excellent",
      "analytics.good": "Good",
      "analytics.ofTickets": "of tickets",
      "analytics.noData": "No analytics data available",
      
      // Profile
      "profile.title": "Profile"
    }
  },
  hi: {
    translation: {
      // Common
      "loading": "लोड हो रहा है...",
      "welcome": "स्वागत है",
      "optional": "वैकल्पिक",
      "common.back": "वापस",
      
      // Authentication
      "auth.signIn": "साइन इन करें",
      "auth.signUp": "साइन अप करें",
      "auth.signOut": "साइन आउट करें",
      "auth.email": "ईमेल",
      "auth.password": "पासवर्ड",
      "auth.confirmPassword": "पासवर्ड की पुष्टि करें",
      "auth.fullName": "पूरा नाम",
      "auth.languagePreference": "भाषा प्राथमिकता",
      "auth.emailPlaceholder": "अपना ईमेल दर्ज करें",
      "auth.passwordPlaceholder": "अपना पासवर्ड दर्ज करें",
      "auth.confirmPasswordPlaceholder": "अपने पासवर्ड की पुष्टि करें",
      "auth.fullNamePlaceholder": "अपना पूरा नाम दर्ज करें",
      "auth.selectLanguage": "भाषा चुनें",
      "auth.signInDescription": "अपने खाते तक पहुंचने के लिए अपनी जानकारी दर्ज करें",
      "auth.signUpDescription": "शुरू करने के लिए अपना खाता बनाएं",
      "auth.createAccount": "खाता बनाएं",
      "auth.signingIn": "साइन इन हो रहा है...",
      "auth.creatingAccount": "खाता बनाया जा रहा है...",
      "auth.noAccount": "कोई खाता नहीं है?",
      "auth.haveAccount": "पहले से खाता है?",
      "auth.signedIn": "सफलतापूर्वक साइन इन हो गए",
      "auth.signedOut": "सफलतापूर्वक साइन आउट हो गए",
      "auth.registrationSuccess": "खाता सफलतापूर्वक बनाया गया! कृपया अपना ईमेल जांचें।",
      "auth.loginError": "साइन इन करने में विफल",
      "auth.registrationError": "खाता बनाने में विफल",
      "auth.signOutError": "साइन आउट करने में त्रुटि",
      "auth.adminRequired": "एडमिन एक्सेस आवश्यक",
      "auth.required": "टिकट बनाने के लिए कृपया साइन इन करें",
      
      // Dashboard
      "dashboard.title": "डैशबोर्ड",
      "dashboard.totalTickets": "कुल टिकट",
      "dashboard.openTickets": "खुले टिकट",
      "dashboard.inProgress": "प्रगति में",
      "dashboard.resolved": "हल किया गया",
      "dashboard.myTickets": "मेरे टिकट",
      "dashboard.createTicket": "टिकट बनाएं",
      
      // Tickets
      "tickets.createNew": "नया टिकट बनाएं",
      "tickets.title": "शीर्षक",
      "tickets.description": "विवरण",
      "tickets.language": "भाषा",
      "tickets.priority": "प्राथमिकता",
      "tickets.category": "श्रेणी",
      "tickets.titlePlaceholder": "अपनी समस्या का संक्षिप्त विवरण",
      "tickets.descriptionPlaceholder": "अपनी समस्या का विस्तृत विवरण",
      "tickets.classify": "AI वर्गीकरण",
      "tickets.create": "टिकट बनाएं",
      "tickets.creating": "बनाया जा रहा है...",
      "tickets.created": "टिकट सफलतापूर्वक बनाया गया",
      "tickets.createError": "टिकट बनाने में विफल",
      "tickets.classified": "AI द्वारा टिकट वर्गीकृत",
      
      // Speech
      "speech.listening": "सुन रहा है...",
      "speech.start": "आवाज़ इनपुट",
      "speech.stop": "रोकें",
      "speech.transcript": "प्रतिलेख",
      "speech.transcribed": "आवाज़ सफलतापूर्वक लिखी गई",
      "speech.titleHint": "आवाज़ से शीर्षक जोड़ने के लिए क्लिक करें",
      "speech.descriptionHint": "आवाज़ से विवरण जोड़ने के लिए क्लिक करें",
      
      // Chat
      "chat.aiAssistant": "AI सहायक",
      "chat.typeMessage": "अपना संदेश टाइप करें...",
      
      // Status
      "status.open": "खुला",
      "status.in_progress": "प्रगति में",
      "status.resolved": "हल किया गया",
      "status.closed": "बंद",
      
      // Priority
      "priority.low": "कम",
      "priority.medium": "मध्यम",
      "priority.high": "उच्च",
      "priority.urgent": "तत्काल",
      "priority.critical": "गंभीर",
      
      // Category
      "category.technical": "तकनीकी",
      "category.billing": "बिलिंग",
      "category.general": "सामान्य",
      "category.feature": "फीचर अनुरोध",
      "category.bug": "बग रिपोर्ट",
      "category.support": "सहायता",
      "category.other": "अन्य"
    }
  }
  // Add more languages as needed
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    debug: false,
    
    interpolation: {
      escapeValue: false
    },
    
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"]
    }
  })

export default i18n