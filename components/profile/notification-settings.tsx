"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/lib/supabase/client"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import type { Profile } from "@/lib/types"

interface NotificationSettingsProps {
  profile: Profile | null
}

export function NotificationSettings({ profile }: NotificationSettingsProps) {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState({
    email_notifications: profile?.email_notifications ?? true,
    push_notifications: profile?.push_notifications ?? true,
  })

  const supabase = createClient()

  const handleSave = async () => {
    if (!profile) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          email_notifications: settings.email_notifications,
          push_notifications: settings.push_notifications,
        })
        .eq("id", profile.id)

      if (error) throw error

      toast.success(t("notifications.settingsUpdated"))
    } catch (error) {
      console.error("Error updating notification settings:", error)
      toast.error(t("common.error"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="email-notifications" className="text-base">
              {t("notifications.emailNotifications")}
            </Label>
            <p className="text-sm text-muted-foreground">
              Receive email notifications for ticket updates and assignments
            </p>
          </div>
          <Switch
            id="email-notifications"
            checked={settings.email_notifications}
            onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, email_notifications: checked }))}
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="push-notifications" className="text-base">
              {t("notifications.pushNotifications")}
            </Label>
            <p className="text-sm text-muted-foreground">Receive real-time notifications in the application</p>
          </div>
          <Switch
            id="push-notifications"
            checked={settings.push_notifications}
            onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, push_notifications: checked }))}
          />
        </div>
      </div>

      <div className="pt-4">
        <Button onClick={handleSave} disabled={loading}>
          {loading ? t("common.loading") : t("common.save")}
        </Button>
      </div>
    </div>
  )
}
