"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { UserRole } from "@/lib/auth/permissions"
import { hasPermission, type Permission } from "@/lib/auth/permissions"

interface RoleGuardProps {
  children: React.ReactNode
  requiredRole?: UserRole | UserRole[]
  requiredPermission?: Permission
  fallback?: React.ReactNode
  redirectTo?: string
}

export function RoleGuard({
  children,
  requiredRole,
  requiredPermission,
  fallback = null,
  redirectTo = "/dashboard",
}: RoleGuardProps) {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAccess()
  }, [])

  const checkAccess = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.getUser()

      if (error || !data?.user) {
        setHasAccess(false)
        setLoading(false)
        return
      }

      const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single()

      if (!profile) {
        setHasAccess(false)
        setLoading(false)
        return
      }

      const userRole = profile.role as UserRole

      // Check role-based access
      if (requiredRole) {
        const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
        if (!allowedRoles.includes(userRole)) {
          setHasAccess(false)
          setLoading(false)
          if (redirectTo) {
            router.push(redirectTo)
          }
          return
        }
      }

      // Check permission-based access
      if (requiredPermission) {
        if (!hasPermission(userRole, requiredPermission)) {
          setHasAccess(false)
          setLoading(false)
          if (redirectTo) {
            router.push(redirectTo)
          }
          return
        }
      }

      setHasAccess(true)
    } catch (error) {
      console.error("Access check error:", error)
      setHasAccess(false)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!hasAccess) {
    return fallback
  }

  return <>{children}</>
}
