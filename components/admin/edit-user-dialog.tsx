"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useTranslation } from "react-i18next"
import type { Profile } from "@/lib/types"

interface EditUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: Profile
  onUserUpdated: () => void
}

export function EditUserDialog({ open, onOpenChange, user, onUserUpdated }: EditUserDialogProps) {
  const [formData, setFormData] = useState({
    email: "",
    full_name: "",
    role: "user",
    department: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { t } = useTranslation()

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        full_name: user.full_name || "",
        role: user.role,
        department: user.department || "",
      })
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        onUserUpdated()
      } else {
        setError(data.error || "Failed to update user")
      }
    } catch (error) {
      setError("Failed to update user")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("admin.editUser", "Edit User")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="email">{t("admin.email", "Email")}</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="full_name">{t("admin.fullName", "Full Name")}</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => handleChange("full_name", e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="role">{t("admin.role", "Role")}</Label>
            <Select value={formData.role} onValueChange={(value) => handleChange("role", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">{t("admin.user", "User")}</SelectItem>
                <SelectItem value="agent">{t("admin.agent", "Agent")}</SelectItem>
                <SelectItem value="admin">{t("admin.admin", "Admin")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="department">{t("admin.department", "Department")}</Label>
            <Input
              id="department"
              value={formData.department}
              onChange={(e) => handleChange("department", e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("common.cancel", "Cancel")}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t("common.loading", "Loading...") : t("common.save", "Save")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
