"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Loader2, LogIn, ArrowLeft } from "lucide-react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase-client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { LanguageSwitcher } from "@/components/language-switcher"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const { t } = useTranslation()
  const router = useRouter()
  const supabase = createClient()

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      })

      if (error) {
        toast.error(error.message)
        return
      }

      if (authData.user) {
        // Get user profile to check role
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", authData.user.id)
          .single()

        toast.success(t("auth.signedIn", "Signed in successfully"))
        
        // Redirect based on role
        if (profile?.role === "admin") {
          router.push("/admin")
        } else {
          router.push("/dashboard")
        }
      }
    } catch (error) {
      console.error("Login error:", error)
      toast.error(t("auth.loginError", "Failed to sign in"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-background to-muted">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("common.back", "Back")}
              </Link>
            </Button>
            <LanguageSwitcher />
          </div>
          <h1 className="text-3xl font-bold">{t("auth.signIn", "Sign In")}</h1>
          <p className="text-muted-foreground">
            {t("auth.signInDescription", "Enter your credentials to access your account")}
          </p>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LogIn className="h-5 w-5" />
              {t("auth.signIn", "Sign In")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("auth.email", "Email")}</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder={t("auth.emailPlaceholder", "Enter your email")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("auth.password", "Password")}</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder={t("auth.passwordPlaceholder", "Enter your password")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("auth.signingIn", "Signing in...")}
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      {t("auth.signIn", "Sign In")}
                    </>
                  )}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {t("auth.noAccount", "Don't have an account?")}{" "}
                <Link href="/auth/register" className="text-primary hover:underline">
                  {t("auth.signUp", "Sign up")}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Demo Accounts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t("auth.demoAccounts", "Demo Accounts")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-xs space-y-1">
              <p><strong>{t("auth.admin", "Admin")}:</strong> admin@example.com / password123</p>
              <p><strong>{t("auth.agent", "Agent")}:</strong> agent@example.com / password123</p>
              <p><strong>{t("auth.user", "User")}:</strong> user@example.com / password123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}