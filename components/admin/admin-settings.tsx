"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

interface Settings {
  siteName: string
  adminEmail: string
  maintenanceMode: boolean
  emailNotifications: boolean
  pushNotifications: boolean
  aiClassification: boolean
  aiChatbot: boolean
}

export function AdminSettings() {
  const [settings, setSettings] = useState<Settings>({
    siteName: "Multilingual Ticket System",
    adminEmail: "",
    maintenanceMode: false,
    emailNotifications: true,
    pushNotifications: true,
    aiClassification: true,
    aiChatbot: true,
  })
  const [loading, setLoading] = useState(false)
  const { t } = useTranslation()

  const handleSave = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success(t("admin.settingsUpdated", "Settings updated successfully"))
    } catch (error) {
      toast.error("Failed to update settings")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof Settings, value: string | boolean) => {
    setSettings((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t("admin.systemSettings", "System Settings")}</h1>
        <p className="text-muted-foreground">
          {t("admin.systemSettingsDesc", "Configure system-wide settings and preferences.")}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("admin.generalSettings", "General Settings")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="siteName">{t("admin.siteName", "Site Name")}</Label>
            <Input id="siteName" value={settings.siteName} onChange={(e) => handleChange("siteName", e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="adminEmail">{t("admin.adminEmail", "Admin Email")}</Label>
            <Input
              id="adminEmail"
              type="email"
              value={settings.adminEmail}
              onChange={(e) => handleChange("adminEmail", e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t("admin.maintenanceMode", "Maintenance Mode")}</Label>
              <p className="text-sm text-muted-foreground">
                {t("admin.maintenanceModeDesc", "Enable maintenance mode to prevent user access")}
              </p>
            </div>
            <Switch
              checked={settings.maintenanceMode}
              onCheckedChange={(checked) => handleChange("maintenanceMode", checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("admin.notificationSettings", "Notification Settings")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t("admin.emailNotifications", "Email Notifications")}</Label>
              <p className="text-sm text-muted-foreground">
                {t("admin.emailNotificationsDesc", "Send email notifications for new tickets")}
              </p>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => handleChange("emailNotifications", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t("admin.pushNotifications", "Push Notifications")}</Label>
              <p className="text-sm text-muted-foreground">
                {t("admin.pushNotificationsDesc", "Send push notifications for urgent tickets")}
              </p>
            </div>
            <Switch
              checked={settings.pushNotifications}
              onCheckedChange={(checked) => handleChange("pushNotifications", checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("admin.aiSettings", "AI Settings")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t("admin.aiClassification", "AI Classification")}</Label>
              <p className="text-sm text-muted-foreground">
                {t("admin.aiClassificationDesc", "Automatically classify tickets using AI")}
              </p>
            </div>
            <Switch
              checked={settings.aiClassification}
              onCheckedChange={(checked) => handleChange("aiClassification", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t("admin.aiChatbot", "AI Chatbot")}</Label>
              <p className="text-sm text-muted-foreground">
                {t("admin.aiChatbotDesc", "Enable AI chatbot for user assistance")}
              </p>
            </div>
            <Switch checked={settings.aiChatbot} onCheckedChange={(checked) => handleChange("aiChatbot", checked)} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading}>
          {loading ? t("common.loading", "Loading...") : t("admin.saveSettings", "Save Settings")}
        </Button>
      </div>
    </div>
  )
}
