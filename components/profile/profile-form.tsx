"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import type { User } from "@supabase/supabase-js"
import type { Profile } from "@/lib/types"

interface ProfileFormProps {
  user: User
  profile: Profile | null
}

export function ProfileForm({ user, profile }: ProfileFormProps) {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    department: profile?.department || "",
    language_preference: profile?.language_preference || "en",
  })

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        email: user.email!,
        ...formData,
      })

      if (error) throw error

      toast.success(t("common.success"))
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error(t("common.error"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={user.email || ""} disabled className="bg-muted" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="full_name">Full Name</Label>
        <Input
          id="full_name"
          value={formData.full_name}
          onChange={(e) => setFormData((prev) => ({ ...prev, full_name: e.target.value }))}
          placeholder="Enter your full name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="department">Department</Label>
        <Input
          id="department"
          value={formData.department}
          onChange={(e) => setFormData((prev) => ({ ...prev, department: e.target.value }))}
          placeholder="Enter your department"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="language_preference">Language Preference</Label>
        <Select
          value={formData.language_preference}
          onValueChange={(value) => setFormData((prev) => ({ ...prev, language_preference: value }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">{t("languages.en")}</SelectItem>
            <SelectItem value="es">{t("languages.es")}</SelectItem>
            <SelectItem value="fr">{t("languages.fr")}</SelectItem>
            <SelectItem value="de">{t("languages.de")}</SelectItem>
            <SelectItem value="it">{t("languages.it")}</SelectItem>
            <SelectItem value="pt">{t("languages.pt")}</SelectItem>
            <SelectItem value="ru">{t("languages.ru")}</SelectItem>
            <SelectItem value="zh">{t("languages.zh")}</SelectItem>
            <SelectItem value="ja">{t("languages.ja")}</SelectItem>
            <SelectItem value="ko">{t("languages.ko")}</SelectItem>
            <SelectItem value="ar">{t("languages.ar")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? t("common.loading") : t("common.save")}
      </Button>
    </form>
  )
}
