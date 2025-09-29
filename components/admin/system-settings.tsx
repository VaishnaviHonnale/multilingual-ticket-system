"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useTranslation } from "react-i18next"

export function SystemSettings() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("admin.generalSettings", "General Settings")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="site-name">{t("admin.siteName", "Site Name")}</Label>
            <Input id="site-name" defaultValue="Multilingual Ticket System" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="admin-email">{t("admin.adminEmail", "Admin Email")}</Label>
            <Input id="admin-email" type="email" defaultValue="admin@example.com" />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t("admin.maintenanceMode", "Maintenance Mode")}</Label>
              <p className="text-sm text-muted-foreground">
                {t("admin.maintenanceModeDesc", "Enable maintenance mode to prevent user access")}
              </p>
            </div>
            <Switch />
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
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t("admin.pushNotifications", "Push Notifications")}</Label>
              <p className="text-sm text-muted-foreground">
                {t("admin.pushNotificationsDesc", "Send push notifications for urgent tickets")}
              </p>
            </div>
            <Switch defaultChecked />
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
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t("admin.aiChatbot", "AI Chatbot")}</Label>
              <p className="text-sm text-muted-foreground">
                {t("admin.aiChatbotDesc", "Enable AI chatbot for user assistance")}
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button>{t("admin.saveSettings", "Save Settings")}</Button>
      </div>
    </div>
  )
}
