import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import type { UserRole } from "./permissions"

export async function requireAuth() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect("/auth/login")
  }

  return data.user
}

export async function requireRole(requiredRole: UserRole | UserRole[]) {
  const user = await requireAuth()
  const supabase = await createClient()

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (!profile) {
    redirect("/auth/login")
  }

  const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]

  if (!allowedRoles.includes(profile.role as UserRole)) {
    redirect("/dashboard")
  }

  return { user, profile }
}

export async function getUserWithProfile() {
  const user = await requireAuth()
  const supabase = await createClient()

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile) {
    redirect("/auth/login")
  }

  return { user, profile }
}
