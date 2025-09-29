import { requireRole } from "@/lib/auth/middleware"
import { UserManagement } from "@/components/admin/user-management"

export default async function AdminUsersPage() {
  await requireRole("admin")

  return (
    <div className="container mx-auto py-6">
      <UserManagement />
    </div>
  )
}
