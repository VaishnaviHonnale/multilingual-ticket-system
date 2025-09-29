"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Settings, User, LogOut, Shield } from "lucide-react"
import { useTranslation } from "react-i18next"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { LanguageSwitcher } from "@/components/language-switcher"
import { ThemeToggle } from "@/components/theme-toggle"
import { NotificationDropdown } from "@/components/notifications/notification-dropdown"
import Link from "next/link"
import type { User } from "@supabase/supabase-js"
import type { Profile } from "@/lib/types"

interface DashboardHeaderProps {
  user: User
  profile: Profile | null
}

export function DashboardHeader({ user, profile }: DashboardHeaderProps) {
  const [loading, setLoading] = useState(false)
  const { t } = useTranslation()
  const router = useRouter()

  const handleSignOut = async () => {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const isAdmin = profile?.role === "admin"

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">{t("navigation.dashboard", "Dashboard")}</h1>
        </div>

        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <ThemeToggle />
          <NotificationDropdown />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{profile?.full_name?.[0] || user.email?.[0] || "U"}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{profile?.full_name || "User"}</p>
                  <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-muted-foreground capitalize">{profile?.role || "user"}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <User className="mr-2 h-4 w-4" />
                  {t("navigation.profile", "Profile")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  {t("navigation.settings", "Settings")}
                </Link>
              </DropdownMenuItem>
              {isAdmin && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/admin">
                      <Shield className="mr-2 h-4 w-4" />
                      {t("admin.dashboard", "Admin Dashboard")}
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} disabled={loading}>
                <LogOut className="mr-2 h-4 w-4" />
                {t("auth.logout", "Logout")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
