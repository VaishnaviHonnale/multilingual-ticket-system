"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserManagement } from "@/components/admin/user-management"
import { SystemSettings } from "@/components/admin/system-settings"
import { TicketManagement } from "@/components/admin/ticket-management"
import { AnalyticsOverview } from "@/components/admin/analytics-overview"
import { useTranslation } from "react-i18next"
import { createClient } from "@/lib/supabase-client"
import { Button } from "@/components/ui/button"
import { LogOut, Settings, Users, TicketIcon, BarChart3, Home } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function AdminDashboard() {
  const { t } = useTranslation()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error || !user) {
          router.push("/auth/login")
          return
        }

        setUser(user)

        // Get user profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        if (profileData) {
          setProfile(profileData)
          
          // Check if user is admin
          if (profileData.role !== "admin") {
            toast.error(t("auth.adminRequired", "Admin access required"))
            router.push("/dashboard")
            return
          }
        }
      } catch (error) {
        console.error("Error fetching user:", error)
        router.push("/auth/login")
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [supabase, router, t])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/")
      toast.success(t("auth.signedOut", "Signed out successfully"))
    } catch (error) {
      console.error("Error signing out:", error)
      toast.error(t("auth.signOutError", "Error signing out"))
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>{t("loading", "Loading...")}</p>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold">{t("admin.dashboard", "Admin Dashboard")}</h1>
            <div className="text-sm text-muted-foreground">
              {t("welcome", "Welcome")}, {profile.full_name || user.email}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push("/dashboard")}>
              <Home className="h-4 w-4 mr-2" />
              {t("dashboard.main", "Main Dashboard")}
            </Button>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              {t("auth.signOut", "Sign Out")}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                {t("admin.overview", "Overview")}
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                {t("admin.users", "Users")}
              </TabsTrigger>
              <TabsTrigger value="tickets" className="flex items-center gap-2">
                <TicketIcon className="h-4 w-4" />
                {t("admin.tickets", "Tickets")}
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                {t("admin.analytics", "Analytics")}
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                {t("admin.settings", "Settings")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <AnalyticsOverview />
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <UserManagement />
            </TabsContent>

            <TabsContent value="tickets" className="space-y-6">
              <TicketManagement />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <AnalyticsOverview />
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <SystemSettings />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
