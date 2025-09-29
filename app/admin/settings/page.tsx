import { requireRole } from "@/lib/auth/middleware"
import { AdminSettings } from "@/components/admin/admin-settings"

export default async function AdminSettingsPage() {
  await requireRole("admin")

  return (
    <div className="container mx-auto py-6">
      <AdminSettings />
    </div>
  )
}
