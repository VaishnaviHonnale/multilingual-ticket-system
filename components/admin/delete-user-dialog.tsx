"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useTranslation } from "react-i18next"
import type { Profile } from "@/lib/types"

interface DeleteUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: Profile
  onUserDeleted: () => void
}

export function DeleteUserDialog({ open, onOpenChange, user, onUserDeleted }: DeleteUserDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { t } = useTranslation()

  const handleDelete = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok) {
        onUserDeleted()
      } else {
        setError(data.error || "Failed to delete user")
      }
    } catch (error) {
      setError("Failed to delete user")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("admin.deleteUser", "Delete User")}</DialogTitle>
          <DialogDescription>
            {t("admin.deleteUserConfirm", "Are you sure you want to delete this user? This action cannot be undone.")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="font-medium">{user.full_name || user.email}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <p className="text-sm text-muted-foreground capitalize">{user.role}</p>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("common.cancel", "Cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              {loading ? t("common.loading", "Loading...") : t("common.delete", "Delete")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
