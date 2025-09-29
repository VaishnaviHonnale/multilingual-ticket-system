import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.getUser()

    if (error || !data?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single()

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { full_name, role, department, email } = await request.json()
    const userId = params.id

    // Update profile
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name,
        role,
        department,
        email,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 })
    }

    // Update auth user email if changed
    const { error: authError } = await supabase.auth.admin.updateUserById(userId, { email })

    if (authError) {
      console.error("Auth update error:", authError)
      // Don't fail the request if auth update fails, profile is more important
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.getUser()

    if (error || !data?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single()

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const userId = params.id

    // Don't allow deleting self
    if (userId === data.user.id) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 })
    }

    // Delete auth user (this will cascade to profile due to foreign key)
    const { error: authError } = await supabase.auth.admin.deleteUser(userId)

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
