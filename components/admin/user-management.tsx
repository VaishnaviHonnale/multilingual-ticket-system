"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, UserPlus, Edit, Trash2 } from "lucide-react"
import { useTranslation } from "react-i18next"
import { CreateUserDialog } from "./create-user-dialog"
import { EditUserDialog } from "./edit-user-dialog"
import { DeleteUserDialog } from "./delete-user-dialog"
import type { Profile } from "@/lib/types"

export function UserManagement() {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null)
  const { t } = useTranslation()

  useEffect(() => {
    fetchUsers()
  }, [searchTerm, roleFilter])

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)
      if (roleFilter !== "all") params.append("role", roleFilter)

      const response = await fetch(`/api/admin/users?${params}`)
      const data = await response.json()

      if (response.ok) {
        setUsers(data.users || [])
      } else {
        console.error("Error fetching users:", data.error)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUserCreated = () => {
    setCreateDialogOpen(false)
    fetchUsers()
  }

  const handleUserUpdated = () => {
    setEditDialogOpen(false)
    setSelectedUser(null)
    fetchUsers()
  }

  const handleUserDeleted = () => {
    setDeleteDialogOpen(false)
    setSelectedUser(null)
    fetchUsers()
  }

  const openEditDialog = (user: Profile) => {
    setSelectedUser(user)
    setEditDialogOpen(true)
  }

  const openDeleteDialog = (user: Profile) => {
    setSelectedUser(user)
    setDeleteDialogOpen(true)
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "agent":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "user":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("admin.userManagement", "User Management")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {t("admin.userManagement", "User Management")}
            <Button onClick={() => setCreateDialogOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              {t("admin.addUser", "Add User")}
            </Button>
          </CardTitle>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={t("admin.searchUsers", "Search users...")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder={t("admin.role", "Role")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("admin.allRoles", "All Roles")}</SelectItem>
                <SelectItem value="admin">{t("admin.admin", "Admin")}</SelectItem>
                <SelectItem value="agent">{t("admin.agent", "Agent")}</SelectItem>
                <SelectItem value="user">{t("admin.user", "User")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">{t("admin.noUsers", "No users found")}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("admin.name", "Name")}</TableHead>
                  <TableHead>{t("admin.email", "Email")}</TableHead>
                  <TableHead>{t("admin.role", "Role")}</TableHead>
                  <TableHead>{t("admin.department", "Department")}</TableHead>
                  <TableHead>{t("admin.joined", "Joined")}</TableHead>
                  <TableHead>{t("admin.actions", "Actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.full_name || t("admin.unnamed", "Unnamed")}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
                    </TableCell>
                    <TableCell>{user.department || "-"}</TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(user)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(user)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CreateUserDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} onUserCreated={handleUserCreated} />

      {selectedUser && (
        <EditUserDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          user={selectedUser}
          onUserUpdated={handleUserUpdated}
        />
      )}

      {selectedUser && (
        <DeleteUserDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          user={selectedUser}
          onUserDeleted={handleUserDeleted}
        />
      )}
    </>
  )
}
