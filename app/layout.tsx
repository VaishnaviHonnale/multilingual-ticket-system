import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { I18nProvider } from "@/components/i18n-provider"
import { ThemeProvider } from "next-themes"
import { Toaster } from "sonner"
import { Suspense } from "react"
import { NotificationToast } from "@/components/notifications/notification-toast"
import { ChatWidget } from "@/components/chat/chat-widget"
import "./globals.css"

const geistSans = GeistSans
const geistMono = GeistMono

export const metadata: Metadata = {
  title: "Multilingual Ticket System",
  description: "AI-powered multilingual customer support system",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Suspense fallback={null}>
          <I18nProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
              {children}
              <Toaster />
              <NotificationToast />
              <ChatWidget />
            </ThemeProvider>
          </I18nProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
