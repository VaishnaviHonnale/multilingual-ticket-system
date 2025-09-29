"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase-client"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"

export function NotificationToast() {
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()
  const { t } = useTranslation()

  useEffect(() => {
    // Get current user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  useEffect(() => {
    if (!user) return

    // Subscribe to notifications for the current user
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const notification = payload.new
          
          // Show toast notification
          switch (notification.type) {
            case 'success':
              toast.success(notification.title, {
                description: notification.message
              })
              break
            case 'error':
              toast.error(notification.title, {
                description: notification.message
              })
              break
            case 'warning':
              toast.warning(notification.title, {
                description: notification.message
              })
              break
            default:
              toast.info(notification.title, {
                description: notification.message
              })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, supabase, t])

  return null // This component doesn't render anything visible
}